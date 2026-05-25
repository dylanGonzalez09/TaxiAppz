const httpStatus = require('http-status');
const ApiError = require('../../../utils/ApiError');
const { CancellationReason } = require('../../../models');
const { log } = require('winston');
const ObjectId = require('mongoose').Types.ObjectId;

const getClientId = async (req) => {
  clientId = '';
  if (!req.headers.clientid) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ClientID not found');
  } else {
    clientId = req.headers.clientid;
  }
  return clientId;
}


const getCompanyId = async (req) => {
  companyId = '';
  if (!req.headers.companyid) {
    companyId = null;
  } else {
    companyId = req.headers.companyid;
  }
  return companyId;
}

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

const queryCancellation = async (req,filter, options) => {
  const clientId = await getClientId(req);
  const companyId = await getCompanyId(req);

  if (companyId) {
    filter.companyId = companyId;
  }

  filter.clientId = clientId;

  const limit = parseInt(options.limit, 10) || 10;
  const page = parseInt(options.page, 10) || 1;
  options.sortBy = options.sortBy || 'createdAt:desc';
  const totalResults = await CancellationReason.countDocuments(filter);

  const result = await CancellationReason.aggregate([
    // { $match: filter },

    {
      $lookup: {
        from: 'zones',
        localField: 'zoneId',
        foreignField: '_id',
        as: 'zoneDetails',
      },
    },

    {
      $unwind: {
        path: '$zoneDetails',
        preserveNullAndEmptyArrays: true,
      },
    },

    {
      $project: {
        _id: 0,
        id: '$_id',
        amount: 1,
        clientId: 1,
        companyId: 1,
        payStatus: 1,
        reason : 1,
        status: 1,
        tripStatus: 1,
        zoneId: 1,
        userType: 1,
        createdAt: 1,
        zoneName: '$zoneDetails.zoneName',
      },
    },
    {
      $sort: { createdAt: -1 }, // Sorting in descending order (latest first)
    },
    {
      $skip: (page - 1) * limit, // Pagination: Skip previous pages
    },
    {
      $limit: limit, // Limit number of results per page
    },
  ]);

  const totalPages = Math.ceil(totalResults / limit);
  return {
    results: result,
    page,
    limit,
    totalPages,
    totalResults,
  };
};

/**
 * Get roles
 * @returns {Promise<CancellationReason>}
 */
const getUserCancellations = async () => {
  return CancellationReason.find({userType:"User",status:true});
};


/**
 * Get roles
 * @returns {Promise<CancellationReason>}
 */
const getDriverCancellations = async () => {
  return CancellationReason.find({userType:"Driver",status:true});
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
const getCancellationByLanguage = async (req,filter, options) => {
  const langId = req.params.langId;
  filter.clientId = new ObjectId(req.headers.clientid);
  filter.language = new ObjectId(langId);

  const cancellation = await CancellationReason.paginate(filter, options);
  options.sortBy = options.sortBy || 'createdAt:desc';

  return cancellation;

};

module.exports = {
  createCancellation,
  queryCancellation,
  getCancellationsById,
  getUserCancellations,
  getDriverCancellations,
  updateCancellationById,
  deleteCancellationById,
  getCancellationByLanguage
};
