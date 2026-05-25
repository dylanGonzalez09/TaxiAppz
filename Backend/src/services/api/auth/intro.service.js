const { Intro } = require('../../../models');
const ApiError = require('../../../utils/ApiError');
const httpStatus = require('http-status');


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


/**
 * Get Intross
   @param {ObjectId} req - The clientId to filter users by
 * @returns {Promise<Intro>}
 */
const getDriverIntross = async (req) => {

  let clientId = await getClientId(req);
  // options.sortBy = options.sortBy || 'createdAt:desc';
  return Intro.find({ clientId: clientId, type: 'driver' });
};

/**
 * Get Intross
   @param {ObjectId} req - The clientId to filter users by
 * @returns {Promise<Intro>}
 */
   const getUserIntross = async (req) => {

    let clientId = await getClientId(req);
    // options.sortBy = options.sortBy || 'createdAt:desc';
    return Intro.find({ clientId: clientId, type: 'user' });
  };


module.exports = {
  getDriverIntross,
  getUserIntross
};
