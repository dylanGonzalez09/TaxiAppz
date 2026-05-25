const httpStatus = require('http-status');
const ApiError = require('../../../utils/ApiError');
const { Country, User, Role, MobileOtp } = require('../../../models');
const { errorMessages } = require('../../../config/errorMessages');
const { smsGateWayStatus, commonSms } = require('../../../utils/commonFunction');

// Generate OTP token (4-6 digits)
function generateToken() {
  const randomNum = Math.random() * 9000;
  return Math.floor(1000 + randomNum).toString();
}

// Get user with roles populated
const getUserWithRoles = async (userId) => {
  const user = await User.findById(userId)
    .populate({
      path: 'roleIds',
      select: 'role'
    }).exec();
  return user;
};

/**
 * Web User Service
 * Separate service for web booking system (not client-based)
 * No clientId required - web is platform-wide
 */

/**
 * Find role by role name "User"
 * @returns {Promise<string>}
 */
const findRolesByRoleUser = async () => {
  try {
    const role = await Role.findOne({ role: 'User' });
    if (!role) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User role not found');
    }
    return role._id;
  } catch (error) {
    console.error('Error fetching roles:', error);
    throw error;
  }
};

/**
 * Login with Mobile Number (Web-specific)
 * @param {string} phoneNumber
 * @param {string} countryCode - MongoDB ObjectId
 * @returns {Promise<string>} OTP
 */
const loginUserWithMobileNo = async (phoneNumber, countryCode) => {
  const countryDial = await Country.findById(countryCode);

  if (!countryDial) {
    throw new ApiError(httpStatus.UNAUTHORIZED, errorMessages.INVALID_COUNTRYCODE);
  }

  let originalPhoneNumber = countryDial.dial_code + "" + phoneNumber;

  const otp = generateToken();

  let smsGatewayStatus = await smsGateWayStatus();

  let body = {};

  // Test phone numbers for development
  if (phoneNumber === '9090909090' || phoneNumber === '6000000001' || phoneNumber === '6379698442' || phoneNumber === '6379698552') {
    body = {
      otp: 1234,
      phoneNumber: phoneNumber,
    };
  } else {
    body = {
      otp: smsGatewayStatus === 'yes' ? otp : 1234,
      phoneNumber: phoneNumber,
    };
  }

  let mobileOtp = await MobileOtp.findOne({ 'phoneNumber': phoneNumber });

  if (mobileOtp) {
    Object.assign(mobileOtp, body);
    await mobileOtp.save();
  } else {
    await MobileOtp.create(body);
  }

  // Send SMS if not test number
  if (phoneNumber !== '9090909090' && phoneNumber !== '6000000001' && phoneNumber !== '6379698442' && phoneNumber !== '6379698552') {
    if (smsGatewayStatus === 'yes') {
      commonSms(originalPhoneNumber, body.otp);
    }
  }
  
  return body.otp;
};

/**
 * Verify OTP for Web User
 * @param {string} phoneNumber
 * @param {string} countryCode - MongoDB ObjectId
 * @param {string} otp
 * @returns {Promise<Object>} { userType, userData? }
 */
const mobileUserOtpVerify = async (phoneNumber, countryCode, otp) => {
  const countryDial = await Country.findById(countryCode);

  if (!countryDial) {
    throw new ApiError(httpStatus.UNAUTHORIZED, errorMessages.INVALID_COUNTRYCODE);
  }

  // Fetch user by phone number
  let roleId = await findRolesByRoleUser();

  let user = await User.findOne({
    phoneNumber,
    roleIds: { $in: [roleId] }
  });

  let userType = "ExistingUser";
  
  if (!user) {
    userType = "NewUser";

    let mobileOtp = await MobileOtp.findOne({ 'phoneNumber': phoneNumber });

    if (!mobileOtp) {
      throw new ApiError(httpStatus.UNAUTHORIZED, errorMessages.INVALID_OTP);
    }

    if (mobileOtp.otp !== otp) {
      throw new ApiError(httpStatus.UNAUTHORIZED, errorMessages.INVALID_OTP);
    }

    await mobileOtp.deleteOne();

    return { userType };
  } else {
    const userId = user._id;

    // Fetch the mobile OTP for the user
    let mobileOtp = await MobileOtp.findOne({ 'phoneNumber': phoneNumber });

    if (!mobileOtp) {
      throw new ApiError(httpStatus.UNAUTHORIZED, errorMessages.INVALID_OTP);
    }

    // Compare provided OTP with stored OTP
    if (mobileOtp.otp !== otp) {
      throw new ApiError(httpStatus.UNAUTHORIZED, errorMessages.INVALID_OTP);
    }

    if (userId) {
      await mobileOtp.deleteOne();
    }

    // If OTP matches, return the user with roles
    const userData = await getUserWithRoles(userId);

    return { userType, userData };
  }
};

module.exports = {
  loginUserWithMobileNo,
  mobileUserOtpVerify,
  findRolesByRoleUser,
};

