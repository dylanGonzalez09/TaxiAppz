const httpStatus = require('http-status').default || require('http-status').status || require('http-status');
const { ObjectId } = require('mongodb');
const pick = require('../../../utils/pick');
const ApiError = require('../../../utils/ApiError');
const catchAsync = require('../../../utils/catchAsync');
const { groupDocumentService } = require('../../../services');
const Response = require('../../../config/response');

const createGroupDocument = catchAsync(async (req, res) => {
  let clientId;

  if (!req.headers.clientid) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ClientID not found');
  } else {
    clientId = req.headers.clientid;
    req.body.clientId = clientId;
  }
  req.body.type = 'driver';
  const groupdocument = await groupDocumentService.createGroupDocument(req.body);
  const response = Response(true, groupdocument, 'Success');
  res.status(httpStatus.CREATED).send(response);
});

const getGroupDocuments = catchAsync(async (req, res) => {
  const clientId = req.headers.clientid;
  const zoneId = req.headers.zoneid;

  // Basic validation for presence
  if (!clientId || !zoneId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Missing clientId or zoneId in headers');
  }

  const filter = pick(req.query, ['name', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page'], { allowDiskUse: true });
  if (req.query.search) {
    filter.$or = [{ name: { $regex: req.query.search, $options: 'i' } }];
  }
  filter.zoneId = new ObjectId(zoneId);
  filter.type = 'driver';

  const result = await groupDocumentService.queryGroupDocument(filter, options, clientId, zoneId);
  const response = Response(true, result, 'Success');
  res.status(httpStatus.OK).send(response);
});

const getActiveGroupDocuments = catchAsync(async (req, res) => {
  const clientId = req.headers.clientid;
  const zoneId = req.headers.zoneid;

  // Basic validation for presence
  if (!clientId || !zoneId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Missing clientId or zoneId in headers');
  }

  const filter = pick(req.query, ['name', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page'], { allowDiskUse: true });
  if (req.query.search) {
    filter.$or = [{ name: { $regex: req.query.search, $options: 'i' } }];
  }
  filter.zoneId = new ObjectId(zoneId);

  const result = await groupDocumentService.queryActiveGroupDocument(filter, options, clientId, zoneId);
  const response = Response(true, result, 'Success');
  res.status(httpStatus.OK).send(response);
});

const getGroupDocument = catchAsync(async (req, res) => {
  const groupdocument = await groupDocumentService.getGroupDocumentById(req.params.groupDocumentId);
  if (!groupdocument) {
    throw new ApiError(httpStatus.NOT_FOUND, 'groupdocument not found');
  }
  const response = Response(true, groupdocument, 'Success');
  res.status(httpStatus.OK).send(response);
});

const getGroupDocumentWithOutPagination = catchAsync(async (req, res) => {
  if (!req.headers.clientid) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ClientID not found');
  }

  if (!req.headers.zoneid) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ZoneId not found');
  }

  const clientId = req.headers.clientid;
  const zoneId = req.headers.zoneid;

  const groupdocument = await groupDocumentService.getGroupDocument(clientId, zoneId);
  if (!groupdocument) {
    throw new ApiError(httpStatus.NOT_FOUND, 'groupdocument not found');
  }
  const response = Response(true, groupdocument, 'Success');
  res.status(httpStatus.OK).send(response);
});

const getGroupDocumentWithPagination = catchAsync(async (req, res) => {
  const clientId = req.headers.clientid;
  const zoneId = req.headers.zoneid;

  const filter = { clientId, zoneId };

  if (req.query.search) {
    filter.$or = [{ name: { $regex: `^${req.query.search}`, $options: 'i' } }];
  }

  const options = pick(req.query, ['sortBy', 'limit', 'page']);

  const result = await groupDocumentService.queryGroupDocuments(filter, options);

  const response = Response(true, result, 'Success');

  res.status(200).send(response);
});

const updateGroupDocument = catchAsync(async (req, res) => {
  req.body.type = 'driver';
  const groupdocument = await groupDocumentService.updateGroupDocumentById(req.params.groupDocumentId, req.body);
  const response = Response(true, groupdocument, 'Success');
  res.status(httpStatus.OK).send(response);
});

const deleteGroupDocument = catchAsync(async (req, res) => {
  const groupdocument = await groupDocumentService.deleteGroupDocumentById(req.params.groupDocumentId);
  const response = Response(true, groupdocument, 'Success');
  res.status(httpStatus.OK).send(response);
});

const updateGrouoDocumentStatus = catchAsync(async (req, res) => {
  const { groupDocumentId } = req.params;
  const { status } = req.body;

  const groupDocument = await groupDocumentService.updateGroupDocumentById(groupDocumentId, { status });

  if (!groupDocument) {
    throw new ApiError(httpStatus.NOT_FOUND, 'GroupDocument not found');
  }

  const response = Response(true, groupDocument, 'GroupDocument status updated successfully');
  res.status(httpStatus.OK).send(response);
});

module.exports = {
  createGroupDocument,
  getGroupDocuments,
  getGroupDocument,
  getGroupDocumentWithOutPagination,
  updateGroupDocument,
  deleteGroupDocument,
  updateGrouoDocumentStatus,
  getActiveGroupDocuments,
};
