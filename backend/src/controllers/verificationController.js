const verificationService = require('../services/verificationService');
const { sendSuccess, sendError } = require('../utils/response');

exports.verifySerial = async (req, res, next) => {
  try {
    const { serialNumber } = req.params;
    const { action, organizationId } = req.query;

    const result = await verificationService.verifyMedicine(
      serialNumber,
      organizationId || (req.user ? req.user.organizationId : null),
      action || 'PATIENT_SCAN'
    );

    return sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
};

exports.getSupplyChainHistory = async (req, res, next) => {
  try {
    const { serialNumber } = req.params;
    const result = await verificationService.getSupplyChainHistory(serialNumber);
    return sendSuccess(res, result);
  } catch (err) {
    if (err.statusCode) {
      return sendError(res, err.statusCode, err.errorCode, err.message);
    }
    next(err);
  }
};
