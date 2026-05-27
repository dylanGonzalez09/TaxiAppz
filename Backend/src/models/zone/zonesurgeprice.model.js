const mongoose = require('mongoose');
const { toJSON, paginate } = require('../plugins');

const zoneSurgePriceSchema = new mongoose.Schema(
  {
    zoneId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Zone',
      default: null,
    },
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      default: null,
    },
    surgePrice: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
      default: 0.0,
    },
    surgeDistancePrice: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
      default: 0.0,
    },
    startTime: {
      type: String,
      default: null,
    },
    endTime: {
      type: String,
      default: null,
    },
    availableDays: {
      type: [String],
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

zoneSurgePriceSchema.index({ zoneId: 1 }, { background: true });

zoneSurgePriceSchema.plugin(toJSON);
zoneSurgePriceSchema.plugin(paginate);

const ZoneSurgePrice = mongoose.model('ZoneSurgePrice', zoneSurgePriceSchema);

module.exports = ZoneSurgePrice;
