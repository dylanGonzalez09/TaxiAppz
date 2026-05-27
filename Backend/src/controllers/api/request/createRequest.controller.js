const httpStatus = require('http-status').default || require('http-status').status || require('http-status');
const path = require('path');
const fs = require('fs');
const pick = require('../../../utils/pick');
const ApiError = require('../../../utils/ApiError');
const catchAsync = require('../../../utils/catchAsync');
const { mobilecreateTrip, mobilerequestService, userService, tokenService } = require('../../../services');
const Response = require('../../../config/response');
const mqttService = require('../../../services/mqtt/mqtt.service');
const { User, Request, Settings } = require('../../../models');
const { getUserId, getClientId, getDriverId } = require('../../../utils/commonFunction');
const { mqttConfig } = require('../../../config/string');

const createTrip = catchAsync(async (req, res) => {
  const request = await mobilecreateTrip.createTrips(req);

  if (!request) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Request not found');
  }

  const response = Response(true, request, 'Success');
  res.status(httpStatus.OK).send(response);
});

const createDispatcher = catchAsync(async (req, res) => {
  console.log({reqBody:req.body});
  const request = await mobilecreateTrip.createDispatcher(req);

  if (!request) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Request not found');
  }
  const response = Response(true, request, 'Success');
  res.status(httpStatus.OK).send(response);
});

const getRequestpagination = catchAsync(async (req, res) => {

  const userId = await getUserId(req);

  if (!userId) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'User not authenticated');
  }
  const user = await User.findOne({ _id: userId }).select('zoneId');

  const userZoneIds = Array.isArray(user.zoneId) ? user.zoneId : [user.zoneId];
  const filter = pick(req.query, ['name', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);

  // filter.zoneId = { $in: userZoneIds };

  const request = await mobilecreateTrip.getRequestpagination(req, filter, options);
  if (!request) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Request not found');
  }

  const response = Response(true, request, 'Success');
  res.status(httpStatus.OK).send(response);
});

const getDriverRequestpagination = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const request = await mobilecreateTrip.getDriverRequestpagination(req, filter, options);

  if (!request) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Request not found');
  }
  const response = Response(true, request, 'Success');
  res.status(httpStatus.OK).send(response);
});


const uploadImage = catchAsync(async (req, res) => {
    const userId = req.body.userId
  if (!req.file) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'No image uploaded');
  }
  const userTopic = `${mqttConfig.USER_REQUEST}${userId.toString()}`;

  await mqttService.publishMessage(
     userTopic,
    JSON.stringify({
      title: 'UPLOAD_IMAGE',
      message: 'Uploaded Image',
      meter: `${req.body.meter}`,
      image: `/uploads/trips/${req.file.filename}`,
    }),
  );

  const response = Response(true, { imagename: req.file.filename }, 'Image uploaded successfully');
  res.status(httpStatus.OK).send(response);
  // Construct image URL (assuming a static folder is served)
});

const deleteImage = catchAsync(async (req, res) => {
  const { filename } = req.params;

  const filePath = path.join(__dirname, '../../../../uploads/trips/', filename);

  // Check if the file exists
  if (!fs.existsSync(filePath)) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Image not found');
  }

  // Delete the file
  fs.unlink(filePath, (err) => {
    if (err) {
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error deleting image');
    }

    const response = Response(true, null, 'Image deleted successfully');
    res.status(httpStatus.OK).send(response);
  });
});

module.exports = {
  createTrip,
  createDispatcher,
  getRequestpagination,
  getDriverRequestpagination,
  uploadImage,
  deleteImage,
};
