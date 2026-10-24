const express = require('express');
const router = express.Router();
const controller = require('../controllers/regulatoryController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// GET  /api/regulatory           — all rulings (medicine + batch level)
router.get('/', authenticateToken, controller.list);

// GET  /api/regulatory/stats     — counts by status
router.get('/stats', authenticateToken, controller.stats);

// POST /api/regulatory           — create/replace a ruling (admin only)
router.post('/', authenticateToken, requireRole('ADMIN'), controller.upsert);

module.exports = router;
