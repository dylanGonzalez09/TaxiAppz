const mongoose = require('mongoose');
const { toJSON, paginate } = require('../plugins');

const settingSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    value: {
      type: String,
      required: true,
    },
    status: {
      type: Boolean,
      required: true,
    },
    type: {
      type: String,
      required: true,
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
settingSchema.plugin(toJSON);
settingSchema.plugin(paginate);

// Indexes for hot-path lookups (findOne by name, aggregate by clientId)
settingSchema.index({ name: 1 }, { background: true });
settingSchema.index({ clientId: 1, type: 1 }, { background: true });

/**
 * @typedef Settings
 */
const Settings = mongoose.model('Settings', settingSchema);

module.exports = Settings;
