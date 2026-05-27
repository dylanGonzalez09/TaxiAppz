const httpStatus = require('http-status').default || require('http-status').status || require('http-status');
const { ObjectId } = require('mongodb');
const pick = require('../../../utils/pick');
const ApiError = require('../../../utils/ApiError');
const catchAsync = require('../../../utils/catchAsync');
const { advertisementService } = require('../../../services');
const Response = require('../../../config/response');
const { tokenService } = require('../../../services');

const { getUserId, getClientId, getDriverId } = require('../../../utils/commonFunction');

const createAdvertisement = catchAsync(async (req, res) => {
  let clientId;

  if (!req.headers.clientid) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ClientID not found');
  } else {
    clientId = req.headers.clientid;
    req.body.clientId = clientId;
  }

  if (!req.file) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Image is required');
  }

  req.body.image = req.file.filename;

  const advertisement = await advertisementService.createAdvertisement(req.body);
  const response = Response(true, advertisement, 'Success');
  res.status(httpStatus.CREATED).send(response);
});

const getAdvertisements = catchAsync(async (req, res) => {
  const clientId = req.headers.clientid;
  const zoneId = req.headers.zoneid;

  if (!clientId || !zoneId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Missing clientId or zoneId in headers');
  }

  const filter = pick(req.query, ['title', 'userType']); // Changed 'name' to 'title'
  const options = pick(req.query, ['sortBy', 'limit', 'page'], { allowDiskUse: true });

  if (req.query.search) {
    filter.$or = [
      { title: { $regex: req.query.search, $options: 'i' } }, // Changed 'name' to 'title'
    ];
  }

  filter.clientId = new ObjectId(clientId);
  filter.zoneId = new ObjectId(zoneId);

  const result = await advertisementService.queryAdvertisement(filter, options, clientId, zoneId);

  const response = Response(true, result, 'Success');
  res.status(httpStatus.OK).send(response);
});

const getAdvertisement = catchAsync(async (req, res) => {
  const advertisement = await advertisementService.getAdvertisementById(req.params.advertisementId);
  if (!advertisement) {
    throw new ApiError(httpStatus.NOT_FOUND, 'advertisement not found');
  }
  const response = Response(true, advertisement, 'Success');
  res.status(httpStatus.OK).send(response);
});

const getAdvertisementWithOutPagination = catchAsync(async (req, res) => {
  if (!req.headers.clientid) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ClientID not found');
  }

  if (!req.headers.zoneid) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ZoneId not found');
  }

  const clientId = req.headers.clientid;
  const zoneId = req.headers.zoneid;

  const advertisement = await advertisementService.getAdvertisement(clientId, zoneId);
  if (!advertisement) {
    throw new ApiError(httpStatus.NOT_FOUND, 'advertisement not found');
  }
  const response = Response(true, advertisement, 'Success');
  res.status(httpStatus.OK).send(response);
});

const updateAdvertisement = catchAsync(async (req, res) => {
  if (req.file) {
    req.body.image = req.file.filename; // or req.file.path if you store full path
  }
  const advertisement = await advertisementService.updateAdvertisementById(req.params.advertisementId, req.body);
  const response = Response(true, advertisement, 'Success');
  res.status(httpStatus.OK).send(response);
});

const deleteAdvertisement = catchAsync(async (req, res) => {
  const advertisement = await advertisementService.deleteAdvertisementById(req.params.advertisementId);
  const response = Response(true, advertisement, 'Success');
  res.status(httpStatus.OK).send(response);
});

// Fixed function name
const updateAdvertisementStatus = catchAsync(async (req, res) => {
  const { advertisementId } = req.params;
  const { status } = req.body;

  const advertisement = await advertisementService.updateAdvertisementById(advertisementId, { status });

  if (!advertisement) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Advertisement not found');
  }

  const response = Response(true, advertisement, 'Advertisement status updated successfully');
  res.status(httpStatus.OK).send(response);
});

const getDriverAdvertisementWithoutPagination = catchAsync(async (req, res) => {
  const clientId = req.headers.clientid;
  const zoneId = req.headers.zoneid;

  if (!clientId || !zoneId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Missing clientId or zoneId in headers');
  }

  const result = await advertisementService.getDriverAdvertisementWithoutPagination(clientId, zoneId);
  const response = Response(true, result, 'Success');
  res.status(httpStatus.OK).send(response);
});

const getUserAdvertisementWithoutPagination = catchAsync(async (req, res) => {
  const clientId = req.headers.clientid;

  if (!clientId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Missing clientId in headers');
  }
  const userId = await getUserId(req);

  if (!userId) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'User not authenticated');
  }

  const result = await advertisementService.getUserAdvertisementWithoutPagination(clientId, userId);
  const response = Response(true, result, 'Success');
  res.status(httpStatus.OK).send(response);
});

module.exports = {
  createAdvertisement,
  getAdvertisements,
  getAdvertisement,
  getAdvertisementWithOutPagination,
  getDriverAdvertisementWithoutPagination, // Add this
  getUserAdvertisementWithoutPagination, // Add this
  updateAdvertisement,
  deleteAdvertisement,
  updateAdvertisementStatus, // Fixed export name
};
