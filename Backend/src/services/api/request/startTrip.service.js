const { Request, RequestPlace, Driver, requestListView,Settings } = require('../../../models');
const ApiError = require('../../../utils/ApiError');
const httpStatus = require('http-status');
const tokenService = require('../../token.service');
const mqttService = require('../../../services/mqtt/mqtt.service');
const { sendPushNotification } = require('../../../utils/commonFunction');
const ObjectId = require('mongoose').Types.ObjectId
const { mqttConfig } = require('../../../config/string')


const getDriverrId = async (req) => {

    let userId = '';

    let driverId = '';

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(httpStatus.UNAUTHORIZED).send({ message: 'Authorization header is missing or invalid' });
        return;
    }
    // Remove the 'Bearer ' prefix and get the token
    const token = authHeader.substring(7);

    const user = await tokenService.verifyTokenAndGetUser(token);

    userId = user.id

    const driver = await Driver.find({ userId: userId })


    driverId = driver[0]._id;

    return driverId;
}


// const startTrips = async (req) => {
//     let driverId = await getDriverrId(req);
 
//     const { requestId, otp, latitude, longitude, startKm,startKmImage } = req.body;
//     try {

//         const tripRequest = await Request.findById(requestId);


//         if (otp != tripRequest.requestOtp) {
//             throw new ApiError(httpStatus.NOT_FOUND, 'Otp Wrong');
//         }
//         if (!tripRequest) {
//             throw new ApiError(httpStatus.NOT_FOUND, 'Trip request not found');
//         }
//         // Validate trip request
//         if (tripRequest.isCompleted || tripRequest.isCancelled) {
//             throw new ApiError(httpStatus.UNAUTHORIZED, 'Request already completed or cancelled.');
//         }
//         const driver = await Driver.findById(driverId);
//         if (!driver) {
//             throw new ApiError(httpStatus.NOT_FOUND, 'Driver not found.');
//         }


//         const isDriverNear = await distanceCalculate(requestId, latitude, longitude);

//         if (isDriverNear) {
//             tripRequest.tripStartTime = new Date();
//             tripRequest.isTripStart = true;

//             if (startKmImage != null) {
//                 tripRequest.startKm = startKm;
//                 tripRequest.startKmImage = startKmImage;
//             }

//             await tripRequest.save();

//             let responseData = await getRequestListData(requestId);

//             // send Push notification Trip Arrived
//             await mqttService.publishMessage(
//                 `user/request/${tripRequest.userId}`,
//                 JSON.stringify({
//                     title: "TRIP_START",
//                     message: "Trip Started",
//                     trip: responseData[0]
//                 })
//             );

//             await sendPushNotification(tripRequest.userId.toString(), {
//                 title: "TRIP_ARRIVED",
//                 message: "Driver arrived your location to pick you up."
//             });


//             return responseData[0];   

//         } else {
//             const fdata = 'Driver Not Near By Customer';

//             throw new ApiError(httpStatus.FORBIDDEN, fdata);
//         }


//     } catch (err) {
//         console.error(err);
//         throw new Error(err.message);
//     }

// };

const startTrips = async (req) => {
    try {
        // Parallelize initial data fetching
        const [driverId, { requestId, otp, latitude, longitude, startKm, startKmImage }] = await Promise.all([
            getDriverrId(req),
            Promise.resolve(req.body) // Ensure body is ready
        ]);

        // Fetch trip request and driver in parallel
        const [tripRequest, driver] = await Promise.all([
            Request.findById(requestId),
            Driver.findById(driverId)
        ]);

        // Early validation checks
        if (!tripRequest) {
            throw new ApiError(httpStatus.NOT_FOUND, 'Trip request not found');
        }
        if (otp != tripRequest.requestOtp) {
            throw new ApiError(httpStatus.NOT_FOUND, 'Otp Wrong');
        }
        if (tripRequest.isCompleted || tripRequest.isCancelled) {
            throw new ApiError(httpStatus.UNAUTHORIZED, 'Request already completed or cancelled.');
        }
        if (!driver) {
            throw new ApiError(httpStatus.NOT_FOUND, 'Driver not found.');
        }

        // Check driver proximity
        const isDriverNear = await distanceCalculate(requestId, latitude, longitude);
        if (!isDriverNear) {
            throw new ApiError(httpStatus.FORBIDDEN, 'Driver Not Near By Customer');
        }

        // Update trip request
        tripRequest.tripStartTime = new Date();
        tripRequest.isTripStart = true;
        
        if (startKmImage != null) {
            tripRequest.startKm = startKm;
            tripRequest.startKmImage = startKmImage;
        }
        tripRequest.save();
        // Parallelize save and data preparation
        const [responseData] = await Promise.all([
            getRequestListData(requestId),
        ]);

       const userTopic = mqttConfig.USER_REQUEST+""+tripRequest.userId;
    
       // `user/request/${tripRequest.userId}`

        // Parallelize notifications
        await Promise.all([
            mqttService.publishMessage(
                userTopic,
                JSON.stringify({
                    title: "TRIP_START",
                    message: "Trip Started",
                    trip: responseData[0]
                })
            ),
            sendPushNotification(tripRequest.userId.toString(), {
                title: "TRIP_START",
                message: "Driver arrived your location to pick you up."
            })
        ]);

        return responseData[0];

    } catch (err) {
        console.error(err);
        throw err instanceof ApiError ? err : new Error(err.message);
    }
};

async function distanceCalculate(requestId, lat, lng) {
  const settingsNear = await Settings.findOne({ name: 'nearBydriver' });

  // Parse value from settings
  const maxDistanceMeters = settingsNear && settingsNear.value
    ? parseFloat(settingsNear.value)
    : 100;

  // Convert meters to kilometers
  const maxDistanceKm = maxDistanceMeters / 1000;



  const tripPlace = await RequestPlace.findOne({ requestId: requestId });
  if (!tripPlace) {
    return null;
  }

  const picklat = tripPlace.pickLat;
  const picklng = tripPlace.pickLng;

  const distance = haversineDistance(picklat, picklng, lat, lng); // in kilometers

  return distance <= maxDistanceKm;
}
function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = degreesToRadians(lat2 - lat1);
    const dLon = degreesToRadians(lon2 - lon1);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(degreesToRadians(lat1)) * Math.cos(degreesToRadians(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function degreesToRadians(degrees) {
    return degrees * (Math.PI / 180);
}

const getRequestListData = async (requestId) => {

  const getRequest = requestListView.aggregate([
    {
      $match: {
        _id: new ObjectId(requestId),
      }
    }
  ]);

  return getRequest;
};

module.exports = {
    startTrips
};
