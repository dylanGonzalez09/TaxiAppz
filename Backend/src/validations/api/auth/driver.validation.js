const Joi = require('joi');
const { objectId } = require('../../custom.validation');
const FormData = require('form-data');


const createDriver = {
  body: Joi.object().keys({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().email().required(),
    phoneNumber: Joi.string().required(),
    deviceInfoHash: Joi.string().optional(),
    isPrimary: Joi.string().optional(),
    deviceType: Joi.string().optional(),
    country: Joi.string(),
    referralCode: Joi.string().optional(),
    type: Joi.string().custom(objectId).required(),
    carModel: Joi.string().custom(objectId).required(),
    serviceLocation: Joi.string().required(),
    loginMethod: Joi.string().required(),
    carNumber: Joi.string().required(),
    brandLabel: Joi.string().required(),
    dob: Joi.string().required()
  }),
};


const mobileCreateDriver = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    email: Joi.string().email().optional().allow("", null),
    phoneNumber: Joi.string().required(),
    deviceInfoHash: Joi.string().optional(),
    isPrimary: Joi.string().optional(),
    deviceType: Joi.string().optional(),
    countryCode: Joi.string().custom(objectId).required(),
    vehicleType: Joi.string().custom(objectId).required(),
    vehicleModel: Joi.string().custom(objectId).required(),
    serviceLocation: Joi.string().custom(objectId).required(),
    secondaryZone: Joi.alternatives().try(
      Joi.array().items(Joi.string().custom(objectId)).min(1),
      Joi.valid(null)
    )
      .default(null)
      .messages({
        'alternatives.match': 'Secondary zone must be either an array of valid ObjectIds or null',
        'array.base': 'Secondary zone must be an array',
        'array.min': 'Secondary zone array must contain at least 1 item',
        'string.objectId': 'Each item in secondaryZone must be a valid ObjectId'
      }),
    referralCode: Joi.string().optional(),
    carNumber: Joi.string().required(),
    registrationType: Joi.string().valid('COMPANY', 'INDIVIDUAL'),
    serviceType: Joi.string().optional(),
    companyId: Joi.string().custom(objectId).optional(),
    demoKey: Joi.string().optional()
  }),
};

const getDriver = {

};


const updateDriver = {
  FormData: Joi.object().keys({
    name: Joi.string(),
    email: Joi.string().email().optional().allow("", null),
    profilePic: Joi.string().optional(),
    serviceType: Joi.string().optional()
  }).min(1), // Ensure at least one field is being updated
};

module.exports = {
  getDriver,
  createDriver,
  mobileCreateDriver, updateDriver
};
