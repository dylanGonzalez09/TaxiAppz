const httpStatus = require('http-status');
const tokenService = require('./token.service');
const userService = require('./user.service');
const Token = require('../models/token.model');
const ApiError = require('../utils/ApiError');
const { tokenTypes } = require('../config/tokens');
const { Demo, User, Driver, DriverLocation, Zone, Request } = require('../models');
const ObjectId = require('mongoose').Types.ObjectId

/**
 * Login with username and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<User>}
 */
const loginUserWithEmailAndPassword = async (email, password) => {
  const user = await userService.getUserByEmail(email);
  if (!user || !user.active) {
    throw new ApiError(httpStatus.FORBIDDEN, 'User is not active. Please contact admin.');
  }

  if (!user || !(await user.isPasswordMatch(password))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect email or password');
  }

  // Check if the user is a demo user and if the demo has expired
  if (user.isDemo) {
    const demoClient = await Demo.findOne({ userId: user._id });

    if (demoClient && new Date(demoClient.endDate) < new Date()) {
      // If the demo has expired, deactivate user and demo client
      user.active = false;
      demoClient.status = false;
      await demoClient.save();
      await user.save();

      throw new ApiError(httpStatus.FORBIDDEN, 'Demo expired. Please contact admin.');
    }
  }

  // Return the user with roles if login is successful
  return getUserWithRoles(user._id);
};

/**
 * Logout
 * @param {string} refreshToken
 * @returns {Promise}
 */
const logout = async (refreshToken) => {
  // Verify the refresh token
  const refreshTokenDocVerify = await tokenService.verifyToken(refreshToken, tokenTypes.REFRESH);




  // Fetch the user by ID
  const user = await userService.getUserById(refreshTokenDocVerify.user);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  const activeTrips = await Request.countDocuments({
    userId: new ObjectId(user._id),
    isCompleted: false,
    isCancelled:false  // Only check for active trips
  });

  if (activeTrips > 0) {
    throw new ApiError(httpStatus.FORBIDDEN, 'User cannot be deleted because they have active trip');
  }


  const driver = await Driver.findOne({ userId: user._id })


  if (driver) {
    const activeTripsDrivers = await Request.countDocuments({
      driverId: new ObjectId(driver._id),
      isCompleted: false,  // Only check for active trips,
      isCancelled:false
    });

    if (activeTripsDrivers > 0) {
      throw new ApiError(httpStatus.FORBIDDEN, 'User cannot be deleted because they have active trip');
    }


    const driverLocation = await DriverLocation.findOne({ driverId: driver._id })
    if (driverLocation) {
      driverLocation.isOnline = false;
      driverLocation.isAvailable = false;
      await driverLocation.save();
    }
  }

  // Find and delete the refresh token document
  const refreshTokenDoc = await Token.findOneAndDelete({
    token: refreshToken,
    type: tokenTypes.REFRESH,
    blacklisted: false,
  });

  if (!refreshTokenDoc) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Refresh token not found');
  }

  // Update the user's deviceInfoHash to an empty string
  user.deviceInfoHash = '';
  await user.save();

  return { message: 'Logged out successfully' };
};


/**
 * Logout
 * @param {string} refreshToken
 * @returns {Promise}
 */
const deleteAccount = async (refreshToken) => {
  // Verify the refresh token
  const refreshTokenDocVerify = await tokenService.verifyToken(refreshToken, tokenTypes.REFRESH);

  // Fetch the user by ID
  const user = await userService.getUserById(refreshTokenDocVerify.user);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  const userWallet = await Wallet.findOne({ userId: user._id });
  if (!userWallet) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User wallet not found');
  }

  if (userWallet.balance < 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Wallet balance is negative. Please recharge.');
  }

  const activeTrips = await Request.countDocuments({
    userId: new ObjectId(user._id),
    isCompleted: false,
    isCancelled:false  // Only check for active trips
  });


  if (activeTrips > 0) {
    throw new ApiError(httpStatus.FORBIDDEN, 'User cannot be deleted because they have active trip');
  }

  const driver = await Driver.findOne({ userId: user._id });

  if (driver) {


    const activeTripsDrivers = await Request.countDocuments({
      driverId: new ObjectId(driver._id),
      isCompleted: false,
      isCancelled:false  // Only check for active trips
    });

    if (activeTripsDrivers > 0) {
      throw new ApiError(httpStatus.FORBIDDEN, 'User cannot be deleted because they have active trip');
    }


    const driverLocation = await DriverLocation.findOne({ driverId: driver._id })
    if (driverLocation) {
      driverLocation.isOnline = false;
      driverLocation.isAvailable = false;
      await driverLocation.save();
    }
  }

  // Find and delete the refresh token document
  const refreshTokenDoc = await Token.findOneAndDelete({
    token: refreshToken,
    type: tokenTypes.REFRESH,
    blacklisted: false,
  });

  if (!refreshTokenDoc) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Refresh token not found');
  }

  let data = await userService.deleteMobileUserById(user._id); // Use your existing userService method

  return { message: data };
};

/**
 * Refresh auth tokens
 * @param {string} refreshToken
 * @returns {Promise<Object>}
 */
const refreshAuth = async (refreshToken) => {
  try {
    const refreshTokenDoc = await tokenService.verifyToken(refreshToken, tokenTypes.REFRESH);
    const user = await userService.getUserById(refreshTokenDoc.user);
    if (!user) {
      throw new Error();
    }
    await refreshTokenDoc.remove();
    return tokenService.generateAuthTokens(user);
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
  }
};

/**
 * Reset password
 * @param {string} resetPasswordToken
 * @param {string} newPassword
 * @returns {Promise}
 */
const resetPassword = async (resetPasswordToken, newPassword) => {
  try {
    const resetPasswordTokenDoc = await tokenService.verifyToken(resetPasswordToken, tokenTypes.RESET_PASSWORD);
    const user = await userService.getUserById(resetPasswordTokenDoc.user);
    if (!user) {
      throw new Error();
    }
    await userService.updateUserById(user.id, { password: newPassword });
    await Token.deleteMany({ user: user.id, type: tokenTypes.RESET_PASSWORD });
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Password reset failed' + error);
  }
};

/**
 * Verify email
 * @param {string} verifyEmailToken
 * @returns {Promise}
 */
const verifyEmail = async (verifyEmailToken) => {
  try {
    const verifyEmailTokenDoc = await tokenService.verifyToken(verifyEmailToken, tokenTypes.VERIFY_EMAIL);
    const user = await userService.getUserById(verifyEmailTokenDoc.user);
    if (!user) {
      throw new Error();
    }
    await Token.deleteMany({ user: user.id, type: tokenTypes.VERIFY_EMAIL });
    await userService.updateUserById(user.id, { isEmailVerified: true });
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Email verification failed');
  }
};

const getUserWithRoles = async (userId) => {
  const user = await User.findById(userId)
    .populate({
      path: 'roleIds',
      select: 'role' // Include only the 'role' field
    })
    .exec();

  return user;
};





module.exports = {
  loginUserWithEmailAndPassword,
  logout,
  refreshAuth,
  resetPassword,
  verifyEmail,
  deleteAccount
};
