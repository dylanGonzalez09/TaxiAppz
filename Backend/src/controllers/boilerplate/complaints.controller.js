const httpStatus = require('http-status').default || require('http-status').status || require('http-status');
const catchAsync = require('../../utils/catchAsync');
const pick = require('../../utils/pick');
const { complaintsService } = require('../../services');
const Response = require('../../config/response');
const ApiError = require('../../utils/ApiError');

// Create a complaints
const createComplaints = catchAsync(async (req, res) => {
  let clientId;

  if (!req.headers.clientid) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ClientID not found');
  } else {
    clientId = req.headers.clientid;
    req.body.clientId = clientId;
  }

  const Complaints = await complaintsService.createComplaints(req.body);

  const response = Response(true, Complaints, 'Success');
  res.status(httpStatus.CREATED).send(response);
});

// Get all complaintss with pagination
const getComplaints = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['title', 'type']);

  const options = pick(req.query, ['sortBy', 'limit', 'page'], { allowDiskUse: true });
  if (req.query.search) {
    filter.$or = [
      { title: { $regex: req.query.search, $options: 'i' } },
      { type: { $regex: req.query.search, $options: 'i' } },
    ];
  }
  const result = await complaintsService.queryComplaints(req, filter, options);

  const response = Response(true, result, 'Success');
  res.status(httpStatus.OK).send(response);
});

// Get all complaints  without pagination
const getComplaintsWithoutPagination = catchAsync(async (req, res) => {
  const Complaints = await complaintsService.getComplaintss();
  if (!Complaints) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Complaints not found');
  }
  const response = Response(true, Complaints, 'Success');
  res.status(httpStatus.OK).send(response);
});

// Update complaints
const UpdateComplaints = catchAsync(async (req, res) => {
  const Complaints = await complaintsService.updateComplaintsById(req.params.complaintsId, req.body);

  const response = Response(true, Complaints, 'Success');
  res.status(httpStatus.OK).send(response);
});

// Delete  complaints
const deleteComplaints = catchAsync(async (req, res) => {
  const Complaints = await complaintsService.deleteComplaintsById(req.params.complaintsId);
  const response = Response(true, Complaints, 'Success');
  res.status(httpStatus.OK).send(response);
});

// Update complaints status
const UpdateComplaintsStatus = catchAsync(async (req, res) => {
  const { complaintsId } = req.params;
  const { status } = req.body;

  const Complaints = await complaintsService.updateComplaintsById(complaintsId, { status });

  if (!Complaints) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Complaints not found');
  }

  const response = Response(true, Complaints, 'Complaints status updated successfully');
  res.status(httpStatus.OK).send(response);
});
const getComplaintsByLanguage = catchAsync(async (req, res) => {
  if (!req.headers.clientid) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ClientID not found');
  }
  if (!req.headers.zoneid) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ZoneID not found');
  }

  const filter = pick(req.query, ['title', 'type']);

  const options = pick(req.query, ['sortBy', 'limit', 'page'], { allowDiskUse: true });
  if (req.query.search) {
    filter.$or = [
      { question: { $regex: `^${req.query.search}`, $options: 'i' } },
      { category: { $regex: `^${req.query.search}`, $options: 'i' } },
    ];
  }
  const result = await complaintsService.getComplaintsByLanguage(req, filter, options);

  const response = Response(true, result, 'Success');
  res.status(httpStatus.OK).send(response);
});
module.exports = {
  createComplaints,
  getComplaints,
  getComplaintsWithoutPagination,
  UpdateComplaints,
  deleteComplaints,
  UpdateComplaintsStatus,
  getComplaintsByLanguage,
};
