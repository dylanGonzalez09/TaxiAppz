const mongoose = require('mongoose');
const { toJSON, paginate } = require('./../plugins');

const rentalSchema = mongoose.Schema(
    {
    
        km: {
            type: Number,
            required: true
        },
        hour: {
            type: Number,
            required: true
        },
        countryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Country',
        },
        zoneId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Zone',
        },
        vehiclePrices: [
            {
                vehicleId: { type: String, required: true, ref: 'Vehicle' }, // or ObjectId if referencing another collection
                price: { type: Number, required: true }, // Price of the vehicle
                graceTime: {  type: Number, required: true},
                extraKmPrice: { type: Number, required: true }
            },
        ],
        status: {
            type: Boolean,
            required: true,
            default:true
        },
        clientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Client',
        },

    },
    {
        timestamps: true,
    }
);

// add plugin that converts mongoose to json
rentalSchema.plugin(toJSON);
rentalSchema.plugin(paginate);

/**
 * @typedef Rental
 */
const Rental = mongoose.model('rental', rentalSchema);

module.exports = Rental;
