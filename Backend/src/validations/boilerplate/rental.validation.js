const Joi = require('joi');
const { objectId } = require('../custom.validation');

const createRental = {
  body: Joi.object().keys({
    km: Joi.number().required(),
    hour: Joi.number(),
    countryId: Joi.string().required(),
    zoneId: Joi.string().required(),
    vehiclePrices: Joi.array()
      .items(
        Joi.object({
          vehicleId: Joi.string().required(),
          price: Joi.number().positive().required(),
          graceTime: Joi.number().required(),
          extraKmPrice: Joi.number().required(),
        }),
      )
      .required(),
    // clientId: Joi.string().required(),
  }),
};

const getRentals = {
  query: Joi.object().keys({
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getRental = {
  params: Joi.object().keys({
    rentalId: Joi.string().custom(objectId),
  }),
};

const getRentalWithOutPagination = {};

const updateRental = {
  params: Joi.object().keys({
    rentalId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      km: Joi.number(),
      hour: Joi.number(),
      countryId: Joi.string().custom(objectId),
      zoneId: Joi.string().custom(objectId),
      vehiclePrices: Joi.array().items(
        Joi.object({
          vehicleId: Joi.string(),
          price: Joi.number().positive(),
          graceTime: Joi.number(),
          extraKmPrice: Joi.number(),
        }),
      ),

      clientId: Joi.string().custom(objectId).optional(),
    })
    .min(1),
};

const deleteRental = {
  params: Joi.object().keys({
    rentalId: Joi.string().custom(objectId),
  }),
};

const UpdateRentalStatus = {
  params: Joi.object().keys({
    rentalId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object().keys({
    status: Joi.boolean().required(),
  }),
};

module.exports = {
  createRental,
  getRentals,
  getRental,
  getRentalWithOutPagination,
  updateRental,
  deleteRental,
  UpdateRentalStatus,
};
