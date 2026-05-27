const Joi = require('joi');
const FormData = require('form-data');
const { parseJSONWithOptions } = require('date-fns/fp');
const { objectId } = require('../../custom.validation');

const starttripValidation = {
  body: Joi.object({
    requestId: Joi.string().custom(objectId),
    otp: Joi.number().integer(),
    latitude: Joi.number().optional(),
    longitude: Joi.number().optional(),
    startKm: Joi.number().optional(),
    startKmImage: Joi.string().optional(),
  }),
};

module.exports = {
  starttripValidation,
};
