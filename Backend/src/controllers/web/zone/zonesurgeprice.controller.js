const httpStatus = require('http-status');
const pick = require('../../../utils/pick');
const ApiError = require('../../../utils/ApiError');
const catchAsync = require('../../../utils/catchAsync');
const { zoneSurgePriceService } = require('../../../services');
const Response = require('../../../config/response');

const createZoneSurgePrice = catchAsync(async (req, res) => {
  const zoneSurgePrice = await zoneSurgePriceService.createZoneSurgePrice(req.body);
  const response = Response(true, zoneSurgePrice, "Success");
  res.status(httpStatus.CREATED).send(response);
});

const getZoneSurgePrices = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await zoneSurgePriceService.queryZoneSurgePrice(filter, options);
  const response = Response(true, result, "Success");
  res.status(httpStatus.OK).send(response);
});

const getZoneSurgePrice = catchAsync(async (req, res) => {
  const zoneSurgePrice = await zoneSurgePriceService.getZoneSurgePriceById(req.params.zoneSurgePriceId);
  if (!zoneSurgePrice) {
    throw new ApiError(httpStatus.NOT_FOUND, 'zoneSurgePrice not found');
  }
  const response = Response(true, zoneSurgePrice, "Success");
  res.status(httpStatus.OK).send(response);
});

const getZoneSurgePriceWithOutPagination = catchAsync(async (req, res) => {
  const zoneSurgePrice = await zoneSurgePriceService.getZoneSurgePrice();
  if (!zoneSurgePrice) {
    throw new ApiError(httpStatus.NOT_FOUND, 'zonePrice not found');
  }
  const response = Response(true, zoneSurgePrice, "Success");
  res.status(httpStatus.OK).send(response);
});

const updateZoneSurgePrice = catchAsync(async (req, res) => {
  const zoneSurgePrice = await zoneSurgePriceService.updateZoneSurgePriceById(req.params.zoneSurgePriceId, req.body);
  const response = Response(true, zoneSurgePrice, "Success");
  res.status(httpStatus.OK).send(response);
});

const deleteZoneSurgePrice = catchAsync(async (req, res) => {
  const zoneSurgePrice = await zoneSurgePriceService.deleteZoneSurgePriceById(req.params.zoneSurgePriceId);
  const response = Response(true, zoneSurgePrice, "Success");
  res.status(httpStatus.OK).send(response);
});

module.exports = {
  createZoneSurgePrice,
  getZoneSurgePrices,
  getZoneSurgePrice,
  getZoneSurgePriceWithOutPagination,
  updateZoneSurgePrice,
  deleteZoneSurgePrice,
};
