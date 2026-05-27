const Joi = require('joi');
const { objectId } = require('../custom.validation');

const createTicket = {
  FormData: Joi.object().keys({
    title: Joi.string().required(),
    description: Joi.string().required(),
    user: Joi.string().custom(objectId).required(),
    // assignedTo: Joi.string().custom(objectId).required(),
    status: Joi.string().required(),
    // note: Joi.string(),
  }),
};

const getTicket = {
  params: Joi.object().keys({
    ticketId: Joi.string().required(),
  }),
};

const updateTicket = {
  params: Joi.object().keys({
    ticketId: Joi.string().required(),
  }),
  FormData: Joi.object()
    .keys({
      title: Joi.string(),
      description: Joi.string(),
      user: Joi.string().custom(objectId),
      // assignedTo: Joi.string().custom(objectId),
      status: Joi.string(),
      // note: Joi.string(),
    })
    .min(1),
};

const deleteTicket = {
  params: Joi.object().keys({
    ticketId: Joi.string().required(),
  }),
};

const UpdateTicketStatus = {
  params: Joi.object().keys({
    ticketId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object().keys({
    status: Joi.string().required(),
    note: Joi.any().required(),
    assignedToId: Joi.string().custom(objectId).optional(),
  }),
};

module.exports = {
  createTicket,
  getTicket,
  updateTicket,
  deleteTicket,
  UpdateTicketStatus,
};
