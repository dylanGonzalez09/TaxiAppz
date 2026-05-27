const mongoose = require('mongoose');
const httpStatus = require('../utils/httpStatus.js');
const config = require('../config/config');
const logger = require('../config/logger');
const ApiError = require('../utils/ApiError');
const logErrorToDB = require('../utils/logError'); // Adjust path if needed
 
const errorConverter = (err, req, res, next) => {
  let error = err;
  if (!(error instanceof ApiError)) {
    const rawCode = error.statusCode ?? (error instanceof mongoose.Error ? httpStatus.BAD_REQUEST : httpStatus.INTERNAL_SERVER_ERROR);
    const statusCode = Number(rawCode) || httpStatus.INTERNAL_SERVER_ERROR;
    const message = error.message || httpStatus[statusCode];
    error = new ApiError(statusCode, message, false, err.stack);
  }
  if (typeof next !== 'function') {
    return res.status(error.statusCode || 500).json({ message: error.message });
  }
  next(error);
};
 
// eslint-disable-next-line no-unused-vars
const errorHandler = async (err, req, res, next) => {
  let statusCode = err.statusCode ?? err.status;
  let message = err.message;
 
  if (config.env === 'production' && !err.isOperational) {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    message = message || httpStatus[httpStatus.INTERNAL_SERVER_ERROR];
  }
 
  // Ensure statusCode is always a valid integer (Express requirement)
  const DEFAULT_STATUS = 500;
  const code = Number.isInteger(statusCode) && statusCode >= 100 && statusCode < 600
    ? statusCode
    : DEFAULT_STATUS;
  const msg = message || (typeof httpStatus[code] === 'string' ? httpStatus[code] : 'Internal Server Error');
 
  // Save error to DB
  try {
    await logErrorToDB(err, req.originalUrl, {
      method: req.method,
      body: req.body,
      user: req.user || null,
    });
  } catch (logErr) {
    console.error('❌ Failed to write error to DB:', logErr);
  }
 
  res.status(code).json({
    code,
    message: msg,
    ...(config.env === 'development' && { stack: err.stack }),
  });
};
 
module.exports = {
  errorConverter,
  errorHandler,
};