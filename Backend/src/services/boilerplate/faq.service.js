const httpStatus = require('http-status');
const ApiError = require('../../utils/ApiError');
const { Faq } = require('../../models');
const ObjectId = require('mongoose').Types.ObjectId;

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
  return { status: "success",   msg:"data Deleted Successfully" };
};

const getFaqByLanguage = async (req,filter, options) => {
  const langId = req.params.langId;
  filter.clientId = new ObjectId(req.headers.clientid);
  filter.language = new ObjectId(langId);

  const faq = await Faq.paginate(filter, options);
  options.sortBy = options.sortBy || 'createdAt:desc';

  return faq;

};

module.exports = {
  createFaq,
  queryFaq,
  getFaqById,
  getFaqs,
  getFaqByLanguage,
  updateFaqById,
  deleteFaqById,
  getFaqByLanguage
};
