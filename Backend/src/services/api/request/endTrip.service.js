const { Request, RequestPlace, Driver, RequestBill, Rental, User, PromoCode, Settings, Referral, ReferralAmount, requestListView, Zone, Country, RequestBid, PaymentHistory } = require('../../../models');
const ApiError = require('../../../utils/ApiError');
const httpStatus = require('http-status');
const tokenService = require('../../token.service');
const requestService = require('../../web/request/request.service')
const mqttService = require('../../../services/mqtt/mqtt.service');
const { sendPushNotification, endGetDropZone, getPickupZone, applyPromoCode } = require('../../../utils/commonFunction');
const { getEndTripDropZone, createDataResponse, endCalculateZonePrices, walletTransaction, endPickUpPickupZone } = require('../../../utils/commonFunction')
const mongoose = require('mongoose');
const ObjectId = require('mongoose').Types.ObjectId
const { mqttConfig } = require('../../../config/string')



const sendError = (message, data, code) => ({
    success: false,
    message,
    data,
    code,
});

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


// const completeTrips = async (req) => {
//     const session = await mongoose.startSession();
//     try {
//         await session.startTransaction();

//         const settingNames = ['referalTripsCount', 'referalTripsAmount', 'referalRepeat'];
//         const settings = await Settings.find({ name: { $in: settingNames } }).session(session);

//         const settingsMap = settings.reduce((acc, setting) => {
//             acc[setting.name] = setting.value;
//             return acc;
//         }, {});

//         const {
//             referalTripsCount,
//             referalTripsAmount,
//             referalRepeat
//         } = settingsMap;

//         const driverId = await getDriverrId(req);

//         const {
//             requestId,
//             droplat,
//             droplng,
//             dropaddress,
//             vehicleId,
//             endKm,
//             endKmImage,
//             trip_type,
//             tripTime
//         } = req.body;

//         // Common validation and setup
//         const tripRequest = await Request.findById(requestId).session(session);
//         if (!tripRequest) {
//             throw new ApiError(httpStatus.NOT_FOUND, 'Trip request not found');
//         }

//         if (tripRequest.isCompleted || tripRequest.isCancelled) {
//             throw new ApiError(httpStatus.UNAUTHORIZED, 'Request already completed or cancelled.');
//         }

//         const driver = await Driver.findById(driverId).session(session);
//         if (!driver) {
//             throw new ApiError(httpStatus.NOT_FOUND, 'Driver not found.');
//         }

//         const tripPlaceRequest = await RequestPlace.find({ requestId }).session(session);
//         const tripPlace = tripPlaceRequest[0];
//         if (!tripPlace) {
//             throw new ApiError(httpStatus.NOT_FOUND, 'Trip Place request not found');
//         }

//         // Update trip request and place
//         tripRequest.completedAt = new Date();
//         tripRequest.isCompleted = true;

//         if (endKmImage != null) {
//             tripRequest.endKm = endKm;
//             tripRequest.endKmImage = endKmImage;
//         }

//         await tripRequest.save({ session });

//         tripPlace.dropLat = droplat;
//         tripPlace.dropLng = droplng;
//         tripPlace.dropAddress = dropaddress;
//         await tripPlace.save({ session });

//         // Handle billing based on trip type
//         let requestBillData;
//         if (trip_type === "RENTAL") {
//             req.body.promo_code = tripRequest.promoId;
//             const tripRequestData = await getRideLaterTypes(tripRequest.userId, req);
//             if (!tripRequestData) {
//                 throw new ApiError(httpStatus.NOT_FOUND, 'Trip Place request not found');
//             }
//             requestBillData = await getAmountCalculate(tripRequestData[0], vehicleId, tripTime);
//         } else if (trip_type === "LOCAL") {
//             req.body.promo_code = tripRequest.promoId;
//             const tripAmount = await getRideTypes(tripRequest.userId, req);

//             const filteredTrip = tripAmount.zoneTypePrice.filter(
//                 trip => trip.type_id.equals(new ObjectId(vehicleId))
//             );
//             requestBillData = filteredTrip[0];
//         }

//         // Get user for promo validation
//         const user = await User.findById(tripRequest.userId).session(session);
//         if (!user) {
//             throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
//         }

//         let totalAmount = requestBillData.total_amount || requestBillData.totalAmount || 0;
//         let promoDiscount = 0;

//         const zone = await getEndTripDropZone(req);

//         if (!zone || zone.nonServiceZone === 'Yes') return { status: 404, data: sendError('Non-service zone', [], 404) };

//         let adminCommission = 0;
//         let adminCommissionType = '';
//         let adminServiceFees = 0;
//         let serviceFees = 0;

//         if (zone && zone.zonePriceDetails) {
//             for (let zonePriceItem of zone.zonePriceDetails) {
//                 if (zonePriceItem != null && zonePriceItem.vehicleDetails != null && zonePriceItem.vehicleDetails._id != null) {
//                     let zonePriceVehId = zonePriceItem.vehicleDetails._id;
//                     if (zonePriceVehId.equals(tripRequest.vehicleId)) {
//                         adminCommission = tripRequest.isLater == false ? zonePriceItem.ridenowAdminCommission : zonePriceItem.ridelaterAdminCommission;
//                         adminCommissionType = tripRequest.isLater == true ? zonePriceItem.ridenowAdminCommissionType : zonePriceItem.ridelaterAdminCommissionType;
//                     }
//                 }
//             }
//         }

//         if (adminCommissionType === 'Percentage') {
//             adminServiceFees = totalAmount * (adminCommission / 100);
//         }
//         else {
//             adminServiceFees = adminCommission;
//         }

//         const serviceTax = await Settings.findOne({ name: 'serviceTax' });
//         const serviceTaxPercentage = serviceTax.value;

//         if (adminServiceFees != 0) {
//             serviceFees = adminServiceFees * (serviceTaxPercentage / 100);
//             serviceFees = parseFloat(serviceFees.toFixed(2));
//         }

//         // Calculate total amount before promo

//         const driverFees = totalAmount - adminServiceFees - serviceFees;

//         // Apply promo code if exists
//         if (tripRequest.promoId) {
//             const promo = await PromoCode.findById(tripRequest.promoId).session(session);

//             if (promo) {
//                 const [promo_count, promo_all_count] = await Promise.all([
//                     Request.countDocuments({ promoId: promo._id, userId: user._id, isCompleted: 1 }).session(session),
//                     Request.countDocuments({ promoId: promo._id, isCompleted: 1 }).session(session)
//                 ]);

//                 // Validate promo
//                 if (promo_count >= promo.promoReuseCount) {
//                     throw new ApiError(httpStatus.FORBIDDEN, `Sorry! You already used this promo code ${promo.promoReuseCount} times`);
//                 }
//                 if (promo_all_count >= promo.totalCount) {
//                     throw new ApiError(httpStatus.FORBIDDEN, 'Sorry! promo code limit exceeded');
//                 }
//                 if (totalAmount < promo.targetAmount) {
//                     throw new ApiError(httpStatus.FORBIDDEN, `Sorry! promo only valid for amounts exceeding ${promo.targetAmount}`);
//                 }

//                 // Calculate discount
//                 if (promo.promoType === 'percentage') {
//                     promoDiscount = (totalAmount * promo.percentage) / 100;
//                 } else if (promo.promoType === 'fixed') {
//                     promoDiscount = promo.amount;
//                 }

//                 // Ensure discount doesn't make total negative
//                 if (promoDiscount > totalAmount) {
//                     throw new ApiError(httpStatus.FORBIDDEN, `Sorry! promo only valid for amounts exceeding ${totalAmount}`);
//                 }

//                 totalAmount -= promoDiscount;
//             }
//         }


//         let driverIdData = await Driver.findById(tripRequest.driverId);
//         // Handle payment based on payment option
//         if (tripRequest.paymentOpt === 'CASH') {
//             await walletTransaction(adminServiceFees, driverIdData.userId, 'Spent', 'Admin Commission', tripRequest._id, session);
//             await walletTransaction(serviceFees, driverIdData.userId, 'Spent', 'Service Tax', tripRequest._id, session);
//         } else if (tripRequest.paymentOpt === 'CARD' || tripRequest.paymentOpt === 'WALLET') {

//             await walletTransaction(
//                 totalAmount,
//                 tripRequest.userId,
//                 'Spent',
//                 `Trip payment for request ${requestId}`,
//                 tripRequest._id,
//                 session,
//                 tripRequest.paymentOpt === 'CARD' ? 'CARD' : 'WALLET'
//             );

//             // Pay driver their commission
//             await walletTransaction(
//                 driverFees,
//                 driverIdData.userId,
//                 'Earned',
//                 `Trip earnings for request ${requestId}`,
//                 tripRequest._id,
//                 session
//             );
//         }

//         // Handle referral logic
//         const userReferral = await Referral.findOne({ referredTo: tripRequest.userId }).session(session);
//         const driverReferral = await Referral.findOne({ referredTo: driverIdData.userId }).session(session);

//         const referredByUserId = userReferral?.referredBy;
//         const referredByDriverId = driverReferral?.referredBy;

//         const userRequestCount = await Request.countDocuments({ userId: tripRequest.userId, isCompleted: 1 }).session(session);
//         const driverRequestCount = await Request.countDocuments({ driverId: driverIdData.userId, isCompleted: 1 }).session(session);

//         // Helper function to handle wallet transaction and referral amount saving
//         const handleReferralReward = async (referredBy, amount, tripRequestId) => {
//             if (referredBy) {
//                 const referralAmount = new ReferralAmount({
//                     referalUserId: referredBy,
//                     amount,
//                     requestId: tripRequestId,
//                     createdAt: new Date()
//                 });
//                 await referralAmount.save({ session });
//             }
//         };

//         if (referalRepeat === "yes") {
//             // Reward both the referredBy user and driver unconditionally
//             await handleReferralReward(referredByUserId, referalTripsAmount, tripRequest._id);
//             await handleReferralReward(referredByDriverId, referalTripsAmount, tripRequest._id);
//         } else {
//             // Reward only if request counts are within the limit
//             if (userRequestCount <= referalTripsCount) {
//                 await handleReferralReward(referredByUserId, referalTripsAmount, tripRequest._id);
//             }
//             if (driverRequestCount <= referalTripsCount) {
//                 await handleReferralReward(referredByDriverId, referalTripsAmount, tripRequest._id);
//             }
//         }

//         // Create request bill
//         const requestBill = new RequestBill({
//             requestId: new ObjectId(requestId),
//             basePrice: requestBillData.base_price || requestBillData.pricing?.price || 0,
//             baseDistance: requestBillData.base_distance || requestBillData.baseKm || 0,
//             totalDistance: requestBillData.totalDistance || requestBillData.totalKm || 0,
//             totalTime: 0,
//             pricePerDistance: requestBillData.price_per_distance || requestBillData.pricePerDistance || 0,
//             distancePrice: (requestBillData.distance || 0) * (requestBillData.price_per_distance || 0) ||
//                 requestBillData.distancePrice || 0,
//             pricePerTime: requestBillData.price_per_time || requestBillData.pricePerTime || 0,
//             timePrice: 0,
//             waitingCharge: requestBillData.waiting_charge || requestBillData.waiting_charge || 0,
//             cancellationFee: 0,
//             serviceTax: serviceFees,
//             serviceTaxPercentage: serviceTaxPercentage,
//             promoDiscount: promoDiscount,
//             adminCommission: adminServiceFees,
//             adminCommissionWithTax: 0,
//             driverCommission: driverFees,
//             totalAmount: totalAmount,
//             requestedCurrencyCode: 'RS',
//             requestedCurrencySymbol: '$',
//             createdAt: new Date(),
//             updatedAt: new Date(),
//             subTotal: requestBillData.total_amount || requestBillData.totalAmount || 0,
//             outOfZonePrice: requestBillData.out_of_zone_price || requestBillData.outOfZonePrice || 0,
//             bookingFees: requestBillData.booking_fees || requestBillData.bookingFees || 0,
//             hillStationPrice: 0,
//         });

//         await requestBill.save({ session });

//         // Send notifications
//         const responseData = await getRequestListData(requestId);

//         await mqttService.publishMessage(
//             `user/request/${tripRequest.userId}`,
//             JSON.stringify({
//                 title: "TRIP_COMPLETED",
//                 message: "Trip Completed",
//                 trip: responseData[0]
//             })
//         );

//         await sendPushNotification(tripRequest.userId.toString(), {
//             title: "TRIP_COMPLETED",
//             message: "Trip Completed"
//         });

//         await session.commitTransaction();
//         return responseData[0];

//     } catch (err) {
//         await session.abortTransaction();
//         console.error(err);
//         throw new ApiError(err.status || httpStatus.INTERNAL_SERVER_ERROR, err.message);
//     } finally {
//         session.endSession();
//     }
// };


const completeTrips = async (req) => {
    const session = await mongoose.startSession();
    try {
        await session.startTransaction();

        // Parallelize initial data fetching
        const [settings, driverId] = await Promise.all([
            Settings.find({ name: { $in: ['referalTripsCount', 'referalTripsAmount', 'referalRepeat', 'subScription'] } }).session(session),
            getDriverrId(req)
        ]);

        // Create settings map more efficiently
        const settingsMap = Object.fromEntries(settings.map(s => [s.name, s.value]));

        // Destructure settings with defaults
        const {
            referalTripsCount = 0,
            referalTripsAmount = 0,
            referalRepeat = "no",
            subScription = "no"
        } = settingsMap;

        // Destructure request body
        const {
            requestId,
            droplat,
            droplng,
            dropaddress,
            vehicleId,
            endKm,
            endKmImage,
            trip_type,
            tripTime
        } = req.body;

        // Fetch trip request and related data in parallel
        const [tripRequest, tripPlaceRequest, driver] = await Promise.all([
            Request.findById(requestId).session(session),
            RequestPlace.find({ requestId }).session(session),
            Driver.findById(driverId).session(session)
        ]);

        // Validate data
        if (!tripRequest) throw new ApiError(httpStatus.NOT_FOUND, 'Trip request not found');
        if (tripRequest.isCompleted || tripRequest.isCancelled) {
            throw new ApiError(httpStatus.UNAUTHORIZED, 'Request already completed or cancelled.');
        }
        if (!driver) throw new ApiError(httpStatus.NOT_FOUND, 'Driver not found.');

        const tripPlace = tripPlaceRequest[0];
        if (!tripPlace) throw new ApiError(httpStatus.NOT_FOUND, 'Trip Place request not found');

        // Update trip request and place
        tripRequest.completedAt = new Date();
        tripRequest.isCompleted = true;

        if (tripRequest.paymentOpt === 'CASH' || tripRequest.paymentOpt === 'WALLET') {
            tripRequest.isPaid = true;
        } else if (tripRequest.paymentOpt === 'CARD') {
            tripRequest.isPaid = false;
        }

        if (endKmImage != null) {
            tripRequest.endKm = endKm;
            tripRequest.endKmImage = endKmImage;
        }

        tripPlace.dropLat = droplat;
        tripPlace.dropLng = droplng;
        tripPlace.dropAddress = dropaddress;

        await Promise.all([
            tripRequest.save({ session }),
            tripPlace.save({ session })
        ]);

        // Calculate billing based on trip type
        let requestBillData;
        if (trip_type === "RENTAL") {
            req.body.promo_code = tripRequest.promoId;
            const tripRequestData = await getRideLaterTypes(tripRequest.userId, req);
            if (!tripRequestData) {
                throw new ApiError(httpStatus.NOT_FOUND, 'Trip Place request not found');
            }
            requestBillData = await getAmountCalculate(tripRequestData[0], vehicleId, tripTime, req);
        } else if (trip_type === "LOCAL") {
            req.body.promo_code = tripRequest.promoId;
            const tripAmount = await getRideTypes(tripRequest.userId, req, tripRequest.vehicleId);
            requestBillData = tripAmount.zoneTypePrice.find(
                trip => trip.type_id.equals(new ObjectId(vehicleId))
            );
        }

        // Get user and zone in parallel
        const [user, zone] = await Promise.all([
            User.findById(tripRequest.userId).session(session),
            getEndTripDropZone(req)
        ]);

        if (!user) throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
        if (!zone || zone.nonServiceZone === 'Yes') {
            return { status: 404, data: sendError('Non-service zone', [], 404) };
        }


        // increase user trip count
        user.tripsCount += 1;
        await user.save({ session });

        // Get driver user ID
        const driverIdData = await Driver.findById(tripRequest.driverId).session(session);

        // increase driver trip count
        await User.findOneAndUpdate(
            { _id: new ObjectId(driverIdData.userId) },
            { $inc: { tripsCount: 1 } },
            { new: true }
        ).session(session);

        let totalAmount = 0;
        let promoDiscount = 0;
        let adminCommission = 0;
        let adminCommissionType = '';

        if (zone.biddingZone === 'yes') {
            const requestDriver = await RequestBid.findOne({
                requestId: requestId,
                driverId: tripRequest.driverId,
            });
            if (!requestDriver) {
                throw new ApiError(httpStatus.NOT_FOUND, "Request not found");
            }



            totalAmount = requestDriver.bidAmount;
        }
        else {
            totalAmount = requestBillData?.total_amount || requestBillData?.totalAmount || 0;
        }

        let adminServiceFees = 0;
        let serviceFees = 0;
        let driverFees = 0;

        const serviceTax = await Settings.findOne({ name: 'serviceTax' }).session(session);
        const serviceTaxPercentage = serviceTax?.value || 0;

        if (subScription === "no") {
            if (zone?.zonePriceDetails) {
                const zonePriceItem = zone.zonePriceDetails.find(item =>
                    item?.vehicleDetails?._id?.equals(tripRequest.vehicleId)
                );

                if (zonePriceItem) {
                    adminCommission = tripRequest.isLater === false
                        ? zonePriceItem.ridenowAdminCommission
                        : zonePriceItem.ridelaterAdminCommission;
                    adminCommissionType = tripRequest.isLater === true
                        ? zonePriceItem.ridenowAdminCommissionType
                        : zonePriceItem.ridelaterAdminCommissionType;
                }
            }

            adminServiceFees = adminCommissionType === 'Percentage'
                ? totalAmount * (adminCommission / 100)
                : adminCommission;

            serviceFees = adminServiceFees !== 0
                ? parseFloat((adminServiceFees * (serviceTaxPercentage / 100)).toFixed(2))
                : 0;

            driverFees = totalAmount - adminServiceFees - serviceFees;

        }


        // Handle promo code if exists
        if (tripRequest.promoId) {
            const [promo, promo_count, promo_all_count] = await Promise.all([
                PromoCode.findById(tripRequest.promoId).session(session),
                Request.countDocuments({
                    promoId: tripRequest.promoId,
                    userId: user._id,
                    isCompleted: true
                }).session(session),
                Request.countDocuments({
                    promoId: tripRequest.promoId,
                    isCompleted: true
                }).session(session)
            ]);

            if (promo) {
                if (promo_count > promo.promoReuseCount) {
                    throw new ApiError(httpStatus.FORBIDDEN, `Sorry! You already used this promo code ${promo.promoReuseCount} times`);
                }
                if (promo_all_count > promo.totalCount) {
                    throw new ApiError(httpStatus.FORBIDDEN, 'Sorry! promo code limit exceeded');
                }
                if (totalAmount < promo.targetAmount) {
                    throw new ApiError(httpStatus.FORBIDDEN, `Sorry! promo only valid for amounts exceeding ${promo.targetAmount}`);
                }

                promoDiscount = promo.promoType === 'percentage'
                    ? (totalAmount * promo.percentage) / 100
                    : promo.amount;

                if (promoDiscount > totalAmount) {
                    throw new ApiError(httpStatus.FORBIDDEN, `Sorry! promo only valid for amounts exceeding ${totalAmount}`);
                }

                totalAmount -= promoDiscount;
            }
        }

        // Handle payment transactions
        const paymentTransactions = [];
        if (tripRequest.paymentOpt === 'CASH' && subScription === "no") {
            paymentTransactions.push(
                walletTransaction(adminServiceFees, driverIdData.userId, 'Spent', 'Admin Commission', tripRequest._id, session),
                walletTransaction(serviceFees, driverIdData.userId, 'Spent', 'Service Tax', tripRequest._id, session)
            );
        } else if ((tripRequest.paymentOpt === 'CARD' || tripRequest.paymentOpt === 'WALLET') && subScription === "no") {
            paymentTransactions.push(
                walletTransaction(
                    totalAmount,
                    tripRequest.userId,
                    'Spent',
                    `Trip payment for request ${requestId}`,
                    tripRequest._id,
                    session,
                    tripRequest.paymentOpt === 'CARD' ? 'CARD' : 'WALLET'
                ),
                walletTransaction(
                    driverFees,
                    driverIdData.userId,
                    'Earned',
                    `Trip earnings for request ${requestId}`,
                    tripRequest._id,
                    session
                )
            );
        }

        // Handle referral logic
        const [userReferral, driverReferral, userRequestCount, driverRequestCount] = await Promise.all([
            Referral.findOne({ referredTo: tripRequest.userId }).session(session),
            Referral.findOne({ referredTo: driverIdData.userId }).session(session),
            Request.countDocuments({ userId: tripRequest.userId, isCompleted: 1 }).session(session),
            Request.countDocuments({ driverId: driverIdData.userId, isCompleted: 1 }).session(session)
        ]);

        const referredByUserId = userReferral?.referredBy;
        const referredByDriverId = driverReferral?.referredBy;

        const referralPromises = [];

        const handleReferralReward = async (referredBy, amount, tripRequestId) => {
            if (referredBy) {
                const referralAmount = new ReferralAmount({
                    referalUserId: referredBy,
                    amount,
                    requestId: tripRequestId,
                    createdAt: new Date()
                });
                await referralAmount.save({ session });
            }
        };

        if (referalRepeat === "yes") {
            if (referredByUserId) {
                referralPromises.push(handleReferralReward(referredByUserId, referalTripsAmount, tripRequest._id));
            }
            if (referredByDriverId) {
                referralPromises.push(handleReferralReward(referredByDriverId, referalTripsAmount, tripRequest._id));
            }
        } else {
            if (userRequestCount <= referalTripsCount && referredByUserId) {
                referralPromises.push(handleReferralReward(referredByUserId, referalTripsAmount, tripRequest._id));
            }
            if (driverRequestCount <= referalTripsCount && referredByDriverId) {
                referralPromises.push(handleReferralReward(referredByDriverId, referalTripsAmount, tripRequest._id));
            }
        }

        const countryDial = await Country.findById(new ObjectId(user.countryCode));

        if (!countryDial) {
            throw new ApiError(httpStatus.UNAUTHORIZED, errorMessages.INVALID_COUNTRYCODE);
        }

        // Create request bill
        const requestBill = new RequestBill({
            requestId: new ObjectId(requestId),
            basePrice: zone.biddingZone === 'yes' ? totalAmount : requestBillData.base_price || requestBillData.pricing?.price || 0,
            baseDistance: requestBillData.base_distance || requestBillData.baseKm || 0,
            totalDistance: requestBillData.totalDistance || requestBillData.totalKm || 0,
            totalTime: 0,
            pricePerDistance: requestBillData.price_per_distance || requestBillData.pricePerDistance || 0,
            distancePrice: requestBillData.distancePrice || 0,
            pricePerTime: requestBillData.price_per_time || requestBillData.pricePerTime || 0,
            timePrice: 0,
            waitingCharge: requestBillData.waiting_charge || requestBillData.waiting_charge || 0,
            cancellationFee: 0,
            serviceTax: serviceFees,
            serviceTaxPercentage: serviceTaxPercentage,
            promoDiscount: promoDiscount,
            adminCommission: adminServiceFees,
            adminCommissionWithTax: 0,
            driverCommission: driverFees,
            totalAmount: totalAmount,
            requestedCurrencyCode: countryDial.dial_code,
            requestedCurrencySymbol: countryDial.currency_symbol,
            createdAt: new Date(),
            updatedAt: new Date(),
            subTotal: requestBillData.total_amount || requestBillData.totalAmount || 0,
            outOfZonePrice: requestBillData.out_of_zone_price || requestBillData.outOfZonePrice || 0,
            bookingFees: requestBillData.booking_fees || requestBillData.bookingFees || 0,
            hillStationPrice: 0,
        });



        // Execute all parallel operations
        await Promise.all([
            ...paymentTransactions,
            ...referralPromises,
            requestBill.save({ session })
        ]);

        await session.commitTransaction();

        // Send notifications

        const responseData = await getRequestListData(requestId);


        const userTopic = mqttConfig.USER_REQUEST + "" + tripRequest.userId;

        //`user/request/${tripRequest.userId}`

        await Promise.all([
            mqttService.publishMessage(
                userTopic,
                JSON.stringify({
                    title: "TRIP_COMPLETED",
                    message: "Trip Completed",
                    trip: responseData[0]
                })
            ),
            sendPushNotification(tripRequest.userId.toString(), {
                title: "TRIP_COMPLETED",
                message: "Trip Completed"
            })
        ]);

        return responseData[0];

    } catch (err) {
        await session.abortTransaction();
        console.error(err);
        throw new ApiError(err.status || httpStatus.INTERNAL_SERVER_ERROR, err.message);
    } finally {
        await session.endSession();
    }
};


const getAmountCalculate = async (request, vehicleId, tripTime, req) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        if (!request.userId) return { status: 401, data: sendError('Token Expired', [], 401) };

        const user = await User.findById(request.userId);
        if (!user) return { status: 401, data: sendError('Unauthorized', [], 401) };
        if (!user.active) return { status: 403, data: sendError('User is blocked, please contact admin', [], 403) };

        let rental = await Rental.findById(request.packageId);
        if (!rental) return { status: 404, data: sendError('Rental package not found', [], 404) };

        let zone = await Zone.findById(rental.zoneId);

        let vehiclePricing = rental.vehiclePrices.find(vp => vp.vehicleId.toString() === vehicleId.toString());
        if (!vehiclePricing) return { status: 404, data: sendError('Vehicle pricing not found', [], 404) };

        let currentPackageHrMs = rental.hour * 60 * 60 * 1000; // Convert package hour to milliseconds
        let graceTimeMs = vehiclePricing.graceTime * 60 * 1000; // Convert grace time to milliseconds

        let baseKm = rental.km;
        // Calculate total package time (including grace period)
        let totalAllowedTimeMs = currentPackageHrMs + graceTimeMs;

        // If trip time exceeds allowed time, move to the next rental package
        while (tripTime > totalAllowedTimeMs) {
            rental = await Rental.findOne({ _id: { $gt: rental._id } }).sort({ _id: 1 }); // Get next package

            if (!rental) {
                return { status: 404, data: sendError('No more rental packages available', [], 404) };
            }

            vehiclePricing = rental.vehiclePrices.find(vp => vp.vehicleId.toString() === vehicleId.toString());

            if (!vehiclePricing) {
                return { status: 404, data: sendError('Vehicle pricing not found in next package', [], 404) };
            }

            // Convert the new package values to milliseconds
            currentPackageHrMs = rental.hour * 60 * 60 * 1000;
            graceTimeMs = vehiclePricing.graceTime * 60 * 1000;
            totalAllowedTimeMs = currentPackageHrMs + graceTimeMs;

            // Stop the loop if the trip time now fits
            if (tripTime <= totalAllowedTimeMs) {
                break;
            }
        }

        let totalKm = request.endKm - request.startKm;

        if (zone.unit != "KM") {
            totalKm = totalKm * 0.6213711922
        }

        let totalAmount = vehiclePricing.price + (totalKm > rental.km ? (totalKm - rental.km) * vehiclePricing.extraKmPrice : 0);

        // if (req.body.promo_code) {
        //     totalAmount = await applyPromoCode(req, totalAmount, user);
        // }


        if (req.body.promo_code) {
            try {
                promoAmount = await applyPromoCode(req, totalAmount, user);
            } catch (error) {
                if (error instanceof ApiError) {
                    throw error; // Or handle differently
                } else {
                    console.error("Promo code application error:", error);
                    throw new ApiError(httpStatus.BAD_REQUEST, error.message);
                }
            }
        }

        await session.commitTransaction();

        let data = {
            package: rental,
            baseKm: baseKm,
            totalKm: totalKm,
            pricing: vehiclePricing,
            totalAmount: totalAmount,
            pricePerDistance: vehiclePricing.extraKmPrice,
            distancePrice: totalKm > rental.km ? (totalKm - rental.km) * vehiclePricing.extraKmPrice : 0
        }

        return data;
    } catch (error) {
        await session.abortTransaction();
        throw error; // Rethrow to be caught in controller
    } finally {
        session.endSession();
    }
};


const getRideTypes = async (userId, req, vehicleId) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        if (!userId) return { status: 401, data: sendError('Token Expired', [], 401) };

        const user = await User.findById(userId);
        if (!user) return { status: 401, data: sendError('Unauthorized', [], 401) };
        if (!user.active) return { status: 403, data: sendError('User is blocked, please contact admin', [], 403) };

        const { requestId, droplat, droplng, dropaddress, picklat, picklng, pickupaddress, beforewaitingtime, afterwaitingtime, ridetype, promo_code } = req.body;


        const zone = await endPickUpPickupZone(req);



        if (!zone || zone.nonServiceZone === 'Yes') return { status: 404, data: sendError('Non-service zone', [], 404) };

        let currentDate = new Date();

        let ride_date = currentDate.toISOString().split('T')[0]; // Format: YYYY-MM-DD
        let ride_time = currentDate.toTimeString().split(' ')[0]; // Format: HH:MM:SS

        if (zone.unit != "KM") {
            req.body.distance = req.body.distance * 0.6213711922
        }

        const zonePrice = await endCalculateZonePrices(req, zone, req.body.distance, ridetype, promo_code, user, ride_time, ride_date, beforewaitingtime, afterwaitingtime, vehicleId);

        const dataResponse = createDataResponse(zone);

        dataResponse.zoneTypePrice = zonePrice;

        await session.commitTransaction();

        return dataResponse;
    } catch (error) {
        await session.abortTransaction();
        throw error; // Rethrow to be caught in controller
    } finally {
        session.endSession();
    }
};


const getRideLaterTypes = async (userId, req) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        if (!userId) return { status: 401, data: sendError('Token Expired', [], 401) };

        const user = await User.findById(userId);
        if (!user) return { status: 401, data: sendError('Unauthorized', [], 401) };
        if (!user.active) return { status: 403, data: sendError('User is blocked, please contact admin', [], 403) };

        const { requestId, droplat, droplng, dropaddress, picklat, picklng, pickupaddress, beforewaitingtime, afterwaitingtime, ridetype, distance, promo_code } = req.body;

        let requestData = await getRequestListData(requestId);

        const dataResponse = requestData;

        await session.commitTransaction();

        return dataResponse;
    } catch (error) {
        await session.abortTransaction();
        throw error; // Rethrow to be caught in controller
    } finally {
        session.endSession();
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


const getpaymentHistory = async (req) => {

    const { paymentType, amount, paymentIntentId, status, requestId } = req.body;

    // Create payment history
    const paymentHistory = new PaymentHistory({
        requestId: paymentType === 'TRIP_RECHARGE' ? requestId : null,
        paymentType,
        amount,
        paymentIntentId,
        status: status === true ? 'completed' : 'failed',
        createdBy: req.user.id
    });

    await paymentHistory.save();

    // If this is a trip payment and it's successful, update the request
    if (paymentType === 'TRIP_RECHARGE' && status === true) {
        const updatedRequest = await Request.findByIdAndUpdate(
            requestId,
            {
                isPaid: true,
                $set: { 'paymentOpt': 'CARD' } // Assuming card payment since it's a recharge
            },
            { new: true }
        );


        const requestData = await Request.findById(requestId);


        const driverTopic = mqttConfig.DRIVER_REQUEST + "" + requestData.driverId;

        const driver = await Driver.findById(requestData.driverId);
        

        await Promise.all([
            mqttService.publishMessage(
                driverTopic,
                JSON.stringify({
                    title: "PAYMENT_SUCCESS",
                    message: "payment success",
                    trip: requestData
                })
            )
            ,
            sendPushNotification(driver.userId.toString(), {
                title: "PAYMENT_SUCCESS",
                message: "payment success"
            })
        ]);


        if (!updatedRequest) {
            return res.status(404).json({ success: false, message: 'Request not found' });
        }
    }

    return paymentHistory;
}


const moveToCash = async (req) => {

    const { requestId } = req.body;

    const updatedRequest = await Request.findByIdAndUpdate(
        requestId,
        {
            isPaid: true,
            $set: { 'paymentOpt': 'CASH' }
        },
        { new: true }
    );

    const requestData = await Request.findById(requestId);

    const driverTopic = mqttConfig.DRIVER_REQUEST + "" + requestData.driverId;


    const driver = await Driver.findById(requestData.driverId)


    await Promise.all([
        mqttService.publishMessage(
            driverTopic,
            JSON.stringify({
                title: "MOVE_TO_CASH",
                message: "trip payment moved to cash",
                trip: requestData
            })
        ),
        sendPushNotification(driver.userId.toString(), {
            title: "MOVE_TO_CASH",
            message: "trip payment moved to cash"
        })
    ]);

    return updatedRequest;
}

module.exports = {
    completeTrips,
    getpaymentHistory,
    moveToCash
};
