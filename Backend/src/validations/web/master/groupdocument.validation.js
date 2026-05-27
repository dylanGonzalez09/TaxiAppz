const Joi = require('joi');
const { objectId } = require('../../custom.validation');

const createGroupDocument = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    zoneId: Joi.string().required(),
    type: Joi.string().valid('driver').required(),
    status: Joi.boolean().required(),
  }),
};

const getGroupDocuments = {
  query: Joi.object().keys({
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getGroupDocument = {
  params: Joi.object().keys({
    groupDocumentId: Joi.string().custom(objectId),
  }),
};

const getGroupDocumentWithOutPagination = {};

const updateGroupDocument = {
  params: Joi.object().keys({
    groupDocumentId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string(),
      clientId: Joi.string().custom(objectId).optional(),
      status: Joi.boolean().required(),
      type: Joi.string().valid('driver').optional(),
      zoneId: Joi.string().custom(objectId).optional(),
    })
    .min(1),
};

const deleteGroupDocument = {
  params: Joi.object().keys({
    groupDocumentId: Joi.string().custom(objectId),
  }),
};

const updateGroupDocumentStatus = {
  params: Joi.object().keys({
    groupDocumentId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object().keys({
    status: Joi.boolean().required(),
  }),
};
module.exports = {
  createGroupDocument,
  getGroupDocuments,
  getGroupDocument,
  getGroupDocumentWithOutPagination,
  updateGroupDocument,
  deleteGroupDocument,
  updateGroupDocumentStatus,
};
