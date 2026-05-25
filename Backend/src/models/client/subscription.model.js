const mongoose = require('mongoose');
const { toJSON, paginate } = require('../plugins');

const subscriptionSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    validityPeriod: {
      type: String,
      required: true
    },
    unit: {
      type: String,
      enum: ['DAY', 'WEEK','MONTH','YEAR'],
      default: 'DAY',
    },
    description: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    status: {
      type: Boolean,
      required: true,
      default: true
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
subscriptionSchema.plugin(toJSON);
subscriptionSchema.plugin(paginate);

/**
 * @typedef SubScription
 */
const SubScription = mongoose.model('SubScription', subscriptionSchema);

module.exports = SubScription;
