const httpStatus = require('http-status').default || require('http-status').status || require('http-status');
const pick = require('../../../utils/pick');
const ApiError = require('../../../utils/ApiError');
const catchAsync = require('../../../utils/catchAsync');
const { mobileratingService, tokenService } = require('../../../services');
const Response = require('../../../config/response');

const createRating = catchAsync(async (req, res) => {
  const rating = await mobileratingService.createRating(req);
  const response = Response(true, rating, 'Success');
  res.status(httpStatus.CREATED).send(response);
});

const getRating = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await mobileratingService.querygRatings(filter, options, req);
  const response = Response(true, result, 'Success');
  res.status(httpStatus.OK).send(response);
});

const getRatings = catchAsync(async (req, res) => {
  const rating = await mobileratingService.getRatingById(req.params.ratingId);
  if (!rating) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Request Rating not found');
  }
  const response = Response(true, rating, 'Success');
  res.status(httpStatus.OK).send(response);
});

const getRatingWithOutPagination = catchAsync(async (req, res) => {
  const sos = await mobileratingService.getRatings(req);
  if (!sos) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Sos not found');
  }
  const response = Response(true, sos, 'Success');
  res.status(httpStatus.OK).send(response);
});

const updateRating = catchAsync(async (req, res) => {
  const rating = await mobileratingService.updateRatingById(req.params.ratingId, req.body);
  const response = Response(true, rating, 'Success');
  res.status(httpStatus.OK).send(response);
});

const deleteRating = catchAsync(async (req, res) => {
  const rating = await mobileratingService.deleteRatingById(req.params.ratingId);
  const response = Response(true, rating, 'Success');
  res.status(httpStatus.OK).send(response);
});

const getUserRatings = async (req, res) => {
  try {
    // const userId = await getUserId(req); // Get user ID from token
    const { userId } = req.params;
    const ratings = await mobileratingService.getUserRatings(userId); // Call the service function

    res.status(httpStatus.OK).json({ success: true, data: ratings });
  } catch (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: error.message });
  }
};

module.exports = {
  createRating,
  getRating,
  getRatings,
  getRatingWithOutPagination,
  updateRating,
  deleteRating,
  getUserRatings,
};
