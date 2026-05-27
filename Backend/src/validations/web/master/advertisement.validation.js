const Joi = require('joi');
const { objectId } = require('../../custom.validation');

const createAdvertisement = {
  FormData: Joi.object().keys({
    title: Joi.string().required(), // Changed from 'name' to 'title'
    zoneId: Joi.string().custom(objectId).required(),
    userType: Joi.string().valid('user', 'driver').required(), // Changed from 'type' to 'userType'
    isPermanent: Joi.string().valid('permanent', 'temporary').required(),
    image: Joi.string().required(),
    status: Joi.boolean().default(true),
  }),
};

const getAdvertisements = {
  query: Joi.object().keys({
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
    search: Joi.string().optional(),
  }),
};

const getAdvertisement = {
  params: Joi.object().keys({
    advertisementId: Joi.string().custom(objectId),
  }),
};

const getAdvertisementWithOutPagination = {};

const updateAdvertisement = {
  params: Joi.object().keys({
    advertisementId: Joi.required().custom(objectId),
  }),
  FormData: Joi.object()
    .keys({
      title: Joi.string().optional(), // Changed from 'name' to 'title'
      userType: Joi.string().valid('user', 'driver').optional(), // Changed from 'type' to 'userType'
      isPermanent: Joi.string().valid('permanent', 'temporary').optional(),
      image: Joi.string().optional(),
      status: Joi.boolean().optional(),
      zoneId: Joi.string().custom(objectId).optional(),
    })
    .min(1),
};

const deleteAdvertisement = {
  params: Joi.object().keys({
    advertisementId: Joi.string().custom(objectId),
  }),
};

const updateAdvertisementStatus = {
  params: Joi.object().keys({
    advertisementId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object().keys({
    status: Joi.boolean().required(),
  }),
};

module.exports = {
  createAdvertisement,
  getAdvertisements,
  getAdvertisement,
  getAdvertisementWithOutPagination,
  updateAdvertisement,
  deleteAdvertisement,
  updateAdvertisementStatus,
};
