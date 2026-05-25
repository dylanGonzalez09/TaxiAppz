const httpStatus = require('http-status');
const ApiError = require('../../../utils/ApiError');
const catchAsync = require('../../../utils/catchAsync');
const { webUserService, tokenService, userService, requestService, cancellationReasonService } = require('../../../services');
const mongoose = require('mongoose');
const { Country, User, Role, Referral, Wallet, WalletTransaction, Language } = require('../../../models');
const { userUpload } = require('../../../middlewares/upload');
const Response = require('../../../config/response');
const { errorMessages } = require('../../../config/errorMessages');
const ObjectId = require('mongoose').Types.ObjectId;
const { sendPushNotificationToken } = require('../../../utils/commonFunction');

/**
 * Web User Controller
 * Separate controller for web booking system (not client-based)
 * No clientId required - web is platform-wide
 */

/**
 * Get user ID from token
 */
const getUserId = async (req) => {
  let userId = '';
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Authorization header is missing or invalid');
  }

  const token = authHeader.substring(7);
  const user = await tokenService.verifyTokenAndGetUser(token);
  userId = user.id;
  return userId;
};

/**
 * Send OTP to user's phone number (Web)
 * POST /v1/web/user/login
 */
const userOtpSent = catchAsync(async (req, res) => {
  const { authenticationType, phoneNumber, countryCode } = req.body;

  if (authenticationType === "OTP") {
    let otp = await webUserService.loginUserWithMobileNo(phoneNumber, countryCode);
    const response = Response(true, "Otp Sent Successfully", "Data Found");
    res.status(httpStatus.OK).send(response);
  } else {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Only OTP authentication is supported for web');
  }
});

/**
 * Verify OTP and authenticate user (Web)
 * POST /v1/web/user/verify
 */
const userVerify = catchAsync(async (req, res) => {
  const { deviceInfoHash, isPrimary, deviceType, countryCode, phoneNumber, otp } = req.body;
  
  // Verify OTP using web service
  let user = await webUserService.mobileUserOtpVerify(phoneNumber, countryCode, otp);
  
  // Generate tokens if user exists
  let tokens = null;
  if (user.userData) {
    tokens = await tokenService.generateAuthTokens(user.userData);
    
    // Update user device info
    const body = {
      deviceInfoHash: deviceInfoHash || 'web-browser',
      isPrimary: isPrimary || true,
      deviceType: deviceType || 'web',
      country: countryCode
    };
    
    await userService.updateUserById(user.userData.id, body);
  }

  const response = Response(true, { usertype: user.userType, tokens, driver: user.userData }, "Otp Verify Successfully");
  res.status(httpStatus.OK).send(response);
});

// Helper function to get user with roles
const getUserWithRoles = async (userId) => {
  const user = await User.findById(userId)
    .populate({
      path: 'roleIds',
      select: 'role'
    }).exec();
  return user;
};

/**
 * Create new user (Web)
 * POST /v1/web/user/create
 * No clientId required - web is platform-wide
 * OTP is already verified before reaching this endpoint, so we just create user and auto-authenticate
 */
const createUser = catchAsync(async (req, res) => {
  const { phoneNumber, countryCode, name, email, deviceInfoHash, deviceType, isPrimary } = req.body;
  
  // OTP is already verified in the OTP verification step
  // We just need to create the user and auto-authenticate them

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Check if phone number already exists
    if (phoneNumber) {
      let roleIdsdata = await webUserService.findRolesByRoleUser();

      let Details = await User.findOne({
        phoneNumber,
        roleIds: { $in: [roleIdsdata] }
      });

      if (Details) {
        throw new ApiError(httpStatus.BAD_REQUEST, errorMessages.PHONE_NUMBER_ALREADY_TAKEN);
      }
    }

    // Validate country code
    const countryDial = await Country.findById(countryCode);
    if (!countryDial) {
      throw new ApiError(httpStatus.UNAUTHORIZED, errorMessages.INVALID_COUNTRYCODE);
    }

    let roleId = await webUserService.findRolesByRoleUser();

    const userData = {
      firstName: name || "",
      lastName: name || "",
      phoneNumber: phoneNumber || "",
      country: countryCode || "",
      countryCode: countryCode,
      active: true,
      deviceInfoHash: deviceInfoHash || "web-browser",
      deviceType: deviceType || "web",
      // No clientId for web - platform-wide
      roleIds: roleId,
      referralCode: generateReferralCode(),
    };

    if (email) {
      userData.email = email || "";
    }

    // Handle profile picture upload
    userUpload.single('profilePic')(req, res, async (err) => {
      if (err) {
        await session.abortTransaction();
        session.endSession();
        throw new ApiError(httpStatus.BAD_REQUEST, err.message);
      }

      const driverImage = req.file ? req.file.filename : '';
      if (driverImage) {
        userData.profilePic = driverImage;
      }

      const user = await userService.createUser(userData);

      // Send welcome notification
      await sendPushNotificationToken(userData.deviceInfoHash, user._id.toString(), {
        title: "WELCOME",
        message: process.env.WELCOME_TEXT || "Welcome to our platform"
      });

      // Generate tokens immediately (auto-authenticate - no need to verify OTP again)
      const tokens = await tokenService.generateAuthTokens(user);
      tokens.userId = user._id;

      // Handle referral code if provided
      if (req.body.referralCode) {
        const referedByData = await User.findOne({ referralCode: req.body.referralCode });
        if (referedByData) {
          let referralBody = {
            referredBy: referedByData._id,
            referredTo: user._id
          };
          await Referral.create(referralBody);
        }
      }

      // Initialize wallet
      await walletIntialTransaction(0, user._id, "Earned", "Wallet Create");

      await session.commitTransaction();
      session.endSession();
      
      // Get user with roles for response
      const userWithRoles = await getUserWithRoles(user._id);
      
      // Return response in same format as verify endpoint (for frontend compatibility)
      const response = Response(true, { 
        usertype: "ExistingUser", 
        tokens, 
        driver: userWithRoles 
      }, "User created and authenticated successfully");
      res.status(httpStatus.CREATED).send(response);
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
});

/**
 * Get user profile (Web)
 * GET /v1/web/user/getProfile
 */
const getUser = catchAsync(async (req, res) => {
  const userId = await getUserId(req);
  let user = await userService.getUserById(userId);


  if (!user || user.length === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  user = user.toObject ? user.toObject() : { ...user };
  user.profilePic = user.profilePic ? `/uploads/user/${user.profilePic}` : null;

  // Populate country name/dial when countryCode exists
  if (user.countryCode) {
    try {
      const countryDial = await Country.findById(new ObjectId(user.countryCode));
      if (countryDial) {
        user.countryDial = countryDial.dial_code;
        user.countryName = countryDial.name;
      }
    } catch (e) {
      // invalid id, leave countryDial/countryName unset
    }
  }
  if (!user.countryName) user.countryName = null;
  if (!user.countryDial) user.countryDial = null;

  // Populate language name for display (frontend shows name, not ObjectId)
  if (user.language) {
    try {
      const lang = await Language.findById(user.language).select('name code').lean();
      if (lang) {
        user.languageName = lang.name;
        user.languageCode = lang.code;
      }
    } catch (e) {
      // invalid id
    }
  }

  const response = Response(true, user, "Data Found");
  res.status(httpStatus.OK).send(response);
});

/**
 * Update user (Web)
 * PUT /v1/web/user/updateUsers
 * Multer already runs in route (userUpload.single('profilePic')), so req.body and req.file are set here.
 * Resolves language code (e.g. "en") to Language ObjectId when needed.
 */
const updateUser = catchAsync(async (req, res) => {
  const userId = await getUserId(req);

  const updateData = { ...req.body };
  if (req.file) {
    updateData.profilePic = req.file.filename;
  }

  // User.language is ObjectId ref; frontend may send code (e.g. "en") - resolve to _id
  if (updateData.language && typeof updateData.language === 'string') {
    const isObjectId = /^[a-fA-F0-9]{24}$/.test(updateData.language);
    if (!isObjectId) {
      const lang = await Language.findOne({ code: updateData.language, status: true }).select('_id');
      if (lang) {
        updateData.language = lang._id;
      } else {
        delete updateData.language;
      }
    }
  }

  let user = await userService.updateUserById(userId, updateData);
  // Return same shape as getProfile so frontend shows language/country names without refresh
  user = user.toObject ? user.toObject() : { ...user };
  user.profilePic = user.profilePic ? `/uploads/user/${user.profilePic}` : null;

  if (user.countryCode) {
    try {
      const countryDial = await Country.findById(new ObjectId(user.countryCode));
      if (countryDial) {
        user.countryDial = countryDial.dial_code;
        user.countryName = countryDial.name;
      }
    } catch (e) { }
  }
  if (!user.countryName) user.countryName = null;
  if (!user.countryDial) user.countryDial = null;

  if (user.language) {
    try {
      const lang = await Language.findById(user.language).select('name code').lean();
      if (lang) {
        user.languageName = lang.name;
        user.languageCode = lang.code;
      }
    } catch (e) { }
  }

  const response = Response(true, user, "User updated successfully");
  res.status(httpStatus.OK).send(response);
});

/**
 * Get autocomplete places (Web)
 * GET /v1/web/user/places?keyword=...&lat=...&lng=...
 */
const getAutocompletePlaces = catchAsync(async (req, res) => {
  const { keyword, lat, lng } = req.query;

  if (!keyword || keyword.trim().length < 2) {
    const response = Response(true, [], "Keyword must be at least 2 characters");
    return res.status(httpStatus.OK).send(response);
  }

  // Build location string for autocomplete
  let location = null;
  if (lat && lng) {
    location = `${lat},${lng}`;
  }

  try {
    // Use the autocompletePlaces function from commonFunction
    const { autocompletePlaces } = require('../../../utils/commonFunction');
    const places = await autocompletePlaces(keyword.trim(), location);

    const response = Response(true, places, "Places found successfully");
    res.status(httpStatus.OK).send(response);
  } catch (error) {
    console.error('Autocomplete places error:', error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Failed to fetch places');
  }
});

/**
 * Get request history (Web)
 * GET /v1/web/user/request/history
 * No clientId required - web is platform-wide
 */
const getRequestsHistory = catchAsync(async (req, res) => {
  const userId = await getUserId(req);
  
  // Get user to get phone number
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  
  // Call web request service to get history with user profile info
  const history = await requestService.getWebRequestHistory(user.phoneNumber);
  
  const response = Response(true, history, "Request history found");
  res.status(httpStatus.OK).send(response);
});

/**
 * Get cancellation reasons for users (Web)
 * GET /v1/web/user/cancellation-reasons
 * No clientId required - web is platform-wide
 */
const getCancellationReasons = catchAsync(async (req, res) => {
  // Get user cancellation reasons (no clientId filter needed for web)
  const reasons = await cancellationReasonService.getUserCancellations();
  
  const response = Response(true, reasons, "Cancellation reasons found");
  res.status(httpStatus.OK).send(response);
});

// Helper functions
const generateReferralCode = () => {
  return `REF${Math.random().toString(36).substring(2, 4).toUpperCase()}`;
};

const walletIntialTransaction = async (amount, userId, type, description) => {
  try {
    let wallet = await Wallet.findOne({ userId: userId });
    
    if (!wallet) {
      wallet = await Wallet.create({
        userId: userId,
        balance: amount,
        currency: 'USD' // Default currency, can be made configurable
      });
    }

    await WalletTransaction.create({
      walletId: wallet._id,
      userId: userId,
      amount: amount,
      type: type,
      description: description,
      status: 'completed'
    });
  } catch (error) {
    console.error('Error in wallet initial transaction:', error);
    throw error;
  }
};

module.exports = {
  userOtpSent,
  userVerify,
  createUser,
  getUser,
  updateUser,
  getAutocompletePlaces,
  getRequestsHistory,
  getCancellationReasons,
};

