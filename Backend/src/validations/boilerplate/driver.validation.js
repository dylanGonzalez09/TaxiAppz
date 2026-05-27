const Joi = require('joi');
const FormData = require('form-data');
const { objectId } = require('../custom.validation');

const createDriver = {
  FormData: Joi.object().keys({
    firstName: Joi.string().required(),
    email: Joi.string().email().required(),
    phoneNumber: Joi.string().required(),
    roleIds: Joi.array().items(Joi.string().custom(objectId)).required(),
    country: Joi.string(),
    regDate: Joi.string().optional(),
    regTime: Joi.string().optional(),
    type: Joi.string().custom(objectId).required(),
    carModel: Joi.string().custom(objectId).required(),
    serviceLocation: Joi.string().custom(objectId).required(),
    secondaryZone: Joi.array().items(Joi.string().custom(objectId)).default([]).optional(),
    specialPrice: Joi.boolean().optional(),
    active: Joi.boolean(),
    profilePic: Joi.string(),
    carColour: Joi.string().optional(),
    vehicleBrand: Joi.string().custom(objectId).required(),
    vehicleVariant: Joi.string().custom(objectId).required(),
    licensePlateNumber: Joi.string().required(),
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
  FormData: Joi.object()
    .keys({
      firstName: Joi.string(),
      lastName: Joi.string(),
      email: Joi.string().email(),
      phoneNumber: Joi.string(),
      emergencyNumber: Joi.string(),
      password: Joi.string(),
      roleIds: Joi.array().items(Joi.string().custom(objectId)),
      gender: Joi.string(),
      language: Joi.string(),
      country: Joi.string(),
      address: Joi.string(),
      city: Joi.string(),
      specialPrice: Joi.boolean(),
      secondaryZone: Joi.array().items(Joi.string().custom(objectId)),
      state: Joi.string(),
      pincode: Joi.string(),
      type: Joi.number(),
      rating: Joi.number().integer(),
      carModel: Joi.string(),
      serviceLocation: Joi.string().custom(objectId),
      notes: Joi.string(),
      serviceCategory: Joi.string(),
      carColour: Joi.string().optional(),
      active: Joi.boolean(),
      profilePic: Joi.string(),
      vehicleBrand: Joi.string().custom(objectId).optional(),
      vehicleVariant: Joi.string().custom(objectId).optional(),
      licensePlateNumber: Joi.string().optional(),
      clientId: Joi.string().custom(objectId).optional(),
    })
    .min(1),
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
  updateActiveStatus,
};
