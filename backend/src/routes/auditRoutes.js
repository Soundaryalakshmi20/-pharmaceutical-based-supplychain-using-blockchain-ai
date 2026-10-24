const express = require('express');
const router = express.Router();
const controller = require('../controllers/auditController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.get('/', authenticateToken, requireRole('ADMIN'), controller.getAuditLogs);
router.get('/stats', authenticateToken, requireRole('ADMIN'), controller.getAuditStats);
router.post('/', authenticateToken, controller.logAction);

module.exports = router;
