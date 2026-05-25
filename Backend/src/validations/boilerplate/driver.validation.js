const Joi = require('joi');
const { objectId } = require('../custom.validation');
const FormData = require('form-data');

const createDriver = {
  FormData: Joi.object().keys({
    firstName: Joi.string().required(),
    lastName: Joi.string().optional(),
    email: Joi.string().email().optional().allow("", null),
    phoneNumber: Joi.string().required(),
    roleIds: Joi.array().items(Joi.string().custom(objectId)).required(),
    gender: Joi.string(),
    language: Joi.string(),
    country: Joi.string(),
    address: Joi.string(),
    type: Joi.number().required(),
    carModel: Joi.string().required(),
    serviceLocation: Joi.string().custom(objectId).required(),
    notes: Joi.string(),
    rating: Joi.number().integer(),
    serviceCategory: Joi.string().required(),
    referralCode: Joi.string().optional(),
    // company: Joi.string().when('serviceCategory', {
    //   is: 'Company',
    //   then: Joi.required().messages({
    //     'any.required': 'Company is required when service category is Company',
    //   }),
    // }),
    active: Joi.boolean(),
    profilePic: Joi.string()
  }),
};

const getDrivers = {
  query: Joi.object().keys({
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getDriver = {
  params: Joi.object().keys({
    driverId: Joi.string().custom(objectId).required(),
  }),
};

const getDriversWithoutPagination = {
  query: Joi.object().keys({}),
};

const updateDriver = {
  params: Joi.object().keys({
    driverId: Joi.string().custom(objectId).required(),
  }),
  FormData: Joi.object().keys({
    firstName: Joi.string(),
    lastName: Joi.string(),
    email: Joi.string().email().optional().allow("", null),
    phoneNumber: Joi.string(),
    emergencyNumber: Joi.string(),
    password: Joi.string(),
    roleIds: Joi.array().items(Joi.string().custom(objectId)),
    gender: Joi.string(),
    language: Joi.string(),
    country: Joi.string(),
    address: Joi.string(),
    city: Joi.string(),
    state: Joi.string(),
    pincode: Joi.string(),
    type: Joi.number(),
    rating: Joi.number().integer(),
    carModel: Joi.string(),
    serviceLocation: Joi.string().custom(objectId),
    notes: Joi.string(),
    serviceCategory: Joi.string(),
    active: Joi.boolean(),
    profilePic: Joi.string(),
    clientId: Joi.string().custom(objectId).optional()
  }).min(1), // Ensure at least one field is being updated
};

const deleteDriver = {
  params: Joi.object().keys({
    driverId: Joi.string().custom(objectId).required(),
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
  createDriver,
  getDrivers,
  getDriver,
  getDriversWithoutPagination,
  updateDriver,
  deleteDriver,
  updateActiveStatus
};
