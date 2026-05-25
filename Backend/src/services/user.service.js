const httpStatus = require('http-status');
const { User, Role, Users, Request, Wallet, Driver } = require('../models');
const ApiError = require('../utils/ApiError');
const { autocompletePlaces, getPrimaryZone } = require('../utils/commonFunction');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const ObjectId = require('mongoose').Types.ObjectId
const config = require('../config/config');
const { HttpStatusCode } = require('axios');

const getClientId = async (req) => {
  clientId = '';

  if (!req.headers.clientid) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ClientID not found');
  } else {
    clientId = req.headers.clientid;
  }
  return clientId;
}


const getUserId = async (req) => {

  let userId = '';

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(httpStatus.UNAUTHORIZED).send({ message: 'Authorization header is missing or invalid' });
    return;
  }
  // Remove the 'Bearer ' prefix and get the token
  const token = authHeader.substring(7);

  const user = await verifyTokenAndGetUser(token);
  userId = user.id;
  return userId;
}


const verifyTokenAndGetUser = async (token) => {
  try {
    const payload = jwt.verify(token, config.jwt.secret);
    const user = await Users.findById(payload.sub);
    return user;
  } catch (error) {
    return error; // Or throw an error if preferred
  }
};

const getCompanyId = async (req) => {
  companyId = '';
  if (!req.headers.companyid) {
    companyId = null;
  } else {
    companyId = req.headers.companyid;
  }
  return companyId;
}

const getRoleIdsByRoleName = async (roleName) => {
  const roles = await Role.find({ role: roleName });
  return roles.map((role) => role.id);
};




/**
 * Create a user
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
const createUser = async (userBody) => {
  return User.create(userBody);
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
  const users = await User.paginate(filter, options);
  return users;
};

/**2
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getUserById = async (_id) => {
  return User.findById(_id);
};

/**
 * Get user by email
 * @param {string} email
 * @returns {Promise<User>}
 */
const getUserByEmail = async (email) => {
  return User.findOne({ email, active: true });
};


/**
 * Get user by email
 * @param {string} phoneNumber
 * @param {string} countryCode
 * @returns {Promise<User>}
 */
const getUserByPhone = async (phoneNumber) => {
  return User.findOne({ "phoneNumber": phoneNumber });
};


/**
 * Get user by email
 * @param {string} phoneNumber
 * @param {string} countryCode
 * @returns {Promise<User>}
 */
const getDriverByPhone = async (phoneNumber) => {
  return User.findOne({ "phoneNumber": phoneNumber });
};

/**
 * Get companys
 * @param {string} email - The clientId to filter users by
 * @returns {Promise<Users>}
 */
const gettUserByEmaiDetails = async (email) => {
  try {
    // Fetch user data from the User collection
    const results = await User.aggregate([
      {
        $match: {
          email: email
        }
      }
    ]);

    if (results.length === 0) {
      return null;  // No user found
    }

    const user = results[0];  // Assuming only one result

    const roles = await Role.find({
      _id: { $in: user.roleIds } // Match roleIds from the user document
    });

    // Map over the roles and get the role names
    const userRoles = roles.map(role => role.role);

    // Add the role names to the user data
    user.roles = userRoles[0];

    return user;
  } catch (error) {
    console.error('Error in aggregation:', error);
    throw error;
  }
};


/**
 * Get All User
 * @param {ObjectId} clientId
 * @returns {Promise<User>}
 */
const getAllUsers = async (req) => {
  const clientId = await getClientId(req);
  if (!clientId) {
    throw new Error("Client ID is required.");
  }

  const userRoleIds = await getRoleIdsByRoleName("User");

  const filter = { clientId };
  filter.roleIds = { $in: userRoleIds };
  const userRole = await Role.findOne({role: 'User'});
  if(userRole)
  {
    filter.roleIds = userRole._id;
  }

  return User.find(filter).sort({ createdAt: -1 });
  // return User.find({ clientId: clientId }).sort({ createdAt: -1 });
};

// const getAllAdmins = async (req, filter, options) => {
//   const clientId = await getClientId(req); // Ensure clientId is set properly
//   filter.clientId = clientId;

//   const adminRoleIds = await getRoleIdsByRoleName("Admin");

//   filter.roleIds = { $in: adminRoleIds };

//   const users = await User.paginate(filter, options);
//   return users;
// };
/**
 * Query for users with pagination
 * @param {Object} filter - MongoDB filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Max number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const getAllAdmins = async (req, filter, options) => {
  const clientId = await getClientId(req);
  filter.clientId = clientId;

  const [superAdminRoleIds, clientRoleIds, userRoleIds, driverRoleIds,demoRoleIds] = await Promise.all([
    getRoleIdsByRoleName("Superadmin"),
    getRoleIdsByRoleName("Client"),
    getRoleIdsByRoleName("User"),
    getRoleIdsByRoleName("Driver"),
    getRoleIdsByRoleName("Demo")

  ]);

  // Flatten the arrays of role IDs and apply $nin filter
  const excludedRoleIds = [
    ...superAdminRoleIds,
    ...clientRoleIds,
    ...userRoleIds,
    ...driverRoleIds,
    ...demoRoleIds
  ];

  filter.roleIds = { $nin: excludedRoleIds };

  options.sortBy = options.sortBy || 'createdAt:desc';

  const users = await User.paginate(filter, {
    ...options,
    populate: 'roleIds'
  });


  return users;
};


/**
 * Query for users with pagination
 * @param {Object} filter - MongoDB filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Max number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const getAllUser = async (req, filter, options) => {
  const clientId = await getClientId(req); // Ensure clientId is set properly

  const companyId = await getCompanyId(req); // Ensure clientId is set properly

  const limit = parseInt(options.limit, 10) || 10;
  const page = parseInt(options.page, 10) || 1;

  if (companyId) {
    filter.companyId = companyId;
  }

  filter.clientId = clientId;

  const adminRoleIds = await getRoleIdsByRoleName("User");

  filter.roleIds = { $in: adminRoleIds.map(id => new ObjectId(id)) };
  filter.clientId = new ObjectId(clientId);
  options.sortBy = options.sortBy || 'createdAt:desc';

  // const users = await User.paginate(filter, options);

  const user = await User.aggregate([
    {
      $match: filter
    },
    {
      $lookup: {
        from: 'wallets',
        localField: '_id',
        foreignField: 'userId',
        as: 'walletDetails'
      }
    },
    {
      $lookup: {
        from: 'requestratings',
        localField: '_id',
        foreignField: 'userId',
        as: 'ratingDetails'
      }
    },
    { $unwind: { path: '$walletDetails', preserveNullAndEmptyArrays: true } },
    { $unwind: { path: '$ratingDetails', preserveNullAndEmptyArrays: true } },
    {
      $group: {
        _id: '$_id',
        averageRating: { $avg: '$ratingDetails.rating' },
        firstName: { $first: '$firstName' },
        lastName: { $first: '$lastName' },
        email: { $first: '$email' },
        country: { $first: '$country' },
        language: { $first: '$language' },
        avatar: { $first: '$profilePic' },
        phoneNumber: { $first: '$phoneNumber' },
        tripsCount: { $first: '$tripsCount' },
        active: { $first: '$active' },
        rating: { $first: '$rating' },
        Wallet: { $first: '$walletDetails.balance' },
        createdAt: { $first: '$createdAt' }, // ✅ Preserve createdAt
      }
    },
    {
      $project: {
        id: '$_id',
        firstName: 1,
        lastName: 1,
        email: 1,
        country: 1,
        language: 1,
        avatar: 1,
        phoneNumber: 1,
        tripsCount: 1,
        Wallet: { $round: [
              { $toDouble: { $ifNull: ['$Wallet', 0.0] } },
              2,
            ], },
        rating: { $ifNull: [{ $floor: '$averageRating' }, '$rating'] },
        active: 1,
        createdAt: 1
      }
    },
    {
      $sort: { createdAt: -1 }
    },
    {
      $skip: (page - 1) * limit
    },
    {
      $limit: limit
    }
  ]);

  const totalResults = await User.countDocuments(filter);
  const totalPages = Math.ceil(totalResults / limit);

  return {
    results: user,
    page,
    limit,
    totalPages,
    totalResults,
  };

  // return users;
};


/**
 * Get users by RoleId
 * @param {ObjectId[]} roleIds
 * @returns {Promise<User[]>}
 */
const getUserByRoleId = async (roleIds) => {
  return User.find({ roleIds: { $in: roleIds } });
};

/**
 * Update user by id
 * @param {ObjectId} userId
 * @param {Object} updateBody
 * @returns {Promise<User>}
 */
const updateUserById = async (userId, updateBody) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  if (updateBody.email && (await User.isEmailTaken(updateBody.email, userId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  Object.assign(user, updateBody);
  await user.save();
  return user;
};

/**
 * Delete user by id
 * @param {ObjectId} userId
 * @returns {Promise<User>}
 */
const deleteUserById = async (userId) => {
  const user = await getUserById(userId);
  if (!user) {
    return { status: httpStatus.NOT_FOUND, msg: "User not found" };
  }

  const request = await Request.countDocuments({ userId: new ObjectId(user._id) });
  if (request > 0) {
    return { status: httpStatus.FORBIDDEN, msg: "The user has trip history...so you cannot delete this user..." };
  }
  await Wallet.deleteOne({ userId: new ObjectId(user._id) });
  await user.deleteOne();

  return { status: HttpStatusCode.Ok, msg: "Data Deleted Successfully" };
};


/**
 * Delete user by id
 * @param {ObjectId} userId
 * @returns {Promise<User>}
 */
const deleteMobileUserById = async (userId) => {
  const user = await getUserById(userId);
  if (!user) {
    return { status: httpStatus.NOT_FOUND, msg: "User not found" };
  }

  await Wallet.deleteOne({ userId: new ObjectId(user._id) });

  const driver = await Driver.findOne({ userId: new ObjectId(user._id) });

  if (driver) {
    driver.deleteOne();
  }

  await user.deleteOne();

  return { status: HttpStatusCode.Ok, msg: "Data Deleted Successfully" };
};



const fetchAutocompletePlaces = async (keyword, location) => {
  try {
    return await autocompletePlaces(keyword, location);
  } catch (error) {
    throw new Error(error.message);
  }
};

const getPrimaryZoneDetail = async (lat, lon) => {
  try {
    return await getPrimaryZone(lat, lon);
  } catch (error) {
    throw new Error(error.message);
  }
};

const getRequesHistoryList = async (req) => {

  let clientId = await getClientId(req);
  let userId = await getUserId(req);

  return Request.aggregate([
    {
      $match: {
        clientId: new ObjectId(clientId),
        userId: new ObjectId(userId)
      }
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


module.exports = {
  createUser,
  queryUsers,
  getAllAdmins,
  getAllUsers,
  getAllUser,
  getUserById,
  getUserByRoleId,
  getUserByEmail,
  updateUserById,
  deleteUserById,
  gettUserByEmaiDetails,
  getUserByPhone,
  getDriverByPhone,
  fetchAutocompletePlaces,
  getRequesHistoryList,
  getPrimaryZoneDetail,
  deleteMobileUserById
};
