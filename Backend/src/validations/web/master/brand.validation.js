const Joi = require('joi');
const { objectId } = require('../../custom.validation');

const createBrand = {
  FormData: Joi.object().keys({
    brandName: Joi.string().required(),
    vehicleId: Joi.string().custom(objectId).required(),
    status: Joi.boolean().required(),
    description: Joi.string().optional(),
  }),
};

const getBrands = {
  query: Joi.object().keys({
    brandName: Joi.string(),
    vehicleId: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getBrand = {
  params: Joi.object().keys({
    brandId: Joi.string().required(),
  }),
};

const getBrandByVehicle = {
  params: Joi.object().keys({
    vehicleId: Joi.string().required(),
  }),
};

const updateBrand = {
  params: Joi.object().keys({
    brandId: Joi.string().required(),
  }),
  FormData: Joi.object()
    .keys({
      brandName: Joi.string(),
      vehicleId: Joi.string(),
      clientId: Joi.string().custom(objectId).optional(),
      status: Joi.boolean(),
      description: Joi.string().optional(),
    })
    .min(1),
};

const deleteBrand = {
  params: Joi.object().keys({
    brandId: Joi.string().required(),
  }),
};

const updateBrandStatus = {
  params: Joi.object().keys({
    brandId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object().keys({
    status: Joi.boolean().required(),
  }),
};

module.exports = {
  createBrand,
  getBrands,
  getBrand,
  updateBrand,
  deleteBrand,
  getBrandByVehicle,
  updateBrandStatus,
};
