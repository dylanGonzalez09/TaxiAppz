const mongoose = require('mongoose');
const { toJSON, paginate } = require('../plugins');

const vehicleSchema = mongoose.Schema(
  {
    vehicleName: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    capacity: {
      type: Number,
      required: true,
    },
    serviceType: {
      type: String,
      required: true,
      trim: true,
    },
    categoryId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Category',
      default: null,
    },
    sortingorder: {
      type: Number,
      required: true,
    },
    highlightImage: {
      type: String,
      required: true,
    },
    status: {
      type: Boolean,
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
vehicleSchema.plugin(toJSON);
vehicleSchema.plugin(paginate);

// Index for findOne by _id + clientId (createTrip)
vehicleSchema.index({ clientId: 1 }, { background: true });

/**
 * @typedef Vehicle
 */
const Vehicle = mongoose.model('Vehicle', vehicleSchema);

module.exports = Vehicle;
