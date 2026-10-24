'use strict';

/**
 * Standard API response helpers.
 *
 * Success: { success: true,  message, data }
 * Error:   { success: false, error: { code, message } }
 *
 * The frontend api/client and the service worker both rely on this shape
 * (`err.response.data.error.message` / `error.code === 'OFFLINE'`).
 */

class ApiError extends Error {
  constructor(statusCode = 400, errorCode = 'ERROR', message = 'Unexpected error') {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errorCode = errorCode;
  }
}

function sendSuccess(res, data, message = 'OK', status = 200) {
  return res.status(status).json({ success: true, message, data });
}

function sendError(res, statusCode = 500, errorCode = 'ERROR', message = 'Unexpected error') {
  return res.status(statusCode).json({
    success: false,
    error: { code: errorCode, message },
  });
}

function notFoundHandler(req, res) {
  return sendError(res, 404, 'NOT_FOUND', `Route not found: ${req.method} ${req.originalUrl}`);
}

// Centralised express error handler — every controller forwards errors here.
function errorHandler(err, req, res, _next) {
  if (err instanceof ApiError) {
    return sendError(res, err.statusCode, err.errorCode, err.message);
  }

  // PostgreSQL unique violation etc.
  if (err && err.code === '23505') {
    return sendError(res, 409, 'DUPLICATE_RECORD', 'A record with the same unique value already exists');
  }
  if (err && err.code === '23503') {
    return sendError(res, 400, 'REFERENCE_ERROR', 'Related record does not exist');
  }
  if (err && err.code === '22P02') {
    return sendError(res, 400, 'INVALID_INPUT', 'Invalid value supplied for one of the fields');
  }

  console.error('[API Error]', err.stack || err.message || err);
  return sendError(res, 500, 'INTERNAL_ERROR', err.message || 'Internal server error');
}

module.exports = { ApiError, sendSuccess, sendError, notFoundHandler, errorHandler };
