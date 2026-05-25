const httpStatus = require('http-status');
const ApiError = require('../../utils/ApiError');
const { CompanySubscription } = require('../../models');

/**
 * Create a SubScription
 * @param {Object} subScriptionBody
 * @returns {Promise<CompanySubscription>}
 */
const createSubScription = async (subScriptionBody) => {
  return CompanySubscription.create(subScriptionBody);
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
  const subScription = await CompanySubscription.paginate(filter, options);
  options.sortBy = options.sortBy || 'createdAt:desc';
  return subScription;
};

/**
 * Get subScription by id
 * @param {ObjectId} subScriptionId
 * @returns {Promise<CompanySubscription>}
 */
const getSubScriptionById = async (subScriptionId) => {
  return CompanySubscription.findById(subScriptionId);
};


/**
 * Get subScription
 * @returns {Promise<CompanySubscription>}
 */
const getSubScription = async () => {
  return CompanySubscription.find();
};

/**
 * Update subScription by id
 * @param {ObjectId} subScriptionId
 * @param {Object} updateBody
 * @returns {Promise<CompanySubscription>}
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
  return { msg: "data Deleted Successfully" };
};

const querysuperadminSubScription = async (filter, options) => {
  const subScription = await CompanySubscription.paginate(filter, options);
  return subScription;
};


module.exports = {
  createSubScription,
  querySubScription,
  getSubScription,
  getSubScriptionById,
  updateSubScriptionById,
  deleteSubScriptionnById,
  querysuperadminSubScription,

};
