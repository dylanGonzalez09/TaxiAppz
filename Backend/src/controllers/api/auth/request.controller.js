const httpStatus = require('http-status').default || require('http-status').status || require('http-status');
const pick = require('../../../utils/pick');
const ApiError = require('../../../utils/ApiError');
const catchAsync = require('../../../utils/catchAsync');
const { mobilerequestService,tokenService } = require('../../../services');
const Response = require('../../../config/response');
const { Settings } = require('../../../models');
const {getUserId,getClientId,getDriverId} = require('../../../utils/commonFunction')

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

  const driverBlockWalletLimit = await Settings.findOne({ name: 'driverBlockWalletBalance' });
  const referalRepeat = await Settings.findOne({ name: 'referalRepeat' });

  if (driverBlockWalletLimit && driverBlockWalletLimit?.value) {

      if(request[0]?.driver?.walletBalance < driverBlockWalletLimit?.value){
         request[0].driver.blockWallet = true
         request[0].driver.minimumWalletBalance = Number(driverBlockWalletLimit?.value)
      }else{
        request[0].driver.blockWallet = false
      }
  }

  if(referalRepeat && referalRepeat?.value){
    request[0].enableReferral = referalRepeat?.value === 'yes' ? true : false
  }


  const response = Response(true, request[0], "Success");

  res.status(httpStatus.OK).send(response);
});


const userGetRequestsInProgress = catchAsync(async (req, res) => {
  const request = await mobilerequestService.geUserRequestInProgress(req);

  const referalRepeat = await Settings.findOne({ name: 'referalRepeat' });

  if(referalRepeat && referalRepeat?.value){
    request[0].enableReferral = referalRepeat?.value === 'yes' ? true : false
  }

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

const getAllPolygonLine = catchAsync(async (req, res) => {
  const request = await mobilerequestService.getAllRoutePolylines(req);
  const response = Response(true, request, "Success");
  res.status(httpStatus.OK).send(response);
});

const getAllTravelTime = catchAsync(async (req, res) => {
  const request = await mobilerequestService.getTravalTime(req);
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
    const userId = await getUserId(req);
    const result = await mobilerequestService.getRideTypes(userId, req);

    if (result?.status && result?.status !== 200) {
      return res.status(result.status).json(result.data);
    }


    const response = Response(true, result, 'ETA retrieved successfully');
    return res.status(200).json(response);

  } catch (error) {
    console.error('Error:', error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Something went wrong',
      code: error.statusCode || 500
    });
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
  getPolygonLine,
  getAllPolygonLine,
  getAllTravelTime
};
