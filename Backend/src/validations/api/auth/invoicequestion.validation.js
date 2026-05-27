const Joi = require('joi');
const { objectId } = require('../../custom.validation');

const createInvoiceQuestion = {
  body: Joi.object().keys({
    question: Joi.string().required(),
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
    invoiceQuestionId: Joi.string().custom(objectId),
  }),
};

const getInvoiceQuestionWithOutPagination = {};

const updateInvoiceQuestion = {
  params: Joi.object().keys({
    invoiceQuestionId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      question: Joi.string(),
    })
    .min(1),
};

const deleteInvoiceQuestion = {
  params: Joi.object().keys({
    invoiceQuestionId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createInvoiceQuestion,
  getInvoiceQuestions,
  getInvoiceQuestion,
  getInvoiceQuestionWithOutPagination,
  updateInvoiceQuestion,
  deleteInvoiceQuestion,
};
