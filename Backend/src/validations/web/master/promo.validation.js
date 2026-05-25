const Joi = require('joi');
const { objectId } = require('../../custom.validation');

const createPromoCode = {
  body: Joi.object().keys({
    zoneId: Joi.string().required(),
    promoCode: Joi.string().required(),
    promoCodeType: Joi.string().required(),
    description: Joi.string().required(),
    targetAmount: Joi.number().precision(2).optional().allow(null),
    promoType: Joi.number().optional().allow(null),
    amount: Joi.number().precision(2).optional().allow(null),
    percentage: Joi.number().precision(2).optional().allow(null),
    userId: Joi.object({
      userIds: Joi.array().items(Joi.string().optional().allow(null))
    }),
    distanceKm: Joi.number().optional().allow(null),
    fromDate: Joi.date().optional().allow(null),
    toDate: Joi.date().optional().allow(null),
    status: Joi.boolean().default(true),
    totalCount: Joi.number().integer().default(0),
    promoReuseCount: Joi.number().integer().default(0),
    createdBy: Joi.string().optional().allow(null),
  }),
};

const getPromoCodes = {
  query: Joi.object().keys({
    page: Joi.number().integer().default(1),
    limit: Joi.number().integer().default(10),
  }),
};

const getPromoCode = {
  params: Joi.object().keys({
    promoCodeId: Joi.string().required(),
  }),
};

const updatePromoCode = {
  params: Joi.object().keys({
    promoCodeId: Joi.string().required(),
  }),
  body: Joi.object().keys({
    zoneId: Joi.string().optional(),
    promoCode: Joi.string().optional(),
    promoCodeType: Joi.string().optional(),
    promoIcon: Joi.string().optional(),
    description: Joi.string().optional(),
    promoOfferNoOfRide: Joi.string().optional().allow(null),
    targetAmount: Joi.number().precision(2).optional().allow(null),
    promoType: Joi.number().optional().allow(null),
    amount: Joi.number().precision(2).optional().allow(null),
    percentage: Joi.number().precision(2).optional().allow(null),
    userId: Joi.object({
      userIds: Joi.array().items(Joi.string().optional().allow(null))
    }),
    distanceKm: Joi.number().optional().allow(null),
    fromDate: Joi.date().optional().allow(null),
    toDate: Joi.date().optional().allow(null),
    status: Joi.boolean(),
    totalCount: Joi.number().integer(),
    promoReuseCount: Joi.number().integer(),
    createdBy: Joi.string().optional().allow(null),
  }),
};


const updatePromoStatus = {
  params: Joi.object().keys({
    promoCodeId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object().keys({
    status: Joi.boolean().required(),
  }),
};

const deletePromoCode = {
  params: Joi.object().keys({
    promoCodeId: Joi.string().required(),
  }),
};

module.exports = {
  createPromoCode,
  getPromoCodes,
  getPromoCode,
  updatePromoCode,
  deletePromoCode,
  updatePromoStatus
};
