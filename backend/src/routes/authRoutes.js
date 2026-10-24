const express = require('express');
const router = express.Router();
const controller = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

// POST /api/auth/login  { email, password }
router.post('/login', controller.login);

// GET  /api/auth/me     (requires Bearer token)
router.get('/me', authenticateToken, controller.me);

// POST /api/auth/logout (client clears the token; endpoint kept for symmetry)
router.post('/logout', authenticateToken, controller.logout);

module.exports = router;
