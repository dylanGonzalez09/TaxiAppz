const Joi = require('joi');
const { objectId } = require('../../custom.validation');

const getVehicleDocument = {
  params: Joi.object().keys({
    vehicleId: Joi.string().custom(objectId).required(),
  }),
};

const createVehicleDocument = {
  FormData: Joi.object().keys({
    documentImage: Joi.string().optional(), // The file upload validation is handled separately
    expiryDate: Joi.date().iso().allow(null),
    expriyReason: Joi.string().allow(null),
    expriyStatus: Joi.boolean().required(),
    identifier: Joi.string().allow(null),
    issueDate: Joi.date().iso().allow(null),
    documentStatus: Joi.string().valid('NOTUPLOADED', 'WAITINGFORAPPROVAL', 'APPROVED', 'EXPIRED', 'DENIED').required(),
    vehicleId: Joi.string().custom(objectId).required(),
  }),
};

const updateVehicleDocument = {
  params: Joi.object().keys({
    vehicleDocumentId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object().keys({
    documentImage: Joi.string().optional(),
    expiryDate: Joi.date().iso().allow(null).optional(),
    expiryReason: Joi.string().allow(null).optional(),
    expiryStatus: Joi.boolean().optional(),
    identifier: Joi.string().allow(null).optional(),
    issueDate: Joi.date().iso().allow(null).optional(),
    documentStatus: Joi.string().valid('NOTUPLOADED', 'WAITINGFORAPPROVAL', 'APPROVED', 'EXPIRED', 'DENIED').optional(),
    vehicleId: Joi.string().custom(objectId).optional(),
    status: Joi.boolean().optional(),
  }),
};

const updateVehicleDocumentStatus = {
  params: Joi.object().keys({
    vehicleDocumentId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object().keys({
    documentStatus: Joi.string().valid('NOTUPLOADED', 'WAITINGFORAPPROVAL', 'APPROVED', 'EXPIRED', 'DENIED').required(),
  }),
};

module.exports = {
  getVehicleDocument,
  createVehicleDocument,
  updateVehicleDocument,
  updateVehicleDocumentStatus,
};
