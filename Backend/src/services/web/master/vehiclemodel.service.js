const httpStatus = require('http-status');
const ApiError = require('../../../utils/ApiError');
const { VehicleModel,Vehicle,Driver } = require('../../../models');
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
  const companyId = await getCompanyId(req);
  const vehicleId = new ObjectId(req.params.id);
  
  filter.clientId = clientId;
  filter.vehicleId = vehicleId;
  if (companyId) filter.companyId = companyId;
  
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
  const docs = await VehicleModel.find(filter)
    .populate('vehicleId', 'vehicleName')  // Populate the 'vehicleName' from 'Vehicle' collection
    .sort(sortObj)
    .skip(skip)
    .limit(limit)
    .lean();  // Convert to plain JS object (useful for easier manipulation)

  // Move vehicleName out of vehicleId
  docs.forEach(doc => {
    if (doc.vehicleId) {
      doc.vehicleName = doc.vehicleId.vehicleName;  // Move vehicleName to the root level
      doc.vehicleid = doc.vehicleId._id;
      delete doc.vehicleId;  // Optionally, remove vehicleId from the document
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
    totalResults
  };
};




/**
 * Get VehicleModels
 * @param {ObjectId} clientId
 * @returns {Promise<VehicleModel>}
 */
const getVehicleModels = async (clientId) => {
  return VehicleModel.find({clientId:clientId});
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
const getVehicleModelByVehicleId = async (vehicleId) => {
  return VehicleModel.find({vehicleId : vehicleId});
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
    return { status: httpStatus.NOT_FOUND, msg: "VehicleModel not found" };
  }

  //chk whether any driver has this model
  const driver = await Driver.countDocuments({carModel: new ObjectId(vehicle._id)});
  if(driver > 0)
  {
    return { status: httpStatus.FORBIDDEN, msg: "Drivers are registered under this vehicle model.so you cannot delete it." };
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

  const VehicleData = await Vehicle.find({clientId : clientId});

  const updatedVehicles = VehicleData.map(vehicle => {
    if (vehicle.image) {
      vehicle.image = `/uploads/vehicles/${vehicle.image}`;
    }
    if (vehicle.highlightImage) {
      vehicle.highlightImage = `/uploads/vehicles/${vehicle.highlightImage}`;
    }
    return vehicle;
  });

  const data = {
    vehicle: updatedVehicles
  }

  return data;
};



module.exports = {
  createVehicleModel,
  queryVehicleModels,
  getVehicleModelById,
  getVehicleModels,
  updateVehicleModelById,
  deleteVehicleModelById,
  getVehicleModelByVehicleId,
  getDropDowns
};
