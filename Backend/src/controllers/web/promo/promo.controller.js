const httpStatus = require('http-status');
const catchAsync = require('../../../utils/catchAsync');
const Response = require('../../../config/response');
const { PromoCode } = require('../../../models');

/**
 * Get list of active promo codes for web booking
 * No clientId required - returns all active promo codes
 */
const getPromoCodesList = catchAsync(async (req, res) => {
  const currentDate = new Date();

  // Get all active promo codes that are currently valid
  const promoCodes = await PromoCode.find({
    status: true,
    $or: [
      // Individual promo codes (no date restriction or valid dates)
      {
        promoCodeType: 'individual',
        $and: [
          {
            $or: [
              { fromDate: { $exists: false } },
              { fromDate: null },
              { fromDate: { $lte: currentDate } },
            ],
          },
          {
            $or: [
              { toDate: { $exists: false } },
              { toDate: null },
              { toDate: { $gte: currentDate } },
            ],
          },
        ],
      },
      // Festival promo codes within valid date range
      {
        promoCodeType: 'festival',
        fromDate: { $lte: currentDate },
        toDate: { $gte: currentDate },
      },
      // New user promo codes
      {
        promoCodeType: 'newUser',
        $and: [
          {
            $or: [
              { fromDate: { $exists: false } },
              { fromDate: null },
              { fromDate: { $lte: currentDate } },
            ],
          },
          {
            $or: [
              { toDate: { $exists: false } },
              { toDate: null },
              { toDate: { $gte: currentDate } },
            ],
          },
        ],
      },
    ],
  })
  .select('_id promoCode promoCodeType description promoType amount percentage targetAmount fromDate toDate status')
  .lean();

  // Filter out expired promo codes
  const validPromoCodes = promoCodes.filter((promo) => {
    if (promo.toDate) {
      const expiry = new Date(promo.toDate);
      return expiry >= currentDate;
    }
    return true;
  });

  const response = Response(true, validPromoCodes, 'Promo codes retrieved successfully');
  res.status(httpStatus.OK).send(response);
});

module.exports = {
  getPromoCodesList,
};

