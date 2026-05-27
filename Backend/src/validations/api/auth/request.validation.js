const Joi = require('joi');
const FormData = require('form-data');
const { objectId } = require('../../custom.validation');

const getRequest = {};

const getRequestById = {
  params: Joi.object({
    requestId: Joi.string().required(),
  }),
};

module.exports = {
  getRequest,
  getRequestById,
};
