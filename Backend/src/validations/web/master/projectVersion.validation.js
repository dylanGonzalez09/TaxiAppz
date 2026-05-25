const Joi = require('joi');
const { objectId } = require('../../custom.validation');

const createProjectVersion = {
  body: Joi.object().keys({
    versionNumber: Joi.string().required(),
    versionCode: Joi.string().required(),
    description: Joi.string().required(),
    applicationType: Joi.string().required()
    }),
};

const getProjectVersions = {
  query: Joi.object().keys({
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getProjectVersion = {
  params: Joi.object().keys({
    versionId: Joi.string().custom(objectId),
  }),
};

const getProjectVersionCode = {
  params: Joi.object().keys({
    versionCode: Joi.string().required(),
  }),
};

const updateProjectVersion = {
  params: Joi.object().keys({
    versionId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      versionNumber: Joi.string(),
      versionCode: Joi.string(),
      description: Joi.string(),
      applicationType: Joi.string(),
      clientId: Joi.string().custom(objectId).optional(),
      status: Joi.boolean(),
    })
    .min(1),
};

const deleteProjectVersion = {
  params: Joi.object().keys({
    versionId: Joi.string().custom(objectId),
  }),
};

const updateVersionStatus = {
  params: Joi.object().keys({
    versionId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object().keys({
    status: Joi.boolean().required(),
  }),
};

module.exports = {
  createProjectVersion,
  getProjectVersions,
  getProjectVersion,
  updateProjectVersion,
  deleteProjectVersion,
  getProjectVersionCode,
  updateVersionStatus
};
