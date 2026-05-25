const mongoose = require('mongoose');
const { toJSON, paginate } = require('../plugins');
const { required } = require('joi');

const sosSchema = mongoose.Schema(
    {
        title: {
            type: String,
            trim: true,
            default: null,
        },
        phoneNumber: {
            type: String,
            trim: true,
            default: null,
        },
        status: {
            type: Boolean,
            default: true,
        },
        deletedAt: {
            type: Date,
            default: null,
        },
        isAdminAdded: {
            type: Boolean,
            default: false
        },
        clientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Client',
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: false,
            required:false
        },
    },
    {
        timestamps: {
            createdAt: 'createdAt',
            updatedAt: 'updatedAt',
        },
    }
);

// Add plugin that converts mongoose to json
sosSchema.plugin(toJSON);
sosSchema.plugin(paginate);

/**
 * @typedef SOS
 */
const SOS = mongoose.model('SOS', sosSchema);

module.exports = SOS;
