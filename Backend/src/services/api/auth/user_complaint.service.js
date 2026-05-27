const httpStatus = require('http-status').default || require('http-status').status || require('http-status');
const ApiError = require('../../../utils/ApiError');
const { UserComplaint } = require('../../../models');
const { tokenService } = require('../..');
const { ObjectId } = require('mongoose').Types;

const { getUserId, getClientId, getDriverId } = require('../../../utils/commonFunction');

/**
  from the mobile side they need to send Client Id and Code (Version code)
  1. Check the Version Available or not if not redirect to update screen
  2. check the avaliable languages for client send the avaliable languages
 */

/**
 * Create a wallet
 * @param {Object} req
 * @returns {Promise<UserComplaint>}
 */
const createUserComplaint = async (req) => {
  req.body.clientId = await getClientId(req);
  req.body.userId = await getUserId(req);
  return UserComplaint.create(req.body);
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
const queryUserComplaints = async (filter, options, req) => {
  // Get the clientId from request
  const clientId = await getClientId(req);

  // Add clientId to the filter
  if (clientId) {
    filter.clientId = clientId;
  }

  const userComplaint = await UserComplaint.paginate(filter, options);
  return userComplaint;
};

/**
 * Get wallets
 * @returns {Promise<UserComplaint>}
 */
const getUserComplaints = async (req) => {
  const clientId = await getClientId(req);
  return UserComplaint.find({ clientId: new ObjectId(clientId) });
};

/**
 * Get wallet by id
 * @param {ObjectId} id
 * @returns {Promise<UserComplaint>}
 */
const getUserComplaintById = async (id) => {
  return UserComplaint.findById(id);
};

/**
 * Update Sos by id
 * @param {ObjectId} sosId
 * @param {Object} updateBody
 * @returns {Promise<UserComplaint>}
 */
const updateUserComplaintById = async (userComplaintId, updateBody) => {
  const userComplaint = await getUserComplaintById(userComplaintId);
  if (!userComplaint) {
    throw new ApiError(httpStatus.NOT_FOUND, 'userComplaint not found');
  }

  Object.assign(userComplaint, updateBody);
  await userComplaint.save();
  return userComplaint;
};

/**
 * Delete sos by id
 * @param {ObjectId} userComplaintId
 * @returns {Object}
 */
const deleteUserComplaintById = async (userComplaintId) => {
  const userComplaint = await getUserComplaintById(userComplaintId);
  if (!userComplaint) {
    throw new ApiError(httpStatus.NOT_FOUND, 'userComplaint not found');
  }
  await userComplaint.deleteOne();
  return { status: 'success', msg: 'data Deleted Successfully' };
};

module.exports = {
  createUserComplaint,
  queryUserComplaints,
  getUserComplaintById,
  getUserComplaints,
  updateUserComplaintById,
  deleteUserComplaintById,
};
