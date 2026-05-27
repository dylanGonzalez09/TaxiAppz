const httpStatus = require('http-status').default || require('http-status').status || require('http-status');
const tokenService = require('./token.service');
const userService = require('./user.service');
const Token = require('../models/token.model');
const ApiError = require('../utils/ApiError');
const { tokenTypes } = require('../config/tokens');
const { Demo, User, Driver, DriverLocation, Zone } = require('../models');

/**
 * Login with username and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<User>}
 */
const loginUserWithEmailAndPassword = async (email, password) => {
  const user = await userService.getUserByEmail(email);
  if(!user){
    throw new ApiError(httpStatus.NOT_FOUND,"Can not find user with this email");
  }
  if (!user.active) {
    throw new ApiError(httpStatus.FORBIDDEN, 'User is not active. Please contact admin.');
  }

  if (!(await user.isPasswordMatch(password))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect password please try again');
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
  return getUserWithRoles(user);
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

  const driver = await Driver.findOne({ userId: user._id });

  if (driver) {
    // Update driver location to offline
    const driverLocation = await DriverLocation.findOne({ driverId: driver._id });
    if (driverLocation) {
      driverLocation.isOnline = false;
      driverLocation.isAvailable = false;
      await driverLocation.save();
      user.onlineBy = 0;
      await user.save();
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

  // Find and delete the refresh token document
  const refreshTokenDoc = await Token.findOneAndDelete({
    token: refreshToken,
    type: tokenTypes.REFRESH,
    blacklisted: false,
  });

  if (!refreshTokenDoc) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Refresh token not found');
  }

  await userService.deleteUserById(user._id); // Use your existing userService method

  return { message: 'Account Deleted successfully' };
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

    await Token.deleteOne({ _id: refreshTokenDoc._id });

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
    throw new ApiError(httpStatus.UNAUTHORIZED, `Password reset failed${error}`);
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

const getUserWithRoles = async (userDetails) => {
  const user = await User.findById(userDetails.id)
    .populate({
      path: 'roleIds',
      select: 'role', // Include only the 'role' field
    })
    .exec();

  user.roleIds = [user.roleIds[0]];

  let zoneId = '';

  if (user.roleIds[0].role == 'Client') {
    zoneId = user.zoneId;
  } else {
    const clientZone = await Zone.findOne({ clienId: user.clienId });
    if (clientZone) {
      zoneId = clientZone._id;
    }
  }
  user.zoneId = zoneId;
  return user;
};

module.exports = {
  loginUserWithEmailAndPassword,
  logout,
  refreshAuth,
  resetPassword,
  verifyEmail,
  deleteAccount,
};
