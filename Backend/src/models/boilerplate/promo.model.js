const mongoose = require('mongoose');
const { toJSON, paginate } = require('../plugins');

const promoCodeSchema = mongoose.Schema(
  {
    zoneId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Zone',
      required: true,
      index: true,
    },
    promoCode: {
      type: String,
      required: true,
      trim: true,
    },
    promoCodeType: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    targetAmount: {
      type: Number,
      default: 0,
    },
    promoType: {
      type: String,
      default: null,
    },
    amount: {
      type: Number,
      default: 0,
    },
    percentage: {
      type: Number,
      default: 0,
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
    },
    userId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    fromDate: {
      type: Date,
      default: null,
    },
    toDate: {
      type: Date,
      default: null,
    },
    status: {
      type: Boolean,
      required: true,
      default: true,
    },
    totalCount: {
      type: Number,
      required: true,
      default: 0,
    },
    banner: {
      type: String,
      required: false,
    },
    promoReuseCount: {
      type: Number,
      required: true,
      default: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    vehicleType: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
    }],

  },
  {
    timestamps: true,
  },
);

promoCodeSchema.plugin(toJSON);
promoCodeSchema.plugin(paginate);

/**
 * @typedef PromoCode
 */
const PromoCode = mongoose.model('PromoCode', promoCodeSchema);

module.exports = PromoCode;
