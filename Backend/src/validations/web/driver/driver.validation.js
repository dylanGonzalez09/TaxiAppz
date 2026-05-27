const Joi = require('joi');
const { objectId } = require('../../custom.validation');

const createWebDriver = {
  body: Joi.object().keys({
    firstName: Joi.string().trim().min(1).required(),
    lastName: Joi.string().optional().allow(''),
    name: Joi.string().optional().allow(''),
    email: Joi.string().email().optional().allow(''),
    phoneNumber: Joi.string().required(),
    deviceInfoHash: Joi.string().optional(),
    isPrimary: Joi.string().optional(),
    deviceType: Joi.string().optional(),
    regDate: Joi.string().optional(),
    regTime: Joi.string().optional(),
    countryCode: Joi.string().custom(objectId).required(),
    vehicleType: Joi.string().custom(objectId).optional(),
    vehicleModel: Joi.string().custom(objectId).optional(),
    serviceLocation: Joi.string().custom(objectId).required(),
    secondaryZone: Joi.alternatives()
      .try(Joi.array().items(Joi.string().custom(objectId)), Joi.valid(null))
      .default(null),
    referralCode: Joi.string().optional().allow(''),
    carNumber: Joi.string().optional().allow(''),
    registrationType: Joi.string().valid('COMPANY', 'INDIVIDUAL').optional(),
    serviceType: Joi.alternatives()
      .try(
        Joi.array().items(Joi.string().trim().min(1)),
        Joi.string().trim().min(1)
      )
      .optional(),
    companyId: Joi.string().custom(objectId).optional(),
    demoKey: Joi.string().optional(),
    specialPrice: Joi.boolean().optional(),
    carColour: Joi.string().optional(),
    address: Joi.any().optional(),
    vehicleMake: Joi.string().optional(),
    vehicleModelName: Joi.string().optional(),
    manufactureYear: Joi.number().optional(),
    licensePlateNumber: Joi.string().optional(),
    vehicleColor: Joi.string().optional(),
    passengerCapacity: Joi.number().optional(),
    dateOfBirth: Joi.string().optional(),
    vehicleModelId: Joi.string().custom(objectId).optional(),
    serviceCategory: Joi.string().optional(),
  }),
};

module.exports = {
  createWebDriver,
};
