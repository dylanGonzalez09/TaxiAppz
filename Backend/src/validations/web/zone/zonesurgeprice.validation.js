const Joi = require('joi');
const { objectId } = require('../../custom.validation');

const createZoneSurgePrice = {
  body: Joi.object().keys({
    zonePriceId: Joi.string().custom(objectId).allow(null),
    surgePrice: Joi.number().precision(2).required(),
    startTime: Joi.string().allow(null),
    endTime: Joi.string().allow(null),
    availableDays: Joi.string().allow(null),
    status: Joi.boolean().required(),
    createdBy: Joi.string().custom(objectId).allow(null),
  }),
};

const getZoneSurgePrices = {
  query: Joi.object().keys({
    status: Joi.boolean(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getZoneSurgePrice = {
  params: Joi.object().keys({
    zoneSurgePriceId: Joi.string().custom(objectId).required(),
  }),
};

const updateZoneSurgePrice = {
  params: Joi.object().keys({
    zoneSurgePriceId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object()
    .keys({
      zonePriceId: Joi.string().custom(objectId).allow(null),
      surgePrice: Joi.number().precision(2),
      startTime: Joi.string().allow(null),
      endTime: Joi.string().allow(null),
      availableDays: Joi.string().allow(null),
      status: Joi.boolean(),
      createdBy: Joi.string().custom(objectId).allow(null),
    })
    .min(1),
};

const deleteZoneSurgePrice = {
  params: Joi.object().keys({
    zoneSurgePriceId: Joi.string().custom(objectId).required(),
  }),
};

module.exports = {
  createZoneSurgePrice,
  getZoneSurgePrices,
  getZoneSurgePrice,
  updateZoneSurgePrice,
  deleteZoneSurgePrice,
};
