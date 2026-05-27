const httpStatus = require('../../utils/httpStatus');
const pick = require('../../utils/pick');
const ApiError = require('../../utils/ApiError');
const catchAsync = require('../../utils/catchAsync');
const { translationService } = require('../../services');
const Response = require('../../config/response');

const createTranslation = catchAsync(async (req, res) => {
  const settings = await translationService.createTranslation(req.body);
  const response = Response(true, settings, 'Success');
  res.status(httpStatus.CREATED).send(response);
});

const getlanguageByCode = catchAsync(async (req, res) => {
  const language = await translationService.convertNavigationData();
  if (!language) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Translation not found');
  }
  const response = Response(true, language, 'Success');
  res.status(httpStatus.OK).send(response);
});

// Return raw dictionary JSON for a given language code (e.g. en, fr, ar)
// This is used by the frontend to load translations dynamically without rebuild.
const getDictionaryByCode = catchAsync(async (req, res) => {
  const { code } = req.params;

  if (!code) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Language code is required');
  }

  const dictionary = await translationService.getLanguageByCode(code.toLowerCase());

  if (!dictionary) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Translation dictionary not found');
  }

  const response = Response(true, dictionary, 'Success');
  res.status(httpStatus.OK).send(response);
});

const getActivelanguage = catchAsync(async (req, res) => {
  const language = await translationService.getActiveLanguagecode();
  if (!language) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Translation not found');
  }
  const response = Response(true, language, 'Success');
  res.status(httpStatus.OK).send(response);
});

const getActivelanguageAndId = catchAsync(async (req, res) => {
  const language = await translationService.getActiveLanguageCodeAndId(req);
  if (!language) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Translation not found');
  }
  const response = Response(true, language, 'Success');
  res.status(httpStatus.OK).send(response);
});

const getMobilelanguageByCode = catchAsync(async (req, res) => {
  const language = await translationService.convertMobileNavigationData();
  if (!language) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Translation not found');
  }
  const response = Response(true, language, 'Success');
  res.status(httpStatus.OK).send(response);
});

const getlanguageWithOutPagination = catchAsync(async (req, res) => {
  const language = await translationService.getLanguage();
  if (!language) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Translation not found');
  }
  const response = Response(true, language, 'Success');
  res.status(httpStatus.OK).send(response);
});

const deleteTranslation = catchAsync(async (req, res) => {
  const translation = await translationService.deleteTranslation(req.params.key, req.query.scope);
  const response = Response(true, translation, 'Success');
  res.status(httpStatus.OK).send(response);
});

const translateText = catchAsync(async (req, res) => {
  const { text, targetLanguage, sourceLanguage } = req.body;
  const result = await translationService.translateText(text, targetLanguage, sourceLanguage);
  const response = Response(true, result, 'Success');
  res.status(httpStatus.OK).send(response);
});

module.exports = {
  getlanguageWithOutPagination,
  getlanguageByCode,
  getMobilelanguageByCode,
  createTranslation,
  getActivelanguage,
  deleteTranslation,
  getActivelanguageAndId,
  translateText,
  getDictionaryByCode,
};
