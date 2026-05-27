const mongoose = require('mongoose');
const { toJSON, paginate } = require('../plugins');

const driverLogSchema = mongoose.Schema(
  {
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver',
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    onlineTime: {
      type: Date,
      default: null,
    },
    offlineTime: {
      type: Date,
      default: null,
    },
    workingTime: {
      type: String,
      default: '00:00:00',
    },
    status: {
      type: Number,
      enum: [0, 1],
      default: 1,
    },
  },
  {
    timestamps: true,
  },
);

driverLogSchema.plugin(toJSON);
driverLogSchema.plugin(paginate);

/**
 * @typedef DriverLog
 */
const DriverLog = mongoose.model('DriverLog', driverLogSchema);

module.exports = DriverLog;
