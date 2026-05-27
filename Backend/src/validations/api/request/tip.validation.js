const Joi = require('joi');
const { objectId } = require('../../custom.validation');

/**
 * Mobile tip update:
 * - `tipAmount` : percentage value (if isPercentage=true) OR fixed money amount (if isPercentage=false)
 * - `isPercentage` : true => interpret tipAmount as percentage; false => interpret as fixed amount
 */
const updateTipValidation = {
  body: Joi.object().keys({
    requestId: Joi.string().custom(objectId).required(),
    tipAmount: Joi.number().min(0).required(),
    isPercentage: Joi.boolean().required(),
  }),
};

module.exports = {
  updateTipValidation,
};

