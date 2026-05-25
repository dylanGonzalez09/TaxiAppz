const mongoose = require('mongoose');
const { toJSON, paginate } = require('../plugins');

const CancellationReasonSchema = mongoose.Schema(
    {
        reason: {
            type: String,
            required: true
        },
        userType: {
            type: String,
            enum: [ 'User', 'Driver', 'Both'],
            required: true,
        },
        tripStatus: {
            type: String,
            enum: ['After Arrived', 'Before Accept', 'Before Arrive'],
            required: true,
        },
        payStatus: {
            type: String,
            enum: ['Free', 'Pay'],
            required: true,
        },
        amount: {
            type: String,
            required: false
        },
          language: {
            type: mongoose.Schema.Types.ObjectId,
            default: null,
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
            required: true,
          },
        companyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref:'Company',
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

// add plugin that converts mongoose to json
CancellationReasonSchema.plugin(toJSON);
CancellationReasonSchema.plugin(paginate);

/**
 * @typedef CancellationReason
 */
const CancellationReason = mongoose.model('cancellationReason', CancellationReasonSchema);

module.exports = CancellationReason;
