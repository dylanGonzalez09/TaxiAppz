const httpStatus = require('http-status');
const pick = require('../../../utils/pick');
const ApiError = require('../../../utils/ApiError');
const catchAsync = require('../../../utils/catchAsync');
const { mobilReferralService,tokenService } = require('../../../services');
const Response = require('../../../config/response');

const getReferralDriver = catchAsync(async (req, res) => {
  const referral = await mobilReferralService.getReferralDriver(req);
  if (!referral) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Referral not found');
  }
  const response = Response(true, referral, "Success");
  res.status(httpStatus.OK).send(response);
});

const getReferralDriverCode = catchAsync(async (req, res) => {
  const referral = await mobilReferralService.getReferralDriverCode(req);
  if (!referral) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ReferralCode not found');
  }
  const response = Response(true, referral, "Success");
  res.status(httpStatus.OK).send(response);
});
const createReferral = catchAsync(async (req, res) => {
  const referral = await mobilReferralService.createReferral(req);
  const response = Response(true, referral, "Success");
  res.status(httpStatus.CREATED).send(response);
});

const updateReferral = catchAsync(async (req, res) => {
  const referral = await mobilReferralService.updateReferralById(req.params.referralId, req.body);
  const response = Response(true, referral, "Success");
  res.status(httpStatus.OK).send(response);
});
const getUserId = async (req) => {

  let userId = '';

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(httpStatus.UNAUTHORIZED).send({ message: 'Authorization header is missing or invalid' });
    return;
  }
  // Remove the 'Bearer ' prefix and get the token
  const token = authHeader.substring(7);

  const user = await tokenService.verifyTokenAndGetUser(token);

  userId = user.id

  return userId;
}
const getReferralData = catchAsync(async (req, res) => {
  try {
    const userId = req.params.userId;

    const data = await mobilReferralService.getReferralData(userId);

    return res.status(httpStatus.OK).json({
      success: true,
      message: 'Referral data retrieved successfully',
      data,
    });
  } catch (error) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Error retrieving referral data',
    });
  }
});
const getStatsData = catchAsync(async (req, res) => {
  try {
    const userId = req.params.userId;

    const data = await mobilReferralService.getStatsData(userId);

    return res.status(httpStatus.OK).json({
      success: true,
      message: 'Referral data retrieved successfully',
      data,
    });
  } catch (error) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Error retrieving referral data',
    });
  }
});

const createReferralToWallet = catchAsync(async (req, res) => {
  const referral = await mobilReferralService.createReferralToWallet(req);
  const response = Response(true, referral, "Success");
  res.status(httpStatus.CREATED).send(response);
});

module.exports = {
  getReferralDriver,
  getReferralDriverCode,
  createReferral,
  updateReferral,
  getReferralData,
  getStatsData,
  createReferralToWallet
};
