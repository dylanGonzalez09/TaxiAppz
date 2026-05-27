const httpStatus = require('http-status').default || require('http-status').status || require('http-status');
const mongoose = require('mongoose');
const pick = require('../../../utils/pick');
const ApiError = require('../../../utils/ApiError');
const catchAsync = require('../../../utils/catchAsync');
const { walletService, usersService } = require('../../../services');
const Response = require('../../../config/response');
const { WalletTransaction } = require('../../../models');

const createWallet = catchAsync(async (req, res) => {
  const clientId = req.headers.clientid;

  if (!clientId) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ClientID not found');
  }

  req.body.clientId = clientId;
  const { userId, amount = 0 } = req.body;

  let wallet = await walletService.getWalletByUserId(userId, clientId);

  const walletTransaction = {
    amount,
    purpose: wallet ? 'Wallet update' : 'Initial wallet creation',
    type: 'Earned',
    userId,
    clientId,
  };

  if (wallet) {
    wallet.earnedAmount += amount;
    wallet.balance += amount;

    await walletService.updateWalletById(wallet._id, {
      earnedAmount: wallet.earnedAmount,
      balance: wallet.balance,
    });

    walletTransaction.walletId = wallet._id;
  } else {
    const walletData = {
      earnedAmount: amount,
      balance: amount,
      userId,
      clientId,
    };

    wallet = await walletService.createWallet(walletData);

    if (!wallet || !wallet[0]) {
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Wallet creation failed');
    }

    walletTransaction.walletId = wallet[0]._id;
  }

  await WalletTransaction.create(walletTransaction);

  const response = Response(true, wallet, 'Wallet updated/created successfully');
  res.status(httpStatus.CREATED).send(response);
});

const getWallets = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await walletService.queryWallets(filter, options);
  const response = Response(true, result, 'Success');
  res.status(httpStatus.OK).send(response);
});

const getWallet = catchAsync(async (req, res) => {
  const wallet = await walletService.getWalletById(req.params.walletId);
  if (!wallet) {
    throw new ApiError(httpStatus.NOT_FOUND, 'wallet not found');
  }
  const response = Response(true, wallet, 'Success');
  res.status(httpStatus.OK).send(response);
});
const getWalletTransaction = catchAsync(async (req, res) => {
  const { userId } = req.params;

  // Validate if the userId is a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: 'Invalid userId format' });
  }

  const userObjectId = new mongoose.Types.ObjectId(userId);

  // Fetch transactions and wallet details for the user
  const walletTransactions = await walletService.getWalletTransactionsByUserId(userObjectId);
  const walletDetails = await walletService.getWalletByUserId(userObjectId);

  // Check if transactions exist
  if (!walletTransactions || walletTransactions.length === 0) {
    return res.status(200).json({ message: 'No transactions found for this user', transactions: [] });
  }

  // Format and sort transactions (latest first)
  const formattedTransactions = walletTransactions
    .map((transaction) => ({
      amount: transaction.amount,
      purpose: transaction.purpose,
      type: transaction.type,
      id: transaction.id,
      createdAt: transaction.createdAt,
    }))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); // Sorting in descending order

  const formattedDetails = {
    earnedAmount: walletDetails.earnedAmount,
    amountSpent: walletDetails.amountSpent,
    balance: walletDetails.balance,
  };

  const response = Response(
    true,
    {
      transactions: formattedTransactions,
      walletDetails: formattedDetails,
    },
    'Success',
  );

  // Send the response
  res.status(httpStatus.OK).send(response);
});

const getWalletWithOutPagination = catchAsync(async (req, res) => {
  const wallet = await walletService.getWallets();
  if (!wallet) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Wallet not found');
  }
  const response = Response(true, wallet, 'Success');
  res.status(httpStatus.OK).send(response);
});

const updateWallet = catchAsync(async (req, res) => {
  const wallet = await walletService.updateWalletById(req.params.walletId, req.body);
  const response = Response(true, wallet, 'Success');
  res.status(httpStatus.OK).send(response);
});

const deleteWallet = catchAsync(async (req, res) => {
  const wallet = await walletService.deleteWalletById(req.params.walletId);
  const response = Response(true, wallet, 'Success');
  res.status(httpStatus.OK).send(response);
});

module.exports = {
  createWallet,
  getWallets,
  getWallet,
  getWalletWithOutPagination,
  updateWallet,
  getWalletTransaction,
  deleteWallet,
};
