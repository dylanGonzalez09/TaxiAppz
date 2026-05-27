const mongoose = require('mongoose');
const { toJSON, paginate } = require('../plugins');

const zoneSchema = new mongoose.Schema(
  {
    zoneName: {
      type: String,
      default: null,
    },
    primaryZoneId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Zone',
      default: null,
    },
    country: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Country',
      required: true,
    },
    currency: {
      type: String,
      default: null,
    },
    adminCommissionType: {
      type: String,
      default: null,
    },
    adminCommission: {
      type: String,
      default: null,
    },
    mapZone: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    paymentTypes: {
      type: [
        {
          type: String,
          enum: ['Cash', 'Card', 'Wallet'],
        },
      ],
      default: [],
    },
    status: {
      type: Boolean,
      required: true,
      default: true,
    },
    nonServiceZone: {
      type: String,
      default: 'No',
    },
    createdAt: {
      type: Date,
      default: null,
    },
    updatedAt: {
      type: Date,
      default: null,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    typesId: {
      type: String,
      default: null,
    },
    unit: {
      type: String,
      default: 'KM',
    },
    zoneLevel: {
      type: String,
      enum: ['SECONDARY', 'PRIMARY'],
      default: 'SECONDARY',
    },
    biddingZone: {
      type: String,
      default: 'no',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
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

// Add plugin that converts mongoose to json
zoneSchema.plugin(toJSON);
zoneSchema.plugin(paginate);

// Indexes for list/filter by client and status (getZoneDetails, queryZone)
zoneSchema.index({ clientId: 1, status: 1 }, { background: true });
zoneSchema.index({ primaryZoneId: 1 }, { background: true });
zoneSchema.index({ clientId: 1, zoneLevel: 1, status: 1 }, { background: true });

const Zone = mongoose.model('Zone', zoneSchema);

module.exports = Zone;
