const mongoose = require('mongoose');
const { toJSON, paginate } = require('../plugins');

const InvoiceSchema = mongoose.Schema(
    {
        question: {
            type: String,
            required: false,
        },
        role: {
            type: String,
            required: true
        },
        language: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'language',
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
    },
    {
        timestamps: true,
    }
);

// add plugin that converts mongoose to json
InvoiceSchema.plugin(toJSON);
InvoiceSchema.plugin(paginate);

/**
 * @typedef InvoiceQuestion
 */
const InvoiceQuestion = mongoose.model('invoiceQuestion', InvoiceSchema);

module.exports = InvoiceQuestion;
