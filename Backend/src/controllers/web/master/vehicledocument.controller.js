const httpStatus = require('http-status').default || require('http-status').status || require('http-status');
const path = require('path');
const fs = require('fs');
const ApiError = require('../../../utils/ApiError');
const catchAsync = require('../../../utils/catchAsync');
const { vehicleDocumentService } = require('../../../services');
const Response = require('../../../config/response');
const { documentModelUpload } = require('../../../middlewares/upload');

const createVehicleDocument = catchAsync(async (req, res) => {
  if (!req.headers.clientid) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ClientID not found');
  }
  const clientId = req.headers.clientid;

  const { vehicleId, expiryDate, expiryReason, expiryStatus, identifier, issueDate, documentStatus, documentId, status } =
    req.body;

  documentModelUpload.single('documentImage')(req, res, async (err) => {
    const documentImage = req.file ? req.file.filename : null;

    const vehicleDocumentData = {
      vehicleId,
      documentImage,
      expiryDate,
      expiryReason,
      expiryStatus,
      identifier,
      issueDate,
      documentStatus,
      documentId,
      status,
      clientId,
    };

    const newVehicleDocument = await vehicleDocumentService.createVehicleDocument(vehicleDocumentData);

    if (newVehicleDocument.documentImage) {
      newVehicleDocument.documentImage = `/uploads/documentImage/${newVehicleDocument.documentImage}`;
    }
    const response = Response(true, newVehicleDocument, 'Vehicle Document created successfully');
    res.status(httpStatus.CREATED).send(response);
  });
});

const getVehicleDocument = catchAsync(async (req, res) => {
  if (!req.headers.clientid) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ClientID not found');
  }
  const vehicleDocument = await vehicleDocumentService.getVehicleDocument(req.params.vehicleId, req.headers.clientid);
  if (!vehicleDocument) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Vehicle document not found');
  }
  const response = Response(true, vehicleDocument, 'Success');
  res.status(httpStatus.OK).send(response);
});

const updateVehicleDocument = catchAsync(async (req, res) => {
  const { vehicleDocumentId } = req.params;

  documentModelUpload.single('documentImage')(req, res, async (err) => {
    const newDocumentImage = req.file ? req.file.filename : null;
    const updateData = { ...req.body };

    // ⬇️ Always fetch document and vehicle
    const existingVehicleDocument = await vehicleDocumentService.getVehicleDocumentById(vehicleDocumentId);

    if (!existingVehicleDocument) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Vehicle Document not found');
    }

    // ⬇️ Only handle file replacement if there's a new image
    if (newDocumentImage) {
      if (existingVehicleDocument.documentImage) {
        const oldImagePath = path.join(__dirname, '../../../uploads/documentImage/', existingVehicleDocument.documentImage);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      updateData.documentImage = newDocumentImage;
    }

    updateData.documentStatus = 'WAITINGFORAPPROVAL';

    const updatedVehicleDocument = await vehicleDocumentService.update(vehicleDocumentId, updateData);

    if (updatedVehicleDocument.documentImage) {
      updatedVehicleDocument.documentImage = `/uploads/documentImage/${updatedVehicleDocument.documentImage}`;
    }

    const response = Response(true, updatedVehicleDocument, 'Vehicle Document updated successfully');
    res.status(httpStatus.OK).send(response);
  });
});

const updateVehicleDocumentStatus = catchAsync(async (req, res) => {
  const { vehicleDocumentId } = req.params;
  const { documentStatus } = req.body;
  const allowedStatuses = ['NOTUPLOADED', 'WAITINGFORAPPROVAL', 'APPROVED', 'EXPIRED', 'DENIED'];

  if (!allowedStatuses.includes(documentStatus)) {
    throw new ApiError(httpStatus.BAD_REQUEST, `"${documentStatus}" is not allowed`);
  }

  const updated = await vehicleDocumentService.update(vehicleDocumentId, { documentStatus });
  if (!updated) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Vehicle document not found');
  }
  const response = Response(true, updated, 'Vehicle document status updated successfully');
  res.status(httpStatus.OK).send(response);
});

const getExpiredDocuments = catchAsync(async (req, res) => {
  const { vehicleId } = req.params;
  const result = await vehicleDocumentService.getExpiredDocuments(vehicleId, req.headers.clientid);
  res.status(httpStatus.OK).send(Response(true, result, 'Expired documents fetched successfully'));
});

module.exports = {
  createVehicleDocument,
  getVehicleDocument,
  updateVehicleDocument,
  updateVehicleDocumentStatus,
  getExpiredDocuments,
};
