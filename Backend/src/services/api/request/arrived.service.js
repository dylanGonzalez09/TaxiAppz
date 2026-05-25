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



const arrivedTrip = async (req) => {
  let driverId = await getDriverrId(req);

  const { requestId, latitude, longitude } = req.body;
  try {
    const tripRequest = await Request.findById(requestId);
    if (!tripRequest) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Trip request not found');
    }
    // Validate trip request
    if (tripRequest.isCompleted || tripRequest.isCancelled) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Request already completed or cancelled.');
    }
    const driver = await Driver.findById(driverId);
    if (!driver) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Driver not found.');
    }

    const isDriverNear = await distanceCalculate(requestId, latitude, longitude);
    if (!isDriverNear) {
      throw new ApiError(httpStatus.FORBIDDEN, 'Driver Not Near By Customer');
    }

    if (isDriverNear) {
      tripRequest.arrivedAt = new Date();
      tripRequest.isDriverArrived = true;
      await tripRequest.save();

      let responseData = await getRequestListData(requestId);

      const topic = mqttConfig.USER_REQUEST + '' + tripRequest.userId;

      await mqttService.publishMessage(
        topic,
        JSON.stringify({
          title: 'TRIP_ARRIVED',
          message: 'Driver arrived your location to pick you up.',
          trip: responseData[0],
        })
      );

      await sendPushNotification(tripRequest.userId.toString(), {
        title: 'TRIP_ARRIVED',
        message: 'Driver arrived your location to pick you up.',
      });

      return responseData[0];
    } 
  } catch (err) {
    console.error(err);
    throw err;
  }
};
async function distanceCalculate(requestId, lat, lng) {
  const settingsNear = await Settings.findOne({ name: 'nearBydriver' });

  // Parse value from settings
  const maxDistanceMeters = settingsNear && settingsNear.value ? parseFloat(settingsNear.value) : 100;

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
    arrivedTrip
};
