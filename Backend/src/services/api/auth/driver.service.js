const jwt = require('jsonwebtoken');
const moment = require('moment');
const httpStatus = require('http-status').default || require('http-status').status || require('http-status');
const ApiError = require('../../../utils/ApiError');
const { Driver, DriverLog, Request } = require('../../../models');
const { ObjectId } = require('mongoose').Types;
const tokenService = require('../../token.service');
const mongoose = require('mongoose');
const config = require('../../../config/config');

const { getUserId, getClientId, getDriverId } = require('../../../utils/commonFunction');

/**
  from the mobile side they need to send Client Id and Code (Version code)
  1. Check the Version Available or not if not redirect to update screen
  2. check the avaliable languages for client send the avaliable languages
 */

const getUser = async (req) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(httpStatus.UNAUTHORIZED).send({ message: 'Authorization header is missing or invalid' });
    return;
  }
  // Remove the 'Bearer ' prefix and get the token
  const token = authHeader.substring(7);

  const user = await tokenService.verifyTokenAndGetUser(token);

  return user;
};

const getTokenUserId = async (tokenStr) => {
  let userId = '';

  let driverId = null;

  const authHeader = tokenStr;

  // Remove the 'Bearer ' prefix and get the token
  const token = authHeader;

  const user = await tokenService.verifyTokenAndGetUser(token);

  userId = user.id;

  const driver = await Driver.find({ userId });

  if (driver.length > 0) {
    driverId = driver[0]._id;
  }

  return driverId;
};

const updateDriverOnline = async (req, res) => {
  // let clientId = await getClientId(req);
  const user = await getUser(req);
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    if (!user.active) {
      return res.status(403).json({ message: 'User is blocked, please contact admin' });
    }

    const currentDate = moment().format('YYYY-MM-DD');

    if (user.onlineBy === 1) {
      const log = await DriverLog.findOne({
        driverId: user._id,
        date: currentDate,
        offlineTime: null,
      }).sort({ _id: -1 });

      if (log) {
        const onlineTime = moment(log.onlineTime);
        const offlineTime = moment();
        const workingHours = moment.utc(moment.duration(offlineTime.diff(onlineTime)).asMilliseconds()).format('HH:mm:ss');

        log.offlineTime = offlineTime;
        log.workingTime = workingHours;
        await log.save();
      }
      user.onlineBy = 0;
    } else {
      // Handle setting the driver online
      const existingLog = await DriverLog.findOne({
        driverId: user._id,
        date: currentDate,
        offlineTime: null,
      }).sort({ _id: -1 });

      if (existingLog) {
        const onlineTime = moment(existingLog.onlineTime);
        const offlineTime = moment();
        const workingHours = moment.utc(moment.duration(offlineTime.diff(onlineTime)).asMilliseconds()).format('HH:mm:ss');

        existingLog.offlineTime = offlineTime;
        existingLog.workingTime = workingHours;
        await existingLog.save();
      }

      await DriverLog.create({
        driverId: user._id,
        date: currentDate,
        onlineTime: moment(),
        status: 1,
      });
      user.onlineBy = 1;
    }

    await user.save();
    await session.commitTransaction();
    session.endSession();

    const data = {
      onlineBy: user.onlineBy == 1,
    };

    return data;
  } catch (error) {
    console.error('Error updating driver online status:', error);
    await session.abortTransaction();
    session.endSession();
    return res.status(400).json({ message: 'Catch error', error: error.message });
  }
};

// /**
//  * Get Drivers by id
//  * @param {ObjectId} id
//  * @returns {Promise<Driver>}
//  */
// const getDriversById = async (id) => {

//   const aggregation = [
//     {
//       $match: { _id:new ObjectId(id) }, // Match by the driver's ID
//     },
//     {
//       $lookup: {
//         from: 'vehicles', // Collection name of Vehicle
//         localField: 'type',
//         foreignField: '_id',
//         as: 'vehicle',
//       },
//     },
//     { $unwind: { path: '$vehicle', preserveNullAndEmptyArrays: true } },
//     {
//       $lookup: {
//         from: 'vehiclemodels', // Collection name of VehicleModel
//         localField: 'carModel',
//         foreignField: '_id',
//         as: 'vehicleModel',
//       },
//     },
//     { $unwind: { path: '$vehicleModel', preserveNullAndEmptyArrays: true } },
//     {
//       $lookup: {
//         from: 'users', // Collection name of User
//         localField: 'userId',
//         foreignField: '_id',
//         as: 'user',
//       },
//     },
//     { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },

//     {
//       $project: {
//         _id: 1,
//         type: 1,
//         isAvailable: 1,
//         isActive: 1,
//         isApprove: 1,
//         totalAccept: 1,
//         totalReject: 1,
//         carNumber: 1,
//         carYear: 1,
//         carColour: 1,
//         serviceLocation: 1,
//         rejectCount: 1,
//         documentUploadStatus: 1,
//         referenceCount: 1,
//         city: 1,
//         state: 1,
//         pincode: 1,
//         acceptanceRatio: 1,
//         serviceType: 1,
//         subscriptionType: 1,
//         serviceCategory: 1,
//         brandLabel: 1,
//         loginMethod: 1,
//         approvedBy: 1,
//         notes: 1,
//         vehicleName: '$vehicle.vehicleName',
//         vehicleId: '$vehicle._id',
//         vehicleModelName: '$vehicleModel.modelname',
//         vehicleModelId: '$vehicleModel._id',
//         firstName: '$user.firstName',
//         lastName: '$user.lastName',
//         email: '$user.email',
//         address: '$user.address',
//         rating:'$user.rating',
//         roleid:'$user.roleIds',
//         phoneNumber: '$user.phoneNumber',
//         profilePic: '$user.profilePic',
//         userId: '$user._id',
//         country: '$user.countryCode',
//         gender: '$user.gender'
//       },
//     },
//   ];
//   return Driver.aggregate(aggregation);
// };

const getDriversById = async (req) => {
  const driverId = await getDriverId(req);

  const driverObjectId = new ObjectId(driverId);

  const aggregation = [
    {
      $match: { _id: driverObjectId }, // Match by the driver's ID
    },
    {
      $lookup: {
        from: 'vehicles', // Collection name of Vehicle
        localField: 'type',
        foreignField: '_id',
        as: 'vehicle',
      },
    },
    { $unwind: { path: '$vehicle', preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: 'vehiclemodels', // Collection name of VehicleModel
        localField: 'carModel',
        foreignField: '_id',
        as: 'vehicleModel',
      },
    },
    { $unwind: { path: '$vehicleModel', preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: 'brands', // Collection name of Brand
        localField: 'vehicleModel.brandId',
        foreignField: '_id',
        as: 'vehicleBrand',
      },
    },
    { $unwind: { path: '$vehicleBrand', preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: 'vehiclevariants',
        localField: 'vehicleVariant',
        foreignField: '_id',
        as: 'vehicleVariant',
      },
    },
    {
      $unwind: {
        path: '$vehicleVariant',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'users', // Collection name of User
        localField: 'userId',
        foreignField: '_id',
        as: 'user',
      },
    },
    { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: 'countries',
        let: { countryId: '$user.country' },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: [
                  '$_id',
                  { $toObjectId: '$$countryId' }, // Convert string to ObjectId
                ],
              },
            },
          },
        ],
        as: 'countriesDetails',
      },
    },
    {
      $unwind: {
        path: '$countriesDetails',
        preserveNullAndEmptyArrays: true,
      },
    },

    {
      $lookup: {
        from: 'zones', // Collection name of User
        localField: 'serviceLocation',
        foreignField: '_id',
        as: 'zoneDetails',
      },
    },
    { $unwind: { path: '$zoneDetails', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 1,
        serviceType: 1,
        firstName: '$user.firstName',
        lastName: '$user.lastName',
        email: '$user.email',
        address: '$user.address',
        rating: '$user.rating',
        regDate: '$user.regDate',
        regTime: '$user.regTime',
        phoneNumber: '$user.phoneNumber',
        profilePic: { $concat: ['/uploads/user/', '$user.profilePic'] },
        userId: '$user._id',
        countryCode: '$countriesDetails.dial_code',
        currencySymbol: '$countriesDetails.currency_symbol',
        secondaryZone: 1,
        zoneId: '$serviceLocation',
        'vehicle._id': { $ifNull: ['$vehicle._id', null] },
        'vehicle.vehicleName': { $ifNull: ['$vehicle.vehicleName', null] },
        'vehicle.vehicleNumber': { $ifNull: ['$carNumber', null] },
        'vehicle.image': { $ifNull: ['$vehicle.image', null] },
        'vehicle.vehicleBrandId': { $ifNull: ['$vehicleBrand._id', null] },
        'vehicle.vehicleBrandName': { $ifNull: ['$vehicleBrand.brandName', null] },
        'vehicle.vehicleVariantName': { $ifNull: ['$vehicleVariant.variantName', null] },
        'vehicle.vehicleVariantId': { $ifNull: ['$vehicleVariant._id', null] },
        'vehicle.highlightImage': { $ifNull: ['$vehicle.highlightImage', null] },
        'vehicle.vehicleModelId': { $ifNull: ['$vehicleModel._id', null] },
        'vehicle.vehicleModelName': { $ifNull: ['$vehicleModel.modelname', null] },
        'vehicle.zoneName': { $ifNull: ['$zoneDetails.zoneName', null] },
        'vehicle.carColour': { $ifNull: ['$carColour', null] },
      },
    },
  ];
  return Driver.aggregate(aggregation);
};

const getDriversBytoken = async (token) => {
  const driverId = await getTokenUserId(token);

  const driverObjectId = new ObjectId(driverId);

  const aggregation = [
    {
      $match: { _id: driverObjectId }, // Match by the driver's ID
    },
    {
      $lookup: {
        from: 'vehicles', // Collection name of Vehicle
        localField: 'type',
        foreignField: '_id',
        as: 'vehicle',
      },
    },
    { $unwind: { path: '$vehicle', preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: 'vehiclemodels', // Collection name of VehicleModel
        localField: 'carModel',
        foreignField: '_id',
        as: 'vehicleModel',
      },
    },
    { $unwind: { path: '$vehicleModel', preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: 'users', // Collection name of User
        localField: 'userId',
        foreignField: '_id',
        as: 'user',
      },
    },
    { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: 'zones', // Collection name of User
        localField: 'serviceLocation',
        foreignField: '_id',
        as: 'zoneDetails',
      },
    },
    { $unwind: { path: '$zoneDetails', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 1,
        firstName: '$user.firstName',
        lastName: '$user.lastName',
        email: '$user.email',
        address: '$user.address',
        rating: '$user.rating',
        phoneNumber: '$user.phoneNumber',
        profilePic: '$user.profilePic',
        userId: '$user._id',
        'vehicle._id': { $ifNull: ['$vehicle._id', null] },
        'vehicle.vehicleName': { $ifNull: ['$vehicle.vehicleName', null] },
        'vehicle.vehicleNumber': { $ifNull: ['$carNumber', null] },
        'vehicle.image': { $ifNull: ['$vehicle.image', null] },
        'vehicle.highlightImage': { $ifNull: ['$vehicle.highlightImage', null] },
        'vehicle.vehicleModelId': { $ifNull: ['$vehicleModel._id', null] },
        'vehicle.vehicleModelName': { $ifNull: ['$vehicleModel.modelname', null] },
        'vehicle.vehicleModelName': { $ifNull: ['$vehicleModel.modelname', null] },
        'vehicle.zoneName': { $ifNull: ['$zoneDetails.zoneName', null] },
      },
    },
  ];
  return Driver.aggregate(aggregation);
};

const getRequesHistoryList = async (req) => {
  const clientId = await getClientId(req);
  const driverId = await getDriverId(req);

  return Request.aggregate([
    {
      $match: {
        driverId: new ObjectId(driverId),
        clientId: new ObjectId(clientId),
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

module.exports = {
  getDriversById,
  updateDriverOnline,
  getDriversBytoken,
  getRequesHistoryList,
};
