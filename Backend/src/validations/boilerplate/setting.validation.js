const Joi = require('joi');
const { objectId } = require('../custom.validation');

const createSetting = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    value: Joi.string().required(),
    status: Joi.boolean().required(),
    slug: Joi.string().required(),
    type: Joi.string().required(),
  }),
};

const getSettings = {
  query: Joi.object().keys({
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getSetting = {
  params: Joi.object().keys({
    settingId: Joi.string().custom(objectId),
  }),
};

const getSettingWithOutPagination = {

};

const updateSetting = {
  params: Joi.object().keys({
    settingId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string(),
    value: Joi.string(),
    status: Joi.boolean(),
    slug: Joi.string(),
    type: Joi.string(),
    clientId: Joi.string().custom(objectId).optional()
    })
    .min(1),
};

const deleteSetting = {
  params: Joi.object().keys({
    settingId: Joi.string().custom(objectId),
  }),
};


const bulkInsertSettings = {
  body: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      value: Joi.string().required(),
      status: Joi.boolean().required(),
      type: Joi.string().required(),
      clientId: Joi.string().optional(),
    })
  ).required(),
};

const bulkUpdateSettings = {
  body: Joi.array().items(
    Joi.object({
      _id: Joi.string().required(),
      name: Joi.string().optional(),
      value: Joi.string().optional(),
      status: Joi.boolean().optional(),
      type: Joi.string().optional(),
      clientId: Joi.string().optional(),
    })
  ).required(),
};

module.exports = {
  createSetting,
  getSettings,
  getSetting,
  getSettingWithOutPagination,
  updateSetting,
  deleteSetting,
  bulkInsertSettings,
  bulkUpdateSettings,
};
