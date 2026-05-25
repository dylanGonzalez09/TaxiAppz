const httpStatus = require('http-status');
const pick = require('../../utils/pick');
const ApiError = require('../../utils/ApiError');
const catchAsync = require('../../utils/catchAsync');
const { translationService } = require('../../services');
const Response = require('../../config/response');

const createTranslation = catchAsync(async (req, res) => {
  const settings = await translationService.createTranslation(req.body);
  const response = Response(true, settings, "Success");
  res.status(httpStatus.CREATED).send(response);
});

const getlanguageByCode = catchAsync(async (req, res) => {
  const language = await translationService.convertNavigationData();
  if (!language) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Translation not found');
  }
  const response = Response(true, language, "Success");
  res.status(httpStatus.OK).send(response);
});



const getActivelanguage = catchAsync(async (req, res) => {
  const language = await translationService.getActiveLanguagecode();
  if (!language) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Translation not found');
  }
  const response = Response(true, language, "Success");
  res.status(httpStatus.OK).send(response);
});


const getActivelanguageAndId = catchAsync(async (req, res) => {
  const language = await translationService.getActiveLanguageCodeAndId(req);
  if (!language) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Translation not found');
  }
  const response = Response(true, language, "Success");
  res.status(httpStatus.OK).send(response);
});

const getMobilelanguageByCode = catchAsync(async (req, res) => {
  const language = await translationService.convertMobileNavigationData();
  if (!language) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Translation not found');
  }
  const response = Response(true, language, "Success");
  res.status(httpStatus.OK).send(response);
});


const getlanguageWithOutPagination = catchAsync(async (req, res) => {
  const language = await translationService.getLanguage();
  if (!language) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Translation not found');
  }
  const response = Response(true, language, "Success");
  res.status(httpStatus.OK).send(response);
});

const deleteTranslation = catchAsync(async (req, res) => {
  const translation = await translationService.deleteTranslation(req.params.key);
  const response = Response(true, translation, "Success");
  res.status(httpStatus.OK).send(response);
});


module.exports = {
  getlanguageWithOutPagination,
  getlanguageByCode,
  getMobilelanguageByCode,
  createTranslation,
  getActivelanguage,
  deleteTranslation,
  getActivelanguageAndId
};
