const httpStatus = require('http-status').default || require('http-status').status || require('http-status');
const ApiError = require('../../../utils/ApiError');
const { Sos, Country } = require('../../../models');
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
 * @returns {Promise<Sos>}
 */
const createSos = async (req) => {
  req.body.userId = await getUserId(req);
  req.body.clientId = await getClientId(req);

  const count = await Sos.countDocuments({ userId: req.body.userId });

  if (count >= 8) {
    throw new ApiError(httpStatus.BAD_REQUEST, `You have reached the maximum limit of 8 SOS requests !`);
  }

  const isExist = await Sos.findOne({ userId: req.body.userId, phoneNumber: req.body.phoneNumber });

  if (isExist) {
    throw new ApiError(httpStatus.BAD_REQUEST, `This number ${req.body.phoneNumber} already exists !`);
  }
  req.body.countryCode = new ObjectId(req.body.countryCode);
  const data = await Country.findById(req.body.countryCode);
  if (!data) {
    throw new ApiError(httpStatus.BAD_REQUEST, `Country not found !`);
  }
  req.body.dialCode = data.dial_code;

  return Sos.create(req.body);
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
const querySoss = async (filter, options, req) => {
  // Get the clientId from request
  const clientId = await getClientId(req);

  // Add clientId to the filter
  if (clientId) {
    filter.clientId = clientId;
  }

  const sos = await Sos.paginate(filter, options);
  return sos;
};

/**
 * Get wallets
 * @returns {Promise<Sos>}
 */
const getSoss = async (req) => {
  const clientId = await getClientId(req);
  const userId = await getUserId(req);
  return Sos.find({ clientId: new ObjectId(clientId), userId: new ObjectId(userId) });
};

/**
 * Get wallet by id
 * @param {ObjectId} id
 * @returns {Promise<Sos>}
 */
const getSosById = async (id) => {
  return Sos.findById(id);
};

/**
 * Update Sos by id
 * @param {ObjectId} sosId
 * @param {Object} updateBody
 * @returns {Promise<Sos>}
 */
const updateSosById = async (sosId, updateBody) => {
  const sos = await getSosById(sosId);
  if (!sos) {
    throw new ApiError(httpStatus.NOT_FOUND, 'sos not found');
  }

  Object.assign(sos, updateBody);
  await sos.save();
  return sos;
};

/**
 * Delete sos by id
 * @param {ObjectId} sosId
 * @returns {Object}
 */
const deleteSosById = async (sosId) => {
  const sos = await getSosById(sosId);
  if (!sos) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Sos not found');
  }
  await sos.deleteOne();
  return { status: 'success', msg: 'data Deleted Successfully' };
};

module.exports = {
  createSos,
  querySoss,
  getSosById,
  getSoss,
  updateSosById,
  deleteSosById,
};
