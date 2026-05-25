const Joi = require('joi');
const { objectId } = require('../../custom.validation');
const FormData = require('form-data');
const { parseJSONWithOptions } = require('date-fns/fp');

const createTripValidation = {
  body: Joi.object({
    pick_lat: Joi.number().required(),
    pick_lng: Joi.number().required(),
    pick_address: Joi.string().required(),
    drop_lat: Joi.number().optional(),
    drop_lng: Joi.number().optional(),
    drop_address: Joi.string().optional(),
    estimatedAmount: Joi.number().optional(),
    vehicle_type: Joi.string().when('ride_type', {
      is: Joi.valid('RENTAL'),
      then: Joi.optional(),
      otherwise: Joi.required()
    }),
    booking_for: Joi.string().optional(),
    payment_opt: Joi.string().optional(),
    ride_type: Joi.string().required(),
    trip_type: Joi.string().required(),
    trip_start_time: Joi.string().when('is_later', {
      is: '1',
      then: Joi.required(),
      otherwise: Joi.optional()
    }),
    others_name: Joi.string().optional(),
    others_number: Joi.string().optional(),
    promo_code: Joi.optional(),
    estAmount: Joi.optional(),
    isLater: Joi.optional(),
    tripTime:Joi.optional(),
    packageId: Joi.string().custom(objectId).optional(),
    stops: Joi.array().optional()
  }),
};


const createDispatcherValidation = {
  body: Joi.object({
    userId: Joi.string().custom(objectId),
    passengerName: Joi.string().optional(),
    passengerNumber: Joi.string().optional(),
    driverId: Joi.alternatives()
    .try(Joi.string().custom(objectId), Joi.valid(null))
    .optional(),
    pick_lat: Joi.number().required(),
    pick_lng: Joi.number().required(),
    pick_address: Joi.string().required(),
    drop_lat: Joi.number().optional(),
    drop_lng: Joi.number().optional(),
    drop_address: Joi.string().optional(),
    vehicle_type: Joi.string().when('ride_type', {
      is: Joi.valid('RENTAL'),
      then: Joi.optional(),
      otherwise: Joi.required()
    }),
    // booking_for: Joi.string().required(),
    payment_opt: Joi.string().required(),
    ride_type: Joi.string().required(),
    trip_type: Joi.string().required(),
    manual_trip: Joi.string().required(),
    trip_start_time: Joi.string().when('is_later', {
      is: '1',
      then: Joi.required(),
      otherwise: Joi.optional()
    }),
    ride_date: Joi.optional(),
    others_name: Joi.string(),
    others_number: Joi.string(),
    promo_code: Joi.optional(),
    stops: Joi.object().optional(),
    packageId: Joi.string().custom(objectId).optional(),
    etaAmount: Joi.number().optional()
  }),
};

const createPaymentValidation = {
  body: Joi.object({
    amount: Joi.number().required(),
    currency: Joi.string().required()
  }),
};
const confirmPaymentValidation = {
  body: Joi.object({
    paymentIntentid: Joi.string().required()
  }),
};
const respondValidation = {
  body: Joi.object({
    requestId: Joi.string().custom(objectId).required(),
    status: Joi.string().valid('ACCEPTED', 'REJECTED').required(),
    driverId: Joi.string().custom(objectId).optional(),
    bidAmount: Joi.number().optional()
  }),
};

module.exports = {
  createTripValidation,
  createDispatcherValidation,
  createPaymentValidation,
  confirmPaymentValidation,
  respondValidation
};
