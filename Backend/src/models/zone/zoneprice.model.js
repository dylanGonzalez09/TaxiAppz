const mongoose = require('mongoose');
const { toJSON, paginate } = require('../plugins');

const zonePriceSchema = new mongoose.Schema(
  {
    zoneId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Zone',
      default: null,
    },
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle', // Assuming there's a Type model, adjust as necessary
      default: null,
    },
    ridenowBasePrice: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
      default: 0.0,
    },
    ridenowPricePerTime: {
      type: String,
      default: null,
    },
    ridenowBaseDistance: {
      type: String,
      default: null,
    },
    ridenowPricePerDistance: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
      default: 0.0,
    },
    ridenowFreeWaitingTime: {
      type: String,
      default: null,
    },
    ridenowFreeWaitingTimeAfterStart: {
      type: String,
      default: null,
    },
    ridenowWaitingCharge: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
      default: 0.0,
    },
    ridenowCancellationFeeAfterAccept: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
      default: 0.0,
    },
    ridenowCancellationFeeAfterArrive: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
      default: 0.0,
    },
    ridenowCancellationFeeAfterStart: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
      default: 0.0,
    },
    ridenowAdminCommissionType: {
      type: String,
      default: null,
    },
    ridenowAdminCommission: {
      type: Number,
      default: null,
    },
    ridelaterBasePrice: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
      default: 0.0,
    },
    ridelaterPricePerTime: {
      type: String,
      default: null,
    },
    ridelaterBaseDistance: {
      type: String,
      default: null,
    },
    ridelaterPricePerDistance: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
      default: 0.0,
    },
    ridelaterFreeWaitingTime: {
      type: String,
      default: null,
    },
    ridelaterFreeWaitingTimeStart: {
      type: String,
      default: null,
    },
    ridelaterWaitingCharge: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
      default: 0.0,
    },
    ridelaterCancellationFeeAfterAccept: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
      default: 0.0,
    },
    ridelaterCancellationFeeAfterArrive: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
      default: 0.0,
    },
    ridelaterCancellationFeeAfterStart: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
      default: 0.0,
    },
    ridelaterAdminCommissionType: {
      type: String,
      default: null,
    },
    ridelaterAdminCommission: {
      type: Number,
      default: null,
    },
    status: {
      type: Boolean,
      required: true,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
    },
  },
  {
    timestamps: {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    },
  },
);

zonePriceSchema.plugin(toJSON);
zonePriceSchema.plugin(paginate);

// Index for find by zoneId (zone service, aggregations)
zonePriceSchema.index({ zoneId: 1 }, { background: true });
zonePriceSchema.index({ zoneId: 1, vehicleId: 1 }, { background: true });

const ZonePrice = mongoose.model('ZonePrice', zonePriceSchema);

module.exports = ZonePrice;
