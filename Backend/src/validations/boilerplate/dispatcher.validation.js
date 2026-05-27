const Joi = require('joi');
const { password, objectId } = require('../custom.validation');

const createDispatcher = {
  body: Joi.object().keys({
    firstName: Joi.string().optional(),
    lastName: Joi.string().optional(),
    email: Joi.string().email().optional(),
    phoneNumber: Joi.string().optional(),
    roleIds: Joi.array().items(Joi.string().custom(objectId)).required(),
    address: Joi.string().optional(),
    active: Joi.boolean().default(true),
    location: Joi.string().optional(),
    serviceType: Joi.string().optional(),
    userId: Joi.string().custom(objectId).optional(),
    clientId: Joi.string().custom(objectId).optional(),
    password: Joi.string().required().custom(password),
    language: Joi.string().default('en'),
    image: Joi.string(),
  }),
};

const getDispatchers = {
  query: Joi.object().keys({
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getDispatcher = {
  params: Joi.object().keys({
    dispatcherId: Joi.string().custom(objectId).required(),
  }),
};

const updateDispatcher = {
  params: Joi.object().keys({
    dispatcherId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object()
    .keys({
      firstName: Joi.string().optional(),
      lastName: Joi.string().optional(),
      email: Joi.string().email().optional(),
      phoneNumber: Joi.string().optional(),
      roleIds: Joi.array().items(Joi.string().custom(objectId)).required(),
      address: Joi.string().optional(),
      active: Joi.boolean().default(true),
      location: Joi.string().optional(),
      serviceType: Joi.string().optional(),
      userId: Joi.string().custom(objectId).optional(),
      clientId: Joi.string().custom(objectId).optional(),
      password: Joi.string().required().custom(password),
      language: Joi.string().default('en'),
      image: Joi.string(),
    })
    .min(1),
};

const deleteDispatcher = {
  params: Joi.object().keys({
    dispatcherId: Joi.string().custom(objectId).required(),
  }),
};

const updateActiveStatus = {
  params: Joi.object().keys({
    id: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object().keys({
    status: Joi.boolean().required().messages({
      'boolean.base': 'Active status must be a boolean',
      'any.required': 'Active status is required',
    }),
  }),
};

module.exports = {
  createDispatcher,
  getDispatchers,
  getDispatcher,
  updateDispatcher,
  deleteDispatcher,
  updateActiveStatus,
};
