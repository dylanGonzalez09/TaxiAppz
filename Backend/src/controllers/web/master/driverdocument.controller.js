const httpStatus = require('http-status');
const ApiError = require('../../../utils/ApiError');
const catchAsync = require('../../../utils/catchAsync');
const { driverDocumentService } = require('../../../services');
const Response = require('../../../config/response');
const { documentModelUpload } = require('../../../middlewares/upload');
const path = require('path');
const fs = require('fs');


const createDriverDocument = catchAsync(async (req, res) => {

  if (!req.headers.clientid) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ClientID not found');
  }

  const clientId = req.headers.clientid;

  const { driverId, expiryDate, expriyReason, expriyStatus, identifier, issueDate, documentStatus, documentId, status } = req.body;

  documentModelUpload.single('documentImage')(req, res, async (err) => {

    const documentImage = req.file ? req.file.filename : null;

    const driverDocumentData = {
      driverId,
      documentImage,
      expiryDate,
      expriyReason,
      expriyStatus,
      identifier,
      issueDate,
      documentStatus,
      documentId,
      status,
      clientId
    };

    const newDriverDocument = await driverDocumentService.createDriverDocument(driverDocumentData);

    if (newDriverDocument.documentImage) {

      newDriverDocument.documentImage = `/uploads/documentImage/${newDriverDocument.documentImage}`;

    }
    const response = Response(true, newDriverDocument, "Driver Document created successfully");
    res.status(httpStatus.CREATED).send(response);
  });
});

const getDriverDocument = catchAsync(async (req, res) => {
  if (!req.headers.clientid) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ClientID not found');
  }


  const driverdocument = await driverDocumentService.getDriverDocument(req.params.driverId, req.headers.clientid);
  if (!driverdocument) {
    throw new ApiError(httpStatus.NOT_FOUND, 'driverdocument not found');
  }
  const response = Response(true, driverdocument, "Success");
  res.status(httpStatus.OK).send(response);
});

const getDriverDocumentByDriver = catchAsync(async (req, res) => {
  if (!req.headers.clientid) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ClientID not found');
  }

  const driverdocument = await driverDocumentService.getDriverDocumentByDriver(req.params.driverId, req.headers.clientid);
  if (!driverdocument) {
    throw new ApiError(httpStatus.NOT_FOUND, 'driverdocument not found');
  }
  const response = Response(true, driverdocument, "Success");
  res.status(httpStatus.OK).send(response);
});


const updateDriverDocument = catchAsync(async (req, res) => {

  const { driverDocumentId } = req.params;

  const { driverId, expiryDate, expriyReason, expriyStatus, identifier, issueDate, documentStatus, documentId, status, clientId } = req.body;



  documentModelUpload.single('documentImage')(req, res, async (err) => {

    const newDocumentImage = req.file ? req.file.filename : null;

    const existingDriverDocument = await driverDocumentService.getDriverDocumentById(driverDocumentId);

    if (!existingDriverDocument) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Driver Document not found');
    }

    const updateData = {
      driverId: driverId || existingDriverDocument.driverId,
      expiryDate: expiryDate || existingDriverDocument.expiryDate,
      expriyReason: expriyReason || existingDriverDocument.expriyReason,
      expriyStatus: expriyStatus !== undefined ? expriyStatus : existingDriverDocument.expriyStatus,
      identifier: identifier || existingDriverDocument.identifier,
      issueDate: issueDate || existingDriverDocument.issueDate,
      documentStatus: documentStatus || existingDriverDocument.documentStatus,
      documentId: documentId || existingDriverDocument.documentId,
      status: status !== undefined ? status : existingDriverDocument.status,
      clientId: clientId || existingDriverDocument.clientId,
    };

    if (newDocumentImage) {
      if (existingDriverDocument.documentImage) {
        const oldImagePath = path.join(__dirname, '../../uploads/documentImage/', existingDriverDocument.documentImage);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      updateData.documentImage = newDocumentImage;
    }

    const updatedDriverDocument = await driverDocumentService.update(req,driverDocumentId, updateData, { new: true });

    if (updatedDriverDocument.documentImage) {
      updatedDriverDocument.documentImage = `/uploads/documentImage/${updatedDriverDocument.documentImage}`;
    }

    const response = Response(true, updatedDriverDocument, "Driver Document updated successfully");
    res.status(httpStatus.OK).send(response);
  });
});


const updateDriverDocumentStatus = catchAsync(async (req, res) => {
  const driverDocumentId = req.params.driverDocumentId;
  const { documentStatus } = req.body;

  // Ensure documentStatus is allowed
  const allowedStatuses = ['NOTUPLOADED', 'WAITINGFORAPPROVAL', 'APPROVED', 'EXPIRED', 'DENIED'];
  if (!allowedStatuses.includes(documentStatus)) {
    throw new ApiError(httpStatus.BAD_REQUEST, `"${documentStatus}" is not allowed`);
  }

  const driverDocStatus = await driverDocumentService.update(req,driverDocumentId, { documentStatus });

  if (!driverDocStatus) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Driver document not found');
  }

  const response = Response(true, driverDocStatus, "Driver document status updated successfully");
  res.status(httpStatus.OK).send(response);
});


const getExpiredDocuments = catchAsync(async (req, res) => {
  
  let expiredDocuments;
  if (!req.headers.clientid) {
    expiredDocuments = await driverDocumentService.getSuperAdminExpiredDocuments(req);
  }else{
    expiredDocuments = await driverDocumentService.getExpiredDocuments(req);
  }

  if (!expiredDocuments) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No expired documents found');
  }

  const response = Response(true, expiredDocuments, 'Expired documents fetched successfully');
  res.status(httpStatus.OK).send(response);
});



module.exports = {
  createDriverDocument,
  getDriverDocument,
  updateDriverDocument,
  updateDriverDocumentStatus,
  getExpiredDocuments,
  getDriverDocumentByDriver
};
