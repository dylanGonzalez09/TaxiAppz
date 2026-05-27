const Joi = require('joi');
const { objectId } = require('../../custom.validation');

const createVehicleVariant = {
  body: Joi.object().keys({
    variantName: Joi.string().required(),
    description: Joi.string().optional().allow(''),
    vehicleModelId: Joi.string().custom(objectId).required(),
    status: Joi.boolean().optional(),
  }),
};

const getVehicleVariant = {
  params: Joi.object().keys({
    vehicleVariantId: Joi.string().required(),
  }),
};

const updateVehicleVariant = {
  params: Joi.object().keys({
    vehicleVariantId: Joi.string().required(),
  }),
  body: Joi.object()
    .keys({
      variantName: Joi.string(),
      description: Joi.string().optional().allow(''),
      status: Joi.boolean(),
    })
    .min(1),
};

const deleteVehicleVariant = {
  params: Joi.object().keys({
    vehicleVariantId: Joi.string().required(),
  }),
};

const updateVehicleVariantStatus = {
  params: Joi.object().keys({
    vehicleVariantId: Joi.string().required(),
  }),
  body: Joi.object().keys({
    status: Joi.boolean().required(),
  }),
};

module.exports = {
  createVehicleVariant,
  getVehicleVariant,
  updateVehicleVariant,
  deleteVehicleVariant,
  updateVehicleVariantStatus,
};
