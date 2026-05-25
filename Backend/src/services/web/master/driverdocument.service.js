const httpStatus = require('http-status');
const ApiError = require('../../../utils/ApiError');
const { DriverDocument, Document, Driver} = require('../../../models');
const ObjectId = require('mongoose').Types.ObjectId
const pick = require('../../../utils/pick');
const { tokenService } = require('../../../services');
const { sendNotification } = require('../../../utils/commonFunction');
const mqttService = require('../../../services/mqtt/mqtt.service');
const { mqttConfig } = require('../../../config/string');
const moment = require('moment');

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

/**
 * Create a DriverDocument
 * @param {Object} DriverDocumentBody
 * @returns {Promise<DriverDocument>}
 */
const createDriverDocument = async (DriverDocumentBody) => {
  return DriverDocument.create(DriverDocumentBody);
};


/**
 * Get DriverDocument by id
 * @param {ObjectId} driverDocumentId
 * @returns {Promise<DriverDocument>}
 */
const getDriverDocumentById = async (driverDocumentId) => {
  return DriverDocument.findById(driverDocumentId);
};

/**
 * Query for roles
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryDriverDocument = async (filter, options) => {
  const groupDocument = await DriverDocument.paginate(filter, options);
  return groupDocument;
};


/**
 * @param {ObjectId} clientId
 * @returns {Promise<DriverDocument>}
 */
const getDriverDocument = async (driverId, clientId) => {
  try {



    let clientObjectId = new ObjectId(clientId);
    let driverObjectId = new ObjectId(driverId);


    const documentResults = await Document.aggregate([
      {
        $match: {
          clientId: clientObjectId,
          status: true
        }
      },
      {
        $lookup: {
          from: 'groupdocuments',
          localField: 'documentId',
          foreignField: '_id',
          as: 'groupDocumentDetails'
        }
      },
      {
        $unwind: {
          path: '$groupDocumentDetails',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          _id: 1,
          documentName: 1,
          required: 1,
          identifier: 1,
          expiryDate: 1,
          issueDate: 1,
          documentId: 1,
          status: 1,
          clientId: 1,
          'groupDocumentDetails.name': 1
        }
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: [
              '$$ROOT',
              {
                categoryName: '$groupDocumentDetails.name'
              }
            ]
          }
        }
      },
      {
        $project: {
          groupDocumentDetails: 0
        }
      }
    ]);


    const driverDocuments = await DriverDocument.find({
      driverId: driverObjectId,
      clientId: clientObjectId
    }).exec();


    const driverDocumentsMap = driverDocuments.reduce((map, doc) => {
      map[doc.documentId.toString()] = doc;
      return map;
    }, {});


    const formatDate = (date) => {
      if (!date) return '';
      const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
      return new Date(date).toLocaleDateString(undefined, options);
    };

    const mergedResults = documentResults.map(doc => {
      const driverDoc = driverDocumentsMap[doc._id.toString()] || {};

      let driverDocumentImg;
      let driverExpStatus;

      if (driverDoc.documentImage) {
        driverDocumentImg = `/uploads/documentImage/${driverDoc.documentImage}` || '';
      }

      return {
        _id: doc._id || null,
        documentName: doc.documentName || '',
        required: doc.required,
        identifier: doc.identifier,
        expiryDate: doc.expiryDate,
        issueDate: doc.issueDate,
        documentId: doc.documentId || '',
        status: doc.status || false,
        clientId: doc.clientId || '',
        categoryName: doc.categoryName || '',
        documentImage: driverDocumentImg,
        expiryReason: driverDoc.expiryReason || '',
        expiryStatus: driverDoc.expriyStatus || false,
        documentStatus: driverDoc.documentStatus || '',
        driverDocStatus: driverDoc.status || false,
        issueDateValue: formatDate(driverDoc.issueDate),
        expiryDateValue: formatDate(driverDoc.expiryDate),
        identifierValue: driverDoc.identifier || '',
        driverDocmentId: driverDoc._id || ''
      };
    });

    return mergedResults;
  } catch (error) {
    console.error('Error in aggregation or fetching driver documents:', error);
    throw error;
  }
};

/**
 * @param {ObjectId} clientId
 * @returns {Promise<Object>}
 */
const getDriverDocumentByDriver = async (driverId, clientId) => {
  try {
    const driverObjectId = new ObjectId(driverId);
    const clientObjectId = new ObjectId(clientId);

    // Aggregation to get document data along with group documents
    const documentResults = await Document.aggregate([
      {
        $match: {
          clientId: clientObjectId,
          status: true
        }
      },
      {
        $lookup: {
          from: 'groupdocuments',
          localField: 'documentId',
          foreignField: '_id',
          as: 'groupDocumentDetails'
        }
      },
      {
        $unwind: {
          path: '$groupDocumentDetails',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          _id: 1,
          documentName: 1,
          required: 1,
          identifier: 1,
          expiryDate: 1,
          issueDate: 1,
          documentId: 1,
          status: 1,
          clientId: 1,
          'groupDocumentDetails.name': 1
        }
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: [
              '$$ROOT',
              {
                categoryName: '$groupDocumentDetails.name'
              }
            ]
          }
        }
      },
      {
        $project: {
          groupDocumentDetails: 0
        }
      }
    ]);

    // Fetch driver-specific documents
    const driverDocuments = await DriverDocument.find({
      driverId: driverObjectId,
      clientId: clientObjectId
    }).exec();

    // Map driver documents by documentId
    const driverDocumentsMap = driverDocuments.reduce((map, doc) => {
      map[doc.documentId.toString()] = doc;
      return map;
    }, {});

    // Helper function to format date
    const formatDate = (date) => {
      if (!date) return '';
      const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
      return new Date(date).toLocaleDateString(undefined, options);
    };

    const currentDate = new Date();


    // Group documents by documentId
    const groupedDocuments = documentResults.reduce((acc, doc) => {
      const driverDoc = driverDocumentsMap[doc._id.toString()] || {};

      let driverDocumentImg;
      if (driverDoc.documentImage) {
        driverDocumentImg = `/uploads/documentImage/${driverDoc.documentImage}`;
      }

      // Format expiry date and determine expiry status
      const expiryDate = driverDoc.expiryDate ? new Date(driverDoc.expiryDate) : null;
      const expiryDatedFormatted = expiryDate ? formatDate(expiryDate) : '0000-00-00';
      const expiryStatus = expiryDate && expiryDate < currentDate;

      const getDocumentEntry = {
        id: driverDoc._id || null,
        document_name: doc.documentName || '',
        zone_id: 1, // Default value; modify according to your logic
        requried: doc.required,
        identifier: doc.identifier,
        expiry_date: doc.expiryDate ? 1 : 0,
        status: doc.status ? 1 : 0,
        group_by: doc.documentId,
        is_uploaded: driverDoc.documentImage ? 1 : 0,
        document_image: driverDocumentImg || '',
        expiry_dated: driverDoc.expiryDate ? formatDate(driverDoc.expiryDate) : '0000-00-00',
        issue_date: driverDoc.issueDate ? formatDate(driverDoc.issueDate) : '0000-00-00',
        identifier_document: driverDoc.identifier || null,
        expiryStatus: expiryStatus
      };

      if (!acc[doc.documentId]) {
        acc[doc.documentId] = {
          id: doc.documentId,
          zone_id: 1, // Default value; modify according to your logic
          name: doc.categoryName || '',
          document_for: 'NORMAL DRIVER', // Modify as per requirement
          status: 1, // Default status
          created_by: null, // Modify according to your logic
          created_at: '2022-08-10T13:16:22.000000Z', // Modify with real values
          updated_at: '2024-09-16T05:23:53.000000Z', // Modify with real values
          deleted_at: null, // Modify if needed
          document_count: 0, // Start with 0
          upload_status: driverDoc.documentImage ? 1 : 0,
          get_document: []
        };
      }

      acc[doc.documentId].get_document.push(getDocumentEntry);
      acc[doc.documentId].document_count = acc[doc.documentId].get_document.length; // Update the document_count

      return acc;
    }, {});

    const responseData = {
      success: true,
      data: {
        document: Object.values(groupedDocuments)
      }
    };

    return responseData;
  } catch (error) {
    console.error('Error in aggregation or fetching driver documents:', error);
    return { success: false, message: 'Error fetching documents.' };
  }
};


/**
 * Update a driver document by ID
 * @param {string} id - The ID of the driver document to update
 * @param {Object} updateData - The data to update
 * @param {Object} options - Options for the update operation (e.g., `{ new: true }`)
 * @returns {Promise<Object>} - The updated driver document
 */
const update = async (req, id, updateData, options = {}) => {
  try {
    let clientId = await getClientId(req);

    const updatedDriverDocument = await DriverDocument.findByIdAndUpdate(
      id,
      updateData,
      { new: true, ...options }
    );

    if (!updatedDriverDocument) {
      throw new Error('Driver document not found');
    }

    let userDetails = await Driver.findById(updatedDriverDocument.driverId)
    let inProgress = await getRequest(clientId, userDetails.userId);

    // const topic = `driver/detail/` + updatedDriverDocument.driverId;

    const topic = mqttConfig.DRIVER_DETAIL+""+updatedDriverDocument.driverId;


    let documentDetails = await Document.find({ _id: updatedDriverDocument.documentId })

    if (documentDetails != null && Array.isArray(documentDetails)) {
      documentDetails = documentDetails[0];
    }

    if (inProgress != null && Array.isArray(inProgress)) {
      inProgress = inProgress[0];
      inProgress.documentStatus = inProgress.blockReason;
    }



    await mqttService.publishMessage(topic, inProgress).then((successMessage) => {
    })
    .catch((errorMessage) => {
      console.error(errorMessage); // Will print error message if publishing fails
    });

    // Prepare notification data

    if (inProgress.documentStatus === 'APPROVED') {
      userDetails.isApprove = true;
      userDetails.status = true; 
    } else {
      userDetails.isApprove = false;
      userDetails.status = false;
    }

    await userDetails.save();


    const userIds = [userDetails.userId]; 
    
    const messageData = {
      title: "Document Updated",
      message: `Your document with ${documentDetails.documentName} has been ${inProgress.documentStatus}.`,
      imageName: "", // Add an optional image URL if required
    };

    // Send notification
    await sendNotification(req, userIds, messageData);

    return updatedDriverDocument;
  } catch (error) {
    console.error('Error updating driver document:', error);
    throw error;
  }
};


const getExpiredDocuments = async (req) => {
  try {
    const filter = pick(req.query, ['firstName', 'phoneNumber']);
    const options = pick(req.query, ['sortBy', 'limit', 'page']);
    

    const clientId = await getClientId(req);
    const driverId = req.params.driverId;
    const limit = parseInt(options.limit, 10) || 10;
    const page = parseInt(options.page, 10) || 1;

    const matchStage = {
      driverId: new ObjectId(driverId),
      expiryDate: { $ne: null },
      clientId: new ObjectId(clientId),
    };

    const pipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: 'drivers',
          localField: 'driverId',
          foreignField: '_id',
          as: 'driverInfo',
        },
      },
      {
        $lookup: {
          from: 'documents',
          localField: 'documentId',
          foreignField: '_id',
          as: 'documentInfo',
          pipeline: [
            {
              $match: {
                expiryDate: true,
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: '$driverInfo',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: '$documentInfo',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'driverInfo.userId',
          foreignField: '_id',
          as: 'driverPersonalDetails',
        },
      },
      {
        $unwind: {
          path: '$driverPersonalDetails',
        },
      },
    ];

    // Add search filtering if applicable
    if (req.query.search) {
      pipeline.push({
        $match: {
          $or: [
            { 'driverPersonalDetails.firstName': { $regex: `^${req.query.search}`, $options: 'i' } },
            { 'driverPersonalDetails.phoneNumber': { $regex: `^${req.query.search}`, $options: 'i' } },
          ],
        },
      });
    }

    pipeline.push({
      $project: {
        _id: 1,
        driverId: 1,
        documentId: 1,
        documentName: '$documentInfo.documentName',
        driverName: '$driverPersonalDetails.firstName',
        phoneNumber: '$driverPersonalDetails.phoneNumber',
        userId: '$driverPersonalDetails._id',
        expiryDate: 1,
        documentStatus: 1,
      },
    });

    // Get total count first (without pagination)
    const fullResults = await DriverDocument.aggregate([...pipeline]);
    const totalResults = fullResults.length;

    // Add sorting, skip, and limit for paginated data
    const paginatedPipeline = [
      ...pipeline,
      { $sort: options.sortBy || { _id: 1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
    ];

    const expiredDocuments = await DriverDocument.aggregate(paginatedPipeline);

    const totalPages = Math.ceil(totalResults / limit);

    return {
      results: expiredDocuments,
      page,
      limit,
      totalPages,
      totalResults,
    };
  } catch (error) {
    console.error('Error fetching expired documents:', error);
    return error;
  }
};


const getSuperAdminExpiredDocuments = async (req) => {

  try {

    const filter = pick(req.query, ['name', 'role']);
    const options = pick(req.query, ['sortBy', 'limit', 'page']);
    const driverId = req.params.driverId;

    const limit = parseInt(options.limit, 10) || 10;
    const page = parseInt(options.page) || 1;

    const tenDaysFromNow = moment.utc().add(10, 'days').startOf('day');

    const totalResults = await DriverDocument.countDocuments({
      driverId: new ObjectId(driverId),
      expiryDate:{ $ne: null}
    });

    const expiredDocuments = await DriverDocument.aggregate([
      {
        $match:{
          driverId: new ObjectId(driverId),
          expiryDate:{ $ne: null}
        }
      },
      {
        $lookup: {
          from: 'drivers',
          localField: 'driverId',
          foreignField: '_id',
          as: 'driverInfo',
        },
      },
      {
        $lookup: {
          from: 'documents',
          localField: 'documentId',
          foreignField: '_id',
          as: 'documentInfo',
          pipeline:[
            {
              $match: {
                expiryDate: true
              }
            }
          ]
        },
      },
      {
        $unwind: {
          path: '$driverInfo',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: '$documentInfo',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'driverInfo.userId',
          foreignField: '_id',
          as: 'driverPersonalDetails',
        },
      },
      {
        $unwind: {
          path: '$driverPersonalDetails',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          driverId: 1,
          documentId: 1,
          documentName: '$documentInfo.documentName',
          driverName: {
            $concat: [
              { $ifNull: ['$driverPersonalDetails.firstName', ''] },
              ' ',
              { $ifNull: ['$driverPersonalDetails.lastName', ''] },
            ],
          },
          expiryDate: 1,
          documentStatus: 1,
        },
      },
    ]).sort(options.sortBy || { _id: 1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const totalPages = Math.ceil(totalResults / limit);

    return {
      results: expiredDocuments,
      page,
      limit,
      totalPages,
      totalResults,
    };

  } catch (error) {
    console.error('Error fetching expired documents:', error);
    return error
  }
};


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






module.exports = {
  queryDriverDocument,
  getDriverDocument,
  createDriverDocument,
  getDriverDocumentById,
  update,
  getExpiredDocuments,
  getDriverDocumentByDriver,
  getSuperAdminExpiredDocuments
};
