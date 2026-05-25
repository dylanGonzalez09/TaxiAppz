
const mongoose = require('mongoose');

const httpStatus = require('http-status');
const pick = require('../../../utils/pick');
const ApiError = require('../../../utils/ApiError');
const catchAsync = require('../../../utils/catchAsync');
const { mobilecomplaintsService } = require('../../../services');
const Response = require('../../../config/response'); 
const ObjectId = mongoose.Types.ObjectId;


const createComplaint = catchAsync(async (req, res) => {
  const complaint = await mobilecomplaintsService.createComplaints(req);
  const response = Response(true, complaint, "Success");
  res.status(httpStatus.CREATED).send(response);
});

const getComplaints = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await mobilecomplaintsService.queryComplaints(filter, options,req);
  const response = Response(true, result, "Success");
  res.status(httpStatus.OK).send(response);
});

const getComplaint = catchAsync(async (req, res) => {
  const complaint = await mobilecomplaintsService.getComplaintsById(req.params.complaintId);
  if (!complaint) {
    throw new ApiError(httpStatus.NOT_FOUND, 'complaint not found');
  }
  const response = Response(true, complaint, "Success");
  res.status(httpStatus.OK).send(response);
});


const getComplaintWithOutPagination = catchAsync(async (req, res) => {
  const complaint = await mobilecomplaintsService.getComplaints(req);
  if (!complaint) {
    throw new ApiError(httpStatus.NOT_FOUND, 'complaint not found');
  }
  const response = Response(true, complaint, "Success");
  res.status(httpStatus.OK).send(response);
});


const getComplaintType = catchAsync(async (req, res) => {
    const complaint = await mobilecomplaintsService.getComplaintType();
    if (!complaint) {
      throw new ApiError(httpStatus.NOT_FOUND, 'complaint not found');
    }
    const response = Response(true, complaint, "Success");
    res.status(httpStatus.OK).send(response);
  });


const updateComplaint = catchAsync(async (req, res) => {
  const complaint = await mobilecomplaintsService.updateComplaintsById(req.params.complaintId, req.body);
  const response = Response(true, complaint, "Success");
  res.status(httpStatus.OK).send(response);
});

const deleteComplaint = catchAsync(async (req, res) => {
  const complaint = await mobilecomplaintsService.deleteComplaintsById(req.params.complaintId);
  const response = Response(true, complaint, "Success");
  res.status(httpStatus.OK).send(response);
});


const getSuggestionList = catchAsync(async (req, res) => {
    const complaint = await mobilecomplaintsService.getSuggestionsList(req);
    if (!complaint) {
      throw new ApiError(httpStatus.NOT_FOUND, 'complaint not found');
    }
    const response = Response(true, complaint, "Success");
    res.status(httpStatus.OK).send(response);
  });

  const getComplaintList = catchAsync(async (req, res) => {
    const complaint = await mobilecomplaintsService.getComplaintList(req);
    if (!complaint) {
      throw new ApiError(httpStatus.NOT_FOUND, 'complaint not found');
    }
    const response = Response(true, complaint, "Success");
    res.status(httpStatus.OK).send(response);
  });
  const getComplaintsByUser = async (req, res) => {
    try {
      if (!req.headers.clientid) {
        throw new ApiError(httpStatus.NOT_FOUND, 'ClientID not found');
      } else {
        if (!req.body) {
          req.body = {}; 
        }
            req.body.clientId = req.headers.clientid;
      }
  
      const { userId } = req.params;
  
      if (!userId) {
        return res.status(400).json({ success: false, message: 'User ID is required in the URL' });
      }
  
      const complaints = await mobilecomplaintsService.getComplaintsByUser(userId);
  
      // Return the complaints in the response
      const response = Response(true, complaints, 'complaints get successfully');
      res.status(httpStatus.CREATED).send(response);
        } catch (error) {
      res.status(500).json({ success: false, message: error.message || 'Something went wrong' });
    }
  };
  

module.exports = {
  createComplaint,
  getComplaints,
  getComplaint,
  getComplaintWithOutPagination,
  updateComplaint,
  deleteComplaint,
  getSuggestionList,
  getComplaintList,
  getComplaintType,
  getComplaintsByUser
};
