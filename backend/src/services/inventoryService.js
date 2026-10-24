'use strict';

/**
 * Custody / inventory operations: receive, transfer, dispense.
 *
 * Each operation runs inside a single Postgres transaction and mirrors the
 * event to the PharmaChain contract (best effort). Postgres is the system of
 * record; the chain is the tamper-evident trail.
 */

const db = require('../config/db');
const { ApiError } = require('../utils/response');
const verificationService = require('./verificationService');
const blockchainService = require('./blockchainService');
const auditService = require('./auditService');

const SERIAL_COLUMNS = `
  sn.id, sn.serial_number, sn.status, sn.current_owner, sn.batch_id,
  b.batch_number, b.expiry_date, b.manufacturing_date, b.status AS batch_status,
  m.id AS medicine_id, m.name AS medicine_name, m.medicine_code, m.manufacturer_name,
  m.composition, m.dosage,
  o.name AS owner_name, o.type AS owner_type`;

const SERIAL_JOINS = `
  FROM serial_numbers sn
  JOIN batches b ON sn.batch_id = b.id
  JOIN medicines m ON b.medicine_id = m.id
  LEFT JOIN organizations o ON sn.current_owner = o.id`;

const SERIAL_SELECT = `SELECT ${SERIAL_COLUMNS} ${SERIAL_JOINS}`;

class InventoryService {
  /** Per-pack rows for an organisation (or everything for admins). */
  async listInventory({ organizationId, status, search, unowned = false, limit = 500 } = {}) {
    let query = `SELECT ${SERIAL_COLUMNS},
         COALESCE(r_batch.status, r_med.status, 'UNKNOWN') AS regulatory_status
      ${SERIAL_JOINS}
      LEFT JOIN regulatory_status r_batch ON r_batch.batch_id = b.id
      LEFT JOIN regulatory_status r_med ON r_med.medicine_id = m.id AND r_med.batch_id IS NULL
      WHERE 1=1`;
    const params = [];
    let idx = 1;

    if (unowned) {
      query += ` AND sn.current_owner IS NULL`;
    } else if (organizationId) {
      query += ` AND sn.current_owner = $${idx++}`;
      params.push(organizationId);
    }
    if (status) {
      query += ` AND sn.status = $${idx++}`;
      params.push(status);
    }
    if (search) {
      query += ` AND (sn.serial_number ILIKE $${idx} OR b.batch_number ILIKE $${idx} OR m.name ILIKE $${idx})`;
      params.push(`%${search}%`);
      idx++;
    }

    query += ` ORDER BY sn.id DESC LIMIT $${idx}`;
    params.push(limit);

    const result = await db.query(query, params);
    return result.rows.map((r) => ({
      id: r.id,
      serial_number: r.serial_number,
      status: r.status,
      current_owner: r.current_owner,
      owner_name: r.owner_name,
      batch_id: r.batch_id,
      batch_number: r.batch_number,
      expiry_date: r.expiry_date,
      batch_status: r.batch_status,
      medicine_id: r.medicine_id,
      medicine_name: r.medicine_name,
      medicine_code: r.medicine_code,
      regulatory_status: r.regulatory_status,
    }));
  }

  /** Quantity rows from the inventory table (stock per org/batch). */
  async getStock({ organizationId } = {}) {
    let query = `
      SELECT i.*, b.batch_number, b.expiry_date, b.status AS batch_status,
             m.name AS medicine_name, m.medicine_code, o.name AS organization_name
      FROM inventory i
      JOIN batches b ON i.batch_id = b.id
      JOIN medicines m ON b.medicine_id = m.id
      JOIN organizations o ON i.organization_id = o.id
      WHERE i.quantity > 0`;
    const params = [];
    if (organizationId) {
      params.push(organizationId);
      query += ` AND i.organization_id = $1`;
    }
    query += ' ORDER BY m.name, b.batch_number';
    const result = await db.query(query, params);
    return result.rows;
  }

  async #loadSerial(serialNumber, client = db) {
    const result = await client.query(`${SERIAL_SELECT} WHERE LOWER(sn.serial_number) = LOWER($1)`, [serialNumber]);
    if (result.rows.length === 0) throw new ApiError(404, 'SERIAL_NOT_FOUND', 'Serial number not found');
    return result.rows[0];
  }

  async #upsertStock(client, organizationId, batchId, delta) {
    if (!organizationId || delta === 0) return;
    await client.query(
      `INSERT INTO inventory (organization_id, batch_id, quantity, status)
       VALUES ($1, $2, GREATEST($3, 0), 'ACTIVE')
       ON CONFLICT (organization_id, batch_id)
       DO UPDATE SET quantity = GREATEST(inventory.quantity + $3, 0), updated_at = NOW()`,
      [organizationId, batchId, delta]
    );
  }

  async #recordTransaction(client, { batchId, serialId, fromOrg, toOrg, type, chain }) {
    const result = await client.query(
      `INSERT INTO transactions
         (batch_id, serial_number_id, from_organization_id, to_organization_id, quantity,
          transaction_type, blockchain_transaction_hash, blockchain_status, blockchain_tx_hash)
       VALUES ($1, $2, $3, $4, 1, $5, $6, $7, $8)
       RETURNING *`,
      [
        batchId,
        serialId,
        fromOrg || null,
        toOrg || null,
        type,
        chain && chain.txHash ? chain.txHash : null,
        chain ? chain.status : 'SKIPPED',
        chain && chain.txHash ? chain.txHash : null,
      ]
    );
    return result.rows[0];
  }

  async #logAudit(actor, action, entityId, details, meta) {
    if (!actor) return;
    auditService.log({
      userId: actor.id,
      organizationId: actor.organizationId,
      action,
      entityType: 'inventory',
      entityId,
      details,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });
  }

  /** Pharmacy/distributor takes custody of a pack that is in transit. */
  async receive({ serialNumber, organizationId, actor }, meta = {}) {
    console.log(`[RECEIVE] Starting DB transaction for ${serialNumber} org: ${organizationId}`);

    if (!organizationId) throw new ApiError(400, 'NO_ORGANIZATION', 'User is not linked to an organization');
    const verification = await verificationService.assertMovable(serialNumber, organizationId, 'RECEIVE');

    const chain = await blockchainService.recordEvent(
      serialNumber,
      'RECEIVE',
      `org#${organizationId}`
    );

    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');

      const serial = await this.#loadSerial(serialNumber, client);
      const previousOwner = serial.current_owner;

      const updated = await client.query(
        `UPDATE serial_numbers SET status = 'IN_STOCK', current_owner = $1, updated_at = NOW()
         WHERE id = $2 RETURNING *`,
        [organizationId, serial.id]
      );

      await this.#upsertStock(client, organizationId, serial.batch_id, 1);

      const transaction = await this.#recordTransaction(client, {
        batchId: serial.batch_id,
        serialId: serial.id,
        fromOrg: previousOwner,
        toOrg: organizationId,
        type: 'RECEIVE',
        chain,
      });

      await client.query('COMMIT');

      await this.#logAudit(actor, 'RECEIVE', serial.id, { serialNumber, organizationId }, meta);

      return {
        serial: updated.rows[0],
        verification,
        transaction,
        blockchain: { status: chain.status, txHash: chain.txHash || null, reason: chain.reason || null },
      };
    } catch (err) {
      try { await client.query('ROLLBACK'); } catch (_) { /* ignore */ }
      if (err.code === '23505') {
        throw new ApiError(409, 'ALREADY_RECEIVED', 'This pack has already been received');
      }
      throw err;
    } finally {
      client.release();
    }
  }

  /** Distributor dispatches a pack it holds to a pharmacy. */
  async transfer({ serialNumber, fromOrganizationId, toOrganizationId, actor }, meta = {}) {
    if (!toOrganizationId) throw new ApiError(400, 'MISSING_DESTINATION', 'Destination organization is required');
    if (Number(fromOrganizationId) === Number(toOrganizationId)) {
      throw new ApiError(400, 'SAME_ORGANIZATION', 'Source and destination organizations must differ');
    }

    await verificationService.assertMovable(serialNumber, fromOrganizationId, 'TRANSFER');

    const destination = await db.query(`SELECT id, name, type, status FROM organizations WHERE id = $1`, [toOrganizationId]);
    if (destination.rows.length === 0) throw new ApiError(404, 'ORG_NOT_FOUND', 'Destination organization not found');
    if (destination.rows[0].status !== 'ACTIVE') throw new ApiError(400, 'ORG_INACTIVE', 'Destination organization is not active');

    const chain = await blockchainService.recordEvent(
      serialNumber,
      'TRANSFER',
      `org#${fromOrganizationId} -> org#${toOrganizationId}`
    );

    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');

      const serial = await this.#loadSerial(serialNumber, client);
      if (serial.current_owner !== null && Number(serial.current_owner) !== Number(fromOrganizationId)) {
        throw new ApiError(409, 'CUSTODY_CHANGED', 'Pack custody changed, please refresh and retry');
      }

      await client.query(
        `UPDATE serial_numbers SET status = 'IN_TRANSIT', current_owner = NULL, updated_at = NOW() WHERE id = $1`,
        [serial.id]
      );
      await this.#upsertStock(client, fromOrganizationId, serial.batch_id, -1);

      const transaction = await this.#recordTransaction(client, {
        batchId: serial.batch_id,
        serialId: serial.id,
        fromOrg: fromOrganizationId,
        toOrg: toOrganizationId,
        type: 'TRANSFER',
        chain,
      });

      await client.query('COMMIT');

      await this.#logAudit(actor, 'TRANSFER', serial.id, { serialNumber, fromOrganizationId, toOrganizationId }, meta);

      return {
        serialNumber: serial.serial_number,
        fromOrganizationId: Number(fromOrganizationId),
        toOrganizationId: Number(toOrganizationId),
        transaction,
        blockchain: { status: chain.status, txHash: chain.txHash || null, reason: chain.reason || null },
      };
    } catch (err) {
      try { await client.query('ROLLBACK'); } catch (_) { /* ignore */ }
      throw err;
    } finally {
      client.release();
    }
  }

  /** Pharmacy hands the pack to a patient. */
  async dispense({ serialNumber, pharmacyId, patientReference = null, prescriptionItemId = null, actor }, meta = {}) {
    console.log(`[DISPENSE] Starting DB transaction for ${serialNumber} org: ${pharmacyId}`);
    if (!pharmacyId) throw new ApiError(400, 'NO_ORGANIZATION', 'User is not linked to an organization');

    await verificationService.assertMovable(serialNumber, pharmacyId, 'DISPENSE');

    const chain = await blockchainService.recordEvent(serialNumber, 'DISPENSE', `org#${pharmacyId}`);

    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');

      const serial = await this.#loadSerial(serialNumber, client);

      await client.query(
        `UPDATE serial_numbers SET status = 'DISPENSED', updated_at = NOW() WHERE id = $1`,
        [serial.id]
      );
      await this.#upsertStock(client, pharmacyId, serial.batch_id, -1);

      const transaction = await this.#recordTransaction(client, {
        batchId: serial.batch_id,
        serialId: serial.id,
        fromOrg: pharmacyId,
        toOrg: null,
        type: 'DISPENSE',
        chain,
      });

      await client.query(
        `INSERT INTO dispensing (serial_number_id, batch_id, pharmacy_id, patient_reference, dispensed_by_user)
         VALUES ($1, $2, $3, $4, $5)`,
        [serial.id, serial.batch_id, pharmacyId, patientReference, actor ? actor.id : null]
      );

      await client.query('COMMIT');

      await this.#logAudit(actor, 'DISPENSE', serial.id, { serialNumber, pharmacyId, patientReference }, meta);

      return {
        serialNumber: serial.serial_number,
        medicine: serial.medicine_name,
        batchNumber: serial.batch_number,
        dispensedAt: new Date().toISOString(),
        transaction,
        blockchain: { status: chain.status, txHash: chain.txHash || null, reason: chain.reason || null },
      };
    } catch (err) {
      try { await client.query('ROLLBACK'); } catch (_) { /* ignore */ }
      if (err.code === '23505') {
        throw new ApiError(409, 'ALREADY_DISPENSED', 'This pack has already been dispensed');
      }
      throw err;
    } finally {
      client.release();
    }
  }
}

module.exports = new InventoryService();
