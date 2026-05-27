const httpStatus = require('http-status').default || require('http-status').status || require('http-status');
const ApiError = require('../../../utils/ApiError');
const { SubScription } = require('../../../models');

/**
 * Create a SubScription
 * @param {Object} subScriptionBody
 * @returns {Promise<subScriptionBody>}
 */
const createSubScription = async (subScriptionBody) => {
  return SubScription.create(subScriptionBody);
};

/**
 * Query for subScription
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const querySubScription = async (filter, options) => {
  const subScription = await SubScription.paginate(filter, options);
  return subScription;
};

/**
 * Get subScription by id
 * @param {ObjectId} subScriptionId
 * @returns {Promise<SubScription>}
 */
const getSubScriptionById = async (subScriptionId) => {
  return SubScription.findById(subScriptionId);
};

/**
 * Get subScription
 * @returns {Promise<SubScription>}
 */
const getSubScription = async (filter = {}) => {
  return SubScription.find(filter);
};

/**
 * Update subScription by id
 * @param {ObjectId} subScriptionId
 * @param {Object} updateBody
 * @returns {Promise<SubScription>}
 */
const updateSubScriptionById = async (subScriptionId, updateBody) => {
  const subScriptionManage = await getSubScriptionById(subScriptionId);
  if (!subScriptionManage) {
    throw new ApiError(httpStatus.NOT_FOUND, 'subScription not found');
  }

  Object.assign(subScriptionManage, updateBody);
  await subScriptionManage.save();
  return subScriptionManage;
};

/**
 * Delete subScription by id
 * @param {ObjectId} subScriptionId
 * @returns {Object}
 */
const deleteSubScriptionnById = async (subScriptionId) => {
  const subScriptionManage = await getSubScriptionById(subScriptionId);
  if (!subScriptionManage) {
    throw new ApiError(httpStatus.NOT_FOUND, 'subScription not found');
  }
  await subScriptionManage.deleteOne();
  return { msg: 'data Deleted Successfully' };
};

const queryclientSubScription = async (filter, options) => {
  const subScription = await SubScription.paginate(filter, options);
  return subScription;
};

const querysuperadminSubScription = async (filter, options) => {};

module.exports = {
  createSubScription,
  querySubScription,
  getSubScription,
  getSubScriptionById,
  updateSubScriptionById,
  deleteSubScriptionnById,
  queryclientSubScription,
  querysuperadminSubScription,
};
