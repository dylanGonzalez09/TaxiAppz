const mongoose = require('mongoose');
const { toJSON, paginate } = require('../plugins');

const walletSchema = mongoose.Schema(
  {
    earnedAmount: {
      type: Number,
      default: 0,
      set: val => Math.round(val * 100) / 100
    },
    amountSpent: {
      type: Number,
      default: 0,
      set: val => Math.round(val * 100) / 100
    },
    balance: {
      type: Number,
      default: 0,
      set: val => Math.round(val * 100) / 100
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref:'User',
      required: true,
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

// Add plugin that converts mongoose to json
walletSchema.plugin(toJSON);
walletSchema.plugin(paginate);

/**
 * @typedef Wallet
 */
const Wallet = mongoose.model('Wallet', walletSchema);

module.exports = Wallet;
