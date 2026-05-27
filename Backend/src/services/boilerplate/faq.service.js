const httpStatus = require('http-status').default || require('http-status').status || require('http-status');
const ApiError = require('../../utils/ApiError');
const { Faq } = require('../../models');
const { ObjectId } = require('mongoose').Types;

/**
 * Create a faq
 * @param {Object} faqBody
 * @returns {Promise<Faq>}
 */
const createFaq = async (faqBody) => {
  return Faq.create(faqBody);
};

/**
 * Query for faqs
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryFaq = async (filter, options) => {
  const faq = await Faq.paginate(filter, options);
  options.sortBy = options.sortBy || 'createdAt:desc';

  return faq;
};

/**
 * Get roles
 * @returns {Promise<Faq>}
 */
const getFaqs = async () => {
  return Faq.find();
};

/**
 * Get faq by faqId
 * @param {ObjectId} faqId
 * @returns {Promise<Faq>}
 */
const getFaqById = async (faqId) => {
  return Faq.findById(faqId);
};

/**
 * Update faq by faqId
 * @param {ObjectId} faqId
 * @param {Object} updateBody
 * @returns {Promise<Faq>}
 */
const updateFaqById = async (faqId, updateBody) => {
  const faq = await getFaqById(faqId);
  if (!faq) {
    throw new ApiError(httpStatus.NOT_FOUND, 'faq not found');
  }
  Object.assign(faq, updateBody);
  await faq.save();
  return faq;
};

/**
 * Delete faq by id
 * @param {ObjectId} faqId
 * @returns {Object}
 */
const deleteFaqById = async (faqId) => {
  const faq = await getFaqById(faqId);
  if (!faq) {
    throw new ApiError(httpStatus.NOT_FOUND, 'faq not found');
  }
  await faq.deleteOne();
  return { status: 'success', msg: 'data Deleted Successfully' };
};

const getFaqByLanguage = async (req, filter, options) => {
  const { langId } = req.params;
  filter.clientId = new ObjectId(req.headers.clientid);
  filter.language = new ObjectId(langId);
  filter.zoneId = new ObjectId(req.headers.zoneid);

  const faq = await Faq.paginate(filter, options);
  options.sortBy = options.sortBy || 'createdAt:desc';

  return faq;
};

/** FAQs for passenger/user apps: userType User or Both; legacy rows without userType included. */
const getFaqsForUser = async (req) => {
  if (!req.headers.clientid) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'ClientID is required');
  }
  const zoneId = req.body?.zoneId || req.headers.zoneid;
  if (!zoneId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'zoneId is required in body');
  }
  const filter = {
    clientId: new ObjectId(req.headers.clientid),
    zoneId: new ObjectId(zoneId),
    status: true,
    $or: [{ userType: { $in: ['User', 'Both'] } }, { userType: { $exists: false } }],
  };
  return Faq.find(filter).sort({ createdAt: -1 });
};

/** FAQs for driver apps: userType Driver or Both; legacy rows without userType included. */
const getFaqsForDriver = async (req) => {
  if (!req.headers.clientid) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'ClientID is required');
  }
  const zoneId = req.body?.zoneId || req.headers.zoneid;
  if (!zoneId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'zoneId is required in body');
  }
  const filter = {
    clientId: new ObjectId(req.headers.clientid),
    zoneId: new ObjectId(zoneId),
    status: true,
    $or: [{ userType: { $in: ['Driver', 'Both'] } }, { userType: { $exists: false } }],
  };
  return Faq.find(filter).sort({ createdAt: -1 });
};

module.exports = {
  createFaq,
  queryFaq,
  getFaqById,
  getFaqs,

  updateFaqById,
  deleteFaqById,
  getFaqByLanguage,
  getFaqsForUser,
  getFaqsForDriver,
};
