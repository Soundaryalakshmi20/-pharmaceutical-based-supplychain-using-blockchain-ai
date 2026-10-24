const authService = require('../services/authService');
const { sendSuccess } = require('../utils/response');

exports.login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body, {
      ipAddress: req.ip || req.headers['x-forwarded-for'],
      userAgent: req.headers['user-agent'],
    });
    return sendSuccess(res, result, 'Login successful');
  } catch (err) {
    next(err);
  }
};

exports.me = async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user.id);
    return sendSuccess(res, user);
  } catch (err) {
    next(err);
  }
};

exports.logout = async (req, res) => {
  return sendSuccess(res, { loggedOut: true }, 'Logged out');
};
