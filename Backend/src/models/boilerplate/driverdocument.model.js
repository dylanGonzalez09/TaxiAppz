const mongoose = require('mongoose');
const { toJSON, paginate } = require('./../plugins');

const driverDocumentSchema = mongoose.Schema(
    {
        driverId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Driver',
            required: true,
        },
        documentImage: {
            type: String,
            default: null,
        },
        expiryDate: {
            type: Date,
            default: null,
        },
        expriyReason: {
            type: String,
            default: null,
        },
        expriyStatus: {
            type: Boolean,
            required: true,
            default: false,
        },
        identifier: {
            type: String,
            default: null,
        },
        issueDate: {
            type: Date,
            default: null,
        },
        documentStatus: {
            type: String,
            enum: ['NOTUPLOADED', 'WAITINGFORAPPROVAL', 'APPROVED', 'EXPIRED', 'DENIED'],
            required: true,
            default: 'NOTUPLOADED',
        },
        documentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Document',
            required: true,
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
    },
    {
        timestamps: true,
    }
);

driverDocumentSchema.plugin(toJSON);
driverDocumentSchema.plugin(paginate);

/**
 * @typedef DriverDocument
 */
const DriverDocument = mongoose.model('driverDocument', driverDocumentSchema);

module.exports = DriverDocument;
