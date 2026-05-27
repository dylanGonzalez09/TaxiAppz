const Joi = require('joi');
const { objectId } = require('../../custom.validation');

const createPrivillege = {
  body: Joi.object().keys({
    permissionIds: Joi.array().items(Joi.string().hex().length(24)).required(),
    roleId: Joi.string().custom(objectId).required(),
    groupName: Joi.string().required(),
  }),
};

const getPrivilleges = {
  query: Joi.object().keys({
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getPrivillege = {
  params: Joi.object().keys({
    privillegeId: Joi.string().custom(objectId),
  }),
};

const updatePrivillege = {
  params: Joi.object().keys({
    privillegeId: Joi.string().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      permissionIds: Joi.array().items(Joi.string().hex().length(24)).required(),
      roleId: Joi.string().custom(objectId),
      groupName: Joi.string(),
      clientId: Joi.string().custom(objectId).optional(),
    })
    .min(1),
};

const deletePrivillege = {
  params: Joi.object().keys({
    privillegeId: Joi.string().custom(objectId),
  }),
};

const getPrivillegesDetails = {
  query: Joi.object().keys({
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

module.exports = {
  createPrivillege,
  getPrivilleges,
  getPrivillege,
  updatePrivillege,
  deletePrivillege,
  getPrivillegesDetails,
};
