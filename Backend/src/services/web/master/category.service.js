const httpStatus = require('http-status');
const ApiError = require('../../../utils/ApiError');
const { Category,Vehicle } = require('../../../models');
const { HttpStatusCode } = require('axios');
const ObjectId = require('mongoose').Types.ObjectId;

const getClientId = async (req) => {
  clientId = '';
  if (!req.headers.clientid) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ClientID not found');
  } else {
    clientId = req.headers.clientid;
  }
  return clientId;
}


const getCompanyId = async (req) => {
  companyId = '';
  if (!req.headers.companyid) {
    companyId = null;
  } else {
    companyId = req.headers.companyid;
  }
  return companyId;
}

/**
 * Create a category
 * @param {Object} categoryBody
 * @returns {Promise<Category>}
 */
const createCategory = async (categoryBody) => {
  return Category.create(categoryBody);
};

/**
 * Query for Categorys
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryCategorys = async (req, filter, options) => {
  const clientId = await getClientId(req);
  const companyId = await getCompanyId(req);

  if (companyId) {
    filter.companyId = companyId;
  }

  filter.clientId = clientId;

  const limit = parseInt(options.limit, 10) || 10;
  const page = parseInt(options.page, 10) || 1;
  options.sortBy = options.sortBy || 'createdAt:desc';
  const totalResults = await Category.countDocuments(filter);

  const result = await Category.aggregate([
  //  { $match: filter }, 

    {
      $lookup: {
        from: 'zones',         
        localField: 'zoneId',   
        foreignField: '_id', 
        as: 'zoneDetails',  
      },
    },

    {
      $unwind: {
        path: '$zoneDetails',
        preserveNullAndEmptyArrays: true, 
      },
    },

    {
      $project: {
        _id: 0,              
        id: '$_id',  
        category: 1,
        categoryImage: 1,
        companyId: 1,
        status: 1,
        zoneId: 1,
        createdAt: 1,
        zoneName: '$zoneDetails.zoneName',
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
  ]);

  const totalPages = Math.ceil(totalResults / limit);
  return {
    results: result,
    page,
    limit,
    totalPages,
    totalResults,
  };
};


/**
 * Get Categorys
 * @param {ObjectId} clientId - The clientId to filter users by
 * @returns {Promise<Category>}
 */
const getCategorys = async (clientId) => {
  return Category.find({clientId:clientId});
};

/**
 * Get Category by id
 * @param {ObjectId} id
 * @returns {Promise<Category>}
 */
const getCategoryById = async (id) => {
  return Category.findById(id);
};

/**
 * Update Category by id
 * @param {ObjectId} CategoryId
 * @param {Object} updateBody
 * @returns {Promise<Category>}
 */
const updateCategoryById = async (CategoryId, updateBody) => {
  const category = await getCategoryById(CategoryId);
  if (!category) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Category not found');
  }
  Object.assign(category, updateBody);
  await category.save();
  return category;
};

/**
 * Delete category by id
 * @param {ObjectId} categoryId
 * @returns {Object}
 */
const deleteCategoryById = async (categoryId) => {
  const category = await getCategoryById(categoryId);
  if (!category) {
    return { status: httpStatus.NOT_FOUND, msg: "Category not found" };
  }

  const vehicles = await Vehicle.countDocuments({categoryId: new ObjectId(category._id)});
  if(vehicles > 0)
  {
    return { status: httpStatus.FORBIDDEN, msg: "Vehicles are available under this category.so you cannot delete it." };
  }
  await category.deleteOne();
  return { status: HttpStatusCode.Ok, msg: "Data Deleted Successfully" };
};

module.exports = {
  createCategory,
  queryCategorys,
  getCategoryById,
  getCategorys,
  updateCategoryById,
  deleteCategoryById,
};
