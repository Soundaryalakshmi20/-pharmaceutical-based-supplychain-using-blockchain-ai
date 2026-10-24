'use strict';

const db = require('../config/db');
const { ApiError } = require('../utils/response');
const blockchainService = require('./blockchainService');
const auditService = require('./auditService');

class BatchService {
  async listBatches({ search, status, medicineId, page = 1, limit = 100 } = {}) {
    let query = `
      SELECT b.*,
             m.name AS medicine_name, m.medicine_code, m.manufacturer_name,
             COALESCE(r_batch.status, r_med.status, 'UNKNOWN') AS regulatory_status,
             (SELECT COUNT(*) FROM serial_numbers sn WHERE sn.batch_id = b.id) AS serial_count,
             (SELECT COUNT(*) FROM serial_numbers sn WHERE sn.batch_id = b.id AND sn.status = 'IN_STOCK') AS in_stock,
             (SELECT COUNT(*) FROM serial_numbers sn WHERE sn.batch_id = b.id AND sn.status = 'IN_TRANSIT') AS in_transit,
             (SELECT COUNT(*) FROM serial_numbers sn WHERE sn.batch_id = b.id AND sn.status = 'DISPENSED') AS dispensed,
             CASE
               WHEN b.expiry_date < NOW() THEN 'EXPIRED'
               WHEN b.expiry_date < NOW() + INTERVAL '90 days' THEN 'EXPIRING_SOON'
               ELSE 'VALID'
             END AS expiry_status
      FROM batches b
      JOIN medicines m ON b.medicine_id = m.id
      LEFT JOIN regulatory_status r_batch ON r_batch.batch_id = b.id
      LEFT JOIN regulatory_status r_med ON r_med.medicine_id = b.medicine_id AND r_med.batch_id IS NULL
      WHERE 1=1`;
    const params = [];
    let idx = 1;

    if (search) {
      query += ` AND (b.batch_number ILIKE $${idx} OR m.name ILIKE $${idx} OR m.medicine_code ILIKE $${idx})`;
      params.push(`%${search}%`);
      idx++;
    }
    if (status) { query += ` AND b.status = $${idx++}`; params.push(status); }
    if (medicineId) { query += ` AND b.medicine_id = $${idx++}`; params.push(medicineId); }

    query += ` ORDER BY b.created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`;
    params.push(limit, (page - 1) * limit);

    const result = await db.query(query, params);
    return result.rows;
  }

  async getBatchById(id) {
    const result = await db.query(
      `SELECT b.*, m.name AS medicine_name, m.medicine_code
       FROM batches b JOIN medicines m ON b.medicine_id = m.id
       WHERE b.id = $1`,
      [id]
    );
    if (result.rows.length === 0) throw new ApiError(404, 'BATCH_NOT_FOUND', 'Batch not found');

    const batch = result.rows[0];
    const serials = await db.query(
      `SELECT sn.id, sn.serial_number, sn.status, sn.current_owner, o.name AS owner_name
       FROM serial_numbers sn
       LEFT JOIN organizations o ON sn.current_owner = o.id
       WHERE sn.batch_id = $1
       ORDER BY sn.serial_number
       LIMIT 500`,
      [id]
    );
    batch.serials = serials.rows;
    batch.serialCount = serials.rows.length;
    return batch;
  }

  /** Next free SN2xxxxx serial number — keeps the numbering the seeded data uses (SN200001+). */
  async #nextSerialStart() {
    const result = await db.query(
      `SELECT MAX(SUBSTRING(serial_number FROM 3)::int) AS maxn
       FROM serial_numbers
       WHERE serial_number ~ '^SN2[0-9]{5}$'`
    );
    const maxn = result.rows[0].maxn ? parseInt(result.rows[0].maxn, 10) : 1;
    return maxn + 1;
  }

  async createBatch({ medicineId, batchNumber, manufacturingDate, expiryDate, quantity, actor }, meta = {}) {
    if (!medicineId || !batchNumber || !manufacturingDate || !expiryDate || !quantity) {
      throw new ApiError(400, 'MISSING_FIELD', 'medicineId, batchNumber, manufacturingDate, expiryDate and quantity are required');
    }
    const qty = parseInt(quantity, 10);
    if (Number.isNaN(qty) || qty <= 0) throw new ApiError(400, 'INVALID_QUANTITY', 'Quantity must be a positive number');
    if (new Date(expiryDate) <= new Date(manufacturingDate)) {
      throw new ApiError(400, 'INVALID_DATES', 'Expiry date must be after the manufacturing date');
    }

    const med = await db.query('SELECT * FROM medicines WHERE id = $1', [medicineId]);
    if (med.rows.length === 0) throw new ApiError(404, 'MEDICINE_NOT_FOUND', 'Medicine not found');

    const client = await db.pool.connect();
    let batch;
    let serialNumbers = [];
    try {
      await client.query('BEGIN');

      const batchResult = await client.query(
        `INSERT INTO batches (batch_number, medicine_id, manufacturing_date, expiry_date, quantity, status)
         VALUES ($1, $2, $3, $4, $5, 'ACTIVE')
         RETURNING *`,
        [batchNumber, medicineId, manufacturingDate, expiryDate, qty]
      );
      batch = batchResult.rows[0];

      const start = await this.#nextSerialStart();
      for (let i = 0; i < qty; i++) {
        const serial = `SN${String(start + i)}`;
        const insert = await client.query(
          `INSERT INTO serial_numbers (serial_number, batch_id, status, current_owner)
           VALUES ($1, $2, 'IN_TRANSIT', NULL)
           ON CONFLICT (serial_number) DO NOTHING
           RETURNING serial_number`,
          [serial, batch.id]
        );
        if (insert.rows.length > 0) serialNumbers.push(serial);
      }

      await client.query('COMMIT');
    } catch (err) {
      try { await client.query('ROLLBACK'); } catch (_) { /* ignore */ }
      if (err.code === '23505') {
        throw new ApiError(409, 'DUPLICATE_BATCH', 'A batch with this number already exists for this medicine');
      }
      throw err;
    } finally {
      client.release();
    }

    // Mirror the batch on-chain (best effort — DB stays the source of truth)
    const chain = await blockchainService.registerBatch(batch.batch_number, med.rows[0].medicine_code);

    if (actor) {
      auditService.log({
        userId: actor.id,
        organizationId: actor.organizationId,
        action: 'CREATE',
        entityType: 'batch',
        entityId: batch.id,
        details: { batchNumber: batch.batch_number, quantity: qty, serials: serialNumbers.length },
        ipAddress: meta.ipAddress,
        userAgent: meta.userAgent,
      });
    }

    return {
      batch,
      serialsGenerated: serialNumbers.length,
      firstSerial: serialNumbers[0] || null,
      lastSerial: serialNumbers[serialNumbers.length - 1] || null,
      blockchain: chain,
    };
  }

  async updateBatchStatus(id, status) {
    const allowed = ['ACTIVE', 'BLOCKED', 'EXPIRED', 'RECALLED'];
    if (!allowed.includes(status)) throw new ApiError(400, 'INVALID_STATUS', `Status must be one of ${allowed.join(', ')}`);

    const result = await db.query('UPDATE batches SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *', [status, id]);
    if (result.rows.length === 0) throw new ApiError(404, 'BATCH_NOT_FOUND', 'Batch not found');

    await db.query('UPDATE serial_numbers SET status = $1, updated_at = NOW() WHERE batch_id = $2 AND status <> $3', [
      status === 'BLOCKED' ? 'BLOCKED' : status === 'RECALLED' ? 'FLAGGED_SUSPICIOUS' : 'IN_STOCK',
      id,
      'DISPENSED',
    ]);

    return result.rows[0];
  }
}

module.exports = new BatchService();
