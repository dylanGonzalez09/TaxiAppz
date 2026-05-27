const httpStatus = require('http-status').default || require('http-status').status || require('http-status');
const ApiError = require('../../../utils/ApiError');
const catchAsync = require('../../../utils/catchAsync');
const { mobileauthService, tokenService, userService, requestService } = require('../../../services');
const mongoose = require('mongoose');
const { Country, Users, Role, User, Referral, Wallet, WalletTransaction, Demo } = require('../../../models');
const { userUpload } = require('../../../middlewares/upload');
const Response = require('../../../config/response');
const { errorMessages, keyMessages } = require('../../../config/errorMessages');
const ObjectId = require('mongoose').Types.ObjectId
const { sendPushNotificationToken } = require('../../../utils/commonFunction');

const {getUserId,getClientId,getDriverId} = require('../../../utils/commonFunction')
const dotenv = require('dotenv');
dotenv.config({ quiet: true });
// Load environment variables

/**
  from the mobile side they need to send Client Id and Code (Version code)
  1. Check the Version Available or not if not redirect to update screen 
  2. check the avaliable languages for client send the avaliable languages 
 */




// User


const userOtpSent = catchAsync(async (req, res) => {

  const { authenticationType } = req.body;

  let user = '';

  let tokens = '';

  if (authenticationType == "OTP") {

    const { phoneNumber, countryCode } = req.body;

    let otp = await mobileauthService.loginUserWithMobileNo(phoneNumber, countryCode);

    res.send({ otp });

  } else {

    const { email, password } = req.body;

    user = await mobileauthService.loginUserWithEmailAndPassword(email, password);

    tokens = await tokenService.generateAuthTokens(user);

    res.send({ user, tokens });

  }

});



const userVerify = catchAsync(async (req, res) => {
  const { deviceInfoHash, isPrimary, deviceType, countryCode, demoKey, phoneNumber, otp } = req.body;
  let user;
  if (demoKey) {
    user = await mobileauthService.mobileOtpVerify(phoneNumber, countryCode, otp);
  } else {
    user = await mobileauthService.mobileDemoVerify(phoneNumber, countryCode, otp);
  }
  let tokens = await tokenService.generateAuthTokens(user);

  let demoValid = false;
  let adminDemoKey = null;

  if (demoKey) {
    const demoRecord = await Demo.findOne({ demoKey });
    if (demoRecord) {
      const currentDate = new Date();
      demoValid = demoRecord.status && demoRecord.Enddate > currentDate;
      if (demoValid) {
        adminDemoKey = demoKey; // Only set adminDemoKey if demo is valid
      } else {
        throw new ApiError(httpStatus.BAD_REQUEST, errorMessages.INVALID_DEMO_KEY);
      }
    }
  }

  if (user) {
    const body = {
      deviceInfoHash: deviceInfoHash,
      isPrimary: isPrimary,
      deviceType: deviceType,
      country: countryCode
    };

    // Only add adminDemoKey to the body if it exists
    if (adminDemoKey) {
      body.adminDemoKey = adminDemoKey;
    }


    await userService.updateUserById(user.id, body);
  }

  res.send({ user, tokens });
});

// const createUser = catchAsync(async (req, res) => {

//   let clientId = await getClientId(req);

//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {

//     if (req.body.referralCode) {
//       const referedByData = await User.findOne({ referralCode: req.body.referralCode });

//       if (!referedByData) {
//         throw new ApiError(httpStatus.UNAUTHORIZED, errorMessages.INVALID_REFERAL_CODE);
//       }

//     }

//      if (req.body.phoneNumber) {
//       let roleId = await findRolesByRoleName();

//       const existingUser = await Users.findOne({
//         phoneNumber: req.body.phoneNumber,
//         roleIds: roleId, 
//       });

//       if (existingUser) {
//         throw new ApiError(httpStatus.BAD_REQUEST, errorMessages.PHONE_NUMBER_ALREADY_TAKEN);
//       }
//     }

//     if (req.body.email && await Users.isEmailTaken(req.body.email)) {
//       throw new ApiError(httpStatus.BAD_REQUEST, errorMessages.EMAIL_ALREADY_TAKEN);
//     }

//     const countryDial = await Country.findById(req.body.countryCode);

//     if (!countryDial) {
//       throw new ApiError(httpStatus.UNAUTHORIZED, errorMessages.INVALID_COUNTRYCODE);
//     }
//     let roleId = await findRolesByRoleName();

//     const userData = {
//       firstName: req.body.name || "",
//       lastName: req.body.lastName || "",
//       phoneNumber: req.body.phoneNumber || "",
//       country: req.body.countryCode || "",
//       countryCode: req.body.countryCode,
//       active: req.body.active !== undefined ? req.body.active : true,
//       deviceInfoHash: req.body.deviceInfoHash || "",
//       deviceType: req.body.deviceType || "",
//       regDate: req.body.regDate || "", 
//       regTime: req.body.regTime || "",
//       clientId: clientId,
//       roleIds: roleId,
//       referralCode: generateReferralCode(), 
//     };

//     if (req.body.demoKey) {
//       userData.adminDemoKey = req.body.demoKey;
//     }

//     if (req.body.email) {
//       userData.email = req.body.email || "";
//     }

//     userUpload.single('profilePic')(req, res, async (err) => {

//       const driverImage = req.file ? req.file.filename : '';

//       if (driverImage) {
//         userData.profilePic = driverImage
//       }

//       const user = await userService.createUser(userData);

//       await sendPushNotificationToken(userData.deviceInfoHash,user._id.toString(), {
//         title: "WELCOME",
//         message: process.env.WELCOME_TEXT
//       });

//       const tokens = await tokenService.generateAuthTokens(user);

//       tokens.userId = user._id;


//       if (req.body.referralCode) {
//         const referedByData = await User.findOne({ referralCode: req.body.referralCode });
//         let referralBody = {
//           referredBy: referedByData._id,
//           referredTo: user._id
//         }
//         await Referral.create(referralBody)
//       }

//       await walletIntialTransaction(0, user._id, "Earned", "Wallet Create");

//       await session.commitTransaction();
//       session.endSession();
//       const response = Response(true, { tokens }, "User created successfully");

//       res.status(httpStatus.CREATED).send(response);
//     });
//   } catch (error) {
//     await session.abortTransaction();
//     session.endSession();
//     return res.status(400).json({ message: error.message });
//   }
// });



const createUser = catchAsync(async (req, res) => {

  const clientId = await getClientId(req);
  const session = await mongoose.startSession();

  let referredByUser = null;

  try {
    session.startTransaction();

    /* ---------------- REFERRAL VALIDATION ---------------- */
    if (req.body.referralCode) {
      referredByUser = await User.findOne(
        { referralCode: req.body.referralCode }
      ).session(session);

      if (!referredByUser) {
        throw new ApiError(
          httpStatus.UNAUTHORIZED,
          errorMessages.INVALID_REFERAL_CODE
        );
      }
    }

    /* ---------------- PHONE CHECK ---------------- */
    if (req.body.phoneNumber) {
      const roleId = await findRolesByRoleName();

      const existingUser = await User.findOne({
        phoneNumber: req.body.phoneNumber,
        roleIds: roleId
      }).session(session);

      if (existingUser) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          errorMessages.PHONE_NUMBER_ALREADY_TAKEN
        );
      }
    }

    /* ---------------- EMAIL CHECK ---------------- */
    if (req.body.email && await User.isEmailTaken(req.body.email)) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        errorMessages.EMAIL_ALREADY_TAKEN
      );
    }

    /* ---------------- COUNTRY CHECK ---------------- */
    const countryDial = await Country.findById(
      req.body.countryCode
    ).session(session);

    if (!countryDial) {
      throw new ApiError(
        httpStatus.UNAUTHORIZED,
        errorMessages.INVALID_COUNTRYCODE
      );
    }

    const roleId = await findRolesByRoleName();

    /* ---------------- USER DATA ---------------- */
    const userData = {
      firstName: req.body.name || "",
      lastName: req.body.lastName || "",
      phoneNumber: req.body.phoneNumber || "",
      country: req.body.countryCode,
      countryCode: req.body.countryCode,
      active: req.body.active ?? true,
      deviceInfoHash: req.body.deviceInfoHash || "",
      deviceType: req.body.deviceType || "",
      regDate: req.body.regDate || "",
      regTime: req.body.regTime || "",
      clientId,
      roleIds: roleId,
      referralCode: generateReferralCode(),
      email: req.body.email || "",
      adminDemoKey: req.body.demoKey || undefined,
      profilePic: req.file ? req.file.filename : ""
    };

    /* ---------------- CREATE USER ---------------- */
    const user = await User.create(
      [userData],
      { session }
    );

    const createdUser = user[0];

    /* ---------------- REFERRAL CREATE ---------------- */
    if (referredByUser) {
      await Referral.create(
        [{
          referredBy: referredByUser._id,
          referredTo: createdUser._id
        }],
        { session }
      );
    }

    /* ---------------- WALLET INIT ---------------- */
    await walletIntialTransaction(
      0,
      createdUser._id,
      "Earned",
      "Wallet Create",
      session
    );

    /* ---------------- COMMIT ---------------- */
    await session.commitTransaction();
    session.endSession();

    /* ---------------- AFTER COMMIT (SIDE EFFECTS) ---------------- */
    await sendPushNotificationToken(
      userData.deviceInfoHash,
      createdUser._id.toString(),
      {
        title: "WELCOME",
        message: process.env.WELCOME_TEXT
      }
    );

    const tokens = await tokenService.generateAuthTokens(createdUser);
    tokens.userId = createdUser._id;

    res.status(httpStatus.CREATED).send(
      Response(true, { tokens }, "User created successfully")
    );

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
});


const generateReferralCode = () => {
  return `REF${Math.random().toString(36).substring(2, 4).toUpperCase()}`;
};

const findRolesByRoleName = async () => {
  try {
    const roles = await Role.find({ role: 'User' });
    return roles;
  } catch (error) {
    console.error('Error fetching roles:', error);
    throw error;
  }
};

// Get a single driver by ID
const getUser = catchAsync(async (req, res) => {


  const userId = await getUserId(req);

  let user = await userService.getUserById(userId);

  if (user.length == 0) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  user = user.toObject ? user.toObject() : { ...user };

  user.profilePic = `${user.profilePic}`;

  const countryDial = await Country.findById(new ObjectId(user.countryCode));

  if (!countryDial) {
    throw new ApiError(httpStatus.UNAUTHORIZED, errorMessages.INVALID_COUNTRYCODE);
  }


  const updatedUser = {
    ...user,
    countryCode: countryDial.dial_code.toString() // Convert to string explicitly
  };

  const response = Response(true, updatedUser, "User retrieved successfully");
  res.status(httpStatus.OK).send(response);
});

const updateUser = catchAsync(async (req, res) => {

  const userId = await getUserId(req);

  const existingUser = await userService.getUserById(userId);
  const user = existingUser;

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  const userData = {
    firstName: req.body.name || user.firstName,
    lastName: req.body.name || user.lastName,
    email: req.body.email || user.email
  };


  userUpload.single('profilePic')(req, res, async (err) => {

    const driverImage = req.file ? req.file.filename : '';

    if (driverImage) {
      if (userData.profilePic) {
        const oldImagePath = path.join(__dirname, '../../uploads/user/', userData.profilePic);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }


      userData.profilePic = `/uploads/user/${driverImage}`;
    }

    await userService.updateUserById(existingUser.id, userData);

    const response = Response(true, "User updated successfully");
    res.status(httpStatus.OK).send(response);
  });
});

const getAutocompletePlaces = async (req, res) => {
  const { keyword, lat, lng } = req.query;

  if (!keyword || !lat || !lng) {
    return res.status(400).json({ error: 'Keyword, origin_lat, and origin_lng are required' });
  }

  const location = `${lat},${lng}`; // Combine latitude and longitude into a single location string

  try {
    const places = await userService.fetchAutocompletePlaces(keyword, location);
    const response = Response(true, places, "Success");
    res.status(httpStatus.OK).send(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getRequestsHistory = catchAsync(async (req, res) => {
  const request = await userService.getRequesHistoryList(req);
  if (!request) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Request not found');
  }
  const response = Response(true, request, "Success");
  res.status(httpStatus.OK).send(response);
});

const walletIntialTransaction = async (amount, userId, type, purpose) => {
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

const checkUserZone = catchAsync(async (req,res) => {

  const userId = await getUserId(req);
  const clientId = await getClientId(req);

  const zone = await userService.checkZone(req,userId);
  const response = Response(true, zone, "Zone Found");
  res.status(httpStatus.OK).send(response);
});

module.exports = {
  userOtpSent,
  userVerify,
  createUser,
  getUser,
  updateUser,
  getAutocompletePlaces,
  getRequestsHistory,
  checkUserZone,
  walletIntialTransaction
};