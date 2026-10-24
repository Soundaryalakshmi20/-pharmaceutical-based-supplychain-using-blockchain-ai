const express = require('express');
const router = express.Router();
const controller = require('../controllers/prescriptionController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.get('/', authenticateToken, controller.getAllPrescriptions);
router.get('/:id', authenticateToken, controller.getPrescriptionById);
router.post('/', authenticateToken, requireRole('ADMIN', 'PHARMACY'), controller.createPrescription);
router.patch('/:id/status', authenticateToken, requireRole('ADMIN', 'PHARMACY'), controller.updatePrescriptionStatus);
router.post('/items/:itemId/dispense', authenticateToken, requireRole('PHARMACY'), controller.dispenseItem);
router.get('/:id/interactions', authenticateToken, controller.checkInteractions);

module.exports = router;
