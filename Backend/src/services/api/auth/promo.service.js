const httpStatus = require('http-status').default || require('http-status').status || require('http-status');
const ApiError = require('../../../utils/ApiError');
const { PromoCode, Request, tokenService } = require('../../../models');
const { ObjectId } = require('mongoose').Types;
const { getClientId } = require('../../../utils/commonFunction');

/**
 * Fetch Promo codes for the given Client ID
 * - Check for individual promos.
 * - Check for festival promos within the valid date range.
 * - Include newUser promos if the user has `is_completed <= 3`.
 */

const   getPromode = async ({ req, zoneId, userId }) => {
  const clientId = await getClientId(req);

  const vehicleType = req.query.vehicleType || req.query.vehicle_type || null;
  
  if (!clientId) return [];

  const now = new Date();

  const promoUsageFilter = {
    isCancelled: { $ne: true },
  };

  // Check new / old user
  const userRequestCount = await Request.countDocuments({
    userId: new ObjectId(userId),
    ...promoUsageFilter,
  });

  // Base promo query
  const promoQuery = {
    clientId: new ObjectId(clientId),
    status: true,
  };

  if (zoneId) {
    promoQuery.zoneId = new ObjectId(zoneId);
  }

  const allPromos = await PromoCode.find(promoQuery);
  const validPromos = [];

  for (const promo of allPromos) {
    const { promoCodeType, fromDate, toDate, userId: allowedUsers } = promo;
    const promoReuseLimit = Number(promo.promoReuseCount || 0);
    const totalLimit = Number(promo.totalCount || 0);

    // newUser promo – block old users
    if (promoCodeType === 'newUser' && userRequestCount > 0) {
      continue;
    }

    // Vehicle type check (if applicable)
    if ( vehicleType && promoCodeType !== 'newUser' && promo?.vehicleType?.length > 0 && !promo?.vehicleType.some(v => v.toString() === vehicleType.toString()) ) {
     continue;
    }

    // Expiry check (ALL promo types)
    if (fromDate && toDate) {
      const start = new Date(fromDate);
      const end = new Date(toDate);
      if (now < start || now > end) continue;
    }

    // Invalid date config
    if ((fromDate && !toDate) || (!fromDate && toDate)) {
      continue;
    }

    // Allowed users only
    if (Array.isArray(allowedUsers) && allowedUsers.length > 0 && !allowedUsers.some((id) => id.equals(userId))) {
      continue;
    }

    // Total usage count across all users.
    const totalUsageCount = await Request.countDocuments({
      promoId: promo._id,
      ...promoUsageFilter,
    });

    // totalCount limit is based on entire promo usage count.
    if (totalLimit > 0 && totalUsageCount >= totalLimit) {
      continue;
    }

    // Per-user usage count
    const userUsageCount = await Request.countDocuments({
      promoId: promo._id,
      userId: new ObjectId(userId),
      ...promoUsageFilter,
    });

    // Per-user reuse limit
    if (promoReuseLimit > 0 && userUsageCount >= promoReuseLimit) {
      continue;
    }

    //  Promo is valid
    validPromos.push(promo);
  }

  return validPromos;
};

const promoApply = async (req) => {
  try {
    const clientId = await getClientId(req);

    const currentDate = new Date();

    const promoCode = req.body.promo_code;
    const promoCheck = await PromoCode.findOne({ status: true, promo_code: promoCode });

    if (!promoCheck) throw new ApiError(httpStatus.FORBIDDEN, 'Provided promocode invalid or expired');

    // **Festival PromoCode Check**
    if (promoCheck.promoCodeType === 'festival' && (promoCheck.fromDate > currentDate || promoCheck.toDate < currentDate)) {
      throw new ApiError(httpStatus.FORBIDDEN, 'Provided promocode invalid or expired');
    }

    // **Individual PromoCode Check**
    if (
      promoCheck.promoCodeType === 'individual' &&
      (!promoCheck.client_id || !promoCheck.ClientList.includes(clientId.toString()))
    ) {
      throw new ApiError(httpStatus.FORBIDDEN, 'Provided promocode invalid or expired');
    }

    // **NewUser PromoCode Check**
    const useRequestCount = await Request.countDocuments({
      client_id: clientId,
      promo_id: promoCheck.id,
      is_completed: true,
    });

    if (promoCheck.promoCodeType === 'newUser' && useRequestCount >= promoCheck.new_user_count) {
      throw new ApiError(httpStatus.FORBIDDEN, 'Your Limited Exit');
    }

    if (useRequestCount >= promoCheck.promo_user_reuse_count && promoCheck.promoCodeType !== 'newUser') {
      throw new ApiError(httpStatus.FORBIDDEN, 'Your Limited Exit');
    }

    const useRequestTotalCount = await Request.countDocuments({
      promo_id: promoCheck.id,
      is_completed: true,
    });

    if (useRequestTotalCount >= promoCheck.promo_use_count && promoCheck.promoCodeType !== 'newUser') {
      throw new ApiError(httpStatus.FORBIDDEN, 'This Promocode Limited Exit');
    }

    const responseData = {
      client: {
        promocode_apply: 'Promo Applied Successfully',
        currency: countryDetails.currency_symbol,
        amount: promoCheck.amount,
        promo_type: promoCheck.promo_type,
        percentage: parseInt(promoCheck.percentage, 10),
      },
    };

    return responseData;
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
  }
};

module.exports = {
  getPromode,
  promoApply,
};
