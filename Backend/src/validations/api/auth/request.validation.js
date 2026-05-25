const Joi = require('joi');
const { objectId } = require('../../custom.validation');
const FormData = require('form-data');


const getRequest = {
  };

  const getRequestById = {
    params: Joi.object({
      requestId: Joi.string().required(),
    }),
  };

  module.exports = {
    getRequest,
    getRequestById
  };
  