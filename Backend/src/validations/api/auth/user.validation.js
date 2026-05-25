const Joi = require('joi');
const { objectId } = require('../../custom.validation');
const FormData = require('form-data');



const mobileCreateUser = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    email: Joi.string().email().optional(),
    phoneNumber: Joi.string().required(),
    deviceInfoHash : Joi.string().optional(),
    isPrimary: Joi.any().optional(),
    deviceType: Joi.string().optional(),
    referralCode:Joi.string().optional(),
    countryCode: Joi.string().custom(objectId).required(),
    demoKey: Joi.string().optional()
  }),
};

const updateUser = {
  FormData: Joi.object().keys({
    name: Joi.string(),
    email: Joi.string().email(),
    profilePic: Joi.string().optional(),
  }).min(1), // Ensure at least one field is being updated
};


  module.exports = {
    mobileCreateUser,
    updateUser
  };
  