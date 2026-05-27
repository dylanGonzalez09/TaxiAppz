const { Request, RequestPlace, Driver, RequestBill, Rental, User, PromoCode, Settings, Referral, ReferralAmount, requestListView, Zone, Country } = require('../../../models');
const ApiError = require('../../../utils/ApiError');
const httpStatus = require('http-status').default || require('http-status').status || require('http-status');
const tokenService = require('../../token.service');
const requestService = require('../../web/request/request.service')
const mqttService = require('../../../services/mqtt/mqtt.service');
const {
  sendPushNotification,
  endGetDropZone,
  getDriverId,
  getPickupZone,
  applyPromoCode,
  getEndTripDropZone,
  createDataResponse,
  endCalculateZonePrices,
  walletTransaction,
  endPickUpPickupZone,
  toNumber,
  computeWaitingChargeFromZonePriceItem,
} = require('../../../utils/commonFunction');
const mongoose = require('mongoose');
const ObjectId = require('mongoose').Types.ObjectId
const { mqttConfig } = require('../../../config/string')



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

//         const driverId = await getDriverId(req);

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
//             requestBillData.distancePrice || 0,
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
      Settings.find({ name: { $in: ['referalTripsCount', 'referalTripsAmount', 'referalRepeat'] } }).session(session),
      getDriverId(req)
    ]);

    // Create settings map
    const settingsMap = Object.fromEntries(settings.map(s => [s.name, s.value]));

    // Destructure settings with defaults
    const {
      referalTripsCount = 0,
      referalTripsAmount = 0,
      referalRepeat = "no"
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
    // if (tripRequest.isCompleted || tripRequest.isCancelled) {
    //   throw new ApiError(httpStatus.UNAUTHORIZED, 'Request already completed or cancelled.');
    // }
    if (!driver) throw new ApiError(httpStatus.NOT_FOUND, 'Driver not found.');

    const tripPlace = tripPlaceRequest[0];
    if (!tripPlace) throw new ApiError(httpStatus.NOT_FOUND, 'Trip Place request not found');



    // Update trip request and place
    tripRequest.completedAt = new Date();
    tripRequest.isCompleted = true;

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
      const vid = tripRequest.vehicleId?.toString();
      requestBillData = tripAmount.zoneTypePrice?.find(
        (t) => t?.type_id && String(t.type_id) === vid
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

    // Increase user trip count
    user.trips_count += 1;
    await user.save({ session });

    // Get driver user ID (again to ensure we have trip driver)
    const driverIdData = await Driver.findById(tripRequest.driverId).session(session);

    // Increase driver trip count
    await User.findOneAndUpdate(
      { _id: new ObjectId(driverIdData.userId) },
      { $inc: { tripsCount: 1 } },
      { returnDocument: 'after' }
    ).session(session);

    let promoDiscount = 0;

    // Resolve zone price item
    let zonePriceItem = null;
    if (zone?.zonePriceDetails) {
      zonePriceItem = zone.zonePriceDetails.find(item =>
        item?.vehicleDetails?._id?.equals(tripRequest.vehicleId) ||
        item?.vehicleId?.equals?.(tripRequest.vehicleId)
      );
    }

    // Reconcile waiting charge with zone vehicle row + minutes from body (fixes ridetype/rideType mismatch, Decimal128 edge cases)
    let finalWaitingCharge = toNumber(requestBillData?.waiting_charge);
    if (trip_type === 'LOCAL' && requestBillData && zonePriceItem) {
      const bw = toNumber(req.body.beforeWaitingTime ?? req.body.beforewaitingtime ?? 0);
      const aw = toNumber(req.body.afterWaitingTime ?? req.body.afterwaitingtime ?? 0);
      const isRideNowPricing = tripRequest.isLater !== true;
      finalWaitingCharge = computeWaitingChargeFromZonePriceItem(zonePriceItem, isRideNowPricing, bw, aw);
      const currentW = toNumber(requestBillData.waiting_charge);
      if (finalWaitingCharge !== currentW) {
        const delta = finalWaitingCharge - currentW;
        requestBillData = {
          ...requestBillData,
          waiting_charge: finalWaitingCharge,
          total_amount: toNumber(requestBillData.total_amount) + delta,
          totalAmount: toNumber(requestBillData.totalAmount) + delta,
        };
      }
    }

    // Fare subtotal from pricing calculation
    let totalAmount = requestBillData?.total_amount || requestBillData?.totalAmount || 0;

    // Promo handling against fare subtotal (not booking fee)
    if (tripRequest.promoId) {
      const [promo, promo_count, promo_all_count] = await Promise.all([
        PromoCode.findById(tripRequest.promoId).session(session),
        Request.countDocuments({
          promoId: tripRequest.promoId,
          userId: user._id,
          isCompleted: 1,
          _id: { $ne: tripRequest._id },
        }).session(session),
        Request.countDocuments({
          promoId: tripRequest.promoId,
          isCompleted: 1,
          _id: { $ne: tripRequest._id },
        }).session(session)
      ]);

      let distancePriceData = requestBillData.distancePrice || 0;
      let base_priceData = requestBillData.base_price || 0;

      let TotalAmtData = distancePriceData + base_priceData;

      if (promo) {
        if (promo_all_count >= promo.totalCount) {
          throw new ApiError(httpStatus.FORBIDDEN, 'Sorry! promo code limit exceeded');
        }
        if (promo_count >= promo.promoReuseCount) {
          throw new ApiError(httpStatus.FORBIDDEN, `Sorry! You already used this promo code ${promo.promoReuseCount} times`);
        }
        if (totalAmount < promo.targetAmount) {
          throw new ApiError(httpStatus.FORBIDDEN, `Sorry! promo only valid for amounts exceeding ${promo.targetAmount}`);
        }

        promoDiscount = promo.promoType === 'percentage'
          ? (TotalAmtData * promo.percentage) / 100
          : promo.amount;

        if (promoDiscount > TotalAmtData) {
          throw new ApiError(httpStatus.FORBIDDEN, `Sorry! promo only valid for amounts exceeding ${totalAmount}`);
        }

        TotalAmtData -= promoDiscount;
      }
    }

    const fareSubtotal = (requestBillData?.total_amount || requestBillData?.totalAmount || 0);
    const riderPayableTotal = fareSubtotal;

    const isRideNow = tripRequest.isLater === false;
    let adminCommission = 0;
    let adminCommissionType = '';

    if (zonePriceItem) {
      adminCommission = isRideNow
        ? (zonePriceItem.ridenowAdminCommission || 0)
        : (zonePriceItem.ridelaterAdminCommission || 0);
      adminCommissionType = isRideNow
        ? (zonePriceItem.ridenowAdminCommissionType || 'Fixed')
        : (zonePriceItem.ridelaterAdminCommissionType || 'Fixed');
    }

    const [serviceTax, subscriptionSetting] = await Promise.all([
      Settings.findOne({ name: 'serviceTax' }).session(session),
      Settings.findOne({ name: 'subScription', status: true, type: 'modules' }).session(session),
    ]);

    const serviceTaxPercentage = serviceTax?.value || 0;
    const isSubscriptionEnabled = String(subscriptionSetting?.value || '').toLowerCase() === 'yes';


    // If subscription is enabled, skip admin commission and service tax.
    if (isSubscriptionEnabled) {
      adminCommission = 0;
      adminCommissionType = 'Fixed';
    }
    const baseForCommission = fareSubtotal;

    const adminServiceFees = adminCommissionType === 'Percentage'
      ? parseFloat((baseForCommission * (adminCommission / 100)).toFixed(2))
      : adminCommission;

    const serviceFees = adminServiceFees !== 0
      ? parseFloat((baseForCommission * (serviceTaxPercentage / 100)).toFixed(2))
      : 0;

    const driverFees = baseForCommission - adminServiceFees - serviceFees;


    // Determine recipient for wallet transactions
    let recipientUserId = driverIdData.userId; // Default to driver's userId

    // Optional: platform wallet user id (if you track admin wallet as a user)
    // Set this to a valid user id to actually credit booking fee to admin.
    const adminRecipientUserId = null; // e.g., process.env.ADMIN_WALLET_USER_ID || null

    // Handle payment transactions
    const paymentTransactions = [];
    if (tripRequest.paymentOpt === 'CASH') {
      const payerUserId = driverIdData.userId;

       if(!isSubscriptionEnabled){

        paymentTransactions.push(() =>
          walletTransaction(adminServiceFees, payerUserId, 'Spent', 'Admin Commission', tripRequest._id, session)
         );

        paymentTransactions.push(() =>
           walletTransaction(serviceFees, payerUserId, 'Spent', 'Service Tax', tripRequest._id, session)
         );
       }

    } else if (tripRequest.paymentOpt === 'CARD') {
      paymentTransactions.push(() =>
        walletTransaction(
          driverFees,
          recipientUserId,
          'Earned',
          `Trip earnings for request ${requestId}`,
          tripRequest._id,
          session
        )
      );

    } else if (tripRequest.paymentOpt === 'WALLET') {
      // WALLET: charge rider wallet fare total
      paymentTransactions.push(() =>
        walletTransaction(
          riderPayableTotal,
          tripRequest.userId,
          'Spent',
          `Trip payment for request ${requestId}`,
          tripRequest._id,
          session,
        )),
        paymentTransactions.push(() =>
         walletTransaction(
          driverFees,
          recipientUserId,
          'Earned',
          `Trip earnings for request ${requestId}`,
          tripRequest._id,
          session
        ));


    }



    // Handle referral logic
    // const [userReferral, driverReferral, userRequestCount, driverRequestCount] = await Promise.all([
    //   Referral.findOne({ referredTo: tripRequest.userId }).session(session),
    //   Referral.findOne({ referredTo: driverIdData.userId }).session(session),
    //   Request.countDocuments({ userId: tripRequest.userId, isCompleted: 1 }).session(session),
    //   Request.countDocuments({ driverId: driverIdData.userId, isCompleted: 1 }).session(session)
    // ]);

    // const referredByUserId = userReferral?.referredBy;
    // const referredByDriverId = driverReferral?.referredBy;

    // const referralPromises = [];

    // const handleReferralReward = async (referredBy, amount, tripRequestId) => {
    //   if (referredBy) {
    //     const referralAmount = new ReferralAmount({
    //       referalUserId: referredBy,
    //       amount,
    //       requestId: tripRequestId,
    //       createdAt: new Date()
    //     });
    //     await referralAmount.save({ session });
    //   }
    // };

    // if (referalRepeat === "yes") {
    //   if (referredByUserId) {
    //     referralPromises.push(handleReferralReward(referredByUserId, referalTripsAmount, tripRequest._id));
    //   }
    //   if (referredByDriverId) {
    //     referralPromises.push(handleReferralReward(referredByDriverId, referalTripsAmount, tripRequest._id));
    //   }
    // } else {
    //   if (userRequestCount <= referalTripsCount && referredByUserId) {
    //     referralPromises.push(handleReferralReward(referredByUserId, referalTripsAmount, tripRequest._id));
    //   }
    //   if (driverRequestCount <= referalTripsCount && referredByDriverId) {
    //     referralPromises.push(handleReferralReward(referredByDriverId, referalTripsAmount, tripRequest._id));
    //   }
    // }


    // ---------------- REFERRAL LOGIC (USER + DRIVER) ----------------

    // 1️⃣ Find both user & driver referral
    const [userReferral, driverReferral] = await Promise.all([
      Referral.findOne({ referredTo: tripRequest.userId }).session(session),
      Referral.findOne({ referredTo: driverIdData.userId }).session(session)
    ]);


    if (!userReferral && !driverReferral) {
      // no referral → skip
    } else {

      // ✅ Load settings
      const settings = await Settings.find({
        name: { $in: ['referalTripsCount', 'referalTripsAmount', 'referalRepeat'] }
      }).session(session);

      if ( settingsMap.referalTripsCount && settingsMap.referalTripsAmount && settingsMap.referalRepeat === 'yes') {

        const tripLimit = Number(settingsMap.referalTripsCount);
        const rewardAmount = Number(settingsMap.referalTripsAmount);

        // 🔁 Common helper
        const processReferralReward = async (
        referredToUserId,
        referredByUserId,
        type
      ) => {

        let query;

        if (type === 'USER') {
          query = { userId: referredToUserId };
        }

        if (type === 'DRIVER') {
          const driver = await Driver.findOne({ userId: referredToUserId })
            .session(session);
          if (!driver) return;
          query = { driverId: driver._id };
        }

        const completedTrips = await Request.countDocuments({
          ...query,
          isCompleted: true
        }).session(session);




        // reward only at exact limit
        if (completedTrips !== tripLimit) return;

        // ✅ ATOMIC UPSERT + INCREMENT
        const d = await ReferralAmount.findOneAndUpdate(
          { referalUserId: referredByUserId },
          { $inc: { amount: rewardAmount } },
          { upsert: true, returnDocument: 'after', session }
        );

      };


        // 4️⃣ USER referral reward
        if (userReferral) {
          await processReferralReward(
            userReferral.referredTo,
            userReferral.referredBy,
            'USER'
          );
        }

        // 🚗 DRIVER referral
        if (driverReferral) {
          await processReferralReward(
            driverReferral.referredTo,
            driverReferral.referredBy,
            'DRIVER'
          );
        }
      }
    }
    const countryDial = await Country.findById(new ObjectId(user.countryCode));

    if (!countryDial) {
      throw new ApiError(httpStatus.UNAUTHORIZED, errorMessages.INVALID_COUNTRYCODE);
    }

    // Build RequestBill
    const requestBill = new RequestBill({
      requestId: new ObjectId(requestId),
      basePrice: requestBillData.base_price || requestBillData.pricing?.price || 0,
      baseDistance: requestBillData.base_distance || requestBillData.baseKm || 0,
      totalDistance: requestBillData.totalDistance || requestBillData.totalKm || 0,
      totalTime: 0,
      pricePerDistance: requestBillData.price_per_distance || requestBillData.pricePerDistance || 0,
      distancePrice: requestBillData.distancePrice || 0,
      pricePerTime: requestBillData.price_per_time || requestBillData.pricePerTime || 0,
      timePrice: 0,
      waitingCharge: finalWaitingCharge,
      cancellationFee: 0,
      serviceTax: serviceFees,
      serviceTaxPercentage: serviceTaxPercentage,
      promoDiscount: promoDiscount,
      adminCommission: adminServiceFees,
      adminCommissionWithTax: 0,
      driverCommission: driverFees,
      totalAmount: riderPayableTotal,
      requestedCurrencyCode: countryDial.dial_code,
      requestedCurrencySymbol: countryDial.currency_symbol,
      createdAt: new Date(),
      updatedAt: new Date(),
      subTotal: requestBillData.total_amount || requestBillData.totalAmount || 0,
      outOfZonePrice: requestBillData.out_of_zone_price || requestBillData.outOfZonePrice || 0,
      bookingFees: 0,
      hillStationPrice: 0,

    });

    // // Execute all parallel operations
    // await Promise.all([
    //   ...paymentTransactions,
    //   // ...referralPromises,
    //   requestBill.save({ session })
    // ]);

    // await session.commitTransaction();


    // wallet transactions sequential
    for (const PT of paymentTransactions) {

      await PT();

    }

    // requestBill save
    await requestBill.save({ session });

    // If admin requested block during trip, apply block automatically after completion.
    if (driverIdData?.pendingAdminBlock === true) {
      driverIdData.status = false;
      driverIdData.isActive = false;
      driverIdData.pendingAdminBlock = false;
      await driverIdData.save({ session });

      await User.findByIdAndUpdate(
        driverIdData.userId,
        {
          $set: {
            active: false,
            onlineBy: 0,
            blockReson: 'AdminBlocked',
          },
        },
        { session }
      );
    }

    // commit
      await session.commitTransaction();

    // Send notifications
    const responseData = await getRequestListData(requestId);

    const userTopic = mqttConfig.USER_REQUEST + "" + tripRequest.userId;



    setImmediate(async () => {
      try {

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

      } catch (notificationError) {
        console.error('❌ Notification error (non-blocking):', notificationError);
      }
    });


    return responseData[0];

  } catch (err) {
    await session.abortTransaction();
    console.error(err);
    throw new ApiError(err.status || httpStatus.INTERNAL_SERVER_ERROR, err.message);
  } finally {
    await session.endSession();
  }
};

//without booking fee function
// const completeTrips = async (req) => {
//     const session = await mongoose.startSession();
//     try {
//         await session.startTransaction();

//         // Parallelize initial data fetching
//         const [settings, driverId] = await Promise.all([
//             Settings.find({ name: { $in: ['referalTripsCount', 'referalTripsAmount', 'referalRepeat'] } }).session(session),
//             getDriverId(req)
//         ]);

//         // Create settings map more efficiently
//         const settingsMap = Object.fromEntries(settings.map(s => [s.name, s.value]));

//         // Destructure settings with defaults
//         const {
//             referalTripsCount = 0,
//             referalTripsAmount = 0,
//             referalRepeat = "no"
//         } = settingsMap;

//         // Destructure request body
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

//         // Fetch trip request and related data in parallel
//         const [tripRequest, tripPlaceRequest, driver] = await Promise.all([
//             Request.findById(requestId).session(session),
//             RequestPlace.find({ requestId }).session(session),
//             Driver.findById(driverId).session(session)
//         ]);

//         // Validate data
//         if (!tripRequest) throw new ApiError(httpStatus.NOT_FOUND, 'Trip request not found');
//         if (tripRequest.isCompleted || tripRequest.isCancelled) {
//             throw new ApiError(httpStatus.UNAUTHORIZED, 'Request already completed or cancelled.');
//         }
//         if (!driver) throw new ApiError(httpStatus.NOT_FOUND, 'Driver not found.');

//         const tripPlace = tripPlaceRequest[0];
//         if (!tripPlace) throw new ApiError(httpStatus.NOT_FOUND, 'Trip Place request not found');



//         // Update trip request and place
//         tripRequest.completedAt = new Date();
//         tripRequest.isCompleted = true;

//         if (endKmImage != null) {
//             tripRequest.endKm = endKm;
//             tripRequest.endKmImage = endKmImage;
//         }

//         tripPlace.dropLat = droplat;
//         tripPlace.dropLng = droplng;
//         tripPlace.dropAddress = dropaddress;

//         await Promise.all([
//             tripRequest.save({ session }),
//             tripPlace.save({ session })
//         ]);

//         // Calculate billing based on trip type
//         let requestBillData;
//         if (trip_type === "RENTAL") {
//             req.body.promo_code = tripRequest.promoId;
//             const tripRequestData = await getRideLaterTypes(tripRequest.userId, req);
//             if (!tripRequestData) {
//                 throw new ApiError(httpStatus.NOT_FOUND, 'Trip Place request not found');
//             }
//             requestBillData = await getAmountCalculate(tripRequestData[0], vehicleId, tripTime, req);
//         } else if (trip_type === "LOCAL") {
//             req.body.promo_code = tripRequest.promoId;
//             const tripAmount = await getRideTypes(tripRequest.userId, req, tripRequest.vehicleId);

//             requestBillData = tripAmount.zoneTypePrice.find(
//                 trip => trip.type_id.equals(new ObjectId(tripRequest.vehicleId))
//             );
//         }

//         // Get user and zone in parallel
//         const [user, zone] = await Promise.all([
//             User.findById(tripRequest.userId).session(session),
//             getEndTripDropZone(req)
//         ]);

//         if (!user) throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
//         if (!zone || zone.nonServiceZone === 'Yes') {
//             return { status: 404, data: sendError('Non-service zone', [], 404) };
//         }

//         // increase user trip count
//         user.trips_count += 1;
//         await user.save({ session });

//         // Get driver user ID
//         const driverIdData = await Driver.findById(tripRequest.driverId).session(session);

//         // increase driver trip count
//         await User.findOneAndUpdate(
//             { _id: new ObjectId(driverIdData.userId) },
//             { $inc: { tripsCount: 1 } },
//             { new: true }
//         ).session(session);

//         let totalAmount = requestBillData?.total_amount || requestBillData?.totalAmount || 0;
//         let promoDiscount = 0;

//         // Calculate admin commission and fees
//         let adminCommission = 0;
//         let adminCommissionType = '';


//             // Original zone-based commission logic for  drivers
//             if (zone?.zonePriceDetails) {
//                 const zonePriceItem = zone.zonePriceDetails.find(item =>
//                     item?.vehicleDetails?._id?.equals(tripRequest.vehicleId)
//                 );

//                 if (zonePriceItem) {
//                     const isSpecialPrice = driver.specialPrice === true;
//                     const isRideNow = tripRequest.isLater === false;
//                     const isRideLater = tripRequest.isLater === true;

//                     if (isSpecialPrice) {
//                         if (isRideNow && zonePriceItem.ridenowSpecialPrice === 'Yes') {
//                             adminCommission = zonePriceItem.ridenowSpecialAdminCommission || 0;
//                             adminCommissionType = zonePriceItem.ridenowSpecialAdminCommissionType || 'Fixed';
//                         }
//                         else if (isRideLater && zonePriceItem.ridelaterSpecialPrice === 'Yes') {
//                             adminCommission = zonePriceItem.ridelaterSpecialAdminCommission || 0;
//                             adminCommissionType = zonePriceItem.ridelaterSpecialAdminCommissionType || 'Fixed';
//                         }
//                         else {
//                             adminCommission = isRideNow
//                                 ? zonePriceItem.ridenowAdminCommission || 0
//                                 : zonePriceItem.ridelaterAdminCommission || 0;
//                             adminCommissionType = isRideNow
//                                 ? zonePriceItem.ridenowAdminCommissionType || 'Fixed'
//                                 : zonePriceItem.ridelaterAdminCommissionType || 'Fixed';
//                         }
//                     } else {
//                         adminCommission = isRideNow
//                             ? zonePriceItem.ridenowAdminCommission || 0
//                             : zonePriceItem.ridelaterAdminCommission || 0;
//                         adminCommissionType = isRideNow
//                             ? zonePriceItem.ridenowAdminCommissionType || 'Fixed'
//                             : zonePriceItem.ridelaterAdminCommissionType || 'Fixed';
//                     }
//                 }
//             }
//         }

//         // Get service tax once
//         const serviceTax = await Settings.findOne({ name: 'serviceTax' }).session(session);
//         const serviceTaxPercentage = serviceTax?.value || 0;

//         // Calculate fees
//         const adminServiceFees = adminCommissionType === 'Percentage'
//             ? totalAmount * (adminCommission / 100)
//             : adminCommission;

//         const serviceFees = adminServiceFees !== 0
//             ? parseFloat((adminServiceFees * (serviceTaxPercentage / 100)).toFixed(2))
//             : 0;

//         const driverFees = totalAmount - adminServiceFees - serviceFees;

//         // Handle promo code if exists
//         if (tripRequest.promoId) {
//             const [promo, promo_count, promo_all_count] = await Promise.all([
//                 PromoCode.findById(tripRequest.promoId).session(session),
//                 Request.countDocuments({
//                     promoId: tripRequest.promoId,
//                     userId: user._id,
//                     isCompleted: 1
//                 }).session(session),
//                 Request.countDocuments({
//                     promoId: tripRequest.promoId,
//                     isCompleted: 1
//                 }).session(session)
//             ]);

//             if (promo) {
//                 if (promo_count >= promo.promoReuseCount) {
//                     throw new ApiError(httpStatus.FORBIDDEN, `Sorry! You already used this promo code ${promo.promoReuseCount} times`);
//                 }
//                 if (promo_all_count >= promo.totalCount) {
//                     throw new ApiError(httpStatus.FORBIDDEN, 'Sorry! promo code limit exceeded');
//                 }
//                 if (totalAmount < promo.targetAmount) {
//                     throw new ApiError(httpStatus.FORBIDDEN, `Sorry! promo only valid for amounts exceeding ${promo.targetAmount}`);
//                 }

//                 promoDiscount = promo.promoType === 'percentage'
//                     ? (totalAmount * promo.percentage) / 100
//                     : promo.amount;

//                 if (promoDiscount > totalAmount) {
//                     throw new ApiError(httpStatus.FORBIDDEN, `Sorry! promo only valid for amounts exceeding ${totalAmount}`);
//                 }

//                 totalAmount -= promoDiscount;
//             }
//         }

//         // Determine recipient for wallet transactions
//         let recipientUserId = driverIdData.userId; // Default to driver's userId

//         // Handle payment transactions
//         const paymentTransactions = [];
//         if (tripRequest.paymentOpt === 'CASH') {
//
//       if (tripRequest.paymentOpt === 'CARD') {
//             paymentTransactions.push(
//                 walletTransaction(
//                     driverFees,
//                     recipientUserId,
//                     'Earned',
//                     `Trip earnings for request ${requestId}`,
//                     tripRequest._id,
//                     session
//                 )
//             );
//         } else if (tripRequest.paymentOpt === 'WALLET') {
//             paymentTransactions.push(
//                 walletTransaction(
//                     totalAmount,
//                     tripRequest.userId,
//                     'Spent',
//                     `Trip payment for request ${requestId}`,
//                     tripRequest._id,
//                     session,
//                     'WALLET'
//                 ),
//                 walletTransaction(
//                     driverFees,
//                     recipientUserId,
//                     'Earned',
//                     `Trip earnings for request ${requestId}`,
//                     tripRequest._id,
//                     session
//                 )
//             );
//         }

//
//             if (existingEarnings) {
//                 // Update existing record
//                 const newTotalEarnings = parseFloat(existingEarnings.totalEarnings) + totalAmount;
//                 let newBalanceAmount = parseFloat(existingEarnings.balanceAmount);

//                 // For CASH payments, update balance amount
//                 if (tripRequest.paymentOpt === 'CASH') {
//                     newBalanceAmount += driverFees;
//                 }

//             } else {
//                 // Create new record
//                 let balanceAmount = 0;
//                 if (tripRequest.paymentOpt === 'CASH') {
//                     balanceAmount = driverFees;
//                 }

//             }
//         }

//         // Handle referral logic
//         const [userReferral, driverReferral, userRequestCount, driverRequestCount] = await Promise.all([
//             Referral.findOne({ referredTo: tripRequest.userId }).session(session),
//             Referral.findOne({ referredTo: driverIdData.userId }).session(session),
//             Request.countDocuments({ userId: tripRequest.userId, isCompleted: 1 }).session(session),
//             Request.countDocuments({ driverId: driverIdData.userId, isCompleted: 1 }).session(session)
//         ]);

//         const referredByUserId = userReferral?.referredBy;
//         const referredByDriverId = driverReferral?.referredBy;

//         const referralPromises = [];

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
//             if (referredByUserId) {
//                 referralPromises.push(handleReferralReward(referredByUserId, referalTripsAmount, tripRequest._id));
//             }
//             if (referredByDriverId) {
//                 referralPromises.push(handleReferralReward(referredByDriverId, referalTripsAmount, tripRequest._id));
//             }
//         } else {
//             if (userRequestCount <= referalTripsCount && referredByUserId) {
//                 referralPromises.push(handleReferralReward(referredByUserId, referalTripsAmount, tripRequest._id));
//             }
//             if (driverRequestCount <= referalTripsCount && referredByDriverId) {
//                 referralPromises.push(handleReferralReward(referredByDriverId, referalTripsAmount, tripRequest._id));
//             }
//         }

//         const countryDial = await Country.findById(new ObjectId(user.countryCode));

//         if (!countryDial) {
//             throw new ApiError(httpStatus.UNAUTHORIZED, errorMessages.INVALID_COUNTRYCODE);
//         }
//         // Create request bill
//         const requestBill = new RequestBill({
//             requestId: new ObjectId(requestId),
//             basePrice: requestBillData.base_price || requestBillData.pricing?.price || 0,
//             baseDistance: requestBillData.base_distance || requestBillData.baseKm || 0,
//             totalDistance: requestBillData.totalDistance || requestBillData.totalKm || 0,
//             totalTime: 0,
//             pricePerDistance: requestBillData.price_per_distance || requestBillData.pricePerDistance || 0,
//             distancePrice: requestBillData.distancePrice || 0,
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
//             requestedCurrencyCode: countryDial.dial_code,
//             requestedCurrencySymbol: countryDial.currency_symbol,
//             createdAt: new Date(),
//             updatedAt: new Date(),
//             subTotal: requestBillData.total_amount || requestBillData.totalAmount || 0,
//             outOfZonePrice: requestBillData.out_of_zone_price || requestBillData.outOfZonePrice || 0,
//             bookingFees: requestBillData.booking_fees || requestBillData.bookingFees || 0,
//             hillStationPrice: 0,
//         });

//         // Execute all parallel operations
//         await Promise.all([
//             ...paymentTransactions,
//             ...referralPromises,
//             requestBill.save({ session })
//         ]);

//         await session.commitTransaction();

//         // Send notifications
//         const responseData = await getRequestListData(requestId);

//         const userTopic = mqttConfig.USER_REQUEST + "" + tripRequest.userId;

//         await Promise.all([
//             mqttService.publishMessage(
//                 userTopic,
//                 JSON.stringify({
//                     title: "TRIP_COMPLETED",
//                     message: "Trip Completed",
//                     trip: responseData[0]
//                 })
//             ),
//             sendPushNotification(tripRequest.userId.toString(), {
//                 title: "TRIP_COMPLETED",
//                 message: "Trip Completed"
//             })
//         ]);

//         return responseData[0];

//     } catch (err) {
//         await session.abortTransaction();
//         console.error(err);
//         throw new ApiError(err.status || httpStatus.INTERNAL_SERVER_ERROR, err.message);
//     } finally {
//         await session.endSession();
//     }
// };


// const completeTrips = async (req) => {

//    const session = await mongoose.startSession();
//     session.startTransaction();
//     const settingNames = ['referalTripsCount', 'referalTripsAmount', 'referalRepeat'];
//     const settings = await Settings.find({ name: { $in: settingNames } });

//     const settingsMap = settings.reduce((acc, setting) => {
//         acc[setting.name] = setting.value;
//         return acc;
//     }, {});

//     const referalTripsCount = settingsMap['referalTripsCount'];
//     const referalTripsAmount = settingsMap['referalTripsAmount'];
//     const referalRepeat = settingsMap['referalRepeat'];


//     let driverId = await getDriverId(req);

//     let imageFile;

//     if (req.file && req.file.filename) {
//         imageFile = req.file.filename;
//     }

//     const { requestId, droplat, droplng, dropaddress, picklat, picklng, pickupaddress, beforewaitingtime, afterwaitingtime, ridetype, distance, vehicleId, endKm, trip_type, tripTime } = req.body;
//     try {

//         if (trip_type == "RENTAL") {
//             const tripRequest = await Request.findById(requestId);

//             if (!tripRequest) {
//                 throw new ApiError(httpStatus.NOT_FOUND, 'Trip request not found');
//             }

//             req.body.promo_code = tripRequest.promoId;

//             const tripPlaceRequest = await RequestPlace.find({ requestId: requestId });

//             let tripPlace = tripPlaceRequest[0];

//             if (!tripPlace) {
//                 throw new ApiError(httpStatus.NOT_FOUND, 'Trip Place request not found');
//             }

//             // Validate trip request
//             if (tripRequest.isCompleted || tripRequest.isCancelled) {
//                 throw new ApiError(httpStatus.UNAUTHORIZED, 'Request already completed or cancelled.');
//             }
//             const driver = await Driver.findById(driverId);
//             if (!driver) {
//                 throw new ApiError(httpStatus.NOT_FOUND, 'Driver not found.');
//             }

//             tripRequest.completedAt = new Date();
//             tripRequest.isCompleted = true;
//             tripRequest.endKm = endKm;
//             tripRequest.endKmImage = imageFile;
//             await tripRequest.save();


//             tripPlace.dropLat = droplat;
//             tripPlace.dropLng = droplng;
//             tripPlace.dropAddress = dropaddress;

//             await tripPlace.save();

//             let tripRequestData = await getRideLaterTypes(tripRequest.userId, req);

//             if (!tripRequestData) {
//                 throw new ApiError(httpStatus.NOT_FOUND, 'Trip Place request not found');
//             }

//             let requestData = await getAmountCalculate(tripRequestData[0], vehicleId, tripTime)


//             const requestBill = new RequestBill({
//                 requestId: new ObjectId(requestId), // Replace with actual requestId
//                 basePrice: requestData.pricing.price,
//                 baseDistance: requestData.baseKm,
//                 totalDistance: requestData.totalKm || 0,
//                 totalTime: 0, // Assign an appropriate value if available
//                 pricePerDistance: requestData.pricePerDistance,
//                 distancePrice: requestData.distancePrice,
//                 pricePerTime: requestData.pricePerTime || 0,
//                 timePrice: 0, // Assign if applicable
//                 waitingCharge: requestData.waiting_charge || 0,
//                 cancellationFee: 0, // Assign if applicable
//                 serviceTax: 0, // Assign if applicable
//                 serviceTaxPercentage: 0, // Assign if applicable
//                 promoDiscount: 0, // Assign if applicable
//                 adminCommission: 0, // Assign if applicable
//                 adminCommissionWithTax: 0, // Assign if applicable
//                 driverCommission: 0, // Assign if applicable
//                 totalAmount: requestData.totalAmount || 0,
//                 requestedCurrencyCode: 'RS', // Assign correct currency
//                 requestedCurrencySymbol: '$', // Assign correct symbol
//                 createdAt: new Date(),
//                 updatedAt: new Date(),
//                 subTotal: requestData.total_amount || 0,
//                 outOfZonePrice: requestData.out_of_zone_price || 0,
//                 bookingFees: requestData.booking_fees || 0,
//                 hillStationPrice: 0, // Assign if applicable
//             });

//             await requestBill.save();


//             let responseData = await getRequestList(requestId)


//             await mqttService.publishMessage(
//                 `user/request/${tripRequest.userId}`,
//                 JSON.stringify({
//                     title: "TRIP_COMPLETED",
//                     message: "Trip Completed",
//                     trip: responseData[0]
//                 })
//             );

//             await sendPushNotification(tripRequest.userId.toString(), {
//                 title: "TRIP_COMPLETED",
//                 message: "Trip Completed"
//             });

//             return responseData[0];

//         } else if (trip_type == "LOCAL") {
//             const tripRequest = await Request.findById(requestId);

//             if (!tripRequest) {
//                 throw new ApiError(httpStatus.NOT_FOUND, 'Trip request not found');
//             }

//             req.body.promo_code = tripRequest.promoId;

//             const tripPlaceRequest = await RequestPlace.find({ requestId: requestId });

//             let tripPlace = tripPlaceRequest[0];

//             if (!tripPlace) {
//                 throw new ApiError(httpStatus.NOT_FOUND, 'Trip Place request not found');
//             }

//             // Validate trip request
//             if (tripRequest.isCompleted || tripRequest.isCancelled) {
//                 throw new ApiError(httpStatus.UNAUTHORIZED, 'Request already completed or cancelled.');
//             }
//             const driver = await Driver.findById(driverId);
//             if (!driver) {
//                 throw new ApiError(httpStatus.NOT_FOUND, 'Driver not found.');
//             }


//             tripRequest.completedAt = new Date();
//             tripRequest.isCompleted = true;
//             await tripRequest.save();

//             tripPlace.dropLat = droplat;
//             tripPlace.dropLng = droplng;
//             tripPlace.dropAddress = dropaddress;

//             await tripPlace.save();

//             let tripAmount = await getRideTypes(tripRequest.userId, req);


//             const filteredTrip = tripAmount.zoneTypePrice.filter(
//                 trip => trip.type_id.equals(new ObjectId(vehicleId))
//             );

//             let filteredTrips = filteredTrip[0];


//             const requestBill = new RequestBill({
//                 requestId: new ObjectId(requestId), // Replace with actual requestId
//                 basePrice: filteredTrips.base_price,
//                 baseDistance: parseFloat(filteredTrips.base_distance) || 0,
//                 totalDistance: filteredTrips.filteredTrips || 0,
//                 totalTime: 0, // Assign an appropriate value if available
//                 pricePerDistance: filteredTrips.price_per_distance || 0,
//                 distancePrice: (filteredTrips.distance || 0) * (filteredTrips.price_per_distance || 0),
//                 pricePerTime: filteredTrips.price_per_time || 0,
//                 timePrice: 0, // Assign if applicable
//                 waitingCharge: filteredTrips.waiting_charge || 0,
//                 cancellationFee: 0, // Assign if applicable
//                 serviceTax: 0, // Assign if applicable
//                 serviceTaxPercentage: 0, // Assign if applicable
//                 promoDiscount: 0, // Assign if applicable
//                 adminCommission: 0, // Assign if applicable
//                 adminCommissionWithTax: 0, // Assign if applicable
//                 driverCommission: 0, // Assign if applicable
//                 totalAmount: filteredTrips.total_amount || 0,
//                 requestedCurrencyCode: 'RS', // Assign correct currency
//                 requestedCurrencySymbol: '$', // Assign correct symbol
//                 createdAt: new Date(),
//                 updatedAt: new Date(),
//                 subTotal: filteredTrips.total_amount || 0,
//                 outOfZonePrice: filteredTrips.out_of_zone_price || 0,
//                 bookingFees: filteredTrips.booking_fees || 0,
//                 hillStationPrice: 0, // Assign if applicable
//             });

//             await requestBill.save();

//             let responseData = await getRequestList(requestId)


//             await mqttService.publishMessage(
//                 `user/request/${tripRequest.userId}`,
//                 JSON.stringify({
//                     title: "TRIP_COMPLETED",
//                     message: "Trip Completed",
//                     trip: responseData[0]
//                 })
//             );

//             await sendPushNotification(tripRequest.userId.toString(), {
//                 title: "TRIP_COMPLETED",
//                 message: "Trip Completed"
//             });

//             return responseData[0];
//         }



//     } catch (err) {
//         console.error(err);
//         throw new Error(err.message);
//     }

// };

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

    const startKmValue = toNumber(request?.startKm);
    const endKmValue = toNumber(req?.body?.endKm ?? request?.endKm);
    // Prefer endKm from complete-trip payload and avoid negative distance on stale request snapshots.
    let totalKm = endKmValue - startKmValue;
    if (!Number.isFinite(totalKm) || totalKm < 0) {
      totalKm = 0;
    }

    if (zone.unit != "KM") {
      totalKm = totalKm * 0.6213711922
    }

    let totalAmount = vehiclePricing.price + (totalKm > rental.km ? (totalKm - rental.km) * vehiclePricing.extraKmPrice : 0);

    if (req.body.promo_code) {
      totalAmount = await applyPromoCode(req, totalAmount, user);
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

    const {
      requestId,
      droplat,
      droplng,
      dropaddress,
      picklat,
      picklng,
      pickupaddress,
      beforewaitingtime,
      afterwaitingtime,
      beforeWaitingTime,
      afterWaitingTime,
      ridetype,
      rideType,
      promo_code
    } = req.body;

    const normalizedBeforeWaitingTime = beforeWaitingTime ?? beforewaitingtime ?? 0;
    const normalizedAfterWaitingTime = afterWaitingTime ?? afterwaitingtime ?? 0;

    const requestDetails = await Request.findById(requestId);
    if (!requestDetails) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Trip request not found');
    }

    const rawRideType = ridetype ?? rideType ?? requestDetails.rideType ?? 'RIDE_NOW';
    const pricingRideType =
      requestDetails.isLater === true ? 'RIDE_LATER' : String(rawRideType).trim().toUpperCase();

    // Use actual traveled distance from end-trip payload when available.
    // Fallback to request's ETA distance only if payload distance is missing/invalid.
    let distance = toNumber(req.body.distance);
    if (!Number.isFinite(distance) || distance < 0) {
      distance = toNumber(requestDetails.totalDistance);
    }
    const zone = await endPickUpPickupZone(req);


    if (!zone || zone.nonServiceZone === 'Yes') return { status: 404, data: sendError('Non-service zone', [], 404) };

    let currentDate = new Date();

    let ride_date = currentDate.toISOString().split('T')[0]; // Format: YYYY-MM-DD
    let ride_time = currentDate.toTimeString().split(' ')[0]; // Format: HH:MM:SS

    if (zone.unit != "KM") {
      distance = distance * 0.6213711922;
    }

    const zonePrice = await endCalculateZonePrices(
      req,
      zone,
      distance,
      pricingRideType,
      promo_code,
      user,
      ride_time,
      ride_date,
      normalizedBeforeWaitingTime,
      normalizedAfterWaitingTime,
      vehicleId
    );

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

const sendError = (message, data, code) => ({
  success: false,
  message,
  data,
  code,
});

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
  completeTrips
};
