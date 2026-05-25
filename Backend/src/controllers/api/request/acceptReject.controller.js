const httpStatus = require('http-status');
const pick = require('../../../utils/pick');
const ApiError = require('../../../utils/ApiError');
const catchAsync = require('../../../utils/catchAsync');
const { acceptReject } = require('../../../services');
const Response = require('../../../config/response');

const respondTrip = catchAsync(async (req, res) => {
  const request = await acceptReject.respondTrip(req);
  if (!request) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Request not found');
  }
  const response = Response(true, request, "Success");
  res.status(httpStatus.OK).send(response);
});

const respondBiddingTrip = catchAsync(async (req, res) => {
  const request = await acceptReject.respondTrip(req);
  if (!request) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Request not found');
  }
  const response = Response(true, request, "Success");
  res.status(httpStatus.OK).send(response);
});

const locationChangeTrip = catchAsync(async (req, res) => {
  const request = await acceptReject.locationChangeTrip(req);
  if (!request) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Request not found');
  }
  const response = Response(true, request, "Success");
  res.status(httpStatus.OK).send(response);
});


const requestBidList = catchAsync(async (req, res) => {
  const request = await acceptReject.RequestViewList(req.params.requestId);
  if (!request) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Request not found');
  }
  const response = Response(true, request, "Success");
  res.status(httpStatus.OK).send(response);
});


const UserRequestBiddingList = catchAsync(async (req, res) => {
  const request = await acceptReject.getUserRequests(req);
  if (!request) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Request not found');
  }
  const response = Response(true, request, "Success");
  res.status(httpStatus.OK).send(response);
});

const UserRequestAllBiddingList = catchAsync(async (req, res) => {
  const request = await acceptReject.getUserAllRequests(req);
  if (!request) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Request not found');
  }
  const response = Response(true, request, "Success");
  res.status(httpStatus.OK).send(response);
});


const UpdateBidAmount = catchAsync(async(req,res) => {
  const updateBidAmount = await acceptReject.UpdateBidAmount(req);
  const response = Response(true, updateBidAmount, "Success");
  res.status(httpStatus.OK).send(response);
});

const AssignRequest = catchAsync(async(req,res) => {
  const AssignRequest = await acceptReject.AssignRequest(req);
  const response = Response(true, AssignRequest[0], "Trip Assigned Successfully");
  res.status(httpStatus.OK).send(response);
});

const DriverBidList = catchAsync(async(req,res) => {
  const AssignRequest = await acceptReject.driverRequestViewList(req);
  const response = Response(true, AssignRequest, "Trip Assigned Successfully");
  res.status(httpStatus.OK).send(response);
});

module.exports = {
  respondTrip,
  respondBiddingTrip,
  locationChangeTrip,
  requestBidList,
  UserRequestBiddingList,
  UserRequestAllBiddingList,
  UpdateBidAmount,
  AssignRequest,
  DriverBidList
};
