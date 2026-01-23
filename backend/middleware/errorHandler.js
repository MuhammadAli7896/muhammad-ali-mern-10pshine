const { sendError } = require('../utils/responseHandler');
const { logger } = require('../utils/logger');

/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  // Log error with full context
  logger.error({
    err,
    method: req.method,
    path: req.path,
    query: req.query,
    body: req.body,
    userId: req.userId,
  }, `Error: ${err.message}`);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(error => error.message);
    return sendError(res, 400, 'Validation failed', errors);
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return sendError(res, 400, `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return sendError(res, 401, 'Invalid token. Please log in again.');
  }

  if (err.name === 'TokenExpiredError') {
    return sendError(res, 401, 'Your session has expired. Please log in again.');
  }

  // Default error
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';
  
  return sendError(res, statusCode, message);
};

/**
 * 404 Not Found handler
 */
const notFound = (req, res) => {
  return sendError(res, 404, `Route ${req.originalUrl} not found`);
};

module.exports = {
  errorHandler,
  notFound,
};
