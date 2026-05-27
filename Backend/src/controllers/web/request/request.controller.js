const httpStatus = require('http-status').default || require('http-status').status || require('http-status');
const pick = require('../../../utils/pick');
const ApiError = require('../../../utils/ApiError');
const catchAsync = require('../../../utils/catchAsync');
const { requestService, tokenService } = require('../../../services');
const Response = require('../../../config/response');
const { getAllZoneIdsFromPrimary } = require('../../../utils/zoneUtils');

const { User, Driver, Message } = require('../../../models');

const { getByTotalEarnings } = require('../../../services/web/request/request.service');

const { getUserId, getClientId, getDriverId } = require('../../../utils/commonFunction');

const createRequest = catchAsync(async (req, res) => {
  if (!req.headers.clientid) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ClientID not found');
  } else {
    req.body.clientId = req.headers.clientid;
  }

  const request = await requestService.createRequest(req.body);
  const response = Response(true, request, 'Request created successfully');
  res.status(httpStatus.CREATED).send(response);
});

const createRequestPlace = catchAsync(async (req, res) => {
  if (!req.headers.clientid) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ClientID not found');
  } else {
    req.body.clientId = req.headers.clientid;
  }

  const requestPlace = await requestService.createRequestPlace(req.body);
  const response = Response(true, requestPlace, 'RequestPlace created successfully');
  res.status(httpStatus.CREATED).send(response);
});

const getRequests = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['isCompleted', 'isCancelled', 'driverId', 'userId']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await requestService.queryRequests(filter, options);
  const response = Response(true, result, 'Requests retrieved successfully');
  res.status(httpStatus.OK).send(response);
});

const getRequestsWithOutPagination = catchAsync(async (req, res) => {
  if (!req.headers.clientid) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ClientID not found');
  }

  const request = await requestService.getRequest(req.headers.clientid);
  if (!request) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Request not found');
  }
  const response = Response(true, request, 'Success');
  res.status(httpStatus.OK).send(response);
});

const getRequestsWithPagination = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['requestNumber', 'firstName']); // Add rideType here

  const options = pick(req.query, ['sortBy', 'limit', 'page']);

  if (req.query.search) {
    filter.requestNumber = { $regex: req.query.search, $options: 'i' };
  }

  const result = await requestService.getRequestpagination(req, filter, options);

  const response = Response(true, result, 'Success');
  res.status(httpStatus.OK).send(response);
});

const getRequestsHistory = catchAsync(async (req, res) => {
  const request = await requestService.getRequesHistoryList(req);
  if (!request) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Request not found');
  }
  const response = Response(true, request, 'Success');
  res.status(httpStatus.OK).send(response);
});

const getRequestById = catchAsync(async (req, res) => {
  const request = await requestService.getRequestById(req.params.requestId);
  if (!request) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Request not found');
  }
  const response = Response(true, request, 'Request retrieved successfully');
  res.status(httpStatus.OK).send(response);
});

const getRequestsByUserId = catchAsync(async (req, res) => {
  const request = await requestService.getRequestByUserId(req);
  if (!request) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Request not found');
  }
  const response = Response(true, request, 'Success');
  res.status(httpStatus.OK).send(response);
});

const updateRequest = catchAsync(async (req, res) => {
  const request = await requestService.updateRequestById(req.params.requestId, req.body);
  if (!request) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Request not found');
  }
  const response = Response(true, request, 'Request updated successfully');
  res.status(httpStatus.OK).send(response);
});

const deleteRequest = catchAsync(async (req, res) => {
  await requestService.deleteRequestById(req.params.requestId);
  const response = Response(true, null, 'Request deleted successfully');
  res.status(httpStatus.NO_CONTENT).send(response);
});

const getTypes = catchAsync(async (req, res) => {
    const userId = await getUserId(req);
    const request = await requestService.getRideTypes(userId, req);
    const response = Response(true, request, 'eta retrieved successfully');
    return res.status(httpStatus.OK).send(response);
});

const getTripReports = catchAsync(async (req, res) => {
  try {
    const { date } = req.query;
    const zoneId = req.headers.zoneid;

    if (!zoneId) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Missing zoneId in headers');
    }
    const zoneIds = await getAllZoneIdsFromPrimary(zoneId);

    const reports = await requestService.getTripByReports(date, zoneIds);

    const response = {
      success: true,
      data: reports,
      message: 'Reports received successfully',
    };

    res.status(200).send(response);
  } catch (error) {
    console.error('Error fetching trip reports:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

const getTripCount = catchAsync(async (req, res) => {
  // Fetch dashboard counts using the provided clientId
  let clientId;

  if (!req.headers.clientid) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ClientID not found');
  } else {
    clientId = req.headers.clientid;
  }
  const data = await requestService.getByTripCount(clientId);

  // Check if data is not found
  if (!data || Object.keys(data).length === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Data not found');
  }

  // Send the response with the dashboard data
  const response = Response(true, data, 'Success');
  res.status(httpStatus.OK).send(response);
});

const getLastTrips = catchAsync(async (req, res) => {
  try {
    if (!req.headers.zoneid) {
      throw new ApiError(httpStatus.NOT_FOUND, 'ZoneId not found');
    }
    const zoneId = req.headers.zoneid;

    const zoneIds = await getAllZoneIdsFromPrimary(zoneId);

    const lastTrip = await requestService.getLastTrips(req, zoneIds);
    const response = Response(true, lastTrip, 'Last Trip reports retrieved successfully');
    res.status(httpStatus.OK).json(response);
  } catch (error) {
    console.error('Error fetching trip reports:', error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error' });
  }
});

const getLogisticsEarnings = catchAsync(async (req, res) => {
  if (!req.headers.clientid) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ClientID not found');
  }

  const clientId = req.headers.clientid;

  try {
    const totalEarnings = await requestService.getLogisticsByEarnings(clientId);
    const response = Response(true, totalEarnings, 'Total Earnings retrieved successfully');
    res.status(httpStatus.OK).json(response);
  } catch (error) {
    console.error('Error fetching Total Earning reports:', error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error' });
  }
});
const getTotalEarnings = catchAsync(async (req, res) => {
  if (!req.headers.clientid) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ClientID not found');
  }

  const clientId = req.headers.clientid;

  try {
    const totalEarnings = await requestService.getByTotalEarnings(clientId);
    const response = Response(true, totalEarnings, 'Total Earnings retrieved successfully');
    res.status(httpStatus.OK).json(response);
  } catch (error) {
    console.error('Error fetching Total Earning reports:', error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error' });
  }
});

const getUserTrips = async (req, res) => {
  const { userId } = req.params;

  const trips = await requestService.getUserTrips(userId);
  const response = Response(true, trips, 'Request get successfully');
  res.status(httpStatus.CREATED).send(response);
};
const getTripsByDriver = async (req, res) => {
  // Check if clientId is present in headers

  if (!req.headers.clientid) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: 'ClientID not found in the request headers',
    });
  }

  if (!req.headers.zoneid) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: 'ZoneId not found in the request headers',
    });
  }

  const clientId = req.headers.clientid;
  const zoneId = req.headers.zoneid;

  const zoneIds = await getAllZoneIdsFromPrimary(zoneId);

  try {
    // Fetch trips by driver based on clientId
    const trips = await requestService.getTripsByDriver(clientId, zoneIds, zoneId);

    // If no trips are found, return a message
    if (!trips || trips.length === 0) {
      return res.status(404).json({
        success: true,
        message: 'No trips found for the given clientId',
      });
    }

    res.status(200).json({ success: true, data: trips });
  } catch (error) {
    console.error('Error fetching driver summaries:', error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error' });
  }
};



/**
 * Get ETA for web (no clientId required)
 * POST /v1/web/request/eta
 */
const getWebTypes = catchAsync(async (req, res) => {
  try {

    const request = await requestService.getWebRideTypes(req);

    const response = Response(true, request, 'eta retrieved successfully');

    return res.status(200).json(response);
  } catch (error) {
    console.error('Error in web ETA controller:', error);
    throw error;
  }
});

/**
 * Create request for web (no clientId required)
 * POST /v1/web/request/create
 */
const createWebRequest = catchAsync(async (req, res) => {
  try {
    const request = await requestService.createWebRequest(req);

    const response = Response(true, request, 'Request created successfully');

    return res.status(httpStatus.CREATED).json(response);
  } catch (error) {
    console.error('Error in web request creation:', error);
    throw error;
  }
});

/**
 * Get request status for web (for polling)
 * GET /v1/web/request/status/:requestId
 */
const getWebRequestStatus = catchAsync(async (req, res) => {
  try {
    const { requestId } = req.params;
    const request = await requestService.getWebRequestStatus(requestId);

    const response = Response(true, request, 'Request status retrieved successfully');

    return res.status(httpStatus.OK).json(response);
  } catch (error) {
    console.error('Error getting request status:', error);
    throw error;
  }
});

/**
 * Cancel web request
 * POST /v1/web/request/web/cancel
 */
const cancelWebRequest = catchAsync(async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'User not authenticated');
    }
    const result = await requestService.cancelWebRequest(req);
    const response = Response(true, result, 'Request cancelled successfully');
    res.status(httpStatus.OK).send(response);
  } catch (error) {
    console.error('Error in cancelWebRequest controller:', error);
    throw new ApiError(error.statusCode || httpStatus.BAD_REQUEST, error.message || 'Error occurred while cancelling request');
  }
});


const getTripsByUser = async (req, res) => {
  // Check if clientId is present in headers

  if (!req.headers.clientid) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ClientID not found');
  }

  if (!req.headers.zoneid) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ZoneId not found');
  }

  const clientId = req.headers.clientid;
  const zoneId = req.headers.zoneid;

  try {
    // Fetch trips by driver based on clientId
    const trips = await requestService.getTripsByUser(clientId, zoneId);
    // If no trips are found, return a message
    if (!trips || trips.length === 0) {
      throw new ApiError(httpStatus.NOT_FOUND, 'No trips found for the given clientId');
    }

    const response = Response(true, trips, 'User trip count retrieved successfully');
    res.status(httpStatus.OK).send(response);
  } catch (error) {
    throw new Error('Failed to fetch user trip count report');
  }
};

const getDriverTrips = async (req, res) => {
  const { userId } = req.params;

  const trips = await requestService.getDriverRequestTrips(userId);
  const response = Response(true, trips, 'Request get successfully');
  res.status(httpStatus.CREATED).send(response);
};

const getDriverSummaries = async (req, res) => {
  try {
    const zoneId = req.headers.zoneid;
    // const clientId = req.headers.clientid;

    if (!zoneId) {
      throw new ApiError(httpStatus.NOT_FOUND, 'ZoneId not found');
    }

    const zoneIds = await getAllZoneIdsFromPrimary(zoneId);

    const summaries = await requestService.getDriverSummary(zoneIds);
    const response = {
      success: true,
      data: summaries,
      message: 'Success',
    };
    res.status(201).send(response);
  } catch (error) {
    console.error('Error fetching driver summaries:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const getTripWiseReports = catchAsync(async (req, res) => {
  try {
    const { date } = req.query;
    const zoneId = req.headers.zoneid;

    if (!zoneId) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Missing zoneId in headers');
    }

    const zoneIds = await getAllZoneIdsFromPrimary(zoneId);

    const reports = await requestService.getTripWiseReports(date, zoneIds);

    const response = {
      success: true,
      data: reports,
      message: 'Reports received successfully',
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error('Error in rideController:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

const getCompletedLocalTrip = async (req, res) => {
  try {
    const zoneId = req.headers.zoneid;
    // const clientId = req.headers.clientid;

    if (!zoneId) {
      throw new ApiError(httpStatus.NOT_FOUND, 'ZoneId not found');
    }
    const zoneIds = await getAllZoneIdsFromPrimary(zoneId);

    const summaries = await requestService.getCompletedLocalTrip(zoneIds);
    if (!summaries) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Request not found');
    }
    const response = Response(true, summaries, 'Trip reports retrieved successfully');
    res.status(httpStatus.OK).json(response);
  } catch (error) {
    console.error('Error fetching completed local trip:', error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error' });
  }
};

const getCompletedRentalTrip = async (req, res) => {
  try {
    const zoneId = req.headers.zoneid;
    // const clientId = req.headers.clientid;

    if (!zoneId) {
      throw new ApiError(httpStatus.NOT_FOUND, 'ZoneId not found');
    }
    const zoneIds = await getAllZoneIdsFromPrimary(zoneId);
    const summaries = await requestService.getCompletedRentalTrip(zoneIds);
    const response = Response(true, summaries, 'Trip reports retrieved successfully');
    res.status(httpStatus.OK).json(response);
  } catch (error) {
    console.error('Error fetching completed local trip:', error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error' });
  }
};

const getRentalList = async (req, res) => {
  try {
    const rentalList = await requestService.getRentalList(req);
    if (!rentalList) {
      throw new ApiError(httpStatus.NOT_FOUND, 'No request found');
    }
    const response = Response(true, rentalList, 'Rental List retrieved successfully');
    res.status(httpStatus.OK).json(response);
  } catch (error) {
    console.error('Error fetching completed local trip:', error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

const getTodayEarnings = catchAsync(async (req, res) => {
  if (!req.headers.clientid) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ClientID not found');
  }

  if (!req.headers.zoneid) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ZoneId not found');
  }

  const clientId = req.headers.clientid;
  const zoneId = req.headers.zoneid;

  const zoneIds = await getAllZoneIdsFromPrimary(zoneId);
  try {
    const totalEarnings = await requestService.getTodayEarnings(req, clientId, zoneIds, zoneId);
    const response = Response(true, totalEarnings, 'Total Earnings retrieved successfully');
    res.status(httpStatus.OK).json(response);
  } catch (error) {
    console.error('Error fetching Total Earning reports:', error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error' });
  }
});

const getTodayReport = catchAsync(async (req, res) => {
  if (!req.headers.clientid) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ClientID not found');
  }

  if (!req.headers.zoneid) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ZoneId not found');
  }

  const clientId = req.headers.clientid;
  const zoneId = req.headers.zoneid;

  try {
    const totalEarnings = await requestService.getTodayReport(req, clientId, zoneId);
    const response = Response(true, totalEarnings, 'Total Earnings retrieved successfully');
    res.status(httpStatus.OK).json(response);
  } catch (error) {
    console.error('Error fetching Total Earning reports:', error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error' });
  }
});

const getWeeklyReport = catchAsync(async (req, res) => {
  if (!req.headers.clientid) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ClientID not found');
  }

  if (!req.headers.zoneid) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ZoneId not found');
  }

  const clientId = req.headers.clientid;
  const zoneId = req.headers.zoneid;

  try {
    const filter = pick(req.query, ['search']);
    const totalEarnings = await requestService.getWeeklyReport(req, clientId, filter, zoneId);
    const response = Response(true, totalEarnings, 'weekly report retrieved successfully');
    res.status(httpStatus.OK).send(response);
  } catch (error) {
    console.error('Error fetching weekly report:', error);
    throw new Error('Failed to fetch weekly reports');
  }
});

const getMonthlyReport = catchAsync(async (req, res) => {
  if (!req.headers.clientid) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ClientID not found');
  }

  if (!req.headers.zoneid) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ZoneId not found');
  }

  const clientId = req.headers.clientid;
  const zoneId = req.headers.zoneid;

  try {
    const filter = pick(req.query, ['search']);

    const totalEarnings = await requestService.getMonthlyReport(req, clientId, filter, zoneId);

    const response = Response(true, totalEarnings, 'monthly report retrieved successfully');

    res.status(httpStatus.OK).send(response);
  } catch (error) {
    console.error('Error fetching monthly report:', error);
    throw new Error('Failed to fetch monthly reports');
  }
});

const getYearlyRevenue = async (req, res) => {
  // Check if clientId is present in headers

  if (!req.headers.clientid) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ClientID not found');
  }
  if (!req.headers.zoneid) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ZoneId not found');
  }

  const clientId = req.headers.clientid;
  const zoneId = req.headers.zoneid;

  try {
    // Fetch trips by driver based on clientId
    const trips = await requestService.getYearlyRevenue(req, clientId, zoneId);
    // If no trips are found, return a message
    if (!trips || trips.length === 0) {
      throw new ApiError(httpStatus.NOT_FOUND, 'No trips found for the given clientId');
    }

    const response = Response(true, trips, 'User trip count retrieved successfully');
    res.status(httpStatus.OK).send(response);
  } catch (error) {
    throw new Error('Failed to fetch user trip count report');
  }
};

const getChatHistory = async (req, res) => {
  try {
    const { requestNumber} = req.query;
    const messages = await Message.find({ requestNumber });
    const enrichedMessages = await Promise.all(
      messages.map(async (msg) => {
        let sender;
        let receiver;


        if (msg.senderType === 'Users') {
          sender = await User.findById(msg.senderNumber).lean();
        } else if (msg.senderType === 'Driver') {
          sender = await Driver.findById(msg.senderNumber).lean();
        }

        if (msg.receiverType === 'Users') {
          receiver = await User.findById(msg.receiverNumber).lean();
        } else if (msg.receiverType === 'Driver') {
          receiver = await Driver.findById(msg.receiverNumber).lean();
        }

        return {
          _id: msg._id,
          message: msg.message,
          createdAt: msg.createdAt,
          sender: {
            _id: msg.senderNumber,
            type: msg.senderType,
          },
          receiver: {
            _id: msg.receiverNumber,
            type: msg.receiverType,
          },
        };
      }),
    );

    return res.status(200).json({
      success: true,
      messages: enrichedMessages,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch chat history',
    });
  }
};

module.exports = {
  createRequest,
  getRequests,
  getRequestById,
  updateRequest,
  deleteRequest,
  getRequestsWithOutPagination,
  createRequestPlace,
  getRequestsByUserId,
  getRequestsHistory,
  getTypes,
  getRequestsWithPagination,
  getTripReports,
  getTripCount,
  getLastTrips,
  getLogisticsEarnings,
  getTotalEarnings,
  getUserTrips,
  getTripsByDriver,
  getDriverTrips,
  getDriverSummaries,
  getTripWiseReports,
  getCompletedLocalTrip,
  getCompletedRentalTrip,
  getRentalList,
  getChatHistory,
  getTodayEarnings,
  getTodayReport,
  getWeeklyReport,
  getMonthlyReport,
  getYearlyRevenue,
  getTripsByUser,
  cancelWebRequest,
  getWebRequestStatus,
  createWebRequest,
  getWebTypes
};
