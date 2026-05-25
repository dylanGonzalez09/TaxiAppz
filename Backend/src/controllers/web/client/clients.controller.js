const httpStatus = require('http-status');
const pick = require('../../../utils/pick');
const ApiError = require('../../../utils/ApiError');
const { handleMongoError } = require('../../../utils/errorHandler');
const catchAsync = require('../../../utils/catchAsync');
const { clientService } = require('../../../services');
const { userService } = require('../../../services');
const Response = require('../../../config/response');

const createClient = catchAsync(async (req, res, next) => {
  try {
    // Create the user first
    const userData = {
      firstName: req.body.firstName ? req.body.firstName : "",
      lastName: req.body.lastName ? req.body.lastName : "",
      email: req.body.email ? req.body.email : "",
      phoneNumber: req.body.phoneNumber ? req.body.phoneNumber : "",
      emergencyNumber: req.body.emergencyNumber ? req.body.emergencyNumber : "",
      password: req.body.password ? req.body.password : "",
      roleIds: req.body.roleIds,
      address: req.body.address ? req.body.address : "",
      active: req.body.active ? req.body.active : true,
      language: req.body.languageId ? req.body.languageId : "",
    };

    const user = await userService.createUser(userData);
    const clientData = {
      userId: user.id,
      Name: `${user.firstName} ${user.lastName}`,
      clientCode: req.body.clientCode,
      subScriptionId: req.body.subScriptionId ? req.body.subScriptionId : "",
      Startdate: req.body.Startdate,
      Enddate: req.body.Enddate,
      noOfVehicle: req.body.noOfVehicle,
      noOfUsers: req.body.noOfUsers,
      noOfDrivers: req.body.noOfDrivers,
      features: req.body.features,
      taxiModules: req.body.taxiModules,
      status: req.body.status,
    };

    const client = await clientService.createClient(clientData);

    let createData = client.toObject ? client.toObject() : { ...client }; // Convert to plain object if it's a Mongoose doc

    // Now update the fields properly
    createData.firstName = req.body.firstName;
    createData.lastName = req.body.lastName;
    createData.email = req.body.email;
    createData.phoneNumber = req.body.phoneNumber;
    createData.emergencyNumber = req.body.emergencyNumber;
    createData.address = req.body.address;
    createData.userId = user.id;


    user.clientId = client.id; 
    await user.save(); 
     
    const response = Response(true, client, "Client created successfully");

    res.status(httpStatus.CREATED).send(response);
  } catch (error) {
    return handleMongoError(error, next);
  }
});


const queryClients = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['clientCode', 'Name', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);

  if (req.query.search) {
    filter.$or = [
      { clientCode: { $regex: req.query.search, $options: 'i' } },
      { Name: { $regex: req.query.search, $options: 'i' } },
    ];
  }

  const result = await clientService.queryClients(filter, options);
  const response = Response(true, result, 'Success');
  res.status(httpStatus.OK).send(response);
});

const getClient = catchAsync(async (req, res) => {
  const client = await clientService.getClientById(req.params.clientId);
  if (!client) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Client not found');
  }
  const response = Response(true, client, "Success");
  res.status(httpStatus.OK).send(response);
});

const getClientWithOutPagination = catchAsync(async (req, res) => {
  const client = await clientService.getClients();
  if (!client) {
    throw new ApiError(httpStatus.NOT_FOUND, 'client not found');
  }
  const response = Response(true, client, "Success");
  res.status(httpStatus.OK).send(response);
});
const updateClient = catchAsync(async (req, res) => {

  const existingClient = await clientService.getClientById(req.params.clientId);
  if (!existingClient) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Client not found');
  }


  const existingUser = await userService.getUserById(existingClient.userDetails._id);
  if (!existingUser) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  const userData = {
    firstName: req.body.firstName || existingUser.firstName,
    lastName: req.body.lastName || existingUser.lastName,
    email: req.body.email || existingUser.email,
    phoneNumber: req.body.phoneNumber || existingUser.phoneNumber,
    emergencyNumber: req.body.emergencyNumber || existingUser.emergencyNumber,
    password: req.body.password || existingUser.password,
    roleIds: req.body.roleIds || existingUser.roleIds,
    address: req.body.address || existingUser.address,
    active: req.body.active !== undefined ? req.body.active : existingUser.active,
    language: req.body.languageId || existingUser.languageId,
  };


  const clientData = {
    clientCode: req.body.clientCode || existingClient.clientCode,
    Name: `${userData.firstName} ${userData.lastName}`,
    subScriptionId: req.body.subScriptionId || existingClient.subScriptionId,
    Startdate: req.body.Startdate || existingClient.Startdate,
    Enddate: req.body.Enddate || existingClient.Enddate,
    noOfVehicle: req.body.noOfVehicle || existingClient.noOfVehicle,
    features: req.body.features || existingClient.features,
    taxiModules: req.body.taxiModules || existingClient.taxiModules,
    status: req.body.status !== undefined ? req.body.status : existingClient.status,
  };

  const updatedUser = await userService.updateUserById(existingUser._id, userData);

  const updatedClient = await clientService.updateClientById(req.params.clientId, clientData);

  const response = Response(true, updatedClient, "Client updated successfully");
  res.status(httpStatus.OK).send(response);
});

const deleteClient = catchAsync(async (req, res) => {
  const client = await clientService.deleteClientById(req.params.clientId);
  const response = Response(true, client, "Success");
  res.status(httpStatus.OK).send(response);
});


const getClientDetails = catchAsync(async (req, res) => {
  const client = await clientService.getClientDetails();
  if (!client) {
    throw new ApiError(httpStatus.NOT_FOUND, 'client not found');
  }
  const response = Response(true, client, 'Success');
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
  const client = await clientService.updateClientById(id, { status });

  // Check if the company was found and updated
  if (!client) {
    throw new ApiError(httpStatus.NOT_FOUND, 'client not found');
  }

  // Update the user's active status based on the company's userId
  const user = await userService.updateUserById(client.userId, { active: status });

  // Create a response indicating success and return it to the client
  const response = Response(true, user, 'User active status updated successfully');
  res.status(httpStatus.OK).send(response);
});

const getDropDownList = catchAsync(async (req, res) => {

  let data;
  data = await clientService.getSuperAdminRoleAndPackage();
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, 'data not found');
  }
  const response = Response(true, data, "Success");
  res.status(httpStatus.OK).send(response);
});

module.exports = {
  createClient,
  queryClients,
  getClient,
  getClientWithOutPagination,
  updateClient,
  deleteClient,
  getClientDetails,
  updateActiveStatus,
  getDropDownList
};
