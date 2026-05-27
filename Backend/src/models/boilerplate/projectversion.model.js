const mongoose = require('mongoose');
const { toJSON, paginate } = require('../plugins');

const projectVersionSchema = mongoose.Schema(
  {
    versionNumber: {
      type: String,
      required: true,
    },
    versionCode: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    applicationType: {
      type: String,
      required: true,
    },
    status: {
      type: Boolean,
      required: true,
      default: true,
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

// add plugin that converts mongoose to json
projectVersionSchema.plugin(toJSON);
projectVersionSchema.plugin(paginate);

/**
 * @typedef Version
 */
const Version = mongoose.model('Version', projectVersionSchema);

module.exports = Version;
