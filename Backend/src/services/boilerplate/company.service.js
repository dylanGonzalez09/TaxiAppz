const httpStatus = require('http-status');
const ApiError = require('../../utils/ApiError');
const { Company,Role,Country,Language } = require('../../models');
const ObjectId = require('mongoose').Types.ObjectId


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
 * Create a role
 * @param {Object} companyBody
 * @returns {Promise<Company>}
 */
const createCompany = async (companyBody) => {
  return Company.create(companyBody);
};

/**
 * Query for roles
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryCompanys = async (filter, options) => {
  const companys = await Company.paginate(filter, options);
  return companys;
};


/**
 * Get companys
 * @returns {Promise<Company>}
 */
const getCompanys = async () => {
  return Company.find();
};


/**
 * Get companys
 * @param {ObjectId} clientId - The clientId to filter users by
 * @returns {Promise<Company>}
 */
const getCompanyDetails = async (clientId) => {
  try {
    const results = await Company.aggregate([
      {
        $match: {
          clientId: new ObjectId(clientId), // Use dot notation if clientId is nested inside userDetails
        },
      },
    
      {
        $project: {
          companyName: 1,
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
 * Get companys
 * @returns {Promise<Company>}
 */
const getCompanyDetailsPagination = async (req, filter, options) => {
  try {
    const clientId = await getClientId(req);
    const limit = parseInt(options.limit, 10) || 10;
    const page = parseInt(options.page, 10) || 1;

    // First, get the total count of documents matching the criteria
    const totalResults = await Company.countDocuments({
      clientId: new ObjectId(clientId),
    });
    options.sortBy = options.sortBy || 'createdAt:desc';
    const results = await Company.aggregate([
      {
        $match: {
          clientId: new ObjectId(clientId), 
        },
      },
      {
        $lookup: {
          from: 'users',
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
          companyName: 1,
          companyCode: 1,
          alternativeNumber: 1,
          commission: 1,
          noOfVehicle: 1,
          status: 1,
          createdAt: 1,
          'userDetails._id': 1,
          'userDetails.firstName': 1,
          'userDetails.lastName': 1,
          'userDetails.email': 1,
          'userDetails.phoneNumber': 1,
          'userDetails.emergencyNumber': 1,
          'userDetails.password': 1,
          'userDetails.roleIds': 1,
          'userDetails.gender': 1,
          'userDetails.language': 1,
          'userDetails.country': 1,
          'userDetails.address': 1,
          'userDetails.active': 1,
          'userDetails.clientId': 1,
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
                gender: '$userDetails.gender',
                language: '$userDetails.language',
                country: '$userDetails.country',
                address: '$userDetails.address',
                clientId: '$userDetails.clientId',
                active: '$userDetails.active',
              },
            ],
          },
        },
      },
      {
        $project: {
          userDetails: 0,
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
    }
  } catch (error) {
    console.error('Error in aggregation:', error);
    throw error;
  }
};



/**
 * Get company by id
 * @param {ObjectId} id
 * @returns {Promise<Company>}
 */
const getCompanyById = async (id) => {
  return Company.findById(id);
};


/**
 * Update role by id
 * @param {ObjectId} companyId
 * @param {Object} updateBody
 * @returns {Promise<Company>}
 */
const updateCompanyById = async (companyId, updateBody) => {
  const company = await getCompanyById(companyId);
  if (!company) {
    throw new ApiError(httpStatus.NOT_FOUND, 'company not found');
  }

  Object.assign(company, updateBody);
  await company.save();
  return company;
};

/**
 * Delete role by id
 * @param {ObjectId} companyId
 * @returns {Object}
 */
const deleteCompanyById = async (companyId) => {
  const company = await getCompanyById(companyId);
  if (!company) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Company not found');
  }
  await company.deleteOne();
  return { status: "success", msg: "data Deleted Successfully" };
};

/**
 * Get roles
  * @param {ObjectId} clientId
 * @returns {Promise<Role>}
 */
const getDropDowns = async (clientId) => {

  const roleData = await Role.find({ clientId: clientId });

  const countryData = await Country.find({ clientId: clientId, status: true });

  const languageData = await Language.find({status: true, clientId: clientId});

  const data = {
    role: roleData,
    country: countryData,
    language: languageData
  }


  return data;
};

module.exports = {
  createCompany,
  queryCompanys,
  getCompanyById,
  getCompanys,
  getCompanyDetails,
  updateCompanyById,
  deleteCompanyById,
  getCompanyDetailsPagination,
  getDropDowns
};
