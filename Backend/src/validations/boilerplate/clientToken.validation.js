// clientToken.validation.js
const Joi = require('joi');

const upsertClientToken = {
  body: Joi.object().keys({
    deviceInfoHash: Joi.string().optional(),
  }),
};

module.exports = {
  upsertClientToken,
};