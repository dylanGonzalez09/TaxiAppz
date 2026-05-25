const Joi = require('joi');
const { objectId } = require('../../custom.validation');


const getLanguagebyCode = {
  params: Joi.object().keys({
    languageCode: Joi.string(),
  }),
};


const getLanguage = {
  body: Joi.object().keys({
    Code: Joi.string().required().min(1).max(60),
  }),
};


module.exports = {
    getLanguagebyCode,
    getLanguage,
};




