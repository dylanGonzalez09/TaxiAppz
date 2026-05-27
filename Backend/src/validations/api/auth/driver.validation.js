const Joi = require('joi');
const FormData = require('form-data');
const { objectId } = require('../../custom.validation');

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
    dob: Joi.string().required(),
  }),
};

const mobileCreateDriver = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    email: Joi.string().email().optional(),
    phoneNumber: Joi.string().required(),
    deviceInfoHash: Joi.string().optional(),
    isPrimary: Joi.string().optional(),
    deviceType: Joi.string().optional(),
    regDate: Joi.string().optional(),
    regTime: Joi.string().optional(),
    countryCode: Joi.string().custom(objectId).required(),
    vehicleType: Joi.string().custom(objectId).required(),
    vehicleModel: Joi.string().custom(objectId).required(),
    serviceLocation: Joi.string().custom(objectId).required(),
    secondaryZone: Joi.alternatives()
      .try(Joi.array().items(Joi.string().custom(objectId)).min(1), Joi.valid(null))
      .default(null)
      .messages({
        'alternatives.match': 'Secondary zone must be either an array of valid ObjectIds or null',
        'array.base': 'Secondary zone must be an array',
        'array.min': 'Secondary zone array must contain at least 1 item',
        'string.objectId': 'Each item in secondaryZone must be a valid ObjectId',
      }),
    referralCode: Joi.string().optional(),
    carNumber: Joi.string().required(),
    serviceType: Joi.string().required(),
    demoKey: Joi.string().optional(),
    specialPrice: Joi.boolean().optional(),
    carColour: Joi.string().optional().allow(null, ''),
    address: Joi.any().optional(),
    vehicleMake: Joi.string().optional().allow(null, ''),
    vehicleVariant: Joi.string().optional().allow(null, ''),
    vehicleBrand: Joi.string().optional().allow(null, ''),
    registrationType: Joi.string().optional().allow(null, ''),
    vehicleModelName: Joi.string().optional().allow(null, ''),
    manufactureYear: Joi.number().optional().allow(null, ''),
    licensePlateNumber: Joi.string().optional().allow(null, ''), // legacy optional
    passengerCapacity: Joi.number().optional().allow(null, ''),
  }),
};

const getDriver = {};

const updateDriver = {
  FormData: Joi.object()
    .keys({
      name: Joi.string(),
      email: Joi.string().email(),
      profilePic: Joi.string().optional(),
      serviceType: Joi.string().optional(),
    })
    .min(1), // Ensure at least one field is being updated
};

module.exports = {
  getDriver,
  createDriver,
  mobileCreateDriver,
  updateDriver,
};
