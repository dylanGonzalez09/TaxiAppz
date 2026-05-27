const httpStatus = require('http-status').default || require('http-status').status || require('http-status');
const ApiError = require('../../../utils/ApiError');
const { DriverDocument, Document, Driver, User, Request } = require('../../../models');
const ObjectId = require('mongoose').Types.ObjectId
const pick = require('../../../utils/pick');
const { tokenService } = require('../../../services');
const { sendNotification ,getClientId,getZoneId} = require('../../../utils/commonFunction');
const mqttService = require('../../../services/mqtt/mqtt.service');
const { mqttConfig } = require('../../../config/string')


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

    const driverRow = await Driver.findOne({ _id: driverObjectId }).select('serviceLocation carNumber carColour').lean();
    const zoneObjectId = new ObjectId(driverRow.serviceLocation);

    // Get documents separated by type
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
        $match: {
          'groupDocumentDetails.zoneId': zoneObjectId,
          'groupDocumentDetails.type': { $in: ['driver', 'vehicle'] }
        }
      },
      {
        $facet: {
          driverDocuments: [
            { $match: { 'groupDocumentDetails.type': 'driver' } },
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
            }
          ],
          vehicleDocuments: [
            { $match: { 'groupDocumentDetails.type': 'vehicle' } },
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
            }
          ]
        }
      }
    ]);

    // Fetch all driver documents
    const driverDocuments = await DriverDocument.find({
      driverId: driverObjectId,
      clientId: clientObjectId
    }).lean();

    // Create a map: key = documentId + driverVehicleId, value = driverDocument
    const driverDocumentsMap = driverDocuments.reduce((map, doc) => {
      const key = `${doc.documentId.toString()}_${doc.driverVehicleId ? doc.driverVehicleId.toString() : 'null'}`;
      map[key] = doc;
      return map;
    }, {});

    const formatDate = (date) => {
      if (!date) return '';
      const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
      return new Date(date).toLocaleDateString(undefined, options);
    };

    // Process driver documents
    const processedDriverDocuments = (documentResults[0]?.driverDocuments || []).map(doc => {
      // For driver documents, key without vehicleId
      const driverDoc = driverDocuments.find(dd => 
        dd.documentId.toString() === doc._id.toString() && !dd.driverVehicleId
      ) || {};
      
      return {
        _id: doc._id,
        documentName: doc.documentName || '',
        required: doc.required,
        identifier: doc.identifier,
        expiryDate: doc.expiryDate,
        issueDate: doc.issueDate,
        documentId: doc.documentId,
        status: doc.status,
        categoryName: doc.groupDocumentDetails?.name || '',
        documentImage: driverDoc.documentImage ? `/uploads/documentImage/${driverDoc.documentImage}` : '',
        documentStatus: driverDoc.documentStatus || '',
        issueDateValue: formatDate(driverDoc.issueDate),
        expiryDateValue: formatDate(driverDoc.expiryDate),
        identifierValue: driverDoc.identifier || '',
        driverDocumentId: driverDoc._id || '',
        isUploaded: !!driverDoc._id
      };
    });

    // Get all vehicle document templates
    const vehicleDocumentTemplates = documentResults[0]?.vehicleDocuments || [];

    const docKeyForTemplate = (doc) => (doc.documentId ? doc.documentId.toString() : doc._id.toString());

    const vehicleDocuments = vehicleDocumentTemplates.map((doc) => {
      const dk = docKeyForTemplate(doc);
      const keyNull = `${dk}_null`;
      const driverDoc =
        driverDocumentsMap[keyNull] ||
        driverDocuments.find(
          (dd) =>
            dd.documentId.toString() === dk &&
            (dd.driverVehicleId === null || dd.driverVehicleId === undefined),
        ) ||
        driverDocuments.find((dd) => dd.documentId.toString() === dk) ||
        {};

      return {
        _id: doc._id,
        documentName: doc.documentName || '',
        required: doc.required,
        identifier: doc.identifier,
        expiryDate: doc.expiryDate,
        issueDate: doc.issueDate,
        documentId: doc.documentId,
        status: doc.status,
        categoryName: doc.groupDocumentDetails?.name || '',
        documentImage: driverDoc.documentImage ? `/uploads/documentImage/${driverDoc.documentImage}` : '',
        documentStatus: driverDoc.documentStatus || '',
        issueDateValue: formatDate(driverDoc.issueDate),
        expiryDateValue: formatDate(driverDoc.expiryDate),
        identifierValue: driverDoc.identifier || '',
        driverDocumentId: driverDoc._id || '',
        driverVehicleId: driverDoc.driverVehicleId || null,
        isUploaded: !!driverDoc._id,
      };
    });

    const vehicleDocumentsByVehicle = [
      {
        vehicleInfo: {
          driverVehicleId: null,
          vehicleMake: '',
          vehicleModelName: '',
          licensePlateNumber: driverRow?.carNumber || '',
          manufactureYear: null,
          vehicleColor: driverRow?.carColour || '',
          passengerCapacity: null,
        },
        documents: vehicleDocuments,
      },
    ];

    return {
      driver: processedDriverDocuments,
      vehicles: vehicleDocumentsByVehicle,
    };

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
// const update = async (req, id, updateData, options = {}) => {

//   try {
//     let clientId = await getClientId(req);

//     const updatedDriverDocument = await DriverDocument.findByIdAndUpdate(
//       id,
//       updateData,
//       { new: true, ...options }
//     );

//     if (!updatedDriverDocument) {
//       throw new Error('Driver document not found');
//     }

//     let userDetails = await Driver.findById(updatedDriverDocument.driverId)
//     let inProgress = await getRequest(clientId, userDetails.userId);
//     // const topic = `driver/detail/` + updatedDriverDocument.driverId;

//     const topic = mqttConfig.DRIVER_DETAIL+""+updatedDriverDocument.driverId;


//     let documentDetails = await Document.find({ _id: updatedDriverDocument.documentId })

//     if (documentDetails != null && Array.isArray(documentDetails)) {
//       documentDetails = documentDetails[0];
//     }

//     if (inProgress != null && Array.isArray(inProgress)) {
//       inProgress = inProgress[0];
//       inProgress.documentStatus = inProgress.blockReason;
//     }



//     await mqttService.publishMessage(topic, inProgress).then((successMessage) => {
//     })
//     .catch((errorMessage) => {
//       console.error(errorMessage); // Will print error message if publishing fails
//     });

//     // Prepare notification data

//     if (inProgress.documentStatus === 'APPROVED') {
//       userDetails.isApprove = true;
//       userDetails.status = true; 
//     } else {
//       userDetails.isApprove = false;
//       userDetails.status = false;
//     }

//     await userDetails.save();


//     const userIds = [userDetails.userId]; 
    
//     const messageData = {
//       title: "Document Updated",
//       message: `Your document with ${documentDetails.documentName} has been ${updateData.documentStatus}.`,
//       imageName: "", // Add an optional image URL if required
//     };

//     // Send notification
//     await sendNotification(req, userIds, messageData);

//     return updatedDriverDocument;
//   } catch (error) {
//     console.error('Error updating driver document:', error);
//     throw error;
//   }
// };



const update = async (req, id, updateData, options = {}) => {
  try {
    let clientId = await getClientId(req);

    // Fetch document BEFORE update to check conditions
    const existingDriverDocument = await DriverDocument.findById(id);
    if (!existingDriverDocument) {
      throw new Error('Driver document not found');
    }

    // Fetch user details based on driver linked to document
    const userDetails = await Driver.findById(existingDriverDocument.driverId);
    if (!userDetails) {
      throw new Error('Driver not found');
    }

    const userId = userDetails.userId;
    if (!userId) {
      throw new Error('User ID not associated with driver');
    }

    const userData = await User.findById(userId).lean();
    if (!userData) {
      throw new Error('User details not found');
    }

      const activeRequest = await Request.findOne({
      driverId: existingDriverDocument.driverId,
      ...(existingDriverDocument.driverVehicleId && { driverVehicleId: existingDriverDocument.driverVehicleId }),
      isCancelled: false,
      isCompleted: false
    });


    if (activeRequest) {
      throw new Error('This driver is currently on a trip, cannot update documents.');
    }


    // if (userData.onlineBy === 1) {
    //   throw new Error('This driver is currently online, cannot update documents.');
    // }

    // Proceed with update now that checks passed
    const updatedDriverDocument = await DriverDocument.findByIdAndUpdate(
      id,
      updateData,
      { returnDocument: 'after', ...options }
    );

    // Confirm update success
    if (!updatedDriverDocument) {
      throw new Error('Driver document update failed');
    }

    // Vehicle-based validation is disabled; only driver-document rules apply.
    await handleDriverDocumentUpdate(updatedDriverDocument, userData, clientId);

    // Prepare MQTT message and send if needed
    let inProgress = await getRequest(clientId, userDetails.userId);
    const topic = mqttConfig.DRIVER_DETAIL + updatedDriverDocument.driverId;

    let documentDetails = await Document.findById(updatedDriverDocument.documentId);

    if (inProgress && Array.isArray(inProgress)) {
      inProgress = inProgress[0];
      inProgress.documentStatus = inProgress.blockReason;
    }

    await mqttService.publishMessage(topic, inProgress).catch(console.error);

    // Send notification to user
    const userIds = [userDetails.userId];
    const messageData = {
      title: "Document Updated",
      message: `Your document ${documentDetails?.documentName} has been ${updateData.documentStatus}.`,
      imageName: "",
    };

    await sendNotification(req, userIds, messageData);

    return updatedDriverDocument;

  } catch (error) {
    console.error('Error updating driver document:', error);
    throw error;
  }
};


// Handle driver document status update (existing logic)
const handleDriverDocumentUpdate = async (updatedDriverDocument, userDetails, clientId) => {
  const { driverId } = updatedDriverDocument;

  // Get all required driver documents
  const driver = await Driver.findById(driverId);
  const zoneObjectId = new ObjectId(driver.serviceLocation);

  const requiredDriverDocuments = await Document.aggregate([
    {
      $lookup: {
        from: 'groupdocuments',
        localField: 'documentId',
        foreignField: '_id',
        as: 'groupDoc'
      }
    },
    { $unwind: '$groupDoc' },
    {
      $match: {
        'groupDoc.zoneId': zoneObjectId,
        'groupDoc.type': 'driver',
        'groupDoc.status': true,
        required: true,
        status: true,
        clientId: new ObjectId(clientId)
      }
    },
    { $project: { _id: 1 } }
  ]);

  const requiredDocIds = requiredDriverDocuments.map(doc => doc._id);

  // Get all uploaded driver documents (without driverVehicleId)
 const uploadedDriverDocuments = await DriverDocument.find({
    driverId: new ObjectId(driverId),
    $or: [
      { driverVehicleId: null },
      { driverVehicleId: { $exists: false } }
    ],
    documentId: { $in: requiredDocIds },
    clientId: new ObjectId(clientId)
  });

  // Check if all driver documents are approved
  const allDriverDocsApproved = requiredDocIds.length > 0 &&
    uploadedDriverDocuments.length === requiredDocIds.length &&
    uploadedDriverDocuments.every(doc => doc.documentStatus === 'APPROVED');

    const userData = await User.findById(userDetails._id)

  if (allDriverDocsApproved) {
    userData.isApprove = true;
    userData.active = true;
    driver.isApprove = true;
    driver.status = true;
  } else {
    userData.isApprove = false;
    userData.active = false;
    driver.isApprove = false;
    driver.status = false;
  }

  await driver.save();
  await userData.save();
};


const getExpiredDocuments = async (req) => {

  try {

    const filter = pick(req.query, ['firstName', 'phoneNumber']);
    const options = pick(req.query, ['sortBy', 'limit', 'page']);

    const clientId = await getClientId(req);
    const zoneId = await getZoneId(req);
    const limit = parseInt(options.limit, 10) || 10;
    const page = parseInt(options.page) || 1;
    const today = new Date();

    const matchStage = {
      expiryDate: { $ne: null, $lt: today },
      clientId: new ObjectId(clientId)
    };

    const basePipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: 'drivers',
          localField: 'driverId',
          foreignField: '_id',
          as: 'driverInfo',
        },
      },
      { $unwind: { path: '$driverInfo', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'documents',
          localField: 'documentId',
          foreignField: '_id',
          as: 'documentInfo',
        },
      },
      { $unwind: { path: '$documentInfo', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'users',
          localField: 'driverInfo.userId',
          foreignField: '_id',
          as: 'driverPersonalDetails',
        },
      },
      { $unwind: { path: '$driverPersonalDetails', preserveNullAndEmptyArrays: true } },
    ];

    // Optional filter by zoneId (assuming it's stored in driverInfo or driverPersonalDetails)
    // if (zoneId) {
      basePipeline.push({
        $match: {
          'driverInfo.serviceLocation': new ObjectId(zoneId), // 👈 Adjust this path if zoneId is somewhere else
        },
      });
    // }

    if(req.query.search)
    {
      basePipeline.push({
        $match: {
          $or: [
            { 'driverPersonalDetails.firstName': { $regex: `^${req.query.search}`, $options: 'i' } },
            { 'driverPersonalDetails.phoneNumber': { $regex: `^${req.query.search}`, $options: 'i' } }, // 👈 ensure the correct field name
          ],
        },
      });
    }

    const countPipeline = [...basePipeline, { $count: 'total' }];
    const countResult = await DriverDocument.aggregate(countPipeline);
    const totalResults = countResult[0]?.total || 0;

    const dataPipeline = [
      ...basePipeline,
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
          phoneNumber: '$driverPersonalDetails.phoneNumber',
          userId: '$driverPersonalDetails._id',
          expiryDate: 1,
          documentStatus: 1,
        },
      },
      { $sort: options.sortBy || { _id: 1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
    ];

    const expiredDocuments = await DriverDocument.aggregate(dataPipeline);
    const totalPages = Math.ceil(totalResults / limit);

    return {
      results: expiredDocuments,
      page,
      limit,
      totalPages,
      totalResults,
    };

    // const totalResults = await DriverDocument.countDocuments({
    //   expiryDate:{ $ne: null},
    //   clientId: new ObjectId(clientId),
    // });

    // const expiredDocuments = await DriverDocument.aggregate([
    //   {
    //     $match: { 
    //       expiryDate:{ $ne: null},
    //       clientId: new ObjectId(clientId)
    //     }
    //   },
    //   {
    //     $lookup: {
    //       from: 'drivers',
    //       localField: 'driverId',
    //       foreignField: '_id',
    //       as: 'driverInfo',
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: 'documents',
    //       localField: 'documentId',
    //       foreignField: '_id',
    //       as: 'documentInfo',
    //       pipeline:[
    //         {
    //           $match: {
    //             expiryDate: true
    //           }
    //         }
    //       ]
    //     },
    //   },
    //   {
    //     $unwind: {
    //       path: '$driverInfo',
    //       preserveNullAndEmptyArrays: true,
    //     },
    //   },
    //   {
    //     $unwind: {
    //       path: '$documentInfo',
    //       preserveNullAndEmptyArrays: true,
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: 'users',
    //       localField: 'driverInfo.userId',
    //       foreignField: '_id',
    //       as: 'driverPersonalDetails',
    //     },
    //   },
    //   {
    //     $unwind: {
    //       path: '$driverPersonalDetails',
    //       preserveNullAndEmptyArrays: true,
    //     },
    //   },
    //   ...(req.query.search
    //     ? [
    //         {
    //           $match: {
    //             $or: [
    //               { 'driverPersonalDetails.firstName': { $regex: `^${req.query.search}`, $options: 'i' } },
    //               { 'driverPersonalDetails.phoneNumber': { $regex: `^${req.query.search}`, $options: 'i' } },
    //             ],
    //           },
    //         },
    //       ]
    //     : []),
    //   {
    //     $project: {
    //       _id: 1,
    //       driverId: 1,
    //       documentId: 1,
    //       documentName: '$documentInfo.documentName',
    //       driverName: '$driverPersonalDetails.firstName',
    //       phoneNumber: '$driverPersonalDetails.phoneNumber',
    //       userId : '$driverPersonalDetails._id',
    //       expiryDate: 1,
    //       documentStatus: 1,
    //     },
    //   },
    // ]).sort(options.sortBy || { _id: 1 })
    //   .skip((page - 1) * limit)
    //   .limit(limit);

    // const totalPages = Math.ceil(totalResults / limit);

    // return {
    //   results: expiredDocuments,
    //   page,
    //   limit,
    //   totalPages,
    //   totalResults,
    // };

  } catch (error) {
    console.error('Error fetching expired documents:', error);
    return error
  }
};
const getSuperAdminExpiredDocuments = async (req) => {
  try {
    // const { zoneId } = req.query; 
    const zoneId = await getZoneId(req);
    const options = pick(req.query, ['sortBy', 'limit', 'page']);
    const limit = parseInt(options.limit, 10) || 10;
    const page = parseInt(options.page, 10) || 1;
    const today = new Date();

    const matchStage = {
      expiryDate: { $ne: null, $lt: today }
    };

    const basePipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: 'drivers',
          localField: 'driverId',
          foreignField: '_id',
          as: 'driverInfo',
        },
      },
      { $unwind: { path: '$driverInfo', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'documents',
          localField: 'documentId',
          foreignField: '_id',
          as: 'documentInfo',
        },
      },
      { $unwind: { path: '$documentInfo', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'users',
          localField: 'driverInfo.userId',
          foreignField: '_id',
          as: 'driverPersonalDetails',
        },
      },
      { $unwind: { path: '$driverPersonalDetails', preserveNullAndEmptyArrays: true } },
    ];

    // Optional filter by zoneId (assuming it's stored in driverInfo or driverPersonalDetails)
    // if (zoneId) {
      basePipeline.push({
        $match: {
          'driverInfo.serviceLocation': new ObjectId(zoneId), // 👈 Adjust this path if zoneId is somewhere else
        },
      });
    // }

    if(req.query.search)
    {
      basePipeline.push({
        $match: {
          $or: [
            { 'driverPersonalDetails.firstName': { $regex: `^${req.query.search}`, $options: 'i' } },
            { 'driverPersonalDetails.phoneNumber': { $regex: `^${req.query.search}`, $options: 'i' } }, // 👈 ensure the correct field name
          ],
        },
      });
    }

    const countPipeline = [...basePipeline, { $count: 'total' }];
    const countResult = await DriverDocument.aggregate(countPipeline);
    const totalResults = countResult[0]?.total || 0;

    const dataPipeline = [
      ...basePipeline,
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
          phoneNumber: '$driverPersonalDetails.phoneNumber',
          userId: '$driverPersonalDetails._id',
          expiryDate: 1,
          documentStatus: 1,
        },
      },
      { $sort: options.sortBy || { _id: 1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
    ];

    const expiredDocuments = await DriverDocument.aggregate(dataPipeline);
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


const getRequest = async (clientId, userId) => {
  const getRequest = Driver.aggregate([
    {
      $match: {
        clientId: new ObjectId(clientId),
        userId: new ObjectId(userId)
      }
    },
    // Lookup filtered driver group documents
    {
      $lookup: {
        from: 'groupdocuments',
        let: { driverZoneId: '$serviceLocation' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$zoneId', '$$driverZoneId'] },
                  { $eq: ['$type', 'driver'] },
                  { $eq: ['$status', true] },
                  { $eq: ['$clientId', new ObjectId(clientId)] }
                ]
              }
            }
          }
        ],
        as: 'driverGroupDocuments'
      }
    },
    // Lookup filtered driver documents based on groupdocuments
    {
      $lookup: {
        from: 'documents',
        let: { 
          groupDocIds: {
            $map: {
              input: '$driverGroupDocuments',
              as: 'groupDoc',
              in: '$$groupDoc._id'
            }
          }
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $in: ['$documentId', '$$groupDocIds'] },
                  { $eq: ['$status', true] },
                  { $eq: ['$clientId', new ObjectId(clientId)] }
                ]
              }
            }
          }
        ],
        as: 'filteredDocuments'
      }
    },
    // Lookup all driver documents
    {
      $lookup: {
        from: 'driverdocuments',
        localField: '_id',
        foreignField: 'driverId',
        as: 'allDriverDocuments'
      }
    },
    // Add fields to separate driver and vehicle documents
    {
      $addFields: {
        driverDocumentDetails: {
          $filter: {
            input: '$allDriverDocuments',
            as: 'doc',
            cond: { $eq: [{ $ifNull: ['$$doc.driverVehicleId', null] }, null] }
          }
        },
        vehicleDocumentDetails: {
          $filter: {
            input: '$allDriverDocuments',
            as: 'doc',
            cond: { $ne: [{ $ifNull: ['$$doc.driverVehicleId', null] }, null] }
          }
        }
      }
    },
    // Other lookups remain the same...
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
    // Vehicle counts from Driver document (no drivervehicles collection)
    {
      $addFields: {
        totalVehicleCount: {
          $cond: [{ $ne: [{ $ifNull: ['$type', null] }, null] }, 1, 0],
        },
        activeVehicleCount: {
          $cond: [{ $eq: ['$isApprove', true] }, 1, 0],
        },
      },
    },
    // Calculate active and blockReason based on DRIVER documents only
    {
      $addFields: {
        active: {
          $cond: [
            {
              $or: [
                { $eq: [{ $size: '$driverDocumentDetails' }, 0] },
                {
                  $gt: [
                    {
                      $size: {
                        $filter: {
                          input: '$driverDocumentDetails',
                          as: 'doc',
                          cond: {
                            $or: [
                              { $eq: ['$$doc.documentStatus', 'DENIED'] },
                              {
                                $and: [
                                  { $ifNull: ['$$doc.expiryDate', false] },
                                  { $lt: ['$$doc.expiryDate', new Date()] }
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
                // Check if all required driver documents are uploaded
                {
                  $ne: [
                    {
                      $size: {
                        $filter: {
                          input: '$filteredDocuments',
                          as: "doc",
                          cond: { $eq: ["$$doc.required", true] }
                        }
                      }
                    },
                    {
                      $size: {
                        $filter: {
                          input: '$filteredDocuments',
                          as: "doc",
                          cond: {
                            $and: [
                              { $eq: ["$$doc.required", true] },
                              {
                                $in: [
                                  "$$doc._id",
                                  {
                                    $map: {
                                      input: "$driverDocumentDetails",
                                      as: "driverDoc",
                                      in: "$$driverDoc.documentId"
                                    }
                                  }
                                ]
                              }
                            ]
                          }
                        }
                      }
                    }
                  ]
                },
                {
                  $gt: [
                    {
                      $size: {
                        $filter: {
                          input: '$driverDocumentDetails',
                          as: 'doc',
                          cond: { $ne: ['$$doc.documentStatus', 'APPROVED'] }
                        }
                      }
                    },
                    0
                  ]
                }
              ]
            },
            false,
            true
          ]
        },
        blockReason: {
          $cond: {
            if: {
              $ne: [
                {
                  $size: {
                    $filter: {
                      input: '$filteredDocuments',
                      as: "doc",
                      cond: { $eq: ["$$doc.required", true] }
                    }
                  }
                },
                {
                  $size: {
                    $filter: {
                      input: '$filteredDocuments',
                      as: "doc",
                      cond: {
                        $and: [
                          { $eq: ["$$doc.required", true] },
                          {
                            $in: [
                              "$$doc._id",
                              {
                                $map: {
                                  input: "$driverDocumentDetails",
                                  as: "driverDoc",
                                  in: "$$driverDoc.documentId"
                                }
                              }
                            ]
                          }
                        ]
                      }
                    }
                  }
                }
              ]
            },
            then: "DOCUMENT_NOT_UPLOADED",
            else: {
              $cond: {
                if: {
                  $gt: [
                    {
                      $size: {
                        $filter: {
                          input: '$driverDocumentDetails',
                          as: 'doc',
                          cond: { $eq: ['$$doc.documentStatus', 'WAITINGFORAPPROVAL'] }
                        }
                      }
                    },
                    0
                  ]
                },
                then: 'WAITINGFORAPPROVAL',
                else: {
                  $cond: {
                    if: { $eq: [{ $size: '$driverDocumentDetails' }, 0] },
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
                                      { $ifNull: ['$$doc.expiryDate', false] },
                                      { $lt: ['$$doc.expiryDate', new Date()] }
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
                            if: {
                              $eq: [
                                {
                                  $size: {
                                    $filter: {
                                      input: '$driverDocumentDetails',
                                      as: 'doc',
                                      cond: { $ne: ['$$doc.documentStatus', 'APPROVED'] }
                                    }
                                  }
                                },
                                0
                              ]
                            },
                            then: 'APPROVED',
                            else: 'DENIED'
                          }
                        }
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
        totalVehicleCount: { $ifNull: ['$totalVehicleCount', 0] },
        activeVehicleCount: { $ifNull: ['$activeVehicleCount', 0] },
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
