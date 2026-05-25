const Joi = require('joi');
const { objectId } = require('../../../validations/custom.validation');

const createZonePrice = {
  body: Joi.object().keys({
    zoneId: Joi.string().custom(objectId).allow(null),
    typeId: Joi.string().custom(objectId).allow(null),
    ridenowBasePrice: Joi.string().required(),
    ridenowPricePerTime: Joi.string().allow(null),
    ridenowBaseDistance: Joi.string().allow(null),
    ridenowPricePerDistance: Joi.string().required(),
    ridenowFreeWaitingTime: Joi.string().allow(null),
    ridenowWaitingCharge: Joi.string().required(),
    ridenowCancellationFee: Joi.string().required(),
    ridelaterBasePrice: Joi.string().required(),
    ridelaterPricePerTime: Joi.string().allow(null),
    ridelaterBaseDistance: Joi.string().allow(null),
    ridelaterPricePerDistance: Joi.string().required(),
    ridelaterFreeWaitingTime: Joi.string().allow(null),
    ridelaterWaitingCharge: Joi.string().required(),
    ridelaterCancellationFee: Joi.string().required(),
    ridenowAdminCommissionType: Joi.number().allow(null),
    ridenowAdminCommission: Joi.string().allow(null),
    ridenowBookingBaseFare: Joi.string().allow(null),
    ridenowBookingBasePerKilometer: Joi.string().allow(null),
    ridelaterAdminCommissionType: Joi.number().allow(null),
    ridelaterAdminCommission: Joi.string().allow(null),
    ridelaterBookingBaseFare: Joi.string().allow(null),
    ridelaterBookingBasePerKilometer: Joi.string().allow(null),
    status: Joi.boolean().required(),
    slug: Joi.string().allow(null),
    createdBy: Joi.string().custom(objectId).allow(null),
  }),
};

const getZonePrices = {
  query: Joi.object().keys({
    zoneId: Joi.string().custom(objectId),
    typeId: Joi.string().custom(objectId),
    page: Joi.number().integer(),
    limit: Joi.number().integer(),
    sortBy: Joi.string(),
    status: Joi.boolean(),
  }),
};

const getZonePrice = {
  params: Joi.object().keys({
    zonePriceId: Joi.string().custom(objectId),
  }),
};

const updateZonePrice = {
  params: Joi.object().keys({
    zonePriceId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    zoneId: Joi.string().custom(objectId).allow(null),
    typeId: Joi.string().custom(objectId).allow(null),
    ridenowBasePrice: Joi.string().required(),
    ridenowPricePerTime: Joi.string().allow(null),
    ridenowBaseDistance: Joi.string().allow(null),
    ridenowPricePerDistance: Joi.string().required(),
    ridenowFreeWaitingTime: Joi.string().allow(null),
    ridenowWaitingCharge: Joi.string().required(),
    ridenowCancellationFee: Joi.string().required(),
    ridelaterBasePrice: Joi.string().required(),
    ridelaterPricePerTime: Joi.string().allow(null),
    ridelaterBaseDistance: Joi.string().allow(null),
    ridelaterPricePerDistance: Joi.string().required(),
    ridelaterFreeWaitingTime: Joi.string().allow(null),
    ridelaterWaitingCharge: Joi.string().required(),
    ridelaterCancellationFee: Joi.string().required(),
    ridenowAdminCommissionType: Joi.number().allow(null),
    ridenowAdminCommission: Joi.string().allow(null),
    ridenowBookingBaseFare: Joi.string().allow(null),
    ridenowBookingBasePerKilometer: Joi.string().allow(null),
    ridelaterAdminCommissionType: Joi.number().allow(null),
    ridelaterAdminCommission: Joi.string().allow(null),
    ridelaterBookingBaseFare: Joi.string().allow(null),
    ridelaterBookingBasePerKilometer: Joi.string().allow(null),
    status: Joi.boolean().required(),
    slug: Joi.string().allow(null),
  }).min(1),
};

const deleteZonePrice = {
  params: Joi.object().keys({
    zonePriceId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createZonePrice,
  getZonePrices,
  getZonePrice,
  updateZonePrice,
  deleteZonePrice,
};
