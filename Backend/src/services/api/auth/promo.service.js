const httpStatus = require('http-status');
const ApiError = require('../../../utils/ApiError');
const { PromoCode, Request } = require('../../../models');
const ObjectId = require('mongoose').Types.ObjectId;

/**
 * Extract Client ID from the request headers.
 */
const getClientId = async (req) => {
    if (!req.headers.clientid) {
        throw new ApiError(httpStatus.NOT_FOUND, 'ClientID not found');
    }
    return req.headers.clientid;
};

/**
 * Fetch Promo codes for the given Client ID
 * - Check for individual promos.
 * - Check for festival promos within the valid date range.
 * - Include newUser promos if the user has `is_completed <= 3`.
 */
const getPromode = async (req) => {
    const clientId = await getClientId(req);
    const currentDate = new Date();

    // Check for `newUser` eligibility based on Request history
    const requestCount = await Request.countDocuments({
        clientId: new ObjectId(clientId),
        is_completed: { $lte: 3 }
    });

    const promoCodes = await PromoCode.find({
        status: true,
        $or: [
            {
                clientId: new ObjectId(clientId),
                promoCodeType: 'individual'
            },
            {
                promoCodeType: 'festival',
                fromDate: { $lte: currentDate },
                toDate: { $gte: currentDate }
            },
            {
                promoCodeType: 'newUser',
                ...(requestCount > 0 && { clientId: new ObjectId(clientId) })
            }
        ]
    });

    return promoCodes;
};


const promoApply = async (req) => {
    try {
        const clientId = await getClientId(req);

        const currentDate = new Date();

        const promoCode = req.body.promo_code;
        const promoCheck = await PromoCode.findOne({ status: true, promo_code: promoCode });

        if (!promoCheck) throw new ApiError(httpStatus.FORBIDDEN, 'Provided promocode invalid or expired');

        // **Festival PromoCode Check**
        if (promoCheck.promoCodeType === 'festival' &&
            (promoCheck.fromDate > currentDate || promoCheck.toDate < currentDate)) {
            throw new ApiError(httpStatus.FORBIDDEN, 'Provided promocode invalid or expired');
        }

        // **Individual PromoCode Check**
        if (promoCheck.promoCodeType === 'individual' &&
            (!promoCheck.client_id || !promoCheck.ClientList.includes(clientId.toString()))) {
            throw new ApiError(httpStatus.FORBIDDEN, 'Provided promocode invalid or expired');
        }

        // **NewUser PromoCode Check**
        const useRequestCount = await Request.countDocuments({
            client_id: clientId,
            promo_id: promoCheck.id,
            is_completed: true
        });

        if (promoCheck.promoCodeType === 'newUser' && useRequestCount >= promoCheck.new_user_count) {
            throw new ApiError(httpStatus.FORBIDDEN, 'Your Limited Exit');
        }

        if (useRequestCount >= promoCheck.promo_user_reuse_count && promoCheck.promoCodeType !== 'newUser') {
            throw new ApiError(httpStatus.FORBIDDEN, 'Your Limited Exit');
        }

        const useRequestTotalCount = await Request.countDocuments({
            promo_id: promoCheck.id,
            is_completed: true
        });

        if (useRequestTotalCount >= promoCheck.promo_use_count && promoCheck.promoCodeType !== 'newUser') {
            throw new ApiError(httpStatus.FORBIDDEN, 'This Promocode Limited Exit');
        }

        const responseData = {
            client: {
                promocode_apply: "Promo Applied Successfully",
                currency: countryDetails.currency_symbol,
                amount: promoCheck.amount,
                promo_type: promoCheck.promo_type,
                percentage: parseInt(promoCheck.percentage, 10)
            }
        };

        return responseData;

    } catch (error) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
    }
};



module.exports = {
    getPromode,
    promoApply
};
