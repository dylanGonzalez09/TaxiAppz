const Joi = require('joi');
const { objectId } = require('../../custom.validation');

const getDriverDocument = {
  
};


const createDriverDocument = {
  FormData: Joi.object().keys({
    documentImage: Joi.string().optional(), // The file upload validation is handled separately
    expiryDate: Joi.date().iso().allow(null),
    expriyReason: Joi.string().allow(null),
    expriyStatus: Joi.boolean().required(),
    identifier: Joi.string().allow(null),
    issueDate: Joi.date().iso().allow(null),
    documentStatus: Joi.string().valid('NOTUPLOADED', 'WAITINGFORAPPROVAL', 'APPROVED', 'EXPIRED', 'DENIED').required(),
    documentId: Joi.string().custom(objectId).required(),
  }),
};

const updateDriverDocument = {
  params: Joi.object().keys({
    driverDocumentId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object().keys({
    documentImage: Joi.string().optional(), // The file upload validation is handled separately
    expiryDate: Joi.date().iso().allow(null).optional(),
    expriyReason: Joi.string().allow(null).optional(),
    expriyStatus: Joi.boolean().optional(),
    identifier: Joi.string().allow(null).optional(),
    issueDate: Joi.date().iso().allow(null).optional(),
    documentStatus: Joi.string().valid('NOTUPLOADED', 'WAITINGFORAPPROVAL', 'APPROVED', 'EXPIRED', 'DENIED').optional(),
    documentId: Joi.string().custom(objectId).optional(),
  }),
};


const getDriverDocuments = {
  query: Joi.object().keys({
    sortBy: Joi.string().optional(),
    limit: Joi.number().integer().optional(),
    page: Joi.number().integer().optional(),
  }),
};

const deleteDriverDocument = {
  params: Joi.object().keys({
    driverDocumentId: Joi.string().custom(objectId).required(),
  }),
};

const updateDriverDocumentStatus = {
  params: Joi.object().keys({
    driverDocumentId: Joi.string().required(),
  }),
  body: Joi.object().keys({
    documentStatus: Joi.string().optional()
  }),
};



module.exports = {
  getDriverDocument,
  createDriverDocument,
  updateDriverDocument,
  getDriverDocument,
  getDriverDocuments,
  deleteDriverDocument,
  updateDriverDocumentStatus
};
