const express = require('express');
const router = express.Router();
const controller = require('../controllers/drugInteractionController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.get('/', authenticateToken, controller.getAllInteractions);
router.post('/check', authenticateToken, controller.checkInteractions);
router.post('/', authenticateToken, requireRole('ADMIN', 'PHARMACY'), controller.addInteraction);
router.delete('/:id', authenticateToken, requireRole('ADMIN'), controller.deactivateInteraction);

module.exports = router;
