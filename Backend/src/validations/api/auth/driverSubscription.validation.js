// validations/sos.validation.js
const Joi = require('joi');
const { objectId } = require('../../custom.validation');

const createDriverSubscription = {
  body: Joi.object().keys({
       subScriptionId:Joi.string().custom(objectId).optional()
  }),
};

const getDriverSubscriptions = {
  query: Joi.object().keys({
    page: Joi.number().integer().default(1),
    limit: Joi.number().integer().default(10),
  }),
};

const getDriverSubscription = {
  params: Joi.object().keys({
    driverSubscriptionId: Joi.string().custom(objectId).required(),
  }),
};

const updateDriverSubscription = {
  params: Joi.object().keys({
    driverSubscriptionId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object().keys({
    subScriptionId:Joi.string().custom(objectId).optional()
  }).min(1),
};

const deleteDriverSubscription = {
  params: Joi.object().keys({
    driverSubscriptionId: Joi.string().custom(objectId).required(),
  }),
};

module.exports = {
  createDriverSubscription,
  getDriverSubscriptions,
  getDriverSubscription,
  updateDriverSubscription,
  deleteDriverSubscription,
};
