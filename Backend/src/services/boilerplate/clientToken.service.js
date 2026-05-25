// clientToken.service.js
const { ClientToken } = require('../../models');

/**
 * Create or update client token
 * @param {Object} clientTokenBody
 * @returns {Promise<ClientToken>}
 */
const upsertClientToken = async (clientTokenBody) => {
  const { clientId, deviceInfoHash } = clientTokenBody;
  
  // Find existing client token
  let clientToken = await ClientToken.findOne({ clientId });
  
  if (clientToken) {
    // If deviceInfoHash is not already in the array, add it
    if (deviceInfoHash && !clientToken.deviceInfoHash.includes(deviceInfoHash)) {
      clientToken.deviceInfoHash.push(deviceInfoHash);
      await clientToken.save();
    }
  } else {
    // Create new client token
    clientToken = await ClientToken.create({
      clientId,
      deviceInfoHash: deviceInfoHash ? [deviceInfoHash] : []
    });
  }
  
  return clientToken;
};

module.exports = {
  upsertClientToken,
};