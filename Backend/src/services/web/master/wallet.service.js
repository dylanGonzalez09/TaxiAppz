const httpStatus = require('http-status');
const ApiError = require('../../../utils/ApiError');
const { Wallet, WalletTransaction } = require('../../../models');

/**
 * Create a wallet
 * @param {Object} walletBody
 * @returns {Promise<Wallet>}
 */
const createWallet = async (walletBody, options = {}) => {
  return Wallet.create([walletBody], options);
};


/**
 * Query for wallets
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryWallets = async (filter, options) => {
  const wallets = await Wallet.paginate(filter, options);
  return wallets;
};


/**
 * Get wallets
 * @returns {Promise<Wallet>}
 */
const getWallets = async () => {
  return Wallet.find();
};


/**
 * Get wallet by id
 * @param {ObjectId} id
 * @returns {Promise<Wallet>}
 */
const getWalletById = async (id) => {
  return Wallet.findById(id);
};

/**
 * Get wallet by user id
 * @param {ObjectId} userId
 * @param {Object} options - Query options (optional)
 * @returns {Promise<Wallet>}
 */
const getWalletByUserId = async (userId) => {
  if (!userId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'User ID is required');
  }

  const wallet = await Wallet.findOne({ userId });

  if (!wallet) {
    return null; // Explicitly return null if no wallet is found
  }

  return wallet;
};


/**
 * Update wallet by id
 * @param {ObjectId} walletId
 * @param {Object} updateBody
 * @returns {Promise<Wallet>}
 */
const updateWalletById = async (walletId, updateBody) => {
  const wallet = await getWalletById(walletId);

  if (!wallet) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Wallet not found');
  }

  // Use Object.assign to update wallet properties
  Object.assign(wallet, updateBody);

  // Save the updated wallet
  await wallet.save();

  return wallet;
};

/**
 * Delete wallet by id
 * @param {ObjectId} walletId
 * @returns {Object}
 */
const deleteWalletById = async (walletId) => {
  const wallet = await getWalletById(walletId);
  if (!wallet) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Wallet not found');
  }
  await wallet.deleteOne();
  return { status: "success", msg: "data Deleted Successfully" };
};



const getWalletTransactionsByUserId = async (userId) => {
  if (!userId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'User ID is required');
  }

  // Find transactions by userId
  const walletTransactions = await WalletTransaction.find({ userId });

  // Return an empty array if no transactions found
  if (!walletTransactions || walletTransactions.length === 0) {
    return [];
  }

  return walletTransactions;
};
 
module.exports = {
  createWallet,
  queryWallets,
  getWalletById,
  getWallets,
  getWalletTransactionsByUserId,
  getWalletByUserId,
  updateWalletById,
  deleteWalletById,
 
};
