const Joi = require('joi');
const { objectId } = require('../custom.validation');


const createFaq = {
    FormData: Joi.object().keys({
        question: Joi.string().required(),
        answer: Joi.string().required(),
        category: Joi.string().required(),
        language: Joi.string().custom(objectId).required(),
        clientId: Joi.string().custom(objectId).required()
    }),
};

const getFaqs = {
    query: Joi.object().keys({
        sortBy: Joi.string(),
        limit: Joi.number().integer(),
        page: Joi.number().integer(),
    }),
};

const getFaq = {
    params: Joi.object().keys({
        faqId: Joi.string().required(),
    }),
};



const updateFaq = {
    params: Joi.object().keys({
        faqId: Joi.string().required(),
    }),
    FormData: Joi.object().keys({
        question: Joi.number().required(),
        question: Joi.string().required(),
        answer: Joi.string().required(),
        category: Joi.string().required(),
        language: Joi.string().custom(objectId).required(),
        clientId: Joi.string().custom(objectId).required(),
        status: Joi.boolean().required(),
    }).min(1),
};

const deleteFaq = {
    params: Joi.object().keys({
        faqId: Joi.string().required(),
    }),
};

const UpdateFaqStatus = {
  params: Joi.object().keys({
    faqId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object().keys({
    status: Joi.boolean().required(),
  }),
};

module.exports = {
    createFaq,
    getFaqs,
    getFaq,
    updateFaq,
    deleteFaq,
    UpdateFaqStatus
};
