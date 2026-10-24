const prescriptionService = require('../services/prescriptionService');
const { sendSuccess, sendError } = require('../utils/response');

exports.createPrescription = async (req, res, next) => {
  try {
    const prescription = await prescriptionService.createPrescription(req.body);
    return sendSuccess(res, prescription, 'Prescription created', 201);
  } catch (err) {
    next(err);
  }
};

exports.getPrescriptionById = async (req, res, next) => {
  try {
    const prescription = await prescriptionService.getPrescriptionById(req.params.id);
    return sendSuccess(res, prescription);
  } catch (err) {
    next(err);
  }
};

exports.getAllPrescriptions = async (req, res, next) => {
  try {
    const prescriptions = await prescriptionService.getAllPrescriptions(req.query);
    return sendSuccess(res, prescriptions);
  } catch (err) {
    next(err);
  }
};

exports.updatePrescriptionStatus = async (req, res, next) => {
  try {
    const prescription = await prescriptionService.updatePrescriptionStatus(req.params.id, req.body.status, req.body);
    return sendSuccess(res, prescription, 'Prescription status updated');
  } catch (err) {
    next(err);
  }
};

exports.dispenseItem = async (req, res, next) => {
  try {
    const result = await prescriptionService.dispensePrescriptionItem(
      req.params.itemId, req.body.serialNumber, req.user?.id
    );
    return sendSuccess(res, result, 'Item dispensed successfully');
  } catch (err) {
    next(err);
  }
};

exports.checkInteractions = async (req, res, next) => {
  try {
    const result = await prescriptionService.checkDrugInteractions(req.params.id);
    return sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
};
