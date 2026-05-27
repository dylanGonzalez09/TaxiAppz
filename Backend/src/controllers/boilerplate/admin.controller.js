const httpStatus = require('http-status').default || require('http-status').status || require('http-status');
const pick = require('../../utils/pick');
const ApiError = require('../../utils/ApiError');
const catchAsync = require('../../utils/catchAsync');
const { adminService } = require('../../services');
const Response = require('../../config/response');

const { Role } = require('../../models');

const { getUserById, getClientId, getZoneId ,getUserId} = require('../../utils/commonFunction');

const createAdmin = catchAsync(async (req, res) => {
  const admin = await adminService.createAdmin(req.body);
  const response = Response(true, admin, 'Success');
  res.status(httpStatus.CREATED).send(response);
});

const getAdmins = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await adminService.queryAdmin(filter, options);
  const response = Response(true, result, 'Success');
  res.status(httpStatus.OK).send(response);
});

const getAdmin = catchAsync(async (req, res) => {
  const admin = await adminService.getAdminById(req.params.adminId);
  if (!admin) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Admin not found');
  }
  const response = Response(true, admin, 'Success');
  res.status(httpStatus.OK).send(response);
});

const getAdminsOnly = catchAsync(async (req, res) => {
  const zoneId = await getZoneId(req);
  const AdminUserId = await getUserId(req);
  const result = await adminService.getAllAdminsOnly(zoneId,AdminUserId);
  const response = Response(true, result, 'Success');
  res.status(httpStatus.OK).send(response);
});

const getAdminByRole = catchAsync(async (req, res) => {
  const admin = await adminService.getAdminByRoleId(req.params.roleIds);
  if (!admin) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  const response = Response(true, admin, 'Success');
  res.status(httpStatus.OK).send(response);
});

const updatAdmin = catchAsync(async (req, res) => {
  const admin = await adminService.updateAdminById(req.params.adminId, req.body);
  const response = Response(true, admin, 'Success');
  res.status(httpStatus.OK).send(response);
});

const deleteAdmin = catchAsync(async (req, res) => {
  const admin = await adminService.deleteAdminById(req.params.adminId);
  const response = Response(true, admin, 'Success');
  res.status(httpStatus.OK).send(response);
});

const getDropDownListForAdmin = catchAsync(async (req, res) => {
  // const zoneId = await getZoneId(req);
  const user = await getUserById(req);
  const { zoneId } = req.params;

  const UserRoleIds = user.roleIds;

  const roles = await Role.find({ _id: { $in: UserRoleIds } })
    .select('role')
    .lean();

  const isSuperAdmin = roles.some((r) => !!(r.role === 'Superadmin' || r.role === 'Client'));

  const { clientId } = req.params;

  const data = await adminService.getDropDowns(clientId, zoneId, req, isSuperAdmin);

  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, 'data not found');
  }
  const response = Response(true, data, 'Success');
  res.status(httpStatus.OK).send(response);
});

const getDropDownList = catchAsync(async (req, res) => {
  const { clientId, zoneId } = req.params;

  const data = await adminService.getDropDowns(clientId, zoneId, req);

  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, 'data not found');
  }
  const response = Response(true, data, 'Success');
  res.status(httpStatus.OK).send(response);
});

module.exports = {
  createAdmin,
  getAdmins,
  getAdmin,
  getAdminByRole,
  updatAdmin,
  deleteAdmin,
  getDropDownList,
  getDropDownListForAdmin,
  getAdminsOnly,
};
