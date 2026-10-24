const auditService = require('../services/auditService');
const { sendSuccess } = require('../utils/response');

exports.getAuditLogs = async (req, res, next) => {
  try {
    const result = await auditService.getAuditLogs(req.query);
    return sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
};

exports.getAuditStats = async (req, res, next) => {
  try {
    const stats = await auditService.getAuditStats(req.query);
    return sendSuccess(res, stats);
  } catch (err) {
    next(err);
  }
};

exports.logAction = async (req, res, next) => {
  try {
    await auditService.log({
      userId: req.user?.id,
      organizationId: req.user?.organizationId,
      ...req.body,
    });
    return sendSuccess(res, { logged: true }, 'Audit event logged');
  } catch (err) {
    next(err);
  }
};
