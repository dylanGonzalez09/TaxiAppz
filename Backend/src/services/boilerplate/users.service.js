const httpStatus = require('http-status');
const mongoose = require('mongoose');
const { Users, Request, Language, Country, Zone, Driver,Role } = require('../../models');
const ApiError = require('../../utils/ApiError');
const { autocompletePlaces } = require('../../utils/commonFunction');
const { tokenService } = require('../../services');
const ObjectId = require('mongoose').Types.ObjectId
/**
 * Create a user
 * @param {Object} userBody
 * @returns {Promise<Users>}
 */
const createUser = async (userBody) => {
  if (await Users.isEmailTaken(userBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  return Users.create(userBody);
};

/**
 * Query for users
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryUsers = async (filter, options) => {
  const users = await Users.paginate(filter, options);
  return users;
};

/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<Users>}
 */
const getUserById = async (id) => {
  return Users.findById(id);
  

};

// Function to verify token and fetch user from it
const getUser = async (req) => {
  const token = req; // Assuming `req` is the token directly
  return tokenService.verifyTokenAndGetUser(token);
};
/**
 * Get user by email
 * @param {Object} req - The request object containing the token
 * @returns {Promise<Users>} - User data
 */
const getUserByEmail = async (req) => {
  const user = await getUser(req);
  if (!user) throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  return user;
};
/**
 * Get companys
 * @param {string} email - The clientId to filter users by
 * @returns {Promise<Users>}
 */
const gettUserByEmaiDetails = async (email) => {
  try {
    const results = await Users.aggregate([
      {
        $match: {
          email: email, // Use dot notation if clientId is nested inside userDetails
        },
      },
      {
        $lookup: {
          from: 'language',
          localField: 'language',
          foreignField: '_id',
          as: 'languageDetails',
        },
      }
    ]);


    return results;
  } catch (error) {
    console.error('Error in aggregation:', error);
    throw error;
  }
};

/**
 * Get users by RoleId
 * @param {ObjectId[]} roleIds
 * @returns {Promise<Users[]>}
 */
const getUserByRoleId = async (roleIds) => {

  return Users.find({ roleIds: { $in: roleIds } });
};

/**
 * Update user by id
 * @param {ObjectId} userId
 * @param {Object} updateBody
 * @returns {Promise<Users>}
 */
const updateUserById = async (userId, updateBody) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  if (updateBody.email && (await Users.isEmailTaken(updateBody.email, userId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  Object.assign(user, updateBody);
  await user.save();
  return user;
};

/**
 * Delete user by id
 * @param {ObjectId} userId
 * @returns {Promise<Users>}
 */
const deleteUserById = async (userId) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not foun d');
  }
  await user.deleteOne();
  return { msg: 'data Deleted Successfully' };
};


const fetchAutocompletePlaces = async (keyword, location) => {
  try {
    return await autocompletePlaces(keyword, location);
  } catch (error) {
    throw new Error(error.message);
  }
};


const getRequesHistoryList = async (req) => {

  let clientId = await getClientId(req);
  let userId = await getUserId(req);

  return Request.aggregate([
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'user',
      },
    },
    {
      $match: {
        'user._id': userId,
        clientId: new ObjectId(clientId),
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
 * Get roles
  * @param {ObjectId} clientId
 * @returns {Promise<Role>}
 */
const getDropDowns = async (clientId) => {

  const countryData = await Country.find({ status: true, clientId: clientId });
  const languageData = await Language.find({ status: true, clientId: clientId });

  const data = {
    country: countryData,
    language: languageData,
  }


  return data;
};
const getDashboardByCount = async (clientId) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(clientId)) {
      throw new Error("Invalid clientId format");
    }

    // Lookup roles to get the correct role IDs for "user" and "driver"
    const roles = await Role.find({ role: { $in: ["User", "Driver"] } }, "_id role").lean();

    if (!roles || roles.length === 0) {
      throw new Error("Roles not found");
    }

    const roleMap = roles.reduce((acc, role) => {
      if (role && role._id) {
        acc[role.role] = role._id;
      }
      return acc;
    }, {});

    if (!roleMap["User"] || !roleMap["Driver"]) {
      throw new Error("Required roles (user/driver) not found");
    }

    // Admin Role ID (Hardcoded)
    const adminRoleId = new mongoose.Types.ObjectId("67763bc21e8c5b7e7cabd64c");

    // Count active users
    const activeUsers = (await Users.countDocuments({
      roleIds: roleMap["User"] ?? null,
      // active: true,
      clientId,
    })) || 0;

    // Count active drivers
    const activeDrivers = (await Users.countDocuments({
      roleIds: roleMap["Driver"] ?? null,
      // active: true,
      clientId,
    })) || 0;

    // Count active admins
    const activeAdmins = (await Users.countDocuments({
      roleIds: adminRoleId ?? null,
      // active: true,
      clientId,
    })) || 0;

    // Count active zones
    const activeZones = (await Zone.countDocuments({ 
      // status: true, 
      clientId })) || 0;

    return {
      user: activeUsers ?? 0,
      driver: activeDrivers ?? 0,
      admin: activeAdmins ?? 0,
      zone: activeZones ?? 0,
    };
  } catch (error) {
    console.error('Error fetching counts', error);
    throw new Error('Failed to fetch ');
  }
};
const getAdmins = async (filter) => {
  return await Users.find(filter); 
};

const getUserDetails = async (id) => {
  const user = await Users.findById(id);
  
  if (!user) {
    throw new Error('User not found');
  }

  return {
    username: user.firstName,
    roleIds: user.roleIds, 
    user_type: user.user_type // Return roleIds as before
  };
};
const getByUserDetails = async (userId) => {
  // Validate if userId is a valid MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid user ID format");
  }

  // const user = await Users.findById(userId);
  const user = await Users.aggregate([
    {
      $match:{
        _id: new ObjectId(userId)
      }
    },
    {
      $lookup:{
        from: 'requestratings',
        localField: '_id',
        foreignField: 'userId',
        as: 'ratingDetails',

      }
    },
    {
      $unwind: {
        path: '$ratingDetails',        
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $group: {
        _id: '$ratingDetails.userId',           
        averageRating: { 
          $avg: '$ratingDetails.rating' 
        },
        firstName: { $first: '$firstName' },
        lastName: { $first: '$lastName' },
        avatar: { $first: '$profilePic' },
        email: { $first: '$email' },
        phoneNumber: { $first: '$phoneNumber' },
        tripsCount: { $first: '$tripsCount' },
        active: { $first: '$active' },
        rating: { $first: '$rating'},
      }
    },
    {
      $project: {
        _id: 0,
        userId: '$_id',
        firstName: 1,
        lastName: 1,
        avatar: 1,
        email: 1,
        phoneNumber: 1,
        tripsCount: 1,
        active: 1,
        rating: {
          $ifNull:[{$floor:'$averageRating'},'$rating']
        },
      }
    }
  ]);

  // Check if user exists
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  return user[0];
};

const getLogisticalCounts = async (clientId) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(clientId)) {
      throw new Error("Invalid clientId format");
    }

    // Lookup roles to get the correct role IDs for "user" and "driver"
    const roles = await Role.find({ role: { $in: ["User", "Driver"] } }, "_id role").lean();
    
    if (!roles || roles.length === 0) {
      throw new Error("Roles not found");
    }

    const roleMap = roles.reduce((acc, role) => {
      if (role && role._id) {
        acc[role.role] = role._id;
      }
      return acc;
    }, {});

    if (!roleMap["User"] || !roleMap["Driver"]) {
      throw new Error("Required roles (user/driver) not found");
    }

    // Count active & blocked users using lookup
    const activeUsers = (await Users.countDocuments({
      roleIds: roleMap["User"] ?? null,
      active: true,
      clientId,
    })) || 0;

    const blockedUsers = (await Users.countDocuments({
      roleIds: roleMap["User"] ?? null,
      active: false,
      clientId,
    })) || 0;

    // Count active & blocked drivers using lookup
    const activeDrivers = (await Users.countDocuments({
      roleIds: roleMap["Driver"] ?? null,
      active: true,
      clientId,
    })) || 0;

    const blockedDrivers = (await Users.countDocuments({
      roleIds: roleMap["Driver"] ?? null,
      active: false,
      clientId,
    })) || 0;

    // Count active & blocked zones
    const activeZones = (await Zone.countDocuments({ status: true, clientId })) || 0;
    const blockedZones = (await Zone.countDocuments({ status: false, clientId })) || 0;

    return {
      user: { Active: activeUsers, Block: blockedUsers },
      driver: { Active: activeDrivers, Block: blockedDrivers },
      zone: { Active: activeZones, Block: blockedZones },
    };
  } catch (error) {
    console.error("Error fetching logistical counts:", error.message);
    throw new Error(error.message);
  }

}

module.exports = {
  createUser,
  queryUsers,
  getUserById,
  getUserByRoleId,
  getUserByEmail,
  updateUserById,
  deleteUserById,
  gettUserByEmaiDetails,
  fetchAutocompletePlaces,
  getRequesHistoryList,
  getDropDowns,
  getDashboardByCount,
  getAdmins,
  getUserDetails,
  getByUserDetails,
  getLogisticalCounts,

};
