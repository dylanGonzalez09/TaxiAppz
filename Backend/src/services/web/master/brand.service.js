const httpStatus = require('../../../utils/httpStatus');
const ApiError = require('../../../utils/ApiError');
const { Brand, Vehicle, VehicleModel } = require('../../../models');
const { ObjectId } = require('mongoose').Types;

const getClientId = async (req) => {
  clientId = '';
  if (!req.headers.clientid) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ClientID not found');
  } else {
    clientId = req.headers.clientid;
  }
  return clientId;
};



/**
 * Create a brand
 * @param {Object} brandBody
 * @returns {Promise<Brand>}
 */
const createBrand = async (brandBody) => {
  return Brand.create(brandBody);
};

/**
 * Query for brands
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryBrands = async (req, filter = {}, options = {}) => {
  // Get IDs and set up filter
  const clientId = await getClientId(req);
  const vehicleId = new ObjectId(req.params.id);

  filter.clientId = clientId;
  filter.vehicleId = vehicleId;

  // Get brands with pagination
  const page = Math.max(1, parseInt(options.page) || 1); // Ensure page is at least 1
  const limit = Math.max(1, parseInt(options.limit) || 10); // Ensure limit is at least 1
  const skip = Math.max(0, (page - 1) * limit); // Ensure skip is never negative
  const sort = options.sortBy || '-createdAt';

  // Create sort object from string
  const sortObj = {};
  if (sort) {
    const parts = sort.split(':');
    if (parts.length > 1) {
      sortObj[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    } else {
      // Handle "-field" format
      const fieldName = sort.startsWith('-') ? sort.substring(1) : sort;
      sortObj[fieldName] = sort.startsWith('-') ? -1 : 1;
    }
  }

  // Query Brand and populate vehicleName from Vehicle
  const docs = await Brand.find(filter).populate('vehicleId', 'vehicleName').sort(sortObj).skip(skip).limit(limit).lean();

  // Move vehicleName out of vehicleId and add id field
  docs.forEach((doc) => {
    if (doc.vehicleId) {
      doc.vehicleName = doc.vehicleId.vehicleName;
      doc.vehicleid = doc.vehicleId._id;
      delete doc.vehicleId;
    }
    // Ensure id field exists for frontend
    if (doc._id && !doc.id) {
      doc.id = doc._id.toString();
    }
  });

  // Get total count for pagination
  const totalResults = await Brand.countDocuments(filter);
  const totalPages = Math.ceil(totalResults / limit);

  // Return in the same format as paginate would
  return {
    results: docs,
    page,
    limit,
    totalPages,
    totalResults,
  };
};

/**
 * Get Brands
 * @param {ObjectId} clientId
 * @returns {Promise<Brand>}
 */
const getBrands = async (clientId, zoneId = null) => {
  const filter = { clientId };
  return Brand.find(filter);
};

/**
 * Get Brand by id
 * @param {ObjectId} id
 * @returns {Promise<Brand>}
 */
const getBrandById = async (id) => {
  return Brand.findById(id);
};

/**
 * Get Brand by vehicle id
 * @param {ObjectId} vehicleId
 * @returns {Promise<Brand>}
 */
const getBrandByVehicleId = async (vehicleId, zoneId = null) => {
  // Convert vehicleId to ObjectId if it's a string
  const vehicleObjectId = vehicleId instanceof ObjectId ? vehicleId : new ObjectId(vehicleId);
  const filter = { vehicleId: vehicleObjectId };
  return Brand.find(filter);
};

/**
 * Update Brand by id
 * @param {ObjectId} brandId
 * @param {Object} updateBody
 * @returns {Promise<Brand>}
 */
const updateBrandById = async (brandId, updateBody) => {
  const brand = await getBrandById(brandId);
  if (!brand) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Brand not found');
  }
  Object.assign(brand, updateBody);
  await brand.save();
  return brand;
};

/**
 * Delete brand by id
 * @param {ObjectId} brandId
 * @returns {Object}
 */
const deleteBrandById = async (brandId) => {
  const brand = await getBrandById(brandId);
  if (!brand) {
    return { status: httpStatus.NOT_FOUND, msg: 'Brand not found' };
  }

  // Check whether any vehicle model has this brand
  const vehicleModel = await VehicleModel.countDocuments({ brandId: new ObjectId(brand._id) });
  if (vehicleModel > 0) {
    return { status: httpStatus.FORBIDDEN, msg: 'Vehicle models are registered under this brand. So you cannot delete it.' };
  }

  await brand.deleteOne();
  return { status: httpStatus.OK, msg: 'Data Deleted Successfully' };
};

/**
 * Get dropdowns
 * @param {ObjectId} clientId
 * @returns {Promise<Object>}
 */
const getDropDowns = async (clientId, zoneId = null) => {
  const filter = { clientId };
  const VehicleData = await Vehicle.find(filter);

  const updatedVehicles = VehicleData.map((vehicle) => {
    if (vehicle.image) {
      vehicle.image = `/uploads/vehicles/${vehicle.image}`;
    }
    if (vehicle.highlightImage) {
      vehicle.highlightImage = `/uploads/vehicles/${vehicle.highlightImage}`;
    }
    return vehicle;
  });

  const data = {
    vehicle: updatedVehicles,
  };

  return data;
};

module.exports = {
  createBrand,
  queryBrands,
  getBrandById,
  getBrands,
  updateBrandById,
  deleteBrandById,
  getBrandByVehicleId,
  getDropDowns,
};
