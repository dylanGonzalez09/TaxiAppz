const httpStatus = require('http-status').default || require('http-status').status || require('http-status');
const dotenv = require('dotenv');
const pick = require('../../utils/pick');
const ApiError = require('../../utils/ApiError');
const {} = require('../../utils/errorHandler');

const catchAsync = require('../../utils/catchAsync');
const { dispatcherService, userService } = require('../../services');
const Response = require('../../config/response');

dotenv.config({ quiet: true }); // Load environment variables

// Create a dispatcher
const createDispatcher = catchAsync(async (req, res, next) => {
  try {
    if (!req.headers.clientid) {
      throw new ApiError(httpStatus.NOT_FOUND, 'ClientID not found');
    }

    let imageFile = '';

    if (req.file && req.file.filename) {
      imageFile = req.file.filename;
    }

    const userData = {
      firstName: req.body.firstName || '',
      lastName: req.body.lastName || '',
      email: req.body.email || '',
      phoneNumber: req.body.phoneNumber || '',
      password: req.body.password || '',
      roleIds: req.body.roleIds,
      language: req.body.language,
      profilePic: imageFile || null,
      clientId: req.headers.clientid,
    };
    let user;

    try {
      user = await userService.createUser(userData);
    } catch (error) {
      return handleMongoError(error, next); // Use next to handle async errors
    }
    const dispatcherData = {
      location: req.body.location || '',
      serviceType: req.body.serviceType || '',
      clientId: req.headers.clientid,
      zoneId: req.body.zoneId,
      userId: user.id,
    };

    const newDispatcher = await dispatcherService.createDispatcher(dispatcherData);

    newDispatcher.profilePic = imageFile;

    const response = Response(true, userData, 'Dispatcher created successfully');
    res.status(httpStatus.CREATED).send(response);
  } catch (error) {
    return handleMongoError(error, next);
  }
});

const updateDispatcher = catchAsync(async (req, res) => {
  if (!req.headers.clientid) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ClientID not found');
  }

  const { dispatcherId } = req.params;
  const dispatchers = await dispatcherService.getDispatcherUserById(dispatcherId);

  if (!dispatchers) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Dispatcher not found');
  }

  let imageFile = '';

  if (req.file && req.file.filename) {
    imageFile = req.file.filename;
  }

  const dispatcher = dispatchers[0];

  // Prepare the updated user data
  const userData = {
    firstName: req.body.firstName || dispatcher.firstName,
    lastName: req.body.lastName || dispatcher.lastName,
    email: req.body.email || dispatcher.email,
    phoneNumber: req.body.phoneNumber || dispatcher.phoneNumber,
    language: req.body.language || dispatcher.language,
    profilePic: imageFile || dispatcher.image,
  };

  // Prepare the updated dispatcher data
  const dispatcherData = {
    location: req.body.location || dispatcher.location,
    serviceType: req.body.serviceType || dispatcher.serviceType,
    zoneId: req.body.zoneId || dispatcher.zoneId,
  };

  // Update user data
  const updatedUser = await userService.updateUserById(dispatcher.userId, userData);

  // Update dispatcher data
  const updatedDispatcher = await dispatcherService.updateDispatcherById(dispatcherId, dispatcherData);

  const response = Response(true, updatedUser, 'Dispatcher updated successfully');
  res.status(httpStatus.OK).send(response);
});

// Get all dispatchers with pagination
const getDispatchers = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await dispatcherService.queryDispatchers(filter, options);
  const response = Response(true, result, 'Dispatchers retrieved successfully');
  res.status(httpStatus.OK).send(response);
});

const getDispatchersWithOutPagination = catchAsync(async (req, res) => {
  if (!req.headers.clientid) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ClientID not found');
  }
  const dispatcher = await dispatcherService.aggregateDispatchers(req.headers.clientid);
  if (!dispatcher) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Dispatcher not found');
  }
  const response = Response(true, dispatcher, 'Success');
  res.status(httpStatus.OK).send(response);
});
// Get a single dispatcher by ID
const getDispatcher = catchAsync(async (req, res) => {
  const dispatcher = await dispatcherService.getDispatcherById(req.params.dispatcherId);
  if (!dispatcher) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Dispatcher not found');
  }
  const response = Response(true, dispatcher, 'Dispatcher retrieved successfully');
  res.status(httpStatus.OK).send(response);
});

// Delete a dispatcher
const deleteDispatcher = catchAsync(async (req, res) => {
  const dispatcher = await dispatcherService.deleteDispatcherById(req.params.dispatcherId);
  const response = Response(true, dispatcher, 'Dispatcher deleted successfully');
  res.status(httpStatus.OK).send(response);
});

// Update active status of a dispatcher
const updateActiveStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // Ensure 'status' is a boolean
  if (typeof status !== 'boolean') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Active status must be a boolean');
  }

  // Update the dispatcher’s active status
  const dispatcher = await dispatcherService.updateDispatcherById(id, { status });

  // Check if the dispatcher was found and updated
  if (!dispatcher) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Dispatcher not found');
  }

  // Update the user’s active status based on the dispatcher’s userId
  const user = await userService.updateUserById(dispatcher.userId, { active: status });

  const response = Response(true, user, 'User active status updated successfully');
  res.status(httpStatus.OK).send(response);
});

const getDispatcherPagination = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await dispatcherService.getDispatcherPagination(req, filter, options);
  const response = Response(true, result, 'Success');

  res.status(httpStatus.OK).send(response);
});

const getDropDownList = catchAsync(async (req, res) => {
  const data = await dispatcherService.getDropDowns(req.params.clientId);

  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, 'data not found');
  }

  const response = Response(true, data, 'Success');
  res.status(httpStatus.OK).send(response);
});

module.exports = {
  createDispatcher,
  getDispatchers,
  getDispatcher,
  deleteDispatcher,
  updateActiveStatus,
  updateDispatcher,
  getDispatchersWithOutPagination,
  getDispatcherPagination,
  getDropDownList,
};
