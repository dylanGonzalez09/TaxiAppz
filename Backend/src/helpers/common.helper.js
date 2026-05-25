const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { Role } = require('../models');

/**
 * Create a role
 * @param {Object} roleBody
 * @returns {Promise<Role>}
 */
const getZone = async (roleBody) => {
  return Role.create(roleBody);
};

module.exports = {
    getZone
};
