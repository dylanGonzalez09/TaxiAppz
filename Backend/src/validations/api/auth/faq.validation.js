// validations/sos.validation.js
const Joi = require('joi');
const { objectId } = require('../../custom.validation');

const createFaq = {
  body: Joi.object().keys({
    question: Joi.string().trim().optional(),
    answer: Joi.string().trim().optional(),
    category: Joi.string().trim().optional(),
    language: Joi.string().custom(objectId).required(),
    status: Joi.boolean().default(true),
  }),
};

const getFaqs = {
  query: Joi.object().keys({
    page: Joi.number().integer().default(1),
    limit: Joi.number().integer().default(10),
  }),
};

const getFaq = {
  params: Joi.object().keys({
    faqId: Joi.string().custom(objectId).required(),
  }),
};

const updateFaq = {
  params: Joi.object().keys({
    faqId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object().keys({
    question: Joi.string().trim().optional(),
    answer: Joi.string().trim().optional(),
    category: Joi.string().trim().optional(),
    language: Joi.string().custom(objectId).required(),
    status: Joi.boolean().default(true),
  }).min(1),
};

const deleteFaq = {
  params: Joi.object().keys({
    faqId: Joi.string().custom(objectId).required(),
  }),
};

module.exports = {
  createFaq,
  getFaqs,
  getFaq,
  updateFaq,
  deleteFaq,
};
