const Joi = require('joi');
const { password, objectId } = require('../custom.validation');

const createCompany = {
  body: Joi.object().keys({
    companyName: Joi.string().required(),
    companyCode: Joi.string().required(),
    alternativeNumber: Joi.string().optional(),
    commission: Joi.string().required(),
    noOfVehicle: Joi.string().required(),
    status: Joi.boolean().required(),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().email().required(),
    phoneNumber: Joi.string().required(),
    emergencyNumber: Joi.string(),
    roleIds: Joi.array().items(Joi.string().custom(objectId)).required(),
    gender: Joi.string(),
    language: Joi.string().custom(objectId),
    address: Joi.string(),
    country: Joi.string(),
    password: Joi.string().custom(password),
    active: Joi.boolean().required(),
  }),
};

const getCompanies = {
  query: Joi.object().keys({
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getCompany = {
  params: Joi.object().keys({
    companyId: Joi.string().custom(objectId),
  }),
};

const updateCompany = {
  params: Joi.object().keys({
    companyId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      userId: Joi.string().custom(objectId),
      companyName: Joi.string(),
      companyCode: Joi.string(),
      alternativeNumber: Joi.string(),
      commission: Joi.string(),
      noOfVehicle: Joi.string(),
      status: Joi.boolean(),
      firstName: Joi.string(),
      lastName: Joi.string(),
      email: Joi.string().email(),
      phoneNumber: Joi.string(),
      emergencyNumber: Joi.string(),
      roleIds: Joi.array().items(Joi.string().custom(objectId)),
      gender: Joi.string(),
      language: Joi.string().default('en'),
      address: Joi.string(),
      country: Joi.string(),
      userId:Joi.string(),
      active: Joi.boolean(),
      clientId: Joi.string().custom(objectId).optional()
    })
    .min(1),
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


const deleteCompany = {
  params: Joi.object().keys({
    companyId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createCompany,
  getCompanies,
  getCompany,
  updateCompany,
  deleteCompany,
  updateActiveStatus
};
