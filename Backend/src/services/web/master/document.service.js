const httpStatus = require('http-status');
const ApiError = require('../../../utils/ApiError');
const { Document, GroupDocument,DriverDocument } = require('../../../models');
const ObjectId = require('mongoose').Types.ObjectId;
const { HttpStatusCode } = require('axios');

/**
 * Create a groupdocument
 * @param {Object} documentBody
 * @returns {Promise<Document>}
 */
const createDocument = async (documentBody) => {
  return Document.create(documentBody);
};


/**
 * Create multiple documents
 * @param {Array} documentsBody
 * @returns {Promise<Array<Document>>}
 */
const createBulkDocuments = async (documentsBody) => {
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
const queryDocument = async (filter, options) => {
  options.sortBy = options.sortBy || 'createdAt:desc';

  const document = await Document.paginate(filter, options);

  return document;
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
 const driverDocument = await DriverDocument.countDocuments({documentId: new ObjectId(document._id)});

  if(driverDocument > 0)
  {
    return { status: httpStatus.FORBIDDEN, msg: "Some drivers uploaded this document.so you cannot change it." };
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
