// validations/wallet.validation.js
const Joi = require('joi');
const { objectId } = require('../../custom.validation');

const createWallet = {
  body: Joi.object().keys({
    amount: Joi.number().default(0),
    amountSpent: Joi.number().default(0),
    balance: Joi.number().default(0),
  }),
};

const getWallets = {
  params: Joi.object().keys({
    walletId: Joi.string().required(),
  }),
  query: Joi.object().keys({
    page: Joi.number().integer().default(1),
    limit: Joi.number().integer().default(10),
  }),
};

const getWallet = {
  params: Joi.object().keys({
    walletId: Joi.string().required(),
  }),
};
const getWalletTransaction = {
  params: Joi.object().keys({
    userId: Joi.string().required(),
  }),
};

const updateWallet = {
  params: Joi.object().keys({
    walletId: Joi.string().required(),
  }),
  body: Joi.object().keys({
    earnedAmount: Joi.number(),
    amountSpent: Joi.number(),
    balanceSpent: Joi.number(),
    clientId: Joi.string().custom(objectId).optional(),
    demoKey: Joi.string(),
  }),
};

const deleteWallet = {
  params: Joi.object().keys({
    walletId: Joi.string().required(),
  }),
};

module.exports = {
  createWallet,
  getWallets,
  getWallet,
  getWalletTransaction,
  updateWallet,
  deleteWallet,
};
