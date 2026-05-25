const httpStatus = require('http-status');
const pick = require('../../../utils/pick');
const ApiError = require('../../../utils/ApiError');
const catchAsync = require('../../../utils/catchAsync');
const { requestService,tokenService } = require('../../../services');
const {ErrorLog} = require('../../../models');
const Response = require('../../../config/response');
const { getByTotalEarnings } = require('../../../services/web/request/request.service');



const sendError = (message, data, code) => ({
    success: false,
    message,
    data,
    code,
});
const getUserId = async (req) => {

  let userId = '';

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(httpStatus.UNAUTHORIZED).send({ message: 'Authorization header is missing or invalid' });
    return;
  }
  // Remove the 'Bearer ' prefix and get the token
  const token = authHeader.substring(7);

  const user = await tokenService.verifyTokenAndGetUser(token);

  userId = user.id

  return userId;
}




const createRequest = catchAsync(async (req, res) => {

  if (!req.headers.clientid) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ClientID not found');
  }else{
    req.body.clientId = req.headers.clientid;
  }

  const request = await requestService.createRequest(req.body);
  const response = Response(true, request, 'Request created successfully');
  res.status(httpStatus.CREATED).send(response);
});


const createRequestPlace = catchAsync(async (req, res) => {

  if (!req.headers.clientid) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ClientID not found');
  }else{
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
  const response = Response(true, request, "Success");
  res.status(httpStatus.OK).send(response);
});

const getRequestsWithPagination = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['requestNumber', 'firstName']); // Add rideType here

  const options = pick(req.query, ['sortBy', 'limit', 'page']);

  if(req.query.search)
  {
    filter.requestNumber = {$regex: req.query.search,$options: 'i'}
  }

  const result = await requestService.getRequestpagination(req, filter, options);

  const response = Response(true, result, "Success");
  res.status(httpStatus.OK).send(response);
});



const getRequestsHistory = catchAsync(async (req, res) => {
  const request = await requestService.getRequesHistoryList(req);
  if (!request) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Request not found');
  }
  const response = Response(true, request, "Success");
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
  const response = Response(true, request, "Success");
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
  try {
    const userId =await getUserId(req);
    const request = await requestService.getRideTypes(userId, req);

    const response = Response(true, request, 'eta retrieved successfully');

    return res.status(200).json(response);
  } catch (error) {
    console.error('Error in rideController:', error);
    return res.status(400).json(sendError('Error occurred', error.message, 400));
  }
});

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

const getTripReports = catchAsync(async (req, res) => {
  try {
    const { date } = req.query; // expected in MM/DD/YYYY format
    const reports = await requestService.getTripByReports(date);
    const response = Response(true, reports, 'Reports received successfully');
   
    return res.status(200).json(response);
  } catch (error) {
    console.error('Error in rideController:', error);
    return res.status(400).json(sendError('Error occurred', error.message, 400));
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
    let data = await requestService.getByTripCount(clientId)
  

  
    // Check if data is not found
    if (!data || Object.keys(data).length === 0) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Data not found');
    }
  
    // Send the response with the dashboard data
    const response = Response(true, data, "Success");
    res.status(httpStatus.OK).send(response);
  
});

const getLastTrips= catchAsync(async (req, res) => {
  try {
    const lastTrip = await requestService.getLastTrips();
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
  const clientId = req.headers.clientid;

  if (!clientId) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: 'ClientID not found in the request headers'
    });
  }

  try {
    // Fetch trips by driver based on clientId
    const trips = await requestService.getTripsByDriver(clientId);

    // If no trips are found, return a message
    if (!trips || trips.length === 0) {
      return res.status(404).json({
        success: true,
        message: 'No trips found for the given clientId'
      });
    }

    res.status(200).json({ success: true, data: trips });
  } catch (error) {
    console.error("Error fetching driver summaries:", error);
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error' });
  }
};

const getTripsByUser = async (req, res) => {
  // Check if clientId is present in headers
  const clientId = req.headers.clientid;

  if (!clientId) {
   throw new ApiError(httpStatus.NOT_FOUND, 'ClientID not found');
    
  }

  try {
    // Fetch trips by driver based on clientId
    const trips = await requestService.getTripsByUser(clientId);
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
      const summaries = await requestService.getDriverSummary();
      const response = Response(true,summaries,'Success');
      res.status(httpStatus.CREATED).send(response);
  } catch (error) {
      console.error("Error fetching driver summaries:", error);
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error' });
  }
};
const getTripWiseReports = catchAsync(async (req, res) => {
 
    try {
      const { date } = req.query; // expected in MM/DD/YYYY format
      const reports = await requestService.getTripWiseReports(date);
      const response = Response(true, reports, 'Reports received successfully');
     
      return res.status(200).json(response);
    } catch (error) {
      console.error('Error in rideController:', error);
      return res.status(400).json(sendError('Error occurred', error.message, 400));
    }
  });



const getCompletedLocalTrip = async (req, res) => {
  try {
      const summaries = await requestService.getCompletedLocalTrip();
      if (!summaries) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Request not found');
      }
      const response = Response(true, summaries, 'Trip reports retrieved successfully');
      res.status(httpStatus.OK).json(response);
  } catch (error) {
      console.error("Error fetching completed local trip:", error);
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error' });
  }
};

const getCompletedRentalTrip = async (req, res) => {
  try {
      const summaries = await requestService.getCompletedRentalTrip();
      const response = Response(true, summaries, 'Trip reports retrieved successfully');
      res.status(httpStatus.OK).json(response);
  } catch (error) {
      console.error("Error fetching completed local trip:", error);
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error' });
  }
};

const getRentalList = async(req,res) => {
  try {
      const rentalList = await requestService.getRentalList();
      if(!rentalList)
      {
        throw new ApiError(httpStatus.NOT_FOUND,'No request found');
      }
      const response = Response(true, rentalList, 'Rental List retrieved successfully');
      res.status(httpStatus.OK).json(response);
  } catch (error) {
      console.error("Error fetching completed local trip:", error);
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error' });
  }
};

const getTodayEarnings = catchAsync(async (req, res) => {
  if (!req.headers.clientid) {
      throw new ApiError(httpStatus.NOT_FOUND, 'ClientID not found');
  }

  const clientId = req.headers.clientid;

  try {
      const totalEarnings = await requestService.getTodayEarnings(clientId);
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

  const clientId = req.headers.clientid;

  try {
      const totalEarnings = await requestService.getTodayReport(clientId);
      const response = Response(true, totalEarnings, 'Total Earnings retrieved successfully');
      res.status(httpStatus.OK).json(response);
  } catch (error) {
      console.error('Error fetching Total Earning reports:', error);
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error' });
  }
});

const getWeeklyReport = catchAsync(async (req,res) => {
  if (!req.headers.clientid) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ClientID not found');
  }

  const clientId = req.headers.clientid;

  try {
      const filter = pick(req.query, ['search']);
      const totalEarnings = await requestService.getWeeklyReport(clientId,filter);
      const response = Response(true, totalEarnings, 'weekly report retrieved successfully');
      res.status(httpStatus.OK).send(response);
  } catch (error) {
      console.error('Error fetching weekly report:', error);
      throw new Error("Failed to fetch weekly reports");
  }
});

const getMonthlyReport = catchAsync(async (req,res) => {
  if (!req.headers.clientid) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ClientID not found');
  }

  const clientId = req.headers.clientid;

  try {
      const filter = pick(req.query, ['search']);
      const totalEarnings = await requestService.getMonthlyReport(clientId,filter);
      const response = Response(true, totalEarnings, 'monthly report retrieved successfully');
      res.status(httpStatus.OK).send(response);
  } catch (error) {
      console.error('Error fetching monthly report:', error);
      throw new Error("Failed to fetch monthly reports");
  }
});

const getYearlyRevenue = async (req, res) => {
  // Check if clientId is present in headers
  const clientId = req.headers.clientid;

  if (!clientId) {
   throw new ApiError(httpStatus.NOT_FOUND, 'ClientID not found');
    
  }

  try {
    // Fetch trips by driver based on clientId
    const trips = await requestService.getYearlyRevenue(clientId);

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


const getErrorLogs = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['statusCode', 'method', 'url']); // example filter fields
  const options = pick(req.query, ['sortBy', 'limit', 'page']);

  // Optional: add search over message or url fields
  if (req.query.search) {
    filter.$or = [
      { message: { $regex: req.query.search, $options: 'i' } },
      { url: { $regex: req.query.search, $options: 'i' } },
    ];
  }

  const result = await queryErrorLogs(filter, options);
  const response = Response(true, result, 'Success');
  res.status(httpStatus.OK).send(response);
});

const queryErrorLogs = async (filter, options) => {
  try {
    const limit = parseInt(options.limit, 10) || 10;
    const page = parseInt(options.page, 10) || 1;

    // Count total matching documents for pagination info
    const totalResults = await ErrorLog.countDocuments(filter);

    // Default sorting: newest first
    options.sortBy = options.sortBy || 'timestamp:desc';

    // Parse sortBy to build sort object
    const [sortField, sortOrder] = options.sortBy.split(':');
    const sort = {};
    sort[sortField] = sortOrder === 'asc' ? 1 : -1;

    // Aggregation pipeline for filtering, sorting, pagination
    const results = await ErrorLog.aggregate([
      { $match: filter },

      // Project only needed fields (customize as needed)
      {
        $project: {
          message: 1,
          stack: 1,
          url: 1,
          method: 1,
          body: 1,
          user: 1,
          statusCode: 1,
          timestamp: 1,
        }
      },

      { $sort: sort },
      { $skip: (page - 1) * limit },
      { $limit: limit },
    ]);

    const totalPages = Math.ceil(totalResults / limit);

    return {
      results,
      page,
      limit,
      totalPages,
      totalResults,
    };
  } catch (error) {
    console.error('Error in querying error logs:', error);
    throw error;
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
  getWebTypes,
  createWebRequest,
  getWebRequestStatus,
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
  getTodayEarnings,
  getTodayReport,
  getWeeklyReport,
  getMonthlyReport,
  getYearlyRevenue,
  getTripsByUser,
  getErrorLogs,
  cancelWebRequest
};
