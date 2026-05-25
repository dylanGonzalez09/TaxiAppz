const Joi = require('joi');
const { objectId } = require('../../custom.validation');
const FormData = require('form-data');
const { parseJSONWithOptions } = require('date-fns/fp');


const cancelValidation = {
    body: Joi.object({
        requestId: Joi.string().custom(objectId),
        reasonId:Joi.string().custom(objectId),
        latitude: Joi.number().optional(),
        longitude: Joi.number().optional(),
        role:Joi.string().optional()
    }),
};


module.exports = {
    cancelValidation
};
