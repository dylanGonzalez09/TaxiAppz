const mongoose = require('mongoose');
const { toJSON, paginate } = require('../plugins');
const { required } = require('joi');

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
      trim: true,
      default: null,
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
    deletedAt: {
      type: Date,
      default: null,
    },
    serviceLocation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Zone',
      required: true
    },
    secondaryZone: {
      type: [mongoose.Schema.Types.ObjectId],
      default: null
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
      default: 'BOTH'
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      default: null,
    },
    serviceCategory: {
      type: String,
      enum: ['individual', 'company'],
      default: 'individual',
    },
    serviceType: {
      type: [String],
      default: null,
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
    }
  },
  {
    timestamps: true,
  }
);

// Add plugin that converts mongoose to json
driverSchema.plugin(toJSON);
driverSchema.plugin(paginate);

/**
 * @typedef Driver
 */
const Driver = mongoose.model('Driver', driverSchema);

module.exports = Driver;
