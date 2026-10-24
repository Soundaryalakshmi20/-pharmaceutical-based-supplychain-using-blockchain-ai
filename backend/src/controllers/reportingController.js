const reportingService = require('../services/reportingService');
const { sendSuccess } = require('../utils/response');

exports.getMedicineCatalog = async (req, res, next) => {
  try {
    const report = await reportingService.generateMedicineCatalog();
    return sendSuccess(res, report);
  } catch (err) {
    next(err);
  }
};

exports.getInventoryReport = async (req, res, next) => {
  try {
    const report = await reportingService.generateInventoryReport({
      organizationId: req.user?.organizationId,
    });
    return sendSuccess(res, report);
  } catch (err) {
    next(err);
  }
};

exports.getExpiryReport = async (req, res, next) => {
  try {
    const report = await reportingService.generateExpiryReport();
    return sendSuccess(res, report);
  } catch (err) {
    next(err);
  }
};

exports.getSalesSummary = async (req, res, next) => {
  try {
    const report = await reportingService.generateSalesSummary(req.query);
    return sendSuccess(res, report);
  } catch (err) {
    next(err);
  }
};

exports.getComplianceReport = async (req, res, next) => {
  try {
    const report = await reportingService.generateComplianceReport();
    return sendSuccess(res, report);
  } catch (err) {
    next(err);
  }
};

exports.getSupplierDirectory = async (req, res, next) => {
  try {
    const report = await reportingService.generateSupplierDirectory();
    return sendSuccess(res, report);
  } catch (err) {
    next(err);
  }
};
