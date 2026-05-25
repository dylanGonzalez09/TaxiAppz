const httpStatus = require('http-status');
const ApiError = require('../../../utils/ApiError');
const { CancellationReason } = require('../../../models');
const { log } = require('winston');

/**
 * Create a cancellation
 * @param {Object} cancellationBody
 * @returns {Promise<CancellationReason>}
 */
const createCancellation = async (cancellationBody) => {
  return CancellationReason.create(cancellationBody);
};

/**
 * Query for cancellations
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryCancellation = async (filter, options) => {
  const cancellationReasons = await CancellationReason.paginate(filter, options);
  return cancellationReasons;
};

/**
 * Get roles
 * @returns {Promise<CancellationReason>}
 */
const getCancellations = async () => {
  return CancellationReason.find();
};


/**
 * Get cancellation by cancellationId
 * @param {ObjectId} cancellationId
 * @returns {Promise<CancellationReason>}
 */
const getCancellationsById = async (cancellationId) => {
  return CancellationReason.findById(cancellationId);
};





/**
 * Update cancellation by cancellationId
 * @param {ObjectId} cancellationId
 * @param {Object} updateBody
 * @returns {Promise<CancellationReason>}
 */
const updateCancellationById = async (cancellationId, updateBody) => {
  
  const cancellation = await getCancellationsById(cancellationId);
  if (!cancellation) {
    throw new ApiError(httpStatus.NOT_FOUND, 'cancellation not found');
  }
  Object.assign(cancellation, updateBody);
  await cancellation.save();
  return cancellation;
};

/**
 * Delete cancellation by id
 * @param {ObjectId} cancellationId
 * @returns {Object}
 */
const deleteCancellationById = async (cancellationId) => {
  const cancellation = await getCancellationsById(cancellationId);
  if (!cancellation) {
    throw new ApiError(httpStatus.NOT_FOUND, 'cancellation not found');
  }
  await cancellation.deleteOne();
  return { status: "success",   msg:"data Deleted Successfully" };
};

module.exports = {
  createCancellation,
  queryCancellation,
  getCancellationsById,
  getCancellations,
  
  updateCancellationById,
  deleteCancellationById,
};
