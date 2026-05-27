const mongoose = require('mongoose');
const { toJSON, paginate } = require('../plugins');

const vehicleModelSchema = mongoose.Schema(
  {
    modelname: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
      default: '',
    },
    image: {
      type: String,
      required: true,
    },
    brandId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Brand',
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
    zoneId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Zone',
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// plugins
vehicleModelSchema.plugin(toJSON);
vehicleModelSchema.plugin(paginate);

/**
 * @typedef VehicleModel
 */
const VehicleModel = mongoose.model('VehicleModel', vehicleModelSchema);

module.exports = VehicleModel;
