const httpStatus = require('http-status');
const ApiError = require('../../../utils/ApiError');
const { Role, Country, Language,User } = require('../../../models');
const ObjectId = require('mongoose').Types.ObjectId;
const { HttpStatusCode } = require('axios');

/**
 * Create a role
 * @param {Object} roleBody
 * @returns {Promise<Role>}
 */
const createRole = async (roleBody) => {
  return Role.create(roleBody);
};

/**
 * Query for roles
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryRoles = async (filter, options) => {
  options.sortBy = options.sortBy || 'createdAt:desc';
  const roles = await Role.paginate(filter, options);
  return roles;
};


/**
 * Get roles
  * @param {ObjectId} clientId
 * @returns {Promise<Role>}
 */
const getRoles = async (clientId) => {
  return Role.find({ clientId: clientId });
};


/**
 * Get roles
  * @param {ObjectId} clientId
 * @returns {Promise<Role>}
 */
const getDropDownsRoles = async (clientId) => {

  const roleData = await Role.find({ clientId: clientId });

  const countryData = await Country.find({ clientId: clientId, status: true });

  const languageData = await Language.find({status: true, clientId: clientId});

  const data = {
    role: roleData,
    country: countryData,
    languageData: languageData
  }


  return data;
};

/**
 * Get roles
  * @param {ObjectId} clientId
 * @returns {Promise<Role>}
 */
const getSuperAdminRole = async () => {
  return Role.find();
};


/**
 * Get role by id
 * @param {ObjectId} id
 * @returns {Promise<Role>}
 */
const getRoleById = async (id) => {
  return Role.findById(id);
};


/**
 * Update role by id
 * @param {ObjectId} roleId
 * @param {Object} updateBody
 * @returns {Promise<Role>}
 */
const updateRoleById = async (roleId, updateBody) => {
  const role = await getRoleById(roleId);
  if (!role) {
    throw new ApiError(httpStatus.NOT_FOUND, 'role not found');
  }

  Object.assign(role, updateBody);
  await role.save();
  return role;
};

/**
 * Delete role by id
 * @param {ObjectId} roleId
 * @returns {Object}
 */
const deleteRoleById = async (roleId) => {
  const role = await getRoleById(roleId);
  if (!role) {
    return { status: httpStatus.NOT_FOUND, msg: "Role not found" };
  }

  //chk this role has any users
  const users = await User.countDocuments({roleIds:{$in: new ObjectId(role._id)}});
  if(users > 0)
  {
    return { status: httpStatus.FORBIDDEN, msg: "This role has been assigned to some users.so you cannot delete it." };
  }
  await role.deleteOne();
  return { status: HttpStatusCode.Ok, msg: "data Deleted Successfully" };
};

module.exports = {
  createRole,
  queryRoles,
  getRoleById,
  getRoles,
  getSuperAdminRole,
  updateRoleById,
  deleteRoleById,
  getDropDownsRoles
};
