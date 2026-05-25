const httpStatus = require('http-status');
const pick = require('../../../utils/pick');
const ApiError = require('../../../utils/ApiError');
const catchAsync = require('../../../utils/catchAsync');
const { mobilReferralService } = require('../../../services');
const Response = require('../../../config/response');

const createReferralAmount = catchAsync(async (req, res) => {
  const referral = await mobilReferralService.createReferralAmount(req);
  const response = Response(true, referral, "Success");
  res.status(httpStatus.CREATED).send(response);
});

const updateReferralAmount = catchAsync(async (req, res) => {
    const referral = await mobilReferralService.updateReferralById(req.params.referralAmountId, req.body);
    const response = Response(true, referral, "Success");
    res.status(httpStatus.OK).send(response);
  });
module.exports = {
 
  createReferralAmount,
  updateReferralAmount
};
