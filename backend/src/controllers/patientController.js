const patientService = require('../services/patientService');
const { sendSuccess, sendError } = require('../utils/response');

exports.createPatient = async (req, res, next) => {
  try {
    const patient = await patientService.createPatient(req.body);
    return sendSuccess(res, patient, 'Patient created successfully', 201);
  } catch (err) {
    next(err);
  }
};

exports.getAllPatients = async (req, res, next) => {
  try {
    const result = await patientService.getAllPatients(req.query);
    return sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
};

exports.getPatientById = async (req, res, next) => {
  try {
    const patient = await patientService.getPatientById(req.params.id);
    return sendSuccess(res, patient);
  } catch (err) {
    next(err);
  }
};

exports.updatePatient = async (req, res, next) => {
  try {
    const patient = await patientService.updatePatient(req.params.id, req.body);
    return sendSuccess(res, patient, 'Patient updated successfully');
  } catch (err) {
    next(err);
  }
};

exports.addAllergy = async (req, res, next) => {
  try {
    const allergy = await patientService.addAllergy(req.params.id, req.body);
    return sendSuccess(res, allergy, 'Allergy recorded', 201);
  } catch (err) {
    next(err);
  }
};

exports.removeAllergy = async (req, res, next) => {
  try {
    await patientService.removeAllergy(req.params.allergyId);
    return sendSuccess(res, { deleted: true }, 'Allergy removed');
  } catch (err) {
    next(err);
  }
};

// DELETE /api/patients/:id/allergies/:allergyId
exports.removePatientAllergy = async (req, res, next) => {
  try {
    await patientService.removeAllergy(req.params.allergyId);
    return sendSuccess(res, { deleted: true }, 'Allergy removed');
  } catch (err) {
    next(err);
  }
};

exports.deletePatient = async (req, res, next) => {
  try {
    await patientService.deletePatient(req.params.id);
    return sendSuccess(res, { deleted: true }, 'Patient deleted');
  } catch (err) {
    next(err);
  }
};
