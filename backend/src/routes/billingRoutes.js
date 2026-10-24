const express = require('express');
const router = express.Router();
const controller = require('../controllers/billingController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.get('/', authenticateToken, controller.getAllBills);
router.get('/summary', authenticateToken, controller.getSalesSummary);
router.get('/:id', authenticateToken, controller.getBillById);
router.post('/', authenticateToken, requireRole('ADMIN', 'PHARMACY'), controller.createBill);
router.patch('/:id/void', authenticateToken, requireRole('ADMIN'), controller.voidBill);

module.exports = router;
