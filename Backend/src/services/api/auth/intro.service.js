const { Intro } = require('../../../models');
const ApiError = require('../../../utils/ApiError');

const httpStatus = require('http-status').default || require('http-status').status || require('http-status');
const { getClientId } = require('../../../utils/commonFunction');

/**
  from the mobile side they need to send Client Id and Code (Version code)
  1. Check the Version Available or not if not redirect to update screen
  2. check the avaliable languages for client send the avaliable languages
 */

/**
 * Get Intross
   @param {ObjectId} req - The clientId to filter users by
 * @returns {Promise<Intro>}
 */
const getDriverIntross = async (req) => {
  const clientId = await getClientId(req);
  // options.sortBy = options.sortBy || 'createdAt:desc';
  return Intro.find({ clientId, type: 'driver' });
};

/**
 * Get Intross
   @param {ObjectId} req - The clientId to filter users by
 * @returns {Promise<Intro>}
 */
const getUserIntross = async (req) => {
  const clientId = await getClientId(req);
  // options.sortBy = options.sortBy || 'createdAt:desc';
  return Intro.find({ clientId, type: 'user' });
};

module.exports = {
  getDriverIntross,
  getUserIntross,
};
