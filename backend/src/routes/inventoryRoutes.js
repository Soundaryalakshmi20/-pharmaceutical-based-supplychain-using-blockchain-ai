const express = require('express');
const router = express.Router();
const controller = require('../controllers/inventoryController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.get('/', authenticateToken, controller.list);
router.get('/stock', authenticateToken, controller.stock);
router.post('/receive', authenticateToken, requireRole('ADMIN', 'DISTRIBUTOR', 'PHARMACY'), controller.receive);
router.post('/transfer', authenticateToken, requireRole('ADMIN', 'DISTRIBUTOR'), controller.transfer);
router.post('/dispense', authenticateToken, requireRole('ADMIN', 'PHARMACY'), controller.dispense);

module.exports = router;
