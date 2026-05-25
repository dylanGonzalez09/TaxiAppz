const mongoose = require('mongoose');
const { toJSON, paginate } = require('./../plugins');

const companySchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
    },
    companyName: {
      type: String,
      required: true
    },
    companyCode: {
      type: String,
      required: true
    },
    alternativeNumber: {
      type: String,
    },
    commission: {
      type: String,
      required: true
    },
    noOfVehicle: {
      type: String,
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
    type: {
      type: String,
      enum: ['CORPORATE', 'IOS', 'ANDROID'],  // Added 'ANDROID' here
      default: 'ANDROID',
    }
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
companySchema.plugin(toJSON);
companySchema.plugin(paginate);

/**
 * @typedef Company
 */
const Company = mongoose.model('Company', companySchema);

module.exports = Company;
