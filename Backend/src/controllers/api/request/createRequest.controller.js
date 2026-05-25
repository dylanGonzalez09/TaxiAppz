const httpStatus = require('http-status');
const pick = require('../../../utils/pick');
const ApiError = require('../../../utils/ApiError');
const catchAsync = require('../../../utils/catchAsync');
const { mobilecreateTrip } = require('../../../services');
const Response = require('../../../config/response');
const mqttService = require('../../../services/mqtt/mqtt.service');
const path = require('path');
const fs = require('fs');
const { mqttConfig } = require('../../../config/string');
const stripe = require('../../../config/stripe');

const createTrip = catchAsync(async (req, res) => {

  const request = await mobilecreateTrip.createTrips(req);

  if (!request) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Request not found');
  }

  const response = Response(true, request, "Success");
  res.status(httpStatus.OK).send(response);
});


const createBiddingTrip = catchAsync(async (req, res) => {

  const request = await mobilecreateTrip.createBiddingTrips(req);

  if (!request) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Request not found');
  }

  const response = Response(true, request, "Success");
  res.status(httpStatus.OK).send(response);
});

const createDispatcher = catchAsync(async (req, res) => {

  const request = await mobilecreateTrip.createDispatcher(req);

  if (!request) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Request not found');
  }
  const response = Response(true, request, "Success");
  res.status(httpStatus.OK).send(response);
});


const getRequestpagination = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const request = await mobilecreateTrip.getRequestpagination(req, filter, options);

  if (!request) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Request not found');
  }
  const response = Response(true, request, "Success");
  res.status(httpStatus.OK).send(response);
})

const getDriverRequestpagination = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const request = await mobilecreateTrip.getDriverRequestpagination(req, filter, options);

  if (!request) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Request not found');
  }
  const response = Response(true, request, "Success");
  res.status(httpStatus.OK).send(response);
});

const uploadImage = catchAsync(async (req, res) => {
  if (!req.file) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'No image uploaded');
  }

  const userTopic = mqttConfig.USER_REQUEST + "" + req.body.userId;

  mqttService.publishMessage(
    userTopic,
    JSON.stringify({
      title: "UPLOAD_IMAGE",
      message: "Uploaded Image",
      meter: `${req.body.meter}`,
      image: `/uploads/trips/${req.file.filename}`
    })
  );

  const response = Response(true, { imagename: req.file.filename }, "Image uploaded successfully");
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

    const response = Response(true, null, "Image deleted successfully");
    res.status(httpStatus.OK).send(response);
  });
});


const createPayment = catchAsync(async (req, res) => {

  const { amount, currency } = req.body;
  const request = await stripe.createPaymentIntent(amount, currency, req);

  if (!request) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Request not found');
  }

  const response = Response(true, request, "Success");
  res.status(httpStatus.OK).send(response);
});


const confirmPayment = catchAsync(async (req, res) => {

  const { paymentIntentid, currency } = req.body;
  const request = await stripe.confirmPayment(paymentIntentid, { currency },req);

  if (!request) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Request not found');
  }

  const response = Response(true, request, "Success");
  res.status(httpStatus.OK).send(response);
});


const getPaymentStatus = catchAsync(async (req, res) => {

  const { paymentIntentid } = req.body;
  const request = await stripe.getPaymentIntent(paymentIntentid);

  if (!request) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Request not found');
  }

  const response = Response(true, request, "Success");
  res.status(httpStatus.OK).send(response);
});


module.exports = {
  createTrip,
  createBiddingTrip,
  createDispatcher,
  getRequestpagination,
  getDriverRequestpagination,
  uploadImage,
  deleteImage,
  createPayment,
  confirmPayment,
  getPaymentStatus
};
