const httpStatus = require('http-status').default || require('http-status').status || require('http-status');
const { log } = require('winston');
const { ObjectId } = require('mongodb');
const ApiError = require('../../utils/ApiError');
const { InvoiceQuestion, RequestRating, User, Request } = require('../../models');
/**
 * Create a invoiceQuestion
 * @param {Object} invoiceQuestionBody
 * @returns {Promise<InvoiceQuestion>}
 */
const createInvoiceQuestion = async (invoiceQuestionBody) => {
  return InvoiceQuestion.create(invoiceQuestionBody);
};

/**
 * Query for invoiceQuestions
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryInvoiceQuestion = async (filter, options, zoneId, clientId) => {
  options.sortBy = options.sortBy || 'createdAt:desc';

  // Enforce both clientId and zoneId
  filter.clientId = clientId;
  filter.zoneId = new ObjectId(zoneId); // ensure zoneId is treated as ObjectId

  const invoiceQuestion = await InvoiceQuestion.paginate(filter, options);
  return invoiceQuestion;
};

/**
 * Get roles
 * @returns {Promise<InvoiceQuestion>}
 */
const getInvoiceQuestions = async () => {
  return InvoiceQuestion.find();
};

/**
 * Get roles
 * @returns {Promise<InvoiceQuestion>}
 */
const getUserInvoiceQuestions = async (req) => {
  const { zoneId } = req.body;
  return InvoiceQuestion.find({ role: 'User', zoneId: new ObjectId(zoneId) });
};

/**
 * Get roles
 * @returns {Promise<InvoiceQuestion>}
 */
const getDriverInvoiceQuestions = async (req) => {
  const { zoneId } = req.body;

  return InvoiceQuestion.find({ role: 'Driver', zoneId: new ObjectId(zoneId) });
};

/**
 * Get invoiceQuestion by invoiceQuestionId
 * @param {ObjectId} invoiceQuestionId
 * @returns {Promise<InvoiceQuestion>}
 */
const getInvoiceQuestionById = async (invoiceQuestionId) => {
  return InvoiceQuestion.findById(invoiceQuestionId);
};

/**
 * Update invoiceQuestion by invoiceQuestionId
 * @param {ObjectId} invoiceQuestionId
 * @param {Object} updateBody
 * @returns {Promise<InvoiceQuestion>}
 */
const updateInvoiceQuestionById = async (invoiceQuestionId, updateBody) => {
  const invoiceQuestion = await getInvoiceQuestionById(invoiceQuestionId);
  if (!invoiceQuestion) {
    throw new ApiError(httpStatus.NOT_FOUND, 'invoiceQuestion not found');
  }
  Object.assign(invoiceQuestion, updateBody);
  await invoiceQuestion.save();
  return invoiceQuestion;
};

/**
 * Delete invoiceQuestion by id
 * @param {ObjectId} invoiceQuestionId
 * @returns {Object}
 */
const deleteInvoiceQuestionById = async (invoiceQuestionId) => {
  const invoiceQuestion = await getInvoiceQuestionById(invoiceQuestionId);
  if (!invoiceQuestion) {
    throw new ApiError(httpStatus.NOT_FOUND, 'invoiceQuestion not found');
  }
  await invoiceQuestion.deleteOne();
  return { status: 'success', msg: 'data Deleted Successfully' };
};

const getQuestionReport = async (zoneId) => {
  try {
    const zoneObjectId = new ObjectId(zoneId);

    const invoiceQuestions = await InvoiceQuestion.find({
      $or: [{ zoneId: zoneObjectId }],
    });

    // Get ratings filtered by request's zoneId
    const requestRatings = await RequestRating.aggregate([
      {
        $lookup: {
          from: 'requests',
          localField: 'requestId',
          foreignField: '_id',
          as: 'requestDetails',
        },
      },
      { $unwind: '$requestDetails' },
      {
        $match: {
          'requestDetails.zoneId': zoneObjectId,
        },
      },
    ]);

    const questionStats = [];

    for (const question of invoiceQuestions) {
      let agree = 0;
      let disagree = 0;

      for (const rating of requestRatings) {
        if (typeof rating.feedback === 'string') {
          const feedbackArray = rating.feedback.split(',').map((f) => f.trim().toLowerCase());

          if (feedbackArray.includes(question.question.toLowerCase())) {
            agree += 1;
          } else {
            disagree += 1;
          }
        }
      }

      const total = agree + disagree;

      questionStats.push({
        _id: question._id,
        question: question.question,
        role: question.role,
        agreeCount: agree,
        disagreeCount: disagree,
        agree: `${total ? Math.round((agree / total) * 100) : 0}%`,
        disagree: `${total ? Math.round((disagree / total) * 100) : 0}%`,
      });
    }

    return questionStats;
  } catch (error) {
    console.error('getQuestionReport error:', error);
    throw new Error(`Error in fetching question report: ${error.message}`);
  }
};

const questionReportDetails = async (req, filter, options) => {
  const questionId = req.params.id;
  const limit = parseInt(options.limit, 10) || 10;
  const page = parseInt(options.page, 10) || 1;

  const ratings = await RequestRating.find({ feedback: { $exists: true, $ne: null } });
  // .skip((page - 1) * limit)  // Calculate the skip based on the page number and limit
  // .limit(limit);

  // const totalCount = await RequestRating.countDocuments({ feedback: { $exists: true, $ne: null } });

  const questionStats = [];
  for (const rating of ratings) {
    const feedbackArray = parseFeedbackString(rating.feedback);

    const matchedFeedback = feedbackArray.filter((feedback) => feedback.id === questionId);

    const doneStatus = matchedFeedback.length > 0 ? 'accepted' : 'declined';

    const user = await User.findOne({ _id: rating.userId }).select('firstName lastName phoneNumber');

    const request = await Request.findOne({ _id: rating.requestId }).select('requestNumber');

    questionStats.push({
      driver: `${user.firstName} ${user.lastName} ${user.phoneNumber}`,
      requestId: request.requestNumber,
      answer: doneStatus,
    });
  }

  // const totalPages = Math.ceil(totalCount / limit);

  return questionStats;
  // return {
  //   results: questionStats,
  //   page,
  //   limit,
  //   totalPages: totalPages,
  //   totalResults: totalCount
  // };
};

const getInvoiceByLanguage = async (req, filter, options) => {
  const { langId } = req.params;
  filter.clientId = new ObjectId(req.headers.clientid);
  filter.language = new ObjectId(langId);
  filter.zoneId = new ObjectId(req.headers.zoneid);

  const questions = await InvoiceQuestion.paginate(filter, options);
  options.sortBy = options.sortBy || 'createdAt:desc';

  return questions;
};

module.exports = {
  createInvoiceQuestion,
  queryInvoiceQuestion,
  getInvoiceQuestionById,
  getInvoiceQuestions,
  updateInvoiceQuestionById,
  deleteInvoiceQuestionById,
  getUserInvoiceQuestions,
  getDriverInvoiceQuestions,
  getQuestionReport,

  getInvoiceByLanguage,
  questionReportDetails,
};
