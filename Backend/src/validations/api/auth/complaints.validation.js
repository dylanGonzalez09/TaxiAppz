const Joi = require('joi');
const { objectId } = require('../../custom.validation');

const createComplaint = {
  body: Joi.object().keys({
    title: Joi.string().trim().optional(),
    category: Joi.string().custom(objectId).required(),
    type: Joi.string().trim().optional(),
    status: Joi.number().default(1),
    complaintType: Joi.number().default(1).required(),
    language: Joi.string().trim().optional(),
  }),
};

const getComplaints = {
  query: Joi.object().keys({
    page: Joi.number().integer().default(1),
    limit: Joi.number().integer().default(10),
  }),
};

const getComplaint = {
  params: Joi.object().keys({
    complaintId: Joi.string().custom(objectId).required(),
  }),
};

const updateComplaint = {
  params: Joi.object().keys({
    complaintId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object().keys({
    title: Joi.string().trim().optional(),
    category: Joi.string().custom(objectId).optional(),
    type: Joi.string().trim().optional(),
    status: Joi.number().optional(),
    complaintType: Joi.number().optional(),
    language: Joi.string().trim().optional(),
  }).min(1),
};

const deleteComplaint = {
  params: Joi.object().keys({
    complaintId: Joi.string().custom(objectId).required(),
  }),
};

module.exports = {
  createComplaint,
  getComplaints,
  getComplaint,
  updateComplaint,
  deleteComplaint,
};
