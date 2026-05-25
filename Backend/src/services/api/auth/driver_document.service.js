const httpStatus = require('http-status');
const ApiError = require('../../../utils/ApiError');
const { DriverDocument, Document } = require('../../../models');

const Driver = require('../../../models/boilerplate/driver.model');

const ObjectId = require('mongoose').Types.ObjectId
const tokenService = require('../../token.service');
const { required } = require('joi');





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

    let driverId = null;

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(httpStatus.UNAUTHORIZED).send({ message: 'Authorization header is missing or invalid' });
        return;
    }
    // Remove the 'Bearer ' prefix and get the token
    const token = authHeader.substring(7);

    const user = await tokenService.verifyTokenAndGetUser(token);

    userId = user.id
  
  
    const driver = await Driver.find({ userId : userId })





    if (driver.length > 0) {
        driverId = driver[0]._id;
    }

    return driverId;
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
 * @param {ObjectId} clientId
 * @returns {Promise<Object>}
 */
const getDriverDocumentByDriver = async (req) => {
    try {

        let clientId = await getClientId(req);
        let driverId = await getUserId(req);

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
                    imageRequired: 1,
                    documentId: 1,
                    documentStatus: 1,
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
                id: doc._id || null,
                document_name: doc.documentName || '',
                zone_id: 1,
                isRequired: doc.required,
                isIdentifierRequired: doc.identifier,
                isExpiryDateRequired: doc.expiryDate,
                // isIssueDateRequired: doc.issueDate,
                isImageRequired: doc.imageRequired,
                status: doc.status,
                group_by: doc.documentId,
                is_uploaded: driverDoc.documentImage ? true : false,
                document_image: driverDocumentImg || '',
                documentStatus: driverDoc.documentStatus,
                expiryDate: driverDoc.expiryDate ? formatDate(driverDoc.expiryDate) : null,
                issueDate: driverDoc.issueDate ? formatDate(driverDoc.issueDate) : null,
                identifier: driverDoc.identifier || null,
                expiryStatus: expiryStatus
            };

            if (!acc[doc.documentId]) {
                acc[doc.documentId] = {
                    id: doc.documentId,
                    zone_id: 1,
                    name: doc.categoryName || '',
                    status: 1,
                    document_count: 0,
                    upload_status: driverDoc.documentImage ? true : false,
                    get_document: []
                };
            }


            acc[doc.documentId].get_document.push(getDocumentEntry);
            acc[doc.documentId].document_count = acc[doc.documentId].get_document.length; // Update the document_count

            return acc;
        }, {});

        return Object.values(groupedDocuments);
    } catch (error) {
        console.error('Error in aggregation or fetching driver documents:', error);
        return { success: false, message: 'Error fetching documents.' };
    }
};



// Find a driver document
const findDriverDocument = async (query) => {
    return await DriverDocument.findOne(query);
  };
  
  // Update a driver document
  const updateDriverDocument = async (query, updateData) => {
    return await DriverDocument.findOneAndUpdate(query, updateData, {
      new: true, // Return the updated document
      upsert: false, // Do not create a new document if none is found
    });
  };



module.exports = {
    createDriverDocument,
    getDriverDocumentByDriver,
    updateDriverDocument,
    findDriverDocument,
};
