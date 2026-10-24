'use strict';

const db = require('../config/db');

class DashboardService {
  async getStats({ organizationId } = {}) {
    const [stats, alerts, recentTx, stock] = await Promise.all([
      db.query('SELECT * FROM v_dashboard_stats'),
      db.query(`SELECT COUNT(*) AS count FROM alerts WHERE status = 'OPEN'`),
      db.query(
        `SELECT t.id, t.transaction_type, t.timestamp, t.blockchain_status,
                t.blockchain_transaction_hash, b.batch_number,
                m.name AS medicine_name,
                fo.name AS from_name, tt.name AS to_name
         FROM transactions t
         JOIN batches b ON t.batch_id = b.id
         JOIN medicines m ON b.medicine_id = m.id
         LEFT JOIN organizations fo ON t.from_organization_id = fo.id
         LEFT JOIN organizations tt ON t.to_organization_id = tt.id
         ORDER BY t.timestamp DESC
         LIMIT 10`
      ),
      organizationId
        ? db.query(
            `SELECT COALESCE(SUM(i.quantity), 0) AS units
             FROM inventory i WHERE i.organization_id = $1`,
            [organizationId]
          )
        : Promise.resolve({ rows: [{ units: null }] }),
    ]);

    return {
      ...stats.rows[0],
      openAlerts: parseInt(alerts.rows[0].count, 10),
      myStockUnits: stock.rows[0].units === null ? null : parseInt(stock.rows[0].units, 10),
      recentTransactions: recentTx.rows,
      generatedAt: new Date().toISOString(),
    };
  }
}

module.exports = new DashboardService();
