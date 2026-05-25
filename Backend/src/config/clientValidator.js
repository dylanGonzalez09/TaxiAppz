const { Client } = require('../models');
const { ApiError } = require('./errorHandler'); // Assuming ApiError is a custom error handler
const httpStatus = require('http-status');


const getClientId = async (req) => {
  let clientId = '';
    if (!req.headers.clientid) {
      throw new ApiError(httpStatus.NOT_FOUND, 'CLIENTID NOT FOUND');
    } else {
      clientId = req.headers.clientid;
    }
    return clientId;
  }


 const validateClientId = async (clientId) => {
    const clientExists = await Client.findOne({ _id: clientId });
    if (!clientExists) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'INVALID CLIENTID');
    }
  };


  module.exports = {
    getClientId,
    validateClientId
    };
  
  