const { Request, Driver, RequestMeta, RequestBid } = require('../../../models');
const ApiError = require('../../../utils/ApiError');
const httpStatus = require('http-status');
const tokenService = require('../../token.service');
const mqttService = require('../../../services/mqtt/mqtt.service');
const { sendPushNotification } = require('../../../utils/commonFunction');
const { mqttConfig } = require('../../../config/string')

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


const cancelTrips = async (req) => {
    let userId = await getUserId(req);

    const { requestId, reasonId, role } = req.body;
    try {
        const tripRequest = await Request.findById(requestId);
        if (!tripRequest) {
            throw new ApiError(httpStatus.NOT_FOUND, 'Trip request not found');
        }


        // send Push notification Trip Arrived
        if (tripRequest.isDriverStarted && role == "Driver") {
            const driver = await Driver.findById(tripRequest.driverId);

            if (!driver) {
                throw new ApiError(httpStatus.NOT_FOUND, 'Driver not found.');
            }


            tripRequest.cancelledAt = new Date();
            tripRequest.isCancelled = true;
            tripRequest.canceledBy = userId;
            tripRequest.reasonId = reasonId;
            tripRequest.cancelMethod = 'Driver';
            await tripRequest.save();


            // const driverTopic = mqttConfig.DRIVER_REQUEST + "" + tripRequest.driverId;

            //  `driver/request/${tripRequest.driverId}`

            const userTopic = mqttConfig.USER_REQUEST + "" + tripRequest.userId;

            // `user/request/${tripRequest.userId}`

            // await mqttService.publishMessage(
            //     driverTopic,
            //     JSON.stringify({
            //         title: "TRIP_CANCELLED",
            //         message: "Trip Cancelled By User"
            //     })
            // );


            await mqttService.publishMessage(
                userTopic,
                JSON.stringify({
                    title: "TRIP_CANCELLED",
                    message: "Trip Cancelled By Driver"
                })
            );

            await sendPushNotification(tripRequest.userId.toString(), {
                title: "TRIP_CANCELLED",
                message: "Trip Cancelled By Driver"
            });

            await sendPushNotification(driver.userId.toString(), {
                title: "TRIP_CANCELLED",
                message: "Trip Cancelled By Driver"
            });


            const fdata = {
                'requestDetail': tripRequest,
                'message': 'Your Ride Is Canceled'
            }

            const filter = { requestId: requestId };
            await RequestMeta.deleteMany(filter);

            return fdata;
        }
        else if (role == "Driver") {


            const trip = await RequestMeta.find({ requestId: requestId, active: true });

            if (!trip) {
                throw new ApiError(httpStatus.NOT_FOUND, 'Trip not found.');
            }


            tripRequest.cancelledAt = new Date();
            tripRequest.isCancelled = true;
            tripRequest.canceledBy = userId;
            tripRequest.cancelMethod = 'Driver';
            await tripRequest.save();

            const driverTopic = mqttConfig.DRIVER_REQUEST + "" + trip[0].driverId;

            // driver/request/` + trip[0].driverId

            await mqttService.publishMessage(
                driverTopic,
                JSON.stringify({
                    title: "TRIP_CANCELLED",
                    message: "Trip Cancelled By User"
                })
            );


            await sendPushNotification([trip[0].driverId], {
                title: "TRIP_CANCELLED",
                message: "Trip Cancelled By user"
            });

            const userTopic = mqttConfig.USER_REQUEST + "" + tripRequest.userId;

            // `user/request/${tripRequest.userId}`

            await mqttService.publishMessage(
                userTopic,
                JSON.stringify({
                    title: "TRIP_CANCELLED",
                    message: "Trip Cancelled By Driver"
                })
            );

            await sendPushNotification([tripRequest.userId], {
                title: "TRIP_CANCELLED",
                message: "Trip Cancelled By Driver"
            });


            const fdata = {
                'requestDetail': tripRequest,
                'message': 'Your Ride Is Canceled'
            }


            return fdata;
        }
        else if (role == "User") {
            const trip = await RequestMeta.find({ requestId: requestId, active: true });
            
            if (!trip) {
                throw new ApiError(httpStatus.NOT_FOUND, 'Trip not found.');
            }
        
            // Common cancellation logic
            tripRequest.cancelledAt = new Date();
            tripRequest.isCancelled = true;
            tripRequest.canceledBy = userId;
            tripRequest.cancelMethod = 'User';
            await tripRequest.save();
        
            // Determine driver (either from tripRequest or trip[0])
            const driverId = tripRequest.driverId || (trip[0]?.driverId || null);
            let driver = driverId ? await Driver.findById(driverId) : null;
        
            // Notify driver if exists
            if (driver) {
                const driverTopic = mqttConfig.DRIVER_REQUEST + driver._id;
                
                await mqttService.publishMessage(
                    driverTopic,
                    JSON.stringify({
                        title: "TRIP_CANCELLED",
                        message: "Trip Cancelled By User",
                        trip: tripRequest
                    })
                );
        
                await sendPushNotification(driver.userId.toString(), {
                    title: "TRIP_CANCELLED",
                    message: "Trip Cancelled By user"
                });
            }else{
                const filter = { requestId: requestId };
                await RequestBid.deleteMany(filter);
            }
        
            // Clean up and return response
            const filter = { requestId: requestId };
            await RequestMeta.deleteMany(filter);
        
            return {
                'requestDetail': trip,
                'message': 'Your Ride Is Canceled'
            };
        }

    } catch (err) {
        throw new Error(err.message);
    }

};


module.exports = {
    cancelTrips
};
