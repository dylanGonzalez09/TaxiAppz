const { Wallet, Request, RequestPlace, Rental, Driver, RequestMeta, User, Users, Vehicle, RequestDriverData, Country, ZonePrice, PromoCode, requestListView ,Zone,Settings} = require('../../../models');
const ApiError = require('../../../utils/ApiError');
const httpStatus = require('http-status').default || require('http-status').status || require('http-status');
const ObjectId = require('mongoose').Types.ObjectId
const tokenService = require('../../token.service');
const { getPickupZone, generateRequestNumber,getUserId,getClientId,getDriverId, uniqueRandomNumbers, fetchDriver, calculateDistance, sendClientNotification, sendPushNotification } = require('../../../utils/commonFunction')
const { getAllDriverLocation } = require('../../../config/mqttClient');
const moment = require('moment')
const mqttService = require('../../../services/mqtt/mqtt.service');
const mongoose = require('mongoose');
const { mqttConfig } = require('../../../config/string');
const { getPrimaryZone } = require('../../web/zone/zone.service');

const parseScheduledTripTime = (rawTripTime) => {
  const ts = Number(rawTripTime);

  return Number.isFinite(ts) && ts > 0 ? ts : null;
};

/**
  from the mobile side they need to send Client Id and Code (Version code)
  1. Check the Version Available or not if not redirect to update screen
  2. check the avaliable languages for client send the avaliable languages
 */


const validateUserInTrip = async (user) => {

  try {
    // Check for an active, non-cancelled trip where 'is_later' is false
    const userExistsTrip = await Request.findOne({
      where: {
        isCompleted: false,
        isCancelled: false,
        userId: user.id,
        isLater: false,
      },
    });

    if (userExistsTrip) {
      const error = new Error('User already in trip');
      error.statusCode = 400; // Bad Request
      throw error;
    }
  } catch (error) {
    throw error;
  }
};
const validateUserRequestedTrip = async (user) => {
  try {
    // Find RequestMeta records for the current user
    const requestMetaWithCurrentUser = await RequestMeta.findOne({
      where: { userId: user.id },
    });

    if (requestMetaWithCurrentUser) {
      // Get the associated request_id
      const requestId = requestMetaWithCurrentUser.requestId;

      // If a request ID exists, cancel the trip
      if (requestId) {
        await Request.update(
          { isCancelled: true, cancelMethod: 1 },
          { where: { id: requestId } }
        );
      }

      // Delete all meta details related to the user
      await RequestMeta.destroy({
        where: { userId: user.id },
      });
    }
  } catch (error) {
    console.error('Error in validateUserRequestedTrip:', error);
    throw new Error('Failed to validate user requested trip');
  }
};
const validatePaymentOption = async (request) => {
  try {
    switch (request.payment_opt) {
      case 'CARD':
        // Validate card payment
        return await checkCard(request);

      case 'CASH':
        // Cash payment, no validation needed
        return true;

      case 'WALLET':
        // Validate wallet payment
        // return await checkWallet(request);
        return true;

      default:
        throw new Error('Invalid payment option selected');
    }
  } catch (error) {
    console.error('Error validating payment option:', error.message);
    throw error; // Re-throw error for the controller to handle
  }
};

const createTrip = async (req) => {
  let clientId = await getClientId(req);
  let userId = await getUserId(req);
  let promocode_id = 0;

  if (req.body.trip_type == "LOCAL") {

    const { promo_code, booking_for, payment_opt, pick_lat, pick_lng, drop_lat, drop_lng, stops, driver_notes, vehicle_type, ride_type, eta_amount, isLater } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Unauthorized user');
    }

    if (!user.active) {
      throw new ApiError(httpStatus.FORBIDDEN, 'User is blocked, please contact admin');

    }

    // Validate user's existing trips
    await validateUserInTrip(user);
    await validateUserRequestedTrip(user);

    // Validate payment option
    const paymentOpt = await validatePaymentOption(req.body);

    let veh_id = req.body.vehicle_type;
    const type = await Vehicle.findOne({ _id: veh_id, clientId: clientId });
    if (!type) {
      throw new ApiError(httpStatus.FORBIDDEN, 'Wrong Vehicle Type');
    }

    // Find zone based on pickup coordinates
    const zone = await getPickupZone(req); // Assumes a helper function `getZone`
    if (!zone) {
      throw new ApiError(httpStatus.FORBIDDEN, 'Service not available at this location');
    }

    let zoneTypeId = 0;
    for (const zonePrice of zone.zonePriceDetails) {
      let zonePriceVehId = zonePrice.vehicleDetails._id;
      let typeId = type._id;

      if (zonePriceVehId.equals(typeId)) {
        zoneTypeId = zonePrice._id;
      }
    }

    const price = await ZonePrice.findById(zoneTypeId);

    if (!price || zoneTypeId === 0) {
      throw new ApiError(httpStatus.FORBIDDEN, 'Service not available at this location');

    }
    // Check for surge pricing
    let surgePriceId = 0;
    let surgePrice = false;
    const today = moment().format('dddd'); // Get today's day name

    for (const surge of zone.zoneSurgePriceDetails) {
      const startTime = moment(surge.startTime, 'HH:mm');
      const endTime = moment(surge.endTime, 'HH:mm');
      const currentTime = moment();

      if (
        currentTime.isBetween(startTime, endTime) &&
        surge.availableDays
      ) {
        const availableDays = surge.availableDays;
        if (availableDays.includes(today)) {
          surgePrice = true;
          surgePriceId = surge._id;
          break;
        }
      }
    }

    // Validate payment option
    if (req.body.payment_opt) {
      const paymentOptions = zone.paymentTypes;
      if (!paymentOptions.includes(req.body.payment_opt)) {
        throw new ApiError(httpStatus.FORBIDDEN, 'Payment Option is not available. Please select another option');

      }
    }

    let promocode_id = 0;
    let promoAmount = 0;

    if (promo_code) {
      const promocode = await PromoCode.findOne({ _id: promo_code });
      if (!promocode) throw new ApiError(httpStatus.FORBIDDEN, 'Wrong Promo Code');

      const [promo_count, promo_all_count] = await Promise.all([
        Request.countDocuments({ promoId: promocode.id, userId: user.id, isCompleted: 1 }),
        Request.countDocuments({ promoId: promocode.id, isCompleted: 1 })
      ]);

      if (promo_count > promocode.promoReuseCount) throw new ApiError(httpStatus.FORBIDDEN, `Sorry! You already ${promocode.promo_count} times used this promo code`);
      if (promo_all_count > promocode.promo_use_count) throw new ApiError(httpStatus.FORBIDDEN, 'Sorry! promo code limit exceeded');

      if (promocode.promoType == "fixed") {
        promocode_id = promocode.id;
        promoAmount = promocode.amount;
      }
      else if (promocode.promoType == "percentage") {
        promocode_id = promocode.id;
        promoAmount = promocode.percentage;
      }
    }
    // Generate ride details
    const requestNumber = await generateRequestNumber();
    const requestOtp = await uniqueRandomNumbers(4);
    if (promocode_id === 0) {
      promocode_id = null;
    }
    const scheduledTripTime = isLater ? parseScheduledTripTime(req.body.tripTime) : null;

    const requestParams = {
      requestNumber: requestNumber,
      requestOtp,
      userId: user.id,
      zoneTypeId: zoneTypeId,
      paymentOpt: req.body.payment_opt,
      unit: zone.unit, // Add logic to get unit dynamically
      promoId: promocode_id,
      requestedCurrencyCode: 'USD', // Placeholder
      requestedCurrencySymbol: '$', // Placeholder
      driverInfo: driver_notes,
      tripType: ride_type,
      vehicleId: veh_id,
      bookingFor: req.body.booking_for,
      tripStartTime: scheduledTripTime ? moment(scheduledTripTime) : moment(),
      tripSecondaryVehicle: zoneTypeId,
      rideType: req.body.ride_type,
      tripType: req.body.trip_type,
      isLater: isLater,
      tripTime: scheduledTripTime,
      zoneId: zone._id
    };

    const requestDetail = await Request.create(requestParams);

    let other_user = null;
    if (booking_for === 'OTHERS') {
      other_user = await User.create({
        firstName: req.body.others_name,
        phoneNumber: req.body.others_number
      });
      const bodyUser = {
        others_user_id: other_user._id,
      }
      Object.assign(requestDetail, bodyUser);
      await user.save();
    }

    // Add stops logic
    if (stops) {
      const stopLocations = JSON.parse(stops);
      for (let i = 0; i < stopLocations.length; i++) {
        const currentStop = stopLocations[i];
        const prevStop = stopLocations[i - 1] || { latitude: pick_lat, longitude: pick_lng, address: req.body.pick_address };

        await RequestPlace.create({
          pickLat: prevStop.latitude,
          pickLng: prevStop.longitude,
          dropLat: currentStop.latitude,
          dropLng: currentStop.longitude,
          pickAddress: prevStop.address,
          dropAddress: currentStop.address,
          requestId: requestDetail._id,
          stops: 1,
          vehicleType: vehicle_type
        });
      }
    } else {
      await RequestPlace.create({
        pickLat: pick_lat,
        pickLng: pick_lng,
        dropLat: drop_lat,
        dropLng: drop_lng,
        pickAddress: req.body.pick_address,
        dropAddress: req.body.drop_address,
        requestId: requestDetail._id,
        vehicleType: vehicle_type
      });
    }

    if (!isLater) {
      const drivers = await fetchDriver(pick_lat, pick_lng, vehicle_type, ride_type, zone._id, drop_lat, drop_lng);

      if (!drivers || !drivers.length) {
        requestDetail.cancelled_at = moment();
        requestDetail.is_cancelled = 1;
        requestDetail.cancel_method = 'Automatic';
        await requestDetail.save();
        throw new ApiError(httpStatus.NOT_FOUND, 'No Driver Found');
      }

      let selectedDrivers = [];
      for (let driver of drivers) {
        const driverData = await Users.findById(driver.userId);

        const isDriverFree = await RequestMeta.countDocuments({ driverId: driver.driverId, active: true }) === 0;
        if (isDriverFree) {
          selectedDrivers.push({
            user_id: driver.userId,
            driver_id: driver.driverId,
            active: selectedDrivers.length === 0 ? 1 : 0,
            request_id: requestDetail._id,
            assign_method: 1,
            created_at: new Date(),
            updated_at: new Date()
          });
        }

      }

      if (!selectedDrivers.length) {
        requestDetail.cancelled_at = moment();
        requestDetail.is_cancelled = 1;
        requestDetail.cancel_method = 'Automatic';
        await requestDetail.save();
        throw new ApiError(httpStatus.NOT_FOUND, 'No Driver Found');
      }

      // Notify the first driver
      const firstDriver = selectedDrivers[0];

      const metaDriver = await Driver.findById(firstDriver.driver_id);

      await sendPushNotification(metaDriver.userId.toString(), {
        title: "New Trip Requested",
        message: "New Trip Requested, you can accept or Reject the request"
      });


      // Save driver meta and request locations
      await RequestMeta.insertMany(selectedDrivers.map(({ user_id, request_id, driver_id, active, assign_method }) => ({
        userId: user_id,
        requestId: request_id,
        driverId: driver_id,
        active,
        assignMethod: assign_method
      })));


      let responseData = await getRequestListData(requestDetail.id);

      const driverTopic = mqttConfig.DRIVER_REQUEST + "" + firstDriver.driver_id;

      // `driver/request/${firstDriver.driver_id}`

      await mqttService.publishMessage(
        driverTopic,
        JSON.stringify({
          title: "New Trip Requested",
          message: "New Trip Requested, you can accept or Reject the request",
          tripDetails: responseData[0]
        })
      );

      return responseData[0];
    } else {
      return requestDetail;
    }
  }
  else if (req.body.trip_type == "RENTAL") {

    const { promo_code, booking_for, payment_opt, pick_lat, pick_lng, vehicle_type, ride_type, isLater, trip_type, packageId } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Unauthorized user');
    }

    if (!user.active) {
      throw new ApiError(httpStatus.FORBIDDEN, 'User is blocked, please contact admin');

    }

    // Validate user's existing trips
    await validateUserInTrip(user);
    await validateUserRequestedTrip(user);

    // Validate payment option
    const paymentOpt = await validatePaymentOption(req.body);

    let veh_id = req.body.vehicle_type;
    const type = await Vehicle.findOne({ _id: veh_id, clientId: clientId });
    if (!type) {
      throw new ApiError(httpStatus.FORBIDDEN, 'Wrong Vehicle Type');
    }

    // Find zone based on pickup coordinates
    const zone = await getPickupZone(req); // Assumes a helper function `getZone`
    if (!zone) {
      throw new ApiError(httpStatus.FORBIDDEN, 'Service not available at this location');
    }


    const rental = await Rental.findById(packageId)


    // Validate payment option
    if (req.body.payment_opt) {
      const paymentOptions = zone.paymentTypes;
      if (!paymentOptions.includes(req.body.payment_opt)) {
        throw new ApiError(httpStatus.FORBIDDEN, 'Payment Option is not available. Please select another option');

      }
    }

    if (promo_code) {
      const promocode = await PromoCode.findOne({
        where: { status: true, promo_code }
      });

      if (!promocode) {
        return sendError(res, 'Wrong Promo Code', 403);
      }

      promocode_id = promocode.id;

      const promo_count = await Request.count({
        where: { promo_id: promocode_id, user_id: user.id, is_completed: 1 }
      });

      if (promo_count > promocode.promo_user_reuse_count) {
        return sendError(res, `Sorry! You already ${promocode.promo_user_reuse_count} times used this promo code`, 403);
      }

      const promo_all_count = await Request.count({
        where: { promo_id: promocode_id, is_completed: 1 }
      });

      if (promo_all_count > promocode.promo_use_count) {
        return sendError(res, 'Sorry! promo code limit exceeded', 403);
      }
    }
    // Generate ride details
    const requestNumber = await generateRequestNumber();
    const requestOtp = await uniqueRandomNumbers(4);
    if (promocode_id === 0) {
      promocode_id = null;
    }

    const scheduledTripTime = isLater ? parseScheduledTripTime(req.body.tripTime) : null;

    const requestParams = {
      requestNumber: requestNumber,
      requestOtp,
      userId: user.id,
      paymentOpt: req.body.payment_opt,
      unit: zone.unit, // Add logic to get unit dynamically
      promoId: promocode_id,
      requestedCurrencyCode: 'RS', // Placeholder
      requestedCurrencySymbol: '$', // Placeholder
      bookingFor: req.body.booking_for,
      tripStartTime: scheduledTripTime ? moment(scheduledTripTime) : moment(),
      rideType: req.body.ride_type,
      tripType: req.body.trip_type,
      isLater: isLater,
      tripTime: scheduledTripTime,
      packageId: packageId,
      packageKm: rental.km,
      packageHr: rental.hour,
      zoneId: zone._id
    };

    const requestDetail = await Request.create(requestParams);

    let other_user = null;
    if (booking_for === 'OTHERS') {
      other_user = await User.create({
        firstName: req.body.others_name,
        phoneNumber: req.body.others_number
      });
      const bodyUser = {
        others_user_id: other_user._id,
      }
      Object.assign(requestDetail, bodyUser);
      await user.save();
    }


    await RequestPlace.create({
      pickLat: pick_lat,
      pickLng: pick_lng,
      dropLat: "",
      dropLng: "",
      pickAddress: req.body.pick_address,
      dropAddress: "",
      requestId: requestDetail._id,
      vehicleType: vehicle_type
    });

    if (!isLater) {
      // Handle booking for others
      const drivers = await fetchDriver(pick_lat, pick_lng, vehicle_type, ride_type, zone._id, "", "");
      if (!drivers || !drivers.length) {
        requestDetail.cancelled_at = moment();
        requestDetail.is_cancelled = 1;
        requestDetail.cancel_method = 'Automatic';
        await requestDetail.save();
        throw new ApiError(httpStatus.NOT_FOUND, 'No Driver Found');
      }

      let selectedDrivers = [];
      for (let driver of drivers) {
        const driverData = await Users.findById(driver.userId);

        const isDriverFree = await RequestMeta.countDocuments({ driverId: driver.driverId, active: true }) === 0;
        if (isDriverFree) {
          selectedDrivers.push({
            user_id: driver.userId,
            driver_id: driver.driverId,
            active: selectedDrivers.length === 0 ? 1 : 0,
            request_id: requestDetail._id,
            assign_method: 1,
            created_at: new Date(),
            updated_at: new Date()
          });
        }

      }

      if (!selectedDrivers.length) {
        requestDetail.cancelled_at = moment();
        requestDetail.is_cancelled = 1;
        requestDetail.cancel_method = 'Automatic';
        await requestDetail.save();
        throw new ApiError(httpStatus.NOT_FOUND, 'No Driver Found');
      }

      // Notify the first driver
      const firstDriver = selectedDrivers[0];
      const metaDriver = await Driver.findById(firstDriver.driver_id);

      await sendPushNotification(metaDriver.userId, {
        title: "New Trip Requested",
        message: "New Trip Requested, you can accept or Reject the request"
      });

      // Save driver meta and request locations
      await RequestMeta.insertMany(selectedDrivers.map(({ user_id, request_id, driver_id, active, assign_method }) => ({
        userId: user_id,
        requestId: request_id,
        driverId: driver_id,
        active,
        assignMethod: assign_method
      })));


      let responseData = await getRequestListData(requestDetail.id);

      const driverTopic = mqttConfig.DRIVER_REQUEST + "" + firstDriver.driver_id;

      //`driver/request/${firstDriver.driver_id}`

      await mqttService.publishMessage(
        driverTopic,
        JSON.stringify({
          title: "New Trip Requested",
          message: "New Trip Requested, you can accept or Reject the request",
          tripDetails: responseData[0]
        })
      );

      return responseData[0];
    }
    else {
      return requestDetail;
    }


  }

};

// Start Create Trip From Mobile


const createTrips = async (req) => {
  // Parallelize initial data fetching
  const [clientId, userId] = await Promise.all([
    getClientId(req),
    getUserId(req)
  ]);

  // Common validations extracted
  const user = await User.findById(userId);
  const estimatedAmount = req.body.estimatedAmount || 0;

  if (!user) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Unauthorized user');
  }
  if (!user.active) {
    throw new ApiError(httpStatus.FORBIDDEN, 'User is blocked, please contact admin');
  }

  const userWallet = await Wallet.findOne({ userId: userId });
  if (!userWallet) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User wallet not found');
  }

  if (userWallet.balance < 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Wallet balance is negative. Please recharge.');
  }

  if (req.body.payment_opt == 'WALLET' && userWallet.balance < estimatedAmount) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Insufficient balance. Please recharge.');
  }

  // Validate user's existing trips in parallel
  await Promise.all([
    validateUserInTrip(user),
    validateUserRequestedTrip(user)
  ]);

  // Validate payment option
  await validatePaymentOption(req.body);

  const { trip_type } = req.body;
  if (trip_type === "LOCAL") {
    return await createLocalTrip(req, user, clientId);
  } else if (trip_type === "RENTAL") {
    return await createRentalTrip(req, user, clientId);
  } else {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid trip type');
  }
};
// Helper function for LOCAL trips

const createLocalTrip = async (req, user, clientId) => {
  const {
    promo_code,
    booking_for,
    payment_opt,
    pick_lat,
    pick_lng,
    drop_lat,
    drop_lng,
    stops,
    driver_notes,
    vehicle_type,
    ride_type,
    estimatedAmount,
    isLater
  } = req.body;

  // Validate vehicle type

  const [type, zone] = await Promise.all([
    Vehicle.findOne({ _id: vehicle_type, clientId }).select('_id').lean(),
    getPickupZone(req)
  ]);



  if (!type) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Wrong Vehicle Type');
  }
  if (!zone) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Service not available at this location');
  }

  // Find zone price
  const zonePriceDetail = zone.zonePriceDetails.find(
    zp => zp.vehicleDetails._id.equals(type._id)
  );

  if (!zonePriceDetail) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Service not available at this location');
  }

  // Check for surge pricing
  const today = moment().format('dddd');
  const currentTime = moment();
  const surgePriceDetail = zone.zoneSurgePriceDetails.find(surge => {
    const startTime = moment(surge.startTime, 'HH:mm');
    const endTime = moment(surge.endTime, 'HH:mm');
    return (
      currentTime.isBetween(startTime, endTime) &&
      surge.availableDays.includes(today)
    );
  });



  // Validate payment option
  if (payment_opt) {
    const isAvailable = zone.paymentTypes.some(
      opt => opt.toLowerCase() === payment_opt.toLowerCase()
    );

    if (!isAvailable) {
      throw new ApiError(httpStatus.FORBIDDEN, 'Payment Option is not available. Please select another option');
    }
  }

  // Handle promo code
  let promoId = null;
  let promoAmount = 0;

  if (promo_code) {
    const [promocode, promo_count, promo_all_count] = await Promise.all([
      PromoCode.findById(promo_code).lean(),
      Request.countDocuments({ promoId: promo_code, userId: user.id, isCompleted: 1 }),
      Request.countDocuments({ promoId: promo_code, isCompleted: 1 })
    ]);

    if (!promocode) throw new ApiError(httpStatus.FORBIDDEN, 'Wrong Promo Code');
    if (promo_count > promocode.promoReuseCount) {
      throw new ApiError(httpStatus.FORBIDDEN, `Sorry! You already ${promocode.promo_count} times used this promo code`);
    }
    if (promo_all_count > promocode.promo_use_count) {
      throw new ApiError(httpStatus.FORBIDDEN, 'Sorry! promo code limit exceeded');
    }

    if (promocode.promoType === "fixed") {
      promoId = promocode._id;
      promoAmount = promocode.amount;
    } else if (promocode.promoType === "percentage") {
      promoId = promocode._id;
      promoAmount = promocode.percentage;
    }
  }

  // Generate request details
  const [requestNumber, requestOtp] = await Promise.all([
    generateRequestNumber(),
    uniqueRandomNumbers(4)
  ]);

  const countryDial = await Country.findById(new ObjectId(user.countryCode));

  if (!countryDial) {
    throw new ApiError(httpStatus.UNAUTHORIZED, errorMessages.INVALID_COUNTRYCODE);
  }

  const price = await ZonePrice.findById(zonePriceDetail._id);

  let distance = await calculateDistance(pick_lat, pick_lng, drop_lat, drop_lng, stops);

  if (zone.unit != "KM") {
    distance = distance * 0.6213711922
  }

  let driverAmount = 0;
  let commission = 0;
  // if (price) {
  //   if (ride_type == "RIDE_NOW") {
  //     if (price.ridenowAdminCommissionType == "Percentage") {
  //       commission = estimatedAmount * price.ridenowAdminCommission / 100;
  //       driverAmount = estimatedAmount - commission;
  //     } else if (price.ridenowAdminCommissionType == "Fixed") {
  //       driverAmount = estimatedAmount - price.ridenowAdminCommission;
  //     }
  //   } else if (ride_type == "RIDE_LATER") {

  //     if (price.ridelaterAdminCommissionType == "Percentage") {
  //       commission = estimatedAmount * price.ridelaterAdminCommission / 100;
  //       driverAmount = estimatedAmount - commission;
  //     } else if (price.ridelaterAdminCommissionType == "Fixed") {
  //       driverAmount = estimatedAmount - price.ridelaterAdminCommission;
  //     }
  //   }
  // }

  if (price) {
    if (ride_type == "RIDE_NOW") {
      if (price.ridenowAdminCommissionType == "Percentage") {
        commission = parseFloat(((estimatedAmount * price.ridenowAdminCommission) / 100).toFixed(2));
        driverAmount = estimatedAmount - commission;
      } else if (price.ridenowAdminCommissionType == "Fixed") {
        driverAmount = estimatedAmount - price.ridenowAdminCommission;
      }
    } else if (ride_type == "RIDE_LATER") {
      if (price.ridelaterAdminCommissionType == "Percentage") {
        commission = parseFloat(((estimatedAmount * price.ridelaterAdminCommission) / 100).toFixed(2));
        driverAmount = estimatedAmount - commission;
      } else if (price.ridelaterAdminCommissionType == "Fixed") {
        driverAmount = estimatedAmount - price.ridelaterAdminCommission;
      }
    }
  }


  const scheduledTripTime = isLater ? parseScheduledTripTime(req.body.tripTime) : null;

  const requestParams = {
    // requestNumber,
    requestOtp,
    userId: user.id,
    zoneTypeId: zonePriceDetail._id,
    paymentOpt: payment_opt,
    unit: zone.unit,
    promoId,
    requestedCurrencyCode: countryDial.dial_code,
    requestedCurrencySymbol: countryDial.currency_symbol,
    driverInfo: driver_notes,
    vehicleId: vehicle_type,
    bookingFor: booking_for,
    tripStartTime: scheduledTripTime ? moment(scheduledTripTime) : moment(),
    tripSecondaryVehicle: zonePriceDetail._id,
    rideType: ride_type,
    tripType: 'LOCAL',
    isLater,
    tripTime: scheduledTripTime,
    zoneId: zone._id,
    totalDistance: distance || 0,
    driverCommission: driverAmount || 0,
    estimatedAmount
  };


  // let finalZoneIdToAssign = zone._id;

  // if (zone.zoneLevel === 'SECONDARY' && zone.primaryZoneId) {
  //   finalZoneIdToAssign = zone.primaryZoneId;
  // }

  // // Update user's zoneId (overwrite)
  // await Users.findByIdAndUpdate(
  //   user.id,
  //   { zoneId: finalZoneIdToAssign },
  //   { new: true }
  // );




  const requestDetail = await Request.create(requestParams);

  // Handle booking for others
  if (booking_for === 'OTHERS') {
    let userDetails = await User.findOne({ phoneNumber: req.body.others_number })
    if (userDetails != null) {

      requestDetail.othersUserId = userDetails._id;
      await requestDetail.save();
    } else {
      const other_user = await User.create({
        firstName: req.body.others_name,
        phoneNumber: req.body.others_number
      });

      requestDetail.othersUserId = other_user._id;
      await requestDetail.save();
    }
  }

  // Handle stops - build promises in a loop (forEach+async does not wait)
  const placePromises = [];
  if (stops) {
    const stopLocations = stops;
    for (let i = 0; i < stopLocations.length; i += 1) {
      const currentStop = stopLocations[i];
      placePromises.push(RequestPlace.create({
        pickLat: pick_lat,
        pickLng: pick_lng,
        dropLat: drop_lat,
        dropLng: drop_lng,
        stopLat: currentStop.latitude,
        stopLng: currentStop.longitude,
        stopAddress: currentStop.address,
        pickAddress: req.body.pick_address,
        dropAddress: req.body.drop_address,
        requestId: requestDetail._id,
        stops: 1,
        vehicleType: vehicle_type
      }));
    }
  } else {
    placePromises.push(RequestPlace.create({
      pickLat: pick_lat,
      pickLng: pick_lng,
      dropLat: drop_lat,
      dropLng: drop_lng,
      pickAddress: req.body.pick_address,
      dropAddress: req.body.drop_address,
      requestId: requestDetail._id,
      vehicleType: vehicle_type
    }));
  }

  await Promise.all(placePromises);

  if (!isLater) {
    return await assignDriverAndNotify(requestDetail, pick_lat, pick_lng, vehicle_type, requestDetail.tripType, zone._id, drop_lat, drop_lng, clientId);
  }
  return requestDetail;
};

// Helper function for RENTAL trips

const createRentalTrip = async (req, user, clientId) => {
  const {
    promo_code,
    booking_for,
    payment_opt,
    pick_lat,
    pick_lng,
    vehicle_type,
    ride_type,
    isLater,
    packageId,
    estimatedAmount
  } = req.body;

  // Validate vehicle type and zone
  const [type, zone, rental] = await Promise.all([
    Vehicle.findOne({ _id: vehicle_type, clientId }),
    getPickupZone(req),
    Rental.findById(packageId)
  ]);

  if (!type) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Wrong Vehicle Type');
  }
  if (!zone) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Service not available at this location');
  }
  if (!rental) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Invalid rental package');
  }


  if (payment_opt) {
    const isAvailable = zone.paymentTypes.some(
      opt => opt.toLowerCase() === payment_opt.toLowerCase()
    );

    if (!isAvailable) {
      throw new ApiError(httpStatus.FORBIDDEN, 'Payment Option is not available. Please select another option');
    }
  }

  // Handle promo code
  let promoId = null;
  let promoAmount = 0;

  if (promo_code) {
    const [promocode, promo_count, promo_all_count] = await Promise.all([
      PromoCode.findById(promo_code).lean(),
      Request.countDocuments({ promoId: promo_code, userId: user.id, isCompleted: 1 }),
      Request.countDocuments({ promoId: promo_code, isCompleted: 1 })
    ]);

    if (!promocode) throw new ApiError(httpStatus.FORBIDDEN, 'Wrong Promo Code');
    if (promo_count > promocode.promoReuseCount) {
      throw new ApiError(httpStatus.FORBIDDEN, `Sorry! You already ${promocode.promo_count} times used this promo code`);
    }
    if (promo_all_count > promocode.promo_use_count) {
      throw new ApiError(httpStatus.FORBIDDEN, 'Sorry! promo code limit exceeded');
    }

    if (promocode.promoType === "fixed") {
      promoId = promocode._id;
      promoAmount = promocode.amount;
    } else if (promocode.promoType === "percentage") {
      promoId = promocode._id;
      promoAmount = promocode.percentage;
    }
  }

  // Generate request details
  const [requestNumber, requestOtp] = await Promise.all([
    generateRequestNumber(),
    uniqueRandomNumbers(4)
  ]);

  const countryDial = await Country.findById(new ObjectId(user.countryCode));

  if (!countryDial) {
    throw new ApiError(httpStatus.UNAUTHORIZED, errorMessages.INVALID_COUNTRYCODE);
  }


  // Find zone price
  const zonePriceDetail = zone.zonePriceDetails.find(
    zp => zp?.vehicleDetails?._id?.toString() === type?._id?.toString()
  );


// vehicleDetails not found or does not match the requested vehicle type so (Service not available)
  if(!zonePriceDetail){
    throw new ApiError(httpStatus.FORBIDDEN,"Service not available at this location")
  }

  const rentalPriceForVehicle = rental.vehiclePrices.find(
    rp => rp.vehicleId.toString() === type._id.toString()
  );

  const price = await ZonePrice.findById(zonePriceDetail._id);

  let totalAmount = rentalPriceForVehicle.price || 0;
  let driverAmount = 0;

  // if (price && totalAmount != 0) {
  //   if (ride_type == "RIDE_NOW") {
  //     if (price.ridenowAdminCommissionType == "Percentage") {
  //       driverAmount = totalAmount - (totalAmount * price.ridenowAdminCommission) / 100;
  //     } else if (price.ridenowAdminCommissionType == "Fixed") {
  //       driverAmount = totalAmount - price.ridenowAdminCommission;
  //     }
  //   } else if (ride_type == "RIDE_LATER") {
  //     if (price.ridelaterAdminCommissionType == "Percentage") {
  //       driverAmount = totalAmount - (totalAmount * price.ridelaterAdminCommission) / 100;
  //     } else if (price.ridelaterAdminCommissionType == "Fixed") {
  //       driverAmount = totalAmount - price.ridelaterAdminCommission;
  //     }
  //   }
  // }

  if (price && totalAmount != 0) {
    if (ride_type == "RIDE_NOW") {
      if (price.ridenowAdminCommissionType == "Percentage") {
        driverAmount = parseFloat(totalAmount - ((totalAmount * price.ridenowAdminCommission) / 100).toFixed(2));
      } else if (price.ridenowAdminCommissionType == "Fixed") {
        driverAmount = totalAmount - price.ridenowAdminCommission;
      }
    } else if (ride_type == "RIDE_LATER") {
      if (price.ridelaterAdminCommissionType == "Percentage") {
        driverAmount = parseFloat(totalAmount - ((totalAmount * price.ridelaterAdminCommission) / 100).toFixed(2));
      } else if (price.ridelaterAdminCommissionType == "Fixed") {
        driverAmount = totalAmount - price.ridelaterAdminCommission;
      }
    }
  }

  const scheduledTripTime = isLater ? parseScheduledTripTime(req.body.tripTime) : null;

  const requestParams = {
    // requestNumber,
    requestOtp,
    userId: user.id,
    paymentOpt: payment_opt,
    unit: zone.unit,
    promoId,
    requestedCurrencyCode: countryDial.dial_code,
    requestedCurrencySymbol: countryDial.currency_symbol,
    bookingFor: booking_for,
    tripStartTime: scheduledTripTime ? moment(scheduledTripTime) : moment(),
    rideType: ride_type,
    tripType: 'RENTAL',
    isLater,
    vehicleId: vehicle_type,
    tripTime: scheduledTripTime,
    packageId,
    packageKm: rental.km,
    packageHr: rental.hour,
    zoneId: zone._id,
    driverCommission: driverAmount || 0,
    estimatedAmount,
  };

  const requestDetail = await Request.create(requestParams);

  // Handle booking for others
  if (booking_for === 'OTHERS') {
    let userDetails = await User.findOne({ phoneNumber: req.body.others_number })
    if (userDetails != null) {
      requestDetail.othersUserId = userDetails._id;
      await requestDetail.save();
    } else {
      const other_user = await User.create({
        firstName: req.body.others_name,
        phoneNumber: req.body.others_number
      });
      requestDetail.othersUserId = other_user._id;
      await requestDetail.save();
    }
  }

  await RequestPlace.create({
    pickLat: pick_lat,
    pickLng: pick_lng,
    dropLat: "",
    dropLng: "",
    pickAddress: req.body.pick_address,
    dropAddress: "",
    requestId: requestDetail._id,
    vehicleType: vehicle_type
  });

  if (!isLater) {
    return await assignDriverAndNotify(requestDetail, pick_lat, pick_lng, vehicle_type, requestDetail.tripType, zone._id, "", "", clientId);
  }
  return requestDetail;
};

// Common driver assignment logic

const assignDriverAndNotify = async (requestDetail, pick_lat, pick_lng, vehicle_type, tripType, zoneId, drop_lat, drop_lng) => {

  let session = null;

  try {
    // Start MongoDB transaction session
    session = await mongoose.startSession();
    session.startTransaction();

    const drivers = await fetchDriver(pick_lat, pick_lng, vehicle_type, tripType, zoneId, drop_lat, drop_lng);
    const request = await Request.findById(requestDetail._id).session(session);


    // filter drivers zoneId's with registered zoneId's
    const filteredDrivers = drivers.filter(driver => {

      return (
        driver.zoneId?.toString() === zoneId.toString() ||
        driver.secondaryZone?.some(z => z.toString() === zoneId.toString())
      );
    });

    if (!filteredDrivers?.length) {
      request.cancelledAt = new Date();
      request.isCancelled = true;
      request.cancelMethod = 'Automatic';
      await request.save(({ session }));
      throw new ApiError(httpStatus.NOT_FOUND, 'No Driver Found');
    }

    // Check driver availability in parallel
    const driverAvailabilityChecks = filteredDrivers.map(async driver => {
      const isFree = await RequestMeta.countDocuments({
        driverId: driver.driverId,
        active: true
      }) === 0;

      if (isFree) {
        const filter = { driverId: driver.driverId };
        await RequestMeta.deleteMany(filter);
      }

      return isFree ? driver : null;
    });



    const availableDrivers = (await Promise.all(driverAvailabilityChecks))
      .filter(driver => driver !== null);

    if (!availableDrivers.length) {
      request.cancelledAt = new Date();
      request.isCancelled = true;
      request.cancelMethod = 'Automatic';
      await request.save({ session });
      throw new ApiError(httpStatus.NOT_FOUND, 'No Driver Found');
    }

    // Prepare driver assignments
    const driverAssignments = availableDrivers.map((driver, index) => ({
      userId: driver.userId,
      requestId: requestDetail._id,
      driverId: driver.driverId,
      active: index === 0 ? 1 : 0,
      assignMethod: 1
    }));

    // Save assignments and notify first driver
    await RequestMeta.insertMany(driverAssignments);


    const firstDriver = driverAssignments[0];

    const responseData = await getRequestListData(requestDetail._id);
    const driverTopic = mqttConfig.DRIVER_REQUEST + "" + firstDriver.driverId;


    // Create RequestDriverData within transaction
    const requestDriverData = {
      requestId: requestDetail.id || requestDetail._id,
      driverIds: [firstDriver.driverId] // As array
    };


    await RequestDriverData.create([requestDriverData], { session });

    // Commit transaction
    await session.commitTransaction();
    session.endSession();

    // `driver/request/${firstDriver.driverId}`

    // HANDLE NOTIFICATIONS OUTSIDE TRANSACTION (async, no blocking)
    setImmediate(async () => {
      try {
        const responseData = await getRequestListData(requestDetail.id);
        const driverTopic = mqttConfig.DRIVER_REQUEST + "" + firstDriver.driverId;


        // Send all notifications in parallel
        await Promise.all([
          sendPushNotification(firstDriver.userId, {
            title: "New Trip Requested",
            message: "New Trip Requested, you can accept or Reject the request"
          }),
          mqttService.publishMessage(
            driverTopic,
            JSON.stringify({
              title: "New Trip Requested",
              message: "New Trip Requested, you can accept or Reject the request",
              tripDetails: responseData[0]
            })
          ).catch(err => console.error('MQTT notification error:', err))
        ]);

      } catch (notificationError) {
        console.error('❌ Notification error (non-blocking):', notificationError);
      }
    });

    // Return immediately with basic data


    return responseData[0];

  } catch (error) {
    console.error("error :",error)
    if (session) await session.abortTransaction();
    console.error('Driver assignment error:', error);
    throw error;
  } finally {
    if (session) session.endSession();
  }

};

// End Create Trip From Mobile




const createDispatcher = async (req) => {
  let clientId = await getClientId(req);
  let promocode_id = 0;


  const { userId, promo_code, booking_for, payment_opt, pick_lat, pick_lng, drop_lat, drop_lng, stops, driver_notes, vehicle_type, ride_type, trip_type, driverId ,estimatedAmount} = req.body;


  const isLater = String(ride_type || '').toUpperCase() === 'RIDE_LATER' || req.body.isLater === true || req.body.is_later === '1';

  console.log({isLater});
  if(isLater){
    if(!req.body.tripTime){
      throw new ApiError(httpStatus.BAD_REQUEST,"tripTime is required")
    }
  }



  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Unauthorized user');
  }

  if (!user.active) {
    throw new ApiError(httpStatus.FORBIDDEN, 'User is blocked, please contact admin');
  }

  const zone = await getPickupZone(req);

  if (!zone) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Service not available at this location');
  }

  let distance = await calculateDistance(pick_lat, pick_lng, drop_lat, drop_lng, stops);
  console.log({distance});

  if (zone.unit != "KM") {
    distance = distance * 0.6213711922
  }


  // Validate user's existing trips
  await validateUserInTrip(user);
  await validateUserRequestedTrip(user);

  // Validate payment option
  const paymentOpt = await validatePaymentOption(req.body);
  console.log({paymentOpt});

  // Validate Vehicle type
  let veh_id = req.body.vehicle_type;
  const type = await Vehicle.findOne({ _id: veh_id, clientId: clientId });
  if (!type) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Wrong Vehicle Type');
  }

  // Find zone based on pickup coordinates
   // Assumes a helper function `getZone`


  let zoneTypeId = 0;
  for (const zonePrice of zone.zonePriceDetails) {
    let zonePriceVehId = zonePrice.vehicleDetails._id;
    let typeId = type._id;

    if (zonePriceVehId.equals(typeId)) {
      zoneTypeId = zonePrice._id;
    }
  }

  const price = await ZonePrice.findById(zoneTypeId);
  console.log({zoneTypeId,price});
  if (!price || zoneTypeId === 0) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Service not available at this location');

  }
  // Check for surge pricing
  let surgePriceId = 0;
  let surgePrice = false;
  const today = moment().format('dddd'); // Get today's day name

  for (const surge of zone.zoneSurgePriceDetails) {
    const startTime = moment(surge.startTime, 'HH:mm');
    const endTime = moment(surge.endTime, 'HH:mm');
    const currentTime = moment();

    if (
      currentTime.isBetween(startTime, endTime) &&
      surge.availableDays
    ) {
      const availableDays = surge.availableDays;
      if (availableDays.includes(today)) {
        surgePrice = true;
        surgePriceId = surge._id;
        break;
      }
    }
  }

  // Validate payment option
  if (req.body.payment_opt) {
    const paymentOptions = zone.paymentTypes.map(op => op.toUpperCase());
    if (!paymentOptions.includes(req.body.payment_opt)) {
      throw new ApiError(httpStatus.FORBIDDEN, 'Payment Option is not available. Please select another option');

    }
  }

  // Handle "is_later" (scheduled rides)
  //  if (req.body.is_later) {
  //    const rideLaterController = new CreateRideLaterController();
  //    return await rideLaterController.rideLater(req, zone, user, zoneTypeId);
  //  }

  // Validate promo code
  // Need to work Full flow

  if (promo_code) {
    const promocode = await PromoCode.findOne({
      where: { status: true, promo_code }
    });

    if (!promocode) {
      return sendError(res, 'Wrong Promo Code', 403);
    }

    promocode_id = promocode.id;

    const promo_count = await Request.count({
      where: { promo_id: promocode_id, user_id: user.id, is_completed: 1 }
    });

    if (promo_count > promocode.promo_user_reuse_count) {
      return sendError(res, `Sorry! You already ${promocode.promo_user_reuse_count} times used this promo code`, 403);
    }

    const promo_all_count = await Request.count({
      where: { promo_id: promocode_id, is_completed: 1 }
    });

    if (promo_all_count > promocode.promo_use_count) {
      return sendError(res, 'Sorry! promo code limit exceeded', 403);
    }
  }
  const countryDial = await Country.findById(new ObjectId(user.countryCode));

  if (!countryDial) {
    throw new ApiError(httpStatus.UNAUTHORIZED, errorMessages.INVALID_COUNTRYCODE);
  }
  // Generate ride details
  // const requestNumber = await generateRequestNumber();
  const requestOtp = await uniqueRandomNumbers(4);
  if (promocode_id === 0) {
    promocode_id = null;
  }

  let driverAmount = 0;
  let commission = 0;

    if (price) {
    if (ride_type == "RIDE_NOW") {
      if (price.ridenowAdminCommissionType == "Percentage") {
        commission = parseFloat(((estimatedAmount * price.ridenowAdminCommission) / 100).toFixed(2));
        driverAmount = estimatedAmount - commission;
      } else if (price.ridenowAdminCommissionType == "Fixed") {
        driverAmount = estimatedAmount - price.ridenowAdminCommission;
      }
    } else if (ride_type == "RIDE_LATER") {
      if (price.ridelaterAdminCommissionType == "Percentage") {
        commission = parseFloat(((estimatedAmount * price.ridelaterAdminCommission) / 100).toFixed(2));
        driverAmount = estimatedAmount - commission;
      } else if (price.ridelaterAdminCommissionType == "Fixed") {
        driverAmount = estimatedAmount - price.ridelaterAdminCommission;
      }
    }
  }

const getTripStartTimeForRequest = (isLater, tripTimeMs) => {
  if (!isLater) return moment();

  const n = Number(tripTimeMs);
  return Number.isFinite(n) ? new Date(n) : moment();
};



  const requestParams = {
    requestOtp,
    userId: user.id,
    zoneTypeId: zoneTypeId,
    paymentOpt: req.body.payment_opt,
    unit: zone.unit, // Add logic to get unit dynamically
    promoId: promocode_id,
    requestedCurrencyCode: countryDial.dial_code, // Placeholder
    requestedCurrencySymbol: countryDial.currency_symbol, // Placeholder
    driverId: driverId,
    // tripType: ride_type,
    bookingFor: req.body.booking_for,
    tripStartTime: isLater ? req.body.tripTime : null,
    isLater: isLater,
    tripTime: isLater ? req.body.tripTime : null,
    tripSecondaryVehicle: zoneTypeId,
    rideType: req.body.ride_type,
    tripType: req.body.trip_type,
    ifDispatch: true,
    zoneId: zone._id,
    totalDistance: distance || 0,
    vehicleId:vehicle_type,
    driverCommission: driverAmount || 0,
    estimatedAmount
  };

  console.log({requestParams});


  const requestDetail = await Request.create(requestParams);


  if (!requestDetail) {
    console.error('Failed to create request');
  }
  // Handle booking for others
  let other_user = null;
  if (booking_for === 'MYSELF') {
    other_user = await User.create({
      firstName: req.body.others_name,
      phoneNumber: req.body.others_number
    });
    const bodyUser = {
      others_user_id: other_user._id,
    }
    Object.assign(requestDetail, bodyUser);
    await user.save();

  }

  // Add stops logic
  if (stops && stops.length > 0) {
    const stopLocations = typeof stops === "string" ? JSON.parse(stops) : stops;
    for (let i = 0; i < stopLocations.length; i++) {
      const currentStop = stopLocations[i];
      const prevStop = stopLocations[i - 1] || { latitude: pick_lat, longitude: pick_lng, address: req.body.pick_address };

      await RequestPlace.create({
        pickLat: prevStop.latitude,
        pickLng: prevStop.longitude,
        dropLat: currentStop.latitude,
        dropLng: currentStop.longitude,
        pickAddress: prevStop.address,
        dropAddress: currentStop.address,
        requestId: requestDetail._id,
        stops: 1
      });
    }
  } else {
    await RequestPlace.create({
      pickLat: pick_lat,
      pickLng: pick_lng,
      dropLat: drop_lat,
      dropLng: drop_lng,
      pickAddress: req.body.pick_address,
      dropAddress: req.body.drop_address,
      requestId: requestDetail._id,
    });
  }

  if (isLater) {
    const responseData = await getRequestListData(requestDetail.id);
    return responseData[0];
  }


  // Extract and process drivers
  if (trip_type == "manual") {
    const drivers = await fetchDriver(pick_lat, pick_lng, vehicle_type, trip_type, zone._id, drop_lat, drop_lng);
    if (!drivers || !drivers.length) {
      requestDetail.cancelled_at = moment();
      requestDetail.is_cancelled = 1;
      requestDetail.cancel_method = 'Automatic';
      await requestDetail.save();
      throw new ApiError(httpStatus.NOT_FOUND, 'No Driver Found');
    }

    let selectedDrivers = [];
    const driver = await Driver.findById(driverId)
    const isDriverFree = await RequestMeta.countDocuments({ driverId: driverId, active: true }) === 0;
    if (isDriverFree) {
      selectedDrivers.push({
        user_id: driver.userId,
        driver_id: driver.driverId,
        active: selectedDrivers.length === 0 ? 1 : 0,
        request_id: requestDetail._id,
        assign_method: 1,
        created_at: new Date(),
        updated_at: new Date()
      });
    }

    if (!selectedDrivers.length) {
      requestDetail.cancelled_at = moment();
      requestDetail.is_cancelled = 1;
      requestDetail.cancel_method = 'Automatic';
      await requestDetail.save();
      throw new ApiError(httpStatus.NOT_FOUND, 'No Driver Found');
    }

    // Notify the first driver
    const firstDriver = selectedDrivers[0];

    const driverData = await Users.findById(firstDriver.user_id);

    // await sendNotification(req, [driverData._id], {
    //   title: "New Trip Requested",
    //   message: "New Trip Requested, you can accept or Reject the request"
    // });

    sendPushNotification(firstDriver.user_id, {
      title: "New Trip Requested",
      message: "New Trip Requested, you can accept or Reject the request"
    }),



      // Save driver meta and request locations
      await RequestMeta.insertMany(selectedDrivers.map(({ user_id, request_id, driver_id, active, assign_method }) => ({
        userId: user_id,
        requestId: request_id,
        driverId: driver_id,
        active,
        assignMethod: assign_method
      })));


    let responseData = await getRequestListData(requestDetail.id);

    const driverTopic = mqttConfig.DRIVER_REQUEST + "" + firstDriver.driver_id;

    //`driver/request/${firstDriver.driver_id}`

    await mqttService.publishMessage(
      driverTopic,
      JSON.stringify({
        title: "New Trip Requested",
        message: "New Trip Requested, you can accept or Reject the request",
        tripDetails: responseData[0]
      })
    );


    return responseData[0];
  } else {
    const drivers = await fetchDriver(pick_lat, pick_lng, vehicle_type, trip_type, zone._id, drop_lat, drop_lng);
    if (!drivers || !drivers.length) {
      requestDetail.cancelled_at = moment();
      requestDetail.is_cancelled = 1;
      requestDetail.cancel_method = 'Automatic';
      await requestDetail.save();
      throw new ApiError(httpStatus.NOT_FOUND, 'No Driver Found');
    }

    let selectedDrivers = [];
    for (let driver of drivers) {
      const driverData = await Users.findById(driver.userId);

      const isDriverFree = await RequestMeta.countDocuments({ driverId: driver.driverId, active: true }) === 0;

      if (isDriverFree) {
        selectedDrivers.push({
          user_id: driver.userId,
          driver_id: driver.driverId,
          active: selectedDrivers.length === 0 ? 1 : 0,
          request_id: requestDetail._id,
          assign_method: 1,
          created_at: new Date(),
          updated_at: new Date()
        });
      }
    }

    if (!selectedDrivers.length) {
      requestDetail.cancelled_at = moment();
      requestDetail.is_cancelled = 1;
      requestDetail.cancel_method = 'Automatic';
      await requestDetail.save();
      throw new ApiError(httpStatus.NOT_FOUND, 'No Driver Found');
    }

    // Notify the first driver
    const firstDriver = selectedDrivers[0];

    const driverData = await Users.findById(firstDriver.user_id);

    sendPushNotification(firstDriver.user_id, {
      title: "New Trip Requested",
      message: "New Trip Requested, you can accept or Reject the request"
    }),

      // Save driver meta and request locations
      await RequestMeta.insertMany(selectedDrivers.map(({ user_id, request_id, driver_id, active, assign_method }) => ({
        userId: user_id,
        requestId: request_id,
        driverId: driver_id,
        active,
        assignMethod: assign_method
      })));

    let responseData = await getRequestListData(requestDetail.id);

    const driverTopic = mqttConfig.DRIVER_REQUEST + "" + firstDriver.driver_id;

    //`driver/request/${firstDriver.driver_id}`

    await mqttService.publishMessage(
      driverTopic,
      JSON.stringify({
        title: "New Trip Requested",
        message: "New Trip Requested, you can accept or Reject the request",
        tripDetails: responseData[0]
      })
    );


    return responseData[0];
  }


};


const getRequestpagination = async (req, filter, options) => {

  const { rideType, tripStatus } = req.query;
  const limit = parseInt(options.limit, 10) || 10;
  const page = parseInt(options.page, 10) || 1;
  const clientId = await getClientId(req);


  const userId = await getUserId(req);

  if (userId) {
    filter.userId = new ObjectId(userId);
  }

  if (rideType) {
    filter.rideType = rideType;
  }

  if (tripStatus == "") {
    filter.isDriverStarted = false;
    filter.isDriverArrived = false;
    filter.isTripStart = false;
    filter.isCancelled = false;
    filter.isCompleted = false;
  } else {
    filter[tripStatus] = true;
  }


  const totalResults = await Request.countDocuments(filter);

  try {
    const results = await Request.aggregate([
      { $match: filter },
      {
        $lookup: {
          from: 'requestbills',
          localField: '_id',
          foreignField: 'requestId',
          as: 'billingDetails'
        }
      },
      {
        $lookup: {
          from: 'requestplaces',
          localField: '_id',
          foreignField: 'requestId',
          as: 'placesDetails'
        }
      },
      {
        $lookup: {
          from: 'requestratings',
          localField: '_id',
          foreignField: 'requestId',
          as: 'ratingDetails'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userDetails',
        },
      },
      {
        $lookup: {
          from: 'drivers',
          localField: 'driverId',
          foreignField: '_id',
          as: 'driverDetails',
        },
      },
      {
        $unwind: {
          path: '$billingDetails',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $unwind: {
          path: '$ratingDetails',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $unwind: {
          path: '$userDetails',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: '$driverDetails',
          preserveNullAndEmptyArrays: true,
        },
      },
      // {
      //   $unwind: {
      //     path: '$placesDetails',
      //     preserveNullAndEmptyArrays: true,
      //   },
      // },
      {
        $lookup: {
          from: 'users',
          localField: 'driverDetails.userId',
          foreignField: '_id',
          as: 'driverPersonalDetails',
        },
      },
      {
        $lookup: {
          from: 'vehicles',
          localField: 'vehicleId',
          foreignField: '_id',
          as: 'vehicleDetails',
        },
      },
      {
        $lookup: {
          from: 'vehiclemodels',
          localField: 'vehicleDetails._id',
          foreignField: 'vehicleId',
          as: 'vehicleModelDetails',
        },
      },
      {
        $unwind: {
          path: '$driverPersonalDetails',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: '$vehicleDetails',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: '$vehicleModelDetails',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: '$_id',
          doc: { $first: '$$ROOT' }
        }
      },
      {
        $replaceRoot: { newRoot: '$doc' }
      },
      {
        $project: {
          placesDetails: 1,
          requestNumber: { $ifNull: ['$requestNumber', null] },
          requestOtp: { $ifNull: ['$requestOtp', null] },
          isLater: { $ifNull: ['$isLater', null] },
          isInstantTrip: { $ifNull: ['$isInstantTrip', null] },
          ifDispatch: { $ifNull: ['$ifDispatch', null] },
          zoneTypeId: { $ifNull: ['$zoneTypeId', null] },
          userId: { $ifNull: ['$userId', null] },
          driverId: { $ifNull: ['$driverId', null] },
          tripStartTime: { $ifNull: ['$tripStartTime', null] },
          arrivedAt: { $ifNull: ['$arrivedAt', null] },
          acceptedAt: { $ifNull: ['$acceptedAt', null] },
          completedAt: { $ifNull: ['$completedAt', null] },
          cancelledAt: { $ifNull: ['$cancelledAt', null] },
          isDriverStarted: { $ifNull: ['$isDriverStarted', null] },
          isDriverArrived: { $ifNull: ['$isDriverArrived', null] },
          isTripStart: { $ifNull: ['$isTripStart', null] },
          isCompleted: { $ifNull: ['$isCompleted', null] },
          isCancelled: { $ifNull: ['$isCancelled', null] },
          customReason: { $ifNull: ['$customReason', null] },
          cancelMethod: { $ifNull: ['$cancelMethod', null] },
          totalDistance: { $ifNull: ['$totalDistance', null] },
          totalTime: { $ifNull: ['$totalTime', null] },
          isPaid: { $ifNull: ['$isPaid', null] },
          userRated: { $ifNull: ['$userRated', null] },
          driverRated: { $ifNull: ['$driverRated', null] },
          timezone: { $ifNull: ['$timezone', null] },
          attemptForSchedule: { $ifNull: ['$attemptForSchedule', null] },
          dispatcherId: { $ifNull: ['$dispatcherId', null] },
          driverNotes: { $ifNull: ['$driverNotes', null] },
          createdBy: { $ifNull: ['$createdBy', null] },
          adminDemoKey: { $ifNull: ['$adminDemoKey', null] },
          paymentOpt: { $ifNull: ['$paymentOpt', null] },
          rideType: { $ifNull: ['$rideType', null] },
          unit: { $ifNull: ['$unit', null] },
          requestedCurrencyCode: { $ifNull: ['$requestedCurrencyCode', null] },
          requestedCurrencySymbol: { $ifNull: ['$requestedCurrencySymbol', null] },
          promoId: { $ifNull: ['$promoId', null] },
          locationApprove: { $ifNull: ['$locationApprove', null] },
          holdStatus: { $ifNull: ['$holdStatus', null] },
          availablesStatus: { $ifNull: ['$availablesStatus', null] },
          tripType: { $ifNull: ['$tripType', null] },
          rentalPackage: { $ifNull: ['$rentalPackage', null] },
          manualTrip: { $ifNull: ['$manualTrip', null] },
          outstationId: { $ifNull: ['$outstationId', null] },
          outstationTypeId: { $ifNull: ['$outstationTypeId', null] },
          packageId: { $ifNull: ['$packageId', null] },
          packageItemId: { $ifNull: ['$packageItemId', null] },
          bookingFor: { $ifNull: ['$bookingFor', null] },
          othersUserId: { $ifNull: ['$othersUserId', null] },
          clientId: { $ifNull: ['$clientId', null] },
          pickLat: { $ifNull: ['$placesDetails.pickLat', null] },
          pickLng: { $ifNull: ['$placesDetails.pickLng', null] },
          pickAddress: { $ifNull: ['$placesDetails.pickAddress', null] },
          dropLat: { $ifNull: ['$placesDetails.dropLat', null] },
          dropLng: { $ifNull: ['$placesDetails.dropLng', null] },
          dropAddress: { $ifNull: ['$placesDetails.dropAddress', null] },
          driverDetails:{
          // _id: { $ifNull: ['$driverDetails._id', null] },
          userId: { $ifNull: ['$driverDetails.userId', null] },
          carNumber: { $ifNull: ['$driverDetails.carNumber', null] },
          _id: { $ifNull: ['$driverPersonalDetails._id', null] },
          firstName: { $ifNull: ['$driverPersonalDetails.firstName', null] },
          lastName: { $ifNull: ['$driverPersonalDetails.lastName', null] },
          email: { $ifNull: ['$driverPersonalDetails.email', null] },
          phoneNumber: { $ifNull: ['$driverPersonalDetails.phoneNumber', null] },
          emergencyNumber: { $ifNull: ['$driverPersonalDetails.emergencyNumber', null] },
          gender: { $ifNull: ['$driverPersonalDetails.gender', null] },
          language: { $ifNull: ['$driverPersonalDetails.language', null] },
          country: { $ifNull: ['$driverPersonalDetails.country', null] },
          address: { $ifNull: ['$driverPersonalDetails.address', null] },
          profilePic: { $ifNull: [{$concat:['/uploads/user/','$driverPersonalDetails.profilePic']}, null] },
          active: { $ifNull: ['$driverPersonalDetails.active', null] },
          clientId: { $ifNull: ['$driverPersonalDetails.clientId', null] },
          },
          userDetails:{
           _id: { $ifNull: ['$userDetails._id', null] },
          firstName: { $ifNull: ['$userDetails.firstName', null] },
          lastName: { $ifNull: ['$userDetails.lastName', null] },
          email: { $ifNull: ['$userDetails.email', null] },
          phoneNumber: { $ifNull: ['$userDetails.phoneNumber', null] },
          emergencyNumber: { $ifNull: ['$userDetails.emergencyNumber', null] },
          gender: { $ifNull: ['$userDetails.gender', null] },
          language: { $ifNull: ['$userDetails.language', null] },
          country: { $ifNull: ['$userDetails.country', null] },
          address: { $ifNull: ['$userDetails.address', null] },
          active: { $ifNull: ['$userDetails.active', null] },
          profilePic: { $ifNull: ['$userDetails.profilePic', null] },
          clientId: { $ifNull: ['$userDetails.clientId', null] },
          zoneId: { $ifNull: ['$userDetails.zoneId', null] },
          },
          billingDetails: {
            _id: { $ifNull: ['$billingDetails._id', null] },
            requestId: { $ifNull: ['$billingDetails.requestId', null] },
            basePrice: { $toString: { $ifNull: ['$billingDetails.basePrice', 0] } },
            baseDistance: { $toString: { $ifNull: ['$billingDetails.baseDistance', 0] } },
            totalDistance: { $toString: { $ifNull: ['$billingDetails.totalDistance', 0] } },
            totalTime: { $toString: { $ifNull: ['$billingDetails.totalTime', 0] } },
            pricePerDistance: { $toString: { $ifNull: ['$billingDetails.pricePerDistance', 0] } },
            distancePrice: { $toString: { $ifNull: ['$billingDetails.distancePrice', 0] } },
            pricePerTime: { $toString: { $ifNull: ['$billingDetails.pricePerTime', 0] } },
            timePrice: { $toString: { $ifNull: ['$billingDetails.timePrice', 0] } },
            waitingCharge: { $toString: { $ifNull: ['$billingDetails.waitingCharge', 0] } },
            cancellationFee: { $toString: { $ifNull: ['$billingDetails.cancellationFee', 0] } },
            serviceTax: { $toString: { $ifNull: ['$billingDetails.serviceTax', 0] } },
            serviceTaxPercentage: { $toString: { $ifNull: ['$billingDetails.serviceTaxPercentage', 0] } },
            promoDiscount: { $toString: { $ifNull: ['$billingDetails.promoDiscount', 0] } },
            adminCommission: { $toString: { $ifNull: ['$billingDetails.adminCommission', 0] } },
            adminCommissionWithTax: { $toString: { $ifNull: ['$billingDetails.adminCommissionWithTax', 0] } },
            driverCommission: { $toString: { $ifNull: ['$billingDetails.driverCommission', 0] } },
            totalAmount: { $toString: { $ifNull: ['$billingDetails.totalAmount', 0] } },
            requestedCurrencyCode: { $ifNull: ['$billingDetails.requestedCurrencyCode', null] },
            requestedCurrencySymbol: { $ifNull: ['$billingDetails.requestedCurrencySymbol', null] },
            createdAt: { $ifNull: ['$billingDetails.createdAt', null] },
            updatedAt: { $ifNull: ['$billingDetails.updatedAt', null] },
            subTotal: { $toString: { $ifNull: ['$billingDetails.subTotal', 0] } },
            outOfZonePrice: { $toString: { $ifNull: ['$billingDetails.outOfZonePrice', 0] } },
            bookingFees: { $toString: { $ifNull: ['$billingDetails.bookingFees', 0] } },
            hillStationPrice: { $toString: { $ifNull: ['$billingDetails.hillStationPrice', 0] } },
          },
          ratingDetails:{
          rating: { $ifNull: ['$ratingDetails.rating', null] },
          feedback: { $ifNull: ['$ratingDetails.feedback', null] },
          userId: { $ifNull: ['$ratingDetails.userId', null] },
          requestId: { $ifNull: ['$ratingDetails.requestId', null] },
          createdAt: { $ifNull: ['$ratingDetails.createdAt', null] },
          updatedAt: { $ifNull: ['$ratingDetails.updatedAt', null] },
          deletedAt: { $ifNull: ['$ratingDetails.deletedAt', null] },
          },
          vehicleDetails:{
          vehicleName: { $ifNull: ['$vehicleDetails.vehicleName', null] },
          image: { $ifNull:[ {$concat:['/uploads/vehicles/','$vehicleDetails.image']},null]},
          capacity: { $ifNull: ['$vehicleDetails.capacity', null] },
          serviceType: { $ifNull: ['$vehicleDetails.serviceType', null] },
          categoryId: { $ifNull: ['$vehicleDetails.categoryId', null] },
          sortingorder: { $ifNull: ['$vehicleDetails.sortingorder', null] },
          highlightImage: { $ifNull: [{$concat:['/uploads/vehicles/','$vehicleDetails.highlightImage']}, null] },
          status: { $ifNull: ['$vehicleDetails.status', null] },
          clientId: { $ifNull: ['$vehicleDetails.clientId', null] },
          },
          vehicleModelDetails:{
          modelname: { $ifNull: ['$vehicleModelDetails.modelname', null] },
          description: { $ifNull: ['$vehicleModelDetails.description', null] },
          image: { $ifNull: [{$concat:['/uploads/vehicleModels/','$vehicleModelDetails.image']}, null] },
          vehicleId: { $ifNull: ['$vehicleModelDetails.vehicleId', null] },
          status: { $ifNull: ['$vehicleModelDetails.status', null] },
          clientId: { $ifNull: ['$vehicleModelDetails.clientId', null] }
          }

        }
      },
     {
       $sort: { createdAt: -1, _id: -1 }
     },
     {
       $skip: (page - 1) * limit
     },
     {
       $limit: limit
     }
    ]);

    const totalPages = Math.ceil(totalResults / limit);

    return {
      results: results,
      page,
      limit,
      totalPages,
      totalResults,
    }

  } catch (error) {
    console.error('Error in aggregation:', error);
    throw error;
  }
};

const getDriverRequestpagination = async (req, filter, options) => {

  const { rideType, tripStatus } = req.query;
  const limit = parseInt(options.limit, 10) || 10;
  const page = parseInt(options.page, 10) || 1;
  // const clientId = await getClientId(req);


  const driverId = await getDriverId(req);

  if (driverId) {
    filter.driverId = new ObjectId(driverId);
  }

  if (rideType) {
    filter.rideType = rideType;
  }

  if (tripStatus == "") {
    filter.isDriverStarted = false;
    filter.isDriverArrived = false;
    filter.isTripStart = false;
    filter.isCancelled = false;
    filter.isCompleted = false;
  } else {
    filter[tripStatus] = true;
  }

  const totalResults = await Request.countDocuments(filter);

  try {
    const results = await Request.aggregate([
      { $match: filter },
      {
        $lookup: {
          from: 'requestbills',
          localField: '_id',
          foreignField: 'requestId',
          as: 'billingDetails'
        }
      },
      {
        $lookup: {
          from: 'requestplaces',
          localField: '_id',
          foreignField: 'requestId',
          as: 'placesDetails'
        }
      },
      {
        $lookup: {
          from: 'requestratings',
          localField: '_id',
          foreignField: 'requestId',
          as: 'ratingDetails'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userDetails',
        },
      },
      {
        $lookup: {
          from: 'drivers',
          localField: 'driverId',
          foreignField: '_id',
          as: 'driverDetails',
        },
      },
      {
        $lookup:{
          from:'zones',
          localField:'zoneId',
          foreignField:'_id',
          as:'zoneDetails'
        }
      },
      {
        $unwind: {
          path: '$billingDetails',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $unwind: {
          path: '$ratingDetails',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $unwind: {
          path: '$userDetails',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: '$driverDetails',
          preserveNullAndEmptyArrays: true,
        },
      },
      // {
      //   $unwind: {
      //     path: '$placesDetails',
      //     preserveNullAndEmptyArrays: true,
      //   },
      // },
      {
        $lookup: {
          from: 'users',
          localField: 'driverDetails.userId',
          foreignField: '_id',
          as: 'driverPersonalDetails',
        },
      },
      {
        $lookup: {
          from: 'vehicles',
          localField: 'vehicleId',
          foreignField: '_id',
          as: 'vehicleDetails',
        },
      },
      {
        $lookup: {
          from: 'vehiclemodels',
          localField: 'vehicleDetails._id',
          foreignField: 'vehicleId',
          as: 'vehicleModelDetails',
        },
      },
      {
        $unwind: {
          path: '$driverPersonalDetails',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: '$vehicleDetails',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: '$vehicleModelDetails',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: '$zoneDetails',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: '$_id',
          root: { $first: '$$ROOT' },
          billingDetails: { $first: '$billingDetails' },
          placesDetails: { $first: '$placesDetails' },
          ratingDetails: { $first: '$ratingDetails' },
          userDetails: { $first: '$userDetails' },
          driverDetails: { $first: '$driverDetails' },
          driverPersonalDetails: { $first: '$driverPersonalDetails' },
          vehicleDetails: { $first: '$vehicleDetails' },
          vehicleModelDetails: { $first: '$vehicleModelDetails' },
          zoneDetails: { $first: '$zoneDetails' },
        }
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: [
              '$root',
              {
                billingDetails: '$billingDetails',
                placesDetails: '$placesDetails',
                ratingDetails: '$ratingDetails',
                userDetails: '$userDetails',
                driverDetails: '$driverDetails',
                driverPersonalDetails: '$driverPersonalDetails',
                vehicleDetails: '$vehicleDetails',
                vehicleModelDetails: '$vehicleModelDetails',
                zoneDetails: '$zoneDetails'
              }
            ]
          }
        }
      },
      {
        $project: {
          placesDetails: 1,
          requestNumber: { $ifNull: ['$requestNumber', null] },
          requestOtp: { $ifNull: ['$requestOtp', null] },
          isLater: { $ifNull: ['$isLater', null] },
          isInstantTrip: { $ifNull: ['$isInstantTrip', null] },
          ifDispatch: { $ifNull: ['$ifDispatch', null] },
          zoneTypeId: { $ifNull: ['$zoneTypeId', null] },
          zoneId: { $ifNull: ['$zoneDetails.primaryZoneId', null] },
          userId: { $ifNull: ['$userId', null] },
          driverId: { $ifNull: ['$driverId', null] },
          tripStartTime: { $ifNull: ['$tripStartTime', null] },
          arrivedAt: { $ifNull: ['$arrivedAt', null] },
          acceptedAt: { $ifNull: ['$acceptedAt', null] },
          completedAt: { $ifNull: ['$completedAt', null] },
          cancelledAt: { $ifNull: ['$cancelledAt', null] },
          isDriverStarted: { $ifNull: ['$isDriverStarted', null] },
          isDriverArrived: { $ifNull: ['$isDriverArrived', null] },
          isTripStart: { $ifNull: ['$isTripStart', null] },
          isCompleted: { $ifNull: ['$isCompleted', null] },
          isCancelled: { $ifNull: ['$isCancelled', null] },
          customReason: { $ifNull: ['$customReason', null] },
          cancelMethod: { $ifNull: ['$cancelMethod', null] },
          totalDistance: { $ifNull: ['$totalDistance', null] },
          totalTime: { $ifNull: ['$totalTime', null] },
          isPaid: { $ifNull: ['$isPaid', null] },
          userRated: { $ifNull: ['$userRated', null] },
          driverRated: { $ifNull: ['$driverRated', null] },
          timezone: { $ifNull: ['$timezone', null] },
          attemptForSchedule: { $ifNull: ['$attemptForSchedule', null] },
          dispatcherId: { $ifNull: ['$dispatcherId', null] },
          driverNotes: { $ifNull: ['$driverNotes', null] },
          createdBy: { $ifNull: ['$createdBy', null] },
          adminDemoKey: { $ifNull: ['$adminDemoKey', null] },
          paymentOpt: { $ifNull: ['$paymentOpt', null] },
          rideType: { $ifNull: ['$rideType', null] },
          unit: { $ifNull: ['$unit', null] },
          requestedCurrencyCode: { $ifNull: ['$requestedCurrencyCode', null] },
          requestedCurrencySymbol: { $ifNull: ['$requestedCurrencySymbol', null] },
          promoId: { $ifNull: ['$promoId', null] },
          locationApprove: { $ifNull: ['$locationApprove', null] },
          holdStatus: { $ifNull: ['$holdStatus', null] },
          availablesStatus: { $ifNull: ['$availablesStatus', null] },
          tripType: { $ifNull: ['$tripType', null] },
          rentalPackage: { $ifNull: ['$rentalPackage', null] },
          manualTrip: { $ifNull: ['$manualTrip', null] },
          outstationId: { $ifNull: ['$outstationId', null] },
          outstationTypeId: { $ifNull: ['$outstationTypeId', null] },
          packageId: { $ifNull: ['$packageId', null] },
          packageItemId: { $ifNull: ['$packageItemId', null] },
          bookingFor: { $ifNull: ['$bookingFor', null] },
          othersUserId: { $ifNull: ['$othersUserId', null] },
          clientId: { $ifNull: ['$clientId', null] },
          pickLat: { $ifNull: ['$placesDetails.pickLat', null] },
          pickLng: { $ifNull: ['$placesDetails.pickLng', null] },
          pickAddress: { $ifNull: ['$placesDetails.pickAddress', null] },
          dropLat: { $ifNull: ['$placesDetails.dropLat', null] },
          dropLng: { $ifNull: ['$placesDetails.dropLng', null] },
          dropAddress: { $ifNull: ['$placesDetails.dropAddress', null] },
          'driverDetails._id': { $ifNull: ['$driverDetails._id', null] },
          'driverDetails.userId': { $ifNull: ['$driverDetails.userId', null] },
          'driverDetails.carNumber': { $ifNull: ['$driverDetails.carNumber', null] },
          'driverDetails._id': { $ifNull: ['$driverPersonalDetails._id', null] },
          'driverDetails.firstName': { $ifNull: ['$driverPersonalDetails.firstName', null] },
          'driverDetails.lastName': { $ifNull: ['$driverPersonalDetails.lastName', null] },
          'driverDetails.email': { $ifNull: ['$driverPersonalDetails.email', null] },
          'driverDetails.phoneNumber': { $ifNull: ['$driverPersonalDetails.phoneNumber', null] },
          'driverDetails.emergencyNumber': { $ifNull: ['$driverPersonalDetails.emergencyNumber', null] },
          'driverDetails.gender': { $ifNull: ['$driverPersonalDetails.gender', null] },
          'driverDetails.language': { $ifNull: ['$driverPersonalDetails.language', null] },
          'driverDetails.country': { $ifNull: ['$driverPersonalDetails.country', null] },
          'driverDetails.address': { $ifNull: ['$driverPersonalDetails.address', null] },
          'driverDetails.profilePic': { $ifNull: [{$concat:['/uploads/user/','$driverPersonalDetails.profilePic']}, null] },
          'driverDetails.active': { $ifNull: ['$driverPersonalDetails.active', null] },
          'driverDetails.clientId': { $ifNull: ['$driverPersonalDetails.clientId', null] },
          'userDetails._id': { $ifNull: ['$userDetails._id', null] },
          'userDetails.firstName': { $ifNull: ['$userDetails.firstName', null] },
          'userDetails.lastName': { $ifNull: ['$userDetails.lastName', null] },
          'userDetails.email': { $ifNull: ['$userDetails.email', null] },
          'userDetails.phoneNumber': { $ifNull: ['$userDetails.phoneNumber', null] },
          'userDetails.emergencyNumber': { $ifNull: ['$userDetails.emergencyNumber', null] },
          'userDetails.gender': { $ifNull: ['$userDetails.gender', null] },
          'userDetails.language': { $ifNull: ['$userDetails.language', null] },
          'userDetails.country': { $ifNull: ['$userDetails.country', null] },
          'userDetails.address': { $ifNull: ['$userDetails.address', null] },
          'userDetails.active': { $ifNull: ['$userDetails.active', null] },
          'userDetails.profilePic': { $ifNull: ['$userDetails.profilePic', null] },
          'userDetails.clientId': { $ifNull: ['$userDetails.clientId', null] },
          billingDetails: {
            _id: { $ifNull: ['$billingDetails._id', null] },
            requestId: { $ifNull: ['$billingDetails.requestId', null] },
            basePrice: { $toString: { $ifNull: ['$billingDetails.basePrice', 0] } },
            baseDistance: { $toString: { $ifNull: ['$billingDetails.baseDistance', 0] } },
            totalDistance: { $toString: { $ifNull: ['$billingDetails.totalDistance', 0] } },
            totalTime: { $toString: { $ifNull: ['$billingDetails.totalTime', 0] } },
            pricePerDistance: { $toString: { $ifNull: ['$billingDetails.pricePerDistance', 0] } },
            distancePrice: { $toString: { $ifNull: ['$billingDetails.distancePrice', 0] } },
            pricePerTime: { $toString: { $ifNull: ['$billingDetails.pricePerTime', 0] } },
            timePrice: { $toString: { $ifNull: ['$billingDetails.timePrice', 0] } },
            waitingCharge: { $toString: { $ifNull: ['$billingDetails.waitingCharge', 0] } },
            cancellationFee: { $toString: { $ifNull: ['$billingDetails.cancellationFee', 0] } },
            serviceTax: { $toString: { $ifNull: ['$billingDetails.serviceTax', 0] } },
            serviceTaxPercentage: { $toString: { $ifNull: ['$billingDetails.serviceTaxPercentage', 0] } },
            promoDiscount: { $toString: { $ifNull: ['$billingDetails.promoDiscount', 0] } },
            adminCommission: { $toString: { $ifNull: ['$billingDetails.adminCommission', 0] } },
            adminCommissionWithTax: { $toString: { $ifNull: ['$billingDetails.adminCommissionWithTax', 0] } },
            driverCommission: { $toString: { $ifNull: ['$billingDetails.driverCommission', 0] } },
            totalAmount: { $toString: { $ifNull: ['$billingDetails.totalAmount', 0] } },
            requestedCurrencyCode: { $ifNull: ['$billingDetails.requestedCurrencyCode', null] },
            requestedCurrencySymbol: { $ifNull: ['$billingDetails.requestedCurrencySymbol', null] },
            createdAt: { $ifNull: ['$billingDetails.createdAt', null] },
            updatedAt: { $ifNull: ['$billingDetails.updatedAt', null] },
            subTotal: { $toString: { $ifNull: ['$billingDetails.subTotal', 0] } },
            outOfZonePrice: { $toString: { $ifNull: ['$billingDetails.outOfZonePrice', 0] } },
            bookingFees: { $toString: { $ifNull: ['$billingDetails.bookingFees', 0] } },
            hillStationPrice: { $toString: { $ifNull: ['$billingDetails.hillStationPrice', 0] } },
          },
          'ratingDetails.rating': { $ifNull: ['$ratingDetails.rating', null] },
          'ratingDetails.feedback': { $ifNull: ['$ratingDetails.feedback', null] },
          'ratingDetails.userId': { $ifNull: ['$ratingDetails.userId', null] },
          'ratingDetails.requestId': { $ifNull: ['$ratingDetails.requestId', null] },
          'ratingDetails.createdAt': { $ifNull: ['$ratingDetails.createdAt', null] },
          'ratingDetails.updatedAt': { $ifNull: ['$ratingDetails.updatedAt', null] },
          'ratingDetails.deletedAt': { $ifNull: ['$ratingDetails.deletedAt', null] },
          'vehicleDetails.vehicleName': { $ifNull: ['$vehicleDetails.vehicleName', null] },
          'vehicleDetails.image': { $ifNull:[ {$concat:['/uploads/vehicles/','$vehicleDetails.image']},null]},
          'vehicleDetails.capacity': { $ifNull: ['$vehicleDetails.capacity', null] },
          'vehicleDetails.serviceType': { $ifNull: ['$vehicleDetails.serviceType', null] },
          'vehicleDetails.categoryId': { $ifNull: ['$vehicleDetails.categoryId', null] },
          'vehicleDetails.sortingorder': { $ifNull: ['$vehicleDetails.sortingorder', null] },
          'vehicleDetails.highlightImage': { $ifNull: [{$concat:['/uploads/vehicles/','$vehicleDetails.highlightImage']}, null] },
          'vehicleDetails.status': { $ifNull: ['$vehicleDetails.status', null] },
          'vehicleDetails.clientId': { $ifNull: ['$vehicleDetails.clientId', null] },
          'vehicleModelDetails.modelname': { $ifNull: ['$vehicleModelDetails.modelname', null] },
          'vehicleModelDetails.description': { $ifNull: ['$vehicleModelDetails.description', null] },
          'vehicleModelDetails.image': { $ifNull: [{$concat:['/uploads/vehicleModels/','$vehicleModelDetails.image']}, null] },
          'vehicleModelDetails.vehicleId': { $ifNull: ['$vehicleModelDetails.vehicleId', null] },
          'vehicleModelDetails.status': { $ifNull: ['$vehicleModelDetails.status', null] },
          'vehicleModelDetails.clientId': { $ifNull: ['$vehicleModelDetails.clientId', null] }
        }
      },
      {
        $sort: { createdAt: -1, _id: -1 }
      },
      {
        $skip: (page - 1) * limit
      },
      {
        $limit: limit
      }
    ])

    const totalPages = Math.ceil(totalResults / limit);

    return {
      results: results,
      page,
      limit,
      totalPages,
      totalResults,
    }

  } catch (error) {
    console.error('Error in aggregation:', error);
    throw error;
  }
};

// const getRequestListData = async (requestId) => {

//   const getRequest = requestListView.aggregate([
//     {
//       $match: {
//         _id: new ObjectId(requestId),
//       }
//     }
//   ]);



//   return getRequest;
// };


const getRequestListData = async (requestId) => {
  const getRequest = await requestListView.aggregate([
    {
      $match: {
        _id: new ObjectId(requestId),
      },
    },
  ]);

  // If request has promoId but billingDetails doesn't exist yet (request in progress)
  // Set promo discount and isPromoApplied
  if (getRequest && getRequest.length > 0) {
    const requestData = getRequest[0];

    if (requestData.promoId && (!requestData.billingDetails || !requestData.billingDetails.isPromoApplied)) {
      try {
        const request = await Request.findById(requestId).select('promoId');

        if (request && request.promoId) {
          const promo = await PromoCode.findById(request.promoId);

          if (promo) {
            if (!requestData.billingDetails) {
              requestData.billingDetails = {};
            }

            requestData.billingDetails.promoDiscount = promo.amount.toString();
            requestData.billingDetails.isPromoApplied = true;
            requestData.promoDiscount = promo.amount.toString();
            requestData.isPromoApplied = true;
          }
        }
      } catch (error) {
        console.error('Error checking promo in getRequestListData:', error);
      }
    }

      return getRequest;
};
}


module.exports = {
  createTrips,
  createTrip,
  createDispatcher,
  getRequestpagination,
  getDriverRequestpagination
};
