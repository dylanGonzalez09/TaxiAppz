const cron = require('node-cron');
const mongoose = require('mongoose');
const {
  Request,
  RequestPlace,
  DriverDocument,
  Settings,
  DriverSubscription,
  DriverLocation,
  RequestMeta,
  RequestDriverData,
  RequestBid,
  requestListView,
  NoDriverTrips,
  ZonePrice,
  Rental,
  Driver,
  Zone,
  PromoCode
} = require('../models');

const MqttService = require('../services/mqtt/mqtt.service');

const ApiError = require('../utils/ApiError');
const httpStatus = require('http-status').default || require('http-status').status || require('http-status');
const config = require('../config/config');
const moment = require('moment');
const { sendPushNotification, sendClientNotification } = require('../utils/commonFunction');
const { ObjectId } = require('mongoose').Types;

const { mqttConfig } = require('../config/string');

// Connect to MongoDB
mongoose
  .connect(config.mongoose.url)
  .then(() => console.log('MongoDB connected for cron job'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1); // Exit process if connection fails
  });

// Define the cron job
cron.schedule('* 9 * * *', async () => {
  try {
    // First find the documents that need to be updated
    const documentsToUpdate = await DriverDocument.find({
      expiryDate: { $lt: new Date() },
      expriyStatus: false,
    }).select('clientId'); // Only select the clientId field

    // Extract the clientIds
    const clientIds = documentsToUpdate.map((doc) => doc.clientId);

    // Then perform the update
    const result = await DriverDocument.updateMany(
      {
        expiryDate: { $lt: new Date() },
        expriyStatus: false,
      },
      {
        $set: { expriyStatus: true },
      },
    );

    await sendClientNotification(clientIds[0], {
      title: 'Driver Document',
      message: 'Drivers Documents Expired please inform to driver to Update the Document',
    });
  } catch (error) {
    console.error('Error running cron job:', error);
  }
});


// Daily at midnight, update expired promo codes to inactive
cron.schedule('0 0 0 * * *', async () => {
  try {
    await PromoCode.updateMany({ toDate: { $lt: new Date() }, status: true }, { $set: { status: false } });

  } catch (error) {

    console.error("Daily promocode updation error :", error)
  }
})


async function assignDriver(request, driver) {
  try {
    // Check if the driver is free
    const isDriverFree = (await RequestMeta.countDocuments({ driverId: driver.driverId, active: true })) === 0;
    if (!isDriverFree) {
      return false;
    }


    // Assign the driver to the request
    request.driverId = driver.driverId;
    request.acceptedAt = new Date();
    await request.save();

    // Save the driver meta
    await RequestMeta.create({
      userId: driver.userId,
      requestId: request._id,
      driverId: driver.driverId,
      active: true,
      assignMethod: 1,
      created_at: new Date(),
      updated_at: new Date(),
    });

    // Track drivers already offered (same idea as local trips / fetchExcludeDriver + RequestDriverData)
    await RequestDriverData.findOneAndUpdate(
      { requestId: request._id },
      { $addToSet: { driverIds: driver.driverId } },
      { upsert: true, setDefaultsOnInsert: true },
    );

    // Notify the driver
    await sendPushNotification(driver.userId.toString(), {
      title: 'New Trip Requested',
      message: 'New Trip Requested, you can accept or Reject the request',
    });

    const userTopic = `${mqttConfig.USER_REQUEST}${request.userId.toString()}`;

    const driverTopic = `${mqttConfig.DRIVER_REQUEST}${driver.driverId.toString()}`;

    // let driverTopic = "driver/request/" + driver.driverId.toString();

    // let userTopic = "user/request/" + request.userId.toString();

    const responseData = await getRequestListData(request._id);

    // Publish MQTT message
    await MqttService.publishMessage(
      driverTopic,
      JSON.stringify({
        title: 'New Trip Requested',
        message: 'New Trip Requested, you can accept or Reject the request',
        trip: responseData[0],
      }),
    );

    await sendPushNotification(request.userId, {
      title: 'Your Trip Start With In 15 Min',
      message: 'Your Trip Start With In 15 Min',
    });

    // await MqttService.publishMessage(
    //   userTopic,
    //   JSON.stringify({
    //     title: "Your Trip Start With In 15 Min",
    //     message: "Your Trip Start With In 15 Min",
    //     trip: responseData[0],
    //   })
    // );
    return true;
  } catch (error) {
    console.error(`Error assigning driver to request ${request.requestNumber}:`, error);
    return false;
  }
}

// Function to check and process requests
async function checkAndProcessRequests() {

  const now = Date.now(); // Current time in milliseconds
  const fifteenMinutesLater = now + 15 * 60 * 1000; // Add 15 minutes

  try {
    // Find requests that match the criteria

    const requests = await Request.find({
      isLater: true,
      tripTime: {
        $gte: now,
        $lte: fifteenMinutesLater,
      },
      driverId: null,
      isCancelled: false,
    });

    if (requests.length > 0) {
      // Process each request
      for (const request of requests) {
        const requestPlace = await RequestPlace.findOne({ requestId: request._id });

        let zoneId = '';
        if (request.tripType == 'LOCAL') {
          const zonePrice = await ZonePrice.findById(request.zoneTypeId);
          zoneId = zonePrice ? zonePrice.zoneId : '';
        } else {
          const packagePrice = await Rental.findById(request.packageId);
          zoneId = packagePrice ? packagePrice.zoneId : '';
        }

        const offeredRow = await RequestDriverData.findOne({ requestId: request._id }).lean();
        const excludeDriverIds = (offeredRow?.driverIds || [])
          .filter((id) => id && mongoose.Types.ObjectId.isValid(String(id)))
          .map((id) => new ObjectId(String(id)));

        // DriverLocation.serviceType is the service the driver runs (LOCAL / RENTAL), not booking mode (RIDE_LATER / RIDE_NOW)
        const serviceTypeForMatch = request.tripType || 'RENTAL';

        // Fetch available drivers, excluding drivers already notified for this trip (like fetchExcludeDriver for local)
        const drivers = await fetchDriver(
          requestPlace.pickLat,
          requestPlace.pickLng,
          requestPlace.vehicleType,
          serviceTypeForMatch,
          zoneId,
          requestPlace.dropLat,
          requestPlace.dropLng,
          excludeDriverIds,
        );

        if (!drivers || !drivers.length) {
          request.cancelledAt = moment();
          request.isCancelled = true;
          request.cancelMethod = 'Automatic';
          await request.save();

          await sendPushNotification(request.userId.toString(), {
            title: 'Trip Cancelled',
            message: 'No driver found for your scheduled trip',
          });

          const userTopic = `${mqttConfig.USER_REQUEST}${request.userId.toString()}`;
          const responseData = await getRequestListData(request._id);

          await MqttService.publishMessage(
            userTopic,
            JSON.stringify({
              title: 'Trip Cancelled',
              message: 'No driver found for your scheduled trip',
              trip: responseData[0],
            }),
          );
          continue;
        }

        let assigned = false;
        for (const driver of drivers) {
          // eslint-disable-next-line no-await-in-loop
          if (await assignDriver(request, driver)) {
            assigned = true;
            break;
          }
        }

        if (!assigned) {
          // Drivers in range exist but none were free; retry on a later cron tick without cancelling
          continue;
        }
        // }
      }
    } else {
      console.log('No requests to process.');
    }
  } catch (error) {
    console.error('Error processing requests:', error);
  }
}



const fetchDriver = async (
  pick_lat,
  pick_lng,
  vehicle_type,
  serviceTypeMatch,
  zoneId,
  drop_lat,
  drop_lng,
  excludeDriverIds = [],
) => {
  const settingsPlaces = await Settings.findOne({ name: 'driverShowingKm' });
  const SECONDARY_ZONE_DATA = Number(await getSettingCached('secondaryZone'));

  const SECONDARY_ZONE = SECONDARY_ZONE_DATA.value === 'yes' ? true : false

  if(zoneId && !SECONDARY_ZONE){
     const zoneData = await Zone.findById(zoneId)
     zoneId = zoneData.primaryZoneId || zoneData._id
  }
  
  const RADIUS_IN_KM = settingsPlaces.value;
  const METERS_PER_KM = 1000;
  const maxDistanceInMeters = RADIUS_IN_KM * METERS_PER_KM;
  const nowMs = Date.now();
  const thirtyMinutesAgoMs = nowMs - 30 * 60 * 1000;
  const thirtyMinutesAgoUs = nowMs * 1000 - 30 * 60 * 1000 * 1000;

  try {
   const zoneObjectId = new ObjectId(zoneId);

    const query = {
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [pick_lng, pick_lat],
          },
          $maxDistance: maxDistanceInMeters,
        },
      },
      $and: [
        {
          $or: [{ lastUpdated: { $gte: thirtyMinutesAgoMs } }, { lastUpdated: { $gte: thirtyMinutesAgoUs } }],
        },
        {
          $or: [
            { zoneId: zoneObjectId },
            {
              secondaryZone: {
                $in: [zoneObjectId],
              },
            },
          ],
        },
      ],
      vehicleId: vehicle_type,
      isAvailable: true,
      isOnline: true,
      serviceType: { $regex: new RegExp(`\\b${String(serviceTypeMatch).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i') },
    };

    if (excludeDriverIds && excludeDriverIds.length > 0) {
      query.driverId = { $nin: excludeDriverIds };
    }

    const nearbyDrivers = await DriverLocation.find(query);

    return nearbyDrivers;
  } catch (error) {
    console.error('Error processing driver location1:', error);
  }
};

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
//10 MIN
cron.schedule('*/1 * * * *', async () => {
  await checkAndProcessRequests();
  await driverNotAcceptedTrips();
  await driverNotArrivedTrips();
  await changeDriverAvailability();
});

cron.schedule('0 0 * * *', async () => {
  await DriverDailyReport();
});

cron.schedule('0 0 * * *', async () => {
  try {
    // Calculate the date 2 days from now
    const twoDaysFromNow = new Date();
    twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);

    // Find subscriptions that expire in exactly 2 days
    const expiringSubscriptions = await DriverSubscription.find({
      Enddate: {
        $gte: new Date(twoDaysFromNow.setHours(0, 0, 0, 0)), // Start of day 2 days from now
        $lt: new Date(twoDaysFromNow.setHours(23, 59, 59, 999)), // End of day 2 days from now
      },
      status: true, // Only active subscriptions
    }).populate('driverId', 'deviceToken'); // Assuming driver has deviceToken field

    // Send notifications
    for (const subscription of expiringSubscriptions) {
      try {
        if (subscription.driverId && subscription.driverId.deviceToken) {
          const userDetails = await Driver.findOne({ _id: subscription.driverId.toString() });

          await sendPushNotification(userDetails.userId.toString(), {
            title: 'Subscription Expiring Soon',
            message: `Your subscription will expire in 2 days (on ${subscription.Enddate.toLocaleDateString()}). Renew now to avoid service interruption.`,
          });
        }
      } catch (error) {
        console.error(`Error sending notification to driver ${subscription.driverId}:`, error);
      }
    }
  } catch (error) {
    console.error('Error in subscription expiration cron job:', error);
  }
});

const DriverDailyReport = async () => {
  if (!mongoose.connection.db) {
    return;
  }
  const { db } = mongoose.connection;

  try {
    // Check if view exists and drop it if it does
    const collections = await db.listCollections({ name: 'driverDailyView' }).toArray();
    if (collections.length > 0) {
      await db.dropCollection('driverDailyView');
    }

    // Always create fresh view with today's data
    await db.createCollection('driverDailyView', {
      viewOn: 'requests',
      pipeline: [
        {
          $match: {
            createdAt: {
              $gte: new Date(new Date().setHours(0, 0, 0, 0)), // Start of today
              $lt: new Date(new Date().setHours(23, 59, 59, 999)), // End of today
            },
          },
        },
        {
          $lookup: {
            from: 'requestbills',
            localField: '_id',
            foreignField: 'requestId',
            as: 'billing',
          },
        },
        {
          $unwind: { path: '$billing', preserveNullAndEmptyArrays: true },
        },
        {
          $project: {
            driverId: 1,
            isCompleted: 1,
            isCancelled: 1,
            billing: { $ifNull: ['$billing', { totalAmount: 0 }] },
          },
        },
        {
          $group: {
            _id: '$driverId',
            todayCompleted: { $sum: { $cond: ['$isCompleted', 1, 0] } },
            todayCancelled: { $sum: { $cond: ['$isCancelled', 1, 0] } },
            totalAmount: { $sum: '$billing.totalAmount' },
            totalAssigned: {
              $sum: {
                $cond: [{ $and: [{ $eq: ['$isCompleted', false] }, { $eq: ['$isCancelled', false] }] }, 1, 0],
              },
            },
          },
        },
        {
          $project: {
            driverId: '$_id',
            todayCompleted: 1,
            todayCancelled: 1,
            totalAmount: 1,
            totalAssigned: 1,
            _id: 0,
          },
        },
      ],
    });
  } catch (error) {
    console.error('Error in DriverDailyReport:', error);
    throw error;
  }
};

const driverNotAcceptedTrips = async () => {
  const now = Date.now();

  try {
    const requests = await Request.find({
      isDriverStarted: false,
      isDriverArrived: false,
      isCancelled: false,
      driverId: null,
    });

    if (requests.length > 0) {
      for (const request of requests) {
        const tripStartTime = new Date(request.tripStartTime).getTime();
        const tenMinutesLater = tripStartTime + 10 * 60 * 1000;

        if (now > tenMinutesLater) {
          try {
            // Update only the cancellation-related fields
            await Request.updateOne(
              { _id: request._id },
              {
                $set: {
                  cancelledAt: moment(),
                  isCancelled: true,
                  cancelMethod: 'Automatic',
                },
              },
            );

            // Notify the user
            await sendPushNotification(request.userId.toString(), {
              title: 'Trip Cancelled',
              message: 'Driver not accepted the trip, so the trip was cancelled',
            });

            const userTopic = `${mqttConfig.USER_REQUEST}${request.userId.toString()}`;
            const responseData = await getRequestListData(request._id);

            // Publish MQTT message
            await MqttService.publishMessage(
              userTopic,
              JSON.stringify({
                title: 'Trip Cancelled',
                message: 'Driver not accepted the trip, so the trip was cancelled',
                trip: responseData[0],
              }),
            );
          } catch (updateError) {
            console.error(`Error updating request ${request._id}:`, updateError);
            // Continue with next request even if this one fails
            continue;
          }
        }
      }
    } else {
      console.log('No requests to process: trip not accepted.');
    }
  } catch (error) {
    console.error('Error processing requests:', error);
  }
};

const driverNotArrivedTrips = async () => {
  const now = Date.now();

  try {
    const requests = await Request.find({
      isDriverStarted: true,
      isDriverArrived: false,
      isCancelled: false,
    });

    if (requests.length > 0) {
      for (const request of requests) {
        const tripStartTime = new Date(request.tripStartTime).getTime();
        const threeHoursLater = tripStartTime + 3 * 60 * 60 * 1000;

        if (now >= threeHoursLater) {
          request.cancelledAt = moment();
          request.isCancelled = true;
          request.cancelMethod = 'Automatic';
          await request.save();

          const driverLocation = await DriverLocation.findOne({ driverId: new ObjectId(request.driverId) });
          if (driverLocation) {
            driverLocation.isAvailable = true;
            await driverLocation.save();
          }

          const responseData = await getRequestListData(request._id);

          // Notify the driver
          await sendPushNotification(request.driverId.toString(), {
            title: 'Trip Cancelled',
            message: 'Driver not arrived,so the trip cancelled',
          });

          const driverTopic = `${mqttConfig.DRIVER_REQUEST}${request.driverId.toString()}`;

          // let driverTopic = "driver/request/" + request.driverId.toString();

          // Publish MQTT message
          await MqttService.publishMessage(
            driverTopic,
            JSON.stringify({
              title: 'Trip Cancelled',
              message: 'Driver not arrived,so the trip cancelled',
              trip: responseData[0],
            }),
          );

          // Notify the user
          await sendPushNotification(request.userId.toString(), {
            title: 'Trip Cancelled',
            message: 'Driver not arrived,so the trip cancelled',
          });

          const userTopic = `${mqttConfig.USER_REQUEST}${request.userId.toString()}`;

          // let userTopic = "user/request/" + request.userId.toString();

          // Publish MQTT message
          await MqttService.publishMessage(
            userTopic,
            JSON.stringify({
              title: 'Trip Cancelled',
              message: 'Driver not arrived,so the trip cancelled',
              trip: responseData[0],
            }),
          );
        }
      }
    } else {
      console.log('No requests to process:driver not arrived.');
    }
  } catch (error) {
    console.error('Error processing requests:', error);
  }
};


const changeDriverAvailability = async () => {
  try {
    const nowInMicroseconds = Date.now() * 1000;
    const thirtyMinutesAgo = nowInMicroseconds - 30 * 60 * 1000 * 1000;

    const driver = await DriverLocation.find({ lastUpdated: { $lt: thirtyMinutesAgo }, isAvailable: true });

    if (driver.length > 0) {
      await DriverLocation.updateMany(
        { _id: { $in: driver.map((record) => record._id) } },
        { $set: { isAvailable: false } },
      );
    } else {
      console.log('no driver available');
    }
  } catch (error) {
    console.error('Error getting drivers:', error);
  }
};
