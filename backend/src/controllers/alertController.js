const alertService = require('../services/alertService');
const { sendSuccess } = require('../utils/response');

exports.list = async (req, res, next) => {
  try {
    const alerts = await alertService.list(req.query);
    return sendSuccess(res, alerts);
  } catch (err) {
    next(err);
  }
};

exports.summary = async (req, res, next) => {
  try {
    const summary = await alertService.summary();
    return sendSuccess(res, summary);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const alert = await alertService.create(req.body);
    return sendSuccess(res, alert, 'Alert created', 201);
  } catch (err) {
    next(err);
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const alert = await alertService.updateStatus(req.params.id, req.body.status);
    return sendSuccess(res, alert, 'Alert updated');
  } catch (err) {
    next(err);
  }
};
