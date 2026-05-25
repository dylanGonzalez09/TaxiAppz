const httpStatus = require('http-status');
const pick = require('../../../utils/pick');
const ApiError = require('../../../utils/ApiError');
const { handleMongoError } = require('../../../utils/errorHandler');
const catchAsync = require('../../../utils/catchAsync');
const { demoClientService } = require('../../../services');
const { userService } = require('../../../services');
const Response = require('../../../config/response');
const sendEmail = require('../../../config/email');

const createClient = catchAsync(async (req, res, next) => {
  try {
    const userData = {
      firstName: req.body.firstName || '',
      lastName: req.body.lastName || '',
      email: req.body.email || '',
      phoneNumber: req.body.phoneNumber || '',
      emergencyNumber: req.body.emergencyNumber || '',
      password: req.body.password || '',
      roleIds: req.body.roleIds || [],
      address: req.body.address || '',
      active: req.body.active !== undefined ? req.body.active : true,
      language: req.body.languageId || '',
      isDemo: true,
      demo_key: req.body.demoKey || '',
    };

    if (!req.headers.clientid) {
      throw new ApiError(httpStatus.NOT_FOUND, 'ClientID not found');
    } else {
      userData.clientId = req.headers.clientid;
    }
    if (req.body.demoKey) {
      const existingDemo = await demoClientService.getClientByDemoKey(req.body.demoKey);

      if (existingDemo) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Demo key already exists');
      }
    }

    const user = await userService.createUser(userData);

    const clientData = {
      userId: user.id,
      Name: `${user.firstName} ${user.lastName}`,
      clientCode: req.body.clientCode || '',
      subScriptionId: req.body.subScriptionId || '',
      Startdate: req.body.Startdate || null,
      Enddate: req.body.Enddate || null,
      demoKey: req.body.demoKey || '',
      demo: req.body.demo !== undefined ? req.body.demo : false,
      status: req.body.status !== undefined ? req.body.status : true,
      clientId: user.clientId,
    };
    const client = await demoClientService.createClient(clientData);

    let createData = client.toObject ? client.toObject() : { ...client };

    // Now update the fields properly
    createData.firstName = req.body.firstName || '';
    createData.lastName = req.body.lastName || '';
    createData.email = req.body.email || '';
    createData.phoneNumber = req.body.phoneNumber || '';
    createData.emergencyNumber = req.body.emergencyNumber || '';
    createData.address = req.body.address || '';
    createData.userId = user.id;

    await sendEmail(client.Enddate, user.email, req.body.demoKey, `${user.firstName} ${user.lastName}`);

    const response = Response(true, client, 'Client created successfully');

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

  const result = await demoClientService.queryClients(filter, options);
  const response = Response(true, result, 'Success');
  res.status(httpStatus.OK).send(response);
});

const getClient = catchAsync(async (req, res) => {
  const client = await demoClientService.getClientById(req.params.clientId);
  if (!client) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Client not found');
  }
  const response = Response(true, client, 'Success');
  res.status(httpStatus.OK).send(response);
});

const getClientWithOutPagination = catchAsync(async (req, res) => {
  const client = await demoClientService.getClients();
  if (!client) {
    throw new ApiError(httpStatus.NOT_FOUND, 'client not found');
  }
  const response = Response(true, client, 'Success');
  res.status(httpStatus.OK).send(response);
});
const updateClient = catchAsync(async (req, res) => {
  const existingClient = await demoClientService.getClientById(req.params.clientId);
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
    isDemo: existingUser.isDemo,
    demo_key: req.body.demoKey || existingClient.demoKey,
  };

  const clientData = {
    clientCode: req.body.clientCode || existingClient.clientCode,
    Name: `${userData.firstName} ${userData.lastName}`,
    subScriptionId: req.body.subScriptionId || existingClient.subScriptionId,
    Startdate: req.body.Startdate || existingClient.Startdate,
    Enddate: req.body.Enddate || existingClient.Enddate,
    demoKey: req.body.demoKey || existingClient.demoKey,
    demo: req.body.demo || existingClient.demo,
    status: req.body.status !== undefined ? req.body.status : existingClient.status,
  };

  const updatedUser = await userService.updateUserById(existingUser._id, userData);

  const updatedClient = await demoClientService.updateClientById(req.params.clientId, clientData);
  await sendEmail(updatedClient.Enddate, updatedUser.email, req.body.demoKey, `${userData.firstName} ${userData.lastName}`);

  const response = Response(true, updatedClient, 'Client updated successfully');
  res.status(httpStatus.OK).send(response);
});

const deleteClient = catchAsync(async (req, res) => {
  const client = await demoClientService.deleteClientById(req.params.clientId);
  const response = Response(true, client, 'Success');
  res.status(httpStatus.OK).send(response);
});

const getClientDetails = catchAsync(async (req, res) => {
  const client = await demoClientService.getClientDetails();
  if (!client) {
    throw new ApiError(httpStatus.NOT_FOUND, 'client not found');
  }
  const response = Response(true, client, 'Success');
  res.status(httpStatus.OK).send(response);
});

const updateActiveStatus = catchAsync(async (req, res) => {
  const { clientId } = req.params;
  const { status } = req.body;
  // Ensure 'status' is a boolean
  if (typeof status !== 'boolean') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Active status must be a boolean');
  }
  // Update the company's status by ID
  const client = await demoClientService.updateClientById(clientId, { status });

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
  data = await demoClientService.getSuperAdminRoleAndPackage();
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, 'data not found');
  }
  const response = Response(true, data, 'Success');
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
  getDropDownList,
};
