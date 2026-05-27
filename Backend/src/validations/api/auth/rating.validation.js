// validations/sos.validation.js
const Joi = require('joi');
const { objectId } = require('../../custom.validation');

const createRating = {
  body: Joi.object().keys({
    userId: Joi.string().custom(objectId).optional(),
    requestId: Joi.string().custom(objectId).optional(),
    rating: Joi.number(),
    feedback: Joi.array().items(Joi.object().keys({
      status: Joi.boolean().required(),
      id: Joi.string().custom(objectId).required(),
      question: Joi.string().required(),
    })).optional(),
  }),
};

// const getUserComplaints = {
//   query: Joi.object().keys({
//     page: Joi.number().integer().default(1),
//     limit: Joi.number().integer().default(10),
//   }),
// };

// const getUserComplaint = {
//   params: Joi.object().keys({
//     userComplaintId: Joi.string().custom(objectId).required(),
//   }),
// };

// const updateUserComplaint = {
//   params: Joi.object().keys({
//     userComplaintId: Joi.string().custom(objectId).required(),
//   }),
//   body: Joi.object().keys({
//     userId: Joi.string().custom(objectId).optional(),
//     complainId: Joi.string().custom(objectId).optional(),
//     requestId: Joi.string().custom(objectId).optional(),
//     answer: Joi.string().trim().optional()
//   }).min(1),
// };

// const deleteUserComplaint = {
//   params: Joi.object().keys({
//     userComplaintId: Joi.string().custom(objectId).required(),
//   }),
// };

module.exports = {
  createRating,
  // getUserComplaints,
  // getUserComplaint,
  // updateUserComplaint,
  // deleteUserComplaint,
};
