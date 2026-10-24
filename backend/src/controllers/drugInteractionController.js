const drugInteractionService = require('../services/drugInteractionService');
const { sendSuccess } = require('../utils/response');

exports.getAllInteractions = async (req, res, next) => {
  try {
    const interactions = await drugInteractionService.getAllInteractions(req.query);
    return sendSuccess(res, interactions);
  } catch (err) {
    next(err);
  }
};

exports.checkInteractions = async (req, res, next) => {
  try {
    const result = await drugInteractionService.checkInteractions(req.body.medicineNames);
    return sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
};

exports.addInteraction = async (req, res, next) => {
  try {
    const interaction = await drugInteractionService.addInteraction(req.body);
    return sendSuccess(res, interaction, 'Interaction added', 201);
  } catch (err) {
    next(err);
  }
};

exports.deactivateInteraction = async (req, res, next) => {
  try {
    await drugInteractionService.deactivateInteraction(req.params.id);
    return sendSuccess(res, { deactivated: true });
  } catch (err) {
    next(err);
  }
};
