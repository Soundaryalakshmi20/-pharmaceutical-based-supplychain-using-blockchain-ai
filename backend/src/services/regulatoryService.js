'use strict';

const db = require('../config/db');
const { ApiError } = require('../utils/response');
const blockchainService = require('./blockchainService');
const auditService = require('./auditService');

const BLOCKING = ['PROHIBITED', 'RECALLED', 'RESTRICTED'];

class RegulatoryService {
  async list({ medicineId, batchId, status, search, limit = 200 } = {}) {
    let query = `
      SELECT r.*, m.name AS medicine_name, m.medicine_code, b.batch_number
      FROM regulatory_status r
      JOIN medicines m ON r.medicine_id = m.id
      LEFT JOIN batches b ON r.batch_id = b.id
      WHERE 1=1`;
    const params = [];
    let idx = 1;

    if (medicineId) { query += ` AND r.medicine_id = $${idx++}`; params.push(medicineId); }
    if (batchId) { query += ` AND r.batch_id = $${idx++}`; params.push(batchId); }
    if (status) { query += ` AND r.status = $${idx++}`; params.push(status); }
    if (search) {
      query += ` AND (m.name ILIKE $${idx} OR m.medicine_code ILIKE $${idx} OR b.batch_number ILIKE $${idx})`;
      params.push(`%${search}%`);
      idx++;
    }

    query += ` ORDER BY r.last_updated DESC LIMIT $${idx}`;
    params.push(limit);

    const result = await db.query(query, params);
    return result.rows;
  }

  /**
   * Create or replace a regulatory ruling for a medicine (and optionally a batch).
   * Blocking rulings cascade to batches / serial numbers and emit an on-chain event.
   */
  async upsert({ medicineId, batchId = null, status, authority, referenceNumber, effectiveDate, reason, source, actor }, meta = {}) {
    if (!medicineId || !status) throw new ApiError(400, 'MISSING_FIELD', 'medicineId and status are required');

    const allowed = ['PERMITTED', 'PROHIBITED', 'RESTRICTED', 'RECALLED', 'UNKNOWN'];
    if (!allowed.includes(status)) throw new ApiError(400, 'INVALID_STATUS', `Status must be one of ${allowed.join(', ')}`);

    const med = await db.query('SELECT id, medicine_code, name FROM medicines WHERE id = $1', [medicineId]);
    if (med.rows.length === 0) throw new ApiError(404, 'MEDICINE_NOT_FOUND', 'Medicine not found');

    if (batchId) {
      const batch = await db.query('SELECT id, batch_number FROM batches WHERE id = $1 AND medicine_id = $2', [batchId, medicineId]);
      if (batch.rows.length === 0) throw new ApiError(404, 'BATCH_NOT_FOUND', 'Batch not found for this medicine');
    }

    const existing = await db.query(
      `SELECT id FROM regulatory_status WHERE medicine_id = $1 AND batch_id IS NOT DISTINCT FROM $2`,
      [medicineId, batchId]
    );

    let record;
    if (existing.rows.length > 0) {
      const updated = await db.query(
        `UPDATE regulatory_status SET status = $1, authority = $2, reference_number = $3, effective_date = $4,
                reason = $5, source = $6, last_updated = NOW()
         WHERE id = $7 RETURNING *`,
        [status, authority || 'Central Drugs Standard Control Organisation (CDSCO)', referenceNumber || null,
         effectiveDate || new Date().toISOString().slice(0, 10), reason || null, source || null, existing.rows[0].id]
      );
      record = updated.rows[0];
    } else {
      const inserted = await db.query(
        `INSERT INTO regulatory_status (medicine_id, batch_id, status, authority, reference_number, effective_date, reason, source, is_simulated)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true) RETURNING *`,
        [medicineId, batchId, status, authority || 'Central Drugs Standard Control Organisation (CDSCO)',
         referenceNumber || null, effectiveDate || new Date().toISOString().slice(0, 10), reason || null, source || null]
      );
      record = inserted.rows[0];
    }

    const isBlocking = BLOCKING.includes(status);
    let batch = null;
    let chain = { status: 'SKIPPED', reason: 'No batch-level ruling' };

    if (batchId) {
      const newBatchStatus = status === 'RECALLED' ? 'RECALLED' : isBlocking ? 'BLOCKED' : 'ACTIVE';
      const updated = await db.query('UPDATE batches SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *', [newBatchStatus, batchId]);
      batch = updated.rows[0];

      await db.query(
        `UPDATE serial_numbers SET status = $1, updated_at = NOW()
         WHERE batch_id = $2 AND status <> 'DISPENSED'`,
        [isBlocking ? 'BLOCKED' : 'IN_STOCK', batchId]
      );

      if (isBlocking) {
        chain = await blockchainService.recordEvent(`BATCH#${batch.batch_number}`, 'BLOCK', `ref:${referenceNumber || 'n/a'}`);
        await db.query(
          `INSERT INTO alerts (type, medicine_id, batch_id, message, severity, status)
           VALUES ($1, $2, $3, $4, $5, 'OPEN')`,
          [status === 'RECALLED' ? 'RECALL' : 'REGULATORY_BLOCK', medicineId, batchId,
           `${batch.batch_number}: ${status} by ${authority || 'CDSCO'}${referenceNumber ? ` (${referenceNumber})` : ''}`,
           status === 'RECALLED' ? 'CRITICAL' : 'HIGH']
        );
      }
    } else if (isBlocking) {
      chain = await blockchainService.recordEvent(`MED#${med.rows[0].medicine_code}`, 'BLOCK', `ref:${referenceNumber || 'n/a'}`);
      await db.query(
        `INSERT INTO alerts (type, medicine_id, message, severity, status)
         VALUES ($1, $2, $3, $4, 'OPEN')`,
        ['REGULATORY_BLOCK', medicineId,
         `${med.rows[0].name} marked ${status} by ${authority || 'CDSCO'}${referenceNumber ? ` (${referenceNumber})` : ''}`,
         'HIGH']
      );
    }

    if (actor) {
      auditService.log({
        userId: actor.id,
        organizationId: actor.organizationId,
        action: isBlocking ? 'BLOCK' : 'REGULATORY_CHANGE',
        entityType: 'regulatory_status',
        entityId: record.id,
        details: { medicineId, batchId, status, referenceNumber },
        ipAddress: meta.ipAddress,
        userAgent: meta.userAgent,
      });
    }

    return { record, batch, blockchain: chain };
  }

  async stats() {
    const result = await db.query(
      `SELECT status, COUNT(*) AS count FROM regulatory_status GROUP BY status ORDER BY count DESC`
    );
    const blocking = await db.query(
      `SELECT COUNT(*) AS count FROM batches WHERE status IN ('BLOCKED', 'RECALLED')`
    );
    return {
      byStatus: result.rows,
      blockedBatches: parseInt(blocking.rows[0].count, 10),
    };
  }
}

module.exports = new RegulatoryService();
