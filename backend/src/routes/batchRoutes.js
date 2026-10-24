const express = require('express');
const router = express.Router();
const controller = require('../controllers/batchController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.get('/', authenticateToken, controller.list);
router.get('/:id', authenticateToken, controller.getById);
router.post('/', authenticateToken, requireRole('ADMIN', 'DISTRIBUTOR'), controller.create);
router.patch('/:id/status', authenticateToken, requireRole('ADMIN'), controller.updateStatus);

module.exports = router;
