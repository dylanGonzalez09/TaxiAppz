const httpStatus = require('http-status').default || require('http-status').status || require('http-status');
const ApiError = require('../../../utils/ApiError');
const { Permission } = require('../../../models');

/**
 * Create a PermissionManage
 * @param {Object} permissionBody
 * @returns {Promise<permissionBody>}
 */
const createPermission = async (permissionBody) => {
  return Permission.create(permissionBody);
};

/**
 * Query for permissions
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryPermission = async (filter, options) => {
  options.sortBy = options.sortBy || 'createdAt:desc';
  const roles = await Permission.paginate(filter, options);
  return roles;
};

/**
 * Get permission by id
 * @param {ObjectId} permissionId
 * @returns {Promise<PermissionManage>}
 */
const getPermissionById = async (permissionId) => {
  return Permission.findById(permissionId);
};

/**
 * Get permission
 * @returns {Promise<PermissionManage>}
 */
const getPermission = async () => {
  return Permission.find();
};

/**
 * Update role by id
 * @param {ObjectId} permissionId
 * @param {Object} updateBody
 * @returns {Promise<PermissionManage>}
 */
const updatePermissionById = async (permissionId, updateBody) => {
  const permissionManage = await getPermissionById(permissionId);
  if (!permissionManage) {
    throw new ApiError(httpStatus.NOT_FOUND, 'permissionManage not found');
  }

  Object.assign(permissionManage, updateBody);
  await permissionManage.save();
  return permissionManage;
};

/**
 * Delete role by id
 * @param {ObjectId} permissionId
 * @returns {Object}
 */
const deletePermissionById = async (permissionId) => {
  const permissionManage = await getPermissionById(permissionId);
  if (!permissionManage) {
    throw new ApiError(httpStatus.NOT_FOUND, 'permission not found');
  }
  await permissionManage.deleteOne();
  return { msg: 'data Deleted Successfully' };
};

module.exports = {
  createPermission,
  queryPermission,
  getPermission,
  getPermissionById,
  updatePermissionById,
  deletePermissionById,
};
