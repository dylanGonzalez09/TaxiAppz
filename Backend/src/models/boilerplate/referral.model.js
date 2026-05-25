const mongoose = require('mongoose');
const { toJSON, paginate } = require('../plugins');

const ReferralSchema = mongoose.Schema(
  {
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    referredTo: {
     type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    }
  },
  {
    timestamps:
    
    true,
  }
);

ReferralSchema.plugin(toJSON);
ReferralSchema.plugin(paginate);

/**
 * @typedef Referral
 */
const Referral = mongoose.model('Referral', ReferralSchema);

module.exports = Referral;
