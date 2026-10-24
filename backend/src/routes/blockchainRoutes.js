const express = require('express');
const router = express.Router();
const controller = require('../controllers/blockchainController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.get('/status', authenticateToken, controller.status);
router.get('/transactions', authenticateToken, controller.transactions);
router.get('/tx/:hash', authenticateToken, controller.transactionDetails);
router.get('/batch/:batchNumber', authenticateToken, controller.batchTrail);
router.get('/history/:serialNumber', authenticateToken, controller.history);

module.exports = router;
