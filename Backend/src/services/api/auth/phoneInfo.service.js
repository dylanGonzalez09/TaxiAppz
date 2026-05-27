
const httpStatus = require('http-status').default || require('http-status').status || require('http-status');
const ApiError = require('../../../utils/ApiError');
const {PhoneInfo } = require('../../../models');
const mongoose = require('mongoose');

const {getClientId} = require('../../../utils/commonFunction')


const trackDeviceInstall = async (req) => {

  const deviceHash = req.headers['x-device-hash'];
  const platform = req.headers['x-platform'];
  const appVersion = req.headers['x-app-version'];
  const language = req.headers['x-language'];

  // Do nothing if required headers are missing
  if (!deviceHash || !platform) return;

  const clientId = await getClientId(req);

  await PhoneInfo.updateOne(
    { deviceHash, platform, clientId },
    {
      $setOnInsert: {
        deviceHash,
        platform,
        clientId,
        appVersion,
        language
      },
      $set: {
        lastSeenAt: new Date()
      }
    },
    { upsert: true }
  );
};
const getInstallCounts = async (clientId) => {
  const result = await PhoneInfo.aggregate([
    {
      $match: {
        clientId: new mongoose.Types.ObjectId(clientId)
      }
    },
    {
      $group: {
        _id: '$platform',   // android | ios
        count: { $sum: 1 }
      }
    }
  ]);

  return {
    android: result.find(r => r._id === 'android')?.count || 0,
    ios: result.find(r => r._id === 'ios')?.count || 0,
    total: result.reduce((sum, r) => sum + r.count, 0)
  };
};

module.exports = {
  trackDeviceInstall,
  getInstallCounts
};
