const Joi = require('joi');
const FormData = require('form-data');
const { objectId } = require('../../custom.validation');

const createVehicle = {
  FormData: Joi.object().keys({
    vehicleName: Joi.string().required(),
    capacity: Joi.number().required(),
    serviceType: Joi.string().required(),
    sortingorder: Joi.number().required(),
    categoryId: Joi.string().custom(objectId).optional(),
    status: Joi.boolean().required(),
  }),
};

const getVehicles = {
  query: Joi.object().keys({
    vehicleName: Joi.string(),
    categoryId: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getVehicle = {
  params: Joi.object().keys({
    vehicleId: Joi.string().required(),
  }),
};

const updateVehicle = {
  params: Joi.object().keys({
    vehicleId: Joi.string().required(),
  }),
  FormData: Joi.object()
    .keys({
      vehicleName: Joi.string().required(),
      capacity: Joi.number().required(),
      serviceType: Joi.string().required(),
      sortingorder: Joi.number().required(),
      categoryId: Joi.string().custom(objectId).optional(),
      clientId: Joi.string().custom(objectId).optional(),
      status: Joi.boolean().required(),
    })
    .min(1),
};

const deleteVehicle = {
  params: Joi.object().keys({
    vehicleId: Joi.string().required(),
  }),
};

const updateVehicleStatus = {
  params: Joi.object().keys({
    vehicleId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object().keys({
    status: Joi.boolean().required(),
  }),
};

module.exports = {
  createVehicle,
  getVehicles,
  getVehicle,
  updateVehicle,
  deleteVehicle,
  updateVehicleStatus,
};
