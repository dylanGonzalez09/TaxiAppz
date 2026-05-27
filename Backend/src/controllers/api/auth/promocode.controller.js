const httpStatus = require('http-status').default || require('http-status').status || require('http-status');
const pick = require('../../../utils/pick');
const ApiError = require('../../../utils/ApiError');
const catchAsync = require('../../../utils/catchAsync');
const { apipromoCodeService, userService } = require('../../../services');
const Response = require('../../../config/response');
const { tokenService } = require('../../../services');

const { getUserId, getClientId, getDriverId } = require('../../../utils/commonFunction');

const getPromocodeWithOutPagination = catchAsync(async (req, res) => {
  const userId = await getUserId(req);

  if (!userId) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'User not authenticated');
  }

  const user = await userService.getUserById(userId);
  if (!user || !user.zoneId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'User zone not found');
  }

  const promocode = await apipromoCodeService.getPromode({ req, zoneId: user.zoneId, userId });

  if (!promocode) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Promocode not found');
  }

  const response = Response(true, promocode, 'Success');
  res.status(httpStatus.OK).send(response);
});

const getPromocodeApply = catchAsync(async (req, res) => {
  const promocode = await apipromoCodeService.promoApply(req);
  if (!promocode) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Promocode not found');
  }
  const response = Response(true, promocode, 'Success');
  res.status(httpStatus.OK).send(response);
});

module.exports = {
  getPromocodeWithOutPagination,
  getPromocodeApply,
};
