const organizationService = require('../services/organizationService');
const { sendSuccess } = require('../utils/response');

exports.list = async (req, res, next) => {
  try {
    const organizations = await organizationService.list(req.query);
    return sendSuccess(res, organizations);
  } catch (err) {
    next(err);
  }
};
