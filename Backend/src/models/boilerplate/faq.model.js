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
    },
    zoneId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Zone',
    },
    /** Who should see this FAQ: passenger app, driver app, or both (legacy docs without this field behave like Both). */
    userType: {
      type: String,
      enum: ['User', 'Driver', 'Both'],
      default: 'Both',
    },
  },
  {
    timestamps: {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    },
  },
);

// Add plugin that converts mongoose to json
faqSchema.plugin(toJSON);
faqSchema.plugin(paginate);

/**
 * @typedef Faq
 */
const Faq = mongoose.model('Faq', faqSchema);

module.exports = Faq;
