const express = require('express');
const router = express.Router();
const controller = require('../controllers/medicineController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.get('/', authenticateToken, controller.list);
router.get('/:id', authenticateToken, controller.getById);
router.post('/', authenticateToken, requireRole('ADMIN', 'DISTRIBUTOR'), controller.create);
router.put('/:id', authenticateToken, requireRole('ADMIN'), controller.update);
router.delete('/:id', authenticateToken, requireRole('ADMIN'), controller.remove);

module.exports = router;
