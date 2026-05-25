const Joi = require('joi');
const { objectId } = require('../../custom.validation');
const FormData = require('form-data');
const { parseJSONWithOptions } = require('date-fns/fp');



const respondValidation = {
  body: Joi.object({
    requestId: Joi.string().custom(objectId),
    isAccept: Joi.boolean().required(),
  }),
};

const userRequestList = {
  body: Joi.object({
    requestId: Joi.string().custom(objectId).required(),
  }),
};

const bidAmountUpdate = {
  body: Joi.object({
    requestId: Joi.string().custom(objectId).required(), 
    bidAmount: Joi.number().required()
  })
};

const AssignRequest = {
  body: Joi.object({
    requestId: Joi.string().custom(objectId).required(),
    driverId: Joi.string().custom(objectId).required(),
    isLater: Joi.boolean().optional(),
    tripAmount: Joi.number().optional()
  })
};


module.exports = {
  respondValidation,
  userRequestList,
  bidAmountUpdate,
  AssignRequest
};
