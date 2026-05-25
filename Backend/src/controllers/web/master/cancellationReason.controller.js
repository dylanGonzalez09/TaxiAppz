const httpStatus = require('http-status');
const catchAsync = require('../../../utils/catchAsync');
const pick = require('../../../utils/pick');
const { cancellationReasonService } = require('../../../services');
const Response = require('../../../config/response');

// Create a vehicle model with an image
const createCancellation = catchAsync(async (req, res) => {
    
    let clientId;

    if (!req.headers.clientid) {
      throw new ApiError(httpStatus.NOT_FOUND, 'ClientID not found');
    }else{
      clientId = req.headers.clientid;
      req.body.clientId = clientId;
    }

    const cancellation = await cancellationReasonService.createCancellation(req.body);

    const response = Response(true, cancellation, "Success");
    res.status(httpStatus.CREATED).send(response);

});

// Get all vehicle models with pagination
const getCancellations = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['reason','userType','tripStatus','payStatus']);
  const options = pick(req.query, ['sortBy', 'limit', 'page'],{ allowDiskUse: true });
  if (req.query.search) {
    filter.$or = [
      { reason: { $regex: req.query.search, $options: 'i' } },
      { reason: { $regex: req.query.search, $options: 'i' } },
      { tripStatus: { $regex: req.query.search, $options: 'i' } },
      { payStatus: { $regex: req.query.search, $options: 'i' } },

    ];
  } 
    const result = await cancellationReasonService.queryCancellation(req,filter, options);
    const response = Response(true, result, "Success");
    res.status(httpStatus.OK).send(response);});




// Get all vehicle models without pagination
const getCancellationWithoutPagination = catchAsync(async (req, res) => {
    const cancellation = await cancellationReasonService.getDriverCancellations();
    if (!cancellation) {
      throw new ApiError(httpStatus.NOT_FOUND, 'cancellation not found');
    }
    const response = Response(true, cancellation, "Success");
    res.status(httpStatus.OK).send(response);});

    // Get all vehicle models without pagination
const getUserCancellationWithoutPagination = catchAsync(async (req, res) => {
  const cancellation = await cancellationReasonService.getUserCancellations();
  if (!cancellation) {
    throw new ApiError(httpStatus.NOT_FOUND, 'cancellation not found');
  }
  const response = Response(true, cancellation, "Success");
  res.status(httpStatus.OK).send(response);});

// Update a vehicle model
const UpdateCancellation = catchAsync(async (req, res) => {
    
    const cancellation = await cancellationReasonService.updateCancellationById(req.params.cancellationId, req.body);
    
    const response = Response(true, cancellation, "Success");
    res.status(httpStatus.OK).send(response);});

// Delete a vehicle model
const deleteCancellation = catchAsync(async (req, res) => {
    const cancellation = await cancellationReasonService.deleteCancellationById(req.params.cancellationId);
    const response = Response(true, cancellation, "Success");
    res.status(httpStatus.OK).send(response);});

// Update a vehicle model's status
const UpdateCancellationStatus = catchAsync(async (req, res) => {
    const cancellationId = req.params.cancellationId;
    const { status } = req.body;
  
    const cancellation = await cancellationReasonService.updateCancellationById(cancellationId, { status });
  
    if (!cancellation) {
      throw new ApiError(httpStatus.NOT_FOUND, 'cancellation not found');
    }
  
    const response = Response(true, cancellation, "cancellation status updated successfully");
    res.status(httpStatus.OK).send(response);
  });

  const getCancellationByLanguage = catchAsync(async (req, res) => {
  if (!req.headers.clientid) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ClientID not found');
  }
  const filter = pick(req.query, ['reason', 'userType']);
  
  const options = pick(req.query, ['sortBy', 'limit', 'page'],{ allowDiskUse: true });
  if (req.query.search) {
    filter.$or = [
      { question: { $regex: '^'+req.query.search, $options: 'i' } },
      { category: { $regex: '^'+req.query.search, $options: 'i' } }
    ];
  }
  const result = await cancellationReasonService.getCancellationByLanguage(req,filter, options);
  
  const response = Response(true, result, "Success");
  res.status(httpStatus.OK).send(response);
});
module.exports = {
    createCancellation,
    getCancellations,
    getCancellationWithoutPagination,
    getUserCancellationWithoutPagination,
    UpdateCancellation,
    deleteCancellation,
    UpdateCancellationStatus,
    getCancellationByLanguage
};
