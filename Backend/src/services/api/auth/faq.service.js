const httpStatus = require('http-status').default || require('http-status').status || require('http-status');
const ApiError = require('../../../utils/ApiError');
const { Faq } = require('../../../models');
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
const createFaq = async (req) => {
  req.body.clientId = await getClientId(req);
  return Faq.create(req.body);
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
const queryFaqs = async (filter, options, req) => {
  // Get the clientId from request
  const clientId = await getClientId(req);

  // Add clientId to the filter
  if (clientId) {
    filter.clientId = clientId;
  }

  const faq = await Faq.paginate(filter, options);
  return faq;
};

/**
 * Get wallets
 * @returns {Promise<Sos>}
 */
const getFaqs = async (req) => {
  const category = req.body.type;
  const { zoneId } = req.body;

  const clientId = await getClientId(req);

  return Faq.find({ clientId: new ObjectId(clientId), category, zoneId: new ObjectId(zoneId) });
};

/**
 * Get wallet by id
 * @param {ObjectId} id
 * @returns {Promise<Sos>}
 */
const getFaqById = async (id) => {
  return Faq.findById(id);
};

/**
 * Update Sos by id
 * @param {ObjectId} sosId
 * @param {Object} updateBody
 * @returns {Promise<Sos>}
 */
const updateFaqById = async (sosId, updateBody) => {
  const Faq = await getFaqById(sosId);
  if (!Faq) {
    throw new ApiError(httpStatus.NOT_FOUND, 'sos not found');
  }

  Object.assign(Faq, updateBody);
  await Faq.save();
  return Faq;
};

/**
 * Delete sos by id
 * @param {ObjectId} sosId
 * @returns {Object}
 */
const deleteFaqById = async (sosId) => {
  const Faq = await getFaqById(sosId);
  if (!Faq) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Sos not found');
  }
  await Faq.deleteOne();
  return { status: 'success', msg: 'data Deleted Successfully' };
};

const getFaqsForUser = async (req) => {
  const clientId = await getClientId(req);
  const zoneId = req.body?.zoneId;
  if (!zoneId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'zoneId is required in body');
  }
  return Faq.find({
    clientId: new ObjectId(clientId),
    zoneId: new ObjectId(zoneId),
    status: true,
    $or: [{ userType: { $in: ['User', 'Both'] } }, { userType: { $exists: false } }],
  }).sort({ createdAt: -1 });
};

const getFaqsForDriver = async (req) => {
  const clientId = await getClientId(req);
  const zoneId = req.body?.zoneId;
  if (!zoneId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'zoneId is required in body');
  }
  return Faq.find({
    clientId: new ObjectId(clientId),
    zoneId: new ObjectId(zoneId),
    status: true,
    $or: [{ userType: { $in: ['Driver', 'Both'] } }, { userType: { $exists: false } }],
  }).sort({ createdAt: -1 });
};

module.exports = {
  createFaq,
  queryFaqs,
  getFaqById,
  getFaqs,
  updateFaqById,
  deleteFaqById,
  getFaqsForUser,
  getFaqsForDriver,
};
