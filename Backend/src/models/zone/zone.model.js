const mongoose = require('mongoose');
const { toJSON, paginate } = require('../plugins');

const zoneSchema = new mongoose.Schema({
  zoneName: {
    type: String,
    default: null,
  },
  primaryZoneId: {
    type: mongoose.Schema.Types.ObjectId,
    ref:'Zone',
    default: null
  },
  country: {
    type: mongoose.Schema.Types.ObjectId,
    ref:'Country',
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
    type: [String],
    required: true
  },
  status: {
    type: Boolean,
    required: true,
    default: true
  },
  nonServiceZone: {
    type: String,
    default: "No",
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
  biddingZone: {
    type: String,
    default: "no",
  },
  unit: {
    type: String,
    default: "KM",
  },
  zoneLevel: {
    type: String,
    enum: ['SECONDARY', 'PRIMARY'],
    default: 'SECONDARY',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref:'User',
    required: true,
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref:'Company',
    default: null,
  }
}, {
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  },
});

const Zone = mongoose.model('Zone', zoneSchema);

module.exports = Zone;
