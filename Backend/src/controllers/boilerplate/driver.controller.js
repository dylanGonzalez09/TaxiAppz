const httpStatus = require('http-status').default || require('http-status').status || require('http-status');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const pick = require('../../utils/pick');
const ApiError = require('../../utils/ApiError');
const catchAsync = require('../../utils/catchAsync');
const { driverService, vehicleService } = require('../../services');
const { userService } = require('../../services');
const { handleMongoError } = require('../../utils/errorHandler');

const Response = require('../../config/response');
const { userUpload } = require('../../middlewares/upload');
const { Driver } = require('../../models');

dotenv.config({ quiet: true }); // Load environment variables

// Create a driver with an image
const createDriver = catchAsync(async (req, res, next) => {
  const clientId = req.headers.clientid;
  if (!clientId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'ClientID not found');
  }

  const userData = {
    firstName: req.body.firstName || '',
    lastName: req.body.lastName || '',
    email: req.body.email || null,
    phoneNumber: req.body.phoneNumber || '',
    roleIds: req.body.roleIds || [],
    address: req.body.address || '',
    regDate: req.body.regDate || '',
    regTime: req.body.regTime || '',
    active: req.body.active !== undefined ? req.body.active : true,
    countryCode: req.body.country || '',
    referralCode: req.body.referralCode || null,
    zoneId: req.body.serviceLocation || '',
    clientId,
  };

  const driverData = {
    city: req.body.city || '',
    state: req.body.state || '',
    pincode: req.body.pincode || '',
    type: req.body.type || null,
    carNumber: req.body.licensePlateNumber || '',
    notes: req.body.notes || '',
    serviceCategory: 'individual',
    serviceLocation: req.body.serviceLocation || '',
    serviceType: req.body.serviceType || '',
    carModel: req.body.carModel || null,
    vehicleBrand: req.body.vehicleBrand || null,
    vehicleVariant: req.body.vehicleVariant || null,
    clientId,
    specialPrice: req.body.specialPrice === 'true' || false,
    secondaryZone: req.body.secondaryZone || [],
    carColour: req.body.carColour || '',
  };

  userUpload.single('profilePic')(req, res, async (err) => {
    const driverImage = req.file ? req.file.filename : '';

    if (driverImage) {
      userData.profilePic = driverImage;
    }

    let user;
    try {
      user = await userService.createUser(userData);
    } catch (error) {
      return handleMongoError(error, next); // Use next to handle async errors
    }
    if (user) {
      driverData.userId = user.id;
    }

    try {
      const newDriver = await driverService.createDriver(driverData);

      if (!newDriver) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to create driver');
      }

      const response = Response(true, newDriver, 'Driver created successfully');
      return res.status(httpStatus.CREATED).send(response); // Send the response
    } catch (error) {
      return handleMongoError(error, next);
    }
  });
});

// Get all drivers with pagination
const getDrivers = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await driverService.queryDrivers(filter, options);
  const response = Response(true, result, 'Drivers retrieved successfully');
  res.status(httpStatus.OK).send(response);
});

// Get a single driver by ID
const getDriver = catchAsync(async (req, res) => {
  const driver = await driverService.getDriversById(req.params.driverId);
  if (!driver) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Driver not found');
  }
  const response = Response(true, driver, 'Driver retrieved successfully');
  res.status(httpStatus.OK).send(response);
});

// Get all drivers without pagination
const getDriverWithoutPagination = catchAsync(async (req, res) => {
  const drivers = await driverService.getDrivers();
  if (!drivers) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Drivers not found');
  }
  const response = Response(true, drivers, 'Drivers retrieved successfully');
  res.status(httpStatus.OK).send(response);
});

// Update a driver
const updateDriver = catchAsync(async (req, res) => {
  // Fetch existing driver
  const existingDriver = await driverService.getDriversById(req.params.driverId);
  const driver = existingDriver[0];

  if (!driver) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Driver not found');
  }

  const existingUser = await userService.getUserById(driver.userId);
  const user = existingUser;

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  const userData = {
    firstName: req.body.firstName || user.firstName,
    lastName: req.body.lastName || user.lastName,
    email: req.body.email || user.email,
    phoneNumber: req.body.phoneNumber || user.phoneNumber,
    roleIds: req.body.roleIds || user.roleIds || '',
    gender: req.body.gender || user.gender || '',
    // language: req.body.language || user.language || "",
    // countryCode: req.body.countryCode || user.countryCode || "",
    address: req.body.address || user.address || '',
    active: req.body.active !== undefined ? req.body.active : true,
    countryCode: req.body.country || user.countryCode || '',
    referralCode: req.body.referralCode || user.referralCode || '',
    zoneId: req.body.serviceLocation || user.zoneId || '',
  };

  const driverData = {
    userId: user._id,
    city: req.body.city || driver.city,
    state: req.body.state || driver.state,
    pincode: req.body.pincode || driver.pincode,
    type: req.body.type || driver.type,
    carNumber: req.body.licensePlateNumber || driver.licensePlateNumber,
    serviceLocation: req.body.serviceLocation || driver.serviceLocation,
    notes: req.body.notes || driver.notes,
    serviceCategory: req.body.serviceCategory || driver.serviceCategory,
    serviceType: req.body.serviceType || driver.serviceType,
    vehicleBrand: req.body.vehicleBrand || driver.vehicleBrand || null,
    vehicleVariant: req.body.vehicleVariant || driver.vehicleVariant || null,
    specialPrice: req.body.specialPrice === 'true' || driver.specialPrice || false,
    secondaryZone: req.body.secondaryZone || driver.secondaryZone || [],
    carColour: req.body.carColour || driver.carColour || '',
  };

  if (req.body.carModel) {
    driverData.carModel = req.body.carModel || '';
  }

  // Update user
  await userService.updateUserById(existingUser.id, userData);

  // Update driver
  const updatedDriver = await driverService.updateDriversById(req.params.driverId, driverData);

  const response = Response(true, updatedDriver, 'Driver updated successfully');
  res.status(httpStatus.OK).send(response);
  // userUpload.single('profilePic')(req, res, async (err) => {

  //   const driverImage = req.file ? req.file.filename : '';

  //   if (driverImage) {
  //     if (userData.profilePic) {
  //       const oldImagePath = path.join(__dirname, '../../uploads/user/', userData.profilePic);
  //       if (fs.existsSync(oldImagePath)) {
  //         fs.unlinkSync(oldImagePath);
  //       }
  //     }
  //     userData.profilePic = driverImage;
  //   }

  // });
});

// Delete a driver
const deleteDriver = catchAsync(async (req, res) => {
  const driver = await driverService.deleteDriverById(req.params.driverId);
  const response = Response(true, driver, 'Driver deleted successfully');
  res.status(httpStatus.OK).send(response);
});

// aggregation
const aggregateDrivers = catchAsync(async (req, res) => {
  const clientId = req.headers.clientid;
  const zoneId = req.headers.zoneid;

  // Basic validation for presence
  if (!clientId || !zoneId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Missing clientId or zoneId in headers');
  }

  const filter = pick(req.query, ['firstName', 'phoneNumber']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);

  // You may want to pass clientId and zoneId to the service for filtering or logic
  const drivers = await driverService.aggregateDrivers(req, filter, options, clientId, zoneId);

  if (!drivers) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Drivers not found');
  }
  const response = Response(true, drivers, 'Drivers retrieved successfully');
  res.status(httpStatus.OK).send(response);
});

const getVehiclesByZoneWithoutPagination = catchAsync(async (req, res) => {
  const { zoneId } = req.params;

  if (!req.headers.clientid) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ClientID not found');
  }

  const vehicles = await vehicleService.getVehiclesByZoneId(zoneId, req.headers.clientid);
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

const updateActiveStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // Ensure 'status' is a boolean
  if (typeof status !== 'boolean') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Active status must be a boolean');
  }

  const driver = await driverService.updateDriversStatus(req, id, { status });

  // if (!driver) {
  //   throw new ApiError(httpStatus.NOT_FOUND, 'Driver not found');
  // }

  // const user = await userService.updateUserById(driver.userId, { active: status });

  // // Create a response indicating success and return it to the client
  // const response = Response(true, user, 'User active status updated successfully');
  const response = Response(true, driver, 'User status updated successfully');
  res.status(httpStatus.OK).send(response);
});

const getDropDownList = catchAsync(async (req, res) => {
  const data = await driverService.getDropDowns(req.params.clientId);

  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, 'data not found');
  }
  const response = Response(true, data, 'Success');
  res.status(httpStatus.OK).send(response);
});

const getDriverWallet = async (req, res) => {
  try {
    const zoneId = req.headers.zoneid;
    const clientId = req.headers.clientid;

    // const clientId = req.headers.clientid;

    if (!zoneId || !clientId) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Missing zoneId or clientId in headers');
    }
    const driverDetails = await driverService.getDriverWallet(zoneId, clientId);
    const response = Response(true, driverDetails, 'Success');
    res.status(httpStatus.OK).json(response);
  } catch (error) {
    console.error('Error fetching driver wallet details:', error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error' });
  }
};
const getDriverReport = async (req, res) => {
  try {
    const zoneId = req.headers.zoneid;
    const clientId = req.headers.clientid;

    if (!zoneId || !clientId) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Missing zoneId or clientId in headers');
    }

    const filter = pick(req.query, ['search']);
    const options = pick(req.query, ['sortBy', 'limit', 'page']);
    const driverDetails = await driverService.getDriverReport(req, filter, options, zoneId, clientId);
    const response = Response(true, driverDetails, 'Success');
    res.status(httpStatus.OK).json(response);
  } catch (error) {
    console.error('Error fetching driver report:', error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error' });
  }
};

const getZones = catchAsync(async (req, res) => {
  const zoneId = req.headers.zoneid;
  const clientId = req.headers.clientid;

  if (!zoneId || !clientId) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Missing zoneId or clientId in headers');
  }
  const result = await driverService.getZones(clientId, zoneId);
  const response = Response(true, result, 'Success');
  res.status(httpStatus.OK).send(response);
});

const getDriverByZone = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);

  const result = await driverService.getDriverByZone(req, filter, options);
  const response = Response(true, result, 'Success');
  res.status(httpStatus.OK).send(response);
});

module.exports = {
  createDriver,
  getDrivers,
  getDriver,
  getDriverWithoutPagination,
  updateDriver,
  deleteDriver,
  aggregateDrivers,
  updateActiveStatus,
  getDropDownList,
  getDriverWallet,
  getDriverReport,
  getVehiclesByZoneWithoutPagination,
  getZones,
  getDriverByZone,
};
