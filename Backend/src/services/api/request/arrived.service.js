const { Request, RequestPlace, Driver, requestListView, Settings } = require('../../../models');
const ApiError = require('../../../utils/ApiError');
const httpStatus = require('http-status').default || require('http-status').status || require('http-status');
const tokenService = require('../../token.service');
const mqttService = require('../../mqtt/mqtt.service');
const { sendPushNotification, getDriverId } = require('../../../utils/commonFunction');
const { ObjectId } = require('mongoose').Types;
const { mqttConfig } = require('../../../config/string');

const arrivedTrip = async (req) => {
  const driverId = await getDriverId(req);

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

    if (isDriverNear) {
      tripRequest.arrivedAt = new Date();
      tripRequest.isDriverArrived = true;
      await tripRequest.save();

      const responseData = await getRequestListData(requestId);

      // send Push notification Trip Arrived

      const topic = `${mqttConfig.USER_REQUEST}${tripRequest.userId}`;

      // `user/request/${tripRequest.userId}`

      setImmediate(async () => {
        try {
          await mqttService.publishMessage(
            topic,
            JSON.stringify({
              title: 'TRIP_ARRIVED',
              message: 'Driver arrived your location to pick you up.',
              trip: responseData[0],
            }),
          );

          await sendPushNotification(tripRequest.userId.toString(), {
            title: 'TRIP_ARRIVED',
            message: 'Driver arrived your location to pick you up.',
          });
        } catch (notificationError) {
          console.error('❌ Notification error (non-blocking):', notificationError);
        }
      });

      return responseData[0];
    }
    const fdata = 'Driver Not Near By Customer';

    throw new Error(fdata);
  } catch (err) {
    console.error(err);
    throw new Error(err.message);
  }
};

// async function distanceCalculate(requestId, lat, lng) {
//     const tripPlace = await RequestPlace.findOne({ requestId: requestId });
//     if (!tripPlace) {
//         return null;
//     }

//     let picklat = tripPlace.pickLat;
//     let picklng = tripPlace.pickLng;

//     const distance = haversineDistance(picklat, picklng, lat, lng);

//     // return distance <= 0.01;
// }

async function distanceCalculate(requestId, lat, lng) {
  const nearBydriver = await Settings.findOne({ name: 'nearBydriver' });
  const RADIUS_IN_MEETERS = nearBydriver.value;
  const tripPlace = await RequestPlace.findOne({ requestId });
  if (!tripPlace) {
    return null;
  }

  const picklat = tripPlace.pickLat;
  const picklng = tripPlace.pickLng;

  const distance = haversineDistance(picklat, picklng, lat, lng);

  const distancetomeeter = distance * 1000;

  return distancetomeeter <= RADIUS_IN_MEETERS;
}

function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = degreesToRadians(lat2 - lat1);
  const dLon = degreesToRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(degreesToRadians(lat1)) * Math.cos(degreesToRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

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
      },
    },
  ]);

  return getRequest;
};

module.exports = {
  arrivedTrip,
};
