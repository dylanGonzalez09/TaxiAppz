const Joi = require('joi');
const { objectId } = require('../../custom.validation');
const FormData = require('form-data');

const createCategory = {
  FormData: Joi.object().keys({
    category: Joi.string().required(),
    zoneId: Joi.string().required(),
    status: Joi.boolean().required()
  }),
};

const getCategories = {
  query: Joi.object().keys({
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getCategory = {
  params: Joi.object().keys({
    categoryId: Joi.string().custom(objectId).required(),
    
  }),
};

const getCategoriesWithoutPagination = {
  query: Joi.object().keys({
  }),
};

const updateCategory = {
  params: Joi.object().keys({
    categoryId: Joi.string().custom(objectId).required(),

  })
};

const deleteCategory = {
  params: Joi.object().keys({
    categoryId: Joi.string().custom(objectId).required(),
  }),
};

const updateCategoryStatus = {
  params: Joi.object().keys({
    categoryId: Joi.string().required(),
  }),
  body: Joi.object().keys({
    clientId: Joi.string().custom(objectId).optional(),
    status: Joi.boolean().required(),
    zoneId: Joi.string().required(),
    
  }),
};

module.exports = {
  createCategory,
  getCategories,
  getCategory,
  getCategoriesWithoutPagination,
  updateCategory,
  deleteCategory,
  updateCategoryStatus
};
