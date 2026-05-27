const mongoose = require('mongoose');
const { required, boolean } = require('joi');
const { toJSON, paginate } = require('../plugins');

const driverSchema = mongoose.Schema(
  {
    type: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      default: null,
    },
    isAvailable: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    isApprove: {
      type: Boolean,
      default: false,
    },
    totalAccept: {
      type: Number,
      default: 0,
    },
    totalReject: {
      type: Number,
      default: 0,
    },
    carNumber: {
      type: String,
      trim: true,
      default: null,
    },
    carModel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'VehicleModel',
      default: null,
    },
    vehicleVariant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'VehicleVariant',
      trim: true,
      default: null,
    },
    vehicleBrand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Brand',
      trim: true,
      default: null,
    },
    specialPrice: {
      type: Boolean,
      default: false,
    },
    carYear: {
      type: String,
      trim: true,
      default: null,
    },
    carColour: {
      type: String,
      trim: true,
      default: null,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: Boolean,
      required: true,
      default: false,
    },
    pendingAdminBlock: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    serviceLocation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Zone',
      required: true,
    },
    secondaryZone: {
      type: [mongoose.Schema.Types.ObjectId],
      default: null,
    },
    rejectCount: {
      type: Number,
      default: 0,
    },
    documentUploadStatus: {
      type: Number,
      default: 2,
    },
    referenceCount: {
      type: Number,
      default: 0,
    },
    city: {
      type: String,
      trim: true,
      default: null,
    },
    state: {
      type: String,
      trim: true,
      default: null,
    },
    pincode: {
      type: String,
      trim: true,
      default: null,
    },
    acceptanceRatio: {
      type: Number,
      default: 100,
    },
    subscriptionType: {
      type: String,
      enum: ['COMMISSION', 'SUBSCRIPTION', 'BOTH'],
      required: true,
      default: 'BOTH',
    },

    serviceCategory: {
      type: String,
      enum: ['individual'],
      default: 'individual',
    },
    serviceType: {
      type: [String],
      default: [],
    },
    brandLabel: {
      type: String,
      trim: true,
      default: 'NO',
    },
    loginMethod: {
      type: String,
      trim: true,
      default: null,
    },
    approvedBy: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
      default: null,
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
    },
  },
  {
    timestamps: true,
  },
);

// Add plugin that converts mongoose to json
driverSchema.plugin(toJSON);
driverSchema.plugin(paginate);

// Indexes for findOne by userId, count by serviceLocation (zone/request flows)
driverSchema.index({ userId: 1 }, { background: true });
driverSchema.index({ serviceLocation: 1 }, { background: true });
driverSchema.index({ clientId: 1, status: 1 }, { background: true });

/**
 * @typedef Driver
 */
const Driver = mongoose.model('Driver', driverSchema);

module.exports = Driver;
