const Joi = require('joi');
const { objectId } = require('../../custom.validation');

const uploadDriverDocument = {
  body: Joi.object()
    .keys({
      documentId: Joi.string().custom(objectId).required(),
      driverVehicleId: Joi.string().custom(objectId).optional(),
      expiryDate: Joi.date().iso().allow(null).optional(),
      issueDate: Joi.date().iso().allow(null).optional(),
      identifier: Joi.string().allow(null, '').optional(),
    })
    .unknown(true), // Allow multipart form fields (e.g. documentImage) - file handled by multer
};

const updateDocumentDetails = {
  body: Joi.object().keys({
    documentId: Joi.string().custom(objectId).required(),
    driverVehicleId: Joi.string().custom(objectId).optional(),
    expiryDate: Joi.date().iso().allow(null).optional(),
    issueDate: Joi.date().iso().allow(null).optional(),
    identifier: Joi.string().allow(null, '').optional(),
  }),
};

module.exports = {
  uploadDriverDocument,
  updateDocumentDetails,
};
