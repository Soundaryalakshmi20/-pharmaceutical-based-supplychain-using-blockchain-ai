const express = require('express');
const router = express.Router();
const controller = require('../controllers/patientController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.get('/', authenticateToken, controller.getAllPatients);
router.get('/:id', authenticateToken, controller.getPatientById);
router.post('/', authenticateToken, requireRole('ADMIN', 'PHARMACY'), controller.createPatient);
router.put('/:id', authenticateToken, requireRole('ADMIN', 'PHARMACY'), controller.updatePatient);
router.delete('/:id', authenticateToken, requireRole('ADMIN'), controller.deletePatient);
router.post('/:id/allergies', authenticateToken, requireRole('ADMIN', 'PHARMACY'), controller.addAllergy);
// DELETE /api/patients/:patientId/allergies/:allergyId  (frontend contract)
router.delete('/:id/allergies/:allergyId', authenticateToken, requireRole('ADMIN', 'PHARMACY'), controller.removePatientAllergy);
// legacy shape kept for compatibility
router.delete('/:allergyId/allergies', authenticateToken, requireRole('ADMIN', 'PHARMACY'), controller.removeAllergy);

module.exports = router;
