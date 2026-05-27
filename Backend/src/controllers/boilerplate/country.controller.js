const httpStatus = require('http-status').default || require('http-status').status || require('http-status');
const pick = require('../../utils/pick');
const ApiError = require('../../utils/ApiError');
const catchAsync = require('../../utils/catchAsync');
const { countryService } = require('../../services');
const Response = require('../../config/response');

const createCountry = catchAsync(async (req, res) => {
  const language = await countryService.createCountry(req.body);
  const response = Response(true, language, 'Success');
  res.status(httpStatus.CREATED).send(response);
});

const getCountrys = catchAsync(async (req, res) => {
  const { clientId } = req.params; // Get the clientId from the URL params
  const filter = pick(req.query, ['currency_symbol', 'dial_code', 'currency_code', 'code', 'name', 'role']);

  // Add clientId to the filter to ensure countries are fetched based on the clientId
  if (clientId) {
    filter.clientId = clientId; // Ensure the query considers the clientId
  }

  const options = pick(req.query, ['sortBy', 'limit', 'page'], { allowDiskUse: true });

  // Apply the search filter if present in the request query
  if (req.query.search) {
    filter.$or = [
      { currency_symbol: { $regex: `^${req.query.search}`, $options: 'i' } },
      { currency_code: { $regex: `^${req.query.search}`, $options: 'i' } },
      { code: { $regex: `^${req.query.search}`, $options: 'i' } },
      { name: { $regex: `^${req.query.search}`, $options: 'i' } },
    ];
  }

  // Call the country service to fetch countries with the filter and options
  const result = await countryService.queryCountrys(filter, options, clientId);
  const response = Response(true, result, 'Success');
  res.status(httpStatus.OK).send(response); // Send the response to the client
});
const getActiveCountrys = catchAsync(async (req, res) => {
  const { clientId } = req.params; // Get the clientId from the URL params
  const filter = pick(req.query, ['currency_symbol', 'dial_code', 'currency_code', 'code', 'name', 'role']);

  // Add clientId to the filter to ensure countries are fetched based on the clientId
  if (clientId) {
    filter.clientId = clientId; // Ensure the query considers the clientId
  }

  const options = pick(req.query, ['sortBy', 'limit', 'page'], { allowDiskUse: true });

  // Apply the search filter if present in the request query
  if (req.query.search) {
    filter.$or = [
      { currency_symbol: { $regex: `^${req.query.search}`, $options: 'i' } },
      { currency_code: { $regex: `^${req.query.search}`, $options: 'i' } },
      { code: { $regex: `^${req.query.search}`, $options: 'i' } },
      { name: { $regex: `^${req.query.search}`, $options: 'i' } },
    ];
  }

  // Call the country service to fetch countries with the filter and options
  const result = await countryService.queryActiveCountrys(filter, options, clientId);
  const response = Response(true, result, 'Success');
  res.status(httpStatus.OK).send(response); // Send the response to the client
});

const getCountry = catchAsync(async (req, res) => {
  const country = await countryService.getCountryById(req.params.countryId);
  if (!country) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Country not found');
  }
  const response = Response(true, country, 'Success');
  res.status(httpStatus.OK).send(response);
});

const getCountryWithOutPagination = catchAsync(async (req, res) => {
  if (!req.headers.clientid) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ClientID not found');
  }
  const country = await countryService.getCountrys(req.headers.clientid);
  if (!country) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Country not found');
  }
  const response = Response(true, country, 'Success');
  res.status(httpStatus.OK).send(response);
});

const updateCountry = catchAsync(async (req, res) => {
  const language = await countryService.updateCountryById(req.params.countryId, req.body);
  const response = Response(true, language, 'Success');
  res.status(httpStatus.OK).send(response);
});

const deleteCountry = catchAsync(async (req, res) => {
  const country = await countryService.deleteCountryById(req.params.countryId);
  const response = Response(true, country, 'Success');
  res.status(httpStatus.OK).send(response);
});

const getCountryActiveWithOutPagination = catchAsync(async (req, res) => {
  if (!req.headers.clientid) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ClientID not found');
  }
  const country = await countryService.getCountrysByActive(req.headers.clientid);
  if (!country) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Language not found');
  }
  const response = Response(true, country, 'Success');
  res.status(httpStatus.OK).send(response);
});

const updateCountryStatus = catchAsync(async (req, res) => {
  const { countryId } = req.params;
  const { status } = req.body;

  const country = await countryService.updateCountryById(countryId, { status });

  if (!country) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Country not found');
  }

  const response = Response(true, country, 'Country status updated successfully');
  res.status(httpStatus.OK).send(response);
});

const getCountries = catchAsync(async (req, res) => {
  const country = await countryService.getCountries();
  if (!country) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Country not found');
  }
  const response = Response(true, country, 'Success');
  res.status(httpStatus.OK).send(response);
});

module.exports = {
  createCountry,
  getCountrys,
  getCountry,
  getCountryWithOutPagination,
  getCountryActiveWithOutPagination,
  updateCountry,
  deleteCountry,
  updateCountryStatus,
  getCountries,
  getActiveCountrys,
};
