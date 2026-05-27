const httpStatus = require('http-status').default || require('http-status').status || require('http-status');
const ApiError = require('../../../utils/ApiError');
const { Complaints, Language } = require('../../../models');
const { tokenService } = require('../..');
const { ObjectId } = require('mongoose').Types;
const fs = require('fs').promises;
const mongoose = require('mongoose');

const { getUserId, getClientId, getDriverId } = require('../../../utils/commonFunction');

/**
  from the mobile side they need to send Client Id and Code (Version code)
  1. Check the Version Available or not if not redirect to update screen
  2. check the avaliable languages for client send the avaliable languages
 */

/**
 * Create a wallet
 * @param {Object} req
 * @returns {Promise<Complaints>}
 */
const createComplaints = async (req) => {
  req.body.clientId = await getClientId(req);
  req.body.createdBy = await getUserId(req);

  return Complaints.create(req.body);
};

/**
 * Query for wallets
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {Object} req
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryComplaints = async (filter, options, req) => {
  // Get the clientId from request
  const clientId = await getClientId(req);

  // Add clientId to the filter
  if (clientId) {
    filter.clientId = clientId;
  }

  const complaint = await Complaints.paginate(filter, options);
  return complaint;
};

/**
 * Get wallets
 * @returns {Promise<Complaints>}
 */
const getComplaints = async (req) => {
  const { type } = req.body;
  const { zoneId } = req.body;

  const lag = req.headers['content-language'];

  if (!lag) {
    throw new ApiError(httpStatus.NOT_FOUND, 'language Not found');
  }

  const lang = await Language.findOne({ code: lag });

  const clientId = await getClientId(req);

  return Complaints.find({ clientId: new ObjectId(clientId), type, zoneId: new ObjectId(zoneId), language: lang._id });
};

/**
 * Get complaint types from JSON file
 * @returns {Promise<Array<{id: string, name: string}>>}
 */
const getComplaintType = async () => {
  const filePath = `json/complaint.json`;
  try {
    const jsonData = await fs.readFile(filePath, { encoding: 'utf8' });
    // Return the parsed JSON data
    return JSON.parse(jsonData);
  } catch (error) {
    console.error('Error reading or parsing JSON file:', error);
    throw error; // Rethrow the error to handle it further up the call stack
  }
};

/**
 * Get wallet by id
 * @param {ObjectId} id
 * @returns {Promise<Complaints>}
 */
const getComplaintsById = async (id) => {
  return Complaints.findById(id);
};

/**
 * Get wallets
 * @returns {Promise<Complaints>}
 */
const getSuggestionsList = async (req) => {
  const clientId = await getClientId(req);
  return Complaints.find({ clientId: new ObjectId(clientId), complaintType: '4' });
};

/**
 * Get wallets
 * @returns {Promise<Complaints>}
 */
const getComplaintList = async (req) => {
  const clientId = await getClientId(req);
  return Complaints.find({ clientId: new ObjectId(clientId), complaintType: ['1', '2', '3'] });
};

/**
 * Update Sos by id
 * @param {ObjectId} ComplaintId
 * @param {Object} updateBody
 * @returns {Promise<Complaints>}
 */
const updateComplaintsById = async (ComplaintId, updateBody) => {
  const complaint = await getComplaintsById(ComplaintId);
  if (!complaint) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Complaint not found');
  }

  Object.assign(complaint, updateBody);
  await complaint.save();
  return complaint;
};

/**
 * Delete sos by id
 * @param {ObjectId} ComplaintId
 * @returns {Object}
 */
const deleteComplaintsById = async (ComplaintId) => {
  const complaint = await getComplaintsById(ComplaintId);
  if (!complaint) {
    throw new ApiError(httpStatus.NOT_FOUND, 'complaint not found');
  }
  await complaint.deleteOne();
  return { status: 'success', msg: 'data Deleted Successfully' };
};

const getComplaintsByUser = async (userId) => {
  try {
    const complaints = await Complaints.aggregate([
      {
        $match: {
          createdBy: new ObjectId(userId), // Match complaints by userId
        },
      },
      {
        $lookup: {
          from: 'categories', // Join with 'Category' collection
          localField: 'category', // Reference field in 'Complaints'
          foreignField: '_id', // Match with '_id' in 'Category'
          as: 'categoryDetails', // Alias for the joined category data
        },
      },
      {
        $unwind: {
          path: '$categoryDetails', // Unwind the category array to get the category directly
          preserveNullAndEmptyArrays: true, // If no category exists, keep the complaint
        },
      },
      {
        $project: {
          _id: 1, // Include complaint's _id
          title: 1,
          type: 1,
          complaintType: 1,
          category: '$categoryDetails.category', // Get category name from categoryDetails
        },
      },
    ]);


    if (complaints.length === 0) {
      return []; // If no complaints found, return an empty array
    }


    return complaints;
  } catch (error) {
    throw new Error('Failed to fetch complaints');
  }
};

module.exports = {
  createComplaints,
  queryComplaints,
  getComplaintsById,
  getComplaints,
  updateComplaintsById,
  deleteComplaintsById,
  getSuggestionsList,
  getComplaintList,
  getComplaintType,
  getComplaintsByUser,
};
