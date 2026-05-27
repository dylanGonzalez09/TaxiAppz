const mongoose = require('mongoose');
const { toJSON, paginate } = require('../plugins');

const walletTransactionSchema = mongoose.Schema(
  {
    amount: {
      type: Number,
      default: 0,
    },
    purpose: {
      type: String,
      default: null,
    },
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Request',
      required: false,
    },
    type: {
      type: String,
      enum: ['Earned', 'Spent'],
      required: true,
    },
    walletId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Wallet',
      required: true,
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
walletTransactionSchema.plugin(toJSON);
walletTransactionSchema.plugin(paginate);

walletTransactionSchema.index({ userId: 1, createdAt: -1 }, { background: true });
walletTransactionSchema.index({ requestId: 1 }, { background: true });

/**
 * @typedef WalletTransaction
 */
const WalletTransaction = mongoose.model('walletTransaction', walletTransactionSchema);

module.exports = WalletTransaction;
