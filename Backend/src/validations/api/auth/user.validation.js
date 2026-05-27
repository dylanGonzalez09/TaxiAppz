const Joi = require('joi');
const FormData = require('form-data');
const { objectId } = require('../../custom.validation');

const mobileCreateUser = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    phoneNumber: Joi.string().required(),
    deviceInfoHash: Joi.string().optional(),
    isPrimary: Joi.string().optional(),
    deviceType: Joi.string().optional(),
    referralCode: Joi.string().optional(),
    countryCode: Joi.string().custom(objectId).required(),
    demoKey: Joi.string().optional(),
    regDate: Joi.string().optional(),
    regTime: Joi.string().optional(),
  }),
};

const updateUser = {
  FormData: Joi.object()
    .keys({
      name: Joi.string(),
      email: Joi.string().email(),
      profilePic: Joi.string().optional(),
    })
    .min(1), // Ensure at least one field is being updated
};

const checkZone = {
  body: Joi.object().keys({
    pick_lat: Joi.number().required(),
    pick_lng: Joi.number().required(),
  }),
};

module.exports = {
  mobileCreateUser,
  updateUser,
  checkZone,
};
