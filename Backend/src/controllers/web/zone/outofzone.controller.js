const httpStatus = require('http-status').default || require('http-status').status || require('http-status');
const catchAsync = require('../../../utils/catchAsync');
const pick = require('../../../utils/pick');
const { outOfZoneService } = require('../../../services');
const Response = require('../../../config/response');

// Create a vehicle model with an image
const createOutOfZone = catchAsync(async (req, res) => {
  let clientId;

  if (!req.headers.clientid) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ClientID not found');
  } else {
    clientId = req.headers.clientid;
    req.body.clientId = clientId;
  }

  const outOfZone = await outOfZoneService.createOutOfZone(req.body);

  const response = Response(true, outOfZone, 'Success');
  res.status(httpStatus.CREATED).send(response);
});
const getOutOfZones = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['kilometer']);

  const options = {
    ...pick(req.query, ['sortBy', 'limit', 'page']),
    allowDiskUse: true,
  };

  // Parse and sanitize options
  options.limit = parseInt(options.limit) || 10;
  options.page = parseInt(options.page) || 1;
  options.sortBy = options.sortBy || 'kilometer:asc';

  // Search logic (numeric search on kilometer)
  if (req.query.search) {
    const searchNumber = parseFloat(req.query.search);
    if (!isNaN(searchNumber)) {
      filter.kilometer = searchNumber;
    }
  }

  const outOfZone = await outOfZoneService.queryOutOfZone(filter, options);

  res.set('Cache-Control', 'no-store');
  const response = Response(true, outOfZone, 'Success');
  res.status(httpStatus.OK).send(response);
});

// Get all vehicle models without pagination
const getOutOfZoneWithoutPagination = catchAsync(async (req, res) => {
  const outOfZone = await outOfZoneService.getOutOfZones();
  if (!outOfZone) {
    throw new ApiError(httpStatus.NOT_FOUND, 'outOfZone not found');
  }
  const response = Response(true, outOfZone, 'Success');
  res.status(httpStatus.OK).send(response);
});

// Update a vehicle model
const UpdateOutOfZone = catchAsync(async (req, res) => {
  const outOfZone = await outOfZoneService.updateOutOfZoneById(req.params.outOfZoneId, req.body);

  const response = Response(true, outOfZone, 'Success');
  res.status(httpStatus.OK).send(response);
});

// Delete a vehicle model
const deleteOutOfZone = catchAsync(async (req, res) => {
  const outOfZone = await outOfZoneService.deleteOutOfZoneById(req.params.outOfZoneId);
  const response = Response(true, outOfZone, 'Success');
  res.status(httpStatus.OK).send(response);
});

// Update a vehicle model's status
const UpdateOutOfZoneStatus = catchAsync(async (req, res) => {
  const { outOfZoneId } = req.params;
  const { status } = req.body;

  const outOfZone = await outOfZoneService.updateOutOfZoneById(outOfZoneId, { status });

  if (!outOfZone) {
    throw new ApiError(httpStatus.NOT_FOUND, 'outOfZone not found');
  }

  const response = Response(true, outOfZone, 'outOfZone status updated successfully');
  res.status(httpStatus.OK).send(response);
});

module.exports = {
  createOutOfZone,
  getOutOfZones,
  getOutOfZoneWithoutPagination,
  UpdateOutOfZone,
  deleteOutOfZone,
  UpdateOutOfZoneStatus,
};
