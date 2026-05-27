const httpStatus = require('http-status').default || require('http-status').status || require('http-status');
const ApiError = require('../../../utils/ApiError');
const { VehicleModel, Vehicle, Driver, Brand } = require('../../../models');
const { ObjectId } = require('mongoose').Types;
const { HttpStatusCode } = require('axios');

const { getClientId } = require('../../../utils/commonFunction');

/**
 * Create a vehiclemodel
 * @param {Object} vehicleModelBody
 * @returns {Promise<VehicleModel>}
 */
const createVehicleModel = async (vehicleModelBody) => {
  return VehicleModel.create(vehicleModelBody);
};

/**
 * Query for vehiclesmodel
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryVehicleModels = async (req, filter = {}, options = {}) => {
  // Get IDs and set up filter
  const clientId = await getClientId(req);
  const brandId = new ObjectId(req.params.id);

  filter.clientId = clientId;
  filter.brandId = brandId;

  // Get vehicle models with pagination
  const page = options.page || 1;
  const limit = options.limit || 10;
  const skip = (page - 1) * limit;
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

  // Query VehicleModel and populate vehicleName from Vehicle
  const docs = await VehicleModel.find(filter).populate('brandId', 'brandName').sort(sortObj).skip(skip).limit(limit).lean();

  // Move vehicleName out of vehicleId
  docs.forEach((doc) => {
    if (doc.brandId) {
      doc.vehicleName = doc.brandId.brandName; // Move vehicleName to the root level
      doc.brandid = doc.brandId._id;
      delete doc.brandId; // Optionally, remove vehicleId from the document
    }
  });

  // Get total count for pagination
  const totalResults = await VehicleModel.countDocuments(filter);
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
 * Get VehicleModels
 * @param {ObjectId} clientId
 * @returns {Promise<VehicleModel>}
 */
const getVehicleModels = async (clientId, zoneId = null) => {
  const filter = { clientId };
  return VehicleModel.find(filter);
};

/**
 * Get VehicleModel by id
 * @param {ObjectId} id
 * @returns {Promise<VehicleModel>}
 */
const getVehicleModelById = async (id) => {
  return VehicleModel.findById(id);
};

/**
 * Get VehicleModel by id
 * @param {ObjectId} vehicleId
 * @returns {Promise<VehicleModel>}
 */
const getVehicleModelByVehicleId = async (vehicleId, zoneId = null) => {
  const vehicleObjectId = vehicleId instanceof ObjectId ? vehicleId : new ObjectId(vehicleId);
  const brandFilter = { vehicleId: vehicleObjectId };

  // if (zoneId) {
  //   brandFilter.zoneId = new ObjectId(zoneId);
  // }

  const brands = await Brand.find(brandFilter).select('_id').lean();
  const brandIds = brands.map((brand) => brand._id);

  if (!brandIds.length) {
    return [];
  }

  return VehicleModel.find({ brandId: { $in: brandIds } });
};

/**
 * Update VehicleModel by id
 * @param {ObjectId} VehicleId
 * @param {Object} updateBody
 * @returns {Promise<VehicleModel>}
 */
const updateVehicleModelById = async (VehicleId, updateBody) => {
  const vehicle = await getVehicleModelById(VehicleId);
  if (!vehicle) {
    throw new ApiError(httpStatus.NOT_FOUND, 'vehicleModel not found');
  }
  Object.assign(vehicle, updateBody);
  await vehicle.save();
  return vehicle;
};

/**
 * Delete vehicle by id
 * @param {ObjectId} vehicleId
 * @returns {Object}
 */
const deleteVehicleModelById = async (vehicleId) => {
  const vehicle = await getVehicleModelById(vehicleId);
  if (!vehicle) {
    return { status: httpStatus.NOT_FOUND, msg: 'VehicleModel not found' };
  }

  // chk whether any driver has this model
  const driver = await Driver.countDocuments({ carModel: new ObjectId(vehicle._id) });
  if (driver > 0) {
    return { status: httpStatus.FORBIDDEN, msg: 'Drivers are registered under this vehicle model.so you cannot delete it.' };
  }

  await vehicle.deleteOne();
  return { status: HttpStatusCode.Ok, msg: 'Data Deleted Successfully' };
};

/**
 * Get roles
 * @param {ObjectId} clientId
 * @returns {Promise<Role>}
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

const getVehicleModelByBrandId = async (brandId) => {
  // Convert brandId to ObjectId if it's a string
  const brandObjectId = brandId instanceof ObjectId ? brandId : new ObjectId(brandId);
  return VehicleModel.find({ brandId: brandObjectId })
    .populate({
      path: 'brandId',
      select: 'brandName vehicleId',
      populate: {
        path: 'vehicleId',
        select: 'vehicleName',
      },
    })
    .lean();
};

module.exports = {
  createVehicleModel,
  queryVehicleModels,
  getVehicleModelById,
  getVehicleModels,
  updateVehicleModelById,
  deleteVehicleModelById,
  getVehicleModelByVehicleId,
  getDropDowns,
  getVehicleModelByBrandId,
};
