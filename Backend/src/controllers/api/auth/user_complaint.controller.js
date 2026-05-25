const httpStatus = require('http-status');
const pick = require('../../../utils/pick');
const ApiError = require('../../../utils/ApiError');
const catchAsync = require('../../../utils/catchAsync');
const { mobileUserComplaintService } = require('../../../services');
const Response = require('../../../config/response'); 

const createUserComplaint = catchAsync(async (req, res) => {
  const userComplaint = await mobileUserComplaintService.createUserComplaint(req);
  const response = Response(true, userComplaint, "Success");
  res.status(httpStatus.CREATED).send(response);
});

const getUserComplaints = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await mobileUserComplaintService.queryUserComplaints(filter, options,req);
  const response = Response(true, result, "Success");
  res.status(httpStatus.OK).send(response);
});

const getUserComplaint = catchAsync(async (req, res) => {
  const userComplaint = await mobileUserComplaintService.getUserComplaintById(req.params.userComplaintId);
  if (!userComplaint) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Sos not found');
  }
  const response = Response(true, sos, "Success");
  res.status(httpStatus.OK).send(response);
});

const getUserComplaintWithOutPagination = catchAsync(async (req, res) => {
  const userComplaint = await mobileUserComplaintService.getUserComplaints(req);
  if (!userComplaint) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Sos not found');
  }
  const response = Response(true, userComplaint, "Success");
  res.status(httpStatus.OK).send(response);
});

const updateUserComplaint = catchAsync(async (req, res) => {
  const userComplaint = await mobileUserComplaintService.updateUserComplaintById(req.params.userComplaintId, req.body);
  const response = Response(true, userComplaint, "Success");
  res.status(httpStatus.OK).send(response);
});

const deleteUserComplaint = catchAsync(async (req, res) => {
  const userComplaint = await mobileUserComplaintService.deleteUserComplaintById(req.params.userComplaintId);
  const response = Response(true, userComplaint, "Success");
  res.status(httpStatus.OK).send(response);
});

module.exports = {
  createUserComplaint,
  getUserComplaints,
  getUserComplaint,
  getUserComplaintWithOutPagination,
  updateUserComplaint,
  deleteUserComplaint,
};
