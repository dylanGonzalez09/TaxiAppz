const httpStatus = require('http-status');
const ApiError = require('../../../utils/ApiError');
const { Wallet, WalletTransaction, Country } = require('../../../models');
const { tokenService } = require('../../../services');
const ObjectId = require('mongoose').Types.ObjectId


/**
  from the mobile side they need to send Client Id and Code (Version code)
  1. Check the Version Available or not if not redirect to update screen 
  2. check the avaliable languages for client send the avaliable languages 
 */
const getClientId = async (req) => {
  clientId = '';
  if (!req.headers.clientid) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ClientID not found');
  } else {
    clientId = req.headers.clientid;
  }
  return clientId;
}



const getUserId = async (req) => {

  let userId = '';

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(httpStatus.UNAUTHORIZED).send({ message: 'Authorization header is missing or invalid' });
    return;
  }
  // Remove the 'Bearer ' prefix and get the token
  const token = authHeader.substring(7);

  const user = await tokenService.verifyTokenAndGetUser(token);

  userId = user.id

  return userId;
}




/**
* Create a role
* @param {Object} WalletBody
* @returns {Promise<Wallet>}
*/
const createWallet = async (WalletBody) => {
  return Wallet.create(WalletBody);
};



/**
 * Query for wallets
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {Object} req
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryWalletTransaction = async (req, filter, options) => {
  // Get the clientId from request
  const wallet = await getWalletDetails(req);
  let countryDetails = await Country.findById(wallet.country);
  let currencySymbol;
  if (countryDetails?.currency_symbol) {
    currencySymbol = countryDetails.currency_symbol ? countryDetails.currency_symbol : "";
  }
  filter.walletId = req.params.walletId;
  const walletTransaction = await WalletTransaction.paginate(filter, options);
  return { walletTransaction, currencySymbol };
};

/**
 * Create a wallet
 * @param {Object} walletBody
 * @returns {Promise<Wallet>}
 */
const createWallets = async (req) => {
  let clientId = await getClientId(req);
  let userId = await getUserId(req);

  const { amount } = req.body;

  let wallet = await getWalletByUserId(userId, clientId);

  const walletTransaction = {
    amount: amount.toString(), // Ensure amount is a string
    purpose: wallet ? 'Wallet update' : 'Initial wallet creation',
    type: amount < 0 ? 'Spent' : 'Earned',
    userId: userId.toString(), // Ensure userId is a string
    clientId: clientId.toString(), // Ensure clientId is a string
  };

  if (wallet) {
    wallet.earnedAmount = (wallet.earnedAmount + amount).toString(); // Ensure earnedAmount is a string
    wallet.balance = (wallet.balance + amount).toString(); // Ensure balance is a string

    wallet = await updateWalletById(wallet._id, {
      earnedAmount: wallet.earnedAmount,
      balance: wallet.balance,
    });

    walletTransaction.walletId = wallet._id.toString(); // Ensure walletId is a string
  } else {
    const walletData = {
      earnedAmount: amount.toString(), // Ensure earnedAmount is a string
      balance: amount.toString(), // Ensure balance is a string
      userId: userId.toString(), // Ensure userId is a string
      clientId: clientId.toString(), // Ensure clientId is a string
    };

    wallet = await createWallet(walletData);

    if (!wallet) {
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Wallet creation failed');
    }

    walletTransaction.walletId = wallet._id.toString(); // Ensure walletId is a string
  }

  await WalletTransaction.create(walletTransaction);

  // Return the wallet, ensuring all values are strings
  return {
    earnedAmount: wallet.earnedAmount ? wallet.earnedAmount.toString() : "0", // Default to "0" if null
    balance: wallet.balance ? wallet.balance.toString() : "0", // Default to "0" if null
    amountSpent: wallet.amountSpent ? wallet.amountSpent.toString() : "0", // Ensure amountSpent is a string
    userId: wallet.userId.toString(), // Ensure userId is a string
    id: wallet._id.toString(), // Ensure id is a string
  };
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

/**
 * Get wallet by id
 * @param {ObjectId} id
 * @returns {Promise<Wallet>}
 */
const getWalletById = async (id) => {
  return Wallet.findById(id);
};

const getWalletDetails = async (req) => {
  let clientId = await getClientId(req);
  let userId = await getUserId(req);


  let walletDetails = await Wallet.aggregate([
    {
      $match: {
        userId: new ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'userDetails',
      },
    },
    {
      $unwind: {
        path: '$userDetails',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'countries',
        let: { countryId: '$userDetails.country' },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: [
                  '$_id',
                  { $toObjectId: '$$countryId' } // Convert string to ObjectId
                ]
              }
            }
          }
        ],
        as: 'countriesDetails'
      }
    },
    {
      $unwind: {
        path: '$countriesDetails',
        preserveNullAndEmptyArrays: true,
      }
    },
    {
      $project: {
        _id: 1,
        earnedAmount: {
          $toString: {
            $cond: [
              {
                $or: [
                  { $eq: ["$earnedAmount", Infinity] },
                  { $eq: ["$earnedAmount", -Infinity] },
                  { $eq: ["$earnedAmount", null] },
                  { $not: { $ifNull: ["$earnedAmount", false] } } // Handles missing field
                ]
              },
              0, // Replace Infinity/null with 0
              "$earnedAmount" // Keep original value if valid
            ]
          }
        },
        amountSpent: {
          $toString: {
            $cond: [
              {
                $or: [
                  { $eq: ["$amountSpent", Infinity] },
                  { $eq: ["$amountSpent", -Infinity] },
                  { $eq: ["$amountSpent", null] },
                  { $not: { $ifNull: ["$amountSpent", false] } }
                ]
              },
              0,
              "$amountSpent"
            ]
          }
        },
        balance: {
          $toString: {
            $cond: [
              {
                $or: [
                  { $eq: ["$balance", Infinity] },
                  { $eq: ["$balance", -Infinity] },
                  { $eq: ["$balance", null] },
                  { $not: { $ifNull: ["$balance", false] } }
                ]
              },
              0,
              "$balance"
            ]
          }
        },
        country: '$userDetails.countryCode',
        countryCode: '$countriesDetails.dial_code',
        currencySymbol: '$countriesDetails.currency_symbol',
      },
    },
  ]);


  // 66d5848ce928e7a8d374d85b
  if (walletDetails != null && Array.isArray(walletDetails)) {
    walletDetails = walletDetails[0];
  }

  let countryDetails = await Country.findById(walletDetails?.country);


  if (countryDetails?.currencySymbol) {
    walletDetails.currency = countryDetails?.currencySymbol ? countryDetails?.currencySymbol : "";
  }



  return walletDetails;
};



module.exports = {
  createWallets,
  getWalletDetails,
  updateWalletById,
  deleteWalletById,
  queryWalletTransaction
};
