const cdscoDataService = require('../services/cdscoDataService');
const { sendSuccess, sendError } = require('../utils/response');

class CDSCOController {
  async getAllCDSCOData(req, res, next) {
    try {
      const data = await cdscoDataService.getAllCDSCOData();
      sendSuccess(res, data, 'CDSCO data fetched successfully');
    } catch (err) {
      next(err);
    }
  }

  async getCDSCOStats(req, res, next) {
    try {
      const stats = await cdscoDataService.getCDSCOStats();
      sendSuccess(res, stats, 'CDSCO stats fetched successfully');
    } catch (err) {
      next(err);
    }
  }

  async syncCDSCOData(req, res, next) {
    try {
      const results = await cdscoDataService.syncAllCDSCOData();
      sendSuccess(res, results, 'CDSCO data synced successfully');
    } catch (err) {
      next(err);
    }
  }

  async syncFDC2026(req, res, next) {
    try {
      const client = await require('../config/db').pool.connect();
      try {
        await client.query('BEGIN');
        let synced = 0;
        let skipped = 0;
        for (const fdc of cdscoDataService.bannedFDCs) {
          const result = await cdscoDataService.syncBannedFDC(client, fdc, '2026');
          if (result) synced++;
          else skipped++;
        }
        await client.query('COMMIT');
        sendSuccess(res, { synced, skipped }, '2026 FDC data synced successfully');
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    } catch (err) {
      next(err);
    }
  }

  async syncNSQDrugs(req, res, next) {
    try {
      const client = await require('../config/db').pool.connect();
      try {
        await client.query('BEGIN');
        let synced = 0;
        let skipped = 0;
        for (const nsq of cdscoDataService.nsqDrugs) {
          const result = await cdscoDataService.syncNSQDrug(client, nsq);
          if (result) synced++;
          else skipped++;
        }
        await client.query('COMMIT');
        sendSuccess(res, { synced, skipped }, 'NSQ data synced successfully');
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new CDSCOController();
