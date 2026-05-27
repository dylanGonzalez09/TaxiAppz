const httpStatus = require('http-status').default || require('http-status').status || require('http-status');
const ApiError = require('../../utils/ApiError');
const { Complaints } = require('../../models');
const { ObjectId } = require('mongoose').Types;

/**
 * Create a complaints
 * @param {Object} complaintsBody
 * @returns {Promise<Complaints>}
 */
const createComplaints = async (complaintsBody) => {
  return Complaints.create(complaintsBody);
};

/**
 * Query for complaintss
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryComplaints = async (req, filter, options) => {
  filter.clientId = new ObjectId(req.headers.clientid);
  filter.zoneId = new ObjectId(req.headers.zoneid);
  options.sortBy = options.sortBy || 'createdAt:desc';
  const complaints = await Complaints.paginate(filter, options);

  return complaints;
};

/**
 * Get roles
 * @returns {Promise<Complaints>}
 */
const getComplaintss = async () => {
  return Complaints.find();
};

/**
 * Get complaints by complaintsId
 * @param {ObjectId} complaintsId
 * @returns {Promise<Complaints>}
 */
const getComplaintsById = async (complaintsId) => {
  return Complaints.findById(complaintsId);
};

/**
 * Update complaints by complaintsId
 * @param {ObjectId} complaintsId
 * @param {Object} updateBody
 * @returns {Promise<Complaints>}
 */
const updateComplaintsById = async (complaintsId, updateBody) => {
  const complaints = await getComplaintsById(complaintsId);
  if (!complaints) {
    throw new ApiError(httpStatus.NOT_FOUND, 'complaints not found');
  }
  Object.assign(complaints, updateBody);
  await complaints.save();
  return complaints;
};

/**
 * Delete complaints by id
 * @param {ObjectId} complaintsId
 * @returns {Object}
 */
const deleteComplaintsById = async (complaintsId) => {
  const complaints = await getComplaintsById(complaintsId);
  if (!complaints) {
    throw new ApiError(httpStatus.NOT_FOUND, 'complaints not found');
  }
  await complaints.deleteOne();
  return { status: 'success', msg: 'data Deleted Successfully' };
};
const getComplaintsByLanguage = async (req, filter, options) => {
  const { langId } = req.params;
  filter.clientId = new ObjectId(req.headers.clientid);
  filter.zoneId = new ObjectId(req.headers.zoneid);
  filter.language = new ObjectId(langId);

  const complaint = await Complaints.paginate(filter, options);
  options.sortBy = options.sortBy || 'createdAt:desc';

  return complaint;
};
module.exports = {
  createComplaints,
  queryComplaints,
  getComplaintsById,
  getComplaintss,

  updateComplaintsById,
  deleteComplaintsById,
  getComplaintsByLanguage,
};
