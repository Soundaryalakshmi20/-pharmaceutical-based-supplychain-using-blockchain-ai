const express = require('express');
const router = express.Router();
const controller = require('../controllers/organizationController');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, controller.list);

module.exports = router;
