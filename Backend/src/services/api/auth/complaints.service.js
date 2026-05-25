const httpStatus = require('http-status');
const ApiError = require('../../../utils/ApiError');
const { Complaints } = require('../../../models');
const { tokenService } = require('../../../services');
const ObjectId = require('mongoose').Types.ObjectId
const fs = require('fs').promises;
const mongoose = require('mongoose');

/**
  from the mobile side they need to send Client Id and Code (Version code)
  1. Check the Version Available or not if not redirect to update screen 
  2. check the avaliable languages for client send the avaliable languages 
 */
const getClientId = async (req) => {
  clientId = '';
  if (!req.headers.clientid) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ClientID not found');
  } else {
    clientId = req.headers.clientid;
  }
  return clientId;
}



const getUserId = async (req) => {

  let userId = '';

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(httpStatus.UNAUTHORIZED).send({ message: 'Authorization header is missing or invalid' });
    return;
  }
  // Remove the 'Bearer ' prefix and get the token
  const token = authHeader.substring(7);

  const user = await tokenService.verifyTokenAndGetUser(token);

  userId = user.id

  return userId;
}



/**
 * Create a wallet
 * @param {Object} req
 * @returns {Promise<Complaints>}
 */
const createComplaints = async (req) => {

  req.body.clientId = await getClientId(req);
  req.body.createdBy = await getUserId(req)

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
const queryComplaints = async (filter, options,req) => {
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
  let clientId = await getClientId(req);
  return Complaints.find({clientId:new ObjectId(clientId)});
};


/**
 * Get complaint types from JSON file
 * @returns {Promise<Array<{id: string, name: string}>>}
 */
const getComplaintType = async () => {
    const filePath = `src/json/complaint.json`;
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
    let clientId = await getClientId(req);
    return Complaints.find({clientId:new ObjectId(clientId),complaintType:'4'});
  };


  /**
 * Get wallets
 * @returns {Promise<Complaints>}
 */
const getComplaintList = async (req) => {
    let clientId = await getClientId(req);
    return Complaints.find({clientId:new ObjectId(clientId),complaintType:['1','2','3']});
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
  return { status: "success", msg: "data Deleted Successfully" };
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
          type:1,
          complaintType:1,
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
  getComplaintsByUser
};
