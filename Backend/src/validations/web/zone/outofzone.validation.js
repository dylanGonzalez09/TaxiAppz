const Joi = require('joi');
const FormData = require('form-data');
const { objectId } = require('../../custom.validation');

const createOutOfZone = {
  FormData: Joi.object().keys({
    kilometer: Joi.number().required(),
    price: Joi.number().required(),
    clientId: Joi.string().custom(objectId).required(),
  }),
};

const getOutOfZones = {
  query: Joi.object().keys({
    sortBy: Joi.string(),
    search: Joi.string().optional(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getOutOfZone = {
  params: Joi.object().keys({
    outOfZoneId: Joi.string().required(),
  }),
};

const updateOutOfZone = {
  params: Joi.object().keys({
    outOfZoneId: Joi.string().required(),
  }),
  FormData: Joi.object()
    .keys({
      kilometer: Joi.number().required(),
      price: Joi.number().required(),
      clientId: Joi.string().custom(objectId).required(),
      status: Joi.boolean().required(),
    })
    .min(1),
};

const deleteOutOfZone = {
  params: Joi.object().keys({
    outOfZoneId: Joi.string().required(),
  }),
};

const UpdateOutOfZoneStatus = {
  params: Joi.object().keys({
    outOfZoneId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object().keys({
    status: Joi.boolean().required(),
  }),
};

module.exports = {
  createOutOfZone,
  getOutOfZones,
  getOutOfZone,
  updateOutOfZone,
  deleteOutOfZone,
  UpdateOutOfZoneStatus,
};
