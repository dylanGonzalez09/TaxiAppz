const Joi = require('joi');
const { objectId } = require('../custom.validation');

const createLanguage = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    code: Joi.string().required(),
    status: Joi.boolean().required(),
  }),
};

const getLanguages = {
  query: Joi.object().keys({
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getLanguage = {
  params: Joi.object().keys({
    languageId: Joi.string().custom(objectId),
  }),
};

const getLanguagebyCode = {
  params: Joi.object().keys({
    code: Joi.string(),
  }),
};

const getLanguageWithOutPagination = {
};

const updateLanguage = {
  params: Joi.object().keys({
    languageId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
    name: Joi.string(),
    code: Joi.string(),
    status: Joi.boolean(),
    clientId: Joi.string().custom(objectId).optional()
    })
    .min(1),
};

const deleteLanguage = {
  params: Joi.object().keys({
    languageId: Joi.string().custom(objectId),
  }),
};

const updatelanguageStatus = {
  params: Joi.object().keys({
    languageId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object().keys({
    status: Joi.boolean().required(),
  }),
};

module.exports = {
  createLanguage,
  getLanguages,
  getLanguage,
  getLanguageWithOutPagination,
  updateLanguage,
  deleteLanguage,
  getLanguagebyCode,
  updatelanguageStatus
};
