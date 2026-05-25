const { Request, RequestPlace, Driver, RequestMeta, RequestDriverData, DriverBidListView, Settings, RequestBid, requestListView,PromoCode } = require('../../../models');
const ApiError = require('../../../utils/ApiError');
const httpStatus = require('http-status');
const tokenService = require('../../token.service');
const mqttService = require('../../../services/mqtt/mqtt.service');
const { sendNotification, sendClientNotification, sendPushNotification, fetchExcludeDriver, fetchDispatchExcludeDriver } = require('../../../utils/commonFunction');
const mongoose = require('mongoose');
const { mqttConfig } = require('../../../config/string')
const ObjectId = require('mongoose').Types.ObjectId
const moment = require('moment');


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

    driverId = driver[0]._id ? driver[0]._id : null;

    return driverId;
}


const getUserId = async (req) => {

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


    return userId;
}



const respondTrip = async (req) => {
    let driverId = await getDriverrId(req);

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
            tripRequest.driverId = driverId;
            tripRequest.acceptedAt = new Date();
            tripRequest.isDriverStarted = true;
            // tripRequest.requestOtp = generateToken();
            tripRequest.holdStatus = false;
            await tripRequest.save();

            driver.isAvailable = false;
            driver.totalAccept += 1;
            driver.rejectCount = 0;
            await driver.save();


            const filter = { requestId: requestId };
            await RequestMeta.deleteMany(filter);


            let responseData = await getRequestListData(requestId)

            // send Push notification Trip Accepted


            // `user/request/${tripRequest.userId}`

            const topic = mqttConfig.USER_REQUEST + "" + tripRequest.userId;

            await mqttService.publishMessage(
                topic,
                JSON.stringify({
                    title: "TRIP_ACCEPTED",
                    message: "The driver is on the way to pick you up.",
                    trip: responseData[0]
                })
            );


            await sendPushNotification(tripRequest.userId.toString(), {
                title: "TRIP_ACCEPTED",
                message: "The driver is on the way to pick you up."
            });
            const fdata = {
                trip: responseData[0],
                'message': 'Trip accepted',
            }
            return fdata;
        }
        else {
            driver.totalReject += 1;
            driver.rejectCount += 1;
            await driver.save();

            const filter = { requestId: requestId, active: true };


            let ExcludeDriver = await RequestMeta.findOne(filter);
            let requestPlace = await RequestPlace.findOne({ requestId: requestId })
            await RequestMeta.deleteOne(filter);

            let drivers;
            if(tripRequest.ifDispatch === false)
            {
                drivers = await fetchExcludeDriver(requestPlace.pickLat, requestPlace.pickLng, requestPlace.vehicleType, tripRequest.rideType, requestPlace.dropLat, requestPlace.dropLng, ExcludeDriver?.driverId, tripRequest.zoneId);
            }
            else
            {
                drivers = await fetchDispatchExcludeDriver(tripRequest.adminDemoKey,requestPlace.pickLat, requestPlace.pickLng, requestPlace.vehicleType, tripRequest.rideType, requestPlace.dropLat, requestPlace.dropLng, ExcludeDriver?.driverId, tripRequest.zoneId);
            }
            const nextRequestMeta = await RequestMeta.findOne({ requestId, active: false });

            if (nextRequestMeta) {
                nextRequestMeta.active = true;
                nextRequestMeta.isAvailable = true;
                await nextRequestMeta.save();
                // Notify next driver
                const nextDriver = await Driver.findById(nextRequestMeta.driverId);



                if (nextDriver) {
                    // send push and socket data 
                    let responseData = await getRequestListData(requestId)

                    const topic = mqttConfig.DRIVER_REQUEST + "" + nextRequestMeta.driverId;

                    //  `driver/request/${nextRequestMeta.driverId}`

                    await mqttService.publishMessage(
                        topic,
                        JSON.stringify({
                            title: "TRIP_REJECTED",
                            message: "New Trip Requested, you can accept or Reject the request",
                            tripDetails: responseData[0]
                        })
                    );

                    const metaDriver = await Driver.findById(nextRequestMeta.driverId);

                    await sendPushNotification(metaDriver.userId.toString(), {
                        title: "New Trip Requested",
                        message: "New Trip Requested, you can accept or Reject the request"
                    });


                    // Update the document by pushing the new driverId to the array
                    await RequestDriverData.findOneAndUpdate(
                        { requestId: requestId }, // Find condition
                        { $push: { driverIds: nextRequestMeta.driverId } }, // Update operation
                        {
                            upsert: true, // Create if doesn't exist
                            new: true, // Return the updated document
                            setDefaultsOnInsert: true // Apply schema defaults if creating
                        }
                    );

                } else {
                    console.log("data ----- 4")
                }

                const fdata = {
                    'trip': tripRequest,
                    'message': 'Trip rejected'
                }

                return fdata;
            }
            else if (drivers?.length > 0) {



                // Start transaction to prevent race conditions
                const session = await mongoose.startSession();
                session.startTransaction();

                try {
                    // Check driver availability in parallel within transaction
                    const excludedDrivers = await RequestDriverData.aggregate([
                        { $match: { requestId: new ObjectId(requestId) } },
                        { $unwind: "$driverIds" },
                        { $group: { _id: null, driverIds: { $addToSet: "$driverIds" } } }
                    ]).session(session);

                    const excludedDriverIds = excludedDrivers.length > 0 ? excludedDrivers[0].driverIds : [];

                    // Then filter available drivers
                    const availableDrivers = (await Promise.all(
                        drivers.map(async (driver) => {
                            // Skip if driver is in excluded list
                            if (excludedDriverIds.some(id => id.equals(driver.driverId))) {
                                return null;
                            }

                            // Check availability
                            const isAvailable = await RequestMeta.countDocuments({
                                driverId: driver.driverId,
                                active: true
                            }).session(session) === 0;

                            return isAvailable ? driver : null;
                        })
                    )).filter(Boolean);


                    if (availableDrivers.length === 0) {
                        // No available drivers - cancel trip
                        tripRequest.cancelledAt = new Date();
                        tripRequest.isCancelled = true;
                        tripRequest.cancelMethod = 'Automatic';
                        await tripRequest.save({ session });

                        let responseData = await getRequestListData(requestId);




                        // send push and socket data 

                        const topic = mqttConfig.USER_REQUEST + "" + responseData[0].userId;

                        // `user/request/${responseData[0].userId}`


                        await mqttService.publishMessage(
                            topic,
                            JSON.stringify({
                                title: "NO_DRIVERS",
                                message: "No Drivers Avaliable",
                                trip: responseData[0]
                            })
                        );

                        await sendPushNotification(responseData[0].userId.toString(), {
                            title: "NO_DRIVERS",
                            message: "No Drivers Avaliable"
                        });


                        const fdata = {
                            'message': 'TRIP_REJECTED',
                            'trip': responseData[0]
                        }

                        await session.commitTransaction();
                        session.endSession();


                        return fdata;
                    }
                    else {



                        // Get existing driver assignments if any
                        const existingAssignments = await RequestDriverData.findOne(
                            { requestId: requestId },
                            null,
                            { session }
                        );

                        // Filter out drivers already assigned to this request
                        const newDrivers = existingAssignments
                            ? availableDrivers.filter(d =>
                                !existingAssignments.driverIds.includes(d.driverId))
                            : availableDrivers;

                        // Prepare new driver assignments
                        const driverAssignments = newDrivers.map((driver, index) => ({
                            userId: driver.userId,
                            requestId: requestId,
                            driverId: driver.driverId,
                            active: index === 0 ? 1 : 0,  // First driver active
                            assignMethod: 1
                        }));

                        // Save new assignments if any
                        if (driverAssignments.length > 0) {
                            await RequestMeta.insertMany(driverAssignments, { session });

                            // Update RequestDriverData with all driver IDs (using addToSet to prevent duplicates)
                            await RequestDriverData.findOneAndUpdate(
                                { requestId: requestId },
                                {
                                    $addToSet: {
                                        driverIds: { $each: driverAssignments.map(d => d.driverId) }
                                    }
                                },
                                {
                                    upsert: true,
                                    new: true,
                                    setDefaultsOnInsert: true,
                                    session
                                }
                            );
                        }

                        // Get first available driver (either newly assigned or existing)
                        const firstDriver = driverAssignments.length > 0
                            ? driverAssignments[0]
                            : availableDrivers[0];

                        // Get response data
                        const responseData = await getRequestListData(requestId);

                        // Commit transaction before sending notifications
                        await session.commitTransaction();
                        session.endSession();


                        const topic = mqttConfig.DRIVER_REQUEST + "" + firstDriver.driverId;

                        // `driver/request/${firstDriver.driverId}`

                        // Send notifications in parallel
                        await Promise.all([
                            sendClientNotification(clientId, {
                                title: "New Trip Requested",
                                message: "New Trip Requested Received"
                            }),
                            sendPushNotification(firstDriver.userId, {
                                title: "New Trip Requested",
                                message: "New Trip Requested, you can accept or Reject the request"
                            }),
                            mqttService.publishMessage(
                                topic,
                                JSON.stringify({
                                    title: "New Trip Requested",
                                    message: "New Trip Requested, you can accept or Reject the request",
                                    tripDetails: responseData[0]
                                })
                            )
                        ]);

                        return {
                            trip: responseData[0],
                            message: 'New Trip Requested'
                        };
                    }

                } catch (error) {
                    // Clean up transaction on error
                    await session.abortTransaction();
                    session.endSession();
                    throw error;
                }
            }
            else {
                // No drivers available, notify user
                tripRequest.isCancelled = true;
                tripRequest.cancelMethod = 'Automatic';
                await tripRequest.save();

                let responseData = await getRequestListData(requestId)


                const topic = mqttConfig.USER_REQUEST + "" + tripRequest.userId;

                // `user/request/${tripRequest.userId}`
                // send push and socket data 

                await mqttService.publishMessage(
                    topic,
                    JSON.stringify({
                        title: "NO_DRIVERS",
                        message: "No Drivers Avaliable",
                        trip: responseData[0]
                    })
                );

                await sendPushNotification(tripRequest.userId.toString(), {
                    title: "NO_DRIVERS",
                    message: "No Drivers Avaliable"
                });


                const fdata = {
                    'message': 'TRIP_REJECTED',
                    'trip': tripRequest
                }
                return fdata;
            }
        }

    } catch (err) {
        console.error(err);
        throw new Error(err.message);
    }

};

const respondBiddingTrip = async (req) => {
    let driverId = await getDriverrId(req);
    let userId = await getUserId(req);

    const { requestId } = req.body;
    try {

        const tripRequest = await Request.findById(requestId);
        if (!tripRequest) {
            throw new ApiError(httpStatus.NOT_FOUND, 'Trip request not found');
        }
        // Validate trip request
        if (tripRequest.isCompleted || tripRequest.isCancelled) {
            throw new ApiError(httpStatus.UNAUTHORIZED, 'Request already completed or cancelled.');
        }
        const driver = await Driver.findOne({ _id: driverId });


        if (!driver) {
            throw new ApiError(httpStatus.NOT_FOUND, 'Driver not found.');
        }


        driver.totalReject += 1;
        driver.rejectCount += 1;
        await driver.save();
        // Notify next driver or cancel the request
        const nextRequestMeta = await RequestBid.findOne({ requestId: requestId, driverId: userId });
        if (nextRequestMeta) {
            nextRequestMeta.isMissed = 1;
            await nextRequestMeta.save();

            tripRequest.isCancelled = true;
            tripRequest.cancelMethod = 'Driver';
            await tripRequest.save();

            const message = JSON.stringify({
                title: "DRIVER_REJECT_THE_BID",
                message: "Trip Cancelled By driver",
            });

            const DriverTopic = mqttConfig.DRIVER_REQUEST + "" + tripRequest.driverId;


            mqttService.publishMessage(
                DriverTopic,
                message);

            await sendPushNotification(userId, {
                title: "DRIVER_REJECT_THE_BID",
                message: "Trip Cancelled By driver",
            })

            const UserTopic = mqttConfig.DRIVER_REQUEST + "" + tripRequest.userId;


            mqttService.publishMessage(UserTopic,
                JSON.stringify({
                    title: "DRIVER_REJECT_THE_BID",
                    message: "Trip Cancelled By driver",
                    trip: tripRequest
                }));

            await sendPushNotification(tripRequest.userId, {
                title: "DRIVER_REJECT_THE_BID",
                message: "Trip Cancelled By driver",
            })


        } else {
            // No drivers available, notify user
            tripRequest.isCancelled = true;
            tripRequest.cancelMethod = 'No Drivers Available';
            await tripRequest.save();

            const message = JSON.stringify({
                title: "DRIVER_REJECT_THE_BID",
                message: "No Drivers Available",
            });

            const UserTopic = mqttConfig.DRIVER_REQUEST + "" + tripRequest.userId;

            mqttService.publishMessage(UserTopic,
                JSON.stringify({
                    title: "DRIVER_REJECT_THE_BID",
                    message: "No Drivers Available"
                }));



            await sendPushNotification(tripRequest.userId, {
                title: "DRIVER_REJECT_THE_BID",
                message: "No Drivers Available",
            })
        }

        const fdata = {
            'requestDetail': tripRequest,
            'message': 'Trip rejected'
        }
        return fdata;
        // }

    } catch (err) {
        console.error(err);
        throw new Error(err.message);
    }

};

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

function generateToken() {
    const randomNum = Math.random() * 9000
    return Math.floor(1000 + randomNum)
}

const locationChangeTrip = async (req) => {

    const { dropLat, dropLng, dropAddress, pickLat, pickLng, pickAddress, stopLat, stopLng, stopAddress, requestId, isAccept } = req.body;
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



            const topic = mqttConfig.USER_REQUEST + "" + trip.userId;

            // `user/request/${trip.userId}`

            await mqttService.publishMessage(
                topic,
                JSON.stringify({
                    title: "LOCATION CHANGE",
                    message: "Driver Accept the Latest Location Change",
                    trip: responseData[0]

                })
            );


            await sendPushNotification(trip.userId.toString(), {
                title: "LOCATION CHANGE",
                message: "Driver Accept the Latest Location Change"
            });

            const fdata = {
                trip: responseData[0],
                'message': 'Driver Accept the Latest Location Change',
            }
            return fdata;
        } else {
            // No drivers available, notify user
            trip.locationChanged = false;
            trip.locationChangeAddress = null;
            await trip.save();

            let responseData = await getRequestListData(requestId)
            // send push and socket data 


            const topic = mqttConfig.USER_REQUEST + "" + trip.userId;

            // `user/request/${trip.userId}`

            await mqttService.publishMessage(
                topic,
                JSON.stringify({
                    title: "LOCATION CHANGE DENIED",
                    message: "Driver Denied the Latest Location Change",
                    trip: responseData[0]
                })
            );

            await sendPushNotification(trip.userId.toString(), {
                title: "LOCATION CHANGE DENIED",
                message: "Driver Denied the Latest Location Change"
            });


            const fdata = {
                'message': 'LOCATION CHANGE DENIED',
                'trip': responseData[0]
            }
            return fdata;
        }

    } catch (err) {
        console.error(err);
        throw new Error(err.message);
    }

};

//bidding view request

const driverRequestViewList = async (req) => {

    const driverId = await getDriverrId(req);

    return await DriverBidListView.aggregate([
        {
            $match: {
                bidDriverId: new ObjectId(driverId),
            }
        }
    ]);
};

//bidding single request view

const getUserRequests = async (req) => {

    if (!req.body.requestId || !ObjectId.isValid(req.body.requestId)) {
        throw new Error("Invalid Request ID.");
    }

    const userId = await getUserId(req);
    const requestId = new ObjectId(req.body.requestId);


    const request = await Request.aggregate([
        {
            $match: {
                _id: requestId,
                userId: new ObjectId(userId),
                driverId: null,
                isCompleted: false,
                isCancelled: false
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'userId',
                foreignField: '_id',
                as: 'userDetails'
            }
        },
        { $unwind: { path: '$userDetails', preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: 'vehicles',
                localField: 'vehicleId',
                foreignField: '_id',
                as: 'vehicleDetails'
            }
        },
        { $unwind: { path: '$vehicleDetails', preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: 'requestplaces',
                localField: '_id',
                foreignField: 'requestId',
                as: 'requestPlace'
            }
        },
        { $unwind: { path: '$requestPlace', preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: 'requestbids',
                localField: '_id',
                foreignField: 'requestId',
                as: 'requestBids',
                pipeline: [
                    {
                        $match: {
                            isMissed: 0
                        }
                    }
                ]
            }
        },
        { $unwind: { path: '$requestBids', preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: 'drivers',
                localField: 'requestBids.driverId',
                foreignField: '_id',
                as: 'bitRequestdriverDetails'
            }
        },
        { $unwind: { path: '$bitRequestdriverDetails', preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: 'users',
                localField: 'bitRequestdriverDetails.userId',
                foreignField: '_id',
                as: 'driverDetails'
            }
        },
        { $unwind: { path: '$driverDetails', preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: 'vehicles',
                localField: 'bitRequestdriverDetails.type',
                foreignField: '_id',
                as: 'bitRequestdriverVehicles'
            }
        },
        {
            $lookup: {
              from: 'zones',
              localField: 'zoneId',
              foreignField: '_id',
              as: 'zoneDetails'
            }
          },
          {
            $unwind: {
              path: '$zoneDetails',
              preserveNullAndEmptyArrays: true,
            }
          },
        {
            $lookup: {
                from: 'vehiclemodels',
                localField: 'bitRequestdriverDetails.carModel',
                foreignField: '_id',
                as: 'bitRequestdriverVehicles'
            }
        },
        { $unwind: { path: '$bitRequestdriverVehicles', preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: 'driverlocations',
                localField: 'bitRequestdriverDetails._id',
                foreignField: 'driverId',
                as: 'DriverLocationDetails'
            }
        },
        { $unwind: { path: '$DriverLocationDetails', preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: 'requestratings',
                let: { driverId: '$bitRequestdriverDetails.userId' },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $eq: ['$userId', '$$driverId']
                            }
                        }
                    }
                ],
                as: 'driverAllRatings'
            }
        },
        {
            $addFields: {
                driverAverageRating: {
                    $toInt: {
                        $ifNull: [
                            { $avg: '$driverAllRatings.rating' },
                            0
                        ]
                    }
                }
            }
        },
        {
            $group: {
                _id: '$_id',
                requestNumber: { $first: '$requestNumber' },
                requestOtp: { $first: '$requestOtp' },
                isLater: { $first: '$isLater' },
                tripStartTime: { $first: '$tripStartTime' },
                arrivedAt: { $first: '$arrivedAt' },
                acceptedAt: { $first: '$acceptedAt' },
                completedAt: { $first: '$completedAt' },
                cancelledAt: { $first: '$cancelledAt' },
                isDriverStarted: { $first: '$isDriverStarted' },
                isDriverArrived: { $first: '$isDriverArrived' },
                biddigZone: { $first: '$zoneDetails.biddingZone' },
                estAmount: { $first: '$etaAmount' },
                isTripStart: { $first: '$isTripStart' },
                isCompleted: { $first: '$isCompleted' },
                isCancelled: { $first: '$isCancelled' },
                cancelMethod: { $first: '$cancelMethod' },
                reasonId: { $first: '$reasonId' },
                rideType: { $first: '$rideType' },
                unit: { $first: '$unit' },
                requestedCurrencyCode: { $first: '$requestedCurrencyCode' },
                requestedCurrencySymbol: { $first: '$requestedCurrencySymbol' },
                tripType: { $first: '$tripType' },
                clientId: { $first: '$clientId' },
                labour: { $first: '$labour' },
                landmark: { $first: '$landmark' },
                user: {
                    $first: {
                        firstName: '$userDetails.firstName',
                        lastName: '$userDetails.lastName',
                        email: '$userDetails.email',
                        phoneNumber: '$userDetails.phoneNumber'
                    }
                },
                vehicle: {
                    $first: {
                        _id: '$vehicleDetails._id',
                        vehicleName: '$vehicleDetails.vehicleName',
                        capacity: '$vehicleDetails.capacity',
                        image: {
                            $concat: [
                                "/uploads/vehicles/",
                                { $ifNull: ['$vehicleDetails.image', ''] }
                            ]
                        },
                        highlightImage: {
                            $concat: [
                                "/uploads/vehicles/",
                                { $ifNull: ['$vehicleDetails.highlightImage', ''] }
                            ]
                        }
                    }
                },
                requestPlace: {
                    $first: {
                        pickup_lat: '$requestPlace.pickLat',
                        pickup_lang: '$requestPlace.pickLng',
                        pickup_address: '$requestPlace.pickAddress',
                        drop_lat: '$requestPlace.dropLat',
                        drop_lang: '$requestPlace.dropLng',
                        drop_address: '$requestPlace.dropAddress',
                        stopLat: { $ifNull: ['$requestPlace.stopLat', null] },
                        stopLng: { $ifNull: ['$requestPlace.stopLng', null] },
                        stopAddress: { $ifNull: ['$requestPlace.stopAddress', null] },
                    }
                },
                requestBids: {
                    $push: {
                        driverAverageRating: '$driverAverageRating',
                        driverId: '$requestBids.driverId',
                        firstName: '$driverDetails.firstName',
                        phoneNumber: '$driverDetails.phoneNumber',
                        carNumber: '$bitRequestdriverDetails.carNumber',
                        profile: {
                            $concat: [
                                "/uploads/user/",
                                { $ifNull: ['$driverDetails.profilePic', ''] }
                            ]
                        },
                        rating: '$driverDetails.rating',
                        bidAmount: '$requestBids.bidAmount',
                        promoAmount: '$requestBids.promoAmount',
                        estAmount: '$requestBids.estAmount',
                        tripType: '$requestBids.tripType',
                        vehicleModel: '$bitRequestdriverVehicles.modelname',
                        vehicleImage: {
                            $concat: [
                                "/uploads/vehicles/",
                                { $ifNull: ['$bitRequestdriverVehicles.image', ''] }
                            ]
                        },
                        vehicle: {
                            _id: '$bitRequestdriverVehicles._id',
                            vehicleName: '$bitRequestdriverVehicles.vehicleName',
                            image: {
                                $concat: [
                                    "/uploads/vehicles/",
                                    { $ifNull: ['$bitRequestdriverVehicles.image', ''] }
                                ]
                            },
                            highlightImage: {
                                $concat: [
                                    "/uploads/vehicles/",
                                    { $ifNull: ['$bitRequestdriverVehicles.highlightImage', ''] }
                                ]
                            }
                        },
                        distance: {
                            "$toString": {
                                "$multiply": [
                                    6371, // Earth's radius in km
                                    {
                                        "$acos": {
                                            "$add": [
                                                {
                                                    "$multiply": [
                                                        { "$sin": { "$degreesToRadians": "$requestPlace.pickLat" } },
                                                        { "$sin": { "$degreesToRadians": "$DriverLocationDetails.latitude" } }
                                                    ]
                                                },
                                                {
                                                    "$multiply": [
                                                        { "$cos": { "$degreesToRadians": "$requestPlace.pickLat" } },
                                                        { "$cos": { "$degreesToRadians": "$DriverLocationDetails.latitude" } },
                                                        {
                                                            "$cos": {
                                                                "$subtract": [
                                                                    { "$degreesToRadians": "$DriverLocationDetails.longitude" },
                                                                    { "$degreesToRadians": "$requestPlace.pickLng" }
                                                                ]
                                                            }
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    }
                                ]
                            }
                        },
                        minutes: {
                            "$toString": {
                                "$round": [
                                    {
                                        "$multiply": [
                                            {
                                                "$divide": [
                                                    {
                                                        "$multiply": [
                                                            6371, // Earth's radius in km
                                                            {
                                                                "$acos": {
                                                                    "$add": [
                                                                        {
                                                                            "$multiply": [
                                                                                { "$sin": { "$degreesToRadians": "$requestPlace.pickLat" } },
                                                                                { "$sin": { "$degreesToRadians": "$DriverLocationDetails.latitude" } }
                                                                            ]
                                                                        },
                                                                        {
                                                                            "$multiply": [
                                                                                { "$cos": { "$degreesToRadians": "$requestPlace.pickLat" } },
                                                                                { "$cos": { "$degreesToRadians": "$DriverLocationDetails.latitude" } },
                                                                                {
                                                                                    "$cos": {
                                                                                        "$subtract": [
                                                                                            { "$degreesToRadians": "$DriverLocationDetails.longitude" },
                                                                                            { "$degreesToRadians": "$requestPlace.pickLng" }
                                                                                        ]
                                                                                    }
                                                                                }
                                                                            ]
                                                                        }
                                                                    ]
                                                                }
                                                            }
                                                        ]
                                                    },
                                                    40 // Estimated speed in km/h
                                                ]
                                            },
                                            60 // Convert to minutes
                                        ]
                                    },
                                    2 // Round to 2 decimal places
                                ]
                            }
                        }
                    }
                }
            }
        },
        {
            $set: {
                requestBids: { $sortArray: { input: '$requestBids', sortBy: { bidAmount: 1 } } }
            }
        }
    ]);

    return request.length ? request[0] : null;
};

//bidding multiple request view

const getUserAllRequests = async (req) => {

    const userId = await getUserId(req);

    const request = await Request.aggregate([
        {
            $match: {
                userId: new ObjectId(userId),
                driverId: null,
                isCompleted: false,
                isCancelled: false
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'userId',
                foreignField: '_id',
                as: 'userDetails'
            }
        },
        { $unwind: { path: '$userDetails', preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: 'vehicles',
                localField: 'vehicleId',
                foreignField: '_id',
                as: 'vehicleDetails'
            }
        },
        { $unwind: { path: '$vehicleDetails', preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: 'requestplaces',
                localField: '_id',
                foreignField: 'requestId',
                as: 'requestPlace'
            }
        },
        { $unwind: { path: '$requestPlace', preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: 'requestbids',
                localField: '_id',
                foreignField: 'requestId',
                as: 'requestBids',
                pipeline: [
                    {
                        $match: {
                            isMissed: 0
                        }
                    }
                ]
            }
        },
        { $unwind: { path: '$requestBids', preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: 'drivers',
                localField: 'requestBids.driverId',
                foreignField: '_id',
                as: 'driverDetails'
            }
        },
        { $unwind: { path: '$bitRequestdriverDetails', preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: 'drivers',
                localField: 'requestBids.driverId',
                foreignField: '_id',
                as: 'bitRequestdriverDetails'
            }
        },
        { $unwind: { path: '$bitRequestdriverDetails', preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: 'users',
                localField: 'bitRequestdriverDetails.userId',
                foreignField: '_id',
                as: 'driverDetails'
            }
        },
        { $unwind: { path: '$driverDetails', preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: 'vehiclemodels',
                localField: 'bitRequestdriverDetails.carModel',
                foreignField: '_id',
                as: 'bitRequestdriverVehicles'
            }
        },
        { $unwind: { path: '$bitRequestdriverVehicles', preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: 'driverlocations',
                localField: 'bitRequestdriverDetails._id',
                foreignField: 'driverId',
                as: 'DriverLocationDetails'
            }
        },
        { $unwind: { path: '$DriverLocationDetails', preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: 'requestratings',
                let: { driverId: '$bitRequestdriverDetails.userId' },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $eq: ['$userId', '$$driverId']
                            }
                        }
                    }
                ],
                as: 'driverAllRatings'
            }
        },
        {
            $lookup: {
              from: 'zones',
              localField: 'zoneId',
              foreignField: '_id',
              as: 'zoneDetails'
            }
          },
          {
            $unwind: {
              path: '$zoneDetails',
              preserveNullAndEmptyArrays: true,
            }
          },
        {
            $addFields: {
                driverAverageRating: {
                    $toInt: {
                        $ifNull: [
                            { $avg: '$driverAllRatings.rating' },
                            0
                        ]
                    }
                }
            }
        },
        {
            $group: {
                _id: '$_id',
                requestNumber: { $first: '$requestNumber' },
                requestOtp: { $first: '$requestOtp' },
                isLater: { $first: '$isLater' },
                tripStartTime: { $first: '$tripStartTime' },
                arrivedAt: { $first: '$arrivedAt' },
                acceptedAt: { $first: '$acceptedAt' },
                completedAt: { $first: '$completedAt' },
                cancelledAt: { $first: '$cancelledAt' },
                biddigZone: { $first: '$zoneDetails.biddingZone' },
                estAmount: { $first: '$etaAmount' },
                isDriverStarted: { $first: '$isDriverStarted' },
                isDriverArrived: { $first: '$isDriverArrived' },
                isTripStart: { $first: '$isTripStart' },
                isCompleted: { $first: '$isCompleted' },
                isCancelled: { $first: '$isCancelled' },
                cancelMethod: { $first: '$cancelMethod' },
                reasonId: { $first: '$reasonId' },
                rideType: { $first: '$rideType' },
                unit: { $first: '$unit' },
                requestedCurrencyCode: { $first: '$requestedCurrencyCode' },
                requestedCurrencySymbol: { $first: '$requestedCurrencySymbol' },
                tripType: { $first: '$tripType' },
                clientId: { $first: '$clientId' },
                labour: { $first: '$labour' },
                landmark: { $first: '$landmark' },
                user: {
                    $first: {
                        firstName: '$userDetails.firstName',
                        lastName: '$userDetails.lastName',
                        email: '$userDetails.email',
                        phoneNumber: '$userDetails.phoneNumber'
                    }
                },
                vehicle: {
                    $first: {
                        _id: '$vehicleDetails._id',
                        vehicleName: '$vehicleDetails.vehicleName',
                        capacity: '$vehicleDetails.capacity',
                        image: {
                            $concat: [
                                "/uploads/vehicles/",
                                { $ifNull: ['$vehicleDetails.image', ''] }
                            ]
                        },
                        highlightImage: {
                            $concat: [
                                "/uploads/vehicles/",
                                { $ifNull: ['$vehicleDetails.highlightImage', ''] }
                            ]
                        }
                    }
                },
                requestPlace: {
                    $first: {
                        pickup_lat: '$requestPlace.pickLat',
                        pickup_lang: '$requestPlace.pickLng',
                        pickup_address: '$requestPlace.pickAddress',
                        drop_lat: '$requestPlace.dropLat',
                        drop_lang: '$requestPlace.dropLng',
                        drop_address: '$requestPlace.dropAddress',
                        stopLat: { $ifNull: ['$requestPlace.stopLat', null] },
                        stopLng: { $ifNull: ['$requestPlace.stopLng', null] },
                        stopAddress: { $ifNull: ['$requestPlace.stopAddress', null] },
                    }
                },
                requestBids: {
                    $push: {
                        driverAverageRating: '$driverAverageRating',
                        driverId: '$requestBids.driverId',
                        firstName: '$driverDetails.firstName',
                        phoneNumber: '$driverDetails.phoneNumber',
                        carNumber: '$bitRequestdriverDetails.carNumber',
                        profile: {
                            $concat: [
                                "/uploads/user/",
                                { $ifNull: ['$driverDetails.profilePic', ''] }
                            ]
                        },
                        rating: '$driverDetails.rating',
                        bidAmount: '$requestBids.bidAmount',
                        promoAmount: '$requestBids.promoAmount',
                        estAmount: '$requestBids.estAmount',
                        tripType: '$requestBids.tripType',
                        vehicleModel: '$bitRequestdriverVehicles.modelname',
                        vehicleImage: {
                            $concat: [
                                "/uploads/vehicles/",
                                { $ifNull: ['$bitRequestdriverVehicles.image', ''] }
                            ]
                        },
                        vehicle: {
                            _id: '$bitRequestdriverVehicles._id',
                            vehicleName: '$bitRequestdriverVehicles.vehicleName',
                            image: {
                                $concat: [
                                    "/uploads/vehicles/",
                                    { $ifNull: ['$bitRequestdriverVehicles.image', ''] }
                                ]
                            },
                            highlightImage: {
                                $concat: [
                                    "/uploads/vehicles/",
                                    { $ifNull: ['$bitRequestdriverVehicles.highlightImage', ''] }
                                ]
                            }
                        },
                        distance: {
                            "$toString": {
                                "$multiply": [
                                    6371, // Earth's radius in km
                                    {
                                        "$acos": {
                                            "$add": [
                                                {
                                                    "$multiply": [
                                                        { "$sin": { "$degreesToRadians": "$requestPlace.pickLat" } },
                                                        { "$sin": { "$degreesToRadians": "$DriverLocationDetails.latitude" } }
                                                    ]
                                                },
                                                {
                                                    "$multiply": [
                                                        { "$cos": { "$degreesToRadians": "$requestPlace.pickLat" } },
                                                        { "$cos": { "$degreesToRadians": "$DriverLocationDetails.latitude" } },
                                                        {
                                                            "$cos": {
                                                                "$subtract": [
                                                                    { "$degreesToRadians": "$DriverLocationDetails.longitude" },
                                                                    { "$degreesToRadians": "$requestPlace.pickLng" }
                                                                ]
                                                            }
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    }
                                ]
                            }
                        },
                        minutes: {
                            "$toString": {
                                "$round": [
                                    {
                                        "$multiply": [
                                            {
                                                "$divide": [
                                                    {
                                                        "$multiply": [
                                                            6371, // Earth's radius in km
                                                            {
                                                                "$acos": {
                                                                    "$add": [
                                                                        {
                                                                            "$multiply": [
                                                                                { "$sin": { "$degreesToRadians": "$requestPlace.pickLat" } },
                                                                                { "$sin": { "$degreesToRadians": "$DriverLocationDetails.latitude" } }
                                                                            ]
                                                                        },
                                                                        {
                                                                            "$multiply": [
                                                                                { "$cos": { "$degreesToRadians": "$requestPlace.pickLat" } },
                                                                                { "$cos": { "$degreesToRadians": "$DriverLocationDetails.latitude" } },
                                                                                {
                                                                                    "$cos": {
                                                                                        "$subtract": [
                                                                                            { "$degreesToRadians": "$DriverLocationDetails.longitude" },
                                                                                            { "$degreesToRadians": "$requestPlace.pickLng" }
                                                                                        ]
                                                                                    }
                                                                                }
                                                                            ]
                                                                        }
                                                                    ]
                                                                }
                                                            }
                                                        ]
                                                    },
                                                    40 // Estimated speed in km/h
                                                ]
                                            },
                                            60 // Convert to minutes
                                        ]
                                    },
                                    2 // Round to 2 decimal places
                                ]
                            }
                        }
                    }
                }
            }
        },
        {
            $set: {
                requestBids: { $sortArray: { input: '$requestBids', sortBy: { bidAmount: 1 } } }
            }
        }
    ]);

    return request.length ? request : null;
};


const RequestViewList = async (requestId) => {

    return await requestListView.aggregate([
        {
            $match: {
                requestId: new ObjectId(requestId)
            }
        },
    ]);
};

const UpdateBidAmount = async (req) => {
    try {
        const driverId = await getDriverrId(req);

        //chk for trip existence
        const request = await Request.findOne({
            _id: req.body.requestId,
            driverId: null,
            isCompleted: false,
            isCancelled: false,
        });

        if (!request) {
            throw new ApiError(httpStatus.NOT_FOUND, 'Request Not Found');
        }

        // chk whether driver has this request in list
        const driverRequest = await RequestBid.findOne({
            requestId: request._id,
            driverId: driverId,
            tripType: request.tripType
        });

        if (!driverRequest) {
            throw new ApiError(httpStatus.NOT_FOUND, 'Wrong request for this driver');
        }

        if (req.body.bidAmount < driverRequest.estAmount) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Bid amount must be greater than or equal to the estimation amount');
        }

        let promoId = null;

        let promoAmount = 0;

        // Handle promo code
        
        if (request.promoId) {
            const [promocode, promo_count, promo_all_count] = await Promise.all([
              PromoCode.findById(request.promoId),
              Request.countDocuments({ promoId: request.promoId, userId: request.userId, isCompleted: 1 }),
              Request.countDocuments({ promoId: request.promoId, isCompleted: 1 })
            ]);
        
            if (!promocode) throw new ApiError(httpStatus.FORBIDDEN, 'Wrong Promo Code');
            if (promo_count > promocode.promoReuseCount) {
              throw new ApiError(httpStatus.FORBIDDEN, `Sorry! You already ${promocode.promo_count} times used this promo code`);
            }
            if (promo_all_count > promocode.promo_use_count) {
              throw new ApiError(httpStatus.FORBIDDEN, 'Sorry! promo code limit exceeded');
            }
        
            if (promocode.promoType === "fixed") {
              promoId = promocode.id;
              promoAmount = req.body.bidAmount - promocode.amount;
            } else if (promocode.promoType === "percentage") {
              promoId = promocode.id;
              promoAmount = (promocode.percentage / 100) * req.body.bidAmount;
            }
          }


        const updatedBid = await RequestBid.findOneAndUpdate(
            { requestId: new ObjectId(req.body.requestId), driverId: new ObjectId(driverId) },
            { $set: { bidAmount: req.body.bidAmount, promoAmount: promoAmount != 0 ?  promoAmount : 0 } },
            { new: true }
        );

        if (!updatedBid) {
            throw new Error("No matching bid found for update.");
        }

        const tripdetails = await RequestViewList(request._id);

        await sendPushNotification(request.userId, {
            title: "DRIVER_BID_FOR_TRIP",
            message: "driver bid for the trip",
        });

        const userTopic = mqttConfig.USER_REQUEST + "" + request.userId;

        await mqttService.publishMessage(
            userTopic,
            JSON.stringify({
                title: "DRIVER_BID_FOR_TRIP",
                message: "driver bid for the trip",
                tripDetails: tripdetails
            })
        );

        return updatedBid;
    } catch (error) {
        console.error("Error updating bid amount:", error);
        throw error;
    }
};

const AssignRequest = async (req) => {
    try {
        const requestId = req.body.requestId;
        const driverId = req.body.driverId;

        if (!requestId || !ObjectId.isValid(requestId)) {
            throw new Error(`Invalid requestId: ${requestId}`);
        }
        if (!driverId || !ObjectId.isValid(driverId)) {
            throw new Error(`Invalid driverId: ${driverId}`);
        }

        const requestIdObj = new ObjectId(requestId);
        const driverIdObj = new ObjectId(driverId);

        const request = await Request.findOne({ _id: requestId, driverId: null });

        if (!request) {
            throw new ApiError(httpStatus.NOT_FOUND, "Request not found");
        }

        const now = moment();

        // Get 15 minutes ago and 15 minutes in the future using moment()
        const startTime = now.subtract(15, 'minutes').toDate();
        const endTime = now.add(15, 'minutes').toDate();

        const assignedReq = await Request.find({
            driverId: driverIdObj,
            tripStartTime: {
                $gte: startTime,
                $lte: endTime
            },
            isCompleted: false,
            isCancelled: false
        });

        if (assignedReq.length > 0) {
            throw new ApiError(httpStatus.NOT_FOUND, "Sorry...This Driver is assigned to another trip...Kindly choose some other driver..");
        }

        const requestDriver = await RequestBid.findOne({
            requestId: requestIdObj,
            driverId: driverIdObj,
        });

        if (!requestDriver) {
            throw new ApiError(httpStatus.NOT_FOUND, "Trip amount details not found for this driver..kindly choose some other driver");
        }

        await RequestBid.updateMany(
            { requestId: requestIdObj, driverId: { $ne: driverIdObj } },
            { $set: { isMissed: 1 } }
        );
        let tripAmount = 0;
        // if (req.body.payType == 'PAY_NOW') {
        //     tripAmount = req.body.tripAmount;
        // }

        request.driverId = driverId;
        request.acceptedAt = moment();
        request.isDriverStarted = true ;
        request.payType = req.body.payType;
        request.tripAmount = tripAmount;
        await request.save();

        const tripdetails = await RequestViewList(request._id);

        let driver = await Driver.findOne({ _id: driverId });

        await sendPushNotification(driver.userId, {
            title: "User accepted your bid amount",
            message: "A user has accepted your bid for the trip.",
        });

        const driverTopic = mqttConfig.DRIVER_REQUEST + "" + driverId;

        await mqttService.publishMessage(
            driverTopic,
            JSON.stringify({
                title: "ACCEPTED_BID",
                message: "User accepted your bid amount and assigned you for this trip",
                tripDetails: tripdetails
            })
        );

        return tripdetails;

    } catch (error) {
        console.error("Error assigning request:", error);
        throw error;
    }
};


module.exports = {
    respondTrip,
    locationChangeTrip,
    respondBiddingTrip,
    RequestViewList,
    getUserRequests,
    getUserAllRequests,
    UpdateBidAmount,
    AssignRequest,
    driverRequestViewList
};
