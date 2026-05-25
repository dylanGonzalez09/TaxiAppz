const mongoose = require('mongoose');
const { toJSON, paginate } = require('../plugins');

const ReferralAmountSchema = mongoose.Schema(
  {
    referalUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    amount: {
     type: Number,
     required: true,
    }
  },
  {
    timestamps: true,
  }
);

ReferralAmountSchema.plugin(toJSON);
ReferralAmountSchema.plugin(paginate);

/**
 * @typedef ReferralAmount
 */
const ReferralAmount = mongoose.model('ReferralAmount', ReferralAmountSchema);

module.exports = ReferralAmount;
