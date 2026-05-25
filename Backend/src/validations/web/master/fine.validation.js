const Joi = require('joi');
const { objectId } = require('../../custom.validation');

const createFine = {
    body: Joi.object().keys({
        requestId:  Joi.string().required(),
        userId: Joi.string().custom(objectId).required(),
        fineAmount: Joi.number().required(),
        description: Joi.string().optional(),
        date: Joi.date().required()
    })
};

module.exports = {
    createFine
}