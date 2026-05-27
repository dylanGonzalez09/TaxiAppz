const Joi = require('joi');
const FormData = require('form-data');
const { parseJSONWithOptions } = require('date-fns/fp');
const { objectId } = require('../../custom.validation');

const completeValidation = {};

module.exports = {
  completeValidation,
};
