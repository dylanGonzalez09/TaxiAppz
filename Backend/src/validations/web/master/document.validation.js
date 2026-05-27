const Joi = require('joi');
const { objectId } = require('../../custom.validation');

const createDocument = {
  body: Joi.object().keys({
    documentName: Joi.string().required(),
    required: Joi.boolean().required(),
    identifier: Joi.boolean().required(),
    expiryDate: Joi.boolean().required(),
    issueDate: Joi.boolean().required(),
    imageRequired: Joi.boolean().required(),
    documentId: Joi.string().custom(objectId).required(),
    status: Joi.boolean().required(),
  }),
};

const createDocuments = {
  body: Joi.object().keys({
    newDocument: Joi.array()
      .items(
        Joi.object({
          documentName: Joi.string().required(),
          required: Joi.boolean().required(),
          identifier: Joi.boolean().required(),
          expiryDate: Joi.boolean().required(),
          issueDate: Joi.boolean().required(),
          imageRequired: Joi.boolean().required(),
          documentId: Joi.string().required(), // Ensure this is a valid ObjectId
          status: Joi.boolean().required(),
        }),
      )
      .required(),
  }),
};

const getDocuments = {
  query: Joi.object().keys({
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getDocument = {
  params: Joi.object().keys({
    documentId: Joi.string().custom(objectId),
  }),
};

const getDocumentWithOutPagination = {
  params: Joi.object().keys({
    documentId: Joi.string().custom(objectId),
  }),
};

const updateDocument = {
  params: Joi.object().keys({
    documentId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object()
    .keys({
      documentName: Joi.string(),
      required: Joi.boolean(),
      identifier: Joi.boolean(),
      expiryDate: Joi.boolean(),
      issueDate: Joi.boolean(),
      imageRequired: Joi.boolean().required(),
      documentId: Joi.string().custom(objectId),
      clientId: Joi.string().custom(objectId).optional(),
      status: Joi.boolean(),
    })
    .min(1),
};

const deleteDocument = {
  params: Joi.object().keys({
    documentId: Joi.string().custom(objectId),
  }),
};

const updateDocumentStatus = {
  params: Joi.object().keys({
    documentId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object().keys({
    status: Joi.boolean().required(),
  }),
};

module.exports = {
  createDocument,
  createDocuments,
  getDocuments,
  getDocument,
  getDocumentWithOutPagination,
  updateDocument,
  deleteDocument,
  updateDocumentStatus,
};
