const express = require('express');
const router = express.Router();
const verificationController = require('../controllers/verificationController');
const { optionalAuth } = require('../middleware/auth');

// GET /api/verify/:serialNumber?action=RECEIVE|TRANSFER|DISPENSE|PATIENT_SCAN&organizationId=...
router.get('/:serialNumber', optionalAuth, verificationController.verifySerial);

// GET /api/verify/:serialNumber/history - full supply chain journey
router.get('/:serialNumber/history', optionalAuth, verificationController.getSupplyChainHistory);

module.exports = router;
