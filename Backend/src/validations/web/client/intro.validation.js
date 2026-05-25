const Joi = require('joi');
const FormData = require('form-data');
const { objectId } = require('../../custom.validation');


const createIntro = {
    FormData: Joi.object().keys({
        status: Joi.boolean(),
        title: Joi.string().optional(),
        description: Joi.string().optional(),
        type: Joi.string().optional(),

    }),
};

const getIntros = {
    query: Joi.object().keys({
       image: Joi.string().required(),
        sortBy: Joi.string(),
        limit: Joi.number().integer(),
        page: Joi.number().integer(),
    }),
};

const getIntro = {
    params: Joi.object().keys({
        introId: Joi.string().required(),
    }),
};

const updateIntro = {
    params: Joi.object().keys({
        introId: Joi.string().required(),
    }),
    FormData: Joi.object().keys({
        status: Joi.boolean(),
        title: Joi.string().optional(),
        description: Joi.string().optional(),
        type: Joi.string().optional(),

    }).min(1),
};

const deleteIntro = {
    params: Joi.object().keys({
        introId: Joi.string().required(),
    }),
};

const updateIntroStatus = {
  params: Joi.object().keys({
    introId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object().keys({
    status: Joi.boolean().required(),
  }),
};

module.exports = {
  createIntro,
    getIntros,
    getIntro,
    updateIntro,
    deleteIntro,
    updateIntroStatus
};
