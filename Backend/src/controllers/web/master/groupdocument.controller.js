 const httpStatus = require('http-status');
const pick = require('../../../utils/pick');
const ApiError = require('../../../utils/ApiError');
const catchAsync = require('../../../utils/catchAsync');
const { groupDocumentService } = require('../../../services');
const Response = require('../../../config/response');

const createGroupDocument = catchAsync(async (req, res) => {
  let clientId;

  if (!req.headers.clientid) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ClientID not found');
  }else{
    clientId = req.headers.clientid;
    req.body.clientId = clientId;
  }
  const groupdocument = await groupDocumentService.createGroupDocument(req.body);
  const response = Response(true, groupdocument, "Success");
  res.status(httpStatus.CREATED).send(response);
});

const getGroupDocuments = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page'],{ allowDiskUse: true });
  if (req.query.search) {
    filter.$or = [
      { name: { $regex: req.query.search, $options: 'i' } },
    ];
  }
  const result = await groupDocumentService.queryGroupDocument(filter, options);
  const response = Response(true, result, "Success");
  res.status(httpStatus.OK).send(response);
});

const getGroupDocument = catchAsync(async (req, res) => {
  const groupdocument = await groupDocumentService.getGroupDocumentById(req.params.groupDocumentId);
  if (!groupdocument) {
    throw new ApiError(httpStatus.NOT_FOUND, 'groupdocument not found');
  }
  const response = Response(true, groupdocument, "Success");
  res.status(httpStatus.OK).send(response);
});

const getGroupDocumentWithOutPagination = catchAsync(async (req, res) => {
  if (!req.headers.clientid) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ClientID not found');
  }
  const groupdocument = await groupDocumentService.getGroupDocument(req.headers.clientid);
  if (!groupdocument) {
    throw new ApiError(httpStatus.NOT_FOUND, 'groupdocument not found');
  }
  const response = Response(true, groupdocument, "Success");
  res.status(httpStatus.OK).send(response);
});

const updateGroupDocument = catchAsync(async (req, res) => {
  const groupdocument = await groupDocumentService.updateGroupDocumentById(req.params.groupDocumentId, req.body);
  const response = Response(true, groupdocument, "Success");
  res.status(httpStatus.OK).send(response);
});

const deleteGroupDocument = catchAsync(async (req, res) => {
  const groupdocument = await groupDocumentService.deleteGroupDocumentById(req.params.groupDocumentId);
  const response = Response(true, groupdocument, "Success");
  res.status(httpStatus.OK).send(response);
});

const updateGrouoDocumentStatus = catchAsync(async (req, res) => {
  const groupDocumentId = req.params.groupDocumentId;
  const { status } = req.body;

  const groupDocument = await groupDocumentService.updateGroupDocumentById(groupDocumentId, { status });

  if (!groupDocument) {
    throw new ApiError(httpStatus.NOT_FOUND, 'GroupDocument not found');
  }

  const response = Response(true, groupDocument, "GroupDocument status updated successfully");
  res.status(httpStatus.OK).send(response);
});


module.exports = {
  createGroupDocument,
  getGroupDocuments,
  getGroupDocument,
  getGroupDocumentWithOutPagination,
  updateGroupDocument,
  deleteGroupDocument,
  updateGrouoDocumentStatus
};
