const pino = require('pino');

/**
 * Production-grade logger using Pino
 * 
 * Features:
 * - Structured JSON logging in production
 * - Pretty formatting in development
 * - Automatic request ID tracking
 * - Performance optimized (fastest Node.js logger)
 * - Different log levels: trace, debug, info, warn, error, fatal
 * - Automatic error serialization
 */

const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV !== 'production';

// Configure logger based on environment
const logger = pino({
  level: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),
  
  // Format timestamps
  timestamp: pino.stdTimeFunctions.isoTime,
  
  // Serialize errors properly
  serializers: {
    err: pino.stdSerializers.err,
    error: pino.stdSerializers.err,
    req: (req) => ({
      id: req.id,
      method: req.method,
      url: req.url,
      path: req.path,
      params: req.params,
      query: req.query,
      // Never log sensitive data
      // body is logged separately with filtering
    }),
    res: (res) => ({
      statusCode: res.statusCode,
    }),
  },

  // Development: Pretty print with colors
  // Production: JSON format for log aggregation tools
  transport: isDevelopment ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'HH:MM:ss',
      ignore: 'pid,hostname',
      singleLine: false,
      messageFormat: '{levelLabel} - {msg}',
    }
  } : undefined,
});

/**
 * Helper function to filter sensitive data from objects
 */
const filterSensitiveData = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  
  const filtered = { ...obj };
  const sensitiveFields = [
    'password',
    'token',
    'refreshToken',
    'accessToken',
    'resetPasswordToken',
    'newPassword',
    'confirmPassword',
    'currentPassword',
    'authorization',
    'cookie',
  ];

  sensitiveFields.forEach(field => {
    if (filtered[field] !== undefined) {
      filtered[field] = '[REDACTED]';
    }
  });

  return filtered;
};

/**
 * Create child logger with additional context
 * Useful for adding request ID, user ID, etc.
 */
const createChildLogger = (bindings) => {
  return logger.child(filterSensitiveData(bindings));
};

/**
 * Log HTTP request with filtered body
 */
const logRequest = (req, additionalData = {}) => {
  const filteredBody = filterSensitiveData(req.body);
  logger.info({
    type: 'request',
    method: req.method,
    path: req.path,
    query: req.query,
    body: filteredBody,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    ...additionalData,
  }, `${req.method} ${req.path}`);
};

/**
 * Log HTTP response
 */
const logResponse = (req, res, duration) => {
  const level = res.statusCode >= 400 ? 'error' : 'info';
  logger[level]({
    type: 'response',
    method: req.method,
    path: req.path,
    statusCode: res.statusCode,
    duration: `${duration}ms`,
  }, `${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
};

/**
 * Log database operations
 */
const logDatabase = (operation, details = {}) => {
  logger.info({
    type: 'database',
    operation,
    ...filterSensitiveData(details),
  }, `Database: ${operation}`);
};

/**
 * Log authentication events
 */
const logAuth = (event, details = {}) => {
  logger.info({
    type: 'auth',
    event,
    ...filterSensitiveData(details),
  }, `Auth: ${event}`);
};

/**
 * Log email operations
 */
const logEmail = (operation, details = {}) => {
  logger.info({
    type: 'email',
    operation,
    ...filterSensitiveData(details),
  }, `Email: ${operation}`);
};

/**
 * Express middleware for automatic request/response logging
 */
const requestLoggerMiddleware = (req, res, next) => {
  const startTime = Date.now();
  
  // Log incoming request
  logRequest(req);
  
  // Capture response finish event
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logResponse(req, res, duration);
  });
  
  next();
};

module.exports = {
  logger,
  createChildLogger,
  filterSensitiveData,
  logRequest,
  logResponse,
  logDatabase,
  logAuth,
  logEmail,
  requestLoggerMiddleware,
};
