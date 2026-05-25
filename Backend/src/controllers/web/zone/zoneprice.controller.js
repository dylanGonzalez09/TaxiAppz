const httpStatus = require('http-status');
const pick = require('../../../utils/pick');
const ApiError = require('../../../utils/ApiError');
const catchAsync = require('../../../utils/catchAsync');
const { zonePriceService } = require('../../../services');
const Response = require('../../../config/response');

const createZonePrice = catchAsync(async (req, res) => {
  const zonePrice = await zonePriceService.createZonePrice(req.body);
  const response = Response(true, zonePrice, "Success");
  res.status(httpStatus.CREATED).send(response);
});

const getZonePrices = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await zonePriceService.queryZonePrice(filter, options);
  const response = Response(true, result, "Success");
  res.status(httpStatus.OK).send(response);
});

const getZonePrice = catchAsync(async (req, res) => {
  const zonePrice = await zonePriceService.getZonePriceById(req.params.zonePriceId);
  if (!zonePrice) {
    throw new ApiError(httpStatus.NOT_FOUND, 'zonePrice not found');
  }
  const response = Response(true, zonePrice, "Success");
  res.status(httpStatus.OK).send(response);
});

const getZonePriceWithOutPagination = catchAsync(async (req, res) => {
  const zonePrice = await zonePriceService.getZonePrice();
  if (!zonePrice) {
    throw new ApiError(httpStatus.NOT_FOUND, 'zonePrice not found');
  }
  const response = Response(true, zonePrice, "Success");
  res.status(httpStatus.OK).send(response);
});

const updateZonePrice = catchAsync(async (req, res) => {
  const zonePrice = await zonePriceService.updateZonePriceById(req.params.zonePriceId, req.body);
  const response = Response(true, zonePrice, "Success");
  res.status(httpStatus.OK).send(response);
});

const deleteZonePrice = catchAsync(async (req, res) => {
  const zone = await zonePriceService.deleteZonePriceById(req.params.zonePriceId);
  const response = Response(true, zone, "Success");
  res.status(httpStatus.OK).send(response);
});

module.exports = {
  createZonePrice,
  getZonePrices,
  getZonePrice,
  getZonePriceWithOutPagination,
  updateZonePrice,
  deleteZonePrice,
};
