const httpStatus = require('http-status');
const pick = require('../../../utils/pick');
const ApiError = require('../../../utils/ApiError');
const catchAsync = require('../../../utils/catchAsync');
const { mobilerequestService,tokenService } = require('../../../services');
const Response = require('../../../config/response');

const getUserId = async (req) => {

  let userId = '';

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(httpStatus.UNAUTHORIZED).send({ message: 'Authorization header is missing or invalid' });
    return;
  }
  // Remove the 'Bearer ' prefix and get the token
  const token = authHeader.substring(7);

  const user = await tokenService.verifyTokenAndGetUser(token);

  userId = user.id

  return userId;
}

const getLastTripHistory = catchAsync(async (req, res) => {
  const userId = req.user._id;

  const lastTrips = await mobilerequestService.getLastTripHistory(userId);


  const response = Response(true, lastTrips, 'Data Found');
  res.status(httpStatus.OK).send(response);
});


const getRequestsInProgress = catchAsync(async (req, res) => {
  const request = await mobilerequestService.getDriverRequestInProgress(req);

  if (!request) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Request not found');
  }
  const response = Response(true, request[0], "Success");
  res.status(httpStatus.OK).send(response);
});


const userGetRequestsInProgress = catchAsync(async (req, res) => {
  const request = await mobilerequestService.geUserRequestInProgress(req);

  if (!request) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Request not found');
  }
  const response = Response(true, request[0], "Success");
  res.status(httpStatus.OK).send(response);
});


const getRequestsList = catchAsync(async (req, res) => {
  const request = await mobilerequestService.getRequestList(req);
  if (!request) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Request not found');
  }
  const response = Response(true, request, "Success");
  res.status(httpStatus.OK).send(response);
});

const checkPickUpZone = catchAsync(async (req, res) => {
  const request = await mobilerequestService.checkPickUpZone(req);
  const response = Response(true, request, "Success");
  res.status(httpStatus.OK).send(response);
});

const convertLatLngAddress = catchAsync(async (req, res) => {
  const request = await mobilerequestService.convertLatLngAddress(req);
  const response = Response(true, request, "Success");
  res.status(httpStatus.OK).send(response);
});

const convertAddressLatLng = catchAsync(async (req, res) => {
  const request = await mobilerequestService.convertAddressLatLng(req);
  const response = Response(true, request, "Success");
  res.status(httpStatus.OK).send(response);
});

const getPolygonLine = catchAsync(async (req, res) => {
  const request = await mobilerequestService.getRoutePolylines(req);
  const response = Response(true, request, "Success");
  res.status(httpStatus.OK).send(response);
});


const getRequestsListView = catchAsync(async (req, res) => {
  const request = await mobilerequestService.getRequestListView(req);
  if (!request) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Request not found');
  }
  const response = Response(true, request, "Success");
  res.status(httpStatus.OK).send(response);
});


const getTypes = catchAsync(async (req, res) => {
  try {
    const userId =await getUserId(req);
    const request = await mobilerequestService.getRideTypes(userId, req);

    const response = Response(true, request, 'eta retrieved successfully');

    return res.status(200).json(response);
  } catch (error) {
    const response = Response(true, error.message, error.message);

    return res.status(403).json(response);
  }
});


module.exports = {
  getRequestsInProgress,
  getRequestsList,
  getRequestsListView,
  userGetRequestsInProgress,
  getLastTripHistory,
  getTypes,
  checkPickUpZone,
  convertLatLngAddress,
  convertAddressLatLng,
  getPolygonLine
};
