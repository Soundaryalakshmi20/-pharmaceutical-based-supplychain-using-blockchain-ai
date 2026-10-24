const express = require('express');
const router = express.Router();
const controller = require('../controllers/dashboardController');
const { authenticateToken } = require('../middleware/auth');

router.get('/stats', authenticateToken, controller.stats);

module.exports = router;
