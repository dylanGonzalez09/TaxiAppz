const Joi = require('joi');
const { objectId } = require('../../custom.validation');

const createRole = {
  body: Joi.object().keys({
    role: Joi.string().required(),
  }),
};

const getRoles = {
  query: Joi.object().keys({
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getRole = {
  params: Joi.object().keys({
    roleId: Joi.string().custom(objectId),
  }),
};

const getRoleWithOutPagination = {};

const updateRole = {
  params: Joi.object().keys({
    roleId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      role: Joi.string(),
      clientId: Joi.string().custom(objectId).optional(),
    })
    .min(1),
};

const deleteRole = {
  params: Joi.object().keys({
    roleId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createRole,
  getRoles,
  getRole,
  getRoleWithOutPagination,
  updateRole,
  deleteRole,
};
