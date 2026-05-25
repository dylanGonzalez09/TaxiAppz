const httpStatus = require('http-status');
const ApiError = require('../../../utils/ApiError');
const { ZonePrice } = require('../../../models');

/**
 * Create a zonePrice
 * @param {Object} zonePriceBody
 * @returns {Promise<ZonePrice>}
 */
const createZonePrice = async (zonePriceBody) => {
  return ZonePrice.create(zonePriceBody);
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
const queryZonePrice = async (filter, options) => {
  const zonePrize = await ZonePrice.paginate(filter, options);
  return zonePrize;
};


/**
 * @param {ObjectId} clientId
 * @returns {Promise<ZonePrice>}
 */
const getZonePrice = async (clientId) => {
  return ZonePrice.find({clientId:clientId});
};


/**
 * @param {ObjectId} id
 * @returns {Promise<ZonePrice>}
 */
const getZonePriceById = async (id) => {
  return ZonePrice.findById(id);
};


/**
 * Update role by id
 * @param {ObjectId} zonePriceId
 * @param {Object} updateBody
 * @returns {Promise<ZonePrice>}
 */
const updateZonePriceById = async (zonePriceId, updateBody,zoneId) => {

  
  let zonePrice = await getZonePriceById(zonePriceId);

  if (!zonePrice) {
    updateBody.zoneId = zoneId;


    zonePrice = await createZonePrice(updateBody);
    return zonePrice;
  }

  Object.assign(zonePrice, updateBody);
  await zonePrice.save();
  return zonePrice;
};

/**
 * Delete groupDocument by id
 * @param {ObjectId} zonePriceId
 * @returns {Object}
 */
const deleteZonePriceById = async (zonePriceId) => {
  const zonePrice = await getZonePriceById(zonePriceId);
  if (!zonePrice) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Zone not found');
  }
  await zonePrice.deleteOne();
  return { status: "success",   msg:"data Deleted Successfully" };
};

module.exports = {
  createZonePrice,
  queryZonePrice,
  getZonePriceById,
  getZonePrice,
  updateZonePriceById,
  deleteZonePriceById,
};
