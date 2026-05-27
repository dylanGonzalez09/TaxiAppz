const mongoose = require('mongoose');
const { toJSON, paginate } = require('../plugins');

const walletSchema = mongoose.Schema(
  {
    earnedAmount: {
      type: Number,
      default: 0,
    },
    amountSpent: {
      type: Number,
      default: 0,
    },
    balance: {
      type: Number,
      default: 0,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
    },
  },
  {
    timestamps: true,
  },
);

// Add plugin that converts mongoose to json
walletSchema.plugin(toJSON);
walletSchema.plugin(paginate);

// Index for findOne by userId (walletTransaction, payouts)
walletSchema.index({ userId: 1 }, { background: true });

/**
 * @typedef Wallet
 */
const Wallet = mongoose.model('Wallet', walletSchema);

module.exports = Wallet;
