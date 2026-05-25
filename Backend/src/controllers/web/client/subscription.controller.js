const httpStatus = require('http-status');
const pick = require('../../../utils/pick');
const ApiError = require('../../../utils/ApiError');
const catchAsync = require('../../../utils/catchAsync');
const { subscriptionService } = require('../../../services');
const { companySubscriptionService } = require('../../../services');

const { roleService } = require('../../../services');
const Response = require('../../../config/response');

const createSubScription = catchAsync(async (req, res) => {
  const permission = await subscriptionService.createSubScription(req.body);
  const response = Response(true, permission, "Success");
  res.status(httpStatus.CREATED).send(response);
});

const getSubScriptions = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['amount', 'validityPeriod', 'name', 'role']);

  const options = pick(req.query, ['sortBy', 'limit', 'page'], { allowDiskUse: true });
  if (req.query.search) {
    const searchValue = req.query.search;
    filter.$or = [
      { validityPeriod: { $regex: searchValue, $options: 'i' } },
      { name: { $regex: searchValue, $options: 'i' } },
      { amount: isNaN(searchValue) ? { $regex: searchValue, $options: 'i' } : undefined },
    ].filter(Boolean); // Remove any undefined entries
  }

  // Convert numeric fields if applicable
  if (!isNaN(req.query.onOfDrivers)) {
    filter.onOfDrivers = parseFloat(req.query.onOfDrivers);
  }

  const result = await subscriptionService.querySubScription(filter, options);

  const response = Response(true, result, "Success");
  res.status(httpStatus.OK).send(response);
});

const getSubScription = catchAsync(async (req, res) => {
  const permission = await subscriptionService.getSubScriptionById(req.params.subScriptionId);
  if (!permission) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Permission not found');
  }
  const response = Response(true, permission, "Success");
  res.status(httpStatus.OK).send(response);
});


const getSubScriptionWithOutPagination = catchAsync(async (req, res) => {
  const subScription = await subscriptionService.getSubScription();
  if (!subScription) {
    throw new ApiError(httpStatus.NOT_FOUND, 'subScription not found');
  }
  const response = Response(true, subScription, "Success");
  res.status(httpStatus.OK).send(response);
});

const updateSubScription = catchAsync(async (req, res) => {
  const permission = await subscriptionService.updateSubScriptionById(req.params.subScriptionId, req.body);
  const response = Response(true, permission, "Success");
  res.status(httpStatus.OK).send(response);
});

const deleteSubScription = catchAsync(async (req, res) => {
  const permission = await subscriptionService.deleteSubScriptionnById(req.params.subScriptionId);
  const response = Response(true, permission, "Success");
  res.status(httpStatus.OK).send(response);
});

const updateSubScriptionStatus = catchAsync(async (req, res) => {
  const subScriptionId = req.params.subScriptionId;
  const { status } = req.body;

  const subScription = await subscriptionService.updateSubScriptionById(subScriptionId, { status });

  if (!subScription) {
    throw new ApiError(httpStatus.NOT_FOUND, 'subScription not found');
  }

  const response = Response(true, subScription, "subScription status updated successfully");
  res.status(httpStatus.OK).send(response);
});

const getClientlist = catchAsync(async (req, res) => {

  let data;

  if (!req.params.clientId) {
    data = await roleService.getSuperAdminRole();
  } else {
    data = await roleService.getDropDownsRoles(req.params.clientId);
  }
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, 'data not found');
  }

  const filter = pick(req.query, ['name', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page'], { allowDiskUse: true });
  const result = await subscriptionService.querysuperadminSubScription(filter, options);
  const response = Response(true, result, "Success");
  res.status(httpStatus.OK).send(response);

});



const getSuperadminlist = catchAsync(async (req, res) => {


  let data;

  if (!req.params.clientId) {
    data = await roleService.getSuperAdminRole();
  } else {
    data = await roleService.getDropDownsRoles(req.params.clientId);
  }
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, 'data not found');
  }

  const filter = pick(req.query, ['name', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page'], { allowDiskUse: true });
  const result = await companySubscriptionService.querysuperadminSubScription(filter, options);
  const response = Response(true, result, "Success");
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
  getSuperadminlist,
  getClientlist
};
