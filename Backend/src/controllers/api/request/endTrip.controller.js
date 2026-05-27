const httpStatus = require('http-status').default || require('http-status').status || require('http-status');
const pick = require('../../../utils/pick');
const ApiError = require('../../../utils/ApiError');
const catchAsync = require('../../../utils/catchAsync');
const { endTrip } = require('../../../services');
const Response = require('../../../config/response');

const completeTrip = catchAsync(async (req, res) => {
  const request = await endTrip.completeTrips(req);

  if (!request) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Request not found');
  }

  const response = Response(true, request, 'Success');
  res.status(httpStatus.OK).send(response);
});

module.exports = {
  completeTrip,
};
