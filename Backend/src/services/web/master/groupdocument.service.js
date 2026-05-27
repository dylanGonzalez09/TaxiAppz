const httpStatus = require('http-status').default || require('http-status').status || require('http-status');
const ApiError = require('../../../utils/ApiError');
const { GroupDocument, Document } = require('../../../models');
const { ObjectId } = require('mongoose').Types;
const { HttpStatusCode } = require('axios');
const { ReturnDocument } = require('mongodb');

const isLockedDriverGroupDocument = (groupdocument) =>
  groupdocument &&
  String(groupdocument.name || '').trim().toLowerCase() === 'driver' &&
  String(groupdocument.type || '').trim().toLowerCase() === 'driver';

const findDuplicateGroupDocument = async ({ name, type, zoneId, clientId, excludeId = null }) => {
  const normalizedName = String(name || '').trim();
  const escapedName = normalizedName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  if (!normalizedName || !type || !zoneId || !clientId) return null;

  const query = {
    name: { $regex: new RegExp(`^${escapedName}$`, 'i') },
    type,
    zoneId,
    clientId,
  };

  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  return GroupDocument.findOne(query).select('_id');
};
/**
 * Create a groupdocument
 * @param {Object} groupdocumentBody
 * @returns {Promise<GroupDocument>}
 */
const createGroupDocument = async (groupdocumentBody) => {
  const duplicate = await findDuplicateGroupDocument({
    name: groupdocumentBody.name,
    type: groupdocumentBody.type,
    zoneId: groupdocumentBody.zoneId,
    clientId: groupdocumentBody.clientId,
  });

  if (duplicate) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Group document already exists for this zone');
  }

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
        as: 'zoneDetails',
      },
    },

    {
      $unwind: {
        path: '$zoneDetails',
        preserveNullAndEmptyArrays: true,
      },
    },

    {
      $project: {
        _id: 0,
        id: '$_id',
        name: 1,
        status: 1,
        zoneId: 1,
        createdAt: 1,
        type: 1,
        zoneName: '$zoneDetails.zoneName',
      },
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

const queryActiveGroupDocument = async (filter, options) => {
  const limit = parseInt(options.limit, 10) || 10;
  const page = parseInt(options.page, 10) || 1;
  options.sortBy = options.sortBy || 'createdAt:desc';
  filter.status = true ;

  const totalResults = await GroupDocument.countDocuments(filter);
  const groupDocuments = await GroupDocument.aggregate([
    { $match: filter },

    {
      $lookup: {
        from: 'zones',
        localField: 'zoneId',
        foreignField: '_id',
        as: 'zoneDetails',
      },
    },

    {
      $unwind: {
        path: '$zoneDetails',
        preserveNullAndEmptyArrays: true,
      },
    },

    {
      $project: {
        _id: 0,
        id: '$_id',
        name: 1,
        status: 1,
        zoneId: 1,
        createdAt: 1,
        type: 1,
        zoneName: '$zoneDetails.zoneName',
      },
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
const getGroupDocument = async (clientId, zoneId) => {
  return GroupDocument.find({ clientId, zoneId, status: true, type: 'driver' });
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

  if (isLockedDriverGroupDocument(groupdocument)) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Default Driver group document cannot be edited or status-changed');
  }

  const duplicate = await findDuplicateGroupDocument({
    name: updateBody.name ?? groupdocument.name,
    type: updateBody.type ?? groupdocument.type,
    zoneId: updateBody.zoneId ?? groupdocument.zoneId,
    clientId: groupdocument.clientId,
    excludeId: groupdocument._id,
  });

  if (duplicate) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Group document already exists for this zone');
  }

    if (groupDocumentId && typeof updateBody.status === 'boolean') {
    
      await Document.updateMany(
        { documentId:groupDocumentId },
        { $set: { status: updateBody.status } }
      );
    
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
    return { status: httpStatus.NOT_FOUND, msg: 'GroupDocument not found' };
  }

  if (isLockedDriverGroupDocument(groupdocument)) {
    return {
      status: httpStatus.FORBIDDEN,
      msg: 'Default Driver group document cannot be deleted',
    };
  }

  // chk whether any document available under this
  const documents = await Document.countDocuments({ documentId: new ObjectId(groupdocument._id) });
  if (documents > 0) {
    return {
      status: httpStatus.FORBIDDEN,
      msg: 'There are some documents under this group document.so you cannot delete it.',
    };
  }

  await groupdocument.deleteOne();
  return { status: HttpStatusCode.Ok, msg: 'data Deleted Successfully' };
};

module.exports = {
  createGroupDocument,
  queryGroupDocument,
  getGroupDocumentById,
  getGroupDocument,
  updateGroupDocumentById,
  deleteGroupDocumentById,
  queryActiveGroupDocument
};
