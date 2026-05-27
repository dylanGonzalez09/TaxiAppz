const httpStatus = require('http-status').default || require('http-status').status || require('http-status');
const ApiError = require('../../../utils/ApiError');
const { Vehicle, VehicleModel, Driver, ZonePrice, Request, Rental,Brand ,VehicleVariant} = require('../../../models');
const { ObjectId } = require('mongoose').Types;
const { HttpStatusCode } = require('axios');

const { getClientId } = require('../../../utils/commonFunction');

/**
 * Create a vehicle
 * @param {Object} vehicleBody
 * @returns {Promise<Vehicle>}
 */
const createVehicle = async (vehicleBody) => {
  return Vehicle.create(vehicleBody);
};

/**
 * Query for vehicles
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryVehicles = async (req, filter, options) => {
  const clientId = await getClientId(req); // Ensure clientId is set properly

  filter.clientId = clientId;

  options.sortBy = options.sortBy || 'createdAt:desc';
  const Vehicles = await Vehicle.paginate(filter, options);

  return Vehicles;
};
const queryActiveVehicles = async (req, filter, options) => {
  const clientId = await getClientId(req); // Ensure clientId is set properly

  filter.clientId = clientId;
  filter.status = true;

  options.sortBy = options.sortBy || 'createdAt:desc';
  const Vehicles = await Vehicle.paginate(filter, options);

  return Vehicles;
};

/**
 * @param {ObjectId} clientId
 * @returns {Promise<Vehicle>}
 */
const getVehicles = async (clientId, zoneId = null) => {
  const filter = {};
  filter.clientId = new ObjectId(clientId);

  return Vehicle.find(filter);
};

/*
 * Get Vehicle by id
 * @param {ObjectId} id
 * @returns {Promise<Vehicle>}
 */
const getVehicleById = async (id) => {
  return Vehicle.findById(id);
};

/**
 * Update Vehicle by id
 * @param {ObjectId} VehicleId
 * @param {Object} updateBody
 * @returns {Promise<Vehicle>}
 */
const updateVehicleById = async (vehicleId, updateBody) => {
  const vehicle = await getVehicleById(vehicleId);

  if (!vehicle) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Vehicle not found');
  }

  Object.assign(vehicle, updateBody);
  await vehicle.save();

  if (typeof updateBody.status === 'boolean') {
    const status = updateBody.status;

    await Brand.updateMany(
      { vehicleId: vehicle._id },
      { $set: { status } }
    );

    const brandIds = await Brand.distinct('_id', {
      vehicleId: vehicle._id,
    });

    await VehicleModel.updateMany(
      { brandId: { $in: brandIds } },
      { $set: { status } }
    );

    const modelIds = await VehicleModel.distinct('_id', {
      brandId: { $in: brandIds },
    });

    await VehicleVariant.updateMany(
      { vehicleModelId: { $in: modelIds } }, 
      { $set: { status } }
    );
  }

  return vehicle;
};

// const updateVehicleById = async (VehicleId, updateBody) => {
//   const vehicle = await getVehicleById(VehicleId);
//   if (!vehicle) {
//     throw new ApiError(httpStatus.NOT_FOUND, 'vehicle not found');
//   }     
//   Object.assign(vehicle, updateBody);
//   await vehicle.save();
//   return vehicle;
// };

/**
 * Delete vehicle by id
 * @param {ObjectId} vehicleId
 * @returns {Object}
 */
const deleteVehicleById = async (vehicleId) => {
  const vehicle = await getVehicleById(vehicleId);
  if (!vehicle) {
    return { status: httpStatus.NOT_FOUND, msg: 'Vehicle not found' };
  }

  // chk whether this vehicle has any model
  const model = await VehicleModel.countDocuments({ vehicleId: new ObjectId(vehicle._id) });
  if (model > 0) {
    return { status: httpStatus.FORBIDDEN, msg: 'Vehicle models are available under this vehicle.so you cannot delete it.' };
  }

  // chk whether any driver available in this vehicle
  const driver = await Driver.countDocuments({ type: new ObjectId(vehicle._id) });
  if (driver > 0) {
    return { status: httpStatus.FORBIDDEN, msg: 'Drivers are registered under this vehicle.so you cannot delete it.' };
  }

  // chk whether vehicle has zone price
  const zonePrice = await ZonePrice.countDocuments({ vehicleId: new ObjectId(vehicle._id) });
  if (zonePrice > 0) {
    return { status: httpStatus.FORBIDDEN, msg: 'This vehicle is available in some zone.so you cannot delete it.' };
  }

  // chk whether vehicle has package price
  const packagePrice = await Rental.countDocuments({ 'vehiclePrices.vehicleId': new ObjectId(vehicle._id) });
  if (packagePrice > 0) {
    return {
      status: httpStatus.FORBIDDEN,
      msg: 'This vehicle is available in some rental packages.so you cannot delete it.',
    };
  }

  // chk whether any request exists under this vehicle
  const request = await Request.countDocuments({ vehicleId: new ObjectId(vehicle._id) });
  if (request > 0) {
    return { status: httpStatus.FORBIDDEN, msg: 'Sorry!. Already have a trip in this vehicle.so you cannot delete it...' };
  }

  await vehicle.deleteOne();
  return { status: HttpStatusCode.Ok, msg: 'Data Deleted Successfully' };
};

/**
 * Get roles
 * @param {ObjectId} clientId
 * @returns {Promise<Role>}
 */
const getDropDowns = async (clientId) => {
  const categoryData = await Category.find({ status: true, clientId });

  const data = {
    category: categoryData,
  };
  return data;
};

const getVehiclesByZoneId = async (zoneId, clientId) => {
  const zonePrices = await ZonePrice.find({ zoneId, clientId, status: true }).select('vehicleId');

  const vehicleIds = [...new Set(zonePrices.map((zp) => zp.vehicleId))];

  const vehicles = await Vehicle.find({
    _id: { $in: vehicleIds },
    clientId,
    // zoneId: new ObjectId(zoneId),
    status: true,
  }).sort({ sortingorder: 1 });

  // Format the vehicle data
  const vehiclesWithSpecialPrice = vehicles.map((vehicle) => {
    const v = vehicle.toObject();

    return {
      _id: v._id.toString(),
      vehicleName: v.vehicleName,
      image: v.image,
      capacity: v.capacity,
      serviceType: v.serviceType,
      categoryId: v.categoryId,
      sortingorder: v.sortingorder,
      highlightImage: v.highlightImage,
      status: v.status,
      clientId: v.clientId,
      // zoneId: v.zoneId,
      specialPrice: false,
    };
  });

  return vehiclesWithSpecialPrice;
};

module.exports = {
  createVehicle,
  queryVehicles,
  getVehicleById,
  getVehicles,
  updateVehicleById,
  deleteVehicleById,
  getDropDowns,
  getVehiclesByZoneId,
  queryActiveVehicles,
};
