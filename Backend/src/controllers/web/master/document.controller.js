const httpStatus = require('http-status');
const pick = require('../../../utils/pick');
const ApiError = require('../../../utils/ApiError');
const catchAsync = require('../../../utils/catchAsync');
const { documentService } = require('../../../services');
const Response = require('../../../config/response');

const createDocument = catchAsync(async (req, res) => {
  let clientId;

  if (!req.headers.clientid) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ClientID not found');
  }else{
    clientId = req.headers.clientid;
    req.body.clientId = clientId;
  }
  const document = await documentService.createDocument(req.body);
  const response = Response(true, document, "Success");
  res.status(httpStatus.CREATED).send(response);
});

const createBulkDocument = catchAsync(async (req, res) => {
  // Extract clientId from request headers
  const clientId = req.headers.clientid;

  if (!clientId) {
    // If clientId is not found, throw an error
    throw new ApiError(httpStatus.NOT_FOUND, 'ClientID not found');
  }

  // Check if newDocument is an array and is not empty
  if (!Array.isArray(req.body.newDocument) || req.body.newDocument.length === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid or empty document data');
  }

  // Add clientId to each document in the bulk
  const documentsWithClientId = req.body.newDocument.map(document => ({
    ...document,
    clientId
  }));

  // Call the service method to create documents
  const document = await documentService.createBulkDocuments(documentsWithClientId);
  const response = Response(true, document, "Success");
  res.status(httpStatus.CREATED).send(response);
});

const getDocuments = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['documentName', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page'],{ allowDiskUse: true });
  if (req.query.search) {
    filter.$or = [
      { documentName: { $regex: req.query.search, $options: 'i' } },
    ];
  } 
  const result = await documentService.queryDocument(filter, options);
  const response = Response(true, result, "Success");
  res.status(httpStatus.OK).send(response);
});

const getDocument = catchAsync(async (req, res) => {
  const groupdocument = await documentService.getDocumentById(req.params.documentId);
  if (!groupdocument) {
    throw new ApiError(httpStatus.NOT_FOUND, 'groupdocument not found');
  }
  const response = Response(true, groupdocument, "Success");
  res.status(httpStatus.OK).send(response);
});

const getDocumentWithOutPagination = catchAsync(async (req, res) => {

  if (!req.headers.clientid) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ClientID not found');
  }

  const groupdocument = await documentService.getDocument(req.headers.clientid);
  if (!groupdocument) {
    throw new ApiError(httpStatus.NOT_FOUND, 'groupdocument not found');
  }
  const response = Response(true, groupdocument, "Success");
  res.status(httpStatus.OK).send(response);
});

const updateDocument = catchAsync(async (req, res) => {
  const groupdocument = await documentService.updateDocumentById(req.params.documentId, req.body);
  const response = Response(true, groupdocument, "Success");
  res.status(httpStatus.OK).send(response);
});

const deleteDocument = catchAsync(async (req, res) => {
  const groupdocument = await documentService.deleteDocumentById(req.params.documentId);
  const response = Response(true, groupdocument, "Success");
  res.status(httpStatus.OK).send(response);
});

const updateDocumentStatus = catchAsync(async (req, res) => {
  const documentId = req.params.documentId;
  const { status } = req.body;

  const document = await documentService.updateDocumentById(documentId, { status });

  if (!document) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Document not found');
  }

  const response = Response(true, document, "Document status updated successfully");
  res.status(httpStatus.OK).send(response);
});

const getDropDownList = catchAsync(async (req, res) => {
  let data = await documentService.getDropDowns(req.params.clientId);
  
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, 'data not found');
  }
  const response = Response(true, data, "Success");
  res.status(httpStatus.OK).send(response);
});

module.exports = {
  createDocument,
  getDocuments,
  getDocument,
  getDocumentWithOutPagination,
  updateDocument,
  deleteDocument,
  createBulkDocument,
  updateDocumentStatus,
  getDropDownList
};
