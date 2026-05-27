const {
  Request,
  Driver,
  User,
  Document,
  DriverInProgressView,
  UserInProgressView,
  requestListView,
  PromoCode
} = require('../../../models');
const ApiError = require('../../../utils/ApiError');
const httpStatus = require('http-status').default || require('http-status').status || require('http-status');
const { ObjectId } = require('mongoose').Types;
const tokenService = require('../../token.service');
const { errorMessages, keyMessages } = require('../../../config/errorMessages');

const {
  getPickupZone,
  getDropZone,
  getAllRoutePolyline,
  getUserId,
  getClientId,
  getTravelTime,
  calculateDistance,
  calculateZonePrices,
  createDataResponse,
  getAddressFromLatLng,
  getLatLngFromAddress,
  getRoutePolyline,
} = require('../../../utils/commonFunction');

const mongoose = require('mongoose');

/**
  from the mobile side they need to send Client Id and Code (Version code)
  1. Check the Version Available or not if not redirect to update screen
  2. check the avaliable languages for client send the avaliable languages
 */

const getDriverRequestInProgress = async (req) => {
  const clientId = await getClientId(req);
  const userId = await getUserId(req);

  const getRequest = DriverInProgressView.aggregate([
    {
      $match: {
        clientId: new ObjectId(clientId),
        userId: new ObjectId(userId),
      },
    },
  ]);

  return getRequest;
};

const geUserRequestInProgress = async (req) => {
  const clientId = await getClientId(req);
  const userId = await getUserId(req);

  const getRequest = UserInProgressView.aggregate([
    {
      $match: {
        clientId: new ObjectId(clientId),
        _id: new ObjectId(userId),
      },
    },
  ]);

  return getRequest;
};

const getRequestListData = async (req) => {
  const getRequest = requestListView.aggregate([
    {
      $match: {
        _id: new ObjectId(req.params.requestId),
      },
    },
  ]);

  return getRequest;
};

const getRequest = async (req) => {
  const clientId = await getClientId(req);
  const userId = await getUserId(req);

  const document = await Document.find({ clientId, status: true });

  const getRequest = Driver.aggregate([
    {
      $match: {
        clientId: new ObjectId(clientId),
        userId: new ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: 'driverdocuments',
        localField: '_id',
        foreignField: 'driverId',
        as: 'driverDocumentDetails',
      },
    },
    {
      $lookup: {
        from: 'requestmetas',
        let: { driverId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$driverId', '$$driverId'] }, // Match driverId with _id from the local collection
                  { $eq: ['$active', true] }, // Ensure active is true
                ],
              },
            },
          },
        ],
        as: 'requestMetaDetails',
      },
    },
    {
      $unwind: {
        path: '$requestMetaDetails',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'requests',
        let: { requestId: '$requestMetaDetails.requestId' },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ['$_id', '$$requestId'], // Match requestId from requestMetaDetails
              },
            },
          },
        ],
        as: 'requestDetailsData',
      },
    },
    {
      $lookup: {
        from: 'requestplaces',
        let: { requestId: '$requestMetaDetails.requestId' },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ['$requestId', '$$requestId'], // Match requestId from requestMetaDetails
              },
            },
          },
        ],
        as: 'requestPlaceDetailsData',
      },
    },
    {
      $lookup: {
        from: 'users',
        let: { userId: '$requestMetaDetails.userId' },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ['$_id', '$$userId'], // Match requestId from requestMetaDetails
              },
            },
          },
        ],
        as: 'requestMetaUsers',
      },
    },
    {
      $unwind: {
        path: '$requestPlaceDetailsData',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $unwind: {
        path: '$requestMetaUsers',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'requests',
        let: { driverId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$driverId', '$$driverId'] }, // Match driverId with _id from the local collection
                  { $eq: ['$isCompleted', false] }, // Ensure isCompleted is true
                  { $eq: ['$isCancelled', false] }, // Ensure isCancelled is true
                ],
              },
            },
          },
        ],
        as: 'requestDetails',
      },
    },
    {
      $unwind: {
        path: '$requestDetails',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'requestbills',
        let: { requestId: '$requestDetails._id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ['$requestId', '$$requestId'], // Match requestId from requestMetaDetails
              },
            },
          },
        ],
        as: 'billingDetails',
      },
    },
    {
      $lookup: {
        from: 'requestplaces',
        localField: 'requestId',
        foreignField: 'requestDetails._id',
        as: 'placesDetails',
      },
    },
    {
      $lookup: {
        from: 'requestratings',
        localField: 'requestId',
        foreignField: 'requestDetails._id',
        as: 'ratingDetails',
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'requestDetails.userId',
        foreignField: '_id',
        as: 'requestUser',
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'user',
      },
    },
    {
      $unwind: {
        path: '$billingDetails',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $unwind: {
        path: '$ratingDetails',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $unwind: {
        path: '$user',
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
        localField: 'userId',
        foreignField: '_id',
        as: 'driverPersonalDetails',
      },
    },
    {
      $lookup: {
        from: 'vehicles',
        localField: 'type',
        foreignField: '_id',
        as: 'vehicleDetails',
      },
    },
    {
      $lookup: {
        from: 'vehiclemodels',
        localField: 'carModel',
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
        path: '$requestUser',
        preserveNullAndEmptyArrays: true,
      },
    },

    {
      $lookup: {
        from: 'clients',
        let: { clientId: '$clientId' },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ['$_id', '$$clientId'],
              },
            },
          },
        ],
        as: 'clientData',
      },
    },
    {
      $unwind: {
        path: '$clientData',
        preserveNullAndEmptyArrays: true,
      },
    },

    {
      $lookup: {
        from: 'users',
        let: { userId: '$clientData.userId' },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ['$_id', '$$userId'],
              },
            },
          },
        ],
        as: 'clientDetails',
      },
    },
    {
      $unwind: {
        path: '$clientDetails',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $addFields: {
        active: {
          $cond: [
            {
              $or: [
                { $eq: [{ $size: '$driverDocumentDetails' }, 0] }, // No documents
                {
                  $gt: [
                    {
                      $size: {
                        $filter: {
                          input: '$driverDocumentDetails',
                          as: 'doc',
                          cond: {
                            $or: [
                              { $eq: ['$$doc.documentStatus', 'DENIED'] }, // Denied documents
                              {
                                $and: [
                                  { $ifNull: ['$$doc.expiryDate', false] }, // expiryDate exists
                                  { $lt: ['$$doc.expiryDate', new Date()] }, // expiryDate < today
                                ],
                              },
                            ],
                          },
                        },
                      },
                    },
                    0,
                  ],
                },
                {
                  $ne: [
                    // Count of all required documents
                    {
                      $size: {
                        $filter: {
                          input: document,
                          as: 'doc',
                          cond: { $eq: ['$$doc.required', true] },
                        },
                      },
                    },
                    // Count of required documents present in driverDocumentDetails
                    {
                      $size: {
                        $filter: {
                          input: document,
                          as: 'doc',
                          cond: {
                            $and: [
                              { $eq: ['$$doc.required', true] },
                              {
                                $in: [
                                  '$$doc._id',
                                  {
                                    $map: {
                                      input: '$driverDocumentDetails',
                                      as: 'driverDoc',
                                      in: '$$driverDoc.documentId',
                                    },
                                  },
                                ],
                              },
                            ],
                          },
                        },
                      },
                    },
                  ],
                }, // Document count not equal to expected count
                {
                  $gt: [
                    {
                      $size: {
                        $filter: {
                          input: '$driverDocumentDetails',
                          as: 'doc',
                          cond: { $ne: ['$$doc.documentStatus', 'APPROVED'] }, // Not approved documents
                        },
                      },
                    },
                    0,
                  ],
                }, // Any document is not approved
              ],
            },
            false, // Inactive
            true, // Active
          ],
        },
        blockReason: {
          $cond: {
            if: {
              $ne: [
                // Count of all required documents
                {
                  $size: {
                    $filter: {
                      input: document,
                      as: 'doc',
                      cond: { $eq: ['$$doc.required', true] },
                    },
                  },
                },
                // Count of required documents present in driverDocumentDetails
                {
                  $size: {
                    $filter: {
                      input: document,
                      as: 'doc',
                      cond: {
                        $and: [
                          { $eq: ['$$doc.required', true] },
                          {
                            $in: [
                              '$$doc._id',
                              {
                                $map: {
                                  input: '$driverDocumentDetails',
                                  as: 'driverDoc',
                                  in: '$$driverDoc.documentId',
                                },
                              },
                            ],
                          },
                        ],
                      },
                    },
                  },
                },
              ],
            },
            then: 'DOCUMENT_NOT_UPLOADED', // Document and driver document counts do not match
            else: {
              $cond: {
                if: {
                  $gt: [
                    {
                      $size: {
                        $filter: {
                          input: '$driverDocumentDetails',
                          as: 'doc',
                          cond: { $eq: ['$$doc.documentStatus', 'WAITINGFORAPPROVAL'] }, // Check for WAITINGFORAPPROVAL
                        },
                      },
                    },
                    0,
                  ],
                },
                then: 'WAITINGFORAPPROVAL', // If any document is WAITINGFORAPPROVAL
                else: {
                  $cond: {
                    if: { $eq: [{ $size: '$driverDocumentDetails' }, 0] }, // No documents
                    then: 'DOCUMENT_NOT_UPLOADED',
                    else: {
                      $cond: {
                        if: {
                          $gt: [
                            {
                              $size: {
                                $filter: {
                                  input: '$driverDocumentDetails',
                                  as: 'doc',
                                  cond: {
                                    $and: [
                                      { $ifNull: ['$$doc.expiryDate', false] }, // expiryDate exists
                                      { $lt: ['$$doc.expiryDate', new Date()] }, // expiryDate is in the past
                                    ],
                                  },
                                },
                              },
                            },
                            0,
                          ],
                        },
                        then: 'EXPIRED',
                        else: {
                          $cond: {
                            if: {
                              $ne: [
                                // Count of all required documents
                                {
                                  $size: {
                                    $filter: {
                                      input: document,
                                      as: 'doc',
                                      cond: { $eq: ['$$doc.required', true] },
                                    },
                                  },
                                },
                                // Count of required documents present in driverDocumentDetails
                                {
                                  $size: {
                                    $filter: {
                                      input: document,
                                      as: 'doc',
                                      cond: {
                                        $and: [
                                          { $eq: ['$$doc.required', true] },
                                          {
                                            $in: [
                                              '$$doc._id',
                                              {
                                                $map: {
                                                  input: '$driverDocumentDetails',
                                                  as: 'driverDoc',
                                                  in: '$$driverDoc.documentId',
                                                },
                                              },
                                            ],
                                          },
                                        ],
                                      },
                                    },
                                  },
                                },
                              ],
                            }, // Document count does not match driver document count
                            then: 'DOCUMENT_NOT_UPLOADED', // Document and driver document counts do not match
                            else: {
                              $cond: {
                                if: {
                                  $eq: [
                                    {
                                      $size: {
                                        $filter: {
                                          input: '$driverDocumentDetails',
                                          as: 'doc',
                                          cond: { $ne: ['$$doc.documentStatus', 'APPROVED'] }, // Any document not approved
                                        },
                                      },
                                    },
                                    0,
                                  ],
                                }, // All documents are approved
                                then: 'APPROVED',
                                else: 'DENIED', // Not all documents are approved
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
        onlineBy: {
          $cond: {
            if: { $eq: ['$driverPersonalDetails.onlineBy', 1] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        _id: { $ifNull: ['$_id', null] },
        blockReason: { $ifNull: ['$blockReason', null] },
        onlineBy: { $ifNull: ['$onlineBy', null] },
        active: { $ifNull: ['$active', null] },
        'driver.id': { $ifNull: ['$_id', null] },
        'driver.firstName': { $ifNull: ['$driverPersonalDetails.firstName', null] },
        'driver.lastName': { $ifNull: ['$driverPersonalDetails.lastName', null] },
        'driver.carNumber': { $ifNull: ['$carNumber', null] },
        'driver.serviceType': { $ifNull: ['$serviceType', null] },
        'driver.vehicleId': { $ifNull: ['$vehicleDetails._id', null] },
        'driver.vehicleName': { $ifNull: ['$vehicleDetails.vehicleName', null] },
        'driver.vehicleImage': { $ifNull: ['$vehicleDetails.image', null] },
        'driver.capacity': { $ifNull: ['$vehicleDetails.capacity', null] },
        'driver.highlightImage': { $ifNull: ['$vehicleDetails.highlightImage', null] },
        'driver.modelname': { $ifNull: ['$vehicleModelDetails.modelname', null] },
        'user.userId': { $ifNull: ['$user._id', null] },
        'user.firstName': { $ifNull: ['$user.firstName', null] },
        'user.lastName': { $ifNull: ['$user.lastName', null] },
        'user.email': { $ifNull: ['$user.email', null] },
        'user.phoneNumber': { $ifNull: ['$user.phoneNumber', null] },
        'user.referralCode': { $ifNull: ['$user.referralCode', null] },
        'user.gender': { $ifNull: ['$user.gender', null] },
        'user.country': { $ifNull: ['$user.country', null] },
        'user.profilePic': { $ifNull: ['$user.profilePic', null] },
        'user.adminPhoneNumber': { $ifNull: ['$clientDetails.phoneNumber', null] },
        'user.headofficeNumber': { $ifNull: ['$clientDetails.emergencyNumber', null] },

        trip: {
          $ifNull: [
            {
              $let: {
                vars: {
                  billingDetails: '$billingDetails',
                  ratingDetails: '$ratingDetails',
                  vehicleDetails: '$vehicleDetails',
                  vehicleModelDetails: '$vehicleModelDetails',
                  placeDetailsData: {
                    $cond: {
                      if: { $ifNull: ['$requestPlaceDetailsData', false] }, // Checks if the field exists and is not null
                      then: '$requestPlaceDetailsData',
                      else: {
                        $cond: {
                          if: { $ifNull: ['$placesDetails', false] }, // Checks if the field exists and is not null
                          then: '$placesDetails',
                          else: null,
                        },
                      },
                    },
                  },
                  userDetailsData: {
                    $cond: {
                      if: { $ifNull: ['$requestMetaUsers', false] },
                      then: '$requestMetaUsers',
                      else: {
                        $cond: {
                          if: { $ne: ['$requestUser', null] },
                          then: '$requestUser',
                          else: null,
                        },
                      },
                    },
                  },
                  requestData: {
                    $cond: {
                      if: { $and: [{ $isArray: '$requestDetailsData' }, { $ne: [{ $size: '$requestDetailsData' }, 0] }] },
                      then: { $arrayElemAt: ['$requestDetailsData', 0] },
                      else: {
                        $cond: {
                          if: { $ne: ['$requestDetails', null] },
                          then: '$requestDetails',
                          else: null,
                        },
                      },
                    },
                  },
                },
                in: {
                  $cond: {
                    if: {
                      $and: [
                        { $ne: [{ $ifNull: ['$$requestData', null] }, null] }, // Check if requestData is not null
                        {
                          $and: [
                            { $eq: [{ $ifNull: ['$$requestData.isCancelled', false] }, false] },
                            { $eq: [{ $ifNull: ['$$requestData.isCompleted', false] }, false] },
                          ],
                        },
                      ],
                    },
                    then: {
                      _id: { $ifNull: ['$$requestData._id', null] },
                      requestNumber: { $ifNull: ['$$requestData.requestNumber', null] },
                      requestOtp: { $ifNull: ['$$requestData.requestOtp', null] },
                      isLater: { $ifNull: ['$$requestData.isLater', null] },
                      ifDispatch: { $ifNull: ['$$requestData.ifDispatch', null] },
                      zoneTypeId: { $ifNull: ['$$requestData.zoneTypeId', null] },
                      userId: { $ifNull: ['$$requestData.userId', null] },
                      driverId: { $ifNull: ['$$requestData.driverId', null] },
                      tripStartTime: { $ifNull: ['$$requestData.tripStartTime', null] },
                      arrivedAt: { $ifNull: ['$$requestData.arrivedAt', null] },
                      acceptedAt: { $ifNull: ['$$requestData.acceptedAt', null] },
                      completedAt: { $ifNull: ['$$requestData.completedAt', null] },
                      cancelledAt: { $ifNull: ['$$requestData.cancelledAt', null] },
                      isDriverStarted: { $ifNull: ['$$requestData.isDriverStarted', null] },
                      isDriverArrived: { $ifNull: ['$$requestData.isDriverArrived', null] },
                      isTripStart: { $ifNull: ['$$requestData.isTripStart', null] },
                      isCompleted: { $ifNull: ['$$requestData.isCompleted', null] },
                      isCancelled: { $ifNull: ['$$requestData.isCancelled', null] },
                      customReason: { $ifNull: ['$$requestData.customReason', null] },
                      cancelMethod: { $ifNull: ['$$requestData.cancelMethod', null] },
                      totalDistance: { $ifNull: ['$$requestData.totalDistance', null] },
                      totalTime: { $ifNull: ['$$requestData.totalTime', null] },
                      isPaid: { $ifNull: ['$$requestData.isPaid', null] },
                      userRated: { $ifNull: ['$$requestData.userRated', null] },
                      driverRated: { $ifNull: ['$$requestData.driverRated', null] },
                      timezone: { $ifNull: ['$$requestData.timezone', null] },
                      attemptForSchedule: { $ifNull: ['$$requestData.attemptForSchedule', null] },
                      dispatcherId: { $ifNull: ['$$requestData.dispatcherId', null] },
                      driverNotes: { $ifNull: ['$$requestData.driverNotes', null] },
                      createdBy: { $ifNull: ['$$requestData.createdBy', null] },
                      paymentOpt: { $ifNull: ['$$requestData.paymentOpt', null] },
                      rideType: { $ifNull: ['$$requestData.rideType', null] },
                      requestedCurrencyCode: { $ifNull: ['$$requestData.requestedCurrencyCode', null] },
                      requestedCurrencySymbol: { $ifNull: ['$$requestData.requestedCurrencySymbol', null] },
                      promoId: { $ifNull: ['$$requestData.promoId', null] },
                      locationApprove: { $ifNull: ['$$requestData.locationApprove', null] },
                      availablesStatus: { $ifNull: ['$$requestData.availablesStatus', null] },
                      tripType: { $ifNull: ['$$requestData.tripType', null] },
                      rentalPackage: { $ifNull: ['$$requestData.rentalPackage', null] },
                      manualTrip: { $ifNull: ['$$requestData.manualTrip', null] },
                      packageId: { $ifNull: ['$$requestData.packageId', null] },
                      packageItemId: { $ifNull: ['$$requestData.packageItemId', null] },
                      bookingFor: { $ifNull: ['$$requestData.bookingFor', null] },
                      othersUserId: { $ifNull: ['$$requestData.othersUserId', null] },
                      pickLat: { $ifNull: ['$$placeDetailsData.pickLat', null] },
                      pickLng: { $ifNull: ['$$placeDetailsData.pickLng', null] },
                      pickAddress: { $ifNull: ['$$placeDetailsData.pickAddress', null] },
                      dropLat: { $ifNull: ['$$placeDetailsData.dropLat', null] },
                      dropLng: { $ifNull: ['$$placeDetailsData.dropLng', null] },
                      dropAddress: { $ifNull: ['$$placeDetailsData.dropAddress', null] },
                      billingDetails: { $ifNull: ['$$billingDetails', null] },
                      ratingDetails: { $ifNull: ['$$ratingDetails', null] },
                      userDetails: { $ifNull: ['$$userDetailsData', null] },
                      vehicleDetails: {
                        vehicleName: { $ifNull: ['$$vehicleDetails.vehicleName', null] },
                        image: {
                          $concat: ['/uploads/vehicles/', { $ifNull: ['$$vehicleDetails.image', ''] }],
                        },
                        capacity: { $ifNull: ['$$vehicleDetails.capacity', null] },
                        serviceType: { $ifNull: ['$$vehicleDetails.serviceType', null] },
                        categoryId: { $ifNull: ['$$vehicleDetails.categoryId', null] },
                        sortingorder: { $ifNull: ['$$vehicleDetails.sortingorder', null] },
                        highlightImage: {
                          $concat: ['/uploads/vehicles/', { $ifNull: ['$$vehicleDetails.highlightImage', ''] }],
                        },
                        status: { $ifNull: ['$$vehicleDetails.status', null] },
                        clientId: { $ifNull: ['$$vehicleDetails.clientId', null] },
                      },
                      vehicleModelDetails: {
                        modelname: { $ifNull: ['$$vehicleModelDetails.modelname', null] },
                        description: { $ifNull: ['$$vehicleModelDetails.description', null] },
                        image: {
                          $concat: ['/uploads/vehicleModels/', { $ifNull: ['$$vehicleModelDetails.image', ''] }],
                        },
                        vehicleId: { $ifNull: ['$$vehicleModelDetails.vehicleId', null] },
                        status: { $ifNull: ['$$vehicleModelDetails.status', null] },
                        clientId: { $ifNull: ['$$vehicleModelDetails.clientId', null] },
                      },
                    },
                    else: null,
                  },
                },
              },
            },
            null,
          ],
        },
      },
    },
  ]);

  return getRequest;
};

const userGetRequest = async (req) => {
  const clientId = await getClientId(req);
  const userId = await getUserId(req);

  const getRequest = await User.aggregate([
    {
      $match: {
        clientId: new ObjectId(clientId),
        _id: new ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: 'requests',
        let: { userId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$userId', '$$userId'] }, // Match driverId with _id from the local collection
                  { $eq: ['$isCompleted', false] }, // Ensure isCompleted is true
                  { $eq: ['$isCancelled', false] }, // Ensure isCancelled is true
                ],
              },
            },
          },
        ],
        as: 'requestDetails',
      },
    },
    {
      $unwind: {
        path: '$requestDetails',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'requestbills',
        let: { requestId: '$requestDetails._id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ['$requestId', '$$requestId'], // Match requestId from requestMetaDetails
              },
            },
          },
        ],
        as: 'billingDetails',
      },
    },
    {
      $lookup: {
        from: 'requestplaces',
        localField: 'requestId',
        foreignField: 'requestDetails._id',
        as: 'placesDetails',
      },
    },
    {
      $lookup: {
        from: 'requestratings',
        localField: 'requestId',
        foreignField: 'requestDetails._id',
        as: 'ratingDetails',
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'user',
      },
    },
    {
      $lookup: {
        from: 'drivers',
        localField: 'requestDetails.driverId',
        foreignField: '_id',
        as: 'driverDetails',
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
        path: '$billingDetails',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $unwind: {
        path: '$ratingDetails',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $unwind: {
        path: '$user',
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
      $lookup: {
        from: 'clients',
        let: { clientId: '$clientId' },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ['$_id', '$$clientId'],
              },
            },
          },
        ],
        as: 'clientData',
      },
    },
    {
      $unwind: {
        path: '$clientData',
        preserveNullAndEmptyArrays: true,
      },
    },

    {
      $lookup: {
        from: 'users',
        let: { userId: '$clientData.userId' },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ['$_id', '$$userId'],
              },
            },
          },
        ],
        as: 'clientDetails',
      },
    },
    {
      $unwind: {
        path: '$clientDetails',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        'user._id': { $ifNull: ['$_id', null] },
        'user.firstName': { $ifNull: ['$firstName', null] },
        'user.lastName': { $ifNull: ['$lastName', null] },
        'user.email': { $ifNull: ['$email', null] },
        'user.phoneNumber': { $ifNull: ['$phoneNumber', null] },
        'user.referralCode': { $ifNull: ['$referralCode', null] },
        'user.gender': { $ifNull: ['$gender', null] },
        'user.country': { $ifNull: ['$country', null] },
        'user.profilePic': { $ifNull: ['$profilePic', null] },
        'user.active': { $ifNull: ['$active', null] },
        'user.adminPhoneNumber': { $ifNull: ['$clientDetails.phoneNumber', null] },
        'user.headofficeNumber': { $ifNull: ['$clientDetails.emergencyNumber', null] },
        trip: {
          $cond: {
            if: {
              $or: [
                {
                  $and: [
                    { $ne: [{ $ifNull: ['$requestDetails', null] }, null] },
                    { $eq: [{ $ifNull: ['$requestDetails.isCancelled', false] }, false] },
                    { $eq: [{ $ifNull: ['$requestDetails.isCompleted', false] }, false] },
                  ],
                },
                {
                  $and: [
                    { $eq: [{ $ifNull: ['$requestDetails.isLater', false] }, true] },
                    { $ne: ['$requestDetails.driverId', null] },
                    { $eq: [{ $ifNull: ['$requestDetails.isCancelled', false] }, false] },
                    { $eq: [{ $ifNull: ['$requestDetails.isCompleted', false] }, false] },
                  ],
                },
              ],
            },
            then: {
              _id: { $ifNull: ['$requestDetails._id', null] },
              requestNumber: { $ifNull: ['$requestDetails.requestNumber', null] },
              requestOtp: { $ifNull: ['$requestDetails.requestOtp', null] },
              isLater: { $ifNull: ['$requestDetails.isLater', null] },
              ifDispatch: { $ifNull: ['$requestDetails.ifDispatch', null] },
              zoneTypeId: { $ifNull: ['$requestDetails.zoneTypeId', null] },
              userId: { $ifNull: ['$requestDetails.userId', null] },
              driverId: { $ifNull: ['$requestDetails.driverId', null] },
              tripStartTime: { $ifNull: ['$requestDetails.tripStartTime', null] },
              arrivedAt: { $ifNull: ['$requestDetails.arrivedAt', null] },
              acceptedAt: { $ifNull: ['$requestDetails.acceptedAt', null] },
              completedAt: { $ifNull: ['$requestDetails.completedAt', null] },
              cancelledAt: { $ifNull: ['$requestDetails.cancelledAt', null] },
              isDriverStarted: { $ifNull: ['$requestDetails.isDriverStarted', null] },
              isDriverArrived: { $ifNull: ['$requestDetails.isDriverArrived', null] },
              isTripStart: { $ifNull: ['$requestDetails.isTripStart', null] },
              isCompleted: { $ifNull: ['$requestDetails.isCompleted', null] },
              isCancelled: { $ifNull: ['$requestDetails.isCancelled', null] },
              customReason: { $ifNull: ['$requestDetails.customReason', null] },
              cancelMethod: { $ifNull: ['$requestDetails.cancelMethod', null] },
              totalDistance: { $ifNull: ['$requestDetails.totalDistance', null] },
              totalTime: { $ifNull: ['$requestDetails.totalTime', null] },
              isPaid: { $ifNull: ['$requestDetails.isPaid', null] },
              userRated: { $ifNull: ['$requestDetails.userRated', null] },
              driverRated: { $ifNull: ['$requestDetails.driverRated', null] },
              timezone: { $ifNull: ['$requestDetails.timezone', null] },
              attemptForSchedule: { $ifNull: ['$requestDetails.attemptForSchedule', null] },
              dispatcherId: { $ifNull: ['$requestDetails.dispatcherId', null] },
              driverNotes: { $ifNull: ['$requestDetails.driverNotes', null] },
              createdBy: { $ifNull: ['$requestDetails.createdBy', null] },
              paymentOpt: { $ifNull: ['$requestDetails.paymentOpt', null] },
              rideType: { $ifNull: ['$requestDetails.rideType', null] },
              requestedCurrencyCode: { $ifNull: ['$requestDetails.requestedCurrencyCode', null] },
              requestedCurrencySymbol: { $ifNull: ['$requestDetails.requestedCurrencySymbol', null] },
              promoId: { $ifNull: ['$requestDetails.promoId', null] },
              locationApprove: { $ifNull: ['$requestDetails.locationApprove', null] },
              availablesStatus: { $ifNull: ['$requestDetails.availablesStatus', null] },
              tripType: { $ifNull: ['$requestDetails.tripType', null] },
              rentalPackage: { $ifNull: ['$requestDetails.rentalPackage', null] },
              manualTrip: { $ifNull: ['$requestDetails.manualTrip', null] },
              packageId: { $ifNull: ['$requestDetails.packageId', null] },
              packageItemId: { $ifNull: ['$requestDetails.packageItemId', null] },
              bookingFor: { $ifNull: ['$requestDetails.bookingFor', null] },
              othersUserId: { $ifNull: ['$requestDetails.othersUserId', null] },
              pickLat: { $ifNull: ['$placesDetails.pickLat', null] },
              pickLng: { $ifNull: ['$placesDetails.pickLng', null] },
              pickAddress: { $ifNull: ['$placesDetails.pickAddress', null] },
              dropLat: { $ifNull: ['$placesDetails.dropLat', null] },
              dropLng: { $ifNull: ['$placesDetails.dropLng', null] },
              dropAddress: { $ifNull: ['$placesDetails.dropAddress', null] },
              billingDetails: { $ifNull: ['$billingDetails', null] },
              ratingDetails: { $ifNull: ['$ratingDetails', null] },
              driver: {
                userId: { $ifNull: ['$driverDetails.userId', null] },
                carNumber: { $ifNull: ['$driverDetails.carNumber', null] },
                _id: { $ifNull: ['$driverPersonalDetails._id', null] },
                firstName: { $ifNull: ['$driverPersonalDetails.firstName', null] },
                lastName: { $ifNull: ['$driverPersonalDetails.lastName', null] },
                email: { $ifNull: ['$driverPersonalDetails.email', null] },
                phoneNumber: { $ifNull: ['$driverPersonalDetails.phoneNumber', null] },
                emergencyNumber: { $ifNull: ['$driverPersonalDetails.emergencyNumber', null] },
                gender: { $ifNull: ['$driverPersonalDetails.gender', null] },
                language: { $ifNull: ['$driverPersonalDetails.language', null] },
                country: { $ifNull: ['$driverPersonalDetails.country', null] },
                address: { $ifNull: ['$driverPersonalDetails.address', null] },
                profilePic: { $ifNull: ['$driverPersonalDetails.profilePic', null] },
                active: { $ifNull: ['$driverPersonalDetails.active', null] },
              },
              vehicleDetails: {
                vehicleName: { $ifNull: ['$vehicleDetails.vehicleName', null] },
                image: {
                  $concat: ['/uploads/vehicles/', { $ifNull: ['$vehicleDetails.image', ''] }],
                },
                capacity: { $ifNull: ['$vehicleDetails.capacity', null] },
                serviceType: { $ifNull: ['$vehicleDetails.serviceType', null] },
                categoryId: { $ifNull: ['$vehicleDetails.categoryId', null] },
                sortingorder: { $ifNull: ['$vehicleDetails.sortingorder', null] },
                highlightImage: {
                  $concat: ['/uploads/vehicles/', { $ifNull: ['$vehicleDetails.highlightImage', ''] }],
                },
                status: { $ifNull: ['$vehicleDetails.status', null] },
                clientId: { $ifNull: ['$vehicleDetails.clientId', null] },
              },
              vehicleModelDetails: {
                modelname: { $ifNull: ['$vehicleModelDetails.modelname', null] },
                description: { $ifNull: ['$vehicleModelDetails.description', null] },
                image: {
                  $concat: ['/uploads/vehicleModels/', { $ifNull: ['$vehicleModelDetails.image', ''] }],
                },
                vehicleId: { $ifNull: ['$vehicleModelDetails.vehicleId', null] },
                status: { $ifNull: ['$vehicleModelDetails.status', null] },
                clientId: { $ifNull: ['$vehicleModelDetails.clientId', null] },
              },
              billingDetails: { $ifNull: ['$billingDetails', null] },
            },
            else: null,
          },
        },
      },
    },
  ]);

  return getRequest;
};

const getRequestList = async (req) => {
  const clientId = await getClientId(req);

  return Request.aggregate([
    {
      $match: {
        clientId: new ObjectId(clientId),
      },
    },
    {
      $lookup: {
        from: 'requestbills',
        localField: '_id',
        foreignField: 'requestId',
        as: 'billingDetails',
      },
    },
    {
      $lookup: {
        from: 'requestplaces',
        localField: '_id',
        foreignField: 'requestId',
        as: 'placesDetails',
      },
    },
    {
      $lookup: {
        from: 'requestratings',
        localField: '_id',
        foreignField: 'requestId',
        as: 'ratingDetails',
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'user',
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
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $unwind: {
        path: '$ratingDetails',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $unwind: {
        path: '$user',
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
        'vehicleModelDetails.clientId': { $ifNull: ['$vehicleModelDetails.clientId', null] },
      },
    },
  ]);
};

const getRequestListView = async (req) => {
  return Request.aggregate([
    {
      $match: {
        _id: new ObjectId(req.params.requestId),
      },
    },
    {
      $lookup: {
        from: 'requestbills',
        localField: '_id',
        foreignField: 'requestId',
        as: 'billingDetails',
      },
    },
    {
      $lookup: {
        from: 'requestplaces',
        localField: '_id',
        foreignField: 'requestId',
        as: 'placesDetails',
      },
    },
    {
      $lookup: {
        from: 'requestratings',
        localField: '_id',
        foreignField: 'requestId',
        as: 'ratingDetails',
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'user',
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
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $unwind: {
        path: '$ratingDetails',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $unwind: {
        path: '$user',
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
        'vehicleModelDetails.clientId': { $ifNull: ['$vehicleModelDetails.clientId', null] },
      },
    },
  ]);
};

const getLastTripHistory = async (userId) => {
  return Request.aggregate([
    { $match: { userId, tripType: 'LOCAL' } }, // Match trips for the specific user and type
    {
      $lookup: {
        from: 'requestplaces', // Reference to the RequestPlace collection
        localField: '_id', // Match the request ID with the RequestPlace's requestId
        foreignField: 'requestId', // The foreign field that references the Request collection
        as: 'places', // Alias for the joined documents
      },
    },
    {
      $project: { requestNumber: 1, places: 1 }, // Add this to inspect the 'places' field
    },
    {
      $unwind: {
        path: '$places', // Unwind the 'places' array to bring in the individual documents
        preserveNullAndEmptyArrays: true, // Ensure trips without places are included
      },
    },
    {
      $project: {
        _id: '$_id',
        pickLat: { $ifNull: ['$places.pickLat', null] },
        pickLng: { $ifNull: ['$places.pickLng', null] },
        pickAddress: { $ifNull: ['$places.pickAddress', null] },
        dropLat: { $ifNull: ['$places.dropLat', null] },
        dropLng: { $ifNull: ['$places.dropLng', null] },
        dropAddress: { $ifNull: ['$places.dropAddress', null] },
      },
    },
    { $sort: { createdAt: -1 } }, // Sort by createdAt descending
    { $limit: 2 }, // Limit to the last 2 trips
  ]);
};

const checkPickUpZone = async (req) => {
  const zone = await getPickupZone(req);
  if (!zone || zone.nonServiceZone === 'Yes') {
    return false;
  }

  const userId = await getUserId(req);
  if (!userId) return false;

  let serviceAreaId = null;

  switch (zone.zoneLevel) {
    case 'PRIMARY':
      serviceAreaId = zone._id;
      break;
    case 'SECONDARY':
      serviceAreaId = zone.primaryZoneId;
      break;
  }

  if (serviceAreaId) {
    const user = await User.findById(userId);
    if (user && String(user.zoneId) !== String(serviceAreaId)) {
      await User.findByIdAndUpdate(userId, { zoneId: serviceAreaId });
    }
  }

  return true;
};

const convertLatLngAddress = async (req) => {
  const latlng = await getAddressFromLatLng(req);
  return latlng;
};

const convertAddressLatLng = async (req) => {
  const Address = await getLatLngFromAddress(req);
  return Address;
};

const getRoutePolylines = async (req) => {
  const Address = await getRoutePolyline(req);
  return Address;
};

const getAllRoutePolylines = async (req) => {
  const Address = await getAllRoutePolyline(req);
  return Address;
};

const getTravalTime = async (req) => {
  const Address = await getTravelTime(req);
  return Address;
};

const sendError = (message, data, code) => ({
  success: false,
  message,
  data,
  code,
});

const getRideTypes = async (userId, req) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (!userId) return { status: 401, data: sendError('Token Expired', [], 401) };

    const user = await User.findById(userId);
    if (!user) return { status: 401, data: sendError('Unauthorized', [], 401) };
    if (!user.active) return { status: 403, data: sendError('User is blocked, please contact admin', [], 403) };

    const { pick_lat, pick_lng, drop_lat, drop_long, ride_type, stops, promo_code, ride_time, ride_date } = req.body;

    // const zone = await getPickupZone(req);
    let zone = await getPickupZone(req);

      // promo vehicle type filter in zone price details
        let promo;
      
        if (promo_code) {
          promo = await PromoCode.findById(promo_code);
        }
        
        let zonePriceDetails = zone.zonePriceDetails;
        
        if (promo?.vehicleType?.length) {
          zonePriceDetails = zone.zonePriceDetails.filter(detail =>
            detail.vehicleDetails &&
            promo.vehicleType.some(id =>
              id.toString() === detail.vehicleDetails._id.toString()
            )
          );
        }
        
        zone = {...zone,zonePriceDetails};
            

    if (!zone || zone.nonServiceZone === 'Yes') return { status: 403, data: sendError('Non-service zone', [], 403) };

    let distance = await calculateDistance(pick_lat, pick_lng, drop_lat, drop_long, stops);

    if (zone.unit != 'KM') {
      distance *= 0.6213711922;
    }

    const zonePrice = await calculateZonePrices(
      req,
      zone,
      distance,
      ride_type,
      promo_code,
      user,
      ride_time,
      ride_date,
      drop_lat,
      drop_long,
    );

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

module.exports = {
  getRequest,
  getRequestList,
  getRequestListView,
  userGetRequest,
  getLastTripHistory,
  getRideTypes,
  getDriverRequestInProgress,
  geUserRequestInProgress,
  getRequestListData,
  checkPickUpZone,
  convertLatLngAddress,
  convertAddressLatLng,
  getRoutePolylines,
  getAllRoutePolylines,
  getTravalTime,
};
