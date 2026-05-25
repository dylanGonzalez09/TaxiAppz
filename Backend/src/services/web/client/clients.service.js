const httpStatus = require('http-status');
const ApiError = require('../../../utils/ApiError');
const { Client,SubScription,Role,CompanySubscription,Language } = require('../../../models');

const ObjectId = require('mongoose').Types.ObjectId

/**
 * Create a Client
 * @param {Object} clientBody
 * @returns {Promise<Client>}
 */
const createClient = async (clientBody) => {
  return Client.create(clientBody);
};
const getSuperAdminRoleAndPackage = async () => {

  const [companySubscription, roles,languages] = await Promise.all([
    CompanySubscription.find({ status: true }),
    Role.find(),
    Language.find({ status: true, clientId: null })

  ]);
  
  return { companySubscription, roles,languages };
};
/**
 * Query for clients
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryClients = async (filter, options) => {
  try {
    const limit = parseInt(options.limit, 10) || 10;
    const page = parseInt(options.page, 10) || 1;

    const totalResults = await Client.countDocuments(filter);
    options.sortBy = options.sortBy || 'createdAt:desc';

    const results = await Client.aggregate([
      { $match: filter }, // Apply filter
      {
        $lookup: {
          from: 'users', // Collection name in MongoDB
          localField: 'userId',
          foreignField: '_id',
          as: 'userDetails',
        },
      },
      {
        $unwind: {
          path: '$userDetails',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          Name:1,
          clientCode: 1,
          Startdate: 1,
          Enddate: 1,
          noOfVehicle: 1,
          noOfDrivers: 1,
          noOfUsers: 1,
          subScriptionId: 1,
          taxiModules:1,
          features:1,
          status: 1,
          createdAt: 1,
          firstName: { $ifNull: ['$userDetails.firstName', null] },
          lastName: { $ifNull: ['$userDetails.lastName', null] },
          email: { $ifNull: ['$userDetails.email', null] },
          phoneNumber:  { $ifNull: ['$userDetails.phoneNumber', null] },
          emergencyNumber:  { $ifNull: ['$userDetails.emergencyNumber', null] },
          password:  { $ifNull: ['$userDetails.password', null] },
          roleIds: { $ifNull: ['$userDetails.roleIds', null] },
          address: { $ifNull: ['$userDetails.address', null] },
          active: { $ifNull: ['$userDetails.active', null] },
        
          
        },

      },
      {
        $sort: { createdAt: -1 }, // Sorting in descending order (latest first)
      },
      {
        $skip: (page - 1) * limit, // Pagination: Skip previous pages
      },
      {
        $limit: limit, // Limit number of results per page
      },
    ])

    const totalPages = Math.ceil(totalResults / limit);

    return {
      results: results,
      page,
      limit,
      totalPages,
      totalResults,
    };
  } catch (error) {
    console.error('Error in aggregation:', error);
    throw error;
  }
};



/**
 * Get clients
 * @returns {Promise<Client>}
 */
const getClients = async () => {
  return Client.find();
};


/**
 * Get companys
 * @returns {Promise<Client>}
 */
const getClientDetails = async () => {
  try {
    const results = await Client.aggregate([
      {
        $lookup: {
          from: 'users', // Collection name in MongoDB is 'users'
          localField: 'userId',
          foreignField: '_id',
          as: 'userDetails',
        },
      },
      {
        $unwind: {
          path: '$userDetails',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          Name: 1,
          clientCode: 1,
          Startdate: 1,
          Enddate: 1,
          noOfVehicle: 1,
          subScriptionId:1,

          status: 1,
          'userDetails._id': 1,
          'userDetails.firstName': 1,
          'userDetails.lastName': 1,
          'userDetails.email': 1,
          'userDetails.phoneNumber': 1,
          'userDetails.emergencyNumber': 1,
          'userDetails.password': 1,
          'userDetails.roleIds': 1,
          'userDetails.address': 1,
          'userDetails.active': 1,
        },
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: [
              '$$ROOT',
              {
                id: '$_id',
                userId: '$userDetails._id',
                firstName: '$userDetails.firstName',
                lastName: '$userDetails.lastName',
                email: '$userDetails.email',
                phoneNumber: '$userDetails.phoneNumber',
                emergencyNumber: '$userDetails.emergencyNumber',
                password: '$userDetails.password',
                roleIds: '$userDetails.roleIds',
                address: '$userDetails.address',
                active: '$userDetails.active'
              }
            ]
          }
        }
      },
      {
        $project: {
          userDetails: 0, // Remove the original userDetails field
        },
      },
    ]);

    return results;
  } catch (error) {
    console.error('Error in aggregation:', error);
    throw error;
  }
};

/**
 * Get Driver by id
 * @param {ObjectId} clientId
 * @returns {Promise<Client>}
 */
const getClientsById = async (clientId) => {
  return Client.findById(clientId);
};

/**
 * Get Client by id
 * @param {ObjectId} id
 * @returns {Promise<Client>}
 */
const getClientById = async (id) => {
  const results = await Client.aggregate([
    {
      $match: { _id:new ObjectId(id)}, // Match the specific client ID
    },
    {
      $lookup: {
        from: 'users', // The collection to join with
        localField: 'userId', // Field in the client collection
        foreignField: '_id', // Field in the users collection
        as: 'userDetails', // Alias for the resulting array of user details
      },
    },
    {
      $unwind: {
        path: '$userDetails', // Flatten the userDetails array
        preserveNullAndEmptyArrays: true, // Keep clients even if userDetails are missing
      },
    },
    {
      $project: {
        Name: 1,
        clientCode: 1,
        Startdate: 1,
        Enddate: 1,
        noOfVehicle: 1,
        subScriptionId: 1,
        status: 1,
    
         // Include userId from client
        'userDetails._id': 1,
        'userDetails.firstName': 1,
        'userDetails.lastName': 1,
        'userDetails.email': 1,
        'userDetails.phoneNumber': 1,
        'userDetails.emergencyNumber': 1,
        'userDetails.password': 1,
        'userDetails.roleIds': 1,
        'userDetails.address': 1,
        'userDetails.active': 1,
        // Add any other user fields you want to include here
      },
    },
  ]);
  return results[0]; // Return the first result, as the client ID is unique
};

/**
 * Update client by id   
 * @param {ObjectId} clientId
 * @param {Object} updateBody
 * @returns {Promise<Client>}
 */
const updateClientById = async (clientId, updateBody) => {
  const client = await getClientsById(clientId);
  if (!client) {
    throw new ApiError(httpStatus.NOT_FOUND, 'client not found');
  }

  Object.assign(client, updateBody);
  await client.save();
  return client;
};

/**
 * Delete client by id
 * @param {ObjectId} clientId
 * @returns {Object}
 */
const deleteClientById = async (clientId) => {
  const client = await getClientsById(clientId);
  if (!client) {
    throw new ApiError(httpStatus.NOT_FOUND, 'client not found');
  }
  await client.deleteOne();
  return { status: "success", msg: "data Deleted Successfully" };
};



/**
 * Get roles
  * @param {ObjectId} clientId
 * @returns {Promise<Role>}
 */
const getDropDownsRoles = async (clientId) => {

  const roleData = await Role.find({ clientId: clientId });

  const subscriptionData = await SubScription.find({ clientId: clientId, status: true });

  const data = {
    role: roleData,
    subscription:subscriptionData
  }

  return data;
};

module.exports = {
  createClient,
  queryClients,
  getClientById,
  getClients,
  getClientsById,
  getClientDetails,
  updateClientById,
  deleteClientById,
  getDropDownsRoles,
  getSuperAdminRoleAndPackage,
};
