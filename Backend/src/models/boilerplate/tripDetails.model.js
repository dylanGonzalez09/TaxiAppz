const mongoose = require('mongoose');
const { toJSON, paginate } = require('../plugins');

const tripDetailsSchema = mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        driverId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Driver',
            required: true,
        },
        requestId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Request',
            required: true,
        },
        beforeArrived: {
            type: Number,
            default: 0, // Time in minutes
        },
        afterArrived: {
            type: Number,
            default: 0, // Time in minutes
        },
        location: [
            {
                lat: { type: Number, required: false },
                lon: { type: Number, required: false },
                timestamp: { type: Date, default: Date.now } // Add timestamp for tracking location updates
            }
        ],
    },
    {
        timestamps: {
            createdAt: 'createdAt',
            updatedAt: 'updatedAt',
        },
    }
);

// Add plugin that converts mongoose to json
tripDetailsSchema.plugin(toJSON);
tripDetailsSchema.plugin(paginate);

/**
 * @typedef TripDetails
 */
const TripDetails = mongoose.model('TripDetails', tripDetailsSchema);

module.exports = TripDetails;
