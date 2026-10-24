const regulatoryService = require('../services/regulatoryService');
const { sendSuccess } = require('../utils/response');

exports.list = async (req, res, next) => {
  try {
    const records = await regulatoryService.list(req.query);
    return sendSuccess(res, records);
  } catch (err) {
    next(err);
  }
};

exports.stats = async (req, res, next) => {
  try {
    const stats = await regulatoryService.stats();
    return sendSuccess(res, stats);
  } catch (err) {
    next(err);
  }
};

exports.upsert = async (req, res, next) => {
  try {
    const result = await regulatoryService.upsert(
      { ...req.body, actor: req.user },
      { ipAddress: req.ip, userAgent: req.headers['user-agent'] }
    );
    return sendSuccess(res, result, 'Regulatory ruling recorded', 201);
  } catch (err) {
    next(err);
  }
};
