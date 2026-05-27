const Joi = require('joi');
const { objectId } = require('../../custom.validation');

const createRequest = {
  body: Joi.object({
    requestNumber: Joi.string().optional(),
    requestOtp: Joi.number().optional(),
    isLater: Joi.boolean().optional(),
    isInstantTrip: Joi.boolean().optional(),
    ifDispatch: Joi.boolean().optional(),
    zoneTypeId: Joi.string().optional().allow(null),
    userId: Joi.string().optional().allow(null),
    driverId: Joi.string().optional().allow(null),
    tripStartTime: Joi.date().optional().allow(null),
    arrivedAt: Joi.date().optional().allow(null),
    acceptedAt: Joi.date().optional().allow(null),
    completedAt: Joi.date().optional().allow(null),
    cancelledAt: Joi.date().optional().allow(null),
    isDriverStarted: Joi.boolean().optional(),
    isDriverArrived: Joi.boolean().optional(),
    isTripStart: Joi.boolean().optional(),
    isCompleted: Joi.boolean().optional(),
    isCancelled: Joi.boolean().optional(),
    customReason: Joi.string().optional().allow(null),
    cancelMethod: Joi.string().valid('Automatic', 'User', 'Driver', 'Dispatcher').required(),
    totalDistance: Joi.number().optional(),
    totalTime: Joi.number().optional(),
    isPaid: Joi.boolean().optional(),
    userRated: Joi.boolean().optional(),
    driverRated: Joi.boolean().optional(),
    timezone: Joi.string().optional().allow(null),
    attemptForSchedule: Joi.number().optional(),
    dispatcherId: Joi.string().optional().allow(null),
    driverNotes: Joi.string().optional().allow(null),
    createdBy: Joi.string().optional().allow(null),
    adminDemoKey: Joi.string().optional().allow(null),
    paymentOpt: Joi.string().valid('Card', 'Cash', 'Wallet').allow(null),
    rideType: Joi.string().valid('Ride_now', 'Ride_later').allow(null),
    unit: Joi.string().optional().allow(null),
    requestedCurrencyCode: Joi.string().optional().allow(null),
    requestedCurrencySymbol: Joi.string().optional().allow(null),
    promoId: Joi.string().optional().allow(null),
    locationApprove: Joi.boolean().optional(),
    holdStatus: Joi.number().optional(),
    availablesStatus: Joi.number().optional(),
    tripType: Joi.string().valid('LOCAL', 'RENTAL', 'OUTSTATION').optional().allow(null),
    rentalPackage: Joi.string().optional().allow(null),
    manualTrip: Joi.string().valid('AUTOMATIC', 'MANUAL').optional().allow(null),
    outstationId: Joi.string().optional().allow(null),
    outstationTypeId: Joi.string().optional().allow(null),
    packageId: Joi.string().optional().allow(null),
    packageItemId: Joi.string().optional().allow(null),
    bookingFor: Joi.string().valid('MYSELF', 'OTHERS').optional().allow(null),
    othersUserId: Joi.string().optional().allow(null),
  }),
};

const getRequests = {
  query: Joi.object({
    isCompleted: Joi.boolean().optional(),
    isCancelled: Joi.boolean().optional(),
    driverId: Joi.string().optional(),
    userId: Joi.string().optional(),
    sortBy: Joi.string().optional(),
    limit: Joi.number().integer().optional(),
    page: Joi.number().integer().optional(),
  }),
};

const getRequestById = {
  params: Joi.object({
    requestId: Joi.string().required(),
  }),
};

const getRequestHistoryById = {
  params: Joi.object({
    phoneNumber: Joi.string().required(),
  }),
};

const updateRequest = {
  params: Joi.object({
    requestId: Joi.string().required(),
  }),
  body: Joi.object({
    requestNumber: Joi.string().optional(),
    requestOtp: Joi.number().optional(),
    isLater: Joi.boolean().optional(),
    isInstantTrip: Joi.boolean().optional(),
    ifDispatch: Joi.boolean().optional(),
    zoneTypeId: Joi.string().optional().allow(null),
    userId: Joi.string().optional().allow(null),
    driverId: Joi.string().optional().allow(null),
    tripStartTime: Joi.date().optional().allow(null),
    arrivedAt: Joi.date().optional().allow(null),
    acceptedAt: Joi.date().optional().allow(null),
    completedAt: Joi.date().optional().allow(null),
    cancelledAt: Joi.date().optional().allow(null),
    isDriverStarted: Joi.boolean().optional(),
    isDriverArrived: Joi.boolean().optional(),
    isTripStart: Joi.boolean().optional(),
    isCompleted: Joi.boolean().optional(),
    isCancelled: Joi.boolean().optional(),
    customReason: Joi.string().optional().allow(null),
    cancelMethod: Joi.string().valid('Automatic', 'User', 'Driver', 'Dispatcher').optional(),
    totalDistance: Joi.number().optional(),
    totalTime: Joi.number().optional(),
    isPaid: Joi.boolean().optional(),
    userRated: Joi.boolean().optional(),
    driverRated: Joi.boolean().optional(),
    timezone: Joi.string().optional().allow(null),
    attemptForSchedule: Joi.number().optional(),
    dispatcherId: Joi.string().optional().allow(null),
    driverNotes: Joi.string().optional().allow(null),
    createdBy: Joi.string().optional().allow(null),
    adminDemoKey: Joi.string().optional().allow(null),
    paymentOpt: Joi.string().valid('Card', 'Cash', 'Wallet').optional(),
    rideType: Joi.string().valid('Ride Now', 'Ride Later').optional(),
    unit: Joi.string().optional().allow(null),
    requestedCurrencyCode: Joi.string().optional().allow(null),
    requestedCurrencySymbol: Joi.string().optional().allow(null),
    promoId: Joi.string().optional().allow(null),
    locationApprove: Joi.boolean().optional(),
    holdStatus: Joi.number().optional(),
    availablesStatus: Joi.number().optional(),
    tripType: Joi.string().valid('LOCAL', 'RENTAL', 'OUTSTATION').optional().allow(null),
    rentalPackage: Joi.string().optional().allow(null),
    manualTrip: Joi.string().valid('AUTOMATIC', 'MANUAL').optional().allow(null),
    outstationId: Joi.string().optional().allow(null),
    outstationTypeId: Joi.string().optional().allow(null),
    packageId: Joi.string().optional().allow(null),
    packageItemId: Joi.string().optional().allow(null),
    bookingFor: Joi.string().valid('MYSELF', 'OTHERS').optional().allow(null),
    othersUserId: Joi.string().optional().allow(null),
  }).min(1), // Ensure at least one field is being updated
};

const deleteRequest = {
  params: Joi.object({
    requestId: Joi.string().required(),
  }),
};

module.exports = {
  createRequest,
  getRequests,
  getRequestById,
  updateRequest,
  deleteRequest,
  getRequestHistoryById,
};
