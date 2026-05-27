const httpStatus = require('http-status').default || require('http-status').status || require('http-status');
const ApiError = require('../../../utils/ApiError');
const { PromoCode, Zone, Request } = require('../../../models');
const { ObjectId } = require('mongoose').Types;
const { HttpStatusCode } = require('axios');
const pick = require('../../../utils/pick');

const { getClientId } = require('../../../utils/commonFunction');

/**
 * Create a promo code
 * @param {Object} promoCodeBody
 * @returns {Promise<PromoCode>}
 */
const createPromoCode = async (promoCodeBody) => {
  const { fromDate, toDate, promoCode } = promoCodeBody;
  
  const existingPromoCode = await PromoCode.findOne({
    $or: [
      {
        fromDate: { $lt: toDate },
        toDate: { $gt: fromDate },
        promoCode: { $eq: promoCode }
      },
      {
        fromDate: { $lt: fromDate },
        toDate: { $gt: toDate },
        promoCode: { $eq: promoCode }
      }
    ]
  });

  if (existingPromoCode) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'A promo code with the same code already exists for the given time period');
  }
  return PromoCode.create(promoCodeBody);
};

/**
 * Query for promo codes
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryPromoCodes = async (filter, options) => {
  options.sortBy = options.sortBy || 'createdAt:desc';

  const promoCodes = await PromoCode.paginate(filter, options);

  return promoCodes;
};

/**
 * Get promo codes
 * @returns {Promise<PromoCode[]>}
 */
const getPromoCodes = async () => {
  return PromoCode.find();
};

/**
 * Get promo code by id
 * @param {ObjectId} id
 * @returns {Promise<PromoCode>}
 */
const getPromoCodeById = async (id) => {
  return PromoCode.findById(id);
};


const updatePromoCodeById = async (promoCodeId, updateBody) => {
  const promoCode = await getPromoCodeById(promoCodeId);

  if (!promoCode) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Promo code not found');
  }

  // ADD VALIDATION
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiryDate = new Date(promoCode.toDate);
  expiryDate.setHours(0, 0, 0, 0);

  //  Prevent activating expired or exhausted promo
  if (
    updateBody.status === true &&
    (expiryDate < today || promoCode.totalCount <= 0)
  ) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Expired or fully used promo cannot be activated'
    );
  }

  Object.assign(promoCode, updateBody);
  await promoCode.save();

  return promoCode;
};

/**
 * Delete promo code by id
 * @param {ObjectId} promoCodeId
 * @returns {Object}
 */
const deletePromoCodeById = async (promoCodeId) => {
  const promoCode = await getPromoCodeById(promoCodeId);
  if (!promoCode) {
    return { status: httpStatus.NOT_FOUND, msg: 'Promo code not found' };
  }

  // chk whether promo exists in request
  const request = await Request.countDocuments({ promoId: new ObjectId(promoCode._id) });
  if (request > 0) {
    return { status: httpStatus.FORBIDDEN, msg: 'This promo used in trip.so you cannot delete it.' };
  }

  await promoCode.deleteOne();
  return { status: HttpStatusCode.Ok, msg: 'Promo code deleted successfully' };
};
/**
 * Get roles
 * @param {ObjectId} clientId
 * @returns {Promise<Role>}
 */
const getDropDowns = async (clientId) => {
  const zoneData = await Zone.find({ status: true, clientId });

  const data = {
    zone: zoneData,
  };
  return data;
};

/**
 * Get roles
 * @param {ObjectId} clientId
 * @returns {Promise<Role>}
 */
const getPromoCodeDropDowns = async (clientId, zoneId) => {
  const promoData = await PromoCode.find({ clientId: new ObjectId(clientId), zoneId: new ObjectId(zoneId), status: true });

  const data = {
    promo: promoData,
  };
  return data;
};

const getPromoUseReport = async (zoneId) => {
  try {
    const validZoneId = new ObjectId(zoneId);

    const result = await PromoCode.aggregate([
      {
        $match: {
          zoneId: validZoneId,
        },
      },
      {
        $lookup: {
          from: 'requests',
          localField: '_id',
          foreignField: 'promoId',
          as: 'requestDetails',
        },
      },
      {
        $addFields: {
          usageCount: {
            $size: {
              $filter: {
                input: '$requestDetails',
                as: 'req',
                cond: { $eq: ['$$req.zoneId', validZoneId] },
              },
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          promoCode: 1,
          zoneId: 1,
          fromDate: 1,
          toDate: 1,
          limit: '$totalCount',
          usageCount: 1,
        },
      },
      {
        $sort: { usageCount: -1 },
      },
    ]);

    return result;
  } catch (error) {
    console.error('Error fetching promo usage count:', error);
    throw new Error('Failed to fetch promo usage count');
  }
};

const getSuperAdminExpiredPromo = async (req) => {
  try {
    const options = pick(req.query, ['sortBy', 'limit', 'page']);

    const limit = parseInt(options.limit, 10) || 10;
    const page = parseInt(options.page, 10) || 1;
    const now = new Date();

    const matchStage = {
      toDate: { $lt: now },
    };

    const pipeline = [
      { $match: matchStage },
      {
        $project: {
          _id: 1,
          promoCode: 1,
          promoCodeType: 1,
          description: 1,
          targetAmount: 1,
          promoType: 1,
          amount: 1,
          percentage: 1,
          fromDate: 1,
          toDate: 1,
          status: 1,
          totalCount: 1,
          promoReuseCount: 1,
          zoneId: 1,
          banner: 1,
          createdBy: 1,
        },
      },
    ];

    // Get total count
    const allResults = await PromoCode.aggregate([...pipeline]);
    const totalResults = allResults.length;
    const totalPages = Math.ceil(totalResults / limit);

    // Apply pagination
    const paginatedPipeline = [
      ...pipeline,
      { $sort: options.sortBy || { toDate: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
    ];

    const results = await PromoCode.aggregate(paginatedPipeline);

    return {
      results,
      page,
      limit,
      totalPages,
      totalResults,
    };
  } catch (error) {
    console.error('Error fetching expired promos (super admin):', error);
    throw error;
  }
};

const getExpiredPromo = async (req) => {
  try {
    const options = pick(req.query, ['limit', 'page', 'sortBy']);
    const clientId = await getClientId(req);

    const limit = parseInt(options.limit, 10) || 10;
    const page = parseInt(options.page, 10) || 1;
    const now = new Date();

    const matchStage = {
      clientId: new ObjectId(clientId),
      toDate: { $lt: now },
    };

    const pipeline = [
      { $match: matchStage },
      {
        $project: {
          _id: 1,
          promoCode: 1,
          promoCodeType: 1,
          description: 1,
          targetAmount: 1,
          promoType: 1,
          amount: 1,
          percentage: 1,
          fromDate: 1,
          toDate: 1,
          status: 1,
          totalCount: 1,
          promoReuseCount: 1,
          zoneId: 1,
          banner: 1,
          createdBy: 1,
        },
      },
    ];

    // Get total count
    const allResults = await PromoCode.aggregate([...pipeline]);
    const totalResults = allResults.length;
    const totalPages = Math.ceil(totalResults / limit);

    // Apply sort, skip, limit for pagination
    const paginatedPipeline = [
      ...pipeline,
      { $sort: options.sortBy || { toDate: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
    ];

    const results = await PromoCode.aggregate(paginatedPipeline);

    return {
      results,
      page,
      limit,
      totalPages,
      totalResults,
    };
  } catch (error) {
    console.error('Error in getExpiredPromo:', error);
    throw error;
  }
};
module.exports = {
  createPromoCode,
  queryPromoCodes,
  getPromoCodeById,
  getPromoCodes,
  updatePromoCodeById,
  deletePromoCodeById,
  getDropDowns,
  getPromoCodeDropDowns,
  getPromoUseReport,
  getSuperAdminExpiredPromo,
  getExpiredPromo,
};
