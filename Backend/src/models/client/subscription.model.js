const mongoose = require('mongoose');
const { toJSON, paginate } = require('../plugins');

const subscriptionSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    validityPeriod: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    /** Package price shown as "Amount" in the admin UI */
    amount: {
      type: Number,
    },
    /** Validity unit: DAY | WEEK | MONTH | YEAR (admin UI) */
    unit: {
      type: String,
      enum: ['DAY', 'WEEK', 'MONTH', 'YEAR'],
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
    },
  },
  {
    timestamps: true,
  },
);

subscriptionSchema.index({ zoneId: 1, clientId: 1 }, { background: true });

// add plugin that converts mongoose to json
subscriptionSchema.plugin(toJSON);
subscriptionSchema.plugin(paginate);

/**
 * @typedef SubScription
 */
const SubScription = mongoose.model('SubScription', subscriptionSchema);

module.exports = SubScription;
