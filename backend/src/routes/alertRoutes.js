const express = require('express');
const router = express.Router();
const controller = require('../controllers/alertController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.get('/', authenticateToken, controller.list);
router.get('/summary', authenticateToken, controller.summary);
router.post('/', authenticateToken, requireRole('ADMIN'), controller.create);
router.patch('/:id', authenticateToken, requireRole('ADMIN'), controller.updateStatus);

module.exports = router;
