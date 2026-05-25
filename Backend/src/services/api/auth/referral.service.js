const httpStatus = require('http-status');
const ApiError = require('../../../utils/ApiError');
const { Referral,ReferralAmount,Settings,User,WalletTransaction,Wallet } = require('../../../models');
const { tokenService } = require('../../../services');
const mongoose = require('mongoose');


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


const getUser = async (req) => {

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(httpStatus.UNAUTHORIZED).send({ message: 'Authorization header is missing or invalid' });
        return;
    }
    // Remove the 'Bearer ' prefix and get the token
    const token = authHeader.substring(7);

    const user = await tokenService.verifyTokenAndGetUser(token);

    return user;
}


const getReferralDriver  = async (req,res) => {
    // let clientId = await getClientId(req);
    let userData = await getUser(req);
    try {
        
        if (!userData.active) {
            return res
                .status(403)
                .json({ message: 'User is blocked, please contact admin' });
        }

        const userCountry = await User.findById(userData._id).populate('countryCode');
  
        const referral = await Referral.find({ referredBy: userData._id });
        const driverReferralAmount = await ReferralAmount.aggregate([
            { $match: { referalUserId : userData._id } },
            { $group: { _id: null, totalAmount: { $sum: '$amount' } } },
        ]);
    
        const driverDriverReferralAmount = await Settings.findOne({ name: 'driverDriverReferralAmount' });
        const driverUserReferralAmount = await Settings.findOne({ name: 'driverUserReferralAmount' });
    
        return {
            referral,
            referralCode: userData.referralCode,
            referByDriverAmount: driverDriverReferralAmount ? parseInt(driverDriverReferralAmount.value) : 0,
            referByUserAmount: driverUserReferralAmount ? parseInt(driverUserReferralAmount.value) : 0,
            referralAmount: driverReferralAmount.length ? driverReferralAmount[0].totalAmount : 0,
            currencySymbol: userCountry.countryCode?.currency_symbol || '',
        };
    } catch (error) {
        return res.status(400).json({ message: 'Catch error', error: error.message });
    }
  };

  
const getReferralDriverCode  = async (req,res) => {
  let userData = await getUser(req);
  try {
      
      if (!userData.active) {
          return res
              .status(403)
              .json({ message: 'User is blocked, please contact admin' });
      }
   
      return {
          referralCode: userData.referralCode
      };
  } catch (error) {
    
      return res.status(400).json({ message: 'Catch error', error: error.message });
  }
};

const createReferral = async (req) => {
    req.body.clientId = await getClientId(req);
    return Referral.create(req.body);
};
const createReferralAmount = async (req) => {
  req.body.clientId = await getClientId(req);
  return ReferralAmount.create(req.body);
};
const updateReferralById = async (referralId, updateBody) => {
  
  const referral = await Referral.getReferralById(referralId);
  if (!referral) {
    throw new ApiError(httpStatus.NOT_FOUND, 'referral not found');
  }
  Object.assign(referral, updateBody);
  await Referral.save();
  return Referral;
};

const updateReferralAmountById = async (referralAmountId, updateBody) => {
  
  const referral = await Referral.getReferralAmountById(referralAmountId);
  if (!referral) {
    throw new ApiError(httpStatus.NOT_FOUND, 'referral not found');
  }
  Object.assign(referral, updateBody);
  await ReferralAmount.save();
  return ReferralAmount;
};
const getReferralData = async (userId) => {
  try {
    // Check if the provided userId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error('Invalid userId format');
    }

    // Convert userId to ObjectId to ensure proper matching
    const objectId = new mongoose.Types.ObjectId(userId);

    const referralData = await Referral.aggregate([
      // Match referrals where the referredBy matches the given userId
      { $match: { referredBy: objectId } },

      {
        $group: {
          _id: '$referredBy',
          referralCount: { $sum: 1 },  // Count the total number of referrals
          referrals: { $push: '$$ROOT' },  // Store the entire referral document
        },
      },

      { $unwind: '$referrals' },  // Flatten the referrals array

      // Lookup referral amounts from 'referralamounts' collection
      {
        $lookup: {
          from: 'referralamounts',
          localField: 'referrals._id',  // Match with the referral _id
          foreignField: 'referalUserId',  // Match with the referalUserId in ReferralAmount
          as: 'referralAmounts',
        },
      },

      // Lookup referred user details from 'users' collection
      {
        $lookup: {
          from: 'users',
          localField: 'referrals.referredTo',
          foreignField: '_id',
          as: 'referredUser',
        },
      },
      { $unwind: { path: '$referredUser', preserveNullAndEmptyArrays: true } },
      { $match: { 'referredUser._id': { $ne: null } } },

      // Lookup referrer details from 'users' collection
      {
        $lookup: {
          from: 'users',
          localField: 'referrals.referredBy',
          foreignField: '_id',
          as: 'referrerDetails',
        },
      },
      { $unwind: { path: '$referrerDetails', preserveNullAndEmptyArrays: true } },

      // Add full names for users and handle missing fields with $ifNull
      {
        $addFields: {
          referrerFullName: {
            $concat: [{ $ifNull: ['$referrerDetails.firstName', ''] }, ' ', { $ifNull: ['$referrerDetails.lastName', ''] }]
          },
          referredUserFullName: {
            $concat: [{ $ifNull: ['$referredUser.firstName', ''] }, ' ', { $ifNull: ['$referredUser.lastName', ''] }]
          },
          referralAmount: {
            $ifNull: [{ $arrayElemAt: ['$referralAmounts.amount', 0] }, 0],
          },
        },
      },

      {
        $project: {
          _id: 0,
          referralCount: 1,
          userId: '$_id',
          userName: '$referrerFullName',
          referredUserId: '$referrals.referredTo',
          referredUserName: '$referredUserFullName',
          email: '$referredUser.email',
          phoneNumber: '$referredUser.phoneNumber',
          amount: '$referralAmount',
        },
      },
    ]);

    // Return results or default structure if no data is found
    return referralData.length ? referralData : { userId, referralCount: 0, referredUsers: [] };
  } catch (error) {
    throw new Error(`Error fetching referral data: ${error.message}`);
  }
};

const getStatsData = async (userId) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid userId format");
    }

    const objectId = new mongoose.Types.ObjectId(userId);
    const referrerDetails = await User.aggregate([
      { $match: { _id: objectId } },

      // Lookup referral amounts
      {
        $lookup: {
          from: "referralamounts",
          localField: "_id",
          foreignField: "referalUserId",
          as: "referralAmounts",
        },
      },

      // Lookup referred users
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "referredBy",
          as: "referredUsers",
        },
      },

      // Lookup roles for each referred user
      {
        $lookup: {
          from: "roles",
          localField: "referredUsers.roleIds", // Matches the roleIds in users
          foreignField: "_id", // Matches the _id in roles collection
          as: "referredRoles",
        },
      },

      // Process counts for users and drivers separately
      {
        $addFields: {
          totalAmount: { $ifNull: [{ $sum: "$referralAmounts.amount" }, 0] },

          // Count only users
          totalUserCount: {
            $size: {
              $filter: {
                input: "$referredUsers",
                as: "user",
                cond: {
                  $in: [
                    "User",
                    {
                      $map: {
                        input: "$referredRoles",
                        as: "role",
                        in: "$$role.name", // Extract role names
                      },
                    },
                  ],
                },
              },
            },
          },

          // Count only drivers
          totalDriverCount: {
            $size: {
              $filter: {
                input: "$referredUsers",
                as: "user",
                cond: {
                  $in: [
                    "Driver",
                    {
                      $map: {
                        input: "$referredRoles",
                        as: "role",
                        in: "$$role.name",
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },

      // Project the required fields
      {
        $project: {
          _id: 0,
          referralCode: 1,
          totalAmount: 1,
          totalUserCount: 1,
          totalDriverCount: 1,
        },
      },
    ]);

    if (!referrerDetails.length) {
      throw new Error("Referrer details not found");
    }

    const referrer = referrerDetails[0];

    return {
      referralCode: referrer.referralCode,
      totalAmount: referrer.totalAmount,
      totalUserCount: referrer.totalUserCount,
      totalDriverCount: referrer.totalDriverCount,
    };
  } catch (error) {
    throw new Error(`Error fetching referral data: ${error.message}`);
  }
};


const createReferralToWallet = async (req) => {
  let userData = await getUser(req);
  try {

    if (!userData.active) {
      return res
        .status(403)
        .json({ message: 'User is blocked, please contact admin' });
    }

    const driverReferralAmount = await ReferralAmount.aggregate([
      { $match: { referalUserId: userData._id } },
      { $group: { _id: null, totalAmount: { $sum: '$amount' } } },
    ]);

    let referralAmountTotal = driverReferralAmount.length ? driverReferralAmount[0].totalAmount : 0;

    let referalNegativeValue = -1 * referralAmountTotal;
    const referralAmount = new ReferralAmount({
      referalUserId: userData._id,
      amount:referalNegativeValue
    });

    await walletTransaction(referralAmountTotal, userData._id, 'Earned', 'Claim Amount', "Referral");

    await referralAmount.save();

    return;
  } catch (error) {
    console.error('Error updating driver online status:', error);

    return res.status(400).json({ message: 'Catch error', error: error.message });
  }
};


const walletTransaction = async (amount, userId, type, purpose, requestId) => {
    let wallet;
    if (type == 'Spent') {
        wallet = await Wallet.findOne({ userId: userId });

        if (wallet) {
            wallet.amountSpent = amount ? amount : 0;
            wallet.balance -= amount ? amount : 0;
            wallet.save();
        }
        else {
            const walletParams = {
                userId: userId,
                earnedAmount: 0,
                amountSpent: amount ? amount : 0,
                balance: amount ? amount : 0,
            };

            wallet = await Wallet.create(walletParams);
        }

        await WalletTransaction.create({
            walletId: wallet.id,
            amount: amount ? 0 - amount : 0,
            purpose: purpose,
            type: type,
            userId: userId
        });
    }
    else if (type == 'Earned') {
        wallet = await Wallet.findOne({ userId: userId });

        if (wallet) {
            wallet.earnedAmount += amount ? amount : 0;
            wallet.balance += amount ? amount : 0;
            wallet.save();
        }
        else {
            const walletParams = {
                userId: userId,
                earnedAmount: amount ? amount : 0,
                amountSpent: 0,
                balance: amount ? amount : 0,
            };

            wallet = await Wallet.create(walletParams);
        }

        await WalletTransaction.create({
            walletId: wallet.id,
            amount: amount ? amount : 0,
            purpose: purpose,
            type: type,
            userId: userId
        });
    }
};

module.exports = {
    getReferralDriver,
    getReferralDriverCode,
    createReferral,
    createReferralAmount,
    updateReferralById,
    updateReferralAmountById,
    getReferralData,
    getStatsData,
    createReferralToWallet
};
