const mongoose = require('mongoose');
const { toJSON, paginate } = require('../plugins');

const companySubscriptionSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    validityPeriod: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    noOfDrivers: {
      type: Number,
      required: true
    },
    noOfUsers: {
      type: Number,
      required: true
    },
    assignDriverManually: {
      type: Boolean,
      default: true
    },
    type: {
      type: String,
      enum: ['CORPORATE', 'TAXI'],
      required: true
    },
    status: {
      type: Boolean,
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
companySubscriptionSchema.plugin(toJSON);
companySubscriptionSchema.plugin(paginate);

/**
 * @typedef CompanySubScription
 */
const CompanySubScription = mongoose.model('CompanySubScription', companySubscriptionSchema);

module.exports = CompanySubScription;
