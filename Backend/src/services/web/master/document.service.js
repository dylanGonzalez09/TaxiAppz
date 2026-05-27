const httpStatus = require('http-status').default || require('http-status').status || require('http-status');
const ApiError = require('../../../utils/ApiError');
const { Document, GroupDocument,DriverDocument } = require('../../../models');
const ObjectId = require('mongoose').Types.ObjectId;
const { HttpStatusCode } = require('axios');
const mongoose = require('mongoose');

const isDefaultDriverProfileDocument = async (documentDoc) => {
  if (!documentDoc) return false;
  if (String(documentDoc.documentName || '').trim().toLowerCase() !== 'profile image') return false;

  const groupDocument = await GroupDocument.findById(documentDoc.documentId).select('name type').lean();
  if (!groupDocument) return false;

  return (
    String(groupDocument.name || '').trim().toLowerCase() === 'driver' &&
    String(groupDocument.type || '').trim().toLowerCase() === 'driver'
  );
};

const findDuplicateDocument = async ({ documentName, documentId, clientId, excludeId = null }) => {
  const normalizedName = String(documentName || '').trim();
  const escapedName = normalizedName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  if (!normalizedName || !documentId || !clientId) return null;

  const query = {
    documentName: { $regex: new RegExp(`^${escapedName}$`, 'i') },
    documentId,
    clientId,
  };

  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  return Document.findOne(query).select('_id');
};
/**
 * Create a groupdocument
 * @param {Object} documentBody
 * @returns {Promise<Document>}
 */
const createDocument = async (documentBody) => {
  const duplicate = await findDuplicateDocument({
    documentName: documentBody.documentName,
    documentId: documentBody.documentId,
    clientId: documentBody.clientId,
  });

  if (duplicate) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Document already exists in this group');
  }

  return Document.create(documentBody);
};


/**
 * Create multiple documents
 * @param {Array} documentsBody
 * @returns {Promise<Array<Document>>}
 */
const createBulkDocuments = async (documentsBody) => {
  for (const docBody of documentsBody) {
    const duplicate = await findDuplicateDocument({
      documentName: docBody.documentName,
      documentId: docBody.documentId,
      clientId: docBody.clientId,
    });

    if (duplicate) {
      throw new ApiError(httpStatus.BAD_REQUEST, `Document "${docBody.documentName}" already exists in this group`);
    }
  }

  return Document.insertMany(documentsBody);
};


/**
 * Query for document
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryDocument = async (filter, options, clientId, zoneId, typeFilter = null,groupDocumentId) => {
  const page = parseInt(options.page || 1);
  const limit = parseInt(options.limit || 10);
  const skip = (page - 1) * limit;

  if (groupDocumentId) {
   filter.documentId = new mongoose.Types.ObjectId(groupDocumentId);
  }
  const matchStage = {
    // status: true,
    clientId: new mongoose.Types.ObjectId(clientId),
    ...filter,
  };

  if (filter.documentName) {
    matchStage.documentName = { $regex: filter.documentName, $options: 'i' };
  }
  if (groupDocumentId && mongoose.Types.ObjectId.isValid(String(groupDocumentId))) {
    matchStage.documentId = new mongoose.Types.ObjectId(String(groupDocumentId));
  }

  

  const zoneObjectId = new mongoose.Types.ObjectId(zoneId);

  const pipeline = [
    { $match: matchStage },
    {
      $lookup: {
        from: 'groupdocuments',
        localField: 'documentId',
        foreignField: '_id',
        as: 'groupDocument',
      },
    },
    { $unwind: '$groupDocument' },
    {
      $match: {
        'groupDocument.zoneId': zoneObjectId,
        'groupDocument.status': true,
        ...(typeFilter ? { 'groupDocument.type': typeFilter } : {}),
      },
    },
    {
      $addFields: {
        type: '$groupDocument.type', // Add `type` field to root
      },
    },
    { $sort: { createdAt: -1 } },
    { $skip: skip },
    { $limit: limit },
  ];

  const docs = await Document.aggregate(pipeline);

  // Count pipeline (same filters, no skip/limit)
  const countPipeline = [
    { $match: matchStage },
    {
      $lookup: {
        from: 'groupdocuments',
        localField: 'documentId',
        foreignField: '_id',
        as: 'groupDocument',
      },
    },
    { $unwind: '$groupDocument' },
    {
      $match: {
        'groupDocument.zoneId': zoneObjectId,
        'groupDocument.status': true,
        ...(typeFilter ? { 'groupDocument.type': typeFilter } : {}),
      },
    },
    { $count: 'total' },
  ];

  const countResult = await Document.aggregate(countPipeline);
  const totalResults = countResult[0]?.total || 0;

  return {
    results: docs,
    page,
    limit,
    totalResults,
  };
};

/**
 * Get document
 * @param {ObjectId} clientId
 * @returns {Promise<Document>}
 */
const getDocument = async (clientId) => {
  return Document.find({clientId:clientId});
};


/**
 * Get groupDocument by id
 * @param {ObjectId} id
 * @returns {Promise<Document>}
 */
const getDocumentById = async (id) => {
  return Document.findById(id);
};


/**
 * Update Document by id
 * @param {ObjectId} documentId
 * @param {Object} updateBody
 * @returns {Promise<Document>}
 */
const updateDocumentById = async (documentId, updateBody) => {
  const document = await getDocumentById(documentId);
  if (!document) {
    throw new ApiError(httpStatus.NOT_FOUND, 'GroupDocument not found');
  }

  if (await isDefaultDriverProfileDocument(document)) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Default Driver profile image document cannot be modified');
  }

  const duplicate = await findDuplicateDocument({
    documentName: updateBody.documentName ?? document.documentName,
    documentId: updateBody.documentId ?? document.documentId,
    clientId: document.clientId,
    excludeId: document._id,
  });

  if (duplicate) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Document already exists in this group');
  }

  Object.assign(document, updateBody);
  await document.save();
  return document;
};

/**
 * Delete groupDocument by id
 * @param {ObjectId} documentId
 * @returns {Object}
 */
const deleteDocumentById = async (documentId) => {
  const document = await getDocumentById(documentId);
  if (!document) {
    return { status: httpStatus.NOT_FOUND, msg: "Document not found" };
  }

  if (await isDefaultDriverProfileDocument(document)) {
    return { status: httpStatus.FORBIDDEN, msg: 'Default Driver profile image document cannot be deleted' };
  }
  //chk whether this document exists in any driver
 
  const driverDocument = await DriverDocument.countDocuments({documentId: new ObjectId(document._id)});

  if(driverDocument > 0)
  {
    return { status: httpStatus.FORBIDDEN, msg: "Some drivers uploaded this document.so you cannot delete it." };
  }

  await Document.deleteOne({_id:documentId});
  return { status: HttpStatusCode.Ok,   msg:"data Deleted Successfully" };
};

/**
 * Get roles
  * @param {ObjectId} clientId
 * @returns {Promise<Role>}
 */
const getDropDowns = async (clientId) => {


  const groupDocument = await GroupDocument.find({status: true, clientId: clientId});

  const data = {
    
    Document: groupDocument
  }


  return data;
};

module.exports = {
  createDocument,
  createBulkDocuments,
  queryDocument,
  getDocumentById,
  getDocument,
  updateDocumentById,
  deleteDocumentById,
  getDropDowns
};
