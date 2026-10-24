const batchService = require('../services/batchService');
const { sendSuccess } = require('../utils/response');

exports.list = async (req, res, next) => {
  try {
    const batches = await batchService.listBatches(req.query);
    return sendSuccess(res, batches);
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const batch = await batchService.getBatchById(req.params.id);
    return sendSuccess(res, batch);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const result = await batchService.createBatch(
      { ...req.body, actor: req.user },
      { ipAddress: req.ip, userAgent: req.headers['user-agent'] }
    );
    return sendSuccess(res, result, 'Batch created and serial numbers generated', 201);
  } catch (err) {
    next(err);
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const batch = await batchService.updateBatchStatus(req.params.id, req.body.status);
    return sendSuccess(res, batch, 'Batch status updated');
  } catch (err) {
    next(err);
  }
};
