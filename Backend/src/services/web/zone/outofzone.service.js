const httpStatus = require('http-status');
const ApiError = require('../../../utils/ApiError');
const { OutOfZone } = require('../../../models');
const { log } = require('winston');

/**
 * Create a outOfZone
 * @param {Object} outOfZoneBody
 * @returns {Promise<OutOfZone>}
 */
const createOutOfZone = async (outOfZoneBody) => {
  return OutOfZone.create(outOfZoneBody);
};

/**
 * Query for outOfZones
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryOutOfZone = async (filter, options) => {
  options.sortBy = options.sortBy || 'createdAt:desc';

  const outOfZone = await OutOfZone.paginate(filter, options);

  const { docs, totalDocs, ...rest } = outOfZone;

  return {
    results: docs,
    totalResults: totalDocs,
    ...rest,
  };
};


/**
 * Get roles
 * @returns {Promise<OutOfZone>}
 */
const getOutOfZones = async () => {
  return OutOfZone.find();
};


/**
 * Get outOfZone by outOfZoneId
 * @param {ObjectId} outOfZoneId
 * @returns {Promise<OutOfZone>}
 */
const getOutOfZoneById = async (outOfZoneId) => {
  return OutOfZone.findById(outOfZoneId);
};





/**
 * Update outOfZone by outOfZoneId
 * @param {ObjectId} outOfZoneId
 * @param {Object} updateBody
 * @returns {Promise<OutOfZone>}
 */
const updateOutOfZoneById = async (outOfZoneId, updateBody) => {
  
  const outOfZone = await getOutOfZoneById(outOfZoneId);
  if (!outOfZone) {
    throw new ApiError(httpStatus.NOT_FOUND, 'outOfZone not found');
  }
  Object.assign(outOfZone, updateBody);
  await outOfZone.save();
  return outOfZone;
};

/**
 * Delete outOfZone by id
 * @param {ObjectId} outOfZoneId
 * @returns {Object}
 */
const deleteOutOfZoneById = async (outOfZoneId) => {
  const outOfZone = await getOutOfZoneById(outOfZoneId);
  if (!outOfZone) {
    throw new ApiError(httpStatus.NOT_FOUND, 'outOfZone not found');
  }
  await outOfZone.deleteOne();
  return { status: "success",   msg:"data Deleted Successfully" };
};

module.exports = {
  createOutOfZone,
  queryOutOfZone,
  getOutOfZoneById,
  getOutOfZones,
  
  updateOutOfZoneById,
  deleteOutOfZoneById,
};
