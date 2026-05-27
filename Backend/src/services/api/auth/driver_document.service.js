const httpStatus = require('http-status').default || require('http-status').status || require('http-status');
const ApiError = require('../../../utils/ApiError');
const { DriverDocument, Document } = require('../../../models');

const Driver = require('../../../models/boilerplate/driver.model');

const ObjectId = require('mongoose').Types.ObjectId
const tokenService = require('../../token.service');
const { required } = require('joi');

const {getUserId,getClientId,getDriverId} = require('../../../utils/commonFunction')



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
const getDriverDocumentByDriver = async (req, driverVehicleId = null) => {

  try {
    const clientId = await getClientId(req);
    const driverId = await getDriverId(req);

    const zoneData = await Driver.findOne({ _id: driverId }).select('serviceLocation').lean();
    if (!zoneData) throw new ApiError(404, 'Driver zone not found');

    const driverObjectId = new ObjectId(driverId);
    const clientObjectId = new ObjectId(clientId);

    const zoneObjectId = new ObjectId(zoneData.serviceLocation);
    // Fetch all uploaded driver documents once for mapping
    const driverDocuments = await DriverDocument.find({
      driverId: driverObjectId,
      clientId: clientObjectId,
      driverVehicleId : driverVehicleId || null
    }).lean();

    const driverDocumentsMap = driverDocuments.reduce((map, doc) => {
      map[doc.documentId.toString()] = doc;
      return map;
    }, {});

    // Helper to format dates consistently
    const formatDate = (date) => {
      if (!date) return null;
      const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
      return new Date(date).toLocaleDateString(undefined, options);
    };

    const currentDate = new Date();

    // Aggregate documents (driver and vehicle separately) filtered by zone and client
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
      { $unwind: { path: '$groupDocumentDetails', preserveNullAndEmptyArrays: true } },
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
                imageRequired: 1,
                documentId: 1,
                documentStatus: 1,
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
                imageRequired: 1,
                documentId: 1,
                documentStatus: 1,
                status: 1,
                clientId: 1,
                'groupDocumentDetails.name': 1
              }
            }
          ]
        }
      }
    ]);

    // Helper to group and annotate documents
    const processDocuments = (documents) => {
      return documents.reduce((acc, doc) => {
        const driverDoc = driverDocumentsMap[doc._id.toString()] || {};

        const driverDocumentImg = driverDoc.documentImage ? `/uploads/documentImage/${driverDoc.documentImage}` : null;

        const expiryDate = driverDoc.expiryDate ? new Date(driverDoc.expiryDate) : null;
        const expiryStatus = expiryDate && expiryDate < currentDate;

        const getDocumentEntry = {
          id: doc._id || null,
          document_name: doc.documentName || '',
          zone_id: zoneObjectId,
          isRequired: doc.required,
          isIdentifierRequired: doc.identifier,
          isExpiryDateRequired: doc.expiryDate,
          isImageRequired: doc.imageRequired,
          status: doc.status,
          group_by: doc.documentId,
          is_uploaded: !!driverDoc.documentImage,
          document_image: driverDocumentImg || '',
          documentStatus: driverDoc.documentStatus || null,
          expiryDate: driverDoc.expiryDate ? formatDate(driverDoc.expiryDate) : null,
          issueDate: driverDoc.issueDate ? formatDate(driverDoc.issueDate) : null,
          identifier: driverDoc.identifier || null,
          expiryStatus: expiryStatus,
          driverVehicleId: driverDoc.driverVehicleId || null  // Important for next step
        };

        if (!acc[doc.documentId]) {
          acc[doc.documentId] = {
            id: doc.documentId,
            zone_id: zoneObjectId,
            name: doc.groupDocumentDetails?.name || '',
            status: 1,
            document_count: 0,
            upload_status: !!driverDoc.documentImage,
            get_document: []
          };
        }

        acc[doc.documentId].get_document.push(getDocumentEntry);
        acc[doc.documentId].document_count = acc[doc.documentId].get_document.length;

        if (driverDoc.documentImage) {
          acc[doc.documentId].upload_status = true;
        }

        return acc;
      }, {});
    };

    let driverDocs = documentResults[0]?.driverDocuments || [];
    let vehicleDocs = documentResults[0]?.vehicleDocuments || [];

    const groupedDriverDocuments = processDocuments(driverDocs);
    const groupedVehicleDocuments = processDocuments(vehicleDocs);

    // If driverVehicleId passed, mark which vehicle docs belong to it
    if (driverVehicleId && Array.isArray(groupedVehicleDocuments)) {
      for (const group of Object.values(groupedVehicleDocuments)) {
        group.get_document = group.get_document.map(doc => {
          doc.belongsToCurrentVehicle = (doc.driverVehicleId === driverVehicleId);
          return doc;
        });
      }
    }

    return {
      driver: Object.values(groupedDriverDocuments),
      vehicle: Object.values(groupedVehicleDocuments)
    };

  } catch (error) {
    console.error('Error in fetching documents:', error);
    throw error;
  }
};




// Find a driver document
const findDriverDocument = async (query) => {
  const data = await DriverDocument.findOne(query);
  return  data
  };

  // Update a driver document
  const updateDriverDocument = async (query, updateData) => {
    return await DriverDocument.findOneAndUpdate(query, updateData, {
      returnDocument: 'after', // Return the updated document
      upsert: false, // Do not create a new document if none is found
    });
  };



module.exports = {
    createDriverDocument,
    getDriverDocumentByDriver,
    updateDriverDocument,
    findDriverDocument,
};
