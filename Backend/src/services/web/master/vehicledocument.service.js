const { VehicleDocument, Document, GroupDocument } = require('../../../models');
const { ObjectId } = require('mongoose').Types;

const createVehicleDocument = async (vehicleDocumentBody) => {
  return VehicleDocument.create(vehicleDocumentBody);
};

const getVehicleDocument = async (vehicleId, clientId) => {
  try {
    // Convert IDs to ObjectId
    const clientObjectId = new ObjectId(clientId);
    const vehicleObjectId = new ObjectId(vehicleId);

    // Fetch active documents for the client that are of type 'vehicle'
    const documentResults = await Document.aggregate([
      {
        $match: {
          clientId: clientObjectId,
          status: true,
        },
      },
      {
        $lookup: {
          from: 'groupdocuments',
          localField: 'documentId',
          foreignField: '_id',
          as: 'groupDocumentDetails',
        },
      },
      {
        $unwind: {
          path: '$groupDocumentDetails',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: {
          'groupDocumentDetails.type': 'vehicle',
        },
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
          categoryName: '$groupDocumentDetails.name',
        },
      },
    ]);

    // Fetch vehicle-specific documents
    const vehicleDocuments = await VehicleDocument.find({
      vehicleId: vehicleObjectId,
      clientId: clientObjectId,
    }).exec();

    // Map vehicle documents by documentId for quick access
    const vehicleDocumentsMap = vehicleDocuments.reduce((map, doc) => {
      map[doc.documentId.toString()] = doc;
      return map;
    }, {});

    // Utility to format dates as DD/MM/YYYY
    const formatDate = (date) => {
      if (!date) return '';
      const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
      return new Date(date).toLocaleDateString(undefined, options);
    };

    // Merge and format results
    const mergedResults = documentResults.map((doc) => {
      const vehicleDoc = vehicleDocumentsMap[doc._id.toString()] || {};

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
        documentImage: vehicleDoc.documentImage ? `/uploads/documentImage/${vehicleDoc.documentImage}` : '',
        expiryReason: vehicleDoc.expiryReason || '',
        expiryStatus: vehicleDoc.expiryStatus || false,
        documentStatus: vehicleDoc.documentStatus || '',
        vehicleDocStatus: vehicleDoc.status || false,
        issueDateValue: formatDate(vehicleDoc.issueDate),
        expiryDateValue: formatDate(vehicleDoc.expiryDate),
        identifierValue: vehicleDoc.identifier || '',
        vehicleDocmentId: vehicleDoc._id || '',
      };
    });

    return mergedResults;
  } catch (error) {
    console.error('Error in aggregation or fetching vehicle documents:', error);
    throw error;
  }
};

const getVehicleDocumentById = async (vehicleDocumentId) => {
  return VehicleDocument.findById(vehicleDocumentId);
};

const update = async (vehicleDocumentId, updateData) => {
  return VehicleDocument.findByIdAndUpdate(vehicleDocumentId, updateData, { returnDocument: 'after' });
};

const getExpiredDocuments = async (vehicleId, clientId) => {
  const now = new Date();
  return VehicleDocument.find({
    vehicleId: new ObjectId(vehicleId),
    clientId: new ObjectId(clientId),
    expiryDate: { $lte: now, $ne: null },
  })
    .populate('documentId')
    .populate('vehicleId');
};

module.exports = {
  createVehicleDocument,
  getVehicleDocument,
  getVehicleDocumentById,
  update,
  getExpiredDocuments,
};
