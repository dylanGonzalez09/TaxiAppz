const httpStatus = require('http-status');
const pick = require('../../../utils/pick');
const ApiError = require('../../../utils/ApiError');
const catchAsync = require('../../../utils/catchAsync');
const { mobileCompanyService } = require('../../../services');
const { userService } = require('../../../services');
const Response = require('../../../config/response');

const createCompany = catchAsync(async (req, res) => {

  const userData = {
    firstName: req.body.firstName ? req.body.firstName : "",
    lastName: req.body.lastName ? req.body.lastName : "",
    email: req.body.email ? req.body.email : "",
    phoneNumber: req.body.phoneNumber ? req.body.phoneNumber : "",
    emergencyNumber: req.body.emergencyNumber ? req.body.emergencyNumber : "",
    password: req.body.password ? req.body.password : "",
    roleIds: req.body.roleIds,
    // gender: req.body.gender ? req.body.gender : "",
    country: req.body.country ? req.body.country : "",
    address: req.body.address ? req.body.address : "",
    active: req.body.active ? req.body.active : true
  }

  if (!req.headers.clientid) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ClientID not found');
  }else{
    userData.clientId = req.headers.clientid;
  }


  const user = await userService.createUser(userData)

  const companyData = {
    userId: user.id,
    companyName: req.body.companyName,
    companyCode: req.body.companyCode,
    alternativeNumber: req.body.alternativeNumber,
    commission: req.body.commission,
    noOfVehicle: req.body.noOfVehicle,
    clientId: user.clientId,
    status: req.body.active
  }

  const company = await mobileCompanyService.createCompany(companyData);
  company.userId = user.id;
  const response = Response(true, company, "Success");
  res.status(httpStatus.CREATED).send(response);
});

const getCompanys = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await mobileCompanyService.queryCompanys(filter, options);
  const response = Response(true, result, "Success");
  res.status(httpStatus.OK).send(response);
});


const getCompany = catchAsync(async (req, res) => {
  const company = await mobileCompanyService.getCompanyById(req.params.companyId);
  if (!company) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Company not found');
  }
  const response = Response(true, company, "Success");
  res.status(httpStatus.OK).send(response);
});

const getCompanyWithOutPagination = catchAsync(async (req, res) => {
  const company = await mobileCompanyService.getCompanys();
  if (!company) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Comapny not found');
  }
  const response = Response(true, company, "Success");
  res.status(httpStatus.OK).send(response);
});

const updateCompany = catchAsync(async (req, res) => {

  const userData = {
    firstName: req.body.firstName ? req.body.firstName : "",
    lastName: req.body.lastName ? req.body.lastName : "",
    email: req.body.email ? req.body.email : "",
    phoneNumber: req.body.phoneNumber ? req.body.phoneNumber : "",
    emergencyNumber: req.body.emergencyNumber ? req.body.emergencyNumber : "",
    password: req.body.password ? req.body.password : "",
    roleIds: req.body.roleIds,
    // gender: req.body.gender ? req.body.gender : "",
    country: req.body.country ? req.body.country : "",
    address: req.body.address ? req.body.address : "",
    active: req.body.active ? req.body.active : true
  }

  const user = await userService.updateUserById(req.body.userId, userData);

  const companyData = {
    userId: user.id,
    companyName: req.body.companyName,
    companyCode: req.body.companyCode,
    alternativeNumber: req.body.alternativeNumber,
    commission: req.body.commission,
    noOfVehicle: req.body.noOfVehicle,
    status: req.body.status
  }

  const company = await mobileCompanyService.updateCompanyById(req.params.companyId, companyData);
  company.userId = user.id;
  const response = Response(true, company, "Success");
  res.status(httpStatus.OK).send(response);
});

const deleteCompany = catchAsync(async (req, res) => {
  const company = await mobileCompanyService.deleteCompanyById(req.params.companyId);
  const response = Response(true, company, "Success");
  res.status(httpStatus.OK).send(response);
});


const getCompanyDetails = catchAsync(async (req, res) => {
  if (!req.headers.clientid) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ClientID not found');
  }
  const company = await mobileCompanyService.getCompanyDetails(req.headers.clientid);
  if (!company) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Country not found');
  }
  const response = Response(true, company, 'Success');
  res.status(httpStatus.OK).send(response);
});

const getCompanyList = catchAsync(async (req, res) => {
  const company = await mobileCompanyService.getCompanyList(req);
  if (!company) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Country not found');
  }
  const response = Response(true, company, 'Success');
  res.status(httpStatus.OK).send(response);
});



const updateActiveStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // Ensure 'status' is a boolean
  if (typeof status !== 'boolean') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Active status must be a boolean');
  }

  // Update the company's status by ID
  const company = await mobileCompanyService.updateCompanyById(id, { status });

  // Check if the company was found and updated
  if (!company) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Company not found');
  }

  // Update the user's active status based on the company's userId
  const user = await userService.updateUserById(company.userId, { active: status });

  // Create a response indicating success and return it to the client
  const response = Response(true, user, 'User active status updated successfully');
  res.status(httpStatus.OK).send(response);
});

const getCompanyPagination = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['companyName', 'status']); 
  const options = pick(req.query, ['sortBy', 'limit', 'page']); 
  const result = await mobileCompanyService.getCompanyDetailsPagination(req,filter, options);
  const response = Response(true, result, 'Success');

  res.status(httpStatus.OK).send(response);
});

module.exports = {
  createCompany,
  getCompanys,
  getCompany,
  getCompanyWithOutPagination,
  updateCompany,
  deleteCompany,
  getCompanyDetails,
  updateActiveStatus,
  getCompanyPagination,getCompanyList
};
