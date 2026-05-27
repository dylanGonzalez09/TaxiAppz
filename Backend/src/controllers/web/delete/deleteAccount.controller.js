const httpStatus = require('http-status').default || require('http-status').status || require('http-status');
const ApiError = require('../../../utils/ApiError');
const catchAsync = require('../../../utils/catchAsync');
const { deleteAccountService } = require('../../../services');
const Response = require('../../../config/response');

const sendOTP = catchAsync(async (req, res) => {
  const data = await deleteAccountService.sendOTP(req);
  const response = Response(true, data, 'Success');
  res.status(httpStatus.OK).send(response);
});

const deleteAccount = catchAsync(async (req, res) => {
  const data = await deleteAccountService.deleteAccount(req);
  const response = Response(true, data, 'Success');
  res.status(httpStatus.OK).send(response);
});

module.exports = {
  sendOTP,
  deleteAccount,
};
