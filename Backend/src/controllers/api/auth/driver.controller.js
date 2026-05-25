const httpStatus = require('http-status');
const pick = require('../../../utils/pick');
const ApiError = require('../../../utils/ApiError');
const catchAsync = require('../../../utils/catchAsync');
const { mobileauthService, mobiledriverService, tokenService, userService, driverService, categoryService, vehicleService, vehicleModelService, countryService } = require('../../../services');
const { Country, Users, Role, Referral, Wallet, WalletTransaction, User, Settings, Driver } = require('../../../models');
const Response = require('../../../config/response');
const mongoose = require('mongoose');
const { userUpload } = require('../../../middlewares/upload');
const path = require('path');
const fs = require('fs');
const { errorMessages, keyMessages } = require('../../../config/errorMessages');
const { sendPushNotificationToken } = require('../../../utils/commonFunction');

const dotenv = require('dotenv');
dotenv.config();
// Load environment variables

/**
  from the mobile side they need to send Client Id and Code (Version code)
  1. Check the Version Available or not if not redirect to update screen
  2. check the avaliable languages for client send the avaliable languages
 */
const getClientId = async (req) => {
  clientId = '';
  if (!req.headers.clientid) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ClientID not found');
  } else {
    clientId = req.headers.clientid;
  }
  return clientId;
}



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



// Get a single driver by ID
const getDriver = catchAsync(async (req, res) => {
  const driver = await mobiledriverService.getDriversById(req);

  if (driver.length == 0) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Driver not found');
  }
  const response = Response(true, driver[0], "Driver retrieved successfully");
  res.status(httpStatus.OK).send(response);
});


const getServiceType = catchAsync(async (req, res) => {
  const servicetype = await Settings.findOne({ name: 'serviceType' });

  if (servicetype == null) {
    throw new ApiError(httpStatus.NOT_FOUND, 'servicetype not found');
  }

  const input = servicetype.value;
  const result = input.split(",");

  let modified = { servicetype: result }
  const response = Response(true, modified, "servicetype retrieved successfully");
  res.status(httpStatus.OK).send(response);
});


const createDriver = catchAsync(async (req, res) => {

  let clientId = await getClientId(req);

  const session = await mongoose.startSession();
  session.startTransaction();

  try {

    if (req.body.referralCode) {
      const referedByData = await User.findOne({ referralCode: req.body.referralCode });

      if (!referedByData) {
        throw new ApiError(httpStatus.UNAUTHORIZED, errorMessages.INVALID_REFERAL_CODE);
      }

    }


    if (req.body.phoneNumber) {

      let phoneNumber = req.body.phoneNumber;

      let roleIdsdata = await findRolesByRoleName();

      let Details = await User.findOne({
        phoneNumber,
        roleIds: { $in: [roleIdsdata] } // Checks if roleId exists in the roleIds array
      });


      if (Details) {
        throw new ApiError(httpStatus.BAD_REQUEST, errorMessages.PHONE_NUMBER_ALREADY_TAKEN);
      }

    }

    if (req.body.email && await Users.isEmailTaken(req.body.email)) {
      throw new ApiError(httpStatus.BAD_REQUEST, errorMessages.EMAIL_ALREADY_TAKEN);
    }

    if (req.body.registrationType == keyMessages.COMPANY && !req.body.companyId) {
      throw new ApiError(httpStatus.NOT_ACCEPTABLE, errorMessages.COMPANY_NOT_FOUND);
    }

    const countryDial = await Country.findById(req.body.countryCode);

    if (!countryDial) {
      throw new ApiError(httpStatus.UNAUTHORIZED, errorMessages.INVALID_COUNTRYCODE);
    }

    let roleId = await findRolesByRoleName();

    const userData = {
      firstName: req.body.name || "",
      lastName: req.body.name || "",
      phoneNumber: req.body.phoneNumber || "",
      country: req.body.countryCode || "",
      countryCode: req.body.countryCode,
      active: req.body.active !== undefined ? req.body.active : true,
      deviceInfoHash: req.body.deviceInfoHash || "",
      deviceType: req.body.deviceType || "",
      clientId: clientId,
      roleIds: roleId,
      referralCode: generateReferralCode()
    };

    if (req.body.demoKey) {
      userData.adminDemoKey = req.body.demoKey;
    }

    if (req.body.email) {
      userData.email = req.body.email || "";
    }


    const driverData = {
      type: req.body.vehicleType || "",
      carModel: req.body.vehicleModel || "",
      carNumber: req.body.carNumber || "",
      serviceLocation: req.body.serviceLocation || "",
      secondaryZone: req.body.secondaryZone || null,
      serviceCategory: req.body.serviceCategory,
      serviceType: req.body.serviceType || "",
      clientId: clientId
    };

    const user = await userService.createUser(userData);

    await sendPushNotificationToken(userData.deviceInfoHash, user._id.toString(), {
      title: "WELCOME",
      message: process.env.WELCOME_TEXT
    });

    const tokens = await tokenService.generateAuthTokens(user);

    if (user) {
      driverData.userId = user.id
    }

    await driverService.createDriver(driverData);

    let driver = await mobiledriverService.getDriversBytoken(tokens.access.token);

    if (driver != null && Array.isArray(driver)) {
      driver = driver[0];
    }


    if (req.body.referralCode) {
      const referedByData = await User.findOne({ referralCode: req.body.referralCode });
      let referralBody = {
        referredBy: referedByData._id,
        referredTo: user._id
      }
      await Referral.create(referralBody)
    }

    await walletIntialTransaction(0, user._id, "Earned", "Wallet Create");

    await session.commitTransaction();
    session.endSession();
    const response = Response(true, { driver, tokens }, "Driver created successfully");
    res.status(httpStatus.CREATED).send(response);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.status(400).json({ message: error.message });
  }

});


// Driver


const otpSent = catchAsync(async (req, res) => {

  const { authenticationType } = req.body;

  let user = '';

  let tokens = '';

  if (authenticationType == "OTP") {

    const { phoneNumber, countryCode } = req.body;

    let otp = await mobileauthService.loginDriverWithMobileNo(phoneNumber, countryCode);

    res.send({ otp });

  } else {

    const { email, password } = req.body;

    user = await mobileauthService.loginUserWithEmailAndPassword(email, password);

    tokens = await tokenService.generateAuthTokens(user);

    res.send({ user, tokens });

  }

});



const verify = catchAsync(async (req, res) => {

  const { deviceInfoHash, isPrimary, deviceType, countryCode, demoKey, phoneNumber, otp } = req.body;
  let user;
  if (demoKey) {
    user = await mobileauthService.mobileOtpVerify(phoneNumber, countryCode, otp);
  } else {
    user = await mobileauthService.mobileDemoVerify(phoneNumber, countryCode, otp);
  }

  let tokens = await tokenService.generateAuthTokens(user);


  let demoValid = false;
  let adminDemoKey = null;

  if (demoKey) {
     const demoRecord = await Demo.findOne({
          demoKey: { $regex: new RegExp(`^${demoKey}$`, 'i') }
        });
    if (demoRecord) {
      const currentDate = new Date();
      demoValid = demoRecord.status && demoRecord.Enddate > currentDate;
      if (demoValid) {
        adminDemoKey = demoKey; // Only set adminDemoKey if demo is valid
      } else {
        throw new ApiError(httpStatus.BAD_REQUEST, errorMessages.INVALID_DEMO_KEY);
      }
    }
  }

  if (user) {
    const body = {
      deviceInfoHash: deviceInfoHash,
      isPrimary: isPrimary,
      deviceType: deviceType,
      country: countryCode
    }

    if (adminDemoKey) {
      body.adminDemoKey = adminDemoKey;
    }


    await userService.updateUserById(user.id, body)
  }

  res.send({ user, tokens });

});




const getCategoriesWithoutPagination = catchAsync(async (req, res) => {
  if (!req.headers.clientid) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ClientID not found');
  }

  const categories = await categoryService.getCategorys(req.headers.clientid);
  if (!categories) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Categories not found');
  }

  // Convert categoryImage path to URL for each category
  const updatedCategories = categories.map(category => {
    if (category.categoryImage) {
      category.categoryImage = `/uploads/categoryImage/${category.categoryImage}`;
    }
    return category;
  });

  const response = Response(true, updatedCategories, "Categories retrieved successfully");
  res.status(httpStatus.OK).send(response);
});

const getVehiclesWithoutPagination = catchAsync(async (req, res) => {
  if (!req.headers.clientid) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ClientID not found');
  }

  const vehicles = await vehicleService.getVehicles(req.headers.clientid);
  if (!vehicles) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Vehicles not found');
  }

  const updatedVehicles = vehicles.map(vehicle => {
    if (vehicle.image) {
      vehicle.image = `/uploads/vehicles/${vehicle.image}`;
    }
    if (vehicle.highlightImage) {
      vehicle.highlightImage = `/uploads/vehicles/${vehicle.highlightImage}`;
    }
    return vehicle;
  });

  const response = Response(true, updatedVehicles, "Vehicles retrieved successfully");
  res.status(httpStatus.OK).send(response);
});




const getVehiclesByZoneWithoutPagination = catchAsync(async (req, res) => {
  const { zoneId } = req.params;

  if (!req.headers.clientid) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ClientID not found');
  }

  const vehicles = await vehicleService.getVehiclesByZoneId(zoneId,req.headers.clientid);
  if (!vehicles) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Vehicles not found');
  }


  const updatedVehicles = vehicles.map(vehicle => {
    if (vehicle.image) {
      vehicle.image = `/uploads/vehicles/${vehicle.image}`;
    }
    if (vehicle.highlightImage) {
      vehicle.highlightImage = `/uploads/vehicles/${vehicle.highlightImage}`;
    }
    return vehicle;
  });

  const response = Response(true, updatedVehicles, "Vehicles retrieved successfully");
  res.status(httpStatus.OK).send(response);
});

const getVehicleModelWithoutPagination = catchAsync(async (req, res) => {

  if (!req.headers.clientid) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ClientID not found');
  }

  const vehicleModels = await vehicleModelService.getVehicleModels(req.headers.clientid);
  if (!vehicleModels) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Vehicle models not found');
  }

  const updatedVehicleModels = vehicleModels.map(vehicleModel => {
    if (vehicleModel.image) {
      vehicleModel.image = `/uploads/vehicleModels/${vehicleModel.image}`;
    }
    return vehicleModel;
  });

  const response = Response(true, updatedVehicleModels, "Vehicle models retrieved successfully");
  res.status(httpStatus.OK).send(response);
});

const getCountryActiveWithOutPagination = catchAsync(async (req, res) => {
  if (!req.headers.clientid) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ClientID not found');
  }
  const country = await countryService.getCountrysByActive(req.headers.clientid);
  if (!country) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Language not found');
  }
  const response = Response(true, country, 'Success');
  res.status(httpStatus.OK).send(response);
});

// Get a single driver by ID
const updateDriverOnline = catchAsync(async (req, res) => {
  const updateDriver = await mobiledriverService.updateDriverOnline(req, res);
  if (!updateDriver) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Driver not found');
  }
  const response = Response(true, updateDriver, "update driver status successfully");
  res.status(httpStatus.OK).send(response);
});


const getVehicleModelByVehicle = catchAsync(async (req, res) => {
  const vehicleModel = await vehicleModelService.getVehicleModelByVehicleId(req.params.vehicleId);
  if (!vehicleModel) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Vehicle model not found');
  }

  if (vehicleModel && vehicleModel.image) {
    vehicleModel.image = `/uploads/vehicleModels/${vehicleModel.image}`;
  }
  const response = Response(true, vehicleModel, "Vehicle model retrieved successfully");
  res.status(httpStatus.OK).send(response);
});

const generateReferralCode = () => {
  return `REF${Math.random().toString(36).substring(2, 4).toUpperCase()}`;
};


// Update a driver
const updateDriver = catchAsync(async (req, res) => {


  const userId = await getUserId(req);

  const existingUser = await userService.getUserById(userId);
  const user = existingUser;

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  const userData = {
    firstName: req.body.name || user.firstName,
    lastName: req.body.name || user.lastName,
    email: req.body.email || user.email
  }


  let servicetype = req.body.serviceType;

  let secondaryZone = null;
  if (req.body.secondaryZone) {
    secondaryZone = req.body.secondaryZone;
  }


  userUpload.single('documentImage')(req, res, async (err) => {

    const driverImage = req.file ? req.file.filename : '';

    if (driverImage) {
      if (userData.profilePic) {
        const oldImagePath = path.join(__dirname, '../../uploads/user/', userData.profilePic);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      userData.profilePic = driverImage;
    }

    await userService.updateUserById(existingUser.id, userData);

    let drivers = await Driver.findOne({ userId: userId })




    if (secondaryZone || servicetype) {
      drivers.serviceType = servicetype
      drivers.secondaryZone = secondaryZone
      drivers.save();
    }


    const response = Response(true, "Driver updated successfully");
    res.status(httpStatus.OK).send(response);
  });
});



const getDriverById = catchAsync(async (req, res) => {

  const driver = await mobiledriverService.getDriversById(req);

  if (!driver) {
    throw new ApiError(httpStatus.NOT_FOUND, 'driverdocument not found');
  }

  const response = Response(true, driver, "Success");
  res.status(httpStatus.OK).send(response);
});


const updateDriverStatusByDemo = catchAsync(async (req, res) => {

  const driver = await mobiledriverService.updateDriverStatusByDemo(req);

  if (!driver) {
    throw new ApiError(httpStatus.NOT_FOUND, 'driverdocument not found');
  }

  const response = Response(true, driver, "Success");
  res.status(httpStatus.OK).send(response);
});



const findRolesByRoleName = async () => {
  try {
    const roles = await Role.findOne({ role: 'Driver' });
    return roles;
  } catch (error) {
    console.error('Error fetching roles:', error);
    throw error;
  }
};

const getRequestsHistory = catchAsync(async (req, res) => {
  const request = await mobiledriverService.getRequesHistoryList(req);
  if (!request) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Request not found');
  }
  const response = Response(true, request, "Success");
  res.status(httpStatus.OK).send(response);
});

const walletIntialTransaction = async (amount, userId, type, purpose) => {
  let wallet;
  if (type == 'Spent') {
    wallet = await Wallet.findOne({ userId: userId });

    if (wallet) {
      wallet.amountSpent = amount ? amount : 0;
      wallet.balance -= amount ? amount : 0;
      wallet.save();
    }
    else {
      const walletParams = {
        userId: userId,
        earnedAmount: 0,
        amountSpent: amount ? amount : 0,
        balance: amount ? amount : 0,
      };

      wallet = await Wallet.create(walletParams);
    }

    await WalletTransaction.create({
      walletId: wallet.id,
      amount: amount ? 0 - amount : 0,
      purpose: purpose,
      type: type,
      userId: userId
    });
  }
  else if (type == 'Earned') {
    wallet = await Wallet.findOne({ userId: userId });

    if (wallet) {
      wallet.earnedAmount += amount ? amount : 0;
      wallet.balance += amount ? amount : 0;
      wallet.save();
    }
    else {
      const walletParams = {
        userId: userId,
        earnedAmount: amount ? amount : 0,
        amountSpent: 0,
        balance: amount ? amount : 0,
      };

      wallet = await Wallet.create(walletParams);
    }

    await WalletTransaction.create({
      walletId: wallet.id,
      amount: amount ? amount : 0,
      purpose: purpose,
      type: type,
      userId: userId
    });
  }
};


const getDriverEarings = catchAsync(async (req, res) => {

  // Get driver info
  const driver = await mobiledriverService.getDriversById(req);
  if (driver.length === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Driver not found');
  }

  const driverId = driver[0]._id;

  // Get all earnings data in parallel for better performance
  const [todayEarnings, yesterdayEarnings, weeklyEarnings, monthlyEarnings] = await Promise.all([
    driverService.getEaringsReport(driverId),
    driverService.getYesterdayEarningsReport(driverId),
    driverService.getWeeklyEarningsReport(driverId),
    driverService.getMonthlyEarningsReport(driverId)
  ]);

  // Calculate total income for today
  const todayTotalIncome = todayEarnings.cashPayments + todayEarnings.cardPayments + todayEarnings.walletPayments;

  // Calculate total income for yesterday
  const yesterdayTotalIncome = yesterdayEarnings.cashPayments + yesterdayEarnings.cardPayments + yesterdayEarnings.walletPayments;

  // Create the dashboard structure based on the earnings data
  const dashboardData = {
    dashboard: {
      earningsByDay: weeklyEarnings.map(day => ({
        day: day.dayName.toLowerCase(),
        trips: day.completedTrips,
        earnings: day.totalEarnings,
        completed: day.isInPast
      })),
      summaries: {
        today: {
          tripCount: todayEarnings.completed,
          income: todayTotalIncome,
          currency: todayEarnings.currency
        },
        yesterday: {
          tripCount: yesterdayEarnings.completed,
          income: yesterdayTotalIncome,
          currency: yesterdayEarnings.currency
        },
        currentWeek: {
          tripCount: weeklyEarnings.reduce((total, day) => total + day.completedTrips, 0),
          income: weeklyEarnings.reduce((total, day) => total + day.totalEarnings, 0),
          currency: todayEarnings.currency
        },
        currentMonth: {
          tripCount: monthlyEarnings.currentMonth.totalTrips,
          income: monthlyEarnings.currentMonth.totalEarnings,
          currency: todayEarnings.currency
        }
      }
    }
  };

  const response = Response(true, dashboardData, "Driver earnings retrieved successfully");
  res.status(httpStatus.OK).send(response);
});

const getDriverHistory = catchAsync(async (req, res) => {

  // Get driver info
  const driver = await mobiledriverService.getDriversById(req);
  if (driver.length === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Driver not found');
  }

  const driverId = driver[0]._id;
  const driverCurrency = driver[0].currency || "₹";

  const { month, year } = req.query;

  const monthlyEarnings = await driverService.getMonthlyEarningsReport(driverId);

  const now = new Date();
  const selectedMonth = parseInt(month) || now.getMonth() + 1; // Jan = 0
  const selectedYear = parseInt(year) || now.getFullYear();

  const tripHistory = await driverService.getDriverTripsByMonth(driverId, selectedMonth, selectedYear);

  const dashboardData = {
    summaries: {
      currentMonth: {
        tripCount: monthlyEarnings.currentMonth.totalTrips,
        income: monthlyEarnings.currentMonth.totalEarnings,
        currency: driverCurrency
      },
      previousMonth: {
        tripCount: monthlyEarnings.previousMonth.totalTrips,
        income: monthlyEarnings.previousMonth.totalEarnings,
        currency: driverCurrency
      }
    },
    tripHistory: tripHistory || []
  };

  const response = Response(true, dashboardData, "Driver earnings retrieved successfully");
  res.status(httpStatus.OK).send(response);
});


module.exports = {
  getDriver,
  createDriver,
  otpSent,
  verify,
  getCategoriesWithoutPagination,
  getVehiclesWithoutPagination,
  getVehicleModelWithoutPagination,
  getCountryActiveWithOutPagination,
  updateDriverOnline,
  getVehicleModelByVehicle,
  updateDriver,
  getDriverById,
  getRequestsHistory,
  getDriverEarings,
  getDriverHistory,
  getServiceType,
  getVehiclesByZoneWithoutPagination,
  updateDriverStatusByDemo
};
