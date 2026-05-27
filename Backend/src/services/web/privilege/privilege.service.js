const httpStatus = require('http-status').default || require('http-status').status || require('http-status');
const mongoose = require('mongoose'); // Import mongoose
const ApiError = require('../../../utils/ApiError');
const { Privillege } = require('../../../models');
const { Permission } = require('../../../models');
const { ObjectId } = require('mongoose').Types;

/**
 * Create a Privilege
 * @param {Object} privilegeBody
 * @returns {Promise<Privilege>}
 */
const createPrivillege = async (privilegeBody) => {
  return Privillege.create(privilegeBody);
};

/**
 * Query for privillege
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryPrivillege = async (filter, options) => {
  const privillege = await Privillege.paginate(filter, options);
  return privillege;
};

/**
 * Get privillege by id
 * @param {ObjectId} privillegeId
 * @returns {Promise<Privillege>}
 */
const getPrivillegeById = async (privilegeId) => {
  return Privillege.findById(privilegeId);
};

const getPrivillegeByGroupName = async (privilegeId, groupName, clientId) => {
  return Privillege.find({
    clientId,
    groupName,
    roleId: privilegeId,
  });
};

/**
 * Update privillege by id
 * @param {ObjectId} privillegeId
 * @param {Object} updateBody
 * @returns {Promise<Privillege>}
 */
const updatePrivillegeById = async (privillegeId, updateBody) => {
  const privillege = await getPrivillegeById(privillegeId);
  if (!privillege) {
    throw new ApiError(httpStatus.NOT_FOUND, 'privillege not found');
  }

  Object.assign(privillege, updateBody);
  await privillege.save();
  return privillege;
};

/**
 * Update privillege by id
 * @param {ObjectId} privillegeId
 * @param {Object} updateBody
 * @returns {Promise<Privillege>}
 */
const givePrivillegeById = async (privillegeId, updateBody) => {
  const privillege = await getPrivillegeByGroupName(privillegeId, updateBody.groupName, updateBody.clientId);

  if (!privillege || privillege.length === 0) {
    return Privillege.create(updateBody);
  } else {
    const privillege = await Privillege.findOneAndUpdate(
      { roleId: privillegeId, groupName: updateBody.groupName },
      updateBody,
      { returnDocument: 'after', upsert: true }, // Return the updated document, and create it if it does not exist
    );
    return privillege;
  }
};

/**
 * Delete privillege by id
 * @param {ObjectId} privillegeId
 * @returns {Object}
 */
const deletePrivillegeById = async (privillegeId) => {
  const privillege = await getPrivillegeById(privillegeId);
  if (!privillege) {
    throw new ApiError(httpStatus.NOT_FOUND, 'privillege not found');
  }
  await privillege.deleteOne();
  return { msg: 'data Deleted Successfully' };
};

/**
 * privillegeDetails
 * @param {ObjectId} clientId
 * @returns {Object}
 */
const getPrivilegesWithDetails = async (clientId) => {
  try {
    const result = await Privillege.aggregate([
      {
        $match: { clientId: new ObjectId(clientId) }, // Match by roleId
      },
      {
        $lookup: {
          from: 'permissions', // The collection to join
          localField: 'permissionIds', // Field from the input documents
          foreignField: '_id', // Field from the documents of the "from" collection
          as: 'permissions', // Output array field
        },
      },
      {
        $lookup: {
          from: 'roles', // The collection to join
          localField: 'roleId', // Field from the input documents
          foreignField: '_id', // Field from the documents of the "from" collection
          as: 'role', // Output array field
        },
      },
      {
        $unwind: '$role', // Unwind the role array (since it should be a single object)
      },
      {
        $project: {
          _id: 1,
          permissions: {
            $map: {
              input: '$permissions',
              as: 'permission',
              in: {
                _id: '$$permission._id',
                permissionName: '$$permission.permissionName',
                groupName: '$$permission.groupName',
              },
            },
          },
          role: {
            _id: '$role._id',
            role: '$role.role',
          },
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ]);

    return result;
  } catch (error) {
    console.error('Error in aggregation:', error);
    throw error;
  }
};

/**
 * privillegewithrole
 * @param {ObjectId} roleId
 * @param {ObjectId} clientId
 * @returns {Object}
 */
const getPrivilegesWithRole = async (roleId, clientId) => {
  try {
    // Fetch all permissions from Permission collection
    const allPermissions = await Permission.find({}, { _id: 1, groupName: 1 });

    // Convert to ObjectId
    const roleIdObj = new ObjectId(roleId);
    const clientIdObj = new ObjectId(clientId);

    // Fetch privileges for the roleId
    const result = await Privillege.aggregate([
      {
        $match: { roleId: roleIdObj, clientId: clientIdObj }, // Match by roleId
      },
      {
        $unwind: { path: '$permissionIds', preserveNullAndEmptyArrays: true }, // Unwind permissionIds array
      },
      {
        $lookup: {
          from: 'permissions', // Collection name of Permission model
          localField: 'permissionIds',
          foreignField: '_id',
          as: 'permissionDetails',
        },
      },
      {
        $unwind: { path: '$permissionDetails', preserveNullAndEmptyArrays: true }, // Unwind permissionDetails array
      },
      {
        $group: {
          _id: '$permissionDetails.groupName', // Group by groupName from Permission
          permissionIds: { $push: '$permissionIds' }, // Accumulate permissionIds
        },
      },
      {
        $project: {
          _id: 0,
          groupName: '$_id', // Rename _id to groupName
          permissionIds: 1,
        },
      },
    ]);

    // Create a map to collect all groupNames
    const groupedPermissions = {};

    // Initialize all groupNames with empty arrays
    allPermissions.forEach((permission) => {
      groupedPermissions[permission.groupName] = [];
    });

    // Populate the groupedPermissions with the result
    result.forEach(({ groupName, permissionIds }) => {
      if (groupName) {
        groupedPermissions[groupName] = permissionIds;
      }
    });

    return groupedPermissions;
  } catch (error) {
    console.error('Error in aggregation:', error);
    throw error;
  }
};

/**
 * privillegewithrole
 * @param {ObjectId} roleId
 * @param {ObjectId} clientId
 * @returns {Object}
 */
const getPrivilegesWithRoleName = async (roleId, clientId) => {
  try {
    // Fetch all permissions from the Permission collection
    const allPermissions = await Permission.find({}, { _id: 1, groupName: 1, name: 1 });

    // Fetch privileges for the roleId
    const result = await Privillege.aggregate([
      {
        $match: { roleId: new mongoose.Types.ObjectId(roleId), clientId: new mongoose.Types.ObjectId(clientId) }, // Match by roleId
      },
      {
        $unwind: { path: '$permissionIds', preserveNullAndEmptyArrays: true }, // Unwind permissionIds array
      },
      {
        $lookup: {
          from: 'permissions', // Collection name of Permission model
          localField: 'permissionIds',
          foreignField: '_id',
          as: 'permissionDetails',
        },
      },
      {
        $unwind: { path: '$permissionDetails', preserveNullAndEmptyArrays: true }, // Unwind permissionDetails array
      },
      {
        $group: {
          _id: '$permissionDetails.groupName', // Group by groupName from Permission
          permissions: { $push: '$permissionDetails.permissionName' }, // Accumulate permission names
        },
      },
      {
        $project: {
          _id: 0,
          groupName: '$_id', // Rename _id to groupName
          permissions: 1,
        },
      },
    ]);

    // Create a map to collect all groupNames
    const groupedPermissions = {};

    // Initialize all groupNames with empty arrays
    allPermissions.forEach((permission) => {
      groupedPermissions[permission.groupName] = [];
    });

    // Populate the groupedPermissions with the result
    result.forEach(({ groupName, permissions }) => {
      if (groupName) {
        groupedPermissions[groupName] = permissions;
      }
    });

    return {
      success: true,
      data: groupedPermissions,
      message: 'Success',
    };
  } catch (error) {
    console.error('Error in aggregation:', error);
    throw error;
  }
};

/**
 * privillegewithrole
 * @param {ObjectId} roleId
 * @param {ObjectId} clientId
 * @returns {Object}
 */
const getSuperAdminPrivilegesWithRoleName = async (roleId) => {
  try {
    // Fetch all permissions from the Permission collection
    const allPermissions = await Permission.find({}, { _id: 1, groupName: 1, name: 1 });

    // Fetch privileges for the roleId
    const result = await Privillege.aggregate([
      {
        $match: { roleId: new mongoose.Types.ObjectId(roleId) }, // Match by roleId
      },
      {
        $unwind: { path: '$permissionIds', preserveNullAndEmptyArrays: true }, // Unwind permissionIds array
      },
      {
        $lookup: {
          from: 'permissions', // Collection name of Permission model
          localField: 'permissionIds',
          foreignField: '_id',
          as: 'permissionDetails',
        },
      },
      {
        $unwind: { path: '$permissionDetails', preserveNullAndEmptyArrays: true }, // Unwind permissionDetails array
      },
      {
        $group: {
          _id: '$permissionDetails.groupName', // Group by groupName from Permission
          permissions: { $push: '$permissionDetails.permissionName' }, // Accumulate permission names
        },
      },
      {
        $project: {
          _id: 0,
          groupName: '$_id', // Rename _id to groupName
          permissions: 1,
        },
      },
    ]);

    // Create a map to collect all groupNames
    const groupedPermissions = {};

    // Initialize all groupNames with empty arrays
    allPermissions.forEach((permission) => {
      groupedPermissions[permission.groupName] = [];
    });

    // Populate the groupedPermissions with the result
    result.forEach(({ groupName, permissions }) => {
      if (groupName) {
        groupedPermissions[groupName] = permissions;
      }
    });

    return {
      success: true,
      data: groupedPermissions,
      message: 'Success',
    };
  } catch (error) {
    console.error('Error in aggregation:', error);
    throw error;
  }
};

const transformData = (roles, permissions) => {
  const result = {};
  // Initialize the result object with roles
  roles.forEach((role) => {
    result[role.role] = [];
  });

  // Populate permissions for each role
  permissions.forEach((permissionEntry) => {
    const roleName = permissionEntry.role.role;
    if (result[roleName]) {
      const permissionIds = permissionEntry.permissions.map((permission) => permission._id);
      result[roleName] = result[roleName].concat(permissionIds);
    }
  });

  return result;
};

module.exports = {
  createPrivillege,
  queryPrivillege,
  getPrivillegeById,
  updatePrivillegeById,
  deletePrivillegeById,
  getPrivilegesWithDetails,
  getPrivilegesWithRole,
  givePrivillegeById,
  getPrivilegesWithRoleName,
  getSuperAdminPrivilegesWithRoleName,
};
