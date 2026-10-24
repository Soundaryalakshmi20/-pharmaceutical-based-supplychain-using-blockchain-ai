const medicineService = require('../services/medicineService');
const { sendSuccess } = require('../utils/response');

exports.list = async (req, res, next) => {
  try {
    const medicines = await medicineService.listMedicines(req.query);
    return sendSuccess(res, medicines);
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const medicine = await medicineService.getMedicineById(req.params.id);
    return sendSuccess(res, medicine);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const medicine = await medicineService.createMedicine(req.body);
    return sendSuccess(res, medicine, 'Medicine created', 201);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const medicine = await medicineService.updateMedicine(req.params.id, req.body);
    return sendSuccess(res, medicine, 'Medicine updated');
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const result = await medicineService.deleteMedicine(req.params.id);
    return sendSuccess(res, result, 'Medicine deleted');
  } catch (err) {
    next(err);
  }
};
