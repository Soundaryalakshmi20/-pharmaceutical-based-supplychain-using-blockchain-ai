'use strict';

/**
 * Verification engine — answers "is this pack genuine, legal and where is it?"
 *
 * Used by:
 *  - GET /api/verify/:serial?action=RECEIVE|TRANSFER|DISPENSE|PATIENT_SCAN
 *  - GET /api/verify/:serial/history      (supply chain timeline)
 *  - inventory receive/transfer/dispense guards
 */

const db = require('../config/db');
const { ApiError } = require('../utils/response');
const blockchainService = require('./blockchainService');

const BLOCKING_REG_STATUSES = ['PROHIBITED', 'RECALLED', 'RESTRICTED'];

const SELECT_PACK = `
  SELECT sn.id AS serial_id, sn.serial_number, sn.status AS serial_status, sn.current_owner,
         sn.created_at AS registered_at,
         b.id AS batch_id, b.batch_number, b.manufacturing_date, b.expiry_date, b.status AS batch_status,
         m.id AS medicine_id, m.name, m.medicine_code, m.manufacturer_name, m.composition, m.dosage,
         o.name AS owner_name, o.type AS owner_type,
         last_transfer.to_organization_id AS last_transfer_to,
         last_transfer.dest_name AS last_transfer_dest,
         COALESCE(r_batch.status, r_med.status, 'UNKNOWN') AS reg_status,
         COALESCE(r_batch.authority, r_med.authority) AS reg_authority,
         COALESCE(r_batch.reference_number, r_med.reference_number) AS reg_reference,
         COALESCE(r_batch.effective_date, r_med.effective_date) AS reg_effective,
         COALESCE(r_batch.reason, r_med.reason) AS reg_reason,
         COALESCE(r_batch.source, r_med.source) AS reg_source
  FROM serial_numbers sn
  JOIN batches b ON sn.batch_id = b.id
  JOIN medicines m ON b.medicine_id = m.id
  LEFT JOIN organizations o ON sn.current_owner = o.id
  LEFT JOIN LATERAL (
    SELECT t.to_organization_id, o2.name AS dest_name
    FROM transactions t
    LEFT JOIN organizations o2 ON o2.id = t.to_organization_id
    WHERE t.serial_number_id = sn.id AND t.transaction_type = 'TRANSFER'
    ORDER BY t.timestamp DESC LIMIT 1
  ) AS last_transfer ON true
  LEFT JOIN regulatory_status r_batch ON r_batch.batch_id = b.id
  LEFT JOIN regulatory_status r_med ON r_med.medicine_id = m.id AND r_med.batch_id IS NULL`;

class VerificationService {
  async verifyMedicine(serialNumber, organizationId = null, action = 'PATIENT_SCAN') {
    const result = await db.query(`${SELECT_PACK} WHERE LOWER(sn.serial_number) = LOWER($1)`, [serialNumber]);

    if (result.rows.length === 0) {
      return {
        status: 'POSSIBLE_COUNTERFEIT',
        serialNumber,
        actionRequested: action,
        checks: { registered: 'FAIL' },
        warnings: ['Serial number is not registered in the official supply chain ledger'],
        medicine: null,
        batch: null,
        currentOwner: null,
        regulatory: null,
        canProceed: false,
      };
    }

    const row = result.rows[0];
    const warnings = [];
    const checks = { registered: 'PASS' };

    const isExpired = new Date(row.expiry_date) < new Date();
    const batchOk = row.batch_status === 'ACTIVE';
    const regBlocked = BLOCKING_REG_STATUSES.includes(row.reg_status);
    const regUnknown = row.reg_status === 'UNKNOWN';

    checks.batchStatus = batchOk ? 'PASS' : 'FAIL';
    checks.expiry = isExpired ? 'FAIL' : 'PASS';
    checks.regulatory = regBlocked ? 'FAIL' : regUnknown ? 'WARN' : 'PASS';

    // Blocking regulatory / batch / expiry reasons are pushed FIRST so the
    // headline warning the UI shows is the most severe one (a pack that is
    // PROHIBITED should say so, not "organisation does not hold it").
    if (!batchOk) warnings.push(`Batch is ${row.batch_status}`);
    if (isExpired) warnings.push('Pack expired on ' + new Date(row.expiry_date).toDateString());
    if (regBlocked) warnings.push(`Regulatory status: ${row.reg_status} — blocked by CDSCO`);

    // Custody rules depend on the action being attempted.
    let custodyOk = true;
    const orgId = organizationId != null && organizationId !== '' ? Number(organizationId) : null;

    if (action === 'RECEIVE') {
      if (row.serial_status === 'DISPENSED') {
        custodyOk = false;
        warnings.push('Pack has already been dispensed to a patient');
      } else if (row.current_owner && orgId && Number(row.current_owner) !== orgId) {
        custodyOk = false;
        warnings.push(`Pack is currently held by ${row.owner_name || 'another organisation'} and cannot be received by this one`);
      } else if (row.current_owner && !orgId) {
        custodyOk = false;
        warnings.push('Pack is already in custody of an organisation');
      } else if (row.serial_status === 'IN_STOCK' && orgId && Number(row.current_owner) === orgId) {
        custodyOk = false;
        warnings.push('Pack has already been received by this organisation');
      } else if (!row.current_owner && orgId && row.last_transfer_to != null && Number(row.last_transfer_to) !== orgId) {
        // Pack was dispatched to a specific organisation — only that one may
        // take delivery. Prevents the sender from "pulling back" a pack that
        // is already on its way to the destination pharmacy.
        custodyOk = false;
        warnings.push(
          `Pack was dispatched to ${row.last_transfer_dest || 'another organisation'} — only that organisation can receive it`
        );
      }
      checks.custody = custodyOk ? 'PASS' : 'FAIL';
    } else if (action === 'TRANSFER' || action === 'DISPENSE') {
      custodyOk = Boolean(orgId) && Number(row.current_owner) === orgId && row.serial_status === 'IN_STOCK';
      if (!custodyOk) {
        if (!orgId) {
          warnings.push('Pack cannot be moved without a linked organisation');
        } else if (row.current_owner == null) {
          warnings.push('Pack is in transit — it must be received into stock before it can move');
        } else if (Number(row.current_owner) !== orgId) {
          warnings.push(`Pack is currently held by ${row.owner_name || 'another organisation'} and cannot be moved by this one`);
        } else {
          warnings.push('Pack is not in stock and cannot be moved');
        }
      }
      checks.custody = custodyOk ? 'PASS' : 'FAIL';
    } else {
      // PATIENT_SCAN — informational
      checks.custody = 'N/A';
    }

    // Verdict priority
    let status;
    if (regBlocked || !batchOk) {
      status = 'REGULATORY_BLOCK';
    } else if (isExpired) {
      status = 'EXPIRED';
    } else if (action === 'PATIENT_SCAN' && row.serial_status === 'DISPENSED') {
      status = 'ALREADY_DISPENSED';
    } else if (!custodyOk) {
      status = 'WARNING';
    } else {
      status = 'VERIFIED';
    }

    const blocking = status === 'REGULATORY_BLOCK' || status === 'EXPIRED';

    return {
      status,
      serialNumber: row.serial_number,
      actionRequested: action,
      canProceed: !blocking && (action === 'PATIENT_SCAN' || custodyOk),
      medicine: {
        id: row.medicine_id,
        name: row.name,
        code: row.medicine_code,
        manufacturer: row.manufacturer_name,
        composition: row.composition,
        dosage: row.dosage,
        regulatoryStatus: row.reg_status,
      },
      batch: {
        id: row.batch_id,
        batchNumber: row.batch_number,
        status: row.batch_status,
        manufacturingDate: row.manufacturing_date,
        expiryDate: row.expiry_date,
      },
      currentOwner: row.current_owner
        ? { id: row.current_owner, name: row.owner_name, type: row.owner_type }
        : null,
      registeredAt: row.registered_at,
      regulatory: regBlocked || regUnknown
        ? {
            authority: row.reg_authority,
            referenceNumber: row.reg_reference,
            effectiveDate: row.reg_effective,
            reason: row.reg_reason,
            source: row.reg_source,
            status: row.reg_status,
          }
        : null,
      checks,
      warnings,
    };
  }

  async getSupplyChainHistory(serialNumber) {
    const pack = await db.query(`SELECT id, batch_id FROM serial_numbers WHERE LOWER(serial_number) = LOWER($1)`, [serialNumber]);
    if (pack.rows.length === 0) {
      return { serialNumber, timeline: [], exists: false };
    }

    const result = await db.query(
      `SELECT t.*,
              fo.name AS from_name, fo.type AS from_type,
              tt.name AS to_name, tt.type AS to_type
       FROM transactions t
       LEFT JOIN organizations fo ON t.from_organization_id = fo.id
       LEFT JOIN organizations tt ON t.to_organization_id = tt.id
       WHERE t.serial_number_id = $1
       ORDER BY t.timestamp ASC`,
      [pack.rows[0].id]
    );

    const timeline = result.rows.map((t) => {
      const type = t.transaction_type === 'DISPENSE' ? 'DISPENSED_TO_PATIENT' : t.transaction_type;
      const hash = t.blockchain_transaction_hash || t.blockchain_tx_hash || null;
      const base = {
        type,
        timestamp: t.timestamp,
        blockchainHash: hash,
        blockchainStatus: t.blockchain_status || null,
        quantity: t.quantity,
      };

      if (type === 'DISPENSED_TO_PATIENT') {
        return { ...base, pharmacy: t.from_name || 'Pharmacy' };
      }
      if (type === 'RECEIVE') {
        return { ...base, from: t.from_name ? { name: t.from_name, type: t.from_type } : null, to: t.to_name ? { name: t.to_name, type: t.to_type } : null };
      }
      return {
        ...base,
        from: t.from_name ? { name: t.from_name, type: t.from_type } : null,
        to: t.to_name ? { name: t.to_name, type: t.to_type } : null,
      };
    });

    const onChain = await blockchainService.getSerialHistory(serialNumber);

    return {
      serialNumber,
      exists: true,
      timeline,
      onChainEvents: onChain || [],
      onChainAvailable: Boolean(onChain),
    };
  }

  /** Throws ApiError(400) when the pack may not legally move. */
  async assertMovable(serialNumber, organizationId, action) {
    const verification = await this.verifyMedicine(serialNumber, organizationId, action);
    if (!verification.canProceed) {
      if (verification.status === 'POSSIBLE_COUNTERFEIT') {
        throw new ApiError(404, 'SERIAL_NOT_FOUND', 'Serial number is not registered in the official system');
      }
      if (verification.status === 'REGULATORY_BLOCK' || verification.batch?.status === 'RECALLED' || verification.batch?.status === 'BLOCKED') {
        throw new ApiError(400, 'LEGALLY_BLOCKED', 'Medicine or batch is legally blocked or recalled.');
      }
      if (verification.status === 'EXPIRED') {
        throw new ApiError(400, 'EXPIRED', 'Medicine has expired and cannot be moved');
      }
      const custodyWarning = verification.warnings[0];
      throw new ApiError(400, 'CUSTODY_VIOLATION', custodyWarning || 'Pack cannot be moved by this organisation');
    }
    return verification;
  }
}

module.exports = new VerificationService();
