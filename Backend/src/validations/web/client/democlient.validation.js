const Joi = require('joi');
const { objectId } = require('../../custom.validation');

// Validation for creating a client
const createClient = {
  body: Joi.object().keys({
    firstName: Joi.string().required(),
    lastName: Joi.string().optional(),
    email: Joi.string().email().required(),
    phoneNumber: Joi.string().required(),
    emergencyNumber: Joi.string().optional(),
    password: Joi.string().required(),
    roleIds: Joi.array().items(Joi.string().custom(objectId)).required(),
    subScriptionId: Joi.string().optional(),
    address: Joi.string().optional(),
    demoKey: Joi.string().optional(),
    active: Joi.boolean().optional(),
    clientCode: Joi.string().optional(),
    Startdate: Joi.date().optional(),
    Enddate: Joi.date().optional(),
    noOfUsers:Joi.number().optional(),
    noOfDrivers: Joi.number().optional(),
    features: Joi.string().optional(),
    taxiModules: Joi.string().optional(),
    status: Joi.boolean().optional(),
    demo: Joi.boolean().optional(),
    languageId: Joi.string().custom(objectId).optional(),
    userId: Joi.string().custom(objectId).optional()
  }),
};

// Validation for querying clients
const queryClients = {
  query: Joi.object().keys({
    name: Joi.string().optional(),
    role: Joi.string().custom(objectId).optional(),
    sortBy: Joi.string().optional(),
    limit: Joi.number().integer().optional(),
    page: Joi.number().integer().optional(),
    status: Joi.boolean().optional(),
  }),
};

// Validation for getting a client by ID
const getClient = {
  params: Joi.object().keys({
    clientId: Joi.string().custom(objectId).required(),
  }),
};

// Validation for getting clients without pagination
const getClientWithOutPagination = {
  query: Joi.object().keys({
    status: Joi.boolean().optional(),
  }),
};

// Validation for updating a client
const updateClient = {
  params: Joi.object().keys({
    clientId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object().keys({
    Name: Joi.string().optional(),
    firstName: Joi.string().optional(),
    lastName: Joi.string().optional(),
    email: Joi.string().email().optional(),
    phoneNumber: Joi.string().optional(),
    emergencyNumber: Joi.string().optional(),
    password: Joi.string().optional(),
    roleIds: Joi.array().items(Joi.string().custom(objectId)).optional(),
    subScriptionId: Joi.string().optional(),
    address: Joi.string().optional(),
    active: Joi.boolean().optional(),
    demoKey: Joi.string().optional(),
    clientCode: Joi.string().optional(),
    Startdate: Joi.date().optional(),
    Enddate: Joi.date().optional(),
    noOfVehicle: Joi.string().optional(),
    noOfUsers: Joi.number().optional(),
    noOfDrivers: Joi.number().optional(),
    features: Joi.string().optional(),
    taxiModules: Joi.string().optional(),
    status: Joi.boolean().optional(),
    demo: Joi.boolean().optional(),
    languageId: Joi.string().custom(objectId).optional(),
    userId: Joi.string().custom(objectId).optional()
  }).min(1), // Ensure at least one field is updated
};

// Validation for deleting a client
const deleteClient = {
  params: Joi.object().keys({
    clientId: Joi.string().custom(objectId).required(),
  }),
};

// Validation for updating client's active status
const updateActiveStatus = {
  params: Joi.object().keys({
    clientId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object().keys({
    status: Joi.boolean().required(),
  }),
};

// Validation for getting client details
const getClientDetails = {
  query: Joi.object().keys({}),
};

module.exports = {
  createClient,
  queryClients,
  getClient,
  getClientWithOutPagination,
  updateClient,
  deleteClient,
  updateActiveStatus,
  getClientDetails,
};
