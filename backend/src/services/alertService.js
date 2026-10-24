'use strict';

const db = require('../config/db');
const { ApiError } = require('../utils/response');

class AlertService {
  async list({ status, severity, type, limit = 200 } = {}) {
    let query = `
      SELECT a.*, m.name AS medicine_name, b.batch_number
      FROM alerts a
      LEFT JOIN medicines m ON a.medicine_id = m.id
      LEFT JOIN batches b ON a.batch_id = b.id
      WHERE 1=1`;
    const params = [];
    let idx = 1;

    if (status) { query += ` AND a.status = $${idx++}`; params.push(status); }
    if (severity) { query += ` AND a.severity = $${idx++}`; params.push(severity); }
    if (type) { query += ` AND a.type = $${idx++}`; params.push(type); }

    query += ` ORDER BY a.created_at DESC LIMIT $${idx}`;
    params.push(limit);

    const result = await db.query(query, params);
    return result.rows;
  }

  async create({ type, medicineId = null, batchId = null, message, severity = 'MEDIUM' }) {
    if (!message) throw new ApiError(400, 'MISSING_FIELD', 'message is required');
    const result = await db.query(
      `INSERT INTO alerts (type, medicine_id, batch_id, message, severity, status)
       VALUES ($1, $2, $3, $4, $5, 'OPEN') RETURNING *`,
      [type || 'SUPPLY_CHAIN_MISMATCH', medicineId, batchId, message, severity]
    );
    return result.rows[0];
  }

  async updateStatus(id, status) {
    const allowed = ['OPEN', 'ACKNOWLEDGED', 'RESOLVED'];
    if (!allowed.includes(status)) throw new ApiError(400, 'INVALID_STATUS', `Status must be one of ${allowed.join(', ')}`);
    const result = await db.query('UPDATE alerts SET status = $1 WHERE id = $2 RETURNING *', [status, id]);
    if (result.rows.length === 0) throw new ApiError(404, 'ALERT_NOT_FOUND', 'Alert not found');
    return result.rows[0];
  }

  async summary() {
    const bySeverity = await db.query(
      `SELECT severity, COUNT(*) AS count FROM alerts WHERE status = 'OPEN' GROUP BY severity`
    );
    const open = await db.query(`SELECT COUNT(*) AS count FROM alerts WHERE status = 'OPEN'`);
    return { open: parseInt(open.rows[0].count, 10), bySeverity: bySeverity.rows };
  }
}

module.exports = new AlertService();
