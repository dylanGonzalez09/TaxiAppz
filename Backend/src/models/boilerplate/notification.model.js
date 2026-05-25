const mongoose = require('mongoose');
const { toJSON, paginate } = require('./../plugins');
const { required } = require('joi');

const notificationSchema = mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      default: null,
    },
    zoneIds: {
      type: [String], 
      default: null,
    },
    userIds: {
      type: [String], 
      required:false,
      default: null,
    },
    userId: {
      type: String, 
      required:false,
      default: null,
    },
    driverIds: {
      type: [String], 
      default: null,
    },
    subTitle: {
      type: String,
      trim: true,
      default: null,
    },
    message: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
      trim: true,
      default: null,
    },
    isRead: {
      type: Boolean,
      required: false,
      default: false,
    },
    status: {
      type: Number,
      required: true,
      default: 1,
    },
    notificationType: {
      type: String,
      enum: ['GENERAL', 'TRIP'],
      default: 'GENERAL',
    },
    sourceType: {
      type: String,
      enum: ['Mobile', 'Web'],
      default: 'Mobile',
    },
    createdBy: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      default: null,
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref:'Company',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Plugins for schema (toJSON, paginate, etc.)
notificationSchema.plugin(toJSON);
notificationSchema.plugin(paginate);

// Model definition
const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;