const httpStatus = require('http-status').default || require('http-status').status || require('http-status');
const pick = require('../../../utils/pick');
const ApiError = require('../../../utils/ApiError');
const catchAsync = require('../../../utils/catchAsync');
const { mobilesosService } = require('../../../services');
const Response = require('../../../config/response');

const createSos = catchAsync(async (req, res) => {
  const sos = await mobilesosService.createSos(req);
  const response = Response(true, sos, 'Success');
  res.status(httpStatus.CREATED).send(response);
});

const getSoss = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await mobilesosService.querySoss(filter, options, req);
  const response = Response(true, result, 'Success');
  res.status(httpStatus.OK).send(response);
});

const getSos = catchAsync(async (req, res) => {
  const sos = await mobilesosService.getSosById(req.params.sosId);
  if (!sos) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Sos not found');
  }
  const response = Response(true, sos, 'Success');
  res.status(httpStatus.OK).send(response);
});

const getSosWithOutPagination = catchAsync(async (req, res) => {
  const sos = await mobilesosService.getSoss(req);
  if (!sos) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Sos not found');
  }
  const response = Response(true, sos, 'Success');
  res.status(httpStatus.OK).send(response);
});

const updateSos = catchAsync(async (req, res) => {
  const sos = await mobilesosService.updateSosById(req.params.sosId, req.body);
  const response = Response(true, sos, 'Success');
  res.status(httpStatus.OK).send(response);
});

const deleteSos = catchAsync(async (req, res) => {
  const sos = await mobilesosService.deleteSosById(req.params.sosId);
  const response = Response(true, sos, 'Success');
  res.status(httpStatus.OK).send(response);
});

module.exports = {
  createSos,
  getSoss,
  getSos,
  getSosWithOutPagination,
  updateSos,
  deleteSos,
};
