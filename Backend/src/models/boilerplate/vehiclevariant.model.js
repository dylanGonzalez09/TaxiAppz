const mongoose = require('mongoose');
const { toJSON, paginate } = require('../plugins');

const vehicleVariantSchema = mongoose.Schema(
  {
    variantName: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    image: {
      type: String,
      required: true,
    },

    vehicleModelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'VehicleModel',
      required: true,
      index: true,
    },

    status: {
      type: Boolean,
      default: true, // better than required: true
    },

    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
    },

    zoneId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Zone',
      required: false,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// 🔹 Prevent duplicate variant inside same vehicle model
vehicleVariantSchema.index({ vehicleModelId: 1, variantName: 1 }, { unique: true });

// Remove old index on vehicleId if it exists (migration cleanup)

// plugins
vehicleVariantSchema.plugin(toJSON);
vehicleVariantSchema.plugin(paginate);

const VehicleVariant = mongoose.model('vehiclevariant', vehicleVariantSchema);

module.exports = VehicleVariant;
