const mongoose = require('mongoose');
const { toJSON, paginate } = require('../plugins');

const phoneInfoSchema = new mongoose.Schema({
  deviceHash: {
    type: String,
    required: true,
    index: true,
  },
  platform: {
    type: String,
    enum: ['android', 'ios'],
    required: true,
    index: true,
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true,
  },
  appVersion: {
    type: String,
  },
  language: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastSeenAt: {
    type: Date,
    default: Date.now,
  },
});

phoneInfoSchema.index({ deviceHash: 1, platform: 1, clientId: 1 }, { unique: true });
// ✅ Plugins
phoneInfoSchema.plugin(toJSON);
phoneInfoSchema.plugin(paginate);
module.exports = mongoose.model('PhoneInfo', phoneInfoSchema);
