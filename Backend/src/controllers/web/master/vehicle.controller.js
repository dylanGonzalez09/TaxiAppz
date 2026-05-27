const httpStatus = require('http-status').default || require('http-status').status || require('http-status');
const dotenv = require('dotenv');
const pick = require('../../../utils/pick');
const ApiError = require('../../../utils/ApiError');
const catchAsync = require('../../../utils/catchAsync');
const { vehicleService } = require('../../../services');
const Response = require('../../../config/response');

dotenv.config({ quiet: true });

const createVehicle = catchAsync(async (req, res) => {
  let clientId;

  if (!req.headers.clientid) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ClientID not found');
  } else {
    clientId = req.headers.clientid;
  }

  if (!req.files || !req.files.image || !req.files.highlightImage) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Image files are required');
  }

  const image = req.files.image[0].filename;
  const highlightImage = req.files.highlightImage[0].filename;

  const vehicleData = {
    ...req.body,
    image: `${image}`,
    highlightImage: `${highlightImage}`,
    clientId,
  };

  const vehicle = await vehicleService.createVehicle(vehicleData);
  // if (vehicle && vehicle.image) {
  //   vehicle.image = `/uploads/vehicles/${vehicle.image}`;
  // }
  // if (vehicle && vehicle.highlightImage) {
  //   vehicle.highlightImage = `/uploads/vehicles/${vehicle.highlightImage}`;
  // }
  const response = Response(true, vehicle, 'Vehicle created successfully');
  res.status(httpStatus.CREATED).send(response);
});

// Get all vehicles with pagination
const getVehicles = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['vehicleName', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page'], { allowDiskUse: true });
  if (req.query.search) {
    filter.$or = [{ vehicleName: { $regex: req.query.search, $options: 'i' } }];

    // Check if the search term is a valid number
    const searchNumber = parseFloat(req.query.search);
    if (!isNaN(searchNumber)) {
      filter.$or.push({ capacity: searchNumber });
    }
  }

  const result = await vehicleService.queryVehicles(req, filter, options);
  const response = Response(true, result, 'Vehicles retrieved successfully');
  res.status(httpStatus.OK).send(response);
});

const getActiveVehicles = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['vehicleName', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page'], { allowDiskUse: true });
  if (req.query.search) {
    filter.$or = [{ vehicleName: { $regex: req.query.search, $options: 'i' } }];

    // Check if the search term is a valid number
    const searchNumber = parseFloat(req.query.search);
    if (!isNaN(searchNumber)) {
      filter.$or.push({ capacity: searchNumber });
    }
  }

  const result = await vehicleService.queryActiveVehicles(req, filter, options);
  const response = Response(true, result, 'Vehicles retrieved successfully');
  res.status(httpStatus.OK).send(response);
});

// Get a single vehicle by ID
const getVehicle = catchAsync(async (req, res) => {
  const vehicle = await vehicleService.getVehicleById(req.params.vehicleId);
  if (!vehicle) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Vehicle not found');
  }

  if (vehicle && vehicle.image) {
    vehicle.image = `/uploads/vehicles/${vehicle.image}`;
  }
  if (vehicle && vehicle.highlightImage) {
    vehicle.highlightImage = `/uploads/vehicles/${vehicle.highlightImage}`;
  }
  const response = Response(true, vehicle, 'Vehicle retrieved successfully');
  res.status(httpStatus.OK).send(response);
});

// Get all vehicles without pagination
const getVehiclesWithoutPagination = catchAsync(async (req, res) => {
  if (!req.headers.clientid) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ClientID not found');
  }

 

  const clientId = req.headers.clientid;

  const vehicles = await vehicleService.getVehicles(clientId);
  if (!vehicles) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Vehicles not found');
  }

  const updatedVehicles = vehicles.map((vehicle) => {
    if (vehicle.image) {
      vehicle.image = `/uploads/vehicles/${vehicle.image}`;
    }
    if (vehicle.highlightImage) {
      vehicle.highlightImage = `/uploads/vehicles/${vehicle.highlightImage}`;
    }
    return vehicle;
  });

  const response = Response(true, updatedVehicles, 'Vehicles retrieved successfully');
  res.status(httpStatus.OK).send(response);
});

// Update a vehicle
const updateVehicle = catchAsync(async (req, res) => {
  const { vehicleId } = req.params;
  const updateData = req.body;

  if (req.files) {
    if (req.files.image) {
      updateData.image = `${req.files.image[0].filename}`;
    }
    if (req.files.highlightImage) {
      updateData.highlightImage = `${req.files.highlightImage[0].filename}`;
    }
  }

  const vehicle = await vehicleService.updateVehicleById(vehicleId, updateData);
  // if (vehicle && vehicle.image) {
  //   vehicle.image = `/uploads/vehicles/${vehicle.image}`;
  // }
  // if (vehicle && vehicle.highlightImage) {
  //   vehicle.highlightImage = `/uploads/vehicles/${vehicle.highlightImage}`;
  // }
  const response = Response(true, vehicle, 'Vehicle updated successfully');
  res.status(httpStatus.OK).send(response);
});

// Delete a vehicle
const deleteVehicle = catchAsync(async (req, res) => {
  const vehicle = await vehicleService.deleteVehicleById(req.params.vehicleId);
  const response = Response(true, vehicle, 'VehicleModel deleted successfully');
  res.status(httpStatus.OK).send(response);
});

const updateVehicleStatus = catchAsync(async (req, res) => {
  const { vehicleId } = req.params;
  const { status } = req.body;

  const vehicle = await vehicleService.updateVehicleById(vehicleId, { status });

  if (!vehicle) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Vehicle not found');
  }

  const response = Response(true, vehicle, 'Vehicle status updated successfully');
  res.status(httpStatus.OK).send(response);
});

const getDropDownList = catchAsync(async (req, res) => {
  const data = await vehicleService.getDropDowns(req.params.clientId);

  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, 'data not found');
  }
  const response = Response(true, data, 'Success');
  res.status(httpStatus.OK).send(response);
});

module.exports = {
  createVehicle,
  getVehicles,
  getVehicle,
  getVehiclesWithoutPagination,
  updateVehicle,
  deleteVehicle,
  updateVehicleStatus,
  getDropDownList,
  getActiveVehicles,
};
