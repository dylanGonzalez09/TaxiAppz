const httpStatus = require('http-status');
const ApiError = require('../../../utils/ApiError');
const catchAsync = require('../../../utils/catchAsync');
const { rentalService } = require('../../../services');
const Response = require('../../../config/response');

/**
 * Get all rental packages for web booking.
 * POST /v1/web/rental/allPackages
 * Body: optional { pick_lat, pick_lng } for zone resolution.
 * Same response shape as /v1/api/rental/allPackages.
 */
const allPackages = catchAsync(async (req, res) => {
  const data = await rentalService.getPackagesWeb(req);
  const response = Response(true, data, 'Success');
  res.status(httpStatus.OK).send(response);
});

module.exports = {
  allPackages,
};
