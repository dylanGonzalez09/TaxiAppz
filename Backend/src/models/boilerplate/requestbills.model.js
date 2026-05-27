const mongoose = require('mongoose');
const { toJSON, paginate } = require('../plugins');

const requestBillSchema = mongoose.Schema(
  {
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Request',
    },
    basePrice: {
      type: Number,
      default: 0.0,
    },
    baseDistance: {
      type: Number,
      required: true,
    },
    totalDistance: {
      type: Number,
      default: 0.0,
    },
    totalTime: {
      type: Number,
      default: 0.0,
    },
    pricePerDistance: {
      type: Number,
      default: 0.0,
    },
    distancePrice: {
      type: Number,
      default: 0.0,
    },
    pricePerTime: {
      type: Number,
      default: 0.0,
    },
    timePrice: {
      type: Number,
      default: 0.0,
    },
    waitingCharge: {
      type: Number,
      default: 0.0,
    },
    cancellationFee: {
      type: Number,
      default: 0.0,
    },
    serviceTax: {
      type: Number,
      default: 0.0,
    },
    serviceTaxPercentage: {
      type: Number,
      default: 0,
    },
    promoDiscount: {
      type: Number,
      default: 0.0,
    },
    adminCommission: {
      type: Number,
      default: 0.0,
    },
    adminCommissionWithTax: {
      type: Number,
      default: 0.0,
    },
    driverCommission: {
      type: Number,
      default: 0.0,
    },
    totalAmount: {
      type: Number,
      default: 0.0,
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
      default: 0.0,
    },
    outOfZonePrice: {
      type: Number,
      default: 0.0,
    },
    bookingFees: {
      type: Number,
      default: null,
    },
    hillStationPrice: {
      type: Number,
      default: 0.0,
    },
    // Tip shown on invoice (computed money value, after % -> amount conversion)
    tipAmount: {
      type: Number,
      default: 0.00,
    },
    // When true, `tipAmount` in API was given as a percentage (%). When false, it's a fixed amount.
    isPercentage: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

requestBillSchema.plugin(toJSON);
requestBillSchema.plugin(paginate);

requestBillSchema.index({ requestId: 1 }, { background: true });

/**
 * @typedef RequestBill
 */
const RequestBill = mongoose.model('RequestBill', requestBillSchema);

module.exports = RequestBill;
