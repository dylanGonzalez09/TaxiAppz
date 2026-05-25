const httpStatus = require('http-status');
const { Users,Role,Country,Language,Zone } = require('../../models');
const ApiError = require('../../utils/ApiError');

/**
 * Create a admin
 * @param {Object} adminBody
 * @returns {Promise<Users>}
 */
const createAdmin = async (adminBody) => {
  if (await Users.isEmailTaken(adminBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  return Users.create(adminBody);
};

/**
 * Query for admins
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryAdmin = async (filter, options) => {
  const users = await Users.paginate(filter, options);
  return users;
};

/**
 * Get all users with role 'admin'
 * @returns {Promise<Array>}
 */
const getAllAdmin = async () => {
  return Users.find({ role: 'admin' }).select('name'); // Fetch only relevant fields
};

/**
 * Get admin by id
 * @param {ObjectId} id
 * @returns {Promise<Users>}
 */
const getAdminById = async (id) => {
  return Users.findById(id);
};

/**
 * Get admin by email
 * @param {string} email
 * @returns {Promise<Users>}
 */
const getAdminByEmail = async (email) => {
  return Users.findOne({ email });
};


/**
 * Post admin by RoleId
 * @param {ObjectId} roleIds
 * @returns {Promise<Users>}
 */
const getAdminByRoleId = async (roleIds) => {
  return Users.find({ 'roleIds': { $in: roleIds } });
};


/**
 * Update admin by id
 * @param {ObjectId} adminId
 * @param {Object} updateBody
 * @returns {Promise<Users>}
 */
const updateAdminById = async (adminId, updateBody) => {
  const user = await getAdminById(adminId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Admin not found');
  }
  if (updateBody.email && (await Users.isEmailTaken(updateBody.email, adminId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  Object.assign(user, updateBody);
  await user.save();
  return user;
};

/**
 * Delete admin by id
 * @param {ObjectId} adminId
 * @returns {Promise<Users>}
 */
const deleteAdminById = async (adminId) => {
  const user = await getAdminById(adminId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Admin not found');
  }
  await user.deleteOne();
  return {msg:"data Deleted Successfully" };
};

/**
 * Get roles
  * @param {ObjectId} clientId
 * @returns {Promise<Role>}
 */
const getDropDowns = async (clientId) => {

  const roleData = await Role.find({ clientId: clientId });

  const countryData = await Country.find({ clientId: clientId, status: true });

  const languageData = await Language.find({status: true, clientId: clientId});

  const primaryZoneData = await Zone.find({status: true,clientId: clientId,zoneLevel:'PRIMARY'}).select('id zoneName');

  const data = {
    role: roleData,
    country: countryData,
    language: languageData,
    primaryZone: primaryZoneData
  }

  return data;
};

module.exports = {
  createAdmin,
  getAllAdmin,
  queryAdmin,
  getAdminById,
  getAdminByRoleId,
  getAdminByEmail,
  updateAdminById,
  deleteAdminById,
  getDropDowns
};
