const httpStatus = require('http-status').default || require('http-status').status || require('http-status');
const ApiError = require('../../../utils/ApiError');
const { RequestRating } = require('../../../models');
const { tokenService } = require('../..');
const { ObjectId } = require('mongoose').Types;

const { getUserId, getClientId, getDriverId } = require('../../../utils/commonFunction');

/**
  from the mobile side they need to send Client Id and Code (Version code)
  1. Check the Version Available or not if not redirect to update screen
  2. check the avaliable languages for client send the avaliable languages
 */

/**
 * Create a Rating
 * @param {Object} req
 * @returns {Promise<RequestRating>}
 */
const createRating = async (req) => {
  clientId = await getClientId(req);
  const userId = req.user._id;

  req.body.clientId = clientId;
  req.body.userId = userId;

  return RequestRating.create(req.body);
};

/**
 * Query for wallets
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {Object} req
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const querygRatings = async (filter, options, req) => {
  // Get the clientId from request
  const clientId = await getClientId(req);

  // Add clientId to the filter
  if (clientId) {
    filter.clientId = clientId;
  }
  const requestRating = await RequestRating.paginate(filter, options);

  return requestRating;
};

/**
 * Get wallets
 * @returns {Promise<Sos>}
 */
const getRatings = async (req) => {
  const clientId = await getClientId(req);
  return RequestRating.find({ clientId: new ObjectId(clientId) });
};

/**
 * Get wallet by id
 * @param {ObjectId} id
 * @returns {Promise<Sos>}
 */
const getRatingById = async (id) => {
  return RequestRating.findById(id);
};

/**
 * Update Sos by id
 * @param {ObjectId} sosId
 * @param {Object} updateBody
 * @returns {Promise<Sos>}
 */
const updateRatingById = async (sosId, updateBody) => {
  const requestRating = await getRatingById(sosId);
  if (!requestRating) {
    throw new ApiError(httpStatus.NOT_FOUND, 'sos not found');
  }

  Object.assign(requestRating, updateBody);
  await requestRating.save();
  return requestRating;
};

/**
 * Delete sos by id
 * @param {ObjectId} sosId
 * @returns {Object}
 */
const deleteRatingById = async (sosId) => {
  const requestRating = await getRatingById(sosId);
  if (!requestRating) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Sos not found');
  }
  await requestRating.deleteOne();
  return { status: 'success', msg: 'data Deleted Successfully' };
};
const getUserRatings = async (userId) => {
  try {
    const ratings = await RequestRating.aggregate([

      { $match: { userId: new ObjectId(userId) } }, // Match ratings by userId

      // Join with Request collection to fetch request details
      {
        $lookup: {
          from: 'requests',
          localField: 'requestId',
          foreignField: '_id',
          as: 'requestDetails',
        },
      },

      // Unwind the requestDetails array
      {
        $unwind: {
          path: '$requestDetails',
          preserveNullAndEmptyArrays: true, // Keep even if no match
        },
      },

      // Project only the required fields
      {
        $project: {
          _id: 1,
          requestId: 1,
          rating: 1,
          feedback: 1,
          requestNumber: '$requestDetails.requestNumber', // From Request collection
        },
      },

      // Sort by latest ratings
      { $sort: { createdAt: -1 } },
    ]);
    return ratings;
  } catch (error) {
    console.error('Error fetching user ratings:', error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to fetch user ratings');
  }
};

module.exports = {
  createRating,
  querygRatings,
  getRatings,
  getRatingById,
  updateRatingById,
  deleteRatingById,
  getUserRatings,
};
