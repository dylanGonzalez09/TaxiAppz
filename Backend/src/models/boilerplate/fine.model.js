const mongoose = require('mongoose');
const { toJSON, paginate } = require('../plugins');

const fineSchema = mongoose.Schema(
    {
        requestId:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Request',
            default: null,
        },
        userId:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        fineAmount:{
            type: Number,
            default: 0.00,
        },
        description:{
            type: String,
            default: null
        },
        date:{
            type: Date,
            default: null
        },
        clientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Client',
        }
    },
    {
        timestamps: true
    }
);

// Add plugin that converts mongoose to json
fineSchema.plugin(toJSON);
fineSchema.plugin(paginate);

/**
 * @typedef Fine
 */
const Fine = mongoose.model('Fine', fineSchema);

module.exports = Fine;