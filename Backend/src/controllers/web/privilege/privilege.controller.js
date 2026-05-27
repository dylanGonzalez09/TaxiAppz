const httpStatus = require('http-status').default || require('http-status').status || require('http-status');
const pick = require('../../../utils/pick');
const ApiError = require('../../../utils/ApiError');
const catchAsync = require('../../../utils/catchAsync');
const { privilegeService } = require('../../../services');
const Response = require('../../../config/response');
const mqttService = require('../../../services/mqtt/mqtt.service');
const { mqttConfig } = require('../../../config/string');

const createPrivillege = catchAsync(async (req, res) => {
  let clientId;

  if (!req.headers.clientid) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ClientID not found');
  } else {
    clientId = req.headers.clientid;
    req.body.clientId = clientId;
  }
  const privillege = await privilegeService.createPrivillege(req.body);
  const response = Response(true, privillege, 'Success');
  res.status(httpStatus.CREATED).send(response);
});

const getPrivilleges = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await privilegeService.queryPrivillege(filter, options);
  const response = Response(true, result, 'Success');
  res.status(httpStatus.OK).send(response);
});

const getPrivillege = catchAsync(async (req, res) => {
  const privillege = await privilegeService.getPrivillegeById(req.params.privillegeId);
  if (!privillege) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Privillege not found');
  }
  const response = Response(true, privillege, 'Success');
  res.status(httpStatus.OK).send(response);
});

const updatePrivillege = catchAsync(async (req, res) => {
  const privillege = await privilegeService.updatePrivillegeById(req.params.privillegeId, req.body);
  const response = Response(true, privillege, 'Success');
  res.status(httpStatus.OK).send(response);
});

const privillegeUpdate = catchAsync(async (req, res) => {
  let clientId;

  if (!req.headers.clientid) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ClientID not found');
  } else {
    clientId = req.headers.clientid;
    req.body.clientId = clientId;
  }
  const privillege = await privilegeService.givePrivillegeById(req.params.privillegeId, req.body);
  mqttService.publishMessage(mqttConfig.WEB_PRIVILEDGE, JSON.stringify(privillege));
  const response = Response(true, privillege, 'Success');
  res.status(httpStatus.OK).send(response);
});

const deletePrivillege = catchAsync(async (req, res) => {
  const privillege = await privilegeService.deletePrivillegeById(req.params.privillegeId);
  const response = Response(true, privillege, 'Success');
  res.status(httpStatus.OK).send(response);
});

const PrivillegeDetails = catchAsync(async (req, res) => {
  let clientId;

  if (!req.headers.clientid) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ClientID not found');
  } else {
    clientId = req.headers.clientid;
  }
  const privillege = await privilegeService.getPrivilegesWithDetails(clientId);
  const response = Response(true, privillege, 'Success');
  res.status(httpStatus.OK).send(response);
});

const PrivillegeWithRole = catchAsync(async (req, res) => {
  let clientId;
  if (!req.headers.clientid) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ClientID not found');
  } else {
    clientId = req.headers.clientid;
  }

  const { roleId } = req.params;

  const privillege = await privilegeService.getPrivilegesWithRole(roleId, clientId);
  const response = Response(true, privillege, 'Success');
  res.status(httpStatus.OK).send(response);
});

const PrivillegeWithRoleName = catchAsync(async (req, res) => {
  let clientId;
  let privillege;
  if (!req.headers.clientid) {
    privillege = await privilegeService.getSuperAdminPrivilegesWithRoleName(req.params.roleId);
  } else {
    clientId = req.headers.clientid;
    privillege = await privilegeService.getPrivilegesWithRoleName(req.params.roleId, clientId);
  }
  const response = Response(true, privillege, 'Success');
  res.status(httpStatus.OK).send(response);
});

module.exports = {
  createPrivillege,
  getPrivilleges,
  getPrivillege,
  updatePrivillege,
  deletePrivillege,
  PrivillegeDetails,
  PrivillegeWithRole,
  privillegeUpdate,
  PrivillegeWithRoleName,
};
