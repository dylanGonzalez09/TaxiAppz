const mongoose = require('mongoose');
const { toJSON, paginate } = require('../plugins');

const brandSchema = mongoose.Schema(
  {
    brandName: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: false,
      trim: true,
    },
    image: {
      type: String,
      required: true,
    },
    vehicleId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Vehicle',
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
    zoneId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Zone',
      required: false,
    },
  },
  {
    timestamps: true,
  },
);

// add plugin that converts mongoose to json
brandSchema.plugin(toJSON);
brandSchema.plugin(paginate);

/**
 * @typedef Brand
 */
const Brand = mongoose.model('Brand', brandSchema);

module.exports = Brand;
