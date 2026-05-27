const httpStatus = require('http-status').default || require('http-status').status || require('http-status');
const { User, Driver, Request, DriverDocument, MobileOtp, Wallet } = require('../../../models');
const ApiError = require('../../../utils/ApiError');
const { ObjectId } = require('mongoose').Types;

const sendOTP = async (req, res) => {
  const { country, phoneNumber } = req.body;
  const user = await User.findOne({ phoneNumber, countryCode: new ObjectId(country) });
  if (!user) {
    return { status: httpStatus.NOT_FOUND, msg: 'No Data Found' };
  }
  const otp = 1234;

  const data = {
    phoneNumber,
    otp,
  };

  await MobileOtp.create(data);

  return { status: httpStatus.OK, msg: 'Otp sent successfully' };
};

const deleteAccount = async (req) => {
  const { country, phoneNumber, otp } = req.body;

  const userOtp = await MobileOtp.findOne({ phoneNumber, otp });
  if (!userOtp) {
    return { status: httpStatus.FORBIDDEN, msg: 'Wrong OTP' };
  }

  const user = await User.findOne({ phoneNumber, countryCode: new ObjectId(country) });
  const driver = await Driver.findOne({ userId: user._id });

  await await MobileOtp.deleteMany({ phoneNumber, otp });
  await Wallet.deleteOne({ userId: user._id });
  await Request.deleteMany({ userId: user._id });
  if (driver) {
    await DriverDocument.deleteMany({ driverId: driver._id });
    await Request.deleteMany({ driverId: driver._id });
    await Driver.deleteOne({ userId: user._id });
  }
  await User.deleteOne({ _id: user._id });

  return { status: httpStatus.OK, msg: 'Data deleted Successfully' };
};

module.exports = {
  sendOTP,
  deleteAccount,
};
