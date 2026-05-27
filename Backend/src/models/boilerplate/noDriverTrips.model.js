const mongoose = require('mongoose');
const { toJSON, paginate } = require('../plugins');

const noDriverTripsSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    pickUp: {
      type: String,
      default: null,
    },
    drop: {
      type: String,
      default: null,
    },
    dateTime: {
      type: Date,
      default: null,
    },
    tripType: {
      type: String,
      enum: ['LOCAL', 'RENTAL', 'OUTSTATION'],
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

noDriverTripsSchema.plugin(toJSON);
noDriverTripsSchema.plugin(paginate);

/**
 * @typedef NoDriverTrips
 */
const noDriverTrips = mongoose.model('NoDriverTrips', noDriverTripsSchema);

module.exports = noDriverTrips;
