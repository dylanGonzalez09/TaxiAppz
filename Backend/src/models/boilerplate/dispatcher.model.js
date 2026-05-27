const mongoose = require('mongoose');
const { toJSON, paginate } = require('../plugins');

const dispatcherSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: Boolean,
      required: true,
      default: true,
    },
    location: {
      type: String,
      trim: true,
      default: null,
    },
    serviceType: {
      type: [String],
      default: null,
    },
    zoneId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Zone',
      default: null, // Added default: null for consistency
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      default: null, // Added default: null for consistency
    },
  },
  {
    timestamps: true,
  },
);

// Add plugin that converts mongoose to JSON
dispatcherSchema.plugin(toJSON);
dispatcherSchema.plugin(paginate);

/**
 * @typedef Dispatcher
 */
const Dispatcher = mongoose.model('Dispatcher', dispatcherSchema);

module.exports = Dispatcher;
