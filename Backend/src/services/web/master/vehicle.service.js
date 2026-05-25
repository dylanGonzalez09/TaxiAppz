const httpStatus = require('http-status');
const ApiError = require('../../../utils/ApiError');
const { Vehicle, Category,VehicleModel,Driver,ZonePrice,Request,Rental } = require('../../../models');
const ObjectId = require('mongoose').Types.ObjectId;
const { HttpStatusCode } = require('axios');

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
const queryVehicles = async (req,filter, options) => {

  const clientId = await getClientId(req); // Ensure clientId is set properly

  const companyId = await getCompanyId(req); // Ensure clientId is set properly

  if(companyId){
    filter.companyId = companyId; 
  }

  filter.clientId = clientId;
  
  options.sortBy = options.sortBy || 'sortingorder:1';
  const Vehicles = await Vehicle.paginate(filter, options);

  return Vehicles;
};

/**
 * @param {ObjectId} clientId
 * @returns {Promise<Vehicle>}
 */
const getVehicles = async (clientId) => {
  return Vehicle.find({clientId : clientId});
};



// In your zonePrice.service.js file
const getVehiclesByZoneId = async (zoneId, clientId) => {
  // Find all zonePrice documents for the given zoneId
  const zonePrices = await ZonePrice.find({ zoneId }).select('vehicleId');

  
  // Extract unique vehicleIds
  const vehicleIds = [...new Set(zonePrices.map(zp => zp.vehicleId))];
  
  // Get vehicle details for these vehicleIds
  const vehicles = await Vehicle.find({ 
    _id: { $in: vehicleIds },
    clientId 
  }).sort({ sortingorder: 1 });
  
  return vehicles;
};



/**
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
const updateVehicleById = async (VehicleId, updateBody) => {
  const vehicle = await getVehicleById(VehicleId);
  if (!vehicle) {
    throw new ApiError(httpStatus.NOT_FOUND, 'vehicle not found');
  }

  if(updateBody.sortingorder)
  {
    //chk whether any other vehicle has same order and update it
    const vehicleOrder = await Vehicle.findOne({sortingorder: updateBody.sortingorder});

    if(vehicleOrder)
    {
      vehicleOrder.sortingorder = vehicle.sortingorder;
      vehicleOrder.save();
    }
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
const deleteVehicleById = async (vehicleId) => {
  const vehicle = await getVehicleById(vehicleId);
  if (!vehicle) {
    return { status: httpStatus.NOT_FOUND, msg: "Vehicle not found" };
  }

  //chk whether this vehicle has any model
  const model = await VehicleModel.countDocuments({vehicleId: new ObjectId(vehicle._id)});
  if(model > 0)
  {
    return { status: httpStatus.FORBIDDEN, msg: "Vehicle models are available under this vehicle.so you cannot delete it." };
  }

  //chk whether any driver available in this vehicle
  const driver = await Driver.countDocuments({type: new ObjectId(vehicle._id)});
  if(driver > 0)
  {
    return { status: httpStatus.FORBIDDEN, msg: "Drivers are registered under this vehicle.so you cannot delete it." };
  }

  // chk whether vehicle has zone price
  const zonePrice = await ZonePrice.countDocuments({vehicleId: new ObjectId(vehicle._id)});
  if(zonePrice > 0)
  {
    return { status: httpStatus.FORBIDDEN, msg: "This vehicle is available in some zone.so you cannot delete it." };
  }

  //chk whether vehicle has package price
  const packagePrice = await Rental.countDocuments({'vehiclePrices.vehicleId':new ObjectId(vehicle._id)});
  if(packagePrice > 0)
  {
    return { status: httpStatus.FORBIDDEN, msg: "This vehicle is available in some rental packages.so you cannot delete it." };
  }

  //chk whether any request exists under this vehicle
  const request = await Request.countDocuments({ vehicleId: new ObjectId(vehicle._id)});
  if(request > 0)
  {
    return { status: httpStatus.FORBIDDEN, msg: "Sorry!. Already have a trip in this vehicle.so you cannot delete it..." };
  }

  await vehicle.deleteOne();
  return { status: HttpStatusCode.Ok, msg: "Data Deleted Successfully" };
};

/**
 * Get roles
  * @param {ObjectId} clientId
 * @returns {Promise<Role>}
 */
const getDropDowns = async (clientId) => {

  const categoryData = await Category.find({status: true, clientId: clientId});

  const data = {
    category: categoryData,
   
  }
  return data;
};

module.exports = {
  createVehicle,
  queryVehicles,
  getVehicleById,
  getVehicles,
  updateVehicleById,
  deleteVehicleById,
  getDropDowns,
  getVehiclesByZoneId
};
