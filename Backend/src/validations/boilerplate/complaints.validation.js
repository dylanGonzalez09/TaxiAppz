const Joi = require('joi');
const { objectId } = require('../custom.validation');

const createComplaints = {
  FormData: Joi.object().keys({
    title: Joi.string().required(),
    type: Joi.string().required(),
    // category: Joi.string().custom(objectId).optional(),
    language: Joi.string().custom(objectId).required(),
    clientId: Joi.string().custom(objectId).required(),
    zoneId:Joi.string().custom(objectId).required()
  }),
};

const getComplaints = {
  query: Joi.object().keys({
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getComplaintss = {
  params: Joi.object().keys({
    complaintsId: Joi.string().required(),
  }),
};

const updateComplaints = {
  params: Joi.object().keys({
    complaintsId: Joi.string().required(),
  }),
  FormData: Joi.object()
    .keys({
      title: Joi.string().required(),
      type: Joi.string().required(),
      // category: Joi.string().custom(objectId).optional(),
      language: Joi.string().custom(objectId).required(),
      clientId: Joi.string().custom(objectId).required(),
      status: Joi.boolean().required(),
    })
    .min(1),
};

const deleteComplaints = {
  params: Joi.object().keys({
    complaintsId: Joi.string().required(),
  }),
};

const UpdateComplaintsStatus = {
  params: Joi.object().keys({
    complaintsId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object().keys({
    status: Joi.boolean().required(),
  }),
};

module.exports = {
  createComplaints,
  getComplaintss,
  getComplaints,
  updateComplaints,
  deleteComplaints,
  UpdateComplaintsStatus,
};
