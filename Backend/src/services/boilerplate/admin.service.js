const httpStatus = require('http-status').default || require('http-status').status || require('http-status');
const { Users, Role, Country, Language, Zone } = require('../../models');
const ApiError = require('../../utils/ApiError');
const { ObjectId } = require('mongoose').Types;

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
  return Users.find({ roleIds: { $in: roleIds } });
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
  return { msg: 'data Deleted Successfully' };
};

/**
 * Get roles
 * @param {ObjectId} clientId
 * @returns {Promise<Role>}
 */

const getDropDowns = async (clientId, zoneId, req, isSuperAdmin) => {
  const filterLanguageIds = [];
  const filterCountryIds = [];
  const filterZoneIds = [];

  const roleData = await Role.find({ clientId });

  const countryData = await Country.find({
    clientId,
    status: true,
    ...(filterCountryIds.length > 0 && { _id: { $in: filterCountryIds } }),
  });

  const languageData = await Language.find({
    clientId,
    status: true,
    ...(filterLanguageIds.length > 0 && { _id: { $in: filterLanguageIds } }),
  }).sort({createdAt:1});

  if (isSuperAdmin) {
    primaryZoneData = await Zone.find({
      clientId: new ObjectId(clientId),
      zoneLevel: 'PRIMARY',
      ...(filterZoneIds.length > 0 && { _id: { $in: filterZoneIds.map((id) => new ObjectId(id)) } }),
    }).select('id zoneName');
  } else {
    primaryZoneData = await Zone.find({
      clientId: new ObjectId(clientId),
      zoneLevel: 'PRIMARY',
      ...(zoneId ? { _id: new ObjectId(zoneId) } : {}),
      ...(filterZoneIds.length > 0 && { _id: { $in: filterZoneIds.map((id) => new ObjectId(id)) } }),
    }).select('id zoneName');
  }

  const data = {
    role: roleData,
    country: countryData,
    language: languageData,
    primaryZone: primaryZoneData,
  };

  return data;
};


const getAllAdminsOnly = async (zoneId, AdminUserId) => {
  return Users.aggregate([
    {
      $lookup: {
        from: 'roles',
        localField: 'roleIds',
        foreignField: '_id',
        as: 'roles',
      },
    },
    { $unwind: '$roles' },
    {
      $match: {
        $or: [
          { 'roles.role': { $in: ['Client'] } },
          { 'roles.role': { $in: ['Admin'] }, zoneId: new ObjectId(zoneId) },
        ],
      },
    },
    {
      $project: {
        _id: 1,
        fullName: {
          $concat: [
            {
              $cond: {
                if: {
                  $and: [
                    { $in: ['$roles.role', ['Client']] },
                    { $eq: ['$_id', new ObjectId(AdminUserId)] },
                  ],
                },
                then: '[me] ',
                else: '',
              },
            },
            '$firstName',
            ' ',
            '$lastName',
          ],
        },
        email: 1,
        phoneNumber: 1,
      },
    },
  ]);
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
  getDropDowns,
  getAllAdminsOnly,
};
