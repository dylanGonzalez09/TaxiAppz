const Joi = require('joi');
const FormData = require('form-data');
const { parseJSONWithOptions } = require('date-fns/fp');
const { objectId } = require('../../custom.validation');

const respondValidation = {
  body: Joi.object({
    requestId: Joi.string().custom(objectId),
    isAccept: Joi.boolean().required(),
  }),
};

module.exports = {
  respondValidation,
};
