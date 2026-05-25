const httpStatus = require('http-status');
const pick = require('../../utils/pick');
const ApiError = require('../../utils/ApiError');
const catchAsync = require('../../utils/catchAsync');
const { usersService } = require('../../services');
const Response = require('../../config/response');
const mongoose = require('mongoose');


const createUser = catchAsync(async (req, res) => {
  const user = await usersService.createUser(req.body);
  const response = Response(true, user, 'Success');
  res.status(httpStatus.CREATED).send(response);
});

const getUsers = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await usersService.queryUsers(filter, options);
  const response = Response(true, result, 'Success');
  res.status(httpStatus.OK).send(response);
});

const getUser = catchAsync(async (req, res) => {
  const user = await usersService.getUserById(req.params.userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  const response = Response(true, user, 'Success');
  res.status(httpStatus.OK).send(response);
});

const getUserByRole = catchAsync(async (req, res) => {
  const user = await usersService.getUserByRoleId(req.params.roleIds);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  const response = Response(true, user, 'Success');
  res.status(httpStatus.OK).send(response);
});

const getUserByEmail = catchAsync(async (req, res) => {
  const user = await usersService.getUserByEmail(req.body.token);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  const response = Response(true, user, 'Success');
  res.status(httpStatus.OK).send(response);
});
const getUserByEmailDetails = catchAsync(async (req, res) => {
  const user = await usersService.gettUserByEmaiDetails(req.body.email);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  const response = Response(true, user, 'Success');
  res.status(httpStatus.OK).send(response);
});

const updateUser = catchAsync(async (req, res) => {
  const user = await usersService.updateUserById(req.params.userId, req.body);
  const response = Response(true, user, 'Success');
  res.status(httpStatus.OK).send(response); 
});

const deleteUser = catchAsync(async (req, res) => {
  const user = await usersService.deleteUserById(req.params.userId);
  const response = Response(true, user, 'Success');
  res.status(httpStatus.OK).send(response);
});

const getDropDownList = catchAsync(async (req, res) => {
  let data = await usersService.getDropDowns(req.params.clientId);
  
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, 'data not found');
  }
  const response = Response(true, data, "Success");
  res.status(httpStatus.OK).send(response);
});

const getDashboardCount = catchAsync(async (req, res) => {
  // Fetch dashboard counts using the provided clientId
  let clientId;

  if (!req.headers.clientid) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ClientID not found');
  } else {
    clientId = req.headers.clientid;
  }
  
  let data = await usersService.getDashboardByCount(clientId)
  // Check if data is not found
  if (!data || Object.keys(data).length === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Data not found');
  }

  // Send the response with the dashboard data
  const response = Response(true, data, "Success");
  res.status(httpStatus.OK).send(response);
});

const getAllAdmin = catchAsync(async (req, res) => {
  const adminRoleId = new mongoose.Types.ObjectId('67763bc21e8c5b7e7cabd64c'); // Replace with actual admin role ID

  const filter = { roleIds: { $in: [adminRoleId] } }; // Query users with admin role

  const admins = await usersService.getAdmins(filter); // No pagination

  if (!admins || admins.length === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No admins found');
  }

  res.status(httpStatus.OK).json(Response(true, admins, 'Success'));
});
const getUserProfileDetails = catchAsync(async (req, res) => {
  const { userId } = req.params;

  // Validate if userId exists and is a valid MongoDB ObjectId
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(httpStatus.BAD_REQUEST).json({ 
      success: false, 
      message: "Invalid user ID format" 
    });
  }

  // Fetch user details
  const user = await usersService.getByUserDetails(userId);

  // Construct response
  const response = Response(true, user, "User retrieved successfully");

  res.status(httpStatus.OK).json(response);
});

const getLogisticalCounts = async (req, res) => {
  let clientId;

  if (!req.headers.clientid) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ClientID not found');
  } else {
    clientId = req.headers.clientid;
  }
  let data = await usersService.getLogisticalCounts(clientId)

  if (!data || Object.keys(data).length === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Data not found');
  }

  const response = Response(true, data, "Success");
  res.status(httpStatus.OK).send(response);
 
};
module.exports = {
  createUser,
  getAllAdmin,
  getUsers,
  getUser,
  getUserByRole,
  updateUser,
  deleteUser,
  getUserByEmail,
  getUserByEmailDetails,
  getDropDownList,
  getDashboardCount,
  getUserProfileDetails,
  getLogisticalCounts
};
