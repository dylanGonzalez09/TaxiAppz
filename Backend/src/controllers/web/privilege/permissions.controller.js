const httpStatus = require('http-status').default || require('http-status').status || require('http-status');
const pick = require('../../../utils/pick');
const ApiError = require('../../../utils/ApiError');
const catchAsync = require('../../../utils/catchAsync');
const { permissionsService } = require('../../../services');
const Response = require('../../../config/response');

const createPermission = catchAsync(async (req, res) => {
  const permission = await permissionsService.createPermission(req.body);
  const response = Response(true, permission, 'Success');
  res.status(httpStatus.CREATED).send(response);
});

const getPermissions = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['groupName', 'permissionName', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page'], { allowDiskUse: true });
  if (req.query.search) {
    filter.$or = [
      { permissionName: { $regex: req.query.search, $options: 'i' } },
      { groupName: { $regex: req.query.search, $options: 'i' } },
    ];
  }
  const result = await permissionsService.queryPermission(filter, options);
  const response = Response(true, result, 'Success');
  res.status(httpStatus.OK).send(response);
});

const getPermission = catchAsync(async (req, res) => {
  const permission = await permissionsService.getPermissionById(req.params.permissionId);
  if (!permission) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Permission not found');
  }
  const response = Response(true, permission, 'Success');
  res.status(httpStatus.OK).send(response);
});

const getPermissionWithOutPagination = catchAsync(async (req, res) => {
  const permission = await permissionsService.getPermission();
  if (!permission) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Permission not found');
  }
  const response = Response(true, permission, 'Success');
  res.status(httpStatus.OK).send(response);
});

const updatePermission = catchAsync(async (req, res) => {
  const permission = await permissionsService.updatePermissionById(req.params.permissionId, req.body);
  const response = Response(true, permission, 'Success');
  res.status(httpStatus.OK).send(response);
});

const deletePermission = catchAsync(async (req, res) => {
  const permission = await permissionsService.deletePermissionById(req.params.permissionId);
  const response = Response(true, permission, 'Success');
  res.status(httpStatus.OK).send(response);
});

module.exports = {
  createPermission,
  getPermissions,
  getPermission,
  updatePermission,
  deletePermission,
  getPermissionWithOutPagination,
};
