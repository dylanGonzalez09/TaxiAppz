const {
  Request,
  RequestPlace,
  Driver,
  RequestMeta,
  requestListView,
  RequestDriverData,
  Settings,
  Wallet,
} = require('../../../models');
const ApiError = require('../../../utils/ApiError');
const httpStatus = require('http-status').default || require('http-status').status || require('http-status');
const tokenService = require('../../token.service');
const mqttService = require('../../../services/mqtt/mqtt.service');
const {
  sendNotification,
  sendClientNotification,
  sendPushNotification,
  fetchExcludeDriver,
  getDriverId
} = require('../../../utils/commonFunction');
const mongoose = require('mongoose');
const { mqttConfig } = require('../../../config/string');
const ObjectId = require('mongoose').Types.ObjectId;

const respondTrip = async (req) => {
  let driverId = await getDriverId(req);


  const { requestId, isAccept } = req.body;
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

    if (isAccept) {
      tripRequest.driverVehicleId = null;

      tripRequest.driverId = driverId;
      tripRequest.acceptedAt = new Date();
      tripRequest.isDriverStarted = true;
      tripRequest.requestOtp = generateToken();
      tripRequest.holdStatus = false;
      await tripRequest.save();

      driver.isAvailable = false;
      driver.totalAccept += 1;
      driver.rejectCount = 0;
      await driver.save();

      const filter = { requestId: requestId };
      await RequestMeta.deleteMany(filter);

      let responseData = await getRequestListData(requestId);

      // send Push notification Trip Accepted

      // `user/request/${tripRequest.userId}`


      const topic = mqttConfig.USER_REQUEST + '' + tripRequest.userId;

      setImmediate(async () => {
        try {
          // Send all notifications in parallel
          await mqttService.publishMessage(
            topic,
            JSON.stringify({
              title: 'TRIP_ACCEPTED',
              message: 'The driver is on the way to pick you up.',
              trip: responseData[0],
            })
          );

          await sendPushNotification(tripRequest.userId.toString(), {
            title: 'TRIP_ACCEPTED',
            message: 'The driver is on the way to pick you up.',
          });
        } catch (notificationError) {
          console.error('❌ Notification error (non-blocking):', notificationError);
        }
      });

      const fdata = {
        trip: responseData[0],
        message: 'Trip accepted',
      };

      return fdata;
    } else {
      driver.totalReject += 1;
      driver.rejectCount += 1;
      await driver.save();

      const filter = { requestId: requestId, active: true };

      let ExcludeDriver = await RequestMeta.findOne(filter);
      let requestPlace = await RequestPlace.findOne({ requestId: requestId });
      await RequestMeta.deleteOne(filter);

      const rejectedDriverId = ExcludeDriver?.driverId || driverId;

      // DriverLocation.serviceType matches trip type (LOCAL / RENTAL), not booking mode (RIDE_NOW / RIDE_LATER)
      const serviceTypeForMatch = tripRequest.tripType || 'RENTAL';

      const drivers = await fetchExcludeDriver(
        requestPlace.pickLat,
        requestPlace.pickLng,
        requestPlace.vehicleType,
        serviceTypeForMatch,
        requestPlace.dropLat,
        requestPlace.dropLng,
        rejectedDriverId
      );

      const nextRequestMeta = await RequestMeta.findOne({ requestId, active: false });

      if (nextRequestMeta) {
        nextRequestMeta.active = true;
        nextRequestMeta.isAvailable = true;
        await nextRequestMeta.save();
        // Notify next driver
        const nextDriver = await Driver.findById(nextRequestMeta.driverId);

        if (nextDriver) {
          // send push and socket data
          let responseData = await getRequestListData(requestId);

          const topic = mqttConfig.DRIVER_REQUEST + '' + nextRequestMeta.driverId;

          //  `driver/request/${nextRequestMeta.driverId}`

          setImmediate(async () => {
            try {
              await mqttService.publishMessage(
                topic,
                JSON.stringify({
                  title: 'TRIP_REJECTED',
                  message: 'New Trip Requested, you can accept or Reject the request',
                  tripDetails: responseData[0],
                })
              );

              const metaDriver = await Driver.findById(nextRequestMeta.driverId);

              await sendPushNotification(metaDriver.userId.toString(), {
                title: 'New Trip Requested',
                message: 'New Trip Requested, you can accept or Reject the request',
              });
            } catch (notificationError) {
              console.error('❌ Notification error (non-blocking):', notificationError);
            }
          });

          // Update the document by pushing the new driverId to the array
          await RequestDriverData.findOneAndUpdate(
            { requestId: requestId }, // Find condition
            { $push: { driverIds: nextRequestMeta.driverId } }, // Update operation
            {
              upsert: true, // Create if doesn't exist
              returnDocument: 'after', // Return the updated document
              setDefaultsOnInsert: true, // Apply schema defaults if creating
            }
          );
        } else {
          console.log('data ----- 4');
        }

        const fdata = {
          trip: tripRequest,
          message: 'Trip rejected',
        };

        return fdata;
      } else if (drivers?.length > 0) {
        // Start transaction to prevent race conditions
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
          // Check driver availability in parallel within transaction
          const excludedDrivers = await RequestDriverData.aggregate([
            { $match: { requestId: new ObjectId(requestId) } },
            { $unwind: '$driverIds' },
            { $group: { _id: null, driverIds: { $addToSet: '$driverIds' } } },
          ]).session(session);

          const excludedDriverIds = excludedDrivers.length > 0 ? excludedDrivers[0].driverIds : [];

          // Then filter available drivers
          const availableDrivers = (
            await Promise.all(
              drivers.map(async (driver) => {
                // Skip if driver is in excluded list
                if (excludedDriverIds.some((id) => id.equals(driver.driverId))) {
                  return null;
                }

                // Check availability
                const isAvailable =
                  (await RequestMeta.countDocuments({
                    driverId: driver.driverId,
                    active: true,
                  }).session(session)) === 0;

                return isAvailable ? driver : null;
              })
            )
          ).filter(Boolean);

          if (availableDrivers.length === 0) {
            // No available drivers - cancel trip
            tripRequest.cancelledAt = new Date();
            tripRequest.isCancelled = true;
            tripRequest.cancelMethod = 'Automatic';
            await tripRequest.save({ session });

            let responseData = await getRequestListData(requestId);

            // send push and socket data

            const topic = mqttConfig.USER_REQUEST + '' + responseData[0].userId;

            // `user/request/${responseData[0].userId}`

            setImmediate(async () => {
              try {
                await mqttService.publishMessage(
                  topic,
                  JSON.stringify({
                    title: 'NO_DRIVERS',
                    message: 'No Drivers Avaliable',
                    trip: responseData[0],
                  })
                );

                await sendPushNotification(responseData[0].userId.toString(), {
                  title: 'NO_DRIVERS',
                  message: 'No Drivers Avaliable',
                });
              } catch (notificationError) {
                console.error('❌ Notification error (non-blocking):', notificationError);
              }
            });

            const fdata = {
              message: 'TRIP_REJECTED',
              trip: responseData[0],
            };

            await session.commitTransaction();
            session.endSession();

            return fdata;
          } else {
            // Get existing driver assignments if any
            const existingAssignments = await RequestDriverData.findOne({ requestId: requestId }, null, { session });

            // Filter out drivers already assigned to this request
            const newDrivers = existingAssignments
              ? availableDrivers.filter(
                  (d) => !existingAssignments.driverIds.some((id) => id.equals(d.driverId))
                )
              : availableDrivers;

            // Prepare new driver assignments
            const driverAssignments = newDrivers.map((driver, index) => ({
              userId: driver.userId,
              requestId: requestId,
              driverId: driver.driverId,
              active: index === 0 ? 1 : 0, // First driver active
              assignMethod: 1,
            }));

            // Save new assignments if any
            if (driverAssignments.length > 0) {
              await RequestMeta.insertMany(driverAssignments, { session });

              // Update RequestDriverData with all driver IDs (using addToSet to prevent duplicates)
              await RequestDriverData.findOneAndUpdate(
                { requestId: requestId },
                {
                  $addToSet: {
                    driverIds: { $each: driverAssignments.map((d) => d.driverId) },
                  },
                },
                {
                  upsert: true,
                  returnDocument: 'after',
                  setDefaultsOnInsert: true,
                  session,
                }
              );
            }

            // Get first available driver (either newly assigned or existing)
            const firstDriver = driverAssignments.length > 0 ? driverAssignments[0] : availableDrivers[0];

            // Get response data
            const responseData = await getRequestListData(requestId);

            // Commit transaction before sending notifications
            await session.commitTransaction();
            session.endSession();

            const topic = mqttConfig.DRIVER_REQUEST + '' + firstDriver.driverId;

            // `driver/request/${firstDriver.driverId}`

            // Send notifications in parallel

            setImmediate(async () => {
              try {
                await Promise.all([
                  sendPushNotification(firstDriver.userId, {
                    title: 'New Trip Requested',
                    message: 'New Trip Requested, you can accept or Reject the request',
                  }),
                  mqttService.publishMessage(
                    topic,
                    JSON.stringify({
                      title: 'New Trip Requested',
                      message: 'New Trip Requested, you can accept or Reject the request',
                      tripDetails: responseData[0],
                    })
                  ),
                ]);
              } catch (notificationError) {
                console.error('❌ Notification error (non-blocking):', notificationError);
              }
            });

            return {
              trip: responseData[0],
              message: 'New Trip Requested',
            };
          }
        } catch (error) {
          // Clean up transaction on error
          await session.abortTransaction();
          session.endSession();
          throw error;
        }
      } else {
        // No drivers available, notify user
        tripRequest.isCancelled = true;
        tripRequest.cancelMethod = 'Automatic';
        await tripRequest.save();

        let responseData = await getRequestListData(requestId);

        const topic = mqttConfig.USER_REQUEST + '' + tripRequest.userId;

        // `user/request/${tripRequest.userId}`
        // send push and socket data

        setImmediate(async () => {
          try {
            await mqttService.publishMessage(
              topic,
              JSON.stringify({
                title: 'NO_DRIVERS',
                message: 'No Drivers Avaliable',
                trip: responseData[0],
              })
            );

            await sendPushNotification(tripRequest.userId.toString(), {
              title: 'NO_DRIVERS',
              message: 'No Drivers Avaliable',
            });
          } catch (notificationError) {
            console.error('❌ Notification error (non-blocking):', notificationError);
          }
        });

        const fdata = {
          message: 'TRIP_REJECTED',
          trip: tripRequest,
        };
        return fdata;
      }
    }
  } catch (err) {
    console.error(err);
    // throw new Error(err.message);
    throw err
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

function generateToken() {
  const randomNum = Math.random() * 9000;
  return Math.floor(1000 + randomNum);
}

const locationChangeTrip = async (req) => {
  const {
    dropLat,
    dropLng,
    dropAddress,
    pickLat,
    pickLng,
    pickAddress,
    stopLat,
    stopLng,
    stopAddress,
    requestId,
    isAccept,
  } = req.body;
  try {
    const trip = await Request.findById(requestId);
    if (!trip) {
      throw new ApiError(httpStatus.NOT_FOUND, 'trip');
    }

    const tripPlaceRequest = await RequestPlace.findOne({ requestId: requestId });
    if (!tripPlaceRequest) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Trip Place not found');
    }

    if (isAccept) {
      if (dropLat != null) {
        tripPlaceRequest.dropLat = dropLat;
        tripPlaceRequest.dropLng = dropLng;
        tripPlaceRequest.dropAddress = dropAddress;
      }

      if (pickLat != null) {
        tripPlaceRequest.pickLat = pickLat;
        tripPlaceRequest.pickLng = pickLng;
        tripPlaceRequest.pickAddress = pickAddress;
      }

      if (stopLat != null) {
        tripPlaceRequest.stopLat = stopLat;
        tripPlaceRequest.stopLng = stopLng;
        tripPlaceRequest.stopAddress = stopAddress;
      }

      await tripPlaceRequest.save();

      trip.locationChanged = false;
      trip.locationChangeAddress = null;
      await trip.save();

      let responseData = await getRequestListData(requestId);

      const topic = mqttConfig.USER_REQUEST + '' + trip.userId;

      // `user/request/${trip.userId}`

      await mqttService.publishMessage(
        topic,
        JSON.stringify({
          title: 'LOCATION CHANGE',
          message: 'Driver Accept the Latest Location Change',
          trip: responseData[0],
        })
      );

      await sendPushNotification(trip.userId.toString(), {
        title: 'LOCATION CHANGE',
        message: 'Driver Accept the Latest Location Change',
      });

      const fdata = {
        trip: responseData[0],
        message: 'Driver Accept the Latest Location Change',
      };
      return fdata;
    } else {
      // No drivers available, notify user
      trip.locationChanged = false;
      trip.locationChangeAddress = null;
      await trip.save();

      let responseData = await getRequestListData(requestId);
      // send push and socket data

      const topic = mqttConfig.USER_REQUEST + '' + trip.userId;

      // `user/request/${trip.userId}`

      await mqttService.publishMessage(
        topic,
        JSON.stringify({
          title: 'LOCATION CHANGE DENIED',
          message: 'Driver Denied the Latest Location Change',
          trip: responseData[0],
        })
      );

      await sendPushNotification(trip.userId.toString(), {
        title: 'LOCATION CHANGE DENIED',
        message: 'Driver Denied the Latest Location Change',
      });

      const fdata = {
        message: 'LOCATION CHANGE DENIED',
        trip: responseData[0],
      };
      return fdata;
    }
  } catch (err) {
    console.error(err);
    throw new Error(err.message);
  }
};

module.exports = {
  respondTrip,
  locationChangeTrip,
};
