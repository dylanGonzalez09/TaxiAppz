const ApiError = require('../../../utils/ApiError');
const httpStatus = require('http-status');
const ObjectId = require('mongoose').Types.ObjectId
const { 
  User, 
  Driver, 
  Request, 
  RequestPlace, 
  Rental, 
  RequestMeta, 
  Users, 
  Vehicle, 
  Country, 
  ZonePrice, 
  PromoCode, 
  requestListView 
} = require('../../../models');

const { tokenService } = require('../../../services');
const { 
  webGetPickupZone, 
  webGetDropZone, 
  calculateDistance, 
  calculateZonePrices, 
  createDataResponse,
  webCalculateZonePrices,
  generateRequestNumber,
  uniqueRandomNumbers,
  fetchDriver,
  sendPushNotification,
  getPickupZone
} = require('../../../utils/commonFunction')
const moment = require('moment');
const mongoose = require('mongoose');
const axios = require('axios');
const { pipeline } = require('form-data');
const mqttService = require('../../../services/mqtt/mqtt.service');
const { mqttConfig } = require('../../../config/string');

/**
  from the mobile side they need to send Client Id and Code (Version code)
  1. Check the Version Available or not if not redirect to update screen 
  2. check the avaliable languages for client send the avaliable languages 
 */
const getClientId = async (req) => {

  clientId = '';

  if (!req.headers.clientid) {

    throw new ApiError(httpStatus.NOT_FOUND, 'ClientID not found');

  } else {

    clientId = req.headers.clientid;

  }

  return clientId;
}

const sendError = (message, data, code) => ({
    success: false,
    message,
    data,
    code,
});
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


const getUserPhoneNumber = async (req) => {
  if (req.params && req.params.phoneNumber) {
    return req.params.phoneNumber;
  }

  throw new Error('Phone number not found in the request');

};

/**
 * Create a request
 * @param {Object} requestBody
 * @returns {Promise<Request>}
 */
const createRequest = async (requestBody) => {
  return Request.create(requestBody);
};


/**
 * Create a request
 * @param {Object} requestBody
 * @returns {Promise<RequestPlace>}
 */
const createRequestPlace = async (requestBody) => {
  return RequestPlace.create(requestBody);
};


/**
 * Query for requests
 * @param {Object} filter - MongoDB filter
 * @param {Object} options - Query options (e.g. sortBy, limit, page)
 * @returns {Promise<QueryResult>}
 */
const queryRequests = async (filter, options) => {
  const requests = await Request.paginate(filter, options);
  return requests;
};


const getRequestByUserId = async (req) => {
  let clientId = await getClientId(req);
  let userId = req.params.userId;
  return Request.aggregate([
    {
      $match: {
        clientId: new ObjectId(clientId),
        userId: new ObjectId(userId)
      }
    },
    {
      $lookup: {
        from: 'requestbills',
        localField: '_id',
        foreignField: 'requestId',
        as: 'billingDetails'
      }
    },
    {
      $lookup: {
        from: 'requestplaces',
        localField: '_id',
        foreignField: 'requestId',
        as: 'placesDetails'
      }
    },
    {
      $lookup: {
        from: 'requestratings',
        localField: '_id',
        foreignField: 'requestId',
        as: 'ratingDetails'
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'userDetails',
      },
    },
    {
      $lookup: {
        from: 'drivers',
        localField: 'driverId',
        foreignField: '_id',
        as: 'driverDetails',
      },
    },
    {
      $unwind: {
        path: '$billingDetails',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $unwind: {
        path: '$ratingDetails',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $unwind: {
        path: '$userDetails',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $unwind: {
        path: '$driverDetails',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'driverDetails.userId',
        foreignField: '_id',
        as: 'driverPersonalDetails',
      },
    },
    {
      $lookup: {
        from: 'vehicles',
        localField: 'driverDetails.type',
        foreignField: '_id',
        as: 'vehicleDetails',
      },
    },
    {
      $lookup: {
        from: 'vehiclemodels',
        localField: 'driverDetails.carModel',
        foreignField: '_id',
        as: 'vehicleModelDetails',
      },
    },
    {
      $unwind: {
        path: '$driverPersonalDetails',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $unwind: {
        path: '$vehicleDetails',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $unwind: {
        path: '$vehicleModelDetails',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        placesDetails: 1,
        requestNumber: { $ifNull: ['$requestNumber', null] },
        requestOtp: { $ifNull: ['$requestOtp', null] },
        isLater: { $ifNull: ['$isLater', null] },
        isInstantTrip: { $ifNull: ['$isInstantTrip', null] },
        ifDispatch: { $ifNull: ['$ifDispatch', null] },
        zoneTypeId: { $ifNull: ['$zoneTypeId', null] },
        userId: { $ifNull: ['$userId', null] },
        driverId: { $ifNull: ['$driverId', null] },
        tripStartTime: { $ifNull: ['$tripStartTime', null] },
        arrivedAt: { $ifNull: ['$arrivedAt', null] },
        acceptedAt: { $ifNull: ['$acceptedAt', null] },
        completedAt: { $ifNull: ['$completedAt', null] },
        cancelledAt: { $ifNull: ['$cancelledAt', null] },
        isDriverStarted: { $ifNull: ['$isDriverStarted', null] },
        isDriverArrived: { $ifNull: ['$isDriverArrived', null] },
        isTripStart: { $ifNull: ['$isTripStart', null] },
        isCompleted: { $ifNull: ['$isCompleted', null] },
        isCancelled: { $ifNull: ['$isCancelled', null] },
        customReason: { $ifNull: ['$customReason', null] },
        cancelMethod: { $ifNull: ['$cancelMethod', null] },
        totalDistance: { $ifNull: ['$totalDistance', null] },
        totalTime: { $ifNull: ['$totalTime', null] },
        isPaid: { $ifNull: ['$isPaid', null] },
        userRated: { $ifNull: ['$userRated', null] },
        driverRated: { $ifNull: ['$driverRated', null] },
        timezone: { $ifNull: ['$timezone', null] },
        attemptForSchedule: { $ifNull: ['$attemptForSchedule', null] },
        dispatcherId: { $ifNull: ['$dispatcherId', null] },
        driverNotes: { $ifNull: ['$driverNotes', null] },
        createdBy: { $ifNull: ['$createdBy', null] },
        adminDemoKey: { $ifNull: ['$adminDemoKey', null] },
        paymentOpt: { $ifNull: ['$paymentOpt', null] },
        rideType: { $ifNull: ['$rideType', null] },
        unit: { $ifNull: ['$unit', null] },
        requestedCurrencyCode: { $ifNull: ['$requestedCurrencyCode', null] },
        requestedCurrencySymbol: { $ifNull: ['$requestedCurrencySymbol', null] },
        promoId: { $ifNull: ['$promoId', null] },
        locationApprove: { $ifNull: ['$locationApprove', null] },
        holdStatus: { $ifNull: ['$holdStatus', null] },
        availablesStatus: { $ifNull: ['$availablesStatus', null] },
        tripType: { $ifNull: ['$tripType', null] },
        rentalPackage: { $ifNull: ['$rentalPackage', null] },
        manualTrip: { $ifNull: ['$manualTrip', null] },
        outstationId: { $ifNull: ['$outstationId', null] },
        outstationTypeId: { $ifNull: ['$outstationTypeId', null] },
        packageId: { $ifNull: ['$packageId', null] },
        packageItemId: { $ifNull: ['$packageItemId', null] },
        bookingFor: { $ifNull: ['$bookingFor', null] },
        othersUserId: { $ifNull: ['$othersUserId', null] },
        clientId: { $ifNull: ['$clientId', null] },
        'driverDetails._id': { $ifNull: ['$driverDetails._id', null] },
        'driverDetails.userId': { $ifNull: ['$driverDetails.userId', null] },
        'driverDetails.carNumber': { $ifNull: ['$driverDetails.carNumber', null] },
        'driverDetails._id': { $ifNull: ['$driverPersonalDetails._id', null] },
        'driverDetails.firstName': { $ifNull: ['$driverPersonalDetails.firstName', null] },
        'driverDetails.lastName': { $ifNull: ['$driverPersonalDetails.lastName', null] },
        'driverDetails.email': { $ifNull: ['$driverPersonalDetails.email', null] },
        'driverDetails.phoneNumber': { $ifNull: ['$driverPersonalDetails.phoneNumber', null] },
        'driverDetails.emergencyNumber': { $ifNull: ['$driverPersonalDetails.emergencyNumber', null] },
        'driverDetails.gender': { $ifNull: ['$driverPersonalDetails.gender', null] },
        'driverDetails.language': { $ifNull: ['$driverPersonalDetails.language', null] },
        'driverDetails.country': { $ifNull: ['$driverPersonalDetails.country', null] },
        'driverDetails.address': { $ifNull: ['$driverPersonalDetails.address', null] },
        'driverDetails.profilePic': { $ifNull: ['$driverDetails.profilePic', null] },
        'driverDetails.active': { $ifNull: ['$driverPersonalDetails.active', null] },
        'driverDetails.clientId': { $ifNull: ['$driverPersonalDetails.clientId', null] },
        'userDetails._id': { $ifNull: ['$userDetails._id', null] },
        'userDetails.firstName': { $ifNull: ['$userDetails.firstName', null] },
        'userDetails.lastName': { $ifNull: ['$userDetails.lastName', null] },
        'userDetails.email': { $ifNull: ['$userDetails.email', null] },
        'userDetails.phoneNumber': { $ifNull: ['$userDetails.phoneNumber', null] },
        'userDetails.emergencyNumber': { $ifNull: ['$userDetails.emergencyNumber', null] },
        'userDetails.gender': { $ifNull: ['$userDetails.gender', null] },
        'userDetails.language': { $ifNull: ['$userDetails.language', null] },
        'userDetails.country': { $ifNull: ['$userDetails.country', null] },
        'userDetails.address': { $ifNull: ['$userDetails.address', null] },
        'userDetails.active': { $ifNull: ['$userDetails.active', null] },
        'userDetails.profilePic': { $ifNull: ['$userDetails.profilePic', null] },
        'userDetails.clientId': { $ifNull: ['$userDetails.clientId', null] },
        'billingDetails._id': { $ifNull: ['$billingDetails._id', null] },
        'billingDetails.basePrice': { $ifNull: ['$billingDetails.basePrice', null] },
        'billingDetails.baseDistance': { $ifNull: ['$billingDetails.baseDistance', null] },
        'billingDetails.totalDistance': { $ifNull: ['$billingDetails.totalDistance', null] },
        'billingDetails.totalTime': { $ifNull: ['$billingDetails.totalTime', null] },
        'billingDetails.pricePerDistance': { $ifNull: ['$billingDetails.pricePerDistance', null] },
        'billingDetails.distancePrice': { $ifNull: ['$billingDetails.distancePrice', null] },
        'billingDetails.pricePerTime': { $ifNull: ['$billingDetails.pricePerTime', null] },
        'billingDetails.timePrice': { $ifNull: ['$billingDetails.timePrice', null] },
        'billingDetails.waitingCharge': { $ifNull: ['$billingDetails.waitingCharge', null] },
        'billingDetails.cancellationFee': { $ifNull: ['$billingDetails.cancellationFee', null] },
        'billingDetails.serviceTax': { $ifNull: ['$billingDetails.serviceTax', null] },
        'billingDetails.serviceTaxPercentage': { $ifNull: ['$billingDetails.serviceTaxPercentage', null] },
        'billingDetails.promoDiscount': { $ifNull: ['$billingDetails.promoDiscount', null] },
        'billingDetails.adminCommission': { $ifNull: ['$billingDetails.adminCommission', null] },
        'billingDetails.adminCommissionWithTax': { $ifNull: ['$billingDetails.adminCommissionWithTax', null] },
        'billingDetails.driverCommission': { $ifNull: ['$billingDetails.driverCommission', null] },
        'billingDetails.totalAmount': { $ifNull: ['$billingDetails.totalAmount', null] },
        'billingDetails.subTotal': { $ifNull: ['$billingDetails.subTotal', null] },
        'billingDetails.outOfZonePrice': { $ifNull: ['$billingDetails.outOfZonePrice', null] },
        'billingDetails.bookingFees': { $ifNull: ['$billingDetails.bookingFees', null] },
        'billingDetails.hillStationPrice': { $ifNull: ['$billingDetails.hillStationPrice', null] },
        'ratingDetails.rating': { $ifNull: ['$ratingDetails.rating', null] },
        'ratingDetails.feedback': { $ifNull: ['$ratingDetails.feedback', null] },
        'ratingDetails.userId': { $ifNull: ['$ratingDetails.userId', null] },
        'ratingDetails.requestId': { $ifNull: ['$ratingDetails.requestId', null] },
        'ratingDetails.createdAt': { $ifNull: ['$ratingDetails.createdAt', null] },
        'ratingDetails.updatedAt': { $ifNull: ['$ratingDetails.updatedAt', null] },
        'ratingDetails.deletedAt': { $ifNull: ['$ratingDetails.deletedAt', null] },
        'vehicleDetails.vehicleName': { $ifNull: ['$vehicleDetails.vehicleName', null] },
        'vehicleDetails.image': { $ifNull: ['$vehicleDetails.image', null] },
        'vehicleDetails.capacity': { $ifNull: ['$vehicleDetails.capacity', null] },
        'vehicleDetails.serviceType': { $ifNull: ['$vehicleDetails.serviceType', null] },
        'vehicleDetails.categoryId': { $ifNull: ['$vehicleDetails.categoryId', null] },
        'vehicleDetails.sortingorder': { $ifNull: ['$vehicleDetails.sortingorder', null] },
        'vehicleDetails.highlightImage': { $ifNull: ['$vehicleDetails.highlightImage', null] },
        'vehicleDetails.status': { $ifNull: ['$vehicleDetails.status', null] },
        'vehicleDetails.clientId': { $ifNull: ['$vehicleDetails.clientId', null] },
        'vehicleModelDetails.modelname': { $ifNull: ['$vehicleModelDetails.modelname', null] },
        'vehicleModelDetails.description': { $ifNull: ['$vehicleModelDetails.description', null] },
        'vehicleModelDetails.image': { $ifNull: ['$vehicleModelDetails.image', null] },
        'vehicleModelDetails.vehicleId': { $ifNull: ['$vehicleModelDetails.vehicleId', null] },
        'vehicleModelDetails.status': { $ifNull: ['$vehicleModelDetails.status', null] },
        'vehicleModelDetails.clientId': { $ifNull: ['$vehicleModelDetails.clientId', null] }
      }
    }
  ]);
};


const getRequest = async (clientId) => {
  return Request.aggregate([
    {
      $match: { clientId: new ObjectId(clientId) }
    },
    {
      $lookup: {
        from: 'requestbills',
        localField: '_id',
        foreignField: 'requestId',
        as: 'billingDetails'
      }
    },
    {
      $lookup: {
        from: 'requestplaces',
        localField: '_id',
        foreignField: 'requestId',
        as: 'placesDetails'
      }
    },
    {
      $lookup: {
        from: 'requestratings',
        localField: '_id',
        foreignField: 'requestId',
        as: 'ratingDetails'
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'userDetails',
      },
    },
    {
      $lookup: {
        from: 'drivers',
        localField: 'driverId',
        foreignField: '_id',
        as: 'driverDetails',
      },
    },
    {
      $unwind: {
        path: '$billingDetails',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $unwind: {
        path: '$ratingDetails',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $unwind: {
        path: '$userDetails',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $unwind: {
        path: '$driverDetails',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'driverDetails.userId',
        foreignField: '_id',
        as: 'driverPersonalDetails',
      },
    },
    {
      $lookup: {
        from: 'vehicles',
        localField: 'driverDetails.type',
        foreignField: '_id',
        as: 'vehicleDetails',
      },
    },
    {
      $lookup: {
        from: 'vehiclemodels',
        localField: 'driverDetails.carModel',
        foreignField: '_id',
        as: 'vehicleModelDetails',
      },
    },
    {
      $unwind: {
        path: '$driverPersonalDetails',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $unwind: {
        path: '$vehicleDetails',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $unwind: {
        path: '$vehicleModelDetails',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        placesDetails: 1,
        requestNumber: { $ifNull: ['$requestNumber', null] },
        requestOtp: { $ifNull: ['$requestOtp', null] },
        isLater: { $ifNull: ['$isLater', null] },
        isInstantTrip: { $ifNull: ['$isInstantTrip', null] },
        ifDispatch: { $ifNull: ['$ifDispatch', null] },
        zoneTypeId: { $ifNull: ['$zoneTypeId', null] },
        userId: { $ifNull: ['$userId', null] },
        driverId: { $ifNull: ['$driverId', null] },
        tripStartTime: { $ifNull: ['$tripStartTime', null] },
        arrivedAt: { $ifNull: ['$arrivedAt', null] },
        acceptedAt: { $ifNull: ['$acceptedAt', null] },
        completedAt: { $ifNull: ['$completedAt', null] },
        cancelledAt: { $ifNull: ['$cancelledAt', null] },
        isDriverStarted: { $ifNull: ['$isDriverStarted', null] },
        isDriverArrived: { $ifNull: ['$isDriverArrived', null] },
        isTripStart: { $ifNull: ['$isTripStart', null] },
        isCompleted: { $ifNull: ['$isCompleted', null] },
        isCancelled: { $ifNull: ['$isCancelled', null] },
        customReason: { $ifNull: ['$customReason', null] },
        cancelMethod: { $ifNull: ['$cancelMethod', null] },
        totalDistance: { $ifNull: ['$totalDistance', null] },
        totalTime: { $ifNull: ['$totalTime', null] },
        isPaid: { $ifNull: ['$isPaid', null] },
        userRated: { $ifNull: ['$userRated', null] },
        driverRated: { $ifNull: ['$driverRated', null] },
        timezone: { $ifNull: ['$timezone', null] },
        attemptForSchedule: { $ifNull: ['$attemptForSchedule', null] },
        dispatcherId: { $ifNull: ['$dispatcherId', null] },
        driverNotes: { $ifNull: ['$driverNotes', null] },
        createdBy: { $ifNull: ['$createdBy', null] },
        adminDemoKey: { $ifNull: ['$adminDemoKey', null] },
        paymentOpt: { $ifNull: ['$paymentOpt', null] },
        rideType: { $ifNull: ['$rideType', null] },
        unit: { $ifNull: ['$unit', null] },
        requestedCurrencyCode: { $ifNull: ['$requestedCurrencyCode', null] },
        requestedCurrencySymbol: { $ifNull: ['$requestedCurrencySymbol', null] },
        promoId: { $ifNull: ['$promoId', null] },
        locationApprove: { $ifNull: ['$locationApprove', null] },
        holdStatus: { $ifNull: ['$holdStatus', null] },
        availablesStatus: { $ifNull: ['$availablesStatus', null] },
        tripType: { $ifNull: ['$tripType', null] },
        rentalPackage: { $ifNull: ['$rentalPackage', null] },
        manualTrip: { $ifNull: ['$manualTrip', null] },
        outstationId: { $ifNull: ['$outstationId', null] },
        outstationTypeId: { $ifNull: ['$outstationTypeId', null] },
        packageId: { $ifNull: ['$packageId', null] },
        packageItemId: { $ifNull: ['$packageItemId', null] },
        bookingFor: { $ifNull: ['$bookingFor', null] },
        othersUserId: { $ifNull: ['$othersUserId', null] },
        clientId: { $ifNull: ['$clientId', null] },
        'driverDetails._id': { $ifNull: ['$driverDetails._id', null] },
        'driverDetails.userId': { $ifNull: ['$driverDetails.userId', null] },
        'driverDetails.carNumber': { $ifNull: ['$driverDetails.carNumber', null] },
        'driverDetails._id': { $ifNull: ['$driverPersonalDetails._id', null] },
        'driverDetails.firstName': { $ifNull: ['$driverPersonalDetails.firstName', null] },
        'driverDetails.lastName': { $ifNull: ['$driverPersonalDetails.lastName', null] },
        'driverDetails.email': { $ifNull: ['$driverPersonalDetails.email', null] },
        'driverDetails.phoneNumber': { $ifNull: ['$driverPersonalDetails.phoneNumber', null] },
        'driverDetails.emergencyNumber': { $ifNull: ['$driverPersonalDetails.emergencyNumber', null] },
        'driverDetails.gender': { $ifNull: ['$driverPersonalDetails.gender', null] },
        'driverDetails.language': { $ifNull: ['$driverPersonalDetails.language', null] },
        'driverDetails.country': { $ifNull: ['$driverPersonalDetails.country', null] },
        'driverDetails.address': { $ifNull: ['$driverPersonalDetails.address', null] },
        'driverDetails.profilePic': { $ifNull: ['$driverDetails.profilePic', null] },
        'driverDetails.active': { $ifNull: ['$driverPersonalDetails.active', null] },
        'driverDetails.clientId': { $ifNull: ['$driverPersonalDetails.clientId', null] },
        'userDetails._id': { $ifNull: ['$userDetails._id', null] },
        'userDetails.firstName': { $ifNull: ['$userDetails.firstName', null] },
        'userDetails.lastName': { $ifNull: ['$userDetails.lastName', null] },
        'userDetails.email': { $ifNull: ['$userDetails.email', null] },
        'userDetails.phoneNumber': { $ifNull: ['$userDetails.phoneNumber', null] },
        'userDetails.emergencyNumber': { $ifNull: ['$userDetails.emergencyNumber', null] },
        'userDetails.gender': { $ifNull: ['$userDetails.gender', null] },
        'userDetails.language': { $ifNull: ['$userDetails.language', null] },
        'userDetails.country': { $ifNull: ['$userDetails.country', null] },
        'userDetails.address': { $ifNull: ['$userDetails.address', null] },
        'userDetails.active': { $ifNull: ['$userDetails.active', null] },
        'userDetails.profilePic': { $ifNull: ['$userDetails.profilePic', null] },
        'userDetails.clientId': { $ifNull: ['$userDetails.clientId', null] },
        'billingDetails._id': { $ifNull: ['$billingDetails._id', null] },
        'billingDetails.basePrice': { $ifNull: ['$billingDetails.basePrice', null] },
        'billingDetails.baseDistance': { $ifNull: ['$billingDetails.baseDistance', null] },
        'billingDetails.totalDistance': { $ifNull: ['$billingDetails.totalDistance', null] },
        'billingDetails.totalTime': { $ifNull: ['$billingDetails.totalTime', null] },
        'billingDetails.pricePerDistance': { $ifNull: ['$billingDetails.pricePerDistance', null] },
        'billingDetails.distancePrice': { $ifNull: ['$billingDetails.distancePrice', null] },
        'billingDetails.pricePerTime': { $ifNull: ['$billingDetails.pricePerTime', null] },
        'billingDetails.timePrice': { $ifNull: ['$billingDetails.timePrice', null] },
        'billingDetails.waitingCharge': { $ifNull: ['$billingDetails.waitingCharge', null] },
        'billingDetails.cancellationFee': { $ifNull: ['$billingDetails.cancellationFee', null] },
        'billingDetails.serviceTax': { $ifNull: ['$billingDetails.serviceTax', null] },
        'billingDetails.serviceTaxPercentage': { $ifNull: ['$billingDetails.serviceTaxPercentage', null] },
        'billingDetails.promoDiscount': { $ifNull: ['$billingDetails.promoDiscount', null] },
        'billingDetails.adminCommission': { $ifNull: ['$billingDetails.adminCommission', null] },
        'billingDetails.adminCommissionWithTax': { $ifNull: ['$billingDetails.adminCommissionWithTax', null] },
        'billingDetails.driverCommission': { $ifNull: ['$billingDetails.driverCommission', null] },
        'billingDetails.totalAmount': { $ifNull: ['$billingDetails.totalAmount', null] },
        'billingDetails.subTotal': { $ifNull: ['$billingDetails.subTotal', null] },
        'billingDetails.outOfZonePrice': { $ifNull: ['$billingDetails.outOfZonePrice', null] },
        'billingDetails.bookingFees': { $ifNull: ['$billingDetails.bookingFees', null] },
        'billingDetails.hillStationPrice': { $ifNull: ['$billingDetails.hillStationPrice', null] },
        'ratingDetails.rating': { $ifNull: ['$ratingDetails.rating', null] },
        'ratingDetails.feedback': { $ifNull: ['$ratingDetails.feedback', null] },
        'ratingDetails.userId': { $ifNull: ['$ratingDetails.userId', null] },
        'ratingDetails.requestId': { $ifNull: ['$ratingDetails.requestId', null] },
        'ratingDetails.createdAt': { $ifNull: ['$ratingDetails.createdAt', null] },
        'ratingDetails.updatedAt': { $ifNull: ['$ratingDetails.updatedAt', null] },
        'ratingDetails.deletedAt': { $ifNull: ['$ratingDetails.deletedAt', null] },
        'vehicleDetails.vehicleName': { $ifNull: ['$vehicleDetails.vehicleName', null] },
        'vehicleDetails.image': { $ifNull: ['$vehicleDetails.image', null] },
        'vehicleDetails.capacity': { $ifNull: ['$vehicleDetails.capacity', null] },
        'vehicleDetails.serviceType': { $ifNull: ['$vehicleDetails.serviceType', null] },
        'vehicleDetails.categoryId': { $ifNull: ['$vehicleDetails.categoryId', null] },
        'vehicleDetails.sortingorder': { $ifNull: ['$vehicleDetails.sortingorder', null] },
        'vehicleDetails.highlightImage': { $ifNull: ['$vehicleDetails.highlightImage', null] },
        'vehicleDetails.status': { $ifNull: ['$vehicleDetails.status', null] },
        'vehicleDetails.clientId': { $ifNull: ['$vehicleDetails.clientId', null] },
        'vehicleModelDetails.modelname': { $ifNull: ['$vehicleModelDetails.modelname', null] },
        'vehicleModelDetails.description': { $ifNull: ['$vehicleModelDetails.description', null] },
        'vehicleModelDetails.image': { $ifNull: ['$vehicleModelDetails.image', null] },
        'vehicleModelDetails.vehicleId': { $ifNull: ['$vehicleModelDetails.vehicleId', null] },
        'vehicleModelDetails.status': { $ifNull: ['$vehicleModelDetails.status', null] },
        'vehicleModelDetails.clientId': { $ifNull: ['$vehicleModelDetails.clientId', null] }
      }
    }
  ]);
};



const getRequestpagination = async (req, filter, options) => {

  const { rideType, tripStatus } = req.query;
  const limit = parseInt(options.limit, 10) || 10;
  const page = parseInt(options.page, 10) || 1;
  const clientId = await getClientId(req);

  if (rideType) {
    filter.rideType = rideType;
  }

  if (tripStatus == "") {
    filter.isDriverStarted = false;
    filter.isDriverArrived = false;
    filter.isTripStart = false;
    filter.isCancelled = false;
    filter.isCompleted = false;
  } else {
    if (tripStatus === 'isDriverStarted') {
      filter.isDriverArrived = false;
      filter.isTripStart = false;
      filter.isCancelled = false;
      filter.isCompleted = false;
    }
    else if (tripStatus === 'isDriverArrived') {
      filter.isTripStart = false;
      filter.isCancelled = false;
      filter.isCompleted = false;
    }
    else if (tripStatus === 'isTripStart') {
      filter.isCancelled = false;
      filter.isCompleted = false;
    }

    filter[tripStatus] = true;
  }

  const totalResults = await Request.countDocuments(filter);
  options.sortBy = options.sortBy || 'createdAt:desc';

  try {
    const results = await Request.aggregate([
      { $match: filter },
      {
        $lookup: {
          from: 'requestbills',
          localField: '_id',
          foreignField: 'requestId',
          as: 'billingDetails'
        }
      },
      {
        $lookup: {
          from: 'requestplaces',
          localField: '_id',
          foreignField: 'requestId',
          as: 'placesDetails'
        }
      },
      // {
      //   $lookup: {
      //     from: 'requestratings',
      //     localField: '_id',
      //     foreignField: 'requestId',
      //     as: 'ratingDetails'
      //   }
      // },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userDetails',
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'canceledBy',
          foreignField: '_id',
          as: 'cancelledByUser'
        }
      },
      {
        $lookup: {
          from: 'drivers',
          localField: 'driverId',
          foreignField: '_id',
          as: 'driverDetails',
        },
      },
      {
        $lookup: {
          from: 'drivers',
          localField: 'driverId',
          foreignField: '_id',
          as: 'driverDoc'
        }
      },


      {
        $unwind: {
          path: '$billingDetails',
          preserveNullAndEmptyArrays: true
        }
      },

      // {
      //   $unwind: {
      //     path: '$ratingDetails',
      //     preserveNullAndEmptyArrays: true
      //   }
      // },
      {
        $unwind: {
          path: '$userDetails',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: '$driverDetails',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: '$placesDetails',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'driverDetails.userId',
          foreignField: '_id',
          as: 'driverPersonalDetails',
        },
      },
      {
        $lookup: {
          from: 'vehicles',
          localField: 'driverDetails.type',
          foreignField: '_id',
          as: 'vehicleDetails',
        },
      },
      {
        $lookup: {
          from: 'vehiclemodels',
          localField: 'driverDetails.carModel',
          foreignField: '_id',
          as: 'vehicleModelDetails',
        },
      },
      {
        $unwind: {
          path: '$driverPersonalDetails',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: '$vehicleDetails',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: '$vehicleModelDetails',
          preserveNullAndEmptyArrays: true,
        },
      },
      // Lookup driver

      {
        $unwind: {
          path: '$driverDoc',
          preserveNullAndEmptyArrays: true
        }
      },



      {
        $project: {
          placesDetails: 1,
          createdAt: 1,
          requestNumber: { $ifNull: ['$requestNumber', null] },
          requestOtp: { $ifNull: ['$requestOtp', null] },
          isLater: { $ifNull: ['$isLater', null] },
          isInstantTrip: { $ifNull: ['$isInstantTrip', null] },
          ifDispatch: { $ifNull: ['$ifDispatch', null] },
          zoneTypeId: { $ifNull: ['$zoneTypeId', null] },
          userId: { $ifNull: ['$userId', null] },
          driverId: { $ifNull: ['$driverId', null] },
          tripStartTime: { $ifNull: ['$tripStartTime', null] },
          arrivedAt: { $ifNull: ['$arrivedAt', null] },
          acceptedAt: { $ifNull: ['$acceptedAt', null] },
          completedAt: { $ifNull: ['$completedAt', null] },
          cancelledAt: { $ifNull: ['$cancelledAt', null] },
          isDriverStarted: { $ifNull: ['$isDriverStarted', null] },
          isDriverArrived: { $ifNull: ['$isDriverArrived', null] },
          isTripStart: { $ifNull: ['$isTripStart', null] },
          isCompleted: { $ifNull: ['$isCompleted', null] },
          isCancelled: { $ifNull: ['$isCancelled', null] },
          customReason: { $ifNull: ['$customReason', null] },
          cancelMethod: { $ifNull: ['$cancelMethod', null] },
          totalDistance: { $ifNull: ['$totalDistance', null] },
          totalTime: { $ifNull: ['$totalTime', null] },
          isPaid: { $ifNull: ['$isPaid', null] },
          userRated: { $ifNull: ['$userRated', null] },
          driverRated: { $ifNull: ['$driverRated', null] },
          timezone: { $ifNull: ['$timezone', null] },
          attemptForSchedule: { $ifNull: ['$attemptForSchedule', null] },
          dispatcherId: { $ifNull: ['$dispatcherId', null] },
          driverNotes: { $ifNull: ['$driverNotes', null] },
          createdBy: { $ifNull: ['$createdBy', null] },
          adminDemoKey: { $ifNull: ['$adminDemoKey', null] },
          paymentOpt: { $ifNull: ['$paymentOpt', null] },
          rideType: { $ifNull: ['$rideType', null] },
          unit: { $ifNull: ['$unit', null] },
          requestedCurrencyCode: { $ifNull: ['$requestedCurrencyCode', null] },
          requestedCurrencySymbol: { $ifNull: ['$requestedCurrencySymbol', null] },
          promoId: { $ifNull: ['$promoId', null] },
          locationApprove: { $ifNull: ['$locationApprove', null] },
          holdStatus: { $ifNull: ['$holdStatus', null] },
          availablesStatus: { $ifNull: ['$availablesStatus', null] },
          tripType: { $ifNull: ['$tripType', null] },
          rentalPackage: { $ifNull: ['$rentalPackage', null] },
          manualTrip: { $ifNull: ['$manualTrip', null] },
          outstationId: { $ifNull: ['$outstationId', null] },
          outstationTypeId: { $ifNull: ['$outstationTypeId', null] },
          packageId: { $ifNull: ['$packageId', null] },
          packageItemId: { $ifNull: ['$packageItemId', null] },
          bookingFor: { $ifNull: ['$bookingFor', null] },
          othersUserId: { $ifNull: ['$othersUserId', null] },
          clientId: { $ifNull: ['$clientId', null] },
          pickLat: { $ifNull: ['$placesDetails.pickLat', null] },
          pickLng: { $ifNull: ['$placesDetails.pickLng', null] },
          pickAddress: { $ifNull: ['$placesDetails.pickAddress', null] },
          dropLat: { $ifNull: ['$placesDetails.dropLat', null] },
          dropLng: { $ifNull: ['$placesDetails.dropLng', null] },
          dropAddress: { $ifNull: ['$placesDetails.dropAddress', null] },
          cancelledByType: { $ifNull: ['$cancelledByType', null] },

          'driverDetails._id': { $ifNull: ['$driverDetails._id', null] },
          'driverDetails.userId': { $ifNull: ['$driverDetails.userId', null] },
          'driverDetails.carNumber': { $ifNull: ['$driverDetails.carNumber', null] },
          'driverDetails._id': { $ifNull: ['$driverPersonalDetails._id', null] },
          'driverDetails.firstName': { $ifNull: ['$driverPersonalDetails.firstName', null] },
          'driverDetails.lastName': { $ifNull: ['$driverPersonalDetails.lastName', null] },
          'driverDetails.email': { $ifNull: ['$driverPersonalDetails.email', null] },
          'driverDetails.phoneNumber': { $ifNull: ['$driverPersonalDetails.phoneNumber', null] },
          'driverDetails.emergencyNumber': { $ifNull: ['$driverPersonalDetails.emergencyNumber', null] },
          'driverDetails.gender': { $ifNull: ['$driverPersonalDetails.gender', null] },
          'driverDetails.language': { $ifNull: ['$driverPersonalDetails.language', null] },
          'driverDetails.country': { $ifNull: ['$driverPersonalDetails.country', null] },
          'driverDetails.address': { $ifNull: ['$driverPersonalDetails.address', null] },
          'driverDetails.profilePic': { $ifNull: ['$driverDetails.profilePic', null] },
          'driverDetails.active': { $ifNull: ['$driverPersonalDetails.active', null] },
          'driverDetails.clientId': { $ifNull: ['$driverPersonalDetails.clientId', null] },
          'userDetails._id': { $ifNull: ['$userDetails._id', null] },
          'userDetails.firstName': { $ifNull: ['$userDetails.firstName', null] },
          'userDetails.lastName': { $ifNull: ['$userDetails.lastName', null] },
          'userDetails.email': { $ifNull: ['$userDetails.email', null] },
          'userDetails.phoneNumber': { $ifNull: ['$userDetails.phoneNumber', null] },
          'userDetails.emergencyNumber': { $ifNull: ['$userDetails.emergencyNumber', null] },
          'userDetails.gender': { $ifNull: ['$userDetails.gender', null] },
          'userDetails.language': { $ifNull: ['$userDetails.language', null] },
          'userDetails.country': { $ifNull: ['$userDetails.country', null] },
          'userDetails.address': { $ifNull: ['$userDetails.address', null] },
          'userDetails.active': { $ifNull: ['$userDetails.active', null] },
          'userDetails.profilePic': { $ifNull: ['$userDetails.profilePic', null] },
          'userDetails.clientId': { $ifNull: ['$userDetails.clientId', null] },
          'billingDetails._id': { $ifNull: ['$billingDetails._id', null] },
          'billingDetails.basePrice': { $ifNull: ['$billingDetails.basePrice', null] },
          'billingDetails.baseDistance': { $ifNull: ['$billingDetails.baseDistance', null] },
          'billingDetails.totalDistance': { $ifNull: ['$billingDetails.totalDistance', null] },
          'billingDetails.totalTime': { $ifNull: ['$billingDetails.totalTime', null] },
          'billingDetails.pricePerDistance': { $ifNull: ['$billingDetails.pricePerDistance', null] },
          'billingDetails.distancePrice': { $ifNull: ['$billingDetails.distancePrice', null] },
          'billingDetails.pricePerTime': { $ifNull: ['$billingDetails.pricePerTime', null] },
          'billingDetails.timePrice': { $ifNull: ['$billingDetails.timePrice', null] },
          'billingDetails.waitingCharge': { $ifNull: ['$billingDetails.waitingCharge', null] },
          'billingDetails.cancellationFee': { $ifNull: ['$billingDetails.cancellationFee', null] },
          'billingDetails.serviceTax': { $ifNull: ['$billingDetails.serviceTax', null] },
          'billingDetails.serviceTaxPercentage': { $ifNull: ['$billingDetails.serviceTaxPercentage', null] },
          'billingDetails.promoDiscount': { $ifNull: ['$billingDetails.promoDiscount', null] },
          'billingDetails.adminCommission': { $ifNull: ['$billingDetails.adminCommission', null] },
          'billingDetails.adminCommissionWithTax': { $ifNull: ['$billingDetails.adminCommissionWithTax', null] },
          'billingDetails.driverCommission': { $ifNull: ['$billingDetails.driverCommission', null] },
          'billingDetails.totalAmount': { $ifNull: ['$billingDetails.totalAmount', null] },
          'billingDetails.subTotal': { $ifNull: ['$billingDetails.subTotal', null] },
          'billingDetails.outOfZonePrice': { $ifNull: ['$billingDetails.outOfZonePrice', null] },
          'billingDetails.bookingFees': { $ifNull: ['$billingDetails.bookingFees', null] },
          'billingDetails.hillStationPrice': { $ifNull: ['$billingDetails.hillStationPrice', null] },
          // 'ratingDetails.rating': { $ifNull: ['$ratingDetails.rating', null] },
          // 'ratingDetails.feedback': { $ifNull: ['$ratingDetails.feedback', null] },
          // 'ratingDetails.userId': { $ifNull: ['$ratingDetails.userId', null] },
          // 'ratingDetails.requestId': { $ifNull: ['$ratingDetails.requestId', null] },
          // 'ratingDetails.createdAt': { $ifNull: ['$ratingDetails.createdAt', null] },
          // 'ratingDetails.updatedAt': { $ifNull: ['$ratingDetails.updatedAt', null] },
          // 'ratingDetails.deletedAt': { $ifNull: ['$ratingDetails.deletedAt', null] },
          'vehicleDetails.vehicleName': { $ifNull: ['$vehicleDetails.vehicleName', null] },
          'vehicleDetails.image': { $ifNull: ['$vehicleDetails.image', null] },
          'vehicleDetails.capacity': { $ifNull: ['$vehicleDetails.capacity', null] },
          'vehicleDetails.serviceType': { $ifNull: ['$vehicleDetails.serviceType', null] },
          'vehicleDetails.categoryId': { $ifNull: ['$vehicleDetails.categoryId', null] },
          'vehicleDetails.sortingorder': { $ifNull: ['$vehicleDetails.sortingorder', null] },
          'vehicleDetails.highlightImage': { $ifNull: ['$vehicleDetails.highlightImage', null] },
          'vehicleDetails.status': { $ifNull: ['$vehicleDetails.status', null] },
          'vehicleDetails.clientId': { $ifNull: ['$vehicleDetails.clientId', null] },
          'vehicleModelDetails.modelname': { $ifNull: ['$vehicleModelDetails.modelname', null] },
          'vehicleModelDetails.description': { $ifNull: ['$vehicleModelDetails.description', null] },
          'vehicleModelDetails.image': { $ifNull: ['$vehicleModelDetails.image', null] },
          'vehicleModelDetails.vehicleId': { $ifNull: ['$vehicleModelDetails.vehicleId', null] },
          'vehicleModelDetails.status': { $ifNull: ['$vehicleModelDetails.status', null] },
          'vehicleModelDetails.clientId': { $ifNull: ['$vehicleModelDetails.clientId', null] },
          canceledBy: 1,




        }



      },


      {
        $sort: { createdAt: -1 }, // Sorting in descending order (latest first)
      },
      {
        $skip: (page - 1) * limit, // Pagination: Skip previous pages
      },
      {
        $limit: limit, // Limit number of results per page
      },
    ])
    const totalPages = Math.ceil(totalResults / limit);




    return {
      results: results,
      page,
      limit,
      totalPages,
      totalResults,
    }

  } catch (error) {
    throw error;
  }
};

/**
 * Get request by ID
 * @param {ObjectId} id
 * @returns {Promise<Request>}
 */
const getRequestById = async (id) => {
  const result = await Request.aggregate([
    {
      $match: {
        _id: new ObjectId(id)
      }
    },
    {
      $lookup: {
        from: 'zoneprices',
        localField: 'zoneTypeId',
        foreignField: '_id',
        as: 'zonepriceDetails',
        let: { vehicleId: '$vehicleId' },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ['$vehicleId', '$$vehicleId'] }
            }
          }
        ]
      },
    },
    {
      $lookup: {
        from: 'rentals',
        localField: 'packageId',
        foreignField: '_id',
        let: {
          vehicleId: { $toString: '$vehicleId' }
        },
        as: 'rentalDetails',
        pipeline: [
          {
            $addFields: {
              vehiclePrice: {
                $ifNull: [
                  {
                    $arrayElemAt: [
                      {
                        $filter: {
                          input: '$vehiclePrices',
                          as: 'vp',
                          cond: {
                            $eq: [{ $toString: '$$vp.vehicleId' }, '$$vehicleId']
                          }
                        }
                      },
                      0
                    ]
                  },
                  {}
                ]
              },
            }
          }
        ],
      }
    },
    {
      $lookup: {
        from: 'requestbills',
        localField: '_id',
        foreignField: 'requestId',
        as: 'billingDetails'
      }
    },
    {
      $lookup: {
        from: 'requestplaces',
        localField: '_id',
        foreignField: 'requestId',
        as: 'placesDetails'
      }
    },
    {
      $lookup: {
        from: 'requestplaces',
        localField: '_id',
        foreignField: 'requestId',
        as: 'addressDetails'
      }
    },
    {
      $lookup: {
        from: 'requestratings',
        localField: '_id',
        foreignField: 'requestId',
        as: 'ratingDetails'
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'userDetails',
      },
    },
    {
      $lookup: {
        from: 'drivers',
        localField: 'driverId',
        foreignField: '_id',
        as: 'driverDetails',
      },
    },
    {
      $unwind: {
        path:
          '$rentalDetails',
        preserveNullAndEmptyArrays: true
      },
    },
    {
      $unwind: {
        path: '$zonepriceDetails',
        preserveNullAndEmptyArrays: true
      }
    },

    {
      $unwind: {
        path: '$billingDetails',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $unwind: {
        path: '$ratingDetails',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $unwind: {
        path: '$userDetails',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $unwind: {
        path: '$driverDetails',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'driverDetails.userId',
        foreignField: '_id',
        as: 'driverPersonalDetails',
      },
    },
    {
      $lookup: {
        from: 'vehicles',
        localField: 'driverDetails.type',
        foreignField: '_id',
        as: 'vehicleDetails',
      },
    },
    {
      $lookup: {
        from: 'vehiclemodels',
        localField: 'driverDetails.carModel',
        foreignField: '_id',
        as: 'vehicleModelDetails',
      },
    },
    {
      $unwind: {
        path: '$driverPersonalDetails',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $unwind: {
        path: '$vehicleDetails',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $unwind: {
        path: '$vehicleModelDetails',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $unwind: {
        path: '$placesDetails',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        addressDetails: 1,
        requestNumber: { $ifNull: ['$requestNumber', null] },
        requestOtp: { $ifNull: ['$requestOtp', null] },
        isLater: { $ifNull: ['$isLater', null] },
        isInstantTrip: { $ifNull: ['$isInstantTrip', null] },
        ifDispatch: { $ifNull: ['$ifDispatch', null] },
        zoneTypeId: { $ifNull: ['$zoneTypeId', null] },
        userId: { $ifNull: ['$userId', null] },
        driverId: { $ifNull: ['$driverId', null] },
        tripStartTime: { $ifNull: ['$tripStartTime', null] },
        arrivedAt: { $ifNull: ['$arrivedAt', null] },
        acceptedAt: { $ifNull: ['$acceptedAt', null] },
        completedAt: { $ifNull: ['$completedAt', null] },
        cancelledAt: { $ifNull: ['$cancelledAt', null] },
        isDriverStarted: { $ifNull: ['$isDriverStarted', null] },
        isDriverArrived: { $ifNull: ['$isDriverArrived', null] },
        isTripStart: { $ifNull: ['$isTripStart', null] },
        isCompleted: { $ifNull: ['$isCompleted', null] },
        isCancelled: { $ifNull: ['$isCancelled', null] },
        customReason: { $ifNull: ['$customReason', null] },
        cancelMethod: { $ifNull: ['$cancelMethod', null] },
        totalDistance: { $ifNull: ['$totalDistance', null] },
        totalTime: { $ifNull: ['$totalTime', null] },
        isPaid: { $ifNull: ['$isPaid', null] },
        userRated: { $ifNull: ['$userRated', null] },
        driverRated: { $ifNull: ['$driverRated', null] },
        timezone: { $ifNull: ['$timezone', null] },
        attemptForSchedule: { $ifNull: ['$attemptForSchedule', null] },
        dispatcherId: { $ifNull: ['$dispatcherId', null] },
        driverNotes: { $ifNull: ['$driverNotes', null] },
        createdBy: { $ifNull: ['$createdBy', null] },
        adminDemoKey: { $ifNull: ['$adminDemoKey', null] },
        paymentOpt: { $ifNull: ['$paymentOpt', null] },
        rideType: { $ifNull: ['$rideType', null] },
        unit: { $ifNull: ['$unit', null] },
        requestedCurrencyCode: { $ifNull: ['$requestedCurrencyCode', null] },
        requestedCurrencySymbol: { $ifNull: ['$requestedCurrencySymbol', null] },
        promoId: { $ifNull: ['$promoId', null] },
        locationApprove: { $ifNull: ['$locationApprove', null] },
        holdStatus: { $ifNull: ['$holdStatus', null] },
        availablesStatus: { $ifNull: ['$availablesStatus', null] },
        tripType: { $ifNull: ['$tripType', null] },
        rentalPackage: { $ifNull: ['$rentalPackage', null] },
        manualTrip: { $ifNull: ['$manualTrip', null] },
        outstationId: { $ifNull: ['$outstationId', null] },
        outstationTypeId: { $ifNull: ['$outstationTypeId', null] },
        packageId: { $ifNull: ['$packageId', null] },
        packageItemId: { $ifNull: ['$packageItemId', null] },
        bookingFor: { $ifNull: ['$bookingFor', null] },
        othersUserId: { $ifNull: ['$othersUserId', null] },
        clientId: { $ifNull: ['$clientId', null] },
        pickLat: { $ifNull: ['$placesDetails.pickLat', null] },
        pickLng: { $ifNull: ['$placesDetails.pickLng', null] },
        pickAddress: { $ifNull: ['$placesDetails.pickAddress', null] },
        dropLat: { $ifNull: ['$placesDetails.dropLat', null] },
        dropLng: { $ifNull: ['$placesDetails.dropLng', null] },
        dropAddress: { $ifNull: ['$placesDetails.dropAddress', null] },
        'driverDetails._id': { $ifNull: ['$driverDetails._id', null] },
        'driverDetails.userId': { $ifNull: ['$driverDetails.userId', null] },
        'driverDetails.carNumber': { $ifNull: ['$driverDetails.carNumber', null] },
        'driverDetails._id': { $ifNull: ['$driverPersonalDetails._id', null] },
        'driverDetails.firstName': { $ifNull: ['$driverPersonalDetails.firstName', null] },
        'driverDetails.lastName': { $ifNull: ['$driverPersonalDetails.lastName', null] },
        'driverDetails.email': { $ifNull: ['$driverPersonalDetails.email', null] },
        'driverDetails.phoneNumber': { $ifNull: ['$driverPersonalDetails.phoneNumber', null] },
        'driverDetails.emergencyNumber': { $ifNull: ['$driverPersonalDetails.emergencyNumber', null] },
        'driverDetails.gender': { $ifNull: ['$driverPersonalDetails.gender', null] },
        'driverDetails.language': { $ifNull: ['$driverPersonalDetails.language', null] },
        'driverDetails.country': { $ifNull: ['$driverPersonalDetails.country', null] },
        'driverDetails.address': { $ifNull: ['$driverPersonalDetails.address', null] },
        'driverDetails.profilePic': { $ifNull: ['$driverDetails.profilePic', null] },
        'driverDetails.active': { $ifNull: ['$driverPersonalDetails.active', null] },
        'driverDetails.clientId': { $ifNull: ['$driverPersonalDetails.clientId', null] },
        'userDetails._id': { $ifNull: ['$userDetails._id', null] },
        'userDetails.firstName': { $ifNull: ['$userDetails.firstName', null] },
        'userDetails.lastName': { $ifNull: ['$userDetails.lastName', null] },
        'userDetails.email': { $ifNull: ['$userDetails.email', null] },
        'userDetails.phoneNumber': { $ifNull: ['$userDetails.phoneNumber', null] },
        'userDetails.emergencyNumber': { $ifNull: ['$userDetails.emergencyNumber', null] },
        'userDetails.gender': { $ifNull: ['$userDetails.gender', null] },
        'userDetails.language': { $ifNull: ['$userDetails.language', null] },
        'userDetails.country': { $ifNull: ['$userDetails.country', null] },
        'userDetails.address': { $ifNull: ['$userDetails.address', null] },
        'userDetails.active': { $ifNull: ['$userDetails.active', null] },
        'userDetails.profilePic': { $ifNull: ['$userDetails.profilePic', null] },
        'userDetails.clientId': { $ifNull: ['$userDetails.clientId', null] },
        'billingDetails._id': { $ifNull: ['$billingDetails._id', null] },
        'billingDetails.basePrice': { $ifNull: ['$billingDetails.basePrice', null] },
        'billingDetails.baseDistance': { $ifNull: ['$billingDetails.baseDistance', null] },
        'billingDetails.totalDistance': { $ifNull: ['$billingDetails.totalDistance', null] },
        'billingDetails.totalTime': { $ifNull: ['$billingDetails.totalTime', null] },
        'billingDetails.pricePerDistance': { $ifNull: ['$billingDetails.pricePerDistance', null] },
        'billingDetails.distancePrice': { $ifNull: ['$billingDetails.distancePrice', null] },
        'billingDetails.pricePerTime': { $ifNull: ['$billingDetails.pricePerTime', null] },
        'billingDetails.timePrice': { $ifNull: ['$billingDetails.timePrice', null] },
        'billingDetails.waitingCharge': { $ifNull: ['$billingDetails.waitingCharge', null] },
        'billingDetails.cancellationFee': { $ifNull: ['$billingDetails.cancellationFee', null] },
        'billingDetails.serviceTax': { $ifNull: ['$billingDetails.serviceTax', null] },
        'billingDetails.serviceTaxPercentage': { $ifNull: ['$billingDetails.serviceTaxPercentage', null] },
        'billingDetails.promoDiscount': { $ifNull: ['$billingDetails.promoDiscount', null] },
        'billingDetails.adminCommission': { $ifNull: ['$billingDetails.adminCommission', null] },
        'billingDetails.adminCommissionWithTax': { $ifNull: ['$billingDetails.adminCommissionWithTax', null] },
        'billingDetails.driverCommission': { $ifNull: ['$billingDetails.driverCommission', null] },
        'billingDetails.totalAmount': { $ifNull: ['$billingDetails.totalAmount', null] },
        'billingDetails.subTotal': { $ifNull: ['$billingDetails.subTotal', null] },
        'billingDetails.outOfZonePrice': { $ifNull: ['$billingDetails.outOfZonePrice', null] },
        'billingDetails.bookingFees': { $ifNull: ['$billingDetails.bookingFees', null] },
        'billingDetails.hillStationPrice': { $ifNull: ['$billingDetails.hillStationPrice', null] },
        'ratingDetails.rating': { $ifNull: ['$ratingDetails.rating', null] },
        'ratingDetails.feedback': { $ifNull: ['$ratingDetails.feedback', null] },
        'ratingDetails.userId': { $ifNull: ['$ratingDetails.userId', null] },
        'ratingDetails.requestId': { $ifNull: ['$ratingDetails.requestId', null] },
        'ratingDetails.createdAt': { $ifNull: ['$ratingDetails.createdAt', null] },
        'ratingDetails.updatedAt': { $ifNull: ['$ratingDetails.updatedAt', null] },
        'ratingDetails.deletedAt': { $ifNull: ['$ratingDetails.deletedAt', null] },
        'vehicleDetails.vehicleName': { $ifNull: ['$vehicleDetails.vehicleName', null] },
        'vehicleDetails.image': { $ifNull: ['$vehicleDetails.image', null] },
        'vehicleDetails.capacity': { $ifNull: ['$vehicleDetails.capacity', null] },
        'vehicleDetails.serviceType': { $ifNull: ['$vehicleDetails.serviceType', null] },
        'vehicleDetails.categoryId': { $ifNull: ['$vehicleDetails.categoryId', null] },
        'vehicleDetails.sortingorder': { $ifNull: ['$vehicleDetails.sortingorder', null] },
        'vehicleDetails.highlightImage': { $ifNull: ['$vehicleDetails.highlightImage', null] },
        'vehicleDetails.status': { $ifNull: ['$vehicleDetails.status', null] },
        'vehicleDetails.clientId': { $ifNull: ['$vehicleDetails.clientId', null] },
        'vehicleModelDetails.modelname': { $ifNull: ['$vehicleModelDetails.modelname', null] },
        'vehicleModelDetails.description': { $ifNull: ['$vehicleModelDetails.description', null] },
        'vehicleModelDetails.image': { $ifNull: ['$vehicleModelDetails.image', null] },
        'vehicleModelDetails.vehicleId': { $ifNull: ['$vehicleModelDetails.vehicleId', null] },
        'vehicleModelDetails.status': { $ifNull: ['$vehicleModelDetails.status', null] },
        'vehicleModelDetails.clientId': { $ifNull: ['$vehicleModelDetails.clientId', null] },
        // 'zonepriceDetails.ridenowBasePrice':{ $ifNull: ['$zonepriceDetails.ridenowBasePrice', null] },
        'tripBasePrice': {
          $cond: {
            if: { $eq: ['$tripType', 'LOCAL'] },
            then: { $toString: '$zonepriceDetails.ridenowBasePrice' },
            else: { $toString: '$rentalDetails.vehiclePrice.price' },
          }
        },


      }
    },
    {
      $group: {
        _id: "$_id",
        data: { $first: "$$ROOT" }
      }
    },
    {
      $replaceRoot: { newRoot: "$data" }
    }
  ]);
  return result;
};

/**
 * Update request by ID
 * @param {ObjectId} requestId
 * @param {Object} updateBody
 * @returns {Promise<Request>}
 */
const updateRequestById = async (requestId, updateBody) => {
  const request = await getRequestById(requestId);
  if (!request) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Request not found');
  }
  Object.assign(request, updateBody);
  await request.save();
  return request;
};

/**
 * Delete request by ID
 * @param {ObjectId} requestId
 * @returns {Promise<Request>}
 */
const deleteRequestById = async (requestId) => {
  const request = await getRequestById(requestId);
  if (!request) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Request not found');
  }
  await request.remove();
  return request;
};

const getRequesHistoryList = async (req) => {

  let clientId = await getClientId(req);
  // let userId = await getUserId(req);


  return Request.aggregate([
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'user',
      },
    },
    { $unwind: '$user' },
    {
      $match: {
        'user.phoneNumber': req.params.phoneNumber,
      }
    },
    {
      $lookup: {
        from: 'requestbills',
        localField: '_id',
        foreignField: 'requestId',
        as: 'billingDetails'
      }
    },
    {
      $lookup: {
        from: 'requestplaces',
        localField: '_id',
        foreignField: 'requestId',
        as: 'placesDetails'
      }
    },
    {
      $lookup: {
        from: 'requestratings',
        localField: '_id',
        foreignField: 'requestId',
        as: 'ratingDetails'
      }
    },
    {
      $lookup: {
        from: 'drivers',
        localField: 'driverId',
        foreignField: '_id',
        as: 'driverDetails',
      },
    },
    {
      $unwind: {
        path: '$billingDetails',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $unwind: {
        path: '$ratingDetails',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $unwind: {
        path: '$user',
        preserveNullAndEmptyArrays: true,
      }
    },
    {
      $unwind: {
        path: '$driverDetails',
        preserveNullAndEmptyArrays: true,
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'driverDetails.userId',
        foreignField: '_id',
        as: 'driverPersonalDetails',
      }
    },
    {
      $lookup: {
        from: 'vehicles',
        localField: 'driverDetails.type',
        foreignField: '_id',
        as: 'vehicleDetails',
      }
    },
    {
      $lookup: {
        from: 'vehiclemodels',
        localField: 'driverDetails.carModel',
        foreignField: '_id',
        as: 'vehicleModelDetails',
      }
    },
    {
      $unwind: {
        path: '$driverPersonalDetails',
        preserveNullAndEmptyArrays: true,
      }
    },
    {
      $unwind: {
        path: '$vehicleDetails',
        preserveNullAndEmptyArrays: true,
      }
    },
    {
      $unwind: {
        path: '$vehicleModelDetails',
        preserveNullAndEmptyArrays: true,
      }
    },
    {
      $project: {
        placesDetails: 1,
        requestNumber: { $ifNull: ['$requestNumber', null] },
        requestOtp: { $ifNull: ['$requestOtp', null] },
        isLater: { $ifNull: ['$isLater', null] },
        isInstantTrip: { $ifNull: ['$isInstantTrip', null] },
        ifDispatch: { $ifNull: ['$ifDispatch', null] },
        zoneTypeId: { $ifNull: ['$zoneTypeId', null] },
        userId: { $ifNull: ['$userId', null] },
        driverId: { $ifNull: ['$driverId', null] },
        tripStartTime: { $ifNull: ['$tripStartTime', null] },
        arrivedAt: { $ifNull: ['$arrivedAt', null] },
        acceptedAt: { $ifNull: ['$acceptedAt', null] },
        completedAt: { $ifNull: ['$completedAt', null] },
        cancelledAt: { $ifNull: ['$cancelledAt', null] },
        isDriverStarted: { $ifNull: ['$isDriverStarted', null] },
        isDriverArrived: { $ifNull: ['$isDriverArrived', null] },
        isTripStart: { $ifNull: ['$isTripStart', null] },
        isCompleted: { $ifNull: ['$isCompleted', null] },
        isCancelled: { $ifNull: ['$isCancelled', null] },
        customReason: { $ifNull: ['$customReason', null] },
        cancelMethod: { $ifNull: ['$cancelMethod', null] },
        totalDistance: { $ifNull: ['$totalDistance', null] },
        totalTime: { $ifNull: ['$totalTime', null] },
        isPaid: { $ifNull: ['$isPaid', null] },
        userRated: { $ifNull: ['$userRated', null] },
        driverRated: { $ifNull: ['$driverRated', null] },
        timezone: { $ifNull: ['$timezone', null] },
        attemptForSchedule: { $ifNull: ['$attemptForSchedule', null] },
        dispatcherId: { $ifNull: ['$dispatcherId', null] },
        driverNotes: { $ifNull: ['$driverNotes', null] },
        createdBy: { $ifNull: ['$createdBy', null] },
        adminDemoKey: { $ifNull: ['$adminDemoKey', null] },
        paymentOpt: { $ifNull: ['$paymentOpt', null] },
        rideType: { $ifNull: ['$rideType', null] },
        unit: { $ifNull: ['$unit', null] },
        requestedCurrencyCode: { $ifNull: ['$requestedCurrencyCode', null] },
        requestedCurrencySymbol: { $ifNull: ['$requestedCurrencySymbol', null] },
        promoId: { $ifNull: ['$promoId', null] },
        locationApprove: { $ifNull: ['$locationApprove', null] },
        holdStatus: { $ifNull: ['$holdStatus', null] },
        availablesStatus: { $ifNull: ['$availablesStatus', null] },
        tripType: { $ifNull: ['$tripType', null] },
        rentalPackage: { $ifNull: ['$rentalPackage', null] },
        manualTrip: { $ifNull: ['$manualTrip', null] },
        outstationId: { $ifNull: ['$outstationId', null] },
        outstationTypeId: { $ifNull: ['$outstationTypeId', null] },
        packageId: { $ifNull: ['$packageId', null] },
        packageItemId: { $ifNull: ['$packageItemId', null] },
        bookingFor: { $ifNull: ['$bookingFor', null] },
        othersUserId: { $ifNull: ['$othersUserId', null] },
        clientId: { $ifNull: ['$clientId', null] },
        'driverDetails._id': { $ifNull: ['$driverDetails._id', null] },
        'driverDetails.userId': { $ifNull: ['$driverDetails.userId', null] },
        'driverDetails.carNumber': { $ifNull: ['$driverDetails.carNumber', null] },
        'driverDetails._id': { $ifNull: ['$driverPersonalDetails._id', null] },
        'driverDetails.firstName': { $ifNull: ['$driverPersonalDetails.firstName', null] },
        'driverDetails.lastName': { $ifNull: ['$driverPersonalDetails.lastName', null] },
        'driverDetails.email': { $ifNull: ['$driverPersonalDetails.email', null] },
        'driverDetails.phoneNumber': { $ifNull: ['$driverPersonalDetails.phoneNumber', null] },
        'driverDetails.emergencyNumber': { $ifNull: ['$driverPersonalDetails.emergencyNumber', null] },
        'driverDetails.gender': { $ifNull: ['$driverPersonalDetails.gender', null] },
        'driverDetails.language': { $ifNull: ['$driverPersonalDetails.language', null] },
        'driverDetails.country': { $ifNull: ['$driverPersonalDetails.country', null] },
        'driverDetails.address': { $ifNull: ['$driverPersonalDetails.address', null] },
        'driverDetails.profilePic': { $ifNull: ['$driverDetails.profilePic', null] },
        'driverDetails.active': { $ifNull: ['$driverPersonalDetails.active', null] },
        'driverDetails.clientId': { $ifNull: ['$driverPersonalDetails.clientId', null] },
        'user._id': { $ifNull: ['$user._id', null] },
        'user.firstName': { $ifNull: ['$user.firstName', null] },
        'user.lastName': { $ifNull: ['$user.lastName', null] },
        'user.email': { $ifNull: ['$user.email', null] },
        'user.phoneNumber': { $ifNull: ['$user.phoneNumber', null] },
        'user.emergencyNumber': { $ifNull: ['$user.emergencyNumber', null] },
        'user.referralCode': { $ifNull: ['$user.referralCode', null] },
        'user.gender': { $ifNull: ['$user.gender', null] },
        'user.language': { $ifNull: ['$user.language', null] },
        'user.country': { $ifNull: ['$user.country', null] },
        'user.address': { $ifNull: ['$user.address', null] },
        'user.active': { $ifNull: ['$user.active', null] },
        'user.profilePic': { $ifNull: ['$user.profilePic', null] },
        'user.password': { $ifNull: ['$user.password', null] },
        'user.clientId': { $ifNull: ['$user.clientId', null] },
        'billingDetails._id': { $ifNull: ['$billingDetails._id', null] },
        'billingDetails.basePrice': { $ifNull: ['$billingDetails.basePrice', null] },
        'billingDetails.baseDistance': { $ifNull: ['$billingDetails.baseDistance', null] },
        'billingDetails.totalDistance': { $ifNull: ['$billingDetails.totalDistance', null] },
        'billingDetails.totalTime': { $ifNull: ['$billingDetails.totalTime', null] },
        'billingDetails.pricePerDistance': { $ifNull: ['$billingDetails.pricePerDistance', null] },
        'billingDetails.distancePrice': { $ifNull: ['$billingDetails.distancePrice', null] },
        'billingDetails.pricePerTime': { $ifNull: ['$billingDetails.pricePerTime', null] },
        'billingDetails.timePrice': { $ifNull: ['$billingDetails.timePrice', null] },
        'billingDetails.waitingCharge': { $ifNull: ['$billingDetails.waitingCharge', null] },
        'billingDetails.cancellationFee': { $ifNull: ['$billingDetails.cancellationFee', null] },
        'billingDetails.serviceTax': { $ifNull: ['$billingDetails.serviceTax', null] },
        'billingDetails.serviceTaxPercentage': { $ifNull: ['$billingDetails.serviceTaxPercentage', null] },
        'billingDetails.promoDiscount': { $ifNull: ['$billingDetails.promoDiscount', null] },
        'billingDetails.adminCommission': { $ifNull: ['$billingDetails.adminCommission', null] },
        'billingDetails.adminCommissionWithTax': { $ifNull: ['$billingDetails.adminCommissionWithTax', null] },
        'billingDetails.driverCommission': { $ifNull: ['$billingDetails.driverCommission', null] },
        'billingDetails.totalAmount': { $ifNull: ['$billingDetails.totalAmount', null] },
        'billingDetails.subTotal': { $ifNull: ['$billingDetails.subTotal', null] },
        'billingDetails.outOfZonePrice': { $ifNull: ['$billingDetails.outOfZonePrice', null] },
        'billingDetails.bookingFees': { $ifNull: ['$billingDetails.bookingFees', null] },
        'billingDetails.hillStationPrice': { $ifNull: ['$billingDetails.hillStationPrice', null] },
        'ratingDetails.rating': { $ifNull: ['$ratingDetails.rating', null] },
        'ratingDetails.feedback': { $ifNull: ['$ratingDetails.feedback', null] },
        'ratingDetails.userId': { $ifNull: ['$ratingDetails.userId', null] },
        'ratingDetails.requestId': { $ifNull: ['$ratingDetails.requestId', null] },
        'ratingDetails.createdAt': { $ifNull: ['$ratingDetails.createdAt', null] },
        'ratingDetails.updatedAt': { $ifNull: ['$ratingDetails.updatedAt', null] },
        'ratingDetails.deletedAt': { $ifNull: ['$ratingDetails.deletedAt', null] },
        'vehicleDetails.vehicleName': { $ifNull: ['$vehicleDetails.vehicleName', null] },
        'vehicleDetails.image': { $ifNull: ['$vehicleDetails.image', null] },
        'vehicleDetails.capacity': { $ifNull: ['$vehicleDetails.capacity', null] },
        'vehicleDetails.serviceType': { $ifNull: ['$vehicleDetails.serviceType', null] },
        'vehicleDetails.categoryId': { $ifNull: ['$vehicleDetails.categoryId', null] },
        'vehicleDetails.sortingorder': { $ifNull: ['$vehicleDetails.sortingorder', null] },
        'vehicleDetails.highlightImage': { $ifNull: ['$vehicleDetails.highlightImage', null] },
        'vehicleDetails.status': { $ifNull: ['$vehicleDetails.status', null] },
        'vehicleDetails.clientId': { $ifNull: ['$vehicleDetails.clientId', null] },
        'vehicleModelDetails.modelname': { $ifNull: ['$vehicleModelDetails.modelname', null] },
        'vehicleModelDetails.description': { $ifNull: ['$vehicleModelDetails.description', null] },
        'vehicleModelDetails.image': { $ifNull: ['$vehicleModelDetails.image', null] },
        'vehicleModelDetails.vehicleId': { $ifNull: ['$vehicleModelDetails.vehicleId', null] },
        'vehicleModelDetails.status': { $ifNull: ['$vehicleModelDetails.status', null] },
        'vehicleModelDetails.clientId': { $ifNull: ['$vehicleModelDetails.clientId', null] }
      }
    }
  ]);
};

/**
 * Get web request history (no clientId required)
 * @param {string} phoneNumber - User's phone number
 * @returns {Promise<Array>} - Array of request history with user profile info
 */
const getWebRequestHistory = async (phoneNumber) => {
  if (!phoneNumber) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Phone number is required');
  }

  return Request.aggregate([
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'user',
      },
    },
    { $unwind: '$user' },
    {
      $match: {
        'user.phoneNumber': phoneNumber,
      }
    },
    {
      $lookup: {
        from: 'requestbills',
        localField: '_id',
        foreignField: 'requestId',
        as: 'billingDetails'
      }
    },
    {
      $lookup: {
        from: 'requestplaces',
        localField: '_id',
        foreignField: 'requestId',
        as: 'placesDetails'
      }
    },
    {
      $lookup: {
        from: 'requestratings',
        localField: '_id',
        foreignField: 'requestId',
        as: 'ratingDetails'
      }
    },
    {
      $lookup: {
        from: 'drivers',
        localField: 'driverId',
        foreignField: '_id',
        as: 'driverDetails',
      },
    },
    {
      $unwind: {
        path: '$billingDetails',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $unwind: {
        path: '$ratingDetails',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $unwind: {
        path: '$user',
        preserveNullAndEmptyArrays: true,
      }
    },
    {
      $unwind: {
        path: '$driverDetails',
        preserveNullAndEmptyArrays: true,
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'driverDetails.userId',
        foreignField: '_id',
        as: 'driverPersonalDetails',
      }
    },
    {
      $lookup: {
        from: 'vehicles',
        localField: 'driverDetails.type',
        foreignField: '_id',
        as: 'vehicleDetails',
      }
    },
    {
      $unwind: {
        path: '$driverPersonalDetails',
        preserveNullAndEmptyArrays: true,
      }
    },
    {
      $unwind: {
        path: '$vehicleDetails',
        preserveNullAndEmptyArrays: true,
      }
    },
    {
      $project: {
        placesDetails: 1,
        requestNumber: { $ifNull: ['$requestNumber', null] },
        requestOtp: { $ifNull: ['$requestOtp', null] },
        isCompleted: { $ifNull: ['$isCompleted', null] },
        isCancelled: { $ifNull: ['$isCancelled', null] },
        paymentOpt: { $ifNull: ['$paymentOpt', null] },
        rideType: { $ifNull: ['$rideType', null] },
        tripType: { $ifNull: ['$tripType', null] },
        completedAt: { $ifNull: ['$completedAt', null] },
        cancelledAt: { $ifNull: ['$cancelledAt', null] },
        createdAt: { $ifNull: ['$createdAt', null] },
        // User profile information (complete profile)
        'user._id': { $ifNull: ['$user._id', null] },
        'user.firstName': { $ifNull: ['$user.firstName', null] },
        'user.lastName': { $ifNull: ['$user.lastName', null] },
        'user.email': { $ifNull: ['$user.email', null] },
        'user.phoneNumber': { $ifNull: ['$user.phoneNumber', null] },
        'user.emergencyNumber': { $ifNull: ['$user.emergencyNumber', null] },
        'user.referralCode': { $ifNull: ['$user.referralCode', null] },
        'user.gender': { $ifNull: ['$user.gender', null] },
        'user.language': { $ifNull: ['$user.language', null] },
        'user.country': { $ifNull: ['$user.country', null] },
        'user.address': { $ifNull: ['$user.address', null] },
        'user.active': { $ifNull: ['$user.active', null] },
        'user.profilePic': { $ifNull: ['$user.profilePic', null] },
        // Driver details
        'driverDetails._id': { $ifNull: ['$driverDetails._id', null] },
        'driverDetails.carNumber': { $ifNull: ['$driverDetails.carNumber', null] },
        'driverDetails.firstName': { $ifNull: ['$driverPersonalDetails.firstName', null] },
        'driverDetails.lastName': { $ifNull: ['$driverPersonalDetails.lastName', null] },
        'driverDetails.phoneNumber': { $ifNull: ['$driverPersonalDetails.phoneNumber', null] },
        'driverDetails.profilePic': { $ifNull: ['$driverPersonalDetails.profilePic', null] },
        // Vehicle details
        'vehicleDetails.vehicleName': { $ifNull: ['$vehicleDetails.vehicleName', null] },
        'vehicleDetails.image': { $ifNull: ['$vehicleDetails.image', null] },
        'vehicleDetails.capacity': { $ifNull: ['$vehicleDetails.capacity', null] },
        // Billing details
        'billingDetails.totalAmount': { $ifNull: ['$billingDetails.totalAmount', null] },
        'billingDetails.basePrice': { $ifNull: ['$billingDetails.basePrice', null] },
        'billingDetails.totalDistance': { $ifNull: ['$billingDetails.totalDistance', null] },
        'billingDetails.totalTime': { $ifNull: ['$billingDetails.totalTime', null] },
        // Rating details
        'ratingDetails.rating': { $ifNull: ['$ratingDetails.rating', null] },
        'ratingDetails.feedback': { $ifNull: ['$ratingDetails.feedback', null] },
      }
    },
    {
      $sort: { createdAt: -1 } // Sort by most recent first
    }
  ]);
};

const getRideTypes = async (userId, req) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (!userId) return { status: 401, data: sendError('Token Expired', [], 401) };

    const user = await User.findById(userId);
    if (!user) return { status: 401, data: sendError('Unauthorized', [], 401) };
    if (!user.active) return { status: 403, data: sendError('User is blocked, please contact admin', [], 403) };


    const { pick_lat, pick_lng, drop_lat, drop_long, ride_type, stops, promo_code, ride_time, ride_date } = req.body;

    const zone = await getPickupZone(req);

    if (!zone || zone.nonServiceZone === 'Yes') return { status: 404, data: sendError('Non-service zone', [], 404) };

    let distance = await calculateDistance(pick_lat, pick_lng, drop_lat, drop_long, stops);

    if (zone.unit != "KM") {
      distance = distance * 0.6213711922
    }

    const zonePrice = await calculateZonePrices(req, zone, distance, ride_type, promo_code, user, ride_time, ride_date, drop_lat, drop_long);



    const dataResponse = createDataResponse(zone);


    dataResponse.zoneTypePrice = zonePrice;

    await session.commitTransaction();

    return dataResponse;
  } catch (error) {
    await session.abortTransaction();
    throw error; // Rethrow to be caught in controller
  } finally {
    session.endSession();
  }
};

/**
 * Validate user is not already in an active trip
 */
const validateUserInTrip = async (user) => {
  try {
    const userExistsTrip = await Request.findOne({
      isCompleted: false,
      isCancelled: false,
      userId: user._id,
      isLater: false,
    });

    if (userExistsTrip) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'User already in trip');
    }
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to validate user trip');
  }
};

/**
 * Validate and cancel any existing requested trips for the user
 */
const validateUserRequestedTrip = async (user) => {
  try {
    const requestMetaWithCurrentUser = await RequestMeta.findOne({
      userId: user._id,
    });

    if (requestMetaWithCurrentUser) {
      const requestId = requestMetaWithCurrentUser.requestId;

      if (requestId) {
        await Request.findByIdAndUpdate(requestId, {
          isCancelled: true,
          cancelMethod: 1,
          cancelled_at: moment(),
        });
      }

      await RequestMeta.deleteMany({
        userId: user._id,
      });
    }
  } catch (error) {
    console.error('Error in validateUserRequestedTrip:', error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to validate user requested trip');
  }
};

/**
 * Validate payment option
 */
const validatePaymentOption = async (request) => {
  try {
    switch (request.payment_opt) {
      case 'CARD':
      case 'CASH':
      case 'WALLET':
        return true;
      default:
        throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid payment option selected');
    }
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error validating payment option');
  }
};

/**
 * Get request list data for response
 */
const getRequestListData = async (requestId) => {
  const getRequest = await requestListView.aggregate([
    {
      $match: {
        _id: new ObjectId(requestId),
      },
    },
  ]);

  return getRequest;
};

/**
 * Web-specific request creation service (duplicate of createTrip, no clientId required)
 * @param {Object} req - Request object with body containing booking details
 * @returns {Promise<Object>} Created request with driver assignment (if RIDE_NOW)
 */
const createWebRequest = async (req) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Get user (required for web)
    let user = null;
    if (req.user && req.user._id) {
      user = await User.findById(req.user._id);
      if (!user) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Unauthorized user');
      }
      if (!user.active) {
        throw new ApiError(httpStatus.FORBIDDEN, 'User is blocked, please contact admin');
      }
    } else {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'User authentication required');
    }

    const trip_type = req.body.trip_type || 'LOCAL';

    if (trip_type === 'LOCAL') {
      const {
        promo_code,
        booking_for = 'MYSELF',
        payment_opt,
        pick_lat,
        pick_lng,
        drop_lat,
        drop_long,
        stops,
        driver_notes,
        vehicle_type,
        ride_type,
        ride_time,
        ride_date,
      } = req.body;

      // Validate user's existing trips
      await validateUserInTrip(user);
      await validateUserRequestedTrip(user);

      // Validate payment option
      await validatePaymentOption({ payment_opt });

      // Validate vehicle type (web doesn't use clientId)
      const type = await Vehicle.findById(vehicle_type);
      if (!type) {
        throw new ApiError(httpStatus.FORBIDDEN, 'Wrong Vehicle Type');
      }

      // Get zone using web-specific function
      const webReq = {
        ...req,
        body: {
          ...req.body,
          pick_lat,
          pick_lng,
        },
        headers: {
          ...req.headers,
          clientid: null,
        }
      };

      const zone = await webGetPickupZone(webReq);
      if (!zone || zone.nonServiceZone === 'Yes') {
        throw new ApiError(httpStatus.FORBIDDEN, 'Service not available at this location');
      }

      // Find zoneTypeId from zonePriceDetails
      let zoneTypeId = null;
      for (const zonePrice of zone.zonePriceDetails || []) {
        const zonePriceVehId = zonePrice.vehicleDetails?._id || zonePrice.vehicleDetails?.id;
        if (zonePriceVehId && zonePriceVehId.toString() === type._id.toString()) {
          zoneTypeId = zonePrice._id || zonePrice.id;
          break;
        }
      }

      if (!zoneTypeId) {
        throw new ApiError(httpStatus.FORBIDDEN, 'Service not available at this location');
      }

      const price = await ZonePrice.findById(zoneTypeId);
      if (!price) {
        throw new ApiError(httpStatus.FORBIDDEN, 'Service not available at this location');
      }

      // Check for surge pricing
      let surgePriceId = null;
      let surgePrice = false;
      const today = moment().format('dddd');

      for (const surge of zone.zoneSurgePriceDetails || []) {
        const startTime = moment(surge.startTime, 'HH:mm');
        const endTime = moment(surge.endTime, 'HH:mm');
        const currentTime = moment();

        if (currentTime.isBetween(startTime, endTime) && surge.availableDays) {
          const availableDays = surge.availableDays;
          if (availableDays.includes(today)) {
            surgePrice = true;
            surgePriceId = surge._id;
            break;
          }
        }
      }

      // Validate payment option
      if (payment_opt && zone.payment_types) {
        const paymentOptions = Array.isArray(zone.payment_types) ? zone.payment_types : [];
        if (!paymentOptions.includes(payment_opt)) {
          throw new ApiError(httpStatus.FORBIDDEN, 'Payment Option is not available. Please select another option');
        }
      }

      // Handle promo code
      let promocode_id = null;
      let promoAmount = 0;

      if (promo_code) {
        const isPromoId = /^[a-fA-F0-9]{24}$/.test(promo_code);
        const promocode = isPromoId
          ? await PromoCode.findById(promo_code)
          : await PromoCode.findOne({ promoCode: promo_code });
        if (!promocode) {
          throw new ApiError(httpStatus.FORBIDDEN, 'Wrong Promo Code');
        }

        const [promo_count, promo_all_count] = await Promise.all([
          Request.countDocuments({ promoId: promocode._id, userId: user._id, isCompleted: 1 }),
          Request.countDocuments({ promoId: promocode._id, isCompleted: 1 }),
        ]);

        if (promo_count > promocode.promoReuseCount) {
          throw new ApiError(httpStatus.FORBIDDEN, `Sorry! You already ${promocode.promoReuseCount} times used this promo code`);
        }
        if (promo_all_count > promocode.promo_use_count) {
          throw new ApiError(httpStatus.FORBIDDEN, 'Sorry! promo code limit exceeded');
        }

        if (promocode.promoType === 'fixed') {
          promocode_id = promocode._id;
          promoAmount = promocode.amount;
        } else if (promocode.promoType === 'percentage') {
          promocode_id = promocode._id;
          promoAmount = promocode.percentage;
        }
      }

      // Generate ride details
      const requestNumber = await generateRequestNumber();
      const requestOtp = await uniqueRandomNumbers(4);

      const countryDial = await Country.findById(new ObjectId(user.countryCode));
      if (!countryDial) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid country code');
      }

      // Determine if it's a later ride
      const isLater = ride_type === 'RIDE_LATER';
      let tripTime = null;
      if (isLater && ride_date && ride_time) {
        tripTime = moment(`${ride_date} ${ride_time}`).toDate();
      }

      const requestParams = {
        requestNumber: requestNumber,
        requestOtp,
        userId: user._id,
        zoneTypeId: zoneTypeId,
        paymentOpt: payment_opt,
        unit: zone.unit,
        promoId: promocode_id,
        requestedCurrencyCode: countryDial.dial_code,
        requestedCurrencySymbol: countryDial.currency_symbol,
        driverInfo: driver_notes,
        tripType: ride_type,
        vehicleId: vehicle_type,
        bookingFor: booking_for,
        tripStartTime: moment(),
        tripSecondaryVehicle: zoneTypeId,
        rideType: ride_type,
        tripType: trip_type,
        isLater: isLater,
        tripTime: tripTime,
        zoneId: zone._id || zone.zoneId,
      };

      const requestDetail = await Request.create(requestParams);

      // Handle booking for others
      let other_user = null;
      if (booking_for === 'OTHERS') {
        other_user = await User.create({
          firstName: req.body.others_name,
          phoneNumber: req.body.others_number,
        });
        requestDetail.others_user_id = other_user._id;
        await requestDetail.save();
      }

      // Add stops logic
      if (stops) {
        const stopLocations = typeof stops === 'string' ? JSON.parse(stops) : stops;
        for (let i = 0; i < stopLocations.length; i++) {
          const currentStop = stopLocations[i];
          const prevStop = stopLocations[i - 1] || { latitude: pick_lat, longitude: pick_lng, address: req.body.pickup_address };

          await RequestPlace.create({
            pickLat: prevStop.latitude,
            pickLng: prevStop.longitude,
            dropLat: currentStop.latitude,
            dropLng: currentStop.longitude,
            pickAddress: prevStop.address,
            dropAddress: currentStop.address,
            requestId: requestDetail._id,
            stops: 1,
            vehicleType: vehicle_type,
          });
        }
      } else {
        await RequestPlace.create({
          pickLat: pick_lat,
          pickLng: pick_lng,
          dropLat: drop_lat,
          dropLng: drop_long,
          pickAddress: req.body.pickup_address,
          dropAddress: req.body.drop_address,
          requestId: requestDetail._id,
          vehicleType: vehicle_type,
        });
      }

      if (!isLater) {
        const drivers = await fetchDriver(pick_lat, pick_lng, vehicle_type, trip_type, zone._id || zone.zoneId, '', '');

        if (!drivers || !drivers.length) {
          // Delete request place if exists
          await RequestPlace.deleteMany({ requestId: requestDetail._id });
          // Delete the request completely
          await Request.findByIdAndDelete(requestDetail._id);
          await session.commitTransaction();
          throw new ApiError(httpStatus.NOT_FOUND, 'No Driver Found');
        }
  

        let selectedDrivers = [];
        for (let driver of drivers) {
          const driverData = await Users.findById(driver.userId);

          const isDriverFree = (await RequestMeta.countDocuments({ driverId: driver.driverId, active: true })) === 0;
          if (isDriverFree) {
            selectedDrivers.push({
              user_id: driver.userId,
              driver_id: driver.driverId,
              active: selectedDrivers.length === 0 ? 1 : 0,
              request_id: requestDetail._id,
              assign_method: 1,
              created_at: new Date(),
              updated_at: new Date(),
            });
          }
        }

        if (!selectedDrivers.length) {
          // Delete request place if exists
          await RequestPlace.deleteMany({ requestId: requestDetail._id });
          // Delete the request completely
          await Request.findByIdAndDelete(requestDetail._id);
          await session.commitTransaction();
          throw new ApiError(httpStatus.NOT_FOUND, 'No Driver Found');
        }

        // Notify the first driver
        const firstDriver = selectedDrivers[0];
        const metaDriver = await Driver.findById(firstDriver.driver_id);

        if (metaDriver && metaDriver.userId) {
          await sendPushNotification(metaDriver.userId.toString(), {
            title: 'New Trip Requested',
            message: 'New Trip Requested, you can accept or Reject the request',
          });
        }

        // Save driver meta and request locations
        await RequestMeta.insertMany(
          selectedDrivers.map(({ user_id, request_id, driver_id, active, assign_method }) => ({
            userId: user_id,
            requestId: request_id,
            driverId: driver_id,
            active,
            assignMethod: assign_method,
          }))
        );

        let responseData = await getRequestListData(requestDetail._id);

        const driverTopic = mqttConfig.DRIVER_REQUEST + '' + firstDriver.driver_id;

        await mqttService.publishMessage(
          driverTopic,
          JSON.stringify({
            title: 'New Trip Requested',
            message: 'New Trip Requested, you can accept or Reject the request',
            tripDetails: responseData[0],
          })
        );

        await session.commitTransaction();
        return responseData[0];
      } else {
        await session.commitTransaction();
        return requestDetail;
      }
    } else if (trip_type === 'RENTAL') {
      const {
        promo_code,
        booking_for = 'MYSELF',
        payment_opt,
        pick_lat,
        pick_lng,
        vehicle_type,
        ride_type,
        ride_time,
        ride_date,
        packageId,
      } = req.body;

      // Validate user's existing trips
      await validateUserInTrip(user);
      await validateUserRequestedTrip(user);

      // Validate payment option
      await validatePaymentOption({ payment_opt });

      // Validate vehicle type (web doesn't use clientId)
      const type = await Vehicle.findById(vehicle_type);
      if (!type) {
        throw new ApiError(httpStatus.FORBIDDEN, 'Wrong Vehicle Type');
      }

      // Get zone using web-specific function
      const webReq = {
        ...req,
        body: {
          ...req.body,
          pick_lat,
          pick_lng,
        },
        headers: {
          ...req.headers,
          clientid: null,
        }
      };

      const zone = await webGetPickupZone(webReq);
      if (!zone || zone.nonServiceZone === 'Yes') {
        throw new ApiError(httpStatus.FORBIDDEN, 'Service not available at this location');
      }

      const rental = await Rental.findById(packageId);
      if (!rental) {
        throw new ApiError(httpStatus.FORBIDDEN, 'Invalid rental package');
      }

      // Validate payment option
      if (payment_opt && zone.payment_types) {
        const paymentOptions = Array.isArray(zone.payment_types) ? zone.payment_types : [];
        if (!paymentOptions.includes(payment_opt)) {
          throw new ApiError(httpStatus.FORBIDDEN, 'Payment Option is not available. Please select another option');
        }
      }

      // Handle promo code
      let promocode_id = null;
      if (promo_code) {
        const isPromoId = /^[a-fA-F0-9]{24}$/.test(promo_code);
        const promocode = isPromoId
          ? await PromoCode.findById(promo_code)
          : await PromoCode.findOne({ promoCode: promo_code });
        if (!promocode) {
          throw new ApiError(httpStatus.FORBIDDEN, 'Wrong Promo Code');
        }

        const promo_count = await Request.countDocuments({
          promoId: promocode._id,
          userId: user._id,
          isCompleted: 1,
        });

        if (promo_count > promocode.promoReuseCount) {
          throw new ApiError(httpStatus.FORBIDDEN, `Sorry! You already ${promocode.promoReuseCount} times used this promo code`);
        }

        const promo_all_count = await Request.countDocuments({
          promoId: promocode._id,
          isCompleted: 1,
        });

        if (promo_all_count > promocode.promo_use_count) {
          throw new ApiError(httpStatus.FORBIDDEN, 'Sorry! promo code limit exceeded');
        }

        promocode_id = promocode._id;
      }

      // Generate ride details
      const requestNumber = await generateRequestNumber();
      const requestOtp = await uniqueRandomNumbers(4);

      const countryDial = await Country.findById(new ObjectId(user.countryCode));
      if (!countryDial) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid country code');
      }

      // Determine if it's a later ride
      const isLater = ride_type === 'RIDE_LATER';
      let tripTime = null;
      if (isLater && ride_date && ride_time) {
        tripTime = moment(`${ride_date} ${ride_time}`).toDate();
      }

      const requestParams = {
        requestNumber: requestNumber,
        requestOtp,
        userId: user._id,
        paymentOpt: payment_opt,
        unit: zone.unit,
        promoId: promocode_id,
        requestedCurrencyCode: countryDial.dial_code,
        requestedCurrencySymbol: countryDial.currency_symbol,
        bookingFor: booking_for,
        tripStartTime: moment(),
        rideType: ride_type,
        tripType: trip_type,
        isLater: isLater,
        tripTime: tripTime,
        packageId: packageId,
        packageKm: rental.km,
        packageHr: rental.hour,
        zoneId: zone._id || zone.zoneId,
      };

      const requestDetail = await Request.create(requestParams);

      // Handle booking for others
      let other_user = null;
      if (booking_for === 'OTHERS') {
        other_user = await User.create({
          firstName: req.body.others_name,
          phoneNumber: req.body.others_number,
        });
        requestDetail.others_user_id = other_user._id;
        await requestDetail.save();
      }

      await RequestPlace.create({
        pickLat: pick_lat,
        pickLng: pick_lng,
        dropLat: '',
        dropLng: '',
        pickAddress: req.body.pickup_address,
        dropAddress: '',
        requestId: requestDetail._id,
        vehicleType: vehicle_type,
      });

      if (!isLater) {
        const drivers = await fetchDriver(pick_lat, pick_lng, vehicle_type, trip_type, zone._id || zone.zoneId, '', '');

        if (!drivers || !drivers.length) {
          // Delete request place if exists
          await RequestPlace.deleteMany({ requestId: requestDetail._id });
          // Delete the request completely
          await Request.findByIdAndDelete(requestDetail._id);
          await session.commitTransaction();
          throw new ApiError(httpStatus.NOT_FOUND, 'No Driver Found');
        }

        let selectedDrivers = [];
        for (let driver of drivers) {
          const driverData = await Users.findById(driver.userId);

          const isDriverFree = (await RequestMeta.countDocuments({ driverId: driver.driverId, active: true })) === 0;
          if (isDriverFree) {
            selectedDrivers.push({
              user_id: driver.userId,
              driver_id: driver.driverId,
              active: selectedDrivers.length === 0 ? 1 : 0,
              request_id: requestDetail._id,
              assign_method: 1,
              created_at: new Date(),
              updated_at: new Date(),
            });
          }
        }

        if (!selectedDrivers.length) {
          // Delete request place if exists
          await RequestPlace.deleteMany({ requestId: requestDetail._id });
          // Delete the request completely
          await Request.findByIdAndDelete(requestDetail._id);
          await session.commitTransaction();
          throw new ApiError(httpStatus.NOT_FOUND, 'No Driver Found');
        }

        // Notify the first driver
        const firstDriver = selectedDrivers[0];
        const metaDriver = await Driver.findById(firstDriver.driver_id);

        if (metaDriver && metaDriver.userId) {
          await sendPushNotification(metaDriver.userId.toString(), {
            title: 'New Trip Requested',
            message: 'New Trip Requested, you can accept or Reject the request',
          });
        }

        // Save driver meta and request locations
        await RequestMeta.insertMany(
          selectedDrivers.map(({ user_id, request_id, driver_id, active, assign_method }) => ({
            userId: user_id,
            requestId: request_id,
            driverId: driver_id,
            active,
            assignMethod: assign_method,
          }))
        );

        let responseData = await getRequestListData(requestDetail._id);

        const driverTopic = mqttConfig.DRIVER_REQUEST + '' + firstDriver.driver_id;

        await mqttService.publishMessage(
          driverTopic,
          JSON.stringify({
            title: 'New Trip Requested',
            message: 'New Trip Requested, you can accept or Reject the request',
            tripDetails: responseData[0],
          })
        );

        await session.commitTransaction();
        return responseData[0];
      } else {
        await session.commitTransaction();
        return requestDetail;
      }
    } else {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid trip type');
    }
  } catch (error) {
    // Only abort if transaction is still active (not already committed or aborted)
    // If error is "No Driver Found", transaction was already committed after saving cancelled request
    if (session.inTransaction() && error.message !== 'No Driver Found') {
      await session.abortTransaction();
    }
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Get request status by ID (for polling)
 * @param {string} requestId - Request ID
 * @returns {Promise<Object>} Request with status and places
 */
const getWebRequestStatus = async (requestId) => {
  const request = await Request.findById(requestId)
    .populate('userId', 'firstName lastName phoneNumber')
    .populate({
      path: 'driverId',
      select: 'carNumber type userId',
      populate: [
        {
          path: 'userId',
          select: 'firstName lastName phoneNumber profilePic'
        },
        {
          path: 'type',
          select: 'vehicleName image capacity'
        }
      ]
    })
    .populate({
      path: 'vehicleId',
      select: 'vehicleName image capacity',
      model: 'Vehicle'
    })
    .lean();

  if (!request) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Request not found');
  }

  // Transform driver data structure to match frontend expectations
  if (request.driverId && typeof request.driverId === 'object') {
    const driver = request.driverId;
    // If driver has userId populated, use that for name and phone
    if (driver.userId) {
      request.driverId = {
        _id: driver._id,
        firstName: driver.userId.firstName || '',
        lastName: driver.userId.lastName || '',
        phoneNumber: driver.userId.phoneNumber || '',
        vehicleNumber: driver.carNumber || '',
        profileImage: driver.userId.profilePic || null
      };
    } else {
      // Fallback if userId not populated
      request.driverId = {
        _id: driver._id,
        firstName: '',
        lastName: '',
        phoneNumber: '',
        vehicleNumber: driver.carNumber || '',
        profileImage: null
      };
    }
    
    // If vehicleId is not set but driver.type is available, use that
    if (!request.vehicleId || (request.vehicleId && !request.vehicleId.vehicleName && driver.type)) {
      if (driver.type && driver.type.vehicleName) {
        request.vehicleId = driver.type;
      }
    }
  }

  // Transform vehicle data to match frontend expectations (type_name and type_image)
  if (request.vehicleId && typeof request.vehicleId === 'object') {
    // If vehicleId only has _id (not populated), try to fetch it manually
    if (request.vehicleId._id && !request.vehicleId.vehicleName && !request.vehicleId.type_name) {
      const vehicle = await Vehicle.findById(request.vehicleId._id).select('vehicleName image capacity').lean();
      if (vehicle) {
        request.vehicleId = {
          _id: vehicle._id,
          type_name: vehicle.vehicleName,
          type_image: vehicle.image,
          capacity: vehicle.capacity
        };
      }
    } else if (request.vehicleId.vehicleName) {
      // Transform vehicleName to type_name for frontend compatibility
      request.vehicleId = {
        _id: request.vehicleId._id,
        type_name: request.vehicleId.vehicleName,
        type_image: request.vehicleId.image,
        capacity: request.vehicleId.capacity
      };
    }
  }

  // Get request places (pickup/dropoff locations)
  const requestPlace = await RequestPlace.findOne({ requestId: new ObjectId(requestId) }).lean();
  
  if (requestPlace) {
    request.pickupAddress = requestPlace.pickAddress;
    request.dropoffAddress = requestPlace.dropAddress;
    request.pickupLocation = {
      lat: requestPlace.pickLat,
      lng: requestPlace.pickLng,
    };
    request.dropoffLocation = {
      lat: requestPlace.dropLat,
      lng: requestPlace.dropLng,
    };
  }

  return request;
};

/**
 * Cancel web request (duplicate from mobile, adapted for web - no clientId)
 * @param {Object} req - Express request object
 * @returns {Promise<Object>} Cancelled request details
 */
const cancelWebRequest = async (req) => {
  let userId = null;
  if (req.user && req.user._id) {
    userId = req.user._id.toString();
  } else {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'User authentication required');
  }

  const { requestId, reasonId } = req.body;
  
  try {
    const tripRequest = await Request.findById(requestId);
    if (!tripRequest) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Trip request not found');
    }

    // Check if user owns this request
    if (tripRequest.userId.toString() !== userId) {
      throw new ApiError(httpStatus.FORBIDDEN, 'You do not have permission to cancel this request');
    }

    const trip = await RequestMeta.find({ requestId: requestId, active: true });
    
    if (!trip || trip.length === 0) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Trip not found.');
    }

    // Common cancellation logic
    tripRequest.cancelledAt = new Date();
    tripRequest.isCancelled = true;
    tripRequest.canceledBy = userId;
    tripRequest.cancelMethod = 'User';
    if (reasonId) {
      tripRequest.reasonId = reasonId;
    }
    await tripRequest.save();

    // Determine driver (either from tripRequest or trip[0])
    const driverId = tripRequest.driverId || (trip[0]?.driverId || null);
    let driver = driverId ? await Driver.findById(driverId) : null;

    // Notify driver if exists
    if (driver) {
      await sendPushNotification(driver.userId.toString(), {
        title: "TRIP_CANCELLED",
        message: "Trip Cancelled By user"
      });
    } else {
      const filter = { requestId: requestId };
      await RequestBid.deleteMany(filter);
    }

    // Clean up and return response
    const filter = { requestId: requestId };
    await RequestMeta.deleteMany(filter);

    return {
      'requestDetail': tripRequest,
      'message': 'Your Ride Is Canceled'
    };
  } catch (err) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, err.message || 'Failed to cancel request');
  }
};

/**
 * Web-specific ETA service (no clientId required)
 * @param {Object} req - Request object with body containing ride details
 * @returns {Promise<Object>} ETA data with zone and vehicle prices
 */
const getWebRideTypes = async (req) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { 
      pick_lat, 
      pick_lng, 
      drop_lat, 
      drop_long, 
      drop_address,
      pickup_address,
      ride_type, 
      ride_time, 
      ride_date,
      trip_type,
      stops, 
      promo_code 
    } = req.body;

    // Get user if authenticated (optional for web)
    let user = null;

    if (req.user && req.user._id) {
      user = await User.findById(req.user._id);

      if (user && !user.active) {
        throw new ApiError(httpStatus.FORBIDDEN, 'User is blocked, please contact admin');
      }
    }

    // For web, we need to get zones without clientId requirement
    // Create a modified req object that doesn't require clientId
    // We'll use a default approach: get all zones or use a default zone
    const webReq = {
      ...req,
      body: {
        ...req.body,
        pick_lat,
        pick_lng,
      },
      headers: {
        ...req.headers,
        // Remove clientId requirement for web
        clientid: null,
      }
    };

    // Try to get zone - if getPickupZone fails due to no clientId, 
    // we'll need to modify it or use an alternative approach
    // For now, let's try calling it and handle the error
    let zone;
    try {
      zone = await webGetPickupZone(webReq);
    } catch (error) {
      // If getPickupZone requires clientId, we need to get zones differently
      // For web, we might need to get all zones or use a default zone
      // This is a temporary solution - you may need to modify getPickupZone 
      // to handle web requests without clientId
      throw new ApiError(httpStatus.BAD_REQUEST, 'Zone lookup requires configuration. Please contact support.');
    }

    if (!zone || zone.nonServiceZone === 'Yes') {
      throw new ApiError(httpStatus.NOT_FOUND, 'Non-service zone');
    }

    let distance = await calculateDistance(pick_lat, pick_lng, drop_lat, drop_long, stops);

    if (zone.unit != "KM") {
      distance = distance * 0.6213711922;
    }

    // Calculate zone prices (web version - no clientId)
    const zonePrice = await webCalculateZonePrices(webReq, zone, distance, ride_type, promo_code, user, ride_time, ride_date, drop_lat, drop_long);

    const dataResponse = createDataResponse(zone);
    dataResponse.zoneTypePrice = zonePrice;

    await session.commitTransaction();

    return dataResponse;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const getTripByReports = async (filterDate) => {
  try {
    const matchStage = [];

    if (filterDate) {
      // Parse MM/DD/YYYY format to ISO date range
      const [month, day, year] = filterDate.split('/');
      const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

      matchStage.push({
        $match: {
          createdAt: {
            $gte: new Date(`${isoDate}T00:00:00.000Z`),
            $lt: new Date(`${isoDate}T23:59:59.999Z`),
          },
        },
      });
    }

    const result = await Request.aggregate([
      ...matchStage,
      {
        $project: {
          date: { $dateToString: { format: "%m/%d/%Y", date: "$createdAt" } },
          ifDispatch: 1,
          isCompleted: 1,
          isCancelled: 1,
        },
      },
      {
        $group: {
          _id: {
            date: "$date",
            ifDispatch: "$ifDispatch",
            isCompleted: "$isCompleted",
            isCancelled: "$isCancelled",
          },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: "$_id.date",
          dispatcherCompleted: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ["$_id.ifDispatch", true] }, { $eq: ["$_id.isCompleted", true] }] },
                "$count",
                0,
              ],
            },
          },
          dispatcherCancelled: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ["$_id.ifDispatch", true] }, { $eq: ["$_id.isCancelled", true] }] },
                "$count",
                0,
              ],
            },
          },
          mobileCompleted: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ["$_id.ifDispatch", false] }, { $eq: ["$_id.isCompleted", true] }] },
                "$count",
                0,
              ],
            },
          },
          mobileCancelled: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ["$_id.ifDispatch", false] }, { $eq: ["$_id.isCancelled", true] }] },
                "$count",
                0,
              ],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          dispatcherCompleted: { $toString: "$dispatcherCompleted" },
          dispatcherCancelled: { $toString: "$dispatcherCancelled" },
          mobileCompleted: { $toString: "$mobileCompleted" },
          mobileCancelled: { $toString: "$mobileCancelled" },
        },
      },
      { $sort: { date: 1 } },
    ]);

    return result;
  } catch (err) {
    console.error('Error generating trip report:', err);
    throw new Error('Failed to generate trip report');
  }
};

const getByTripCount = async (clientId) => {

  try {
    const tripCounts = await Request.aggregate([
      {
        $group: {
          _id: null,
          startedTrips: { $sum: { $cond: [{ $eq: ['$isTripStart', true] }, 1, 0] } },
          completedTrips: { $sum: { $cond: [{ $eq: ['$isCompleted', true] }, 1, 0] } },
          cancelledTrips: { $sum: { $cond: [{ $eq: ['$isCancelled', true] }, 1, 0] } },
          InProgressTrips: { $sum: { $cond: [{ $eq: ['$isarrivedAt', true] }, 1, 0] } }
        }
      }
    ]);

    return tripCounts.length > 0
      ? {
        start: tripCounts[0].startedTrips,
        InProgress: tripCounts[0].InProgressTrips,
        completed: tripCounts[0].completedTrips,
        cancelled: tripCounts[0].cancelledTrips,

      }
      : { start: 0, InProgress: 0, completed: 0, cancelled: 0 };
  } catch (error) {
    throw new Error(`Failed to fetch trip status counts: ${error.message}`);
  }
};
const getLastTrips = async () => {
  try {
    const result = await Request.aggregate([
      {
        $sort: { createdAt: -1 } // Sort by createdAt in descending order
      },
      {
        $lookup: {
          from: 'requestplaces',
          localField: '_id',
          foreignField: 'requestId',
          as: 'pickupPlace', // The name of the resulting array containing the joined data
        }
      },
      {
        $lookup: {
          from: 'requestplaces',
          localField: '_id',
          foreignField: 'requestId',
          as: 'dropPlace', // The name of the resulting array containing the joined data
        }
      },
      {
        $unwind: { path: '$pickupPlace', preserveNullAndEmptyArrays: true } // Unwind pickupPlace array
      },
      {
        $unwind: { path: '$dropPlace', preserveNullAndEmptyArrays: true } // Unwind dropPlace array
      },
      {
        $match: {
          $or: [
            { 'pickupPlace.pickAddress': { $ne: null } },
            { 'dropPlace.dropAddress': { $ne: null } }
          ]
        }
      },   
      {
        $limit: 5 // Limit to the last 5 requests
      },     
      {
        $project: {
          requestNumber: 1,
          pickupAddress: { $ifNull: ['$pickupPlace.pickAddress', 'N/A'] },
          dropAddress: { $ifNull: ['$dropPlace.dropAddress', 'N/A'] },
          status: {
            $cond: {
              if: { $eq: ['$isCancelled', true] }, // If cancelled
              then: 'cancelled',
              else: {
                $cond: {
                  if: { $eq: ['$isCompleted', true] }, // If completed
                  then: 'completed',
                  else: {
                    $cond: {
                      if: { $eq: ['$isTripStart', true] }, // If trip started
                      then: 'Trip Started',
                      else: {
                        $cond: {
                          if: { $eq: ['$isDriverArrived', true] }, // If driver arrived
                          then: 'Driver Arrived',
                          else: {
                            $cond: {
                              if: { $eq: ['$isDriverStarted', true] }, // If driver started
                              then: 'Driver Started',
                              else: 'Not Started' // Default status if none of the above match
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          progress: {
            $cond: {
              if: { $eq: ['$isCancelled', true] },
              then: 0,
              else: {
                $cond: {
                  if: { $eq: ['$isCompleted', true] },
                  then: 100,
                  else: {
                    $cond: {
                      if: { $eq: ['$isTripStart', true] },
                      then: 25,
                      else: {
                        $cond: {
                          if: { $eq: ['$isDriverArrived', true] },
                          then: 50,
                          else: 0 // Default progress if none match
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    ]);

    return result; // Return the last 5 requests with their statuses and progress
  } catch (error) {
    console.error(error);
    throw new Error('Error fetching requests with places');
  }
};
const getLogisticsByEarnings = async (clientId) => {
  const report = await Request.aggregate([
    {
      $lookup: {
        from: 'requestbills',
        localField: '_id',
        foreignField: 'requestId',
        as: 'billData',
      },
    },
    {
      $unwind: '$billData',
    },
    {
      $group: {
        _id: {
          day: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          week: { $isoWeek: '$createdAt' },
          month: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          year: { $dateToString: { format: '%Y', date: '$createdAt' } },
        },
        totalAmount: { $sum: '$billData.totalAmount' },
      },
    },
    {
      $group: {
        _id: null,
        daily: {
          $push: {
            date: '$_id.day',
            totalAmount: '$totalAmount',
          },
        },
        weekly: {
          $push: {
            week: '$_id.week',
            totalAmount: '$totalAmount',
          },
        },
        monthly: {
          $push: {
            month: '$_id.month',
            totalAmount: '$totalAmount',
          },
        },
        yearly: {
          $push: {
            year: '$_id.year',
            totalAmount: '$totalAmount',
          },
        },
      },
    },
    {
      $project: {
        daily: 1,
        weekly: 1,
        monthly: 1,
        yearly: 1,
      },
    },
  ]);

  // Return the first report if available
  return report.length > 0 ? report[0] : {};
};

const getByTotalEarnings = async (clientId) => {
  const earnings = await Request.aggregate([
    {
      $match: { clientId: clientId }
    },
    {
      $lookup: {
        from: 'requestbills',
        localField: '_id',
        foreignField: 'requestId',
        as: 'billData',
      },
    },
    { $unwind: "$billData" },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          week: { $isoWeek: "$createdAt" },
          month: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          year: { $year: "$createdAt" },
          tripType: "$tripType"
        },
        totalAmount: { $sum: "$billData.totalAmount" }
      }
    },
    {
      $group: {
        _id: null,
        daily: {
          $push: {
            date: "$_id.date",
            tripType: "$_id.tripType",
            totalAmount: "$totalAmount"
          }
        },
        weekly: {
          $push: {
            week: "$_id.week",
            tripType: "$_id.tripType",
            totalAmount: "$totalAmount"
          }
        },
        monthly: {
          $push: {
            month: "$_id.month",
            tripType: "$_id.tripType",
            totalAmount: "$totalAmount"
          }
        },
        yearly: {
          $push: {
            year: "$_id.year",
            tripType: "$_id.tripType",
            totalAmount: "$totalAmount"
          }
        }
      }
    },
    {
      $project: {
        _id: 0,
        daily: 1,
        weekly: 1,
        monthly: 1,
        yearly: 1
      }
    }
  ]);

  if (earnings.length === 0) {
    return {
      success: true,
      data: { daily: [], weekly: [], monthly: [], yearly: [] },
      message: "No earnings data found"
    };
  }

  // Process data to separate local and outstation revenue
  const formatEarnings = (data) => {
    const formatted = [];
    data.forEach(entry => {
      let existing = formatted.find(item => item.date === entry.date || item.week === entry.week || item.month === entry.month || item.year === entry.year);

      if (!existing) {
        existing = { date: entry.date, week: entry.week, month: entry.month, year: entry.year, localRevenue: 0, outstationRevenue: 0 };
        formatted.push(existing);
      }

      if (entry.tripType === "LOCAL") {
        existing.localRevenue = entry.totalAmount;
      } else if (entry.tripType === "OUTSTATION") {
        existing.outstationRevenue = entry.totalAmount;
      }
    });

    return formatted;
  };

  return {
    success: true,
    data: {
      daily: formatEarnings(earnings[0].daily),
      weekly: formatEarnings(earnings[0].weekly),
      monthly: formatEarnings(earnings[0].monthly),
      yearly: formatEarnings(earnings[0].yearly)
    },
    message: "Total Earnings retrieved successfully"
  };
};
const getUserTrips = async (userId) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const trips = await Request.aggregate([
      { $match: { userId: new ObjectId(userId) } },

      {
        $lookup: {
          from: 'requestplaces',
          localField: '_id',
          foreignField: 'requestId',
          as: 'places',
        },
      },

      {
        $lookup: {
          from: 'requestbills',
          localField: '_id',
          foreignField: 'requestId',
          as: 'bills',
        },
      },

      {
        $unwind: { path: '$places', preserveNullAndEmptyArrays: true },
      },
      {
        $unwind: { path: '$bills', preserveNullAndEmptyArrays: true },
      },
      {
        $project: {
          _id: 1,
          requestNumber: 1,
          pickAddress: '$places.pickAddress',
          dropAddress: '$places.dropAddress',
          totalAmount: '$bills.totalAmount',

          status: {
            $cond: {
              if: { $eq: ['$isCancelled', true] },
              then: 'cancelled',
              else: {
                $cond: {
                  if: { $eq: ['$isCompleted', true] },
                  then: 'completed',
                  else: {
                    $cond: {
                      if: { $eq: ['$isTripStart', true] },
                      then: 'Trip Started',
                      else: {
                        $cond: {
                          if: { $eq: ['$isDriverArrived', true] },
                          then: 'Driver Arrived',
                          else: {
                            $cond: {
                              if: { $eq: ['$isDriverStarted', true] },
                              then: 'Driver Started',
                              else: 'Not Started'
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
        },
      },
    ]);

    return trips;
  } catch (error) {
    throw new Error('Failed to fetch user trips');
  }
};

const getDriverRequestTrips = async (userId) => {
  try {
    // Validate userId
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid or missing User ID");
    }

    // Convert userId to ObjectId
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Find the driver's ID where userId matches in the drivers collection
    const driver = await Driver.findOne({ userId: userObjectId });

    if (!driver) {
      throw new Error("Driver not found for the given User ID");
    }

    const driverId = driver._id; // Extract the driver's ID

    // Fetch trips where driverId matches
    const trips = await Request.aggregate([
      { $match: { driverId: driverId } }, // Match trips by driverId

      // Lookup pickup and drop locations
      {
        $lookup: {
          from: "requestplaces",
          localField: "_id",
          foreignField: "requestId",
          as: "places",
        },
      },

      // Lookup trip billing details
      {
        $lookup: {
          from: "requestbills",
          localField: "_id",
          foreignField: "requestId",
          as: "bills",
        },
      },

      // Unwind the lookup results to flatten them
      { $unwind: { path: "$places", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$bills", preserveNullAndEmptyArrays: true } },

      // Project the required fields
      {
        $project: {
          _id: 1,
          requestNumber: 1,
          pickAddress: "$places.pickAddress",
          dropAddress: "$places.dropAddress",
          totalAmount: "$bills.totalAmount",
          status: {
            $cond: {
              if: { $eq: ["$isCancelled", true] },
              then: "Cancelled",
              else: {
                $cond: {
                  if: { $eq: ["$isCompleted", true] },
                  then: "Completed",
                  else: {
                    $cond: {
                      if: { $eq: ["$isTripStart", true] },
                      then: "Trip Started",
                      else: {
                        $cond: {
                          if: { $eq: ["$isDriverArrived", true] },
                          then: "Driver Arrived",
                          else: {
                            $cond: {
                              if: { $eq: ["$isDriverStarted", true] },
                              then: "Driver Started",
                              else: "Not Started",
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    ]);

    return trips;
  } catch (error) {
    throw new Error(`Failed to fetch driver trips: ${error.message}`);
  }
};

const getTripsByDriver = async (clientId) => {
  if (!clientId || !mongoose.Types.ObjectId.isValid(clientId)) {
    throw new ApiError(httpStatus.NOT_FOUND, 'clientId not found');
  }

  const now = new Date();
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const startOfWeek = new Date();
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  try {
    const baseAggregation = [
      // { $match: { clientId: new ObjectId(clientId) } },
      {
        $lookup: {
          from: "drivers",
          localField: "driverId",
          foreignField: "_id",
          as: "driverDetails",
        },
      },
      {
        $unwind: {
          path: "$driverDetails",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "driverDetails.userId",
          foreignField: "_id",
          as: "driverPersonalDetails",
        },
      },
      {
        $unwind:
        {
          path: "$driverPersonalDetails",
          // preserveNullAndEmptyArrays: true 
        }
      },
      {
        $addFields: {
          driverName: {
            $ifNull: [
              { $concat: ["$driverPersonalDetails.firstName", " ", "$driverPersonalDetails.lastName"] },
              "Unknown Driver",
            ],
          },
        },
      },
      { $match: { driverId: { $ne: null } } },
      {
        $group: {
          _id: "$driverId",
          driverName: { $first: "$driverName" },
          tripCountToday: {
            $sum: {
              $sum: {
                $cond: [{
                  $and: [
                    { $gte: ["$createdAt", startOfToday] },
                    { $eq: ["$isCompleted", true] }]
                }, 1, 0]
              }
            },
          },
          tripCountThisWeek: {
            $sum: {
              $sum: {
                $cond: [{
                  $and: [
                    { $gte: ["$createdAt", startOfWeek] },
                    { $eq: ["$isCompleted", true] }]
                }, 1, 0]
              }
            },
          },
          tripCountThisMonth: {
            $sum: {
              $sum: {
                $cond: [{
                  $and: [
                    { $gte: ["$createdAt", startOfMonth] },
                    { $eq: ["$isCompleted", true] }]
                }, 1, 0]
              }
            },
          },
          tripCountAllTime: { $sum: { $cond: [{ $eq: ["$isCompleted", true] }, 1, 0] } }
        },
      },
      {
        $project: {
          driverId: "$_id",
          driverName: 1,
          tripCountToday: 1,
          tripCountThisWeek: 1,
          tripCountThisMonth: 1,
          tripCountAllTime: 1,
          _id: 0,
        },
      },
    ];

    const sortAndLimit = (field) => [
      { $match: { [field]: { $gt: 0 } } },
      { $sort: { [field]: -1 } },
      { $limit: 5 },
    ];

    const [today, thisWeek, thisMonth, allTime] = await Promise.all([
      Request.aggregate([...baseAggregation, ...sortAndLimit("tripCountToday")]),
      Request.aggregate([...baseAggregation, ...sortAndLimit("tripCountThisWeek")]),
      Request.aggregate([...baseAggregation, ...sortAndLimit("tripCountThisMonth")]),
      Request.aggregate([...baseAggregation, ...sortAndLimit("tripCountAllTime")]),
    ]);

    // Transform data into required structure
    const formatResponse = (data, key) =>
      data.map((item, index) => ({
        id: index + 1, // Assigning rank-based ID
        name: item.driverName,
        trips: item[key],
        driverId: item.driverId
      }));

    return {
      "Today": formatResponse(today, "tripCountToday"),
      "This Week": formatResponse(thisWeek, "tripCountThisWeek"),
      "This Month": formatResponse(thisMonth, "tripCountThisMonth"),
      "All Time": formatResponse(allTime, "tripCountAllTime"),
    };
  } catch (error) {
    console.error("Error fetching driver trip reports:", error);
    throw new Error("Failed to fetch  driver trip reports");
  }
};

const getTripsByUser = async (clientId) => {
  if (!clientId || !mongoose.Types.ObjectId.isValid(clientId)) {
    throw new ApiError(httpStatus.NOT_FOUND, 'clientId not found');
  }

  const now = new Date();
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const startOfWeek = new Date();
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  try {
    const baseAggregation = [
      // { $match: { clientId: new ObjectId(clientId) } },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $unwind: {
          path: "$userDetails",
          // preserveNullAndEmptyArrays: true 
        }
      },

      {
        $addFields: {
          userName: {
            $ifNull: [
              { $concat: ["$userDetails.firstName", " ", "$userDetails.lastName"] },
              "Unknown User",
            ],
          },
        },
      },
      { $match: { userId: { $ne: null } } },
      {
        $group: {
          _id: "$userId",
          userName: { $first: "$userName" },
          tripCountToday: {
            $sum: {
              $sum: {
                $cond: [{
                  $and: [
                    { $gte: ["$createdAt", startOfToday] },
                    { $eq: ["$isCompleted", true] }]
                }, 1, 0]
              }
            },
          },
          tripCountThisWeek: {
            $sum: {
              $sum: {
                $cond: [{
                  $and: [
                    { $gte: ["$createdAt", startOfWeek] },
                    { $eq: ["$isCompleted", true] }]
                }, 1, 0]
              }
            },
          },
          tripCountThisMonth: {
            $sum: {
              $sum: {
                $cond: [{
                  $and: [
                    { $gte: ["$createdAt", startOfMonth] },
                    { $eq: ["$isCompleted", true] }]
                }, 1, 0]
              }
            },
          },
          tripCountAllTime: { $sum: { $cond: [{ $eq: ["$isCompleted", true] }, 1, 0] } }
        },
      },
      {
        $project: {
          userId: "$_id",
          userName: 1,
          tripCountToday: 1,
          tripCountThisWeek: 1,
          tripCountThisMonth: 1,
          tripCountAllTime: 1,
          _id: 0,
        },
      },
    ];

    const sortAndLimit = (field) => [
      { $match: { [field]: { $gt: 0 } } },
      { $sort: { [field]: -1 } },
      { $limit: 5 },
    ];

    const [today, thisWeek, thisMonth, allTime] = await Promise.all([
      Request.aggregate([...baseAggregation, ...sortAndLimit("tripCountToday")]),
      Request.aggregate([...baseAggregation, ...sortAndLimit("tripCountThisWeek")]),
      Request.aggregate([...baseAggregation, ...sortAndLimit("tripCountThisMonth")]),
      Request.aggregate([...baseAggregation, ...sortAndLimit("tripCountAllTime")]),
    ]);

    // Transform data into required structure
    const formatResponse = (data, key) =>
      data.map((item, index) => ({
        id: index + 1, // Assigning rank-based ID
        name: item.userName,
        trips: item[key],
      }));

    return {
      "Today": formatResponse(today, "tripCountToday"),
      "This Week": formatResponse(thisWeek, "tripCountThisWeek"),
      "This Month": formatResponse(thisMonth, "tripCountThisMonth"),
      "All Time": formatResponse(allTime, "tripCountAllTime"),
    };
  } catch (error) {
    console.error("Error fetching user trip reports:", error);
    throw new Error("Failed to fetch user trip reports");
  }
};

const getDriverSummary = async () => {
  try {
    const result = await Request.aggregate([
      // Lookup the customer/user
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userData',
        },
      },
      {
        $unwind: {
          path: '$userData',
          preserveNullAndEmptyArrays: true,
        },
      },
      // Lookup the driver from the drivers collection
      {
        $lookup: {
          from: 'drivers',
          localField: 'driverId',
          foreignField: '_id',
          as: 'driverData',
        },
      },
      {
        $unwind: {
          path: '$driverData',
          preserveNullAndEmptyArrays: true,
        },
      },
      // Lookup the driver user data from users collection
      {
        $lookup: {
          from: 'users',
          localField: 'driverData.userId',
          foreignField: '_id',
          as: 'driverUserData',
        },
      },
      {
        $unwind: {
          path: '$driverUserData',
          preserveNullAndEmptyArrays: true,
        },
      },
      // Lookup request places
      {
        $lookup: {
          from: 'requestplaces',
          localField: '_id',
          foreignField: 'requestId',
          as: 'requestPlaceData',
        },
      },
      {
        $unwind: {
          path: '$requestPlaceData',
          preserveNullAndEmptyArrays: true,
        },
      },
      // Lookup request bills to get the billing data
      {
        $lookup: {
          from: 'requestbills',
          localField: '_id',
          foreignField: 'requestId',
          as: 'requestBillData',
        },
      },
      {
        $unwind: {
          path: '$requestBillData',
          preserveNullAndEmptyArrays: true,
        },
      },
      // Project the required fields
      {
        $project: {
          requestNumber: 1,
          driverName: {
            $ifNull: [
              { $concat: ['$driverUserData.firstName', ' ', '$driverUserData.lastName'] },
              'N/A',
            ],
          },
          serviceType: { $ifNull: ['$serviceType', 'Standard'] }, // Assuming 'serviceType' is a field on 'Request'
          customerName: { $concat: ['$userData.firstName', ' ', '$userData.lastName'] },
          contactNumber: '$userData.phoneNumber',
          userId: '$userData._id',
          startTime: '$tripStartTime',
          startLocation: '$requestPlaceData.pickAddress',
          endTime: '$completedAt',
          driverId: '$driverData.userId',
          endLocation: '$requestPlaceData.dropAddress',
          basePrice: { $ifNull: ['$requestBillData.basePrice', 0] },
          waitingCharges: { $ifNull: ['$requestBillData.waitingCharge', 0] },
          promoBonus: { $ifNull: ['$requestBillData.promoDiscount', 0] },
          serviceTax: { $ifNull: ['$requestBillData.serviceTax', 0] },
          distanceCharges: { $ifNull: ['$requestBillData.distancePrice', 0] },
          totalCharges: { $ifNull: ['$requestBillData.totalAmount', 0] },
          driverAmount: { $ifNull: ['$requestBillData.driverCommission', 0] },
          companyServiceCharge: { $ifNull: ['$requestBillData.adminCommission', 0] },
        },
      },
    ]);

    return result; // Return the filtered data
  } catch (error) {
    console.error(error);
    throw new Error('Error fetching request data');
  }
};
const getTripWiseReports = async (filterDate) => {
  try {
    const matchStage = [];

    if (filterDate) {
      // Parse MM/DD/YYYY format to ISO
      const [month, day, year] = filterDate.split('/');
      const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

      matchStage.push({
        $match: {
          createdAt: {
            $gte: new Date(`${isoDate}T00:00:00.000Z`),
            $lt: new Date(`${isoDate}T23:59:59.999Z`),
          },
        },
      });
    }

    const trips = await Request.aggregate([
      ...matchStage,
      {
        $match: {
          $or: [
            { isCompleted: true },
            { isCancelled: true },
          ],
        },
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%m/%d/%Y", date: "$createdAt" } },
            tripType: "$tripType",
            isCompleted: "$isCompleted",
            isCancelled: "$isCancelled",
          },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: { date: "$_id.date", tripType: "$_id.tripType" },
          localCompleted: {
            $sum: {
              $cond: [
                { $eq: ["$_id.tripType", "LOCAL"] },
                { $cond: [{ $eq: ["$_id.isCompleted", true] }, "$count", 0] },
                0,
              ],
            },
          },
          localCancelled: {
            $sum: {
              $cond: [
                { $eq: ["$_id.tripType", "LOCAL"] },
                { $cond: [{ $eq: ["$_id.isCancelled", true] }, "$count", 0] },
                0,
              ],
            },
          },
          rentalCompleted: {
            $sum: {
              $cond: [
                { $eq: ["$_id.tripType", "RENTAL"] },
                { $cond: [{ $eq: ["$_id.isCompleted", true] }, "$count", 0] },
                0,
              ],
            },
          },
          rentalCancelled: {
            $sum: {
              $cond: [
                { $eq: ["$_id.tripType", "RENTAL"] },
                { $cond: [{ $eq: ["$_id.isCancelled", true] }, "$count", 0] },
                0,
              ],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          date: "$_id.date",
          tripType: "$_id.tripType",
          localCompleted: { $toString: "$localCompleted" },
          localCancelled: { $toString: "$localCancelled" },
          rentalCompleted: { $toString: "$rentalCompleted" },
          rentalCancelled: { $toString: "$rentalCancelled" },
        },
      },
      { $sort: { date: 1 } },
    ]);

    return trips;
  } catch (error) {
    console.error("Error fetching trip reports:", error);
    throw new Error("Failed to fetch trip reports");
  }
};


const getCompletedLocalTrip = async () => {
  try {
    const result = await Request.aggregate([
      // Match only LOCAL trips that are completed
      {
        $match: {
          tripType: 'LOCAL',        // Ensure the trip type is LOCAL
          isCompleted: true,        // Ensure the trip is completed
        },
      },
      // Lookup the customer/user
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userData',
        },
      },
      {
        $unwind: {
          path: '$userData',
          preserveNullAndEmptyArrays: true,
        },
      },
      // Lookup the driver from the drivers collection
      {
        $lookup: {
          from: 'drivers',
          localField: 'driverId',
          foreignField: '_id',
          as: 'driverData',
        },
      },
      {
        $unwind: {
          path: '$driverData',
          preserveNullAndEmptyArrays: true,
        },
      },
      // Lookup the driver user data from users collection
      {
        $lookup: {
          from: 'users',
          localField: 'driverData.userId',
          foreignField: '_id',
          as: 'driverUserData',
        },
      },
      {
        $unwind: {
          path: '$driverUserData',
          preserveNullAndEmptyArrays: true,
        },
      },
      // Lookup request places
      {
        $lookup: {
          from: 'requestplaces',
          localField: '_id',
          foreignField: 'requestId',
          as: 'requestPlaceData',
        },
      },
      {
        $unwind: {
          path: '$requestPlaceData',
          preserveNullAndEmptyArrays: true,
        },
      },
      // Lookup request bills to get the billing data
      {
        $lookup: {
          from: 'requestbills',
          localField: '_id',
          foreignField: 'requestId',
          as: 'requestBillData',
        },
      },
      {
        $unwind: {
          path: '$requestBillData',
          preserveNullAndEmptyArrays: true,
        },
      },
      // Project the required fields
      {
        $project: {
          requestNumber: 1,
          driverName: {
            $ifNull: [
              { $concat: ['$driverUserData.firstName', ' ', '$driverUserData.lastName'] },
              'N/A',
            ],
          },
          serviceType: { $ifNull: ['$serviceType', 'Standard'] }, // Assuming 'serviceType' is a field on 'Request'
          customerName: { $concat: ['$userData.firstName', ' ', '$userData.lastName'] },
          contactNumber: '$userData.phoneNumber',
          userId: '$userData._id',
          driverId: '$driverData.userId',
          startTime: '$tripStartTime',
          startLocation: '$requestPlaceData.pickAddress',
          endTime: '$completedAt',
          endLocation: '$requestPlaceData.dropAddress',
          basePrice: { $ifNull: ['$requestBillData.basePrice', 0] },
          waitingCharges: { $ifNull: ['$requestBillData.waitingCharge', 0] },
          promoBonus: { $ifNull: ['$requestBillData.promoDiscount', 0] },
          serviceTax: { $ifNull: ['$requestBillData.serviceTax', 0] },
          distanceCharges: { $ifNull: ['$requestBillData.distancePrice', 0] },
          totalCharges: { $ifNull: ['$requestBillData.totalAmount', 0] },
          driverAmount: { $ifNull: ['$requestBillData.driverCommission', 0] },
          companyServiceCharge: { $ifNull: ['$requestBillData.adminCommission', 0] },
        },
      },
    ]);

    return result; // Return the filtered data
  } catch (error) {
    console.error(error);
    throw new Error('Error fetching request data');
  }
};
const getCompletedRentalTrip = async () => {
  try {
    const result = await Request.aggregate([
      // Match only LOCAL trips that are completed
      {
        $match: {
          tripType: 'RENTAL',        // Ensure the trip type is LOCAL
          isCompleted: true,        // Ensure the trip is completed
        },
      },
      // Lookup the customer/user
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userData',
        },
      },
      {
        $unwind: {
          path: '$userData',
          preserveNullAndEmptyArrays: true,
        },
      },
      // Lookup the driver from the drivers collection
      {
        $lookup: {
          from: 'drivers',
          localField: 'driverId',
          foreignField: '_id',
          as: 'driverData',
        },
      },
      {
        $unwind: {
          path: '$driverData',
          preserveNullAndEmptyArrays: true,
        },
      },
      // Lookup the driver user data from users collection
      {
        $lookup: {
          from: 'users',
          localField: 'driverData.userId',
          foreignField: '_id',
          as: 'driverUserData',
        },
      },
      {
        $unwind: {
          path: '$driverUserData',
          preserveNullAndEmptyArrays: true,
        },
      },
      // Lookup request places
      {
        $lookup: {
          from: 'requestplaces',
          localField: '_id',
          foreignField: 'requestId',
          as: 'requestPlaceData',
        },
      },
      {
        $unwind: {
          path: '$requestPlaceData',
          preserveNullAndEmptyArrays: true,
        },
      },
      // Lookup request bills to get the billing data
      {
        $lookup: {
          from: 'requestbills',
          localField: '_id',
          foreignField: 'requestId',
          as: 'requestBillData',
        },
      },
      {
        $unwind: {
          path: '$requestBillData',
          preserveNullAndEmptyArrays: true,
        },
      },
      // Project the required fields
      {
        $project: {
          requestNumber: 1,
          driverName: {
            $ifNull: [
              { $concat: ['$driverUserData.firstName', ' ', '$driverUserData.lastName'] },
              'N/A',
            ],
          },
          serviceType: { $ifNull: ['$serviceType', 'Standard'] }, // Assuming 'serviceType' is a field on 'Request'
          customerName: { $concat: ['$userData.firstName', ' ', '$userData.lastName'] },
          contactNumber: '$userData.phoneNumber',
          userId: '$userData._id',
          startTime: '$tripStartTime',
          startLocation: '$requestPlaceData.pickAddress',
          endTime: '$completedAt',
          driverId: '$driverData.userId',

          endLocation: '$requestPlaceData.dropAddress',
          basePrice: { $ifNull: ['$requestBillData.basePrice', 0] },
          waitingCharges: { $ifNull: ['$requestBillData.waitingCharge', 0] },
          promoBonus: { $ifNull: ['$requestBillData.promoDiscount', 0] },
          serviceTax: { $ifNull: ['$requestBillData.serviceTax', 0] },
          distanceCharges: { $ifNull: ['$requestBillData.distancePrice', 0] },
          totalCharges: { $ifNull: ['$requestBillData.totalAmount', 0] },
          driverAmount: { $ifNull: ['$requestBillData.driverCommission', 0] },
          companyServiceCharge: { $ifNull: ['$requestBillData.adminCommission', 0] },
        },
      },
    ]);

    return result; // Return the filtered data
  } catch (error) {
    console.error(error);
    throw new Error('Error fetching request data');
  }
};

const getRentalList = async () => {
  const request = await Request.aggregate([
    {
      $match: {
        tripType: 'RENTAL'
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'userDetails'
      }
    },
    {
      $lookup: {
        from: 'drivers',
        localField: 'driverId',
        foreignField: '_id',
        as: 'driverDetails'
      }
    },
    {
      $lookup: {
        from: 'requestplaces',
        localField: '_id',
        foreignField: 'requestId',
        as: 'requestPlace'
      }
    },
    {
      $unwind: { path: '$userDetails', preserveNullAndEmptyArrays: true }
    },
    {
      $unwind: { path: '$driverDetails', preserveNullAndEmptyArrays: true }
    },
    {
      $unwind: { path: '$requestPlace', preserveNullAndEmptyArrays: true }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'driverDetails.userId',
        foreignField: '_id',
        as: 'driverPersonalDetails'
      }
    },
    {
      $unwind: { path: '$driverPersonalDetails', preserveNullAndEmptyArrays: true }
    },
    {
      $project: {
        requestId: "$requestNumber",
        userName: {
          $ifNull: [{
            $concat: ['$userDetails.firstName', ' ', '$userDetails.lastName']
          }, " "]
        },
        driverName: {
          $ifNull: [{
            $concat: ['$driverPersonalDetails.firstName', ' ', '$driverPersonalDetails.lastName']
          }, " "]
        },
        date: { $dateToString: { format: '%d-%m-%Y', date: '$tripStartTime' } },
        tripFrom: "$requestPlace.pickAddress",
        tripTo: "$requestPlace.dropAddress",
        status: {
          $cond: {
            if: {
              $and: [
                { $eq: ["$isCompleted", true] },
                { $eq: ["$isCancelled", false] },
              ]
            },
            then: "Completed",
            else: {
              $cond: {
                if: {
                  $and: [
                    { $eq: ["$isCancelled", true] },
                    { $eq: ["$isCompleted", false] },
                  ]
                },
                then: 'Cancelled',
                else: {
                  $cond: {
                    if: {
                      $and: [
                        { $eq: ["$isDriverStarted", false] },
                        { $eq: ["$isCompleted", false] },
                        { $eq: ["$isCancelled", false] },
                      ]
                    },
                    then: 'Scheduled',
                    else: {
                      $cond: {
                        if: {
                          $and: [
                            { $eq: ["$isDriverArrived", true] },
                            { $eq: ["$isCompleted", false] },
                            { $eq: ["$isCancelled", false] },
                          ]
                        },
                        then: 'Arrived',
                        else: {
                          $cond: {
                            if: {
                              $and: [
                                { $eq: ["$isTripStart", true] },
                                { $eq: ["$isCompleted", false] },
                                { $eq: ["$isCancelled", false] },
                              ]
                            },
                            then: 'Started',
                            else: 'Accepted'
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    {
      $sort: { createdAt: -1 }
    }
  ]);

  return request;
};

const getTodayEarnings = async (clientId) => {
  const earnings = await Request.aggregate([
    {
      $match: {
        // clientId: new ObjectId(clientId), 
        isCompleted: true
      }
    },
    {
      $addFields: {
        currentDate: {
          $dateToString: { format: '%Y-%m-%d', date: new Date() }
        }
      }
    },
    {
      $lookup: {
        from: "requestbills",
        localField: "_id",
        foreignField: "requestId",
        as: "billData",
      },
    },
    {
      $unwind: {
        path: "$billData",
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $match: {
        $expr: {
          $eq: [
            { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            { $dateToString: { format: '%Y-%m-%d', date: new Date() } }
          ]
        }
      }
    },
    {
      $group: {
        _id: null,
        totalRevenue: {
          $sum: { $ifNull: [{ $round: ["$billData.totalAmount", 2] }, 0] }
        },
        currency: { $last: "$requestedCurrencySymbol" } 
      }
    },
    {
      $project: {
        _id: 0,
        totalRevenue: 1,
        currency: 1,
        // currency: { $ifNull: ["$currency", "₹"] }
      }
    }
  ]);

  return {
    totalRevenue: earnings[0]?.totalRevenue || 0,
    currency: earnings[0]?.currency || "$",
  };
};

const getTodayReport = async (clientId) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const reports = await Request.aggregate([
      // {
      //   $match: {
      //     clientId: new ObjectId(clientId),
      //     // createdAt: { $gte: today },
      //   },
      // },
      {
        $addFields: {
          currentDate: {
            $dateToString: { format: '%Y-%m-%d', date: new Date() }
          },
        }
      },
      {
        $lookup: {
          from: "requestbills",
          localField: "_id",
          foreignField: "requestId",
          as: "billData",
        },
      },
      { $unwind: { path: "$billData", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: null,
          requestedCurrencySymbol: { $last: "$requestedCurrencySymbol" },
          completed: {
            $sum: {
              $cond: [{
                $and: [
                  { $eq: ['$isCompleted', true] },
                  { $eq: ['$isCancelled', false] },
                  { $eq: [{ $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, '$currentDate'] }
                ],
              },
                1, 0]
            }
          },
          cancelled: {
            $sum: {
              $cond: [{
                $and: [
                  { $eq: ['$isCompleted', false] },
                  { $eq: ['$isCancelled', true] },
                  { $eq: [{ $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, '$currentDate'] }
                ],
              },
                1, 0]
            }
          },
          ongoing: {
            $sum: {
              $cond: [{
                $and: [
                  { $eq: ['$isTripStart', true] },
                  { $eq: ['$isCompleted', false] },
                  { $eq: ['$isCancelled', false] },
                  { $eq: [{ $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, '$currentDate'] }
                ],
              },
                1, 0]
            },
          },
          pendingAmount: {
            $sum: {
              $cond: [{
                $and: [
                  { $eq: ['$isTripStart', false] },
                  { $eq: ['$isCompleted', false] },
                  { $eq: ['$isCancelled', false] },
                  { $eq: [{ $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, '$currentDate'] }
                ],
              },
                1, 0],
            },
          },
          cashPayments: {
            $sum: {
              $cond: [{
                $and: [
                  { $eq: ['$isCompleted', true] },
                  { $eq: ["$paymentOpt", "CASH"] },
                  { $eq: [{ $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, '$currentDate'] }
                ]
              },
              { $ifNull: [{ $round: ["$billData.totalAmount", 2] }, 0] },
                0],
            }
          },
          cardPayments: {
            $sum: {
              $cond: [{
                $and: [
                  { $eq: ['$isCompleted', true] },
                  { $eq: ["$paymentOpt", "CARD"] },
                  { $eq: [{ $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, '$currentDate'] }
                ]
              },
              { $ifNull: [{ $round: ["$billData.totalAmount", 2] }, 0] },
                0]
            }
          },
          walletPayments: {
            $sum: {
              $cond: [{
                $and: [
                  { $eq: ['$isCompleted', true] },
                  { $eq: ["$paymentOpt", "WALLET"] },
                  { $eq: [{ $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, '$currentDate'] }
                ]
              },
              { $ifNull: [{ $round: ["$billData.totalAmount", 2] }, 0] },
                0]
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          completed: 1,
          cancelled: 1,
          ongoing: 1,
          pendingAmount: 1,
          cashPayments: { $ifNull: ["$cashPayments", 0] },
          cardPayments: { $ifNull: ["$cardPayments", 0] },
          walletPayments: { $ifNull: ["$walletPayments", 0] },
          currency: { $ifNull: ["$requestedCurrencySymbol", "₹"] },
        },
      },
    ]);

    return {
      completed: reports[0]?.completed || 0,
      cancelled: reports[0]?.cancelled || 0,
      ongoing: reports[0]?.ongoing || 0,
      pendingAmount: reports[0]?.pendingAmount || 0,
      cashPayments: reports[0]?.cashPayments || 0,
      cardPayments: reports[0]?.cardPayments || 0,
      walletPayments: reports[0]?.walletPayments || 0,
      currency: reports[0]?.currency || "$",
    };
  } catch (error) {
    console.error('Error fetching today report:', error);
    throw new Error('Failed to fetch today report');
  }
};

const getWeeklyReport = async (clientId, filter) => {
  try {

    const getWeekRange = (offset = 0) => {
      const start = moment().subtract(offset, 'week').startOf('week').format('YYYY-MM-DD');
      const end = moment().subtract(offset, 'week').endOf('week').format('YYYY-MM-DD');
      return { start, end };
    };

    const weekRanges = {
      currentWeek: getWeekRange(0),
      previousWeek: getWeekRange(1),
      thirdWeekPrevious: getWeekRange(2),
      fourthWeekPrevious: getWeekRange(3)
    };

    const result = await Request.aggregate([
      {
        $lookup: {
          from: "requestbills",
          localField: "_id",
          foreignField: "requestId",
          as: "billData",
        },
      },
      { $unwind: { path: "$billData", preserveNullAndEmptyArrays: true } },
      {
        $facet: {
          currentWeek: buildPipeline(weekRanges.currentWeek.start, weekRanges.currentWeek.end),
          previousWeek: buildPipeline(weekRanges.previousWeek.start, weekRanges.previousWeek.end),
          thirdWeekPrevious: buildPipeline(weekRanges.thirdWeekPrevious.start, weekRanges.thirdWeekPrevious.end),
          fourthWeekPrevious: buildPipeline(weekRanges.fourthWeekPrevious.start, weekRanges.fourthWeekPrevious.end),
        }
      }
    ]);

    function buildPipeline(startDate, endDate) {
      return [
        {
          $match: {
            // clientId: new ObjectId(clientId),
            createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
          }
        },
        {
          $group: {
            _id: null,
            requestedCurrencySymbol: {$last: "$requestedCurrencySymbol"},
            cashPayments: { $sum: { $cond: [{ $and: [{ $eq: ["$isCompleted", true] }, { $eq: ["$paymentOpt", "CASH"] }] }, { $ifNull: [{ $round: ["$billData.totalAmount", 2] }, 0] }, 0] } },
            cardPayments: { $sum: { $cond: [{ $and: [{ $eq: ["$isCompleted", true] }, { $eq: ["$paymentOpt", "CARD"] }] }, { $ifNull: [{ $round: ["$billData.totalAmount", 2] }, 0] }, 0] } },
            walletPayments: { $sum: { $cond: [{ $and: [{ $eq: ["$isCompleted", true] }, { $eq: ["$paymentOpt", "WALLET"] }] }, { $ifNull: [{ $round: ["$billData.totalAmount", 2] }, 0] }, 0] } },
            completed: { $sum: { $cond: [{ $and: [{ $eq: ["$isCompleted", true] }, { $eq: ["$isCancelled", false] }] }, 1, 0] } },
            cancelled: { $sum: { $cond: [{ $and: [{ $eq: ["$isCompleted", false] }, { $eq: ["$isCancelled", true] }] }, 1, 0] } }
          }
        },
        {
          $project: {
            _id: 0,
            cashPayments: { $ifNull: ["$cashPayments", 0] },
            cardPayments: { $ifNull: ["$cardPayments", 0] },
            walletPayments: { $ifNull: ["$walletPayments", 0] },
            TotalPayments: {
              $add: [
                { $ifNull: ["$cashPayments", 0] },
                { $ifNull: ["$cardPayments", 0] },
                { $ifNull: ["$walletPayments", 0] }
              ]
            },
            currency: { $ifNull: ["$requestedCurrencySymbol", "₹"] },
            completed: 1,
            cancelled: 1,
            requestedCurrencySymbol:1
          }
        }
      ];
    }

    const week1 = result[0].currentWeek.length > 0 ? result[0].currentWeek[0] : { completed: 0, cancelled: 0, cashPayments: 0, cardPayments: 0, walletPayments: 0, walletPayments: 0, TotalPayments: 0, currency: '$' };
    const week2 = result[0].previousWeek.length > 0 ? result[0].previousWeek[0] : { completed: 0, cancelled: 0, cashPayments: 0, cardPayments: 0, walletPayments: 0, walletPayments: 0, TotalPayments: 0, currency: '$' };
    const week3 = result[0].thirdWeekPrevious.length > 0 ? result[0].thirdWeekPrevious[0] : { completed: 0, cancelled: 0, cashPayments: 0, cardPayments: 0, walletPayments: 0, walletPayments: 0, TotalPayments: 0, currency: '$' };
    const week4 = result[0].fourthWeekPrevious.length > 0 ? result[0].fourthWeekPrevious[0] : { completed: 0, cancelled: 0, cashPayments: 0, cardPayments: 0, walletPayments: 0, walletPayments: 0, TotalPayments: 0, currency: '$' };
    const response = {
      'week1': week1,
      'week2': week2,
      'week3': week3,
      'week4': week4,
    };

    return response;

  }
  catch (error) {
    console.error('Error fetching today report:', error);
    throw new Error('Failed to fetch today report');
  }
};

const getMonthlyReport = async (clientId, filter) => {
  try {
    let startOfYear = moment().startOf('year').format('YYYY-MM-DD');
    let endOfMonth = moment().endOf('month').format('YYYY-MM-DD');

    // Perform aggregation
    const result = await Request.aggregate([
      {
        $addFields: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          formattedCreatedAt: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
        }
      },
      {
        $match: {
          // clientId: new ObjectId(clientId),
          year: moment().year(),  // Filter by the current year
          formattedCreatedAt: {
            $gte: startOfYear,  // Match all dates from the start of the year
            $lte: endOfMonth    // Match up to the end of the current month
          }
        }
      },
      {
        $lookup: {
          from: "requestbills",
          localField: "_id",
          foreignField: "requestId",
          as: "billData",
        },
      },
      { $unwind: { path: "$billData", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: { year: "$year", month: "$month" },  // Group by year and month
          requestedCurrencySymbol: { $last: "$requestedCurrencySymbol" },
          cashPayments: {
            $sum: {
              $cond: [{
                $and: [
                  { $eq: ['$isCompleted', true] },
                  { $eq: ["$paymentOpt", "CASH"] }
                ]
              },
              { $ifNull: [{ $round: ["$billData.totalAmount", 2] }, 0] },
                0],
            }
          },
          cardPayments: {
            $sum: {
              $cond: [{
                $and: [
                  { $eq: ['$isCompleted', true] },
                  { $eq: ["$paymentOpt", "CARD"] }
                ]
              },
              { $ifNull: [{ $round: ["$billData.totalAmount", 2] }, 0] },
                0]
            }
          },
          walletPayments: {
            $sum: {
              $cond: [{
                $and: [
                  { $eq: ['$isCompleted', true] },
                  { $eq: ["$paymentOpt", "WALLET"] }
                ]
              },
              { $ifNull: [{ $round: ["$billData.totalAmount", 2] }, 0] },
                0]
            },
          },
          completed: {
            $sum: {
              $cond: [{
                $and: [
                  { $eq: ['$isCompleted', true] },
                  { $eq: ['$isCancelled', false] },
                ],
              },
                1, 0]
            }
          },
          cancelled: {
            $sum: {
              $cond: [{
                $and: [
                  { $eq: ['$isCompleted', false] },
                  { $eq: ['$isCancelled', true] },
                ],
              },
                1, 0]
            }
          },
        }
      },
      {
        $project: {
          _id: 0,
          year: "$_id.year",
          month: "$_id.month",
          cashPayments: { $ifNull: ["$cashPayments", 0] },
          cardPayments: { $ifNull: ["$cardPayments", 0] },
          walletPayments: { $ifNull: ["$walletPayments", 0] },
          TotalPayments: {
            $add: [
              { $ifNull: ["$cashPayments", 0] },
              { $ifNull: ["$cardPayments", 0] },
              { $ifNull: ["$walletPayments", 0] }
            ]
          },
          currency: { $ifNull: ["$requestedCurrencySymbol", "₹"] },
          completed: 1,
          cancelled: 1,
          requestedCurrencySymbol:1
        }
      },
      {
        $sort: { "year": 1, "month": 1 }  // Sort by year and month
      }
    ]);

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    let response = {};

    const currentMonth = moment().month() + 1;

    monthNames.slice(0, currentMonth).forEach(month => {
      response[month] = {
        completed: 0,
        cancelled: 0,
        cashPayments: 0,
        cardPayments: 0,
        walletPayments: 0,
        TotalPayments: 0,
        currency: '$'
      };
    });

    result.forEach(item => {
      const monthName = monthNames[item.month - 1]; // Get the month name
      if (item.month <= currentMonth) {
        response[monthName] = {
          completed: item.completed,
          cancelled: item.cancelled,
          cashPayments: item.cashPayments,
          cardPayments: item.cardPayments,
          walletPayments: item.walletPayments,
          TotalPayments: item.TotalPayments,
          currency: item.currency,
          requestedCurrencySymbol: item.requestedCurrencySymbol
        };
      }
    });

    return response;
  }
  catch (error) {
    console.error('Error fetching today report:', error);
    throw new Error('Failed to fetch today report');
  }
};

const getYearlyRevenue = async (req, res) => {
  const currentYear = new Date().getFullYear();
  const years = [currentYear, currentYear - 1];

  let yearlyData = {};

  for (const year of years) {
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year, 11, 31, 23, 59, 59);

    // Payments Aggregation
    const payments = (await Request.aggregate([
      {
        $match: {
          isCompleted: true,
          isCancelled: false,
          completedAt: { $gte: startOfYear, $lte: endOfYear },
        },
      },
      {
        $lookup: {
          from: "requestbills",
          localField: "_id",
          foreignField: "requestId",
          as: "bills",
        },
      },
      { $unwind: "$bills" },
      {
        $group: {
          _id: null,
          total: { $sum: { $ifNull: [{ $round: ["$bills.totalAmount", 2] }, 0] } },
          cash: {
            $sum: {
              $cond: [
                { $eq: [{ $ifNull: ["$paymentOpt", ""] }, "CASH"] },
                { $ifNull: [{ $round: ["$bills.totalAmount", 2] }, 0] },
                0,
              ],
            },
          },
          card: {
            $sum: {
              $cond: [
                { $eq: [{ $ifNull: ["$paymentOpt", ""] }, "CARD"] },
                { $ifNull: [{ $round: ["$bills.totalAmount", 2] }, 0] },
                0,
              ],
            },
          },
          wallet: {
            $sum: {
              $cond: [
                { $eq: [{ $ifNull: ["$paymentOpt", ""] }, "WALLET"] },
                { $ifNull: [{ $round: ["$bills.totalAmount", 2] }, 0] },
                0,
              ],
            },
          },
          // Include the currency symbol in the first document (assuming all have same currency)
          currencySymbol: { $first: "$bills.requestedCurrencySymbol" }
        },
      },
      {
        $project: {
          _id: 0,
          total: 1,
          cash: 1,
          card: 1,
          wallet: 1,
          currencySymbol: 1
        }
      }
    ])) || [];

    // Completed Requests Aggregation
    const completedRequests = (await Request.aggregate([
      {
        $match: {
          isCompleted: true,
          completedAt: { $gte: startOfYear, $lte: endOfYear },
        },
      },
      {
        $group: {
          _id: { $month: "$completedAt" },
          count: { $sum: 1 },
        },
      },
    ])) || [];

    // Cancelled Requests Aggregation
    const cancelledRequests = (await Request.aggregate([
      {
        $match: {
          isCancelled: true,
          cancelledAt: { $gte: startOfYear, $lte: endOfYear },
        },
      },
      {
        $group: {
          _id: { $month: "$cancelledAt" },
          count: { $sum: -1 }, // Negative values for cancellations
        },
      },
    ])) || [];

    // Last Month Data
    const lastMonthData = (await Request.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(year, new Date().getMonth() - 1, 1),
            $lt: new Date(year, new Date().getMonth(), 1),
          },
        },
      },
      {
        $group: {
          _id: { $dayOfMonth: "$createdAt" },
          count: { $sum: 1 },
        },
      },
    ])) || [];

    // This Month Data
    const thisMonthData = (await Request.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(year, new Date().getMonth(), 1),
            $lt: new Date(year, new Date().getMonth() + 1, 1),
          },
        },
      },
      {
        $group: {
          _id: { $dayOfMonth: "$createdAt" },
          count: { $sum: 1 },
        },
      },
    ])) || [];

    // Transform Data into Arrays (12 months)
    const completedArray = Array(12).fill(0);
    completedRequests.forEach((entry) => {
      if (entry._id && entry.count !== undefined) {
        completedArray[entry._id - 1] = entry.count;
      }
    });

    const cancelledArray = Array(12).fill(0);
    cancelledRequests.forEach((entry) => {
      if (entry._id && entry.count !== undefined) {
        cancelledArray[entry._id - 1] = entry.count;
      }
    });

    const lastMonthArray = lastMonthData.map((entry) => entry.count || 0);
    const thisMonthArray = thisMonthData.map((entry) => entry.count || 0);

    // Store data with null constraints handled
    yearlyData[year] = {
      payments: payments[0] || { total: 0, cash: 0, card: 0, wallet: 0 },
      completed: completedArray,
      cancelled: cancelledArray,
      lastMonth: lastMonthArray,
      thisMonth: thisMonthArray,
    };
  }

  return yearlyData;
};

module.exports = {
  createRequest,
  queryRequests,
  getRequestById,
  updateRequestById,
  deleteRequestById,
  getRequest,
  createRequestPlace,
  getRequestByUserId,
  getRequesHistoryList,
  getWebRequestHistory,
  getRideTypes,
  getWebRideTypes,
  getRequestpagination,
  getTripByReports,
  getByTripCount,
  getLastTrips,
  getLogisticsByEarnings,
  getByTotalEarnings,
  getUserTrips,
  getTripsByDriver,
  getDriverRequestTrips,
  getDriverSummary,
  getTripWiseReports,
  getCompletedLocalTrip,
  getCompletedRentalTrip,
  getRentalList,
  getTodayEarnings,
  getTodayReport,
  getWeeklyReport,
  getMonthlyReport,
  getYearlyRevenue,
  getTripsByUser,
  createWebRequest,
  getWebRequestStatus,
  cancelWebRequest
};
