const httpStatus = require('http-status');
const pick = require('../../../utils/pick');
const ApiError = require('../../../utils/ApiError');
const catchAsync = require('../../../utils/catchAsync');

const { sendClientNotification } = require('../../../utils/commonFunction');

const { mobileDriverDocumentService, tokenService } = require('../../../services');
const Driver = require('../../../models/boilerplate/driver.model');
const GroupDocument = require('../../../models/boilerplate/groupdocument.model');
const Document = require('../../../models/boilerplate/document.model');

const Response = require('../../../config/response');
const { documentModelUpload } = require('../../../middlewares/upload');
const path = require('path');
const fs = require('fs');
const ObjectId = require('mongoose').Types.ObjectId;
const mqttService = require('../../../services/mqtt/mqtt.service');

const { mqttConfig } = require('../../../config/string')

const getClientId = async (req) => {

  clientId = '';

  if (!req.headers.clientid) {

    throw new ApiError(httpStatus.NOT_FOUND, 'ClientID not found');

  } else {

    clientId = req.headers.clientid;

  }

  return clientId;
}



const getUserId = async (req) => {

  let userId = '';

  let driverId = '';

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(httpStatus.UNAUTHORIZED).send({ message: 'Authorization header is missing or invalid' });
    return;
  }
  // Remove the 'Bearer ' prefix and get the token
  const token = authHeader.substring(7);

  const user = await tokenService.verifyTokenAndGetUser(token);

  userId = user.id


  const driver = await Driver.find({ userId: userId })

  driverId = driver[0]._id;

  return driverId;
}


const getUserById = async (req) => {

  let userId = '';


  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(httpStatus.UNAUTHORIZED).send({ message: 'Authorization header is missing or invalid' });
    return;
  }
  // Remove the 'Bearer ' prefix and get the token
  const token = authHeader.substring(7);

  const user = await tokenService.verifyTokenAndGetUser(token);

  userId = user.id

  return userId;
}


const createOrUpdateDriverDocument = catchAsync(async (req, res) => {
  const driverId = await getUserId(req);
  const clientId = req.headers.clientid;

  const documentStatus = "WAITINGFORAPPROVAL";
  const { expiryDate, identifier, issueDate, documentId } = req.body;

  documentModelUpload.single("documentImage")(req, res, async (err) => {

    const documentImage = req.file ? req.file.filename : null;

    const existingDocument = await mobileDriverDocumentService.findDriverDocument({
      driverId,
      documentId,
      clientId,
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
    };

    let updatedOrNewDocument;
    if (existingDocument) {
      // Update the existing document
      if (documentImage) {
        driverDocumentData.documentImage = documentImage; // Overwrite the image only if a new one is uploaded
      }
      updatedOrNewDocument = await mobileDriverDocumentService.updateDriverDocument(
        { driverId, documentId, clientId },
        driverDocumentData
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
      existingDocument ? "Driver Document updated successfully" : "Driver Document created successfully"
    );

    await sendClientNotification(clientId, {
      title: "Driver Document",
      message: "Driver Document updated..Verify The Document Approve or Reject",
    });

    res.status(httpStatus.CREATED).send(response);
  });
});


const getDriverDocumentsByName = async () => {
  const groupDocument = await GroupDocument.findOne({ name: 'Driver' });
  if (!groupDocument) {
    throw new Error('Vehicle not found');
  }

  const documents = await Document.find({ documentId: groupDocument._id });

  const documentIds = documents.map(doc => doc._id);

  return documentIds[0];
};

const updateDriverProfileDocument = catchAsync(async (req, res) => {
  const driverId = await getUserId(req);
  const userId = await getUserById(req);
  const clientId = req.headers.clientid;

  const documentStatus = "WAITINGFORAPPROVAL";

  const documentId = await getDriverDocumentsByName();

  documentModelUpload.single("documentImage")(req, res, async (err) => {

    const documentImage = req.file ? req.file.filename : null;

    const existingDocument = await mobileDriverDocumentService.findDriverDocument({
      driverId,
      documentId,
      clientId,
    });

    const driverDocumentData = {
      documentImage,
      documentStatus
    };

    let updatedOrNewDocument;
    if (existingDocument) {
      // Update the existing document
      if (documentImage) {
        driverDocumentData.documentImage = documentImage; // Overwrite the image only if a new one is uploaded
      }
      updatedOrNewDocument = await mobileDriverDocumentService.updateDriverDocument(
        { driverId, documentId, clientId },
        driverDocumentData
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
      existingDocument ? "Driver Document updated successfully" : "Driver Document created successfully"
    );

    await sendClientNotification(clientId, {
      title: "Driver Document",
      message: "Driver Document updated..Verify The Document Approve or Reject",
    });

    // const topic = `driver/detail/` + driverId;

    const topic = mqttConfig.DRIVER_DETAIL+""+driverId;

    let inProgress = await getRequest(clientId, userId);

    if (inProgress != null && Array.isArray(inProgress)) {
      inProgress = inProgress[0];
      inProgress.documentStatus = inProgress.blockReason;
    }

    await mqttService.publishMessage(topic, inProgress).then((successMessage) => {
    })
      .catch((errorMessage) => {
        console.error(errorMessage); // Will print error message if publishing fails
      });

    res.status(httpStatus.CREATED).send(response);
  });
});

const getRequest = async (clientId, userId) => {


  const document = await Document.find({ clientId: clientId,status:true });


  const getRequest = Driver.aggregate([
    {
      $match: {
        clientId: new ObjectId(clientId),
        userId: new ObjectId(userId)
      }
    },
    {
      $lookup: {
        from: 'driverdocuments',
        localField: '_id',
        foreignField: 'driverId',
        as: 'driverDocumentDetails'
      }
    },
    {
      $lookup: {
        from: 'requests',
        localField: '_id',
        foreignField: 'userId',
        as: 'requestDetails'
      }
    },
    {
      $unwind: {
        path: '$requestDetails',
        preserveNullAndEmptyArrays: true,
      }
    },
    {
      $lookup: {
        from: 'requestbills',
        localField: '_id',
        foreignField: 'requestDetails._id',
        as: 'billingDetails'
      }
    },
    {
      $lookup: {
        from: 'requestplaces',
        localField: '_id',
        foreignField: 'requestDetails._id',
        as: 'placesDetails'
      }
    },
    {
      $lookup: {
        from: 'requestratings',
        localField: '_id',
        foreignField: 'requestDetails._id',
        as: 'ratingDetails'
      }
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
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $unwind: {
        path: '$ratingDetails',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $unwind: {
        path: '$user',
        preserveNullAndEmptyArrays: true,
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'driverPersonalDetails',
      }
    },
    {
      $lookup: {
        from: 'vehicles',
        localField: 'type',
        foreignField: '_id',
        as: 'vehicleDetails',
      }
    },
    {
      $lookup: {
        from: 'vehiclemodels',
        localField: 'carModel',
        foreignField: '_id',
        as: 'vehicleModelDetails',
      }
    },
    {
      $unwind: {
        path: '$driverPersonalDetails',
        preserveNullAndEmptyArrays: true,
      }
    },
    {
      $unwind: {
        path: '$vehicleDetails',
        preserveNullAndEmptyArrays: true,
      }
    },
    {
      $unwind: {
        path: '$vehicleModelDetails',
        preserveNullAndEmptyArrays: true,
      }
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
                                  { $lt: ['$$doc.expiryDate', new Date()] } // expiryDate < today
                                ]
                              }
                            ]
                          }
                        }
                      }
                    },
                    0
                  ]
                },
                { $ne: [{ $size: '$driverDocumentDetails' }, document.length] }, // Document count not equal to expected count
                {
                  $gt: [
                    {
                      $size: {
                        $filter: {
                          input: '$driverDocumentDetails',
                          as: 'doc',
                          cond: { $ne: ['$$doc.documentStatus', 'APPROVED'] } // Not approved documents
                        }
                      }
                    },
                    0
                  ]
                } // Any document is not approved
              ]
            },
            false, // Inactive
            true // Active
          ]
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
                      cond: { $eq: ['$$doc.documentStatus', 'WAITINGFORAPPROVAL'] } // Check for WAITINGFORAPPROVAL
                    }
                  }
                },
                0
              ]
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
                                  { $lt: ['$$doc.expiryDate', new Date()] } // expiryDate is in the past
                                ]
                              }
                            }
                          }
                        },
                        0
                      ]
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
                                      cond: { $ne: ['$$doc.documentStatus', 'APPROVED'] } // Any document not approved
                                    }
                                  }
                                },
                                0
                              ]
                            }, // All documents are approved
                            then: 'APPROVED',
                            else: 'DENIED' // Not all documents are approved
                          }
                        },
                      }
                    }
                  }
                }
              }
            }
          }
        },
        onlineBy: {
          $cond: {
            if: { $eq: ['$driverPersonalDetails.onlineBy', 1] },
            then: true,
            else: false,
          },
        }
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
      }
    }
  ]);

  return getRequest;
};

const getDriverDocumentByDriver = catchAsync(async (req, res) => {
  if (!req.headers.clientid) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ClientID not found');
  }

  const driverdocument = await mobileDriverDocumentService.getDriverDocumentByDriver(req);

  if (!driverdocument) {
    throw new ApiError(httpStatus.NOT_FOUND, 'driverdocument not found');
  }


  const response = Response(true, driverdocument, "Success");
  res.status(httpStatus.OK).send(response);
});


module.exports = {
  createOrUpdateDriverDocument,
  getDriverDocumentByDriver,
  updateDriverProfileDocument
};
