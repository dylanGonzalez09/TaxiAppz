const httpStatus = require('http-status');
const ApiError = require('../../../utils/ApiError');
const { GroupDocument,Document } = require('../../../models');
const ObjectId = require('mongoose').Types.ObjectId;
const { HttpStatusCode } = require('axios');

/**
 * Create a groupdocument
 * @param {Object} groupdocumentBody
 * @returns {Promise<GroupDocument>}
 */
const createGroupDocument = async (groupdocumentBody) => {
  return GroupDocument.create(groupdocumentBody);
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
const queryGroupDocument = async (filter, options) => {
  const limit = parseInt(options.limit, 10) || 10;
  const page = parseInt(options.page, 10) || 1;
  options.sortBy = options.sortBy || 'createdAt:desc';

  const totalResults = await GroupDocument.countDocuments(filter);
  const groupDocuments = await GroupDocument.aggregate([
    { $match: filter },

    {
      $lookup: {
        from: 'zones',         
        localField: 'zoneId',  
        foreignField: '_id',   
        as: 'zoneDetails'   
      }
    },

    {
      $unwind: {
        path: '$zoneDetails',
        preserveNullAndEmptyArrays: true  
      }
    },

    {
      $project: {
        _id: 0,              
        id: '$_id',  
        name: 1,                
        status: 1,             
        zoneId: 1,              
        createdAt: 1,
        zoneName: '$zoneDetails.zoneName'
      }
    },
    {
      $sort: { createdAt: -1 }, // Sorting in descending order (latest first)
    },
    {
      $skip: (page - 1) * limit, // Pagination: Skip previous pages
    },
    {
      $limit: limit, // Limit number of results per page
    },
  
  ]);

  const totalPages = Math.ceil(totalResults / limit);

  return {
    results: groupDocuments,
    page,
    limit,
    totalPages,
    totalResults,
  };
};



/**
 * @param {ObjectId} clientId
 * @returns {Promise<GroupDocument>}
 */
const getGroupDocument = async (clientId) => {
  return GroupDocument.find({clientId:clientId});
};


/**
 * Get groupDocument by id
 * @param {ObjectId} id
 * @returns {Promise<GroupDocument>}
 */
const getGroupDocumentById = async (id) => {
  return GroupDocument.findById(id);
};


/**
 * Update role by id
 * @param {ObjectId} groupDocumentId
 * @param {Object} updateBody
 * @returns {Promise<GroupDocument>}
 */
const updateGroupDocumentById = async (groupDocumentId, updateBody) => {

  const groupdocument = await getGroupDocumentById(groupDocumentId);
  if (!groupdocument) {
    throw new ApiError(httpStatus.NOT_FOUND, 'GroupDocument not found');
  }
  const documents = await Document.countDocuments({documentId: new ObjectId(groupdocument._id)});
  if(documents > 0)
  {
    return { status: httpStatus.FORBIDDEN, msg: "There are some documents under this group document.so you cannot change it." };
  }
  Object.assign(groupdocument, updateBody);
  await groupdocument.save();
  return groupdocument;
};

/**
 * Delete groupDocument by id
 * @param {ObjectId} groupDocumentId
 * @returns {Object}
 */
const deleteGroupDocumentById = async (groupDocumentId) => {
  const groupdocument = await getGroupDocumentById(groupDocumentId);
  if (!groupdocument) {
    return { status: httpStatus.NOT_FOUND, msg: "GroupDocument not found" };
  }

  //chk whether any document available under this 
  const documents = await Document.countDocuments({documentId: new ObjectId(groupdocument._id)});
  if(documents > 0)
  {
    return { status: httpStatus.FORBIDDEN, msg: "There are some documents under this group document.so you cannot delete it." };
  }

  await groupdocument.deleteOne();
  return { status: HttpStatusCode.Ok,   msg:"data Deleted Successfully" };
};

module.exports = {
  createGroupDocument,
  queryGroupDocument,
  getGroupDocumentById,
  getGroupDocument,
  updateGroupDocumentById,
  deleteGroupDocumentById,
};
