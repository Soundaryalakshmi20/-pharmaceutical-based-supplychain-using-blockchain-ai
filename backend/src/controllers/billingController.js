const billingService = require('../services/billingService');
const { sendSuccess } = require('../utils/response');

exports.createBill = async (req, res, next) => {
  try {
    const bill = await billingService.createBill({
      ...req.body,
      pharmacyId: req.body.pharmacyId || req.user?.organizationId,
      issuedBy: req.user?.id,
    });
    return sendSuccess(res, bill, 'Bill created successfully', 201);
  } catch (err) {
    next(err);
  }
};

exports.getBillById = async (req, res, next) => {
  try {
    const bill = await billingService.getBillById(req.params.id);
    return sendSuccess(res, bill);
  } catch (err) {
    next(err);
  }
};

exports.getAllBills = async (req, res, next) => {
  try {
    const bills = await billingService.getAllBills(req.query);
    return sendSuccess(res, bills);
  } catch (err) {
    next(err);
  }
};

exports.getSalesSummary = async (req, res, next) => {
  try {
    const summary = await billingService.getSalesSummary(req.query);
    return sendSuccess(res, summary);
  } catch (err) {
    next(err);
  }
};

exports.voidBill = async (req, res, next) => {
  try {
    const bill = await billingService.voidBill(req.params.id);
    return sendSuccess(res, bill, 'Bill voided');
  } catch (err) {
    next(err);
  }
};
