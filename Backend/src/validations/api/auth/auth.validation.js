const Joi = require('joi');
const { objectId } = require('../../custom.validation');

const login = {
  body: Joi.object().keys({
    authenticationType: Joi.string().required(),
    email: Joi.string().optional(),
    password: Joi.string().optional(),
    phoneNumber: Joi.string().optional(),
    countryCode: Joi.string().optional(),
  }),
};

const verify = {
  body: Joi.object().keys({
    phoneNumber: Joi.string().optional(),
    countryCode: Joi.string().optional(),
    otp: Joi.string().optional(),
    deviceInfoHash: Joi.string().optional(),
    isPrimary: Joi.string().optional(),
    deviceType: Joi.string().optional(),
    demoKey: Joi.string().optional(),
  }),
};

const getUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

const register = {
  body: Joi.object().keys({
    phoneNumber: Joi.string().optional(),
    country: Joi.string().optional(),
    deviceInfoHash: Joi.string().optional(),
    isPrimary: Joi.string().optional(),
    deviceType: Joi.string().optional(),
    name: Joi.string().required(),
  }),
};

module.exports = {
  login,
  verify,
  getUser,
  register,
};
