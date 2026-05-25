const Joi = require('joi');
const { objectId } = require('../custom.validation');

const createSubScription = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    validityPeriod: Joi.string().required(),
    description: Joi.string().required(),
    noOfDrivers: Joi.number().required(),
    noOfUsers: Joi.number().required(),
    assignDriverManually :  Joi.boolean().optional(),
    type: Joi.string().valid('CORPORATE', 'TAXI'),
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
  body: Joi.object().keys({
    name: Joi.string().optional(),
    validityPeriod: Joi.string().optional(),
    description: Joi.string().optional(),
    noOfDrivers: Joi.number().optional(),
    noOfUsers: Joi.number().required(),
    assignDriverManually :  Joi.boolean().optional(),
    status: Joi.boolean().optional(),
    clientId: Joi.string().custom(objectId).optional(),
    type: Joi.string().valid('CORPORATE', 'TAXI')
  }).min(1),
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
  updateSubScriptionStatus
};
