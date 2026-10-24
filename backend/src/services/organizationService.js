'use strict';

const db = require('../config/db');

class OrganizationService {
  async list({ type, status, search } = {}) {
    let query = `
      SELECT o.*,
             (SELECT COUNT(*) FROM users u WHERE u.organization_id = o.id) AS user_count,
             (SELECT COUNT(*) FROM inventory i WHERE i.organization_id = o.id AND i.quantity > 0) AS stock_rows
      FROM organizations o
      WHERE 1=1`;
    const params = [];
    let idx = 1;

    if (type) { query += ` AND o.type = $${idx++}`; params.push(type); }
    if (status) { query += ` AND o.status = $${idx++}`; params.push(status); }
    if (search) { query += ` AND o.name ILIKE $${idx++}`; params.push(`%${search}%`); }

    query += ` ORDER BY o.type, o.name`;
    const result = await db.query(query, params);
    return result.rows;
  }
}

module.exports = new OrganizationService();
