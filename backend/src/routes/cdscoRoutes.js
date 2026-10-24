const express = require('express');
const router = express.Router();
const cdscoController = require('../controllers/cdscoController');
const { authenticateToken, requireRole } = require('../middleware/auth');

/**
 * GET /api/cdsco/data
 * Fetch all CDSCO regulatory data (public for verification)
 */
router.get('/data', cdscoController.getAllCDSCOData);

/**
 * GET /api/cdsco/stats
 * Get CDSCO data statistics
 */
router.get('/stats', cdscoController.getCDSCOStats);

/**
 * POST /api/cdsco/sync
 * Sync all CDSCO data to database (admin only)
 */
router.post('/sync', 
  authenticateToken, 
  requireRole('ADMIN'), 
  cdscoController.syncCDSCOData
);

/**
 * POST /api/cdsco/sync/fdc-2026
 * Sync only 2026 banned FDCs (admin only)
 */
router.post('/sync/fdc-2026', 
  authenticateToken, 
  requireRole('ADMIN'), 
  cdscoController.syncFDC2026
);

/**
 * POST /api/cdsco/sync/nsq
 * Sync only NSQ drugs (admin only)
 */
router.post('/sync/nsq', 
  authenticateToken, 
  requireRole('ADMIN'), 
  cdscoController.syncNSQDrugs
);

module.exports = router;
