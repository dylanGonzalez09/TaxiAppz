const mongoose = require('mongoose');
const { toJSON, paginate } = require('./../plugins');

const vehicleModelSchema = mongoose.Schema(
    {
        modelname: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: false
        },
        image: {
            type: String,
            required: true
        },
        vehicleId:{
            type: mongoose.SchemaTypes.ObjectId,
            ref: 'Vehicle',
            required: true,
        },
        status: {
            type: Boolean,
            required: true
        },
        clientId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Client',
        },
        companyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref:'Company',
            default: null,
        }
    },
    {
        timestamps: true,
    }
);

// add plugin that converts mongoose to json
vehicleModelSchema.plugin(toJSON);
vehicleModelSchema.plugin(paginate);

/**
 * @typedef VehicleModel
 */
const VehicleModel = mongoose.model('VehicleModel', vehicleModelSchema);

module.exports = VehicleModel;
