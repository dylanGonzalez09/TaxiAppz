const httpStatus = require('http-status').default || require('http-status').status || require('http-status');
const path = require('path');
const fs = require('fs');
const { ObjectId } = require('mongoose').Types;
const pick = require('../../../utils/pick');
const ApiError = require('../../../utils/ApiError');
const catchAsync = require('../../../utils/catchAsync');

const { sendClientNotification } = require('../../../utils/commonFunction');

const { mobileDriverDocumentService, tokenService, userService } = require('../../../services');
const Driver = require('../../../models/boilerplate/driver.model');
const Request = require('../../../models/boilerplate/request.model');
const GroupDocument = require('../../../models/boilerplate/groupdocument.model');
const Document = require('../../../models/boilerplate/document.model');

const Response = require('../../../config/response');
const { documentModelUpload } = require('../../../middlewares/upload');
const mqttService = require('../../../services/mqtt/mqtt.service');

const { getUserId, getClientId, getDriverId } = require('../../../utils/commonFunction');

const { mqttConfig } = require('../../../config/string');

const BACKEND_ROOT = path.resolve(__dirname, '../../../../');
const USER_UPLOAD_DIR = path.join(BACKEND_ROOT, 'uploads', 'user');
const DOCUMENT_UPLOAD_DIR = path.join(BACKEND_ROOT, 'uploads', 'documentImage');

const createOrUpdateDriverDocument = catchAsync(async (req, res) => {
  const driverId = await getDriverId(req);
  const clientId = await getClientId(req);

  const documentStatus = 'WAITINGFORAPPROVAL';
  const { expiryDate, identifier, issueDate, documentId, driverVehicleId } = req.body;

  documentModelUpload.single('documentImage')(req, res, async (err) => {
    const documentImage = req.file ? req.file.filename : null;

    const existingDocument = await mobileDriverDocumentService.findDriverDocument({
      driverId,
      documentId,
      clientId,
      driverVehicleId: driverVehicleId || null,
    });

    const driverDocumentData = {
      driverId,
      documentImage,
      expiryDate,
      documentStatus,
      identifier,
      issueDate,
      documentId,
      clientId,
      driverVehicleId: driverVehicleId || null,
    };

    let updatedOrNewDocument;
    if (existingDocument) {
      // Update the existing document
      if (documentImage) {
        driverDocumentData.documentImage = documentImage; // Overwrite the image only if a new one is uploaded
      }
      updatedOrNewDocument = await mobileDriverDocumentService.updateDriverDocument(
        { driverId, documentId, clientId, driverVehicleId: driverVehicleId || null },
        driverDocumentData,
      );
    } else {
      // Create a new document
      updatedOrNewDocument = await mobileDriverDocumentService.createDriverDocument(driverDocumentData);
    }

    // Add full path for the image if it exists
    if (updatedOrNewDocument.documentImage) {
      updatedOrNewDocument.documentImage = `/uploads/documentImage/${updatedOrNewDocument.documentImage}`;
    }

    const response = Response(
      true,
      updatedOrNewDocument,
      existingDocument ? 'Driver Document updated successfully' : 'Driver Document created successfully',
    );

    await sendClientNotification(clientId, {
      title: 'Driver Document',
      message: 'Driver Document updated..Verify The Document Approve or Reject',
    });

    res.status(httpStatus.CREATED).send(response);
  });
});

const getDriverDocumentsByName = async (userId, clientId) => {
  // First, get the driver's serviceLocation (zoneId)
  const driver = await Driver.findOne({ userId, clientId });
  if (!driver) {
    throw new Error('Driver not found');
  }

  const zoneId = driver.serviceLocation;
  if (!zoneId) {
    throw new Error('Driver service location not found');
  }
  // Find group document with name 'Driver' and matching zoneId
  const groupDocument = await GroupDocument.findOne({
    name: 'Driver',
    zoneId,
    type: 'driver',
    status: true,
    clientId, // Also filter by clientId for consistency
  });


  if (!groupDocument) {
    throw new Error('Group document not found for driver zone');
  }

  // Find documents that belong to this group document
  const documents = await Document.find({
    documentId: groupDocument._id,
    status: true,
    clientId,
  });

  if (documents.length === 0) {
    throw new Error('No documents found for this group');
  }

  const documentIds = documents.map((doc) => doc._id);

  return documentIds[0]; // Return first document ID as before
};

const updateDriverProfileDocument = catchAsync(async (req, res) => {
  const driverId = await getDriverId(req);
  const userId = await getUserId(req);
  const clientId = await getClientId(req);

  const activeTrip = await Request.findOne({
    driverId,
    isCompleted: false,
    isCancelled: false,
  });

  if (activeTrip) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Driver is currently on an active trip. Profile update not allowed.');
  }

  // Get existing user
  const existingUser = await userService.getUserById(userId);
  if (!existingUser) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  // Prepare user data
  const userData = {
    firstName: req.body.name || existingUser.firstName,
    lastName: req.body.name || existingUser.lastName,
    email: req.body.email || existingUser.email,
    onlineBy: 0,
  };

  const servicetype = req.body.serviceType;
  const secondaryZone = req.body.secondaryZone || null;

  let uploadedFile = null;

  // ✅ HANDLE PROFILE IMAGE
  if (req.files && req.files.profileImage && req.files.profileImage[0]) {
    uploadedFile = req.files.profileImage[0];
    const profileImage = uploadedFile.filename;

    // Delete old profile image
    if (existingUser.profilePic && path.basename(existingUser.profilePic) !== profileImage) {
      const oldImagePath = path.join(USER_UPLOAD_DIR, path.basename(existingUser.profilePic));
      if (fs.existsSync(oldImagePath)) {
        try {
          fs.unlinkSync(oldImagePath);
        } catch (error) {
          console.error('Error deleting old profile image:', error);
        }
      }
    }

    userData.profilePic = profileImage;
  }

  // Update user
  await userService.updateUserById(existingUser.id, userData);

  // ✅ UPDATE DRIVER DATA
  if (secondaryZone || servicetype) {
    const driver = await Driver.findOne({ userId });
    if (driver) {
      if (servicetype) driver.serviceType = servicetype;
      if (secondaryZone) driver.secondaryZone = secondaryZone;
      await driver.save();
    }
  }

  // ✅ HANDLE DOCUMENT USING SAME FILE
  let updatedOrNewDocument = null;

  if (uploadedFile) {
    const documentImage = uploadedFile.filename;
    const documentStatus = 'WAITINGFORAPPROVAL';
    const sourcePath = path.isAbsolute(uploadedFile.path) ? uploadedFile.path : path.join(BACKEND_ROOT, uploadedFile.path);
    const destPath = path.join(DOCUMENT_UPLOAD_DIR, documentImage);

    const documentId = await getDriverDocumentsByName(userId, clientId);

    const existingDocument = await mobileDriverDocumentService.findDriverDocument({
      driverId,
      documentId,
      clientId,
    });

    const driverDocumentData = {
      driverId,
      documentId,
      clientId,
      documentImage,
      documentStatus,
    };

    if (existingDocument) {
      // Delete old document image
      if (existingDocument.documentImage && path.basename(existingDocument.documentImage) !== documentImage) {
        const oldDocPath = path.join(DOCUMENT_UPLOAD_DIR, path.basename(existingDocument.documentImage));

        if (fs.existsSync(oldDocPath)) {
          try {
            fs.unlinkSync(oldDocPath);
          } catch (error) {
            console.error('Error deleting old document image:', error);
          }
        }
      }

      updatedOrNewDocument = await mobileDriverDocumentService.updateDriverDocument(
        { driverId, documentId, clientId },
        driverDocumentData,
      );
    } else {
      updatedOrNewDocument = await mobileDriverDocumentService.createDriverDocument(driverDocumentData);
    }

    try {
      if (!fs.existsSync(DOCUMENT_UPLOAD_DIR)) {
        fs.mkdirSync(DOCUMENT_UPLOAD_DIR, { recursive: true });
      }
      fs.copyFileSync(sourcePath, destPath);
    } catch (error) {
      console.error('Error copying file to documentImage folder:', error);
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to save image in document folder');
    }

    if (updatedOrNewDocument && updatedOrNewDocument.documentImage) {
      updatedOrNewDocument.documentImage = `/uploads/documentImage/${updatedOrNewDocument.documentImage}`;
    }
  }

  // ✅ RESPONSE
  const response = Response(true, { user: userData }, 'Driver profile updated successfully');

  // ✅ MQTT
  try {
    const topic = mqttConfig.DRIVER_DETAIL + driverId;

    let inProgress = await getRequest(clientId, userId);

    if (inProgress && Array.isArray(inProgress)) {
      inProgress = inProgress[0];
      if (inProgress.blockReason) {
        inProgress.documentStatus = inProgress.blockReason;
      }
    }

    await mqttService.publishMessage(topic, inProgress);
  } catch (error) {
    console.error('MQTT publishing error:', error);
  }

  res.status(httpStatus.OK).send(response);
});

const getRequest = async (clientId, userId) => {
  const document = await Document.find({ clientId, status: true });

  const getRequest = Driver.aggregate([
    {
      $match: {
        clientId: new ObjectId(clientId),
        userId: new ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: 'driverdocuments',
        localField: '_id',
        foreignField: 'driverId',
        as: 'driverDocumentDetails',
      },
    },
    {
      $lookup: {
        from: 'requests',
        localField: '_id',
        foreignField: 'userId',
        as: 'requestDetails',
      },
    },
    {
      $unwind: {
        path: '$requestDetails',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'requestbills',
        localField: '_id',
        foreignField: 'requestDetails._id',
        as: 'billingDetails',
      },
    },
    {
      $lookup: {
        from: 'requestplaces',
        localField: '_id',
        foreignField: 'requestDetails._id',
        as: 'placesDetails',
      },
    },
    {
      $lookup: {
        from: 'requestratings',
        localField: '_id',
        foreignField: 'requestDetails._id',
        as: 'ratingDetails',
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'user',
      },
    },
    {
      $unwind: {
        path: '$billingDetails',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $unwind: {
        path: '$ratingDetails',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $unwind: {
        path: '$user',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'driverPersonalDetails',
      },
    },
    {
      $lookup: {
        from: 'vehicles',
        localField: 'type',
        foreignField: '_id',
        as: 'vehicleDetails',
      },
    },
    {
      $lookup: {
        from: 'vehiclemodels',
        localField: 'carModel',
        foreignField: '_id',
        as: 'vehicleModelDetails',
      },
    },
    {
      $unwind: {
        path: '$driverPersonalDetails',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $unwind: {
        path: '$vehicleDetails',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $unwind: {
        path: '$vehicleModelDetails',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $addFields: {
        active: {
          $cond: [
            {
              $or: [
                { $eq: [{ $size: '$driverDocumentDetails' }, 0] }, // No documents
                {
                  $gt: [
                    {
                      $size: {
                        $filter: {
                          input: '$driverDocumentDetails',
                          as: 'doc',
                          cond: {
                            $or: [
                              { $eq: ['$$doc.documentStatus', 'DENIED'] }, // Denied documents
                              {
                                $and: [
                                  { $ifNull: ['$$doc.expiryDate', false] }, // expiryDate exists
                                  { $lt: ['$$doc.expiryDate', new Date()] }, // expiryDate < today
                                ],
                              },
                            ],
                          },
                        },
                      },
                    },
                    0,
                  ],
                },
                { $ne: [{ $size: '$driverDocumentDetails' }, document.length] }, // Document count not equal to expected count
                {
                  $gt: [
                    {
                      $size: {
                        $filter: {
                          input: '$driverDocumentDetails',
                          as: 'doc',
                          cond: { $ne: ['$$doc.documentStatus', 'APPROVED'] }, // Not approved documents
                        },
                      },
                    },
                    0,
                  ],
                }, // Any document is not approved
              ],
            },
            false, // Inactive
            true, // Active
          ],
        },
        blockReason: {
          $cond: {
            if: {
              $gt: [
                {
                  $size: {
                    $filter: {
                      input: '$driverDocumentDetails',
                      as: 'doc',
                      cond: { $eq: ['$$doc.documentStatus', 'WAITINGFORAPPROVAL'] }, // Check for WAITINGFORAPPROVAL
                    },
                  },
                },
                0,
              ],
            },
            then: 'WAITINGFORAPPROVAL', // If any document is WAITINGFORAPPROVAL
            else: {
              $cond: {
                if: { $eq: [{ $size: '$driverDocumentDetails' }, 0] }, // No documents
                then: 'DOCUMENT_NOT_UPLOADED',
                else: {
                  $cond: {
                    if: {
                      $gt: [
                        {
                          $size: {
                            $filter: {
                              input: '$driverDocumentDetails',
                              as: 'doc',
                              cond: {
                                $and: [
                                  { $ifNull: ['$$doc.expiryDate', false] }, // expiryDate exists
                                  { $lt: ['$$doc.expiryDate', new Date()] }, // expiryDate is in the past
                                ],
                              },
                            },
                          },
                        },
                        0,
                      ],
                    },
                    then: 'EXPIRED',
                    else: {
                      $cond: {
                        if: { $ne: [{ $size: '$driverDocumentDetails' }, document.length] }, // Document count does not match driver document count
                        then: 'DOCUMENT_NOT_UPLOADED', // Document and driver document counts do not match
                        else: {
                          $cond: {
                            if: {
                              $eq: [
                                {
                                  $size: {
                                    $filter: {
                                      input: '$driverDocumentDetails',
                                      as: 'doc',
                                      cond: { $ne: ['$$doc.documentStatus', 'APPROVED'] }, // Any document not approved
                                    },
                                  },
                                },
                                0,
                              ],
                            }, // All documents are approved
                            then: 'APPROVED',
                            else: 'DENIED', // Not all documents are approved
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        onlineBy: {
          $cond: {
            if: { $eq: ['$driverPersonalDetails.onlineBy', 1] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        _id: { $ifNull: ['$_id', null] },
        _id: { $ifNull: ['$_id', null] },
        blockReason: { $ifNull: ['$blockReason', null] },
        onlineBy: { $ifNull: ['$onlineBy', null] },
        active: { $ifNull: ['$active', null] },
        'driver.id': { $ifNull: ['$_id', null] },
        'driver.carNumber': { $ifNull: ['$carNumber', null] },
        'driver.serviceType': { $ifNull: ['$serviceType', null] },
        'driver.vehicleId': { $ifNull: ['$vehicleDetails._id', null] },
        'driver.vehicleName': { $ifNull: ['$vehicleDetails.vehicleName', null] },
        'driver.vehicleImage': { $ifNull: ['$vehicleDetails.image', null] },
        'driver.capacity': { $ifNull: ['$vehicleDetails.capacity', null] },
        'driver.highlightImage': { $ifNull: ['$vehicleDetails.highlightImage', null] },
        'driver.modelname': { $ifNull: ['$vehicleModelDetails.modelname', null] },
        'user.userId': { $ifNull: ['$user._id', null] },
        'user.firstName': { $ifNull: ['$user.firstName', null] },
        'user.lastName': { $ifNull: ['$user.lastName', null] },
        'user.email': { $ifNull: ['$user.email', null] },
        'user.phoneNumber': { $ifNull: ['$user.phoneNumber', null] },
        'user.referralCode': { $ifNull: ['$user.referralCode', null] },
        'user.gender': { $ifNull: ['$user.gender', null] },
        'user.country': { $ifNull: ['$user.country', null] },
        'user.profilePic': { $ifNull: ['$user.profilePic', null] },
      },
    },
  ]);

  return getRequest;
};

const getDriverDocumentByDriver = catchAsync(async (req, res) => {
  if (!req.headers.clientid) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ClientID not found');
  }

  const driverVehicleId = req.query.driverVehicleId || null;

  const result = await mobileDriverDocumentService.getDriverDocumentByDriver(req, driverVehicleId);

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'driverdocument not found');
  }

  // NEW: Filter response by type
  const filterType = req.query.type; // driver | vehicle

  let finalResponse = {};

  if (filterType === 'driver') {
    finalResponse = { driver: result.driver };
  } else if (filterType === 'vehicle') {
    finalResponse = { vehicle: result.vehicle };
  } else {
    finalResponse = result; // return both
  }

  res.status(httpStatus.OK).send(Response(true, finalResponse, 'Success'));
});

module.exports = {
  createOrUpdateDriverDocument,
  getDriverDocumentByDriver,
  updateDriverProfileDocument,
};
