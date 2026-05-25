const mongoose = require('mongoose');
const { toJSON, paginate } = require('../plugins');

const faqSchema = mongoose.Schema(
    {
        question: {
            type: String,
            trim: true,
            default: null,
        },
        answer: {
            type: String,
            trim: true,
            default: null,
        },
        category: {
            type: String,
            trim: true,
            default: null,
        },
        status: {
            type: Boolean,
            default: true,
        },
        language: {
            type: mongoose.Schema.Types.ObjectId,
            default: null,
        },
        clientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Client',
        }
    },
    {
        timestamps: {
            createdAt: 'createdAt',
            updatedAt: 'updatedAt',
        },
    }
);

// Add plugin that converts mongoose to json
faqSchema.plugin(toJSON);
faqSchema.plugin(paginate);

/**
 * @typedef Faq
 */
const Faq = mongoose.model('Faq', faqSchema);

module.exports = Faq;
