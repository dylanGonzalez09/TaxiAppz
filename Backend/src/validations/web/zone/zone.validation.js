const Joi = require('joi');
const { objectId } = require('../../custom.validation');

const createZone = {
  body: Joi.object().keys({
    zoneName: Joi.string().required(),
    primaryZoneId: Joi.number().optional().allow(null),
    country: Joi.string().custom(objectId).required(),
    adminCommissionType: Joi.string().optional().allow(null),
    adminCommission: Joi.string().optional().allow(null),
    mapZone: Joi.object().optional().allow(null),
    paymentTypes: Joi.string().optional().allow(null),
    unit: Joi.string().optional().allow(null),
    nonServiceZone: Joi.string().optional().allow(null),
    status: Joi.boolean().required(),
    typesId: Joi.string().optional().allow(null),
    mapCooder: Joi.string().optional().allow(null),
    zoneLevel: Joi.string().valid('SECONDARY', 'PRIMARY').default('SECONDARY'),
    driverAssignMethod: Joi.string().valid('DISTANCE', 'FIFO').default('DISTANCE'),
    createdBy: Joi.string().custom(objectId).required(),
  }),
};

const getZones = {
  query: Joi.object().keys({
    zoneName: Joi.string(),
    country: Joi.string().custom(objectId),
    status: Joi.boolean(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const updateZoneStatus = {
  params: Joi.object().keys({
    zoneId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object().keys({
    status: Joi.boolean().required(),
  }),
};

const getZone = {
  params: Joi.object().keys({
    zoneId: Joi.string().custom(objectId).required(),
  }),
};

const updateZone = {
  params: Joi.object().keys({
    zoneId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object()
    .keys({
      zoneName: Joi.string().optional(),
      primaryZoneId: Joi.number().optional().allow(null),
      country: Joi.string().custom(objectId).optional(),
      adminCommissionType: Joi.string().optional().allow(null),
      adminCommission: Joi.string().optional().allow(null),
      mapZone: Joi.object().optional().allow(null),
      paymentTypes: Joi.string().optional().allow(null),
      unit: Joi.string().optional().allow(null),
      nonServiceZone: Joi.string().optional().allow(null),
      status: Joi.boolean().optional(),
      typesId: Joi.string().optional().allow(null),
      mapCooder: Joi.string().optional().allow(null),
      zoneLevel: Joi.string().valid('SECONDARY', 'PRIMARY').optional(),
      driverAssignMethod: Joi.string().valid('DISTANCE', 'FIFO').optional(),
      createdBy: Joi.string().custom(objectId).required(),
    })
    .min(1), // Ensure at least one field is being updated
};

const deleteZone = {
  params: Joi.object().keys({
    zoneId: Joi.string().custom(objectId).required(),
  }),
};

module.exports = {
  createZone,
  getZones,
  getZone,
  updateZone,
  deleteZone,
  updateZoneStatus,
};
