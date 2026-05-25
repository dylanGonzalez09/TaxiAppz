const Joi = require('joi');
const { objectId } = require('../custom.validation');

const createCountry = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    dial_code: Joi.string(),
    code: Joi.string(),
    currency_name: Joi.string(),
    currency_code: Joi.string(),
    currency_symbol: Joi.string(),
    status: Joi.boolean(),
    capital: Joi.string(),
    citizenship: Joi.string(),
    country_code: Joi.string(),
    currency: Joi.string(),
    currency_sub_unit: Joi.string(),
    full_name: Joi.string(),
    iso_3166_3: Joi.string(),
    region_code: Joi.string(),
    sub_region_code: Joi.string(),
    eea: Joi.string(),
    currency_decimals: Joi.string(),
    flag: Joi.string(),
    flag_base_64: Joi.string(),
    time_zone: Joi.string(),
    gmt_offset: Joi.string(),
  }),
};

const getCountrys = {
  query: Joi.object().keys({
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getCountry = {
  params: Joi.object().keys({
    countryId: Joi.string().custom(objectId),
  }),
};

const getCountryWithOutPagination = {
};

const updateCountry = {
  params: Joi.object().keys({
    countryId: Joi.string().custom(objectId),
  }),
  body: Joi.object()
      .keys({
        name: Joi.string(),
        dial_code: Joi.string(),
        code: Joi.string(),
        currency_name: Joi.string(),
        currency_code: Joi.string(),
        currency_symbol: Joi.string(),
        status: Joi.boolean(),
        capital: Joi.string(),
        citizenship: Joi.string(),
        country_code: Joi.string(),
        currency: Joi.string(),
        currency_sub_unit: Joi.string(),
        full_name: Joi.string(),
        iso_3166_3: Joi.string(),
        region_code: Joi.string(),
        sub_region_code: Joi.string(),
        eea: Joi.string(),
        currency_decimals: Joi.string(),
        flag: Joi.string(),
        flag_base_64: Joi.string(),
        time_zone: Joi.string(),
        gmt_offset: Joi.string(),
        clientId: Joi.string().custom(objectId).optional(),
      })
      .min(1),
};

const deleteCountry = {
  params: Joi.object().keys({
    countryId: Joi.string().custom(objectId),
  }),
};

const updateCoutryStatus = {
  params: Joi.object().keys({
    countryId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object().keys({
    status: Joi.boolean().required(),
  }),
};

module.exports = {
  createCountry,
  getCountrys,
  getCountry,
  getCountryWithOutPagination,
  updateCountry,
  deleteCountry,
  updateCoutryStatus
};

