const Joi = require('joi');
const { objectId } = require('../../custom.validation');

const createFavouritePlace = {
  body: Joi.object().keys({
    type: Joi.string().optional(),
    latitude: Joi.number().required(),
    longitude: Joi.number().required(),
    address: Joi.string().required(),
  }),
};

const getFavouritePlaces = {
  query: Joi.object().keys({
    userId: Joi.string().custom(objectId),
    status: Joi.number(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getFavouritePlace = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

const updateFavouritePlace = {
  params: Joi.object().keys({
    id: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object()
    .keys({
      type: Joi.string(),
      latitude: Joi.number(),
      longitude: Joi.number(),
      address: Joi.string(),
      status: Joi.boolean(),
    })
    .min(1),
};

const deleteFavouritePlace = {
  params: Joi.object().keys({
    id: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createFavouritePlace,
  getFavouritePlaces,
  getFavouritePlace,
  updateFavouritePlace,
  deleteFavouritePlace,
};
