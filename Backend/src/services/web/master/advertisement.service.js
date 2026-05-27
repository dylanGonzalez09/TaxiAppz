const httpStatus = require('http-status').default || require('http-status').status || require('http-status');
const ApiError = require('../../../utils/ApiError');
const { Advertisement, User } = require('../../../models');
const { ObjectId } = require('mongoose').Types;
const { HttpStatusCode } = require('axios');

/**
 * Check if there's already an active advertisement for the given userType
 * @param {Object} params
 * @returns {Promise<Advertisement>}
 */
const checkActiveAdvertisementExists = async ({ clientId, zoneId, userType, excludeId = null }) => {
  const filter = {
    clientId: new ObjectId(clientId),
    zoneId: new ObjectId(zoneId),
    userType,
    status: true,
  };

  if (excludeId) {
    filter._id = { $ne: new ObjectId(excludeId) };
  }

  return Advertisement.findOne(filter);
};

/**
 * Create a advertisement
 * @param {Object} advertisementBody
 * @returns {Promise<Advertisement>}
 */
const createAdvertisement = async (advertisementBody) => {
  const { clientId, zoneId, userType, status = true } = advertisementBody;

  // If the new advertisement is being created as active, check for existing active advertisement
  if (status) {
    const existingActive = await checkActiveAdvertisementExists({
      clientId,
      zoneId,
      userType,
    });

    if (existingActive) {
      throw new ApiError(
        httpStatus.CONFLICT,
        `An active advertisement for ${userType} already exists. Only one active advertisement per user type is allowed.`,
      );
    }
  }

  return Advertisement.create(advertisementBody);
};

/**
 * Query for advertisements
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryAdvertisement = async (filter, options) => {
  const limit = parseInt(options.limit, 10) || 10;
  const page = parseInt(options.page, 10) || 1;
  options.sortBy = options.sortBy || 'createdAt:desc';

  const totalResults = await Advertisement.countDocuments(filter);
  const advertisements = await Advertisement.aggregate([
    { $match: filter },
    {
      $lookup: {
        from: 'zones',
        localField: 'zoneId',
        foreignField: '_id',
        as: 'zoneDetails',
      },
    },
    {
      $unwind: {
        path: '$zoneDetails',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        _id: 0,
        id: '$_id',
        title: 1,
        status: 1,
        zoneId: 1,
        userType: 1,
        isPermanent: 1,
        image: {
          $cond: {
            if: { $gt: [{ $type: '$image' }, 'missing'] },
            then: { $concat: ['/uploads/advertisement/', '$image'] },
            else: '',
          },
        },
        createdAt: 1,
        zoneName: '$zoneDetails.zoneName',
      },
    },
    {
      $sort: { createdAt: -1 },
    },
    {
      $skip: (page - 1) * limit,
    },
    {
      $limit: limit,
    },
  ]);

  const totalPages = Math.ceil(totalResults / limit);

  return {
    results: advertisements,
    page,
    limit,
    totalPages,
    totalResults,
  };
};

/**
 * @param {ObjectId} clientId
 * @param {ObjectId} zoneId
 * @returns {Promise<Advertisement>}
 */
const getAdvertisement = async (clientId, zoneId) => {
  return Advertisement.find({ clientId: new ObjectId(clientId), zoneId: new ObjectId(zoneId) });
};

/**
 * Get advertisement by id
 * @param {ObjectId} id
 * @returns {Promise<Advertisement>}
 */
const getAdvertisementById = async (id) => {
  return Advertisement.findById(id);
};

/**
 * Update advertisement by id
 * @param {ObjectId} advertisementId
 * @param {Object} updateBody
 * @returns {Promise<Advertisement>}
 */
const updateAdvertisementById = async (advertisementId, updateBody) => {
  const advertisement = await getAdvertisementById(advertisementId);
  if (!advertisement) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Advertisement not found');
  }

  const { userType, status } = updateBody;

  // Check if we're updating userType or status to active
  if ((userType && userType !== advertisement.userType) || (status !== undefined && status && !advertisement.status)) {
    const targetUserType = userType || advertisement.userType;
    const targetStatus = status !== undefined ? status : advertisement.status;

    if (targetStatus) {
      const existingActive = await checkActiveAdvertisementExists({
        clientId: advertisement.clientId,
        zoneId: advertisement.zoneId,
        userType: targetUserType,
        excludeId: advertisementId,
      });

      if (existingActive) {
        throw new ApiError(
          httpStatus.CONFLICT,
          `An active advertisement for ${targetUserType} already exists. Only one active advertisement per user type is allowed.`,
        );
      }
    }
  }

  Object.assign(advertisement, updateBody);
  await advertisement.save();
  return advertisement;
};

/**
 * Update advertisement status by id
 * @param {ObjectId} advertisementId
 * @param {Boolean} status
 * @returns {Promise<Advertisement>}
 */
const updateAdvertisementStatusById = async (advertisementId, status) => {
  const advertisement = await getAdvertisementById(advertisementId);
  if (!advertisement) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Advertisement not found');
  }

  // If changing status to active, check for existing active advertisement
  if (status && !advertisement.status) {
    const existingActive = await checkActiveAdvertisementExists({
      clientId: advertisement.clientId,
      zoneId: advertisement.zoneId,
      userType: advertisement.userType,
      excludeId: advertisementId,
    });

    if (existingActive) {
      throw new ApiError(
        httpStatus.CONFLICT,
        `An active advertisement for ${userType} already exists. Only one active advertisement per user type is allowed.`,
      );
    }
  }

  advertisement.status = status;
  await advertisement.save();
  return advertisement;
};

/**
 * Delete advertisement by id
 * @param {ObjectId} advertisementId
 * @returns {Object}
 */
const deleteAdvertisementById = async (advertisementId) => {
  const advertisement = await getAdvertisementById(advertisementId);
  if (!advertisement) {
    return { status: httpStatus.NOT_FOUND, msg: 'Advertisement not found' };
  }

  await advertisement.deleteOne();
  return { status: HttpStatusCode.Ok, msg: 'Advertisement deleted successfully' };
};
const getDriverAdvertisementWithoutPagination = async (clientId, zoneId) => {
  if (!clientId || !zoneId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Missing clientId or zoneId');
  }

  const advertisements = await Advertisement.aggregate([
    {
      $match: {
        clientId: new ObjectId(clientId),
        zoneId: new ObjectId(zoneId),
        userType: 'driver',
        status: true,
      },
    },
    {
      $project: {
        _id: 0,
        id: '$_id',
        title: 1,
        userType: 1,
        isPermanent: 1,
        status: 1,
        image: {
          $cond: {
            if: { $gt: [{ $type: '$image' }, 'missing'] },
            then: { $concat: ['/uploads/advertisement/', '$image'] },
            else: '',
          },
        },
        createdAt: 1,
      },
    },
    {
      $sort: { createdAt: -1 },
    },
  ]);

  return advertisements;
};

const getUserAdvertisementWithoutPagination = async (clientId, userId) => {
  if (!clientId || !userId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Missing clientId or userId');
  }

  const user = await User.findById(userId).select('zoneId');
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  const matchStage = {
    clientId: new ObjectId(clientId),
    userType: 'user',
    status: true,
  };

  // Only add zoneId match if it exists
  if (user.zoneId) {
    matchStage.zoneId = new ObjectId(user.zoneId);
  }

  const advertisements = await Advertisement.aggregate([
    { $match: matchStage },
    {
      $project: {
        _id: 0,
        id: '$_id',
        title: 1,
        userType: 1,
        isPermanent: 1,
        status: 1,
        image: {
          $cond: {
            if: { $gt: [{ $type: '$image' }, 'missing'] },
            then: { $concat: ['/uploads/advertisement/', '$image'] },
            else: '',
          },
        },
        createdAt: 1,
      },
    },
    { $sort: { createdAt: -1 } },
  ]);

  return advertisements;
};

module.exports = {
  createAdvertisement,
  queryAdvertisement,
  getAdvertisementById,
  getAdvertisement,
  updateAdvertisementById,
  updateAdvertisementStatusById,
  deleteAdvertisementById,
  getUserAdvertisementWithoutPagination,
  getDriverAdvertisementWithoutPagination,
};
