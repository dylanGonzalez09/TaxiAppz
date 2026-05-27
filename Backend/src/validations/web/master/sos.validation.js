// validations/sos.validation.js
const Joi = require('joi');
const { objectId } = require('../../custom.validation');

const createSOS = {
  body: Joi.object().keys({
    phoneNumber: Joi.string().trim().required(),
    title: Joi.string().trim().required(),
    status: Joi.number().default(1),
  }),
};

const getSOSs = {
  query: Joi.object().keys({
    page: Joi.number().integer().default(1),
    limit: Joi.number().integer().default(10),
  }),
};

const getSOS = {
  params: Joi.object().keys({
    sosId: Joi.string().custom(objectId).required(),
  }),
};

const updateSOS = {
  params: Joi.object().keys({
    sosId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object()
    .keys({
      phoneNumber: Joi.string().trim().optional(),
      title: Joi.string().trim().optional(),
      status: Joi.number().optional(),
    })
    .min(1),
};

const deleteSOS = {
  params: Joi.object().keys({
    sosId: Joi.string().custom(objectId).required(),
  }),
};

module.exports = {
  createSOS,
  getSOSs,
  getSOS,
  updateSOS,
  deleteSOS,
};
