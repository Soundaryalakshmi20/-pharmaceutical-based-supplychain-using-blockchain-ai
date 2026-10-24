const dashboardService = require('../services/dashboardService');
const { sendSuccess } = require('../utils/response');

exports.stats = async (req, res, next) => {
  try {
    const stats = await dashboardService.getStats({
      organizationId: req.user && req.user.role !== 'ADMIN' ? req.user.organizationId : null,
    });
    return sendSuccess(res, stats);
  } catch (err) {
    next(err);
  }
};
