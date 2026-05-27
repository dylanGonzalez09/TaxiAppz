const httpStatus = require('http-status');
const path = require('path');
const ApiError = require('../../../utils/ApiError');
const catchAsync = require('../../../utils/catchAsync');
const Response = require('../../../config/response');
const { mobileDriverDocumentService, tokenService } = require('../../../services');
const Driver = require('../../../models/boilerplate/driver.model');
const { sendClientNotification } = require('../../../utils/commonFunction');

/**
 * Web Driver Document Controller
 * Document upload for web driver - clientId from driver's zone
 */

const getDriverIdFromToken = async (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Authorization header is missing or invalid');
  }
  const token = authHeader.substring(7);
  const user = await tokenService.verifyTokenAndGetUser(token);
  const driver = await Driver.findOne({ userId: user.id });
  if (!driver) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Driver not found');
  }
  return driver._id;
};

const getClientIdFromDriver = async (driverId) => {
  const driver = await Driver.findById(driverId).select('serviceLocation').lean();
  if (!driver) throw new ApiError(httpStatus.NOT_FOUND, 'Driver not found');
  const Zone = require('../../../models/zone/zone.model');
  const zone = await Zone.findById(driver.serviceLocation);
  if (!zone || !zone.clientId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Driver zone has no client configured');
  }
  return zone.clientId.toString();
};

/**
 * Upload driver document (web - clientId from driver's zone)
 * POST /v1/web/driver/document/upload
 */
const uploadWebDriverDocument = catchAsync(async (req, res) => {
  const driverId = await getDriverIdFromToken(req);
  const clientId = await getClientIdFromDriver(driverId);
  const documentStatus = 'WAITINGFORAPPROVAL';
  const { expiryDate, identifier, issueDate, documentId, driverVehicleId } = req.body;

  // req.file is set by multer in the route - do NOT call multer again (body already consumed)
  const documentImage = req.file ? req.file.filename : null;

  const existingDocument = await mobileDriverDocumentService.findDriverDocument({
    driverId,
    documentId,
    clientId,
    driverVehicleId: driverVehicleId || null,
  });

  const driverDocumentData = {
    driverId,
    expiryDate: expiryDate || null,
    documentStatus,
    identifier: identifier || null,
    issueDate: issueDate || null,
    documentId,
    clientId,
    driverVehicleId: driverVehicleId || null,
  };
  if (documentImage) {
    driverDocumentData.documentImage = documentImage;
  }

  let updatedOrNewDocument;
  if (existingDocument) {
    const updateData = { ...driverDocumentData };
    if (!documentImage) {
      delete updateData.documentImage;
    }
    updatedOrNewDocument = await mobileDriverDocumentService.updateDriverDocument(
      { driverId, documentId, clientId, driverVehicleId: driverVehicleId || null },
      updateData
    );
  } else {
    if (!documentImage) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Document image is required for new upload');
    }
    updatedOrNewDocument = await mobileDriverDocumentService.createDriverDocument(driverDocumentData);
  }

  if (updatedOrNewDocument.documentImage) {
    updatedOrNewDocument.documentImage = `/uploads/documentImage/${updatedOrNewDocument.documentImage}`;
  }

  const response = Response(
    true,
    updatedOrNewDocument,
    existingDocument ? 'Driver document updated successfully' : 'Driver document created successfully'
  );

  await sendClientNotification(clientId, {
    title: 'Driver Document',
    message: 'Driver Document updated..Verify The Document Approve or Reject',
  });

  res.status(httpStatus.CREATED).send(response);
});

/**
 * Get driver's uploaded documents (web - clientId from driver's zone)
 * GET /v1/web/driver/document/list
 */
const getWebDriverDocuments = catchAsync(async (req, res) => {
  const driverId = await getDriverIdFromToken(req);
  const clientId = await getClientIdFromDriver(driverId);
  const driverVehicleId = req.query.driverVehicleId || null;

  const webReq = {
    ...req,
    headers: {
      ...req.headers,
      clientid: clientId,
    },
  };

  const result = await mobileDriverDocumentService.getDriverDocumentByDriver(webReq, driverVehicleId);
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Driver documents not found');
  }

  const filterType = req.query.type;
  let finalResponse = {};
  if (filterType === 'driver') {
    finalResponse = { driver: result.driver };
  } else if (filterType === 'vehicle') {
    finalResponse = { vehicle: result.vehicle };
  } else {
    finalResponse = result;
  }

  res.status(httpStatus.OK).send(Response(true, finalResponse, 'Success'));
});

/**
 * Update document details only (identifier, expiry, issue date) - no file
 * PATCH /v1/web/driver/document/details
 */
const updateDocumentDetails = catchAsync(async (req, res) => {
  const driverId = await getDriverIdFromToken(req);
  const clientId = await getClientIdFromDriver(driverId);
  const { documentId, driverVehicleId, expiryDate, identifier, issueDate } = req.body;

  const existingDocument = await mobileDriverDocumentService.findDriverDocument({
    driverId,
    documentId,
    clientId,
    driverVehicleId: driverVehicleId || null,
  });

  if (!existingDocument) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Document record not found. Please upload the document first.');
  }

  const updateData = {
    ...(expiryDate !== undefined && { expiryDate: expiryDate || null }),
    ...(issueDate !== undefined && { issueDate: issueDate || null }),
    ...(identifier !== undefined && { identifier: identifier || null }),
  };

  const updated = await mobileDriverDocumentService.updateDriverDocument(
    { driverId, documentId, clientId, driverVehicleId: driverVehicleId || null },
    updateData
  );

  res.status(httpStatus.OK).send(Response(true, updated, 'Document details updated successfully'));
});

module.exports = {
  uploadWebDriverDocument,
  getWebDriverDocuments,
  updateDocumentDetails,
};
