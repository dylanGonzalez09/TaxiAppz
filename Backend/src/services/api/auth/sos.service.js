const httpStatus = require('http-status');
const ApiError = require('../../../utils/ApiError');
const { Sos } = require('../../../models');
const { tokenService } = require('../../../services');
const ObjectId = require('mongoose').Types.ObjectId

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



const getUserId = async (req) => {
  let userId = '';
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(httpStatus.UNAUTHORIZED).send({ message: 'Authorization header is missing or invalid' });
    return;
  }
  // Remove the 'Bearer ' prefix and get the token
  const token = authHeader.substring(7);
  const user = await tokenService.verifyTokenAndGetUser(token);
  userId = user.id
  return userId;
}



/**
 * Create a wallet
 * @param {Object} req
 * @returns {Promise<Sos>}
 */
const createSos = async (req) => {
  req.body.userId = await getUserId(req)
  req.body.clientId = await getClientId(req);
  return Sos.create(req.body);
};

/**
 * Query for wallets
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {Object} req
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const querySoss = async (filter, options, req) => {
  // Get the clientId from request
  const clientId = await getClientId(req);

  // Add clientId to the filter
  if (clientId) {
    filter.clientId = clientId;
  }

  const sos = await Sos.paginate(filter, options);
  return sos;
};


/**
 * Get wallets
 * @returns {Promise<Sos>}
 */
const getSoss = async (req) => {
  let clientId = await getClientId(req);
  let userId = await getUserId(req)
  return Sos.find({ clientId: new ObjectId(clientId) , userId: new ObjectId(userId) });
};


/**
 * Get wallet by id
 * @param {ObjectId} id
 * @returns {Promise<Sos>}
 */
const getSosById = async (id) => {
  return Sos.findById(id);
};


/**
 * Update Sos by id
 * @param {ObjectId} sosId
 * @param {Object} updateBody
 * @returns {Promise<Sos>}
 */
const updateSosById = async (sosId, updateBody) => {
  const sos = await getSosById(sosId);
  if (!sos) {
    throw new ApiError(httpStatus.NOT_FOUND, 'sos not found');
  }

  Object.assign(sos, updateBody);
  await sos.save();
  return sos;
};

/**
 * Delete sos by id
 * @param {ObjectId} sosId
 * @returns {Object}
 */
const deleteSosById = async (sosId) => {
  const sos = await getSosById(sosId);
  if (!sos) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Sos not found');
  }
  await sos.deleteOne();
  return { status: "success", msg: "data Deleted Successfully" };
};

module.exports = {
  createSos,
  querySoss,
  getSosById,
  getSoss,
  updateSosById,
  deleteSosById,
};
