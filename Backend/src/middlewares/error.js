const mongoose = require('mongoose');
const httpStatus = require('http-status');
const config = require('../config/config');
const logger = require('../config/logger');
const ApiError = require('../utils/ApiError');
const logErrorToDB = require('../utils/logError'); // Adjust path if needed

const errorConverter = (err, req, res, next) => {
  let error = err;
  if (!(error instanceof ApiError)) {
    const statusCode =
      error.statusCode || error instanceof mongoose.Error ? httpStatus.BAD_REQUEST : httpStatus.INTERNAL_SERVER_ERROR;
    const message = error.message || httpStatus[statusCode];
    error = new ApiError(statusCode, message, false, err.stack);
  }
  next(error);
};

// eslint-disable-next-line no-unused-vars
const errorHandler = async (err, req, res, next) => {
  let { statusCode, message } = err;

  if (config.env === 'production' && !err.isOperational) {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    message = httpStatus[httpStatus.INTERNAL_SERVER_ERROR];
  }


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

  res.status(statusCode).json({
    code: statusCode,
    message,
    ...(config.env === 'development' && { stack: err.stack }),
  });
};

module.exports = {
  errorConverter,
  errorHandler,
};
