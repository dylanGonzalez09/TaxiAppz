const mongoose = require('mongoose');
const { toJSON, paginate } = require('../plugins');

const otpSchema = mongoose.Schema(
  {
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    otp: {
      type: String,
      trim: true,
      default: 1,
    }
  },
  {
    timestamps: true,
  }
);

otpSchema.plugin(toJSON);
otpSchema.plugin(paginate);

/**
 * @typedef MobileOtp
 */
const MobileOtp = mongoose.model('Otp', otpSchema);

module.exports = MobileOtp;
