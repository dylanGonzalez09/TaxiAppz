const mongoose = require('mongoose');
const { toJSON, paginate } = require('./../plugins');
const e = require('express');

const paymentHistorySchema = mongoose.Schema(
    {
        requestId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Request',
            required: false,
        },
        paymentType: {
            type: String,
            enum: ['WALLET_RECHARGE', 'TRIP_RECHARGE', 'SUBSCRIPTION_RECHARGE'],
            required: true
        },
        amount: {
            type: Number,
            required: true,
            trim: true,
        },
        paymentIntentId: {
            type: String,
            required: true,
            trim: true,
        },
        status: {
            type: String,
            enum: ['cancelled', 'completed', 'failed'],
            required: true,
            default: 'cancelled',
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

paymentHistorySchema.plugin(toJSON);
paymentHistorySchema.plugin(paginate);

/**
 * @typedef PaymentHistory
 */
const PaymentHistory = mongoose.model('PaymentHistory', paymentHistorySchema);

module.exports = PaymentHistory;
