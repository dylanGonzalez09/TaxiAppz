const mongoose = require('mongoose');
const { toJSON, paginate } = require('../plugins');

const advertisementSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    isPermanent: {
      type: String,
      enum: ['permanent', 'temporary'],
      required: true,
      default: 'temporary',
    },

    status: {
      type: Boolean,
      required: true,
      default: true,
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: true,
    },
    zoneId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Zone',
      required: true,
    },
    userType: {
      type: String,
      enum: ['user', 'driver'],
      required: true,
    },
    image: {
      type: String, // Store image URL or file path
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// add plugin that converts mongoose to json
advertisementSchema.plugin(toJSON);
advertisementSchema.plugin(paginate);

/**
 * @typedef Advertisement
 */
const Advertisement = mongoose.model('Advertisement', advertisementSchema);

module.exports = Advertisement;
