const httpStatus = require('http-status').default || require('http-status').status || require('http-status');
const pick = require('../../../utils/pick');
const ApiError = require('../../../utils/ApiError');
const catchAsync = require('../../../utils/catchAsync');
const { mobilsubscriptionService } = require('../../../services');
const Response = require('../../../config/response');
const { getDriverId } = require('../../../utils/commonFunction');


const createSubScription = catchAsync(async (req, res) => {
  const subscription = await mobilsubscriptionService.createSubScription(req.body);
  const response = Response(true, subscription, 'Success');
  res.status(httpStatus.CREATED).send(response);
});

const getSubScriptions = catchAsync(async (req, res) => {
  const filter = pick(req.query, [ 'validityPeriod', 'name', 'role', 'zoneId']);

  const options = pick(req.query, ['sortBy', 'limit', 'page'], { allowDiskUse: true });
  if (req.query.search) {
    const searchValue = req.query.search;
    filter.$or = [
      { validityPeriod: { $regex: searchValue, $options: 'i' } },
      { name: { $regex: searchValue, $options: 'i' } },
    ].filter(Boolean);
  }



  const result = await mobilsubscriptionService.querySubScription(filter, options);

  const response = Response(true, result, 'Success');
  res.status(httpStatus.OK).send(response);
});

const getSubScription = catchAsync(async (req, res) => {
  const subScription = await mobilsubscriptionService.getSubScriptionById(req.params.subScriptionId);
  if (!subScription) {
    throw new ApiError(httpStatus.NOT_FOUND, 'subScription not found');
  }
  const response = Response(true, subScription, 'Success');
  res.status(httpStatus.OK).send(response);
});

const getSubScriptionWithOutPagination = catchAsync(async (req, res) => {
  const driverId = await getDriverId(req);
  const filter = pick(req.query, ['zoneId']);

  const subScription = await mobilsubscriptionService.getSubScription(filter,driverId);
  if (!subScription) {
    throw new ApiError(httpStatus.NOT_FOUND, 'subScription not found');
  }
  const response = Response(true, subScription, 'Success');
  res.status(httpStatus.OK).send(response);
});

const updateSubScription = catchAsync(async (req, res) => {
  const subScription = await mobilsubscriptionService.updateSubScriptionById(req.params.subScriptionId, req.body);
  const response = Response(true, subScription, 'Success');
  res.status(httpStatus.OK).send(response);
});

const deleteSubScription = catchAsync(async (req, res) => {
  const subScription = await mobilsubscriptionService.deleteSubScriptionnById(req.params.subScriptionId);
  const response = Response(true, subScription, 'Success');
  res.status(httpStatus.OK).send(response);
});

const updateSubScriptionStatus = catchAsync(async (req, res) => {
  const { subScriptionId } = req.params;
  const { status } = req.body;

  const subScription = await mobilsubscriptionService.updateSubScriptionById(subScriptionId, { status });

  if (!subScription) {
    throw new ApiError(httpStatus.NOT_FOUND, 'subScription not found');
  }

  const response = Response(true, subScription, 'subScription status updated successfully');
  res.status(httpStatus.OK).send(response);
});

module.exports = {
  createSubScription,
  getSubScriptions,
  getSubScription,
  updateSubScription,
  deleteSubScription,
  getSubScriptionWithOutPagination,
  updateSubScriptionStatus,
};
