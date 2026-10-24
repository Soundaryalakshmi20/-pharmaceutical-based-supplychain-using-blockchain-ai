const express = require('express');
const router = express.Router();
const controller = require('../controllers/reportingController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.get('/medicine-catalog', authenticateToken, controller.getMedicineCatalog);
router.get('/inventory', authenticateToken, controller.getInventoryReport);
router.get('/expiry', authenticateToken, controller.getExpiryReport);
router.get('/sales', authenticateToken, controller.getSalesSummary);
router.get('/compliance', authenticateToken, requireRole('ADMIN'), controller.getComplianceReport);
router.get('/suppliers', authenticateToken, requireRole('ADMIN'), controller.getSupplierDirectory);

module.exports = router;
