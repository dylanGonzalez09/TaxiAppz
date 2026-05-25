const Joi = require('joi');
const FormData = require('form-data');
const { objectId } = require('../../custom.validation');


const createVehicleModel = {
    FormData: Joi.object().keys({
        modelname: Joi.string().required(),
        vehicleId: Joi.string().custom(objectId).required(),
        status: Joi.boolean().required(),
    }),
};

const getVehicleModels = {
    query: Joi.object().keys({
        modelname: Joi.string(),
        vehicleId: Joi.string(),
        sortBy: Joi.string(),
        limit: Joi.number().integer(),
        page: Joi.number().integer(),
    }),
};

const getVehicleModel = {
    params: Joi.object().keys({
        vehicleModelId: Joi.string().required(),
    }),
};

const getVehicleModelbyVehicle = {
  params: Joi.object().keys({
      vehicleId: Joi.string().required(),
  }),
};

const updateVehicleModel = {
    params: Joi.object().keys({
        vehicleModelId: Joi.string().required(),
    }),
    FormData: Joi.object().keys({
        modelname: Joi.string(),
        vehicleId: Joi.string(),
        clientId: Joi.string().custom(objectId).optional(),
        status: Joi.boolean(),
    }).min(1),
};

const deleteVehicleModel = {
    params: Joi.object().keys({
        vehicleModelId: Joi.string().required(),
    }),
};

const updateVehicleStatus = {
  params: Joi.object().keys({
    vehicleModelId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object().keys({
    status: Joi.boolean().required(),
  }),
};

module.exports = {
    createVehicleModel,
    getVehicleModels,
    getVehicleModel,
    updateVehicleModel,
    deleteVehicleModel,
    getVehicleModelbyVehicle,
    updateVehicleStatus
};
