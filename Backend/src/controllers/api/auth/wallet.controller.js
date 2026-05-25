const httpStatus = require('http-status');
const pick = require('../../../utils/pick');
const ApiError = require('../../../utils/ApiError');
const catchAsync = require('../../../utils/catchAsync');
const { mobilewalletService } = require('../../../services');
const Response = require('../../../config/response');
const { WalletTransaction } = require('../../../models');
const { format } = require('date-fns');

const createWallet = catchAsync(async (req, res) => {
    const wallet = await mobilewalletService.createWallets(req);
    const response = Response(true, wallet, "Success");
    res.status(httpStatus.CREATED).send(response);
});

const getWallets = catchAsync(async (req, res) => {
    const filter = pick(req.query, ['type', 'purpose']);
    const options = pick(req.query, ['sortBy', 'limit', 'page']);
    const transactions = await mobilewalletService.queryWalletTransaction(req, filter, options);

    const data = {
        walletTransaction: transactions.walletTransaction.results.map((transaction) => {
            const date = transaction.createdAt instanceof Date 
                ? transaction.createdAt 
                : new Date(transaction.createdAt);
            
            return {
                ...transaction.toJSON(),
                createdAt: date.toLocaleString('en-GB', {
                    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: true
                }),
                currencySymbol: transactions.currencySymbol
            };
        }),
        page: transactions.walletTransaction.page,
        limit: transactions.walletTransaction.limit,
        totalPages: transactions.walletTransaction.totalPages,
        totalResults: transactions.walletTransaction.totalResults
    };

    const response = Response(true, data, "Success");
    res.status(httpStatus.OK).send(response);
});

const getWalletDetails = catchAsync(async (req, res) => {
    let walletTransactions = await mobilewalletService.getWalletDetails(req);

    const response = Response(true, walletTransactions, "Success");
    // Send the response with HTTP 200 status
    res.status(httpStatus.OK).send(response);
});





module.exports = {
    createWallet,
    getWallets,
    getWalletDetails,
};
