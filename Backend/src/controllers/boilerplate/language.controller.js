const httpStatus = require('http-status');
const pick = require('../../utils/pick');
const ApiError = require('../../utils/ApiError');
const catchAsync = require('../../utils/catchAsync');
const { languagesService } = require('../../services');
const Response = require('../../config/response');

const createlanguage = catchAsync(async (req, res) => {

  if (!req.headers.clientid) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ClientID not found');
  }else{
    req.body.clientId = req.headers.clientid;
  }
  const language = await languagesService.createLanguage(req.body);
  const response = Response(true, language, "Success");
  res.status(httpStatus.CREATED).send(response);
});

const getlanguages = catchAsync(async (req, res) => {
  const clientId = req.params.clientId; 

  const filter = pick(req.query, ['name', 'code', 'role']); 

  if (clientId) {
    filter.clientId = clientId; 
  }
  const options = pick(req.query, ['sortBy', 'limit', 'page'], { allowDiskUse: true });

  if (req.query.search) {
    filter.$or = [
      { name:  {$regex: '^'+req.query.search,$options: 'i'} },
      { code: { $regex: '^'+req.query.search,$options: 'i' } },
    ];
  }
  const result = await languagesService.queryLanguage(filter, options, clientId);

  const response = Response(true, result, "Success");
  res.status(httpStatus.OK).send(response);
});

const getlanguage = catchAsync(async (req, res) => {
  const language = await languagesService.getLauguageById(req.params.languageId);
  if (!language) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Language not found');
  }
  const response = Response(true, language, "Success");
  res.status(httpStatus.OK).send(response);
});

const getlanguageByCode = catchAsync(async (req, res) => {
  const language = await languagesService.getLauguageByCode(req.params.code);
  if (!language) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Language not found');
  }
  const response = Response(true, language, "Success");
  res.status(httpStatus.OK).send(response);
});

const getlanguageWithOutPagination = catchAsync(async (req, res) => {
  if (!req.headers.clientid) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ClientID not found');
  }
  const language = await languagesService.getLanguage(req.headers.clientid);
  if (!language) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Language not found');
  }
  const response = Response(true, language, "Success");
  res.status(httpStatus.OK).send(response);
});

const getlanguageActiveWithOutPagination = catchAsync(async (req, res) => {
  if (!req.headers.clientid) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ClientID not found');
  }
  const language = await languagesService.getLanguageByActive(req.headers.clientid);
  if (!language) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Language not found');
  }
  const response = Response(true, language, "Success");
  res.status(httpStatus.OK).send(response);
});

const getlanguageIntroWithOutPagination = catchAsync(async (req, res) => {

  const language = await languagesService.getIntroLanguage();
  if (!language) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Language not found');
  }
  const response = Response(true, language, "Success");
  res.status(httpStatus.OK).send(response);
});

const updatelanguage = catchAsync(async (req, res) => {
  const language = await languagesService.updateLanguageById(req.params.languageId, req.body);
  const response = Response(true, language, "Success");
  res.status(httpStatus.OK).send(response);
});

const deletelanguage = catchAsync(async (req, res) => {
  const language = await languagesService.deletelanguageById(req.params.languageId);
  const response = Response(true, language, "Success");
  res.status(httpStatus.OK).send(response);
});

const updateLanguageStatus = catchAsync(async (req, res) => {
  const languageId = req.params.languageId;
  const { status } = req.body;

  const language = await languagesService.updateLanguageById(languageId, { status });

  if (!language) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Language not found');
  }

  const response = Response(true, language, "Language status updated successfully");
  res.status(httpStatus.OK).send(response);
});

module.exports = {
  createlanguage,
  getlanguages,
  getlanguage,
  getlanguageWithOutPagination,
  getlanguageActiveWithOutPagination,
  getlanguageIntroWithOutPagination,
  updatelanguage,
  deletelanguage,
  updateLanguageStatus,
  getlanguageByCode
};
