const Joi = require('joi');
const FormData = require('form-data');
const { objectId } = require('../../custom.validation');


const createCancellation = {
    FormData: Joi.object().keys({
        reason: Joi.string().required(),
        userType: Joi.string().valid('User', 'Driver', 'Both').required(),
        payStatus: Joi.string().valid('Free', 'Pay').required(),
        tripStatus: Joi.string().valid('After Arrived', 'Before Accpet', 'Before Arrive').required(),
        clientId: Joi.string().custom(objectId).required()
    }),
};

const getCancellations = {
    query: Joi.object().keys({
        sortBy: Joi.string(),
        limit: Joi.number().integer(),
        page: Joi.number().integer(),
    }),
};

const getCancellation = {
    params: Joi.object().keys({
        cancellationId: Joi.string().required(),
    }),
};



const updateCancellation = {
    params: Joi.object().keys({
        cancellationId: Joi.string().required(),
    }),
    FormData: Joi.object().keys({
        clientId: Joi.string().custom(objectId).optional(),
        reason: Joi.string().required(),
        userType: Joi.string().valid('User', 'Driver', 'Both').required(),
        payStatus: Joi.string().valid('Free', 'Pay').required(),
        tripStatus: Joi.string().valid('After Arrived', 'Before Accept', 'Before Arrive').required(),
        status: Joi.boolean().required(),
    }).min(1),
};

const deleteCancellation = {
    params: Joi.object().keys({
        cancellationId: Joi.string().required(),
    }),
};

const UpdateCancellationStatus = {
  params: Joi.object().keys({
    cancellationId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object().keys({
    status: Joi.boolean().required(),
  }),
};

module.exports = {
    createCancellation,
    getCancellations,
    getCancellation,
    updateCancellation,
    deleteCancellation,
    UpdateCancellationStatus
};
