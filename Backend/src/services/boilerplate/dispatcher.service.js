const httpStatus = require('http-status').default || require('http-status').status || require('http-status');
const ApiError = require('../../utils/ApiError');
const { Dispatcher, Zone, Role, Language, Request } = require('../../models');
const { ObjectId } = require('mongoose').Types;
const { HttpStatusCode } = require('axios');

const { getClientId } = require('../../utils/commonFunction');
/**
 * Create a dispatcher
 * @param {Object} dispatcherBody
 * @returns {Promise<Dispatcher>}
 */
const createDispatcher = async (dispatcherBody) => {
  return Dispatcher.create(dispatcherBody);
};

/**
 * Query for Dispatchers
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @returns {Promise<QueryResult>}
 */
const queryDispatchers = async (filter, options) => {
  const dispatchers = await Dispatcher.paginate(filter, options);
  return dispatchers;
};

/**
 * Get all Dispatchers
 * @returns {Promise<Dispatcher[]>}
 */
const getDispatchers = async () => {
  return Dispatcher.find();
};

/**
 * Get Dispatcher by id
 * @param {ObjectId} dispatcherId
 * @returns {Promise<Dispatcher>}
 */
const getDispatcherById = async (dispatcherId) => {
  return Dispatcher.findById(dispatcherId);
};

/**
 * Get Dispatcher by id
 * @param {ObjectId} dispatcherId
 * @returns {Promise<Dispatcher>}
 */
const getDispatcherUserById = async (dispatcherId) => {
  const aggregation = [
    { $match: { _id: new ObjectId(dispatcherId) } },
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'user',
      },
    },
    { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        id: '$_id',
        userId: '$user._id',
        firstName: '$user.firstName',
        lastName: '$user.lastName',
        phoneNumber: '$user.phoneNumber',
        language: '$user.language',
        email: '$user.email',
        image: '$user.profilePic',
        serviceType: 1,
        location: 1,
        status: 1,
        _id: 0,
      },
    },
  ];
  return Dispatcher.aggregate(aggregation);
};

/**
 * Update Dispatcher by id
 * @param {ObjectId} dispatcherId
 * @param {Object} updateBody
 * @returns {Promise<Dispatcher>}
 */
const updateDispatcherById = async (dispatcherId, updateBody) => {
  const dispatcher = await getDispatcherById(dispatcherId);
  if (!dispatcher) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Dispatcher not found');
  }
  Object.assign(dispatcher, updateBody);
  await dispatcher.save();
  return dispatcher;
};

/**
 * Delete dispatcher by id
 * @param {ObjectId} dispatcherId
 * @returns {Object}
 */
const deleteDispatcherById = async (dispatcherId) => {
  const dispatcher = await getDispatcherById(dispatcherId);
  if (!dispatcher) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Dispatcher not found');
  }

  const request = await Request.countDocuments({ dispatcherId: new ObjectId(dispatcher._id) });
  if (request > 0) {
    return {
      status: httpStatus.FORBIDDEN,
      msg: 'The dispatcher has trip history...so you cannot delete this dispatcher...',
    };
  }
  await dispatcher.deleteOne();
  return { status: HttpStatusCode.Ok, msg: 'Dispatcher deleted successfully' };
};

/**
 * Aggregate dispatchers with related data based on clientId
 * @param {ObjectId} clientId
 * @returns {Promise<Array>}
 */
const aggregateDispatchers = async (clientId) => {
  const aggregation = [
    { $match: { clientId: new ObjectId(clientId) } },
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'user',
      },
    },
    { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        id: '$_id',
        userId: '$user._id',
        firstName: '$user.firstName',
        lastName: '$user.lastName',
        phoneNumber: '$user.phoneNumber',
        language: '$user.language',
        email: '$user.email',
        image: '$user.profilePic',
        serviceType: 1,
        location: 1,
        status: 1,
        _id: 0,
      },
    },
  ];
  return Dispatcher.aggregate(aggregation);
};

const getDispatcherPagination = async (req, filter, options) => {
  try {
    const clientId = await getClientId(req);
    const limit = parseInt(options.limit, 10) || 10;
    const page = parseInt(options.page, 10) || 1;

    // First, get the total count of documents matching the criteria
    const totalResults = await Dispatcher.countDocuments({
      clientId: new ObjectId(clientId),
    });
    options.sortBy = options.sortBy || 'createdAt:desc';

    const results = await Dispatcher.aggregate([
      { $match: { clientId: new ObjectId(clientId) } },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          id: '$_id',
          userId: '$user._id',
          firstName: '$user.firstName',
          lastName: '$user.lastName',
          phoneNumber: '$user.phoneNumber',
          language: '$user.language',
          email: '$user.email',
          image: '$user.profilePic',
          serviceType: 1,
          location: 1,
          status: 1,
          zoneId: 1,
          createdAt: 1,
          _id: 0,
        },
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
    ]);
    const totalPages = Math.ceil(totalResults / limit);

    return {
      results,
      page,
      limit,
      totalPages,
      totalResults,
    };
  } catch (error) {
    console.error('Error in aggregation:', error);
    throw error;
  }
};
/**
 * Get roles
 * @param {ObjectId} clientId
 * @returns {Promise<Role>}
 */
const getDropDowns = async (clientId) => {
  const roleData = await Role.find({ clientId });

  const languageData = await Language.find({ status: true, clientId });

  const zoneData = await Zone.find({ clientId });

  const data = {
    role: roleData,
    language: languageData,
    zones: zoneData,
  };

  return data;
};

module.exports = {
  createDispatcher,
  queryDispatchers,
  getDispatchers,
  getDispatcherById,
  updateDispatcherById,
  deleteDispatcherById,
  aggregateDispatchers,
  getDispatcherUserById,
  getDispatcherPagination,
  getDropDowns,
};
