const httpStatus = require('http-status');
const ApiError = require('../../../utils/ApiError');
const { PromoCode, Zone,Request} = require('../../../models');
const ObjectId = require('mongoose').Types.ObjectId;
const { HttpStatusCode } = require('axios');
const pick = require('../../../utils/pick');

const getClientId = async (req) => {
  clientId = '';
  if (!req.headers.clientid) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ClientID not found');
  } else {
    clientId = req.headers.clientid;
  }
  return clientId;
}

/**
 * Create a promo code
 * @param {Object} promoCodeBody
 * @returns {Promise<PromoCode>}
 */
const createPromoCode = async (promoCodeBody) => {

  const { fromDate, toDate, promoCode } = promoCodeBody;

  // Check if there's an existing promo code that overlaps with the new one
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
        throw new ApiError(httpStatus.NOT_FOUND, 'A promo code already exists for the given time period');

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

/**
 * Update promo code by id
 * @param {ObjectId} promoCodeId
 * @param {Object} updateBody
 * @returns {Promise<PromoCode>}
 */
const updatePromoCodeById = async (promoCodeId, updateBody) => {
  const promoCode = await getPromoCodeById(promoCodeId);
  if (!promoCode) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Promo code not found');
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
    return { status: httpStatus.NOT_FOUND, msg: "Promo code not found" };
  }

  //chk whether promo exists in request
  const request = await Request.countDocuments({promoId: new ObjectId(promoCode._id)});
  if(request > 0)
  {
    return { status: httpStatus.FORBIDDEN, msg: "This promo used in trip.so you cannot delete it." };
  }

  await promoCode.deleteOne();
  return { status: HttpStatusCode.Ok, msg: "Promo code deleted successfully" };
};
/**
 * Get roles
  * @param {ObjectId} clientId
 * @returns {Promise<Role>}
 */
const getDropDowns = async (clientId) => {

  const zoneData = await Zone.find({status: true, clientId: clientId});

  const data = {
    zone: zoneData,
   
  }
  return data;
};

/**
 * Get roles
  * @param {ObjectId} clientId
 * @returns {Promise<Role>}
 */
const getPromoCodeDropDowns = async () => {

  const promoData = await PromoCode.find({status: true});

  const data = {
    promo: promoData,
   
  }
  return data;
};

const getPromoUseReport = async () => {
  try {
    const result = await PromoCode.aggregate([
      {
        
        $lookup: {
          from: 'requests',  
          localField: '_id', 
          foreignField: 'promoId',  
          as: 'requestDetails',
        },
      },
      {
        $unwind: {
          path: '$requestDetails',
          preserveNullAndEmptyArrays: false, 
                },
      },
      {
        
        $group: {
          _id: '$_id', 
          promoCode: { $first: '$promoCode' },
          usageCount: { $sum: 1 }, 
          totalCount: { $first: '$totalCount' }, 
          fromDate: { $first: '$fromDate' },
          toDate: { $first: '$toDate' }, 
        },
      },
      {
        $project: {
          _id: 0, 
          promoCode: 1, 
          limit:'$totalCount',
          fromDate:1,
          toDate:1,
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
  getExpiredPromo,
  getSuperAdminExpiredPromo
};
