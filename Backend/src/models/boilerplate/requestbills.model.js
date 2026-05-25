const mongoose = require('mongoose');
const { toJSON, paginate } = require('./../plugins');

const requestBillSchema = mongoose.Schema(
  {
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Request',
    },
    basePrice: {
      type: Number,
      default: 0.00,
    },
    baseDistance: {
      type: Number,
      required: true,
    },
    totalDistance: {
      type: Number,
      default: 0.00000000,
    },
    totalTime: {
      type: Number,
      default: 0.00,
    },
    pricePerDistance: {
      type: Number,
      default: 0.00,
    },
    distancePrice: {
      type: Number,
      default: 0.00,
    },
    pricePerTime: {
      type: Number,
      default: 0.00,
    },
    timePrice: {
      type: Number,
      default: 0.00,
    },
    waitingCharge: {
      type: Number,
      default: 0.00,
    },
    cancellationFee: {
      type: Number,
      default: 0.00,
    },
    serviceTax: {
      type: Number,
      default: 0.00,
    },
    serviceTaxPercentage: {
      type: Number,
      default: 0,
    },
    promoDiscount: {
      type: Number,
      default: 0.00,
    },
    adminCommission: {
      type: Number,
      default: 0.00,
    },
    adminCommissionWithTax: {
      type: Number,
      default: 0.00,
    },
    driverCommission: {
      type: Number,
      default: 0.00,
    },
    totalAmount: {
      type: Number,
      default: 0.00,
    },
    requestedCurrencyCode: {
      type: String,
      default: null,
    },
    requestedCurrencySymbol: {
      type: String,
      default: null,
    },
    createdAt: {
      type: Date,
      default: null,
    },
    updatedAt: {
      type: Date,
      default: null,
    },
    subTotal: {
      type: Number,
      default: 0.00,
    },
    outOfZonePrice: {
      type: Number,
      default: 0.00,
    },
    bookingFees: {
      type: Number,
      default: null,
    },
    hillStationPrice: {
      type: Number,
      default: 0.00,
    },
  },
  {
    timestamps: true,
  }
);

requestBillSchema.plugin(toJSON);
requestBillSchema.plugin(paginate);

/**
 * @typedef RequestBill
 */
const RequestBill = mongoose.model('RequestBill', requestBillSchema);

module.exports = RequestBill;
