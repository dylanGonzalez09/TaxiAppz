const httpStatus = require('http-status');
const mongoose = require('mongoose');
const ApiError = require('../../../utils/ApiError');
const catchAsync = require('../../../utils/catchAsync');
const Response = require('../../../config/response');
const { errorMessages, keyMessages } = require('../../../config/errorMessages');
const {
  driverService,
  driverVehicleService,
  userService,
  tokenService,
  mobiledriverService,
  categoryService,
  vehicleService,
  vehicleModelService,
  countryService,
} = require('../../../services');
const { Country, Users, Role, Referral, Wallet, WalletTransaction, User, Driver, Settings } = require('../../../models');
const Zone = require('../../../models/zone/zone.model');
const { sendPushNotificationToken } = require('../../../utils/commonFunction');
const { webGetZoneDetails } = require('../../../utils/commonFunction');

/**
 * Web Driver Controller
 * Driver registration for web booking - clientId derived from zone (serviceLocation)
 */

const findRolesByRoleName = async () => {
  const roles = await Role.find({ role: 'Driver' });
  return roles;
};

const generateReferralCode = () => {
  return `REF${Math.random().toString(36).substring(2, 4).toUpperCase()}`;
};

const walletIntialTransaction = async (amount, userId, type, purpose) => {
  let wallet;
  if (type === 'Earned') {
    wallet = await Wallet.findOne({ userId });
    if (wallet) {
      wallet.earnedAmount += amount || 0;
      wallet.balance += amount || 0;
      wallet.save();
    } else {
      const walletParams = {
        userId,
        earnedAmount: amount || 0,
        amountSpent: 0,
        balance: amount || 0,
      };
      wallet = await Wallet.create(walletParams);
    }
    await WalletTransaction.create({
      walletId: wallet.id,
      amount: amount || 0,
      purpose,
      type,
      userId,
    });
  }
};

/**
 * Create driver for web (clientId from zone)
 * POST /v1/web/driver/create
 */
const createWebDriver = catchAsync(async (req, res) => {
  const { serviceLocation } = req.body;

  if (!serviceLocation) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'serviceLocation (zone) is required');
  }

  const zone = await Zone.findById(serviceLocation);
  if (!zone) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid zone');
  }
  if (!zone.clientId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Zone has no client configured');
  }

  const clientId = zone.clientId.toString();

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (req.body.referralCode) {
      const referedByData = await User.findOne({ referralCode: req.body.referralCode });
      if (!referedByData) {
        throw new ApiError(httpStatus.UNAUTHORIZED, errorMessages.INVALID_REFERAL_CODE);
      }
    }

    const roleId = await findRolesByRoleName();
    const existingUser = await Users.findOne({
      phoneNumber: req.body.phoneNumber,
      roleIds: roleId,
    });
    if (existingUser) {
      throw new ApiError(httpStatus.BAD_REQUEST, errorMessages.PHONE_NUMBER_ALREADY_TAKEN);
    }

    if (req.body.email && (await Users.isEmailTaken(req.body.email))) {
      throw new ApiError(httpStatus.BAD_REQUEST, errorMessages.EMAIL_ALREADY_TAKEN);
    }

    if (req.body.registrationType === keyMessages.COMPANY && !req.body.companyId) {
      throw new ApiError(httpStatus.NOT_ACCEPTABLE, errorMessages.COMPANY_NOT_FOUND);
    }

    const countryDial = await Country.findById(req.body.countryCode);
    if (!countryDial) {
      throw new ApiError(httpStatus.UNAUTHORIZED, errorMessages.INVALID_COUNTRYCODE);
    }

    const firstName = req.body.firstName || req.body.name?.split(' ')[0] || '';
    const lastName = req.body.lastName || req.body.name?.split(' ').slice(1).join(' ') || '';
    const userData = {
      firstName: firstName || 'Driver',
      lastName: lastName || '',
      phoneNumber: req.body.phoneNumber || '',
      country: req.body.countryCode || '',
      countryCode: req.body.countryCode,
      active: req.body.active !== undefined ? req.body.active : true,
      deviceInfoHash: req.body.deviceInfoHash || 'web-browser',
      deviceType: req.body.deviceType || 'web',
      regDate: req.body.regDate || '',
      regTime: req.body.regTime || '',
      clientId,
      roleIds: roleId,
      address: req.body.address || '',
      dateOfBirth: req.body.dateOfBirth || '',
      zoneId: req.body.serviceLocation,
      referralCode: req.body.referralCode || generateReferralCode(),
    };

    if (req.body.demoKey) userData.adminDemoKey = req.body.demoKey;
    if (req.body.email) userData.email = req.body.email || '';

    const serviceTypeArr = Array.isArray(req.body.serviceType)
      ? req.body.serviceType
      : req.body.serviceType
        ? [req.body.serviceType]
        : [];

    const driverData = {
      type: req.body.vehicleType || null,
      carModel: req.body.vehicleModel || null,
      carNumber: req.body.carNumber || '',
      serviceLocation: req.body.serviceLocation || '',
      secondaryZone: req.body.secondaryZone && req.body.secondaryZone.length > 0 ? req.body.secondaryZone : null,
      serviceCategory: req.body.serviceCategory,
      serviceType: serviceTypeArr.length > 0 ? serviceTypeArr : null,
      specialPrice: req.body.specialPrice || false,
      clientId,
      carColour: req.body.carColour || '',
    };

    const driverVehicleData = {
      vehicleId: req.body.vehicleModelId || null,
      vehicleModelId: req.body.vehicleModelId || null,
      vehicleMake: req.body.vehicleMake,
      vehicleModelName: req.body.vehicleModelName,
      manufactureYear: req.body.manufactureYear,
      licensePlateNumber: req.body.licensePlateNumber,
      vehicleColor: req.body.vehicleColor,
      passengerCapacity: req.body.passengerCapacity || null,
    };

    const user = await userService.createUser(userData);

    if (userData.deviceInfoHash) {
      await sendPushNotificationToken(userData.deviceInfoHash, user._id.toString(), {
        title: 'WELCOME',
        message: process.env.WELCOME_TEXT || 'Welcome to Noyaxi',
      });
    }

    const tokens = await tokenService.generateAuthTokens(user);
    driverData.userId = user.id;

    const driverDetails = await driverService.createDriver(driverData);
    driverVehicleData.driverId = driverDetails._id;
    await driverVehicleService.createDriverVehicle(driverVehicleData);

    let driver = await mobiledriverService.getDriversBytoken(tokens.access.token);
    if (driver != null && Array.isArray(driver)) {
      driver = driver[0];
    }

    if (req.body.referralCode) {
      const referedByData = await User.findOne({ referralCode: req.body.referralCode });
      await Referral.create({
        referredBy: referedByData._id,
        referredTo: user._id,
      });
    }

    await walletIntialTransaction(0, user._id, 'Earned', 'Wallet Create');

    await session.commitTransaction();
    session.endSession();

    const response = Response(true, { driver, tokens }, 'Driver created successfully');
    res.status(httpStatus.CREATED).send(response);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
});

/**
 * Get zone-based documents required for driver (no auth - for registration form)
 * GET /v1/web/driver/documents/by-zone/:zoneId
 */
const getDocumentsByZone = catchAsync(async (req, res) => {
  const { zoneId } = req.params;
  const GroupDocument = require('../../../models/boilerplate/groupdocument.model');
  const Document = require('../../../models/boilerplate/document.model');

  const zone = await Zone.findById(zoneId);
  if (!zone) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Zone not found');
  }

  const clientId = zone.clientId;
  if (!clientId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Zone has no client configured');
  }

  const groupDocument = await GroupDocument.findOne({
    name: 'Driver',
    zoneId,
    type: 'driver',
    status: true,
    clientId,
  });

  if (!groupDocument) {
    const response = Response(true, [], 'No documents configured for this zone');
    return res.status(httpStatus.OK).send(response);
  }

  const documents = await Document.find({
    documentId: groupDocument._id,
    status: true,
    clientId,
  }).lean();

  const response = Response(true, documents, 'Documents retrieved successfully');
  res.status(httpStatus.OK).send(response);
});

/**
 * Get primary zones only for driver service location (no auth)
 * GET /v1/web/driver/zones
 */
const getZonesForDriver = catchAsync(async (req, res) => {
  const zones = await webGetZoneDetails();
  const primaryOnly = (zones || []).filter((z) => z.zoneLevel === 'PRIMARY');
  const simplified = primaryOnly.map((z) => ({
    _id: z._id,
    zoneName: z.zoneName,
    zoneLevel: z.zoneLevel,
    country: z.country,
    clientId: z.clientId,
  }));
  const response = Response(true, simplified, 'Primary zones retrieved successfully');
  res.status(httpStatus.OK).send(response);
});

/**
 * Get secondary zones by primary zone (for multi-select)
 * GET /v1/web/driver/zones/secondary/:primaryZoneId
 */
const getSecondaryZonesByPrimary = catchAsync(async (req, res) => {
  const { primaryZoneId } = req.params;
  const secondaryZones = await Zone.find({
    primaryZoneId: new mongoose.Types.ObjectId(primaryZoneId || ''),
    zoneLevel: 'SECONDARY',
    status: true,
  })
    .select('_id zoneName zoneLevel primaryZoneId')
    .lean();
  const response = Response(true, secondaryZones, 'Secondary zones retrieved successfully');
  res.status(httpStatus.OK).send(response);
});

/**
 * Get service types (Local, Rental) for driver registration
 * GET /v1/web/driver/service-types
 */
const getServiceTypes = catchAsync(async (req, res) => {
  const servicetype = await Settings.findOne({ name: 'serviceType' });
  let types = ['Local', 'Rental'];
  if (servicetype && servicetype.value) {
    types = servicetype.value.split(',').map((s) => s.trim()).filter(Boolean);
  }
  const response = Response(true, { serviceTypes: types }, 'Service types retrieved successfully');
  res.status(httpStatus.OK).send(response);
});

/**
 * Get dropdown data for driver registration (categories, vehicles, zones, countries)
 * clientId from zoneId query param or header
 */
const getCategoriesWithoutPagination = catchAsync(async (req, res) => {
  let clientId = req.headers.clientid;
  if (!clientId && req.query.zoneId) {
    const zone = await Zone.findById(req.query.zoneId);
    if (zone && zone.clientId) clientId = zone.clientId.toString();
  }
  if (!clientId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'clientId or zoneId required for web driver registration');
  }
  const categories = await categoryService.getCategorys(clientId);
  if (!categories) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Categories not found');
  }
  const updated = categories.map((c) => ({
    ...c.toObject ? c.toObject() : c,
    categoryImage: c.categoryImage ? `/uploads/categoryImage/${c.categoryImage}` : null,
  }));
  const response = Response(true, updated, 'Categories retrieved successfully');
  res.status(httpStatus.OK).send(response);
});

const getVehiclesByZoneWithoutPagination = catchAsync(async (req, res) => {
  const { zoneId } = req.params;
  let clientId = req.headers.clientid;
  if (!clientId) {
    const zone = await Zone.findById(zoneId);
    if (zone && zone.clientId) clientId = zone.clientId.toString();
  }
  if (!clientId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Zone has no client configured');
  }
  const vehicles = await vehicleService.getVehiclesByZoneId(zoneId, clientId);
  if (!vehicles) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Vehicles not found');
  }
  const updated = vehicles.map((v) => ({
    ...v.toObject ? v.toObject() : v,
    image: v.image ? `/uploads/vehicles/${v.image}` : null,
    highlightImage: v.highlightImage ? `/uploads/vehicles/${v.highlightImage}` : null,
  }));
  const response = Response(true, updated, 'Vehicles retrieved successfully');
  res.status(httpStatus.OK).send(response);
});

/**
 * Get vehicle models - filtered by vehicleId (vehicle type) when provided
 * GET /v1/web/driver/vehicle-models?zoneId=...&vehicleId=...
 * - vehicleId: optional - when provided, returns only models under that vehicle type
 */
const getVehicleModelWithoutPagination = catchAsync(async (req, res) => {
  let clientId = req.headers.clientid;
  if (!clientId && req.query.zoneId) {
    const zone = await Zone.findById(req.query.zoneId);
    if (zone && zone.clientId) clientId = zone.clientId.toString();
  }
  if (!clientId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'clientId or zoneId required');
  }
  const vehicleId = req.query.vehicleId;
  let vehicleModels;
  if (vehicleId) {
    vehicleModels = await vehicleModelService.getVehicleModelByVehicleId(vehicleId, clientId);
  } else {
    vehicleModels = await vehicleModelService.getVehicleModels(clientId);
  }
  if (!vehicleModels) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Vehicle models not found');
  }
  const list = Array.isArray(vehicleModels) ? vehicleModels : (vehicleModels.docs || vehicleModels);
  const updated = list.map((vm) => ({
    ...(vm.toObject ? vm.toObject() : vm),
    image: vm.image ? `/uploads/vehicleModels/${vm.image}` : null,
  }));
  const response = Response(true, updated, 'Vehicle models retrieved successfully');
  res.status(httpStatus.OK).send(response);
});

module.exports = {
  createWebDriver,
  getDocumentsByZone,
  getZonesForDriver,
  getSecondaryZonesByPrimary,
  getServiceTypes,
  getCategoriesWithoutPagination,
  getVehiclesByZoneWithoutPagination,
  getVehicleModelWithoutPagination,
};
