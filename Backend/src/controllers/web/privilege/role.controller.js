const httpStatus = require('http-status');
const pick = require('../../../utils/pick');
const ApiError = require('../../../utils/ApiError');
const catchAsync = require('../../../utils/catchAsync');
const { roleService } = require('../../../services');
const Response = require('../../../config/response');

const createRole = catchAsync(async (req, res) => {
  let clientId;

  if (!req.headers.clientid) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ClientID not found');
  }else{
    clientId = req.headers.clientid;
    req.body.clientId = clientId;
  }
  const role = await roleService.createRole(req.body);
  const response = Response(true, role, "Success");
  res.status(httpStatus.CREATED).send(response);
});

const getRoles = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['role', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page'],{ allowDiskUse: true });
  if (req.query.search) {
    filter.$or = [
      { role: {$regex: '^'+req.query.search,$options: 'i'} },

    ];
  } 
  const result = await roleService.queryRoles(filter, options);
  const response = Response(true, result, "Success");
  res.status(httpStatus.OK).send(response);
});

const getRole = catchAsync(async (req, res) => {
  const role = await roleService.getRoleById(req.params.roleId);
  if (!role) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Role not found');
  }
  const response = Response(true, role, "Success");
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  res.status(httpStatus.OK).send(response);
});

const getRoleWithOutPagination = catchAsync(async (req, res) => {
  let role;
  if (!req.headers.clientid) {
    role = await roleService.getSuperAdminRole();
  }else{
    role = await roleService.getRoles(req.headers.clientid);
  }
  if (!role) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Role not found');
  }
  const response = Response(true, role, "Success");
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  res.status(httpStatus.OK).send(response);
});



const getDropDownList = catchAsync(async (req, res) => {
  let data;

  if (!req.params.clientId) {
    data = await roleService.getSuperAdminRole();
  }else{
    data = await roleService.getDropDownsRoles(req.params.clientId);
  }
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, 'data not found');
  }
  const response = Response(true, data, "Success");
  res.status(httpStatus.OK).send(response);
});

const updateRole = catchAsync(async (req, res) => {
  const role = await roleService.updateRoleById(req.params.roleId, req.body);
  const response = Response(true, role, "Success");
  res.status(httpStatus.OK).send(response);
});

const deleteRole = catchAsync(async (req, res) => {
  const role = await roleService.deleteRoleById(req.params.roleId);
  const response = Response(true, role, "Success");
  res.status(httpStatus.OK).send(response);
});

module.exports = {
  createRole,
  getRoles,
  getRole,
  getRoleWithOutPagination,
  updateRole,
  deleteRole,
  getDropDownList
};
