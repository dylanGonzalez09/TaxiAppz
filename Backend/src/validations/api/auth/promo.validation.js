// validations/sos.validation.js
const Joi = require('joi');
const { objectId } = require('../../custom.validation');

const promovalidate = {
    body: Joi.object().keys({
        promoCode: Joi.string().required().trim()
    }),
};

module.exports = {
    promovalidate,
};