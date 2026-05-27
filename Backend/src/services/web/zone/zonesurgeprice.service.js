const httpStatus = require('http-status').default || require('http-status').status || require('http-status');
const ApiError = require('../../../utils/ApiError');
const { ZoneSurgePrice } = require('../../../models');

/**
 * Create a zonePrice
 * @param {Object} zoneSurgePriceBody
 * @returns {Promise<ZoneSurgePrice>}
 */
const createZoneSurgePrice = async (zoneSurgePriceBody) => {
  return ZoneSurgePrice.create(zoneSurgePriceBody);
};

/**
 * Query for zones
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryZoneSurgePrice = async (filter, options) => {
  const zoneSurgePrize = await ZoneSurgePrice.paginate(filter, options);
  return zoneSurgePrize;
};

/**
 * @param {ObjectId} clientId
 * @returns {Promise<ZoneSurgePrice>}
 */
const getZoneSurgePrice = async (clientId) => {
  return ZoneSurgePrice.find({ clientId });
};

/**
 * @param {ObjectId} id
 * @returns {Promise<ZoneSurgePrice>}
 */
const getZoneSurgePriceById = async (id) => {
  return ZoneSurgePrice.findById(id);
};

/**
 * Update role by id
 * @param {ObjectId} zoneSurgePriceId
 * @param {Object} updateBody
 * @returns {Promise<ZonePrice>}
 */
const updateZoneSurgePriceById = async (zoneSurgePriceId, updateBody, zoneId) => {
  let zoneSurgePrice = await getZoneSurgePriceById(zoneSurgePriceId);
  if (!zoneSurgePrice) {
    updateBody.zoneId = zoneId;

    zoneSurgePrice = await createZoneSurgePrice(updateBody);
  }

  Object.assign(zoneSurgePrice, updateBody);
  await zoneSurgePrice.save();
  return zoneSurgePrice;
};

/**
 * Delete groupDocument by id
 * @param {ObjectId} zoneSurgePriceId
 * @returns {Object}
 */
const deleteZoneSurgePriceById = async (zoneSurgePriceId) => {
  const zoneSurgePrice = await getZoneSurgePriceById(zoneSurgePriceId);
  if (!zoneSurgePrice) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Zone not found');
  }
  await zoneSurgePrice.deleteOne();
  return { status: 'success', msg: 'data Deleted Successfully' };
};

module.exports = {
  createZoneSurgePrice,
  queryZoneSurgePrice,
  getZoneSurgePriceById,
  getZoneSurgePrice,
  updateZoneSurgePriceById,
  deleteZoneSurgePriceById,
};
