const httpStatus = require('http-status');
const ApiError = require('../../../utils/ApiError');
const { ProjectVersion } = require('../../../models');

/**
 * Create a version
 * @param {Object} versionBody
 * @returns {Promise<ProjectVersion>}
 */
const createVersion = async (versionBody) => {
  return ProjectVersion.create(versionBody);
};

/**
 * Query for versions
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryVersions = async (filter, options) => {
  options.sortBy = options.sortBy || 'createdAt:desc';

  const projectVersions = await ProjectVersion.paginate(filter, options);
  return projectVersions;
};

/**
 * Get roles
 * @returns {Promise<ProjectVersion>}
 */
const getVersions = async () => {
  return ProjectVersion.find();
};


/**
 * Get version by versionId
 * @param {ObjectId} versionId
 * @returns {Promise<ProjectVersion>}
 */
const getVersionsById = async (versionId) => {
  return ProjectVersion.findById(versionId);
};

/**
 * Get version by versionId
 * @param {ObjectId} versionCode
 * @returns {Promise<ProjectVersion>}
 */
const getVersionsByCode = async (versionCode) => {
  return ProjectVersion.find({
    versionCode: versionCode,
    status: true
});
};



/**
 * Update version by versionId
 * @param {ObjectId} versionId
 * @param {Object} updateBody
 * @returns {Promise<ProjectVersion>}
 */
const updateVersionById = async (versionId, updateBody) => {
  const version = await getVersionsById(versionId);
  if (!version) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Version not found');
  }
  Object.assign(version, updateBody);
  await version.save();
  return version;
};

/**
 * Delete version by id
 * @param {ObjectId} versionId
 * @returns {Object}
 */
const deleteVersionById = async (versionId) => {
  const version = await getVersionsById(versionId);
  if (!version) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Version not found');
  }
  await version.deleteOne();
  return { status: "success",   msg:"data Deleted Successfully" };
};

module.exports = {
  createVersion,
  queryVersions,
  getVersionsById,
  getVersions,
  getVersionsByCode,
  updateVersionById,
  deleteVersionById,
};
