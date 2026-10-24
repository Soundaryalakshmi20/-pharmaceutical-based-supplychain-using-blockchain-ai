'use strict';

const db = require('../config/db');

class AuditService {
  async log({ userId, organizationId, action, entityType, entityId, details, ipAddress, userAgent }) {
    try {
      await db.query(
        `INSERT INTO audit_logs (user_id, organization_id, action, entity_type, entity_id, details, ip_address, user_agent)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [userId || null, organizationId || null, action, entityType || null, entityId || null,
         details ? JSON.stringify(details) : null, ipAddress || null, userAgent || null]
      );
    } catch (err) {
      console.error('[AuditService] Failed to write audit log:', err.message);
    }
  }

  async getAuditLogs({ userId, organizationId, action, entityType, entityId, dateFrom, dateTo, page = 1, limit = 100 } = {}) {
    let query = `SELECT a.*, u.name as user_name, u.email as user_email, o.name as org_name
                 FROM audit_logs a
                 LEFT JOIN users u ON a.user_id = u.id
                 LEFT JOIN organizations o ON a.organization_id = o.id
                 WHERE 1=1`;
    const params = [];
    let idx = 1;

    if (userId) { query += ` AND a.user_id = $${idx++}`; params.push(userId); }
    if (organizationId) { query += ` AND a.organization_id = $${idx++}`; params.push(organizationId); }
    if (action) { query += ` AND a.action = $${idx++}`; params.push(action); }
    if (entityType) { query += ` AND a.entity_type = $${idx++}`; params.push(entityType); }
    if (entityId) { query += ` AND a.entity_id = $${idx++}`; params.push(entityId); }
    if (dateFrom) { query += ` AND a.timestamp >= $${idx++}`; params.push(dateFrom); }
    if (dateTo) { query += ` AND a.timestamp <= $${idx++}`; params.push(dateTo); }

    query += ` ORDER BY a.timestamp DESC LIMIT $${idx} OFFSET $${idx + 1}`;
    params.push(limit, (page - 1) * limit);

    const result = await db.query(query, params);

    const countQuery = query.replace(/SELECT .* FROM/, 'SELECT COUNT(*) FROM').replace(/ORDER BY.*$/, '');
    const countResult = await db.query(countQuery, params.slice(0, -2));

    return {
      logs: result.rows,
      total: parseInt(countResult.rows[0].count),
      page,
      totalPages: Math.ceil(parseInt(countResult.rows[0].count) / limit),
    };
  }

  async getAuditStats({ dateFrom, dateTo } = {}) {
    let query = `SELECT action, COUNT(*) as count FROM audit_logs WHERE 1=1`;
    const params = [];
    let idx = 1;
    if (dateFrom) { query += ` AND timestamp >= $${idx++}`; params.push(dateFrom); }
    if (dateTo) { query += ` AND timestamp <= $${idx++}`; params.push(dateTo); }
    query += ` GROUP BY action ORDER BY count DESC`;

    const result = await db.query(query, params);

    const totalResult = await db.query(
      `SELECT COUNT(*) as total FROM audit_logs ${dateFrom ? 'WHERE timestamp >= $1' : ''}`,
      dateFrom ? [dateFrom] : []
    );

    return {
      byAction: result.rows,
      total: parseInt(totalResult.rows[0].total),
    };
  }
}

module.exports = new AuditService();
