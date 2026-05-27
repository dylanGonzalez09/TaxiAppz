const httpStatus = require('http-status').default || require('http-status').status || require('http-status');
const { format } = require('date-fns');
const pick = require('../../../utils/pick');
const ApiError = require('../../../utils/ApiError');
const catchAsync = require('../../../utils/catchAsync');
const { mobilewalletService } = require('../../../services');
const Response = require('../../../config/response');
const { WalletTransaction } = require('../../../models');

const createWallet = catchAsync(async (req, res) => {
  const wallet = await mobilewalletService.createWallets(req);
  const response = Response(true, wallet, 'Wallet created successfully');
  res.status(httpStatus.CREATED).send(response);
});

const getWallets = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['type', 'purpose']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const transactions = await mobilewalletService.queryWalletTransaction(req, filter, options);

  const data = {
    walletTransaction: transactions.walletTransaction.results.map((transaction) => {
      const date = transaction.createdAt instanceof Date ? transaction.createdAt : new Date(transaction.createdAt);

      return {
        ...transaction.toJSON(),
        // createdAt:transaction.createdAt,
        createdAt: date.toLocaleString('en-GB', {
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        }),
        currencySymbol: transactions.currencySymbol,
      };
    }),
    page: transactions.walletTransaction.page,
    limit: transactions.walletTransaction.limit,
    totalPages: transactions.walletTransaction.totalPages,
    totalResults: transactions.walletTransaction.totalResults,
  };

  const response = Response(true, data, 'Wallet transactions fetched successfully');
  res.status(httpStatus.OK).send(response);
});

const getWalletDetails = catchAsync(async (req, res) => {
  const { driverId } = req.params;

  const walletTransactions = await mobilewalletService.getWalletDetails(req, driverId);

  const response = Response(true, walletTransactions, 'Wallet details fetched successfully');
  res.status(httpStatus.OK).send(response);
});

module.exports = {
  createWallet,
  getWallets,
  getWalletDetails,
};
