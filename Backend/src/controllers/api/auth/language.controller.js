const httpStatus = require('http-status').default || require('http-status').status || require('http-status');
const pick = require('../../../utils/pick');
const ApiError = require('../../../utils/ApiError');
const catchAsync = require('../../../utils/catchAsync');
const { mobilelanguagesService } = require('../../../services');
const Response = require('../../../config/response');

const getlanguage = catchAsync(async (req, res) => {
  const language = await mobilelanguagesService.getLanguages(req);
  if (!language) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Language not found');
  }
  const response = Response(true, language, 'Success');
  res.status(httpStatus.OK).send(response);
});

const getlanguageByCode = catchAsync(async (req, res) => {
  const language = await mobilelanguagesService.getLauguageByCode(req);
  if (!language) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Language not found');
  }
  const response = Response(true, language, 'Success');
  res.status(httpStatus.OK).send(response);
});

module.exports = {
  getlanguage,
  getlanguageByCode,
};
