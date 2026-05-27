const Joi = require('joi');
const { objectId } = require('../../custom.validation');

const createTicket = {
  body: Joi.object().keys({
    title: Joi.string().required(),
    description: Joi.string().required(),
    requestId: Joi.string().custom(objectId).optional(),
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
  body: Joi.object()
    .keys({
      title: Joi.string().required(),
      description: Joi.string().allow('').optional(),
      requestId: Joi.string().custom(objectId).optional(),
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
  }),
};

module.exports = {
  createTicket,
  getTicket,
  updateTicket,
  deleteTicket,
  UpdateTicketStatus,
};
