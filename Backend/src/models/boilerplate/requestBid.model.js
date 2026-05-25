const mongoose = require('mongoose');
const { toJSON, paginate } = require('../plugins');

const requestBidSchema = mongoose.Schema(
    {
        requestId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Request',
            required: true
        },
        driverId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        bidAmount: {
            type: Number,
            default: 0.00
        },
        estAmount: {
            type: Number,
            default: 0.00
        },
        promoAmount:{
            type: Number,
            default: 0.00
        },
        tripType: {
            type: String,
            enum: ['LOCAL', 'RENTAL'],
            default: null
        },
        isMissed:{
            type: Number,
            default: 0
        },
        clientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Client',
        },
    },
    {
        timestamps: true
    }
);

requestBidSchema.plugin(toJSON);
requestBidSchema.plugin(paginate);

/**
 * @typedef RequestBid
 */

const RequestBid = mongoose.model('RequestBid', requestBidSchema);

module.exports = RequestBid;