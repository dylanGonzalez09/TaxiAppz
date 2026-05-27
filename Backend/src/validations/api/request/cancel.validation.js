const Joi = require('joi');
const FormData = require('form-data');
const { parseJSONWithOptions } = require('date-fns/fp');
const { objectId } = require('../../custom.validation');

const cancelValidation = {
  body: Joi.object({
    requestId: Joi.string().custom(objectId),
    reasonId: Joi.string().custom(objectId),
    reason: Joi.string().optional(),
    latitude: Joi.number().optional(),
    longitude: Joi.number().optional(),
    role: Joi.string().optional(),
  }),
};

module.exports = {
  cancelValidation,
};
