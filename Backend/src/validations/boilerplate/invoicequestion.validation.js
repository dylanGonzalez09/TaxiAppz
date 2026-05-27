const Joi = require('joi');
const FormData = require('form-data');
const { objectId } = require('../custom.validation');

const createInvoiceQuestion = {
  FormData: Joi.object().keys({
    question: Joi.string().required(),
    role: Joi.string().required(),
    zoneId: Joi.string().custom(objectId).required(),
    clientId: Joi.string().custom(objectId).required(),
  }),
};

const getInvoiceQuestions = {
  query: Joi.object().keys({
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getInvoiceQuestion = {
  params: Joi.object().keys({
    invoiceQuestionId: Joi.string().required(),
  }),
};

const updateInvoiceQuestion = {
  params: Joi.object().keys({
    invoiceQuestionId: Joi.string().required(),
  }),
  FormData: Joi.object()
    .keys({
      question: Joi.number().required(),
      role: Joi.string().required(),
      zoneId: Joi.string().custom(objectId).required(),
      clientId: Joi.string().custom(objectId).required(),
      status: Joi.boolean().required(),
    })
    .min(1),
};

const deleteInvoiceQuestion = {
  params: Joi.object().keys({
    invoiceQuestionId: Joi.string().required(),
  }),
};

const UpdateInvoiceQuestionStatus = {
  params: Joi.object().keys({
    invoiceQuestionId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object().keys({
    status: Joi.boolean().required(),
  }),
};

module.exports = {
  createInvoiceQuestion,
  getInvoiceQuestions,
  getInvoiceQuestion,
  updateInvoiceQuestion,
  deleteInvoiceQuestion,
  UpdateInvoiceQuestionStatus,
};
