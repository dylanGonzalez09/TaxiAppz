const Joi = require('joi');
const { objectId } = require('../../custom.validation');

const createSubScription = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    validityPeriod: Joi.string().required(),
    description: Joi.string().required(),
    amount: Joi.number().required(),
    unit: Joi.string().valid('DAY', 'WEEK', 'MONTH', 'YEAR').required(),
    zoneId: Joi.string().custom(objectId).required(),
  }),
};

const getSubScription = {
  params: Joi.object().keys({
    subScriptionId: Joi.string().required(),
  }),
};

const updateSubScription = {
  params: Joi.object().keys({
    subScriptionId: Joi.string().required(),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string().optional(),
      validityPeriod: Joi.string().optional(),
      description: Joi.string().optional(),
      amount: Joi.number().optional(),
      unit: Joi.string().valid('DAY', 'WEEK', 'MONTH', 'YEAR').optional(),
      status: Joi.boolean().optional(),
      clientId: Joi.string().custom(objectId).optional(),
      zoneId: Joi.string().custom(objectId).optional(),
    })
    .min(1),
};

const deleteSubScription = {
  params: Joi.object().keys({
    subScriptionId: Joi.string().required(),
  }),
};

const updateSubScriptionStatus = {
  params: Joi.object().keys({
    subScriptionId: Joi.string().required(),
  }),
  body: Joi.object().keys({
    status: Joi.boolean().required(),
  }),
};
module.exports = {
  createSubScription,
  getSubScription,
  updateSubScription,
  deleteSubScription,
  updateSubScriptionStatus,
};
