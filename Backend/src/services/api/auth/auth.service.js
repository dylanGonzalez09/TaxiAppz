const httpStatus = require('http-status').default || require('http-status').status || require('http-status');
const userService = require('../../user.service');
const tokenService = require('../../token.service');
const ApiError = require('../../../utils/ApiError');
const { User, MobileOtp, Country, Demo, Role } = require('../../../models');
const { errorMessages, keyMessages } = require('../../../config/errorMessages');

/**
 * Login with username and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<User>}
 */
const loginUserWithEmailAndPassword = async (email, password) => {
  const user = await userService.getUserByEmail(email);

  if (!user || !(await user.isPasswordMatch(password))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect email or password');
  }

  const userId = user._id;

  return getUserWithRoles(userId);
};

/**
 * Login with MobileNo
 * @param {string} phoneNumber
 * @param {string} countryCode
 * @returns {Promise<User>}
 */
const loginDriverWithMobileNo = async (phoneNumber, countryCode) => {
  const countryDial = await Country.findById(countryCode);

  if (!countryDial) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid CountryCode');
  }

  const otp = generateToken();

  const body = {
    otp: 1234,
    phoneNumber,
  };

  const mobileOtp = await MobileOtp.findOne({ phoneNumber });

  if (mobileOtp) {
    Object.assign(mobileOtp, body);
    await mobileOtp.save();
  } else {
    await MobileOtp.create(body);
  }

  return body.otp;
};

/**
 * Login with phone number and OTP
 * @param {string} phoneNumber
 * @param {string} countryCode
 * @param {string} otp
 * @returns {Promise<User>}
 */
const mobileDriverOtpVerify = async (phoneNumber, countryCode, otp) => {
  const countryDial = await Country.findById(countryCode);

  if (!countryDial) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid CountryCode');
  }
  const roles = await Role.find({ role: 'Driver' });
  const user = await userService.getDriverByPhoneAndRole(
    phoneNumber,
    roles.map((role) => role._id),
  );

  let userType = 'ExistingUser';

  if (!user) {
    userType = 'NewUser';

    const mobileOtp = await MobileOtp.findOne({ phoneNumber });

    if (!mobileOtp) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect OTP');
    }

    // Compare provided OTP with stored OTP
    if (mobileOtp.otp !== otp) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect OTP');
    }

    await mobileOtp.deleteOne();

    return { userType };
  }
  const userId = user._id;

  // Fetch the mobile OTP for the user
  const mobileOtp = await MobileOtp.findOne({ phoneNumber });

  if (!mobileOtp) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect OTP');
  }

  // Compare provided OTP with stored OTP
  if (mobileOtp.otp !== otp) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect OTP');
  }

  if (userId) {
    await mobileOtp.deleteOne();
  }

  const userData = await getUserWithRoles(userId);

  return { userType, userData };
};

/**
 * Login with phone number and OTP
 * @param {string} phoneNumber
 * @param {string} countryCode
 * @param {string} otp
 * @returns {Promise<User>}
 */
const mobileDriverDemoVerify = async (phoneNumber, countryCode, demoKey) => {
  const demoValid = await Demo.findOne({ demoKey });

  if (!demoValid) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid Demo Key');
  }

  const countryDial = await Country.findById(countryCode);

  if (!countryDial) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid CountryCode');
  }

  const user = await userService.getDriverByPhone(phoneNumber);

  let userType = 'ExistingUser';

  if (!user) {
    userType = 'NewUser';

    const mobileOtp = await MobileOtp.findOne({ phoneNumber });

    if (mobileOtp) {
      await mobileOtp.deleteOne();
    }

    return { userType };
  }
  const userId = user._id;

  // Fetch the mobile OTP for the user
  const mobileOtp = await MobileOtp.findOne({ phoneNumber });

  if (!mobileOtp) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect OTP');
  }

  if (userId && mobileOtp) {
    await mobileOtp.deleteOne();
  }

  const userData = await getUserWithRoles(userId);

  return { userType, userData };
};

// User

/**
 * Login with MobileNo
 * @param {string} phoneNumber
 * @param {string} countryCode
 * @returns {Promise<User>}
 */
const loginUserWithMobileNo = async (phoneNumber, countryCode) => {
  const countryDial = await Country.findById(countryCode);

  if (!countryDial) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid CountryCode');
  }

  const otp = generateToken();

  const body = {
    otp: 1234,
    phoneNumber,
  };

  const mobileOtp = await MobileOtp.findOne({ phoneNumber });

  if (mobileOtp) {
    Object.assign(mobileOtp, body);
    await mobileOtp.save();
  } else {
    await MobileOtp.create(body);
  }

  return body.otp;
};

/**
 * Login with phone number and OTP
 * @param {string} phoneNumber
 * @param {string} countryCode
 * @param {string} otp
 * @returns {Promise<User>}
 */
const mobileUserOtpVerify = async (phoneNumber, countryCode, otp) => {
  const countryDial = await Country.findById(countryCode);

  if (!countryDial) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid CountryCode');
  }

  const roles = await Role.find({ role: 'User' });
  const user = await userService.getDriverByPhoneAndRole(
    phoneNumber,
    roles.map((role) => role._id),
  );

  let userType = 'ExistingUser';
  if (!user) {
    userType = 'NewUser';

    const mobileOtp = await MobileOtp.findOne({ phoneNumber });

    if (!mobileOtp) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect OTP');
    }

    if (mobileOtp.otp !== otp) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect OTP');
    }

    await mobileOtp.deleteOne();

    return { userType };
  }
  const userId = user._id;

  // Fetch the mobile OTP for the user
  const mobileOtp = await MobileOtp.findOne({ phoneNumber });

  if (!mobileOtp) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect OTP');
  }

  // Compare provided OTP with stored OTP
  if (mobileOtp.otp !== otp) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect OTP');
  }

  if (userId) {
    await mobileOtp.deleteOne();
  }
  // If OTP matches, return the user with roles
  const userData = await getUserWithRoles(userId);

  return { userType, userData };
};

/**
 * Login with phone number and OTP
 * @param {string} phoneNumber
 * @param {string} countryCode
 * @param {string} otp
 * @returns {Promise<User>}
 */
const mobileOtpVerify = async (phoneNumber, countryCode, otp) => {
  // Fetch user by phone number
  const user = await userService.getUserByPhone(phoneNumber);

  if (!user) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid Mobile No');
  }

  const userId = user._id;

  // Fetch the mobile OTP for the user
  const mobileOtp = await MobileOtp.findOne({ userId });

  if (!mobileOtp) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect OTP');
  }

  // Compare provided OTP with stored OTP
  if (mobileOtp.otp !== otp) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect OTP');
  }

  if (userId) {
    await mobileOtp.deleteOne();
  }
  // If OTP matches, return the user with roles
  return getUserWithRoles(userId);
};

/**
 * Login with phone number and OTP
 * @param {string} phoneNumber
 * @param {string} countryCode
 * @param {string} otp
 * @returns {Promise<User>}
 */
const mobileDemoVerify = async (phoneNumber) => {
  // Fetch user by phone number
  const user = await userService.getUserByPhone(phoneNumber);

  if (!user) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid Mobile No');
  }

  const userId = user._id;

  // Fetch the mobile OTP for the user
  const mobileOtp = await MobileOtp.findOne({ userId });

  if (!mobileOtp) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect OTP');
  }

  if (userId) {
    await mobileOtp.deleteOne();
  }
  // If OTP matches, return the user with roles
  return getUserWithRoles(userId);
};

/**
 * Login with phone number and OTP
 * @param {string} phoneNumber
 * @param {string} countryCode
 * @param {string} otp
 * @returns {Promise<User>}
 */
const mobileUserDemoVerify = async (phoneNumber, countryCode, demoKey) => {
  const demoValid = await Demo.findOne({ demoKey });

  if (!demoValid) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid Demo Key');
  }

  const countryDial = await Country.findById(countryCode);

  if (!countryDial) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid CountryCode');
  }
  // Fetch user by phone number
  const user = await userService.getUserByPhone(phoneNumber);
  let userType = 'ExistingUser';
  if (!user) {
    userType = 'NewUser';

    const mobileOtp = await MobileOtp.findOne({ phoneNumber });

    if (mobileOtp) {
      await mobileOtp.deleteOne();
    }

    return { userType };
  }
  const userId = user._id;

  // Fetch the mobile OTP for the user
  const mobileOtp = await MobileOtp.findOne({ phoneNumber });

  if (!mobileOtp) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect OTP');
  }

  if (userId && mobileOtp) {
    await mobileOtp.deleteOne();
  }
  // If OTP matches, return the user with roles
  const userData = await getUserWithRoles(userId);

  return { userType, userData };
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

const getUserWithRoles = async (userId) => {
  const user = await User.findById(userId)
    .populate({
      path: 'roleIds',
      select: 'role',
    })
    .exec();

  return user;
};

function generateToken() {
  const randomNum = Math.random() * 9000;
  return Math.floor(1000 + randomNum);
}

/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getUserById = async (id) => {
  return User.findById(id);
};

module.exports = {
  loginUserWithEmailAndPassword,
  refreshAuth,
  mobileOtpVerify,
  getUserById,
  loginDriverWithMobileNo,
  mobileDriverOtpVerify,
  loginUserWithMobileNo,
  mobileUserOtpVerify,
  mobileDemoVerify,
  mobileUserDemoVerify,
  mobileDriverDemoVerify,
};
