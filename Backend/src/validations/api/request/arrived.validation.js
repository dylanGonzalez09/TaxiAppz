const Joi = require('joi');
const { objectId } = require('../../custom.validation');
const FormData = require('form-data');
const { parseJSONWithOptions } = require('date-fns/fp');



const arrivedValidation = {
    body: Joi.object({
        requestId: Joi.string().custom(objectId),
        latitude: Joi.number().optional(),
        longitude: Joi.number().optional(),

    }),
};

module.exports = {
    arrivedValidation
};
