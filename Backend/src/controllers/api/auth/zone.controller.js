const httpStatus = require('http-status').default || require('http-status').status || require('http-status');
const pick = require('../../../utils/pick');
const ApiError = require('../../../utils/ApiError');
const catchAsync = require('../../../utils/catchAsync');
const { zoneService, zonePriceService, zoneSurgePriceService } = require('../../../services');
const { tokenService } = require('../../../services');
const { ZonePrice } = require('../../../models');
const { ZoneSurgePrice } = require('../../../models');
const { Zone } = require('../../../models');
const { Vehicle } = require('../../../models');
const { Driver } = require('../../../models');
const { Request } = require('../../../models');
const { DriverInProgressView } = require('../../../models');
const { ObjectId } = require('mongoose').Types;
const mqttService = require('../../../services/mqtt/mqtt.service');
const { mqttConfig } = require('../../../config/string');

const Response = require('../../../config/response');

const hasDriverActiveTrip = async (driverId) => {
  const activeTrip = await Request.exists({
    driverId: new ObjectId(String(driverId)),
    $and: [
      { $or: [{ isCancelled: false }, { isCancelled: { $exists: false } }, { isCancelled: null }] },
      { $or: [{ isCompleted: false }, { isCompleted: { $exists: false } }, { isCompleted: null }] },
    ],
  });
  return Boolean(activeTrip);
};

const publishDriverDetailMqtt = async ({ zoneIds = [], vehicleIds = [] }) => {
  const validZoneIds = [...new Set(zoneIds.map((id) => String(id)).filter(Boolean))];
  if (!validZoneIds.length) {
    return;
  }

  const driverQuery = {
    serviceLocation: { $in: validZoneIds.map((id) => new ObjectId(id)) },
  };

  const validVehicleIds = [...new Set(vehicleIds.map((id) => String(id)).filter(Boolean))];
  if (validVehicleIds.length) {
    driverQuery.type = { $in: validVehicleIds.map((id) => new ObjectId(id)) };
  }

  const drivers = await Driver.find(driverQuery).select('_id').lean();

  await Promise.all(
    drivers.map(async (driver) => {
      try {
        const isActiveTrip = await hasDriverActiveTrip(driver._id);
        if (isActiveTrip) {
          return;
        }

        const topic = mqttConfig.DRIVER_DETAIL + String(driver._id);
        const payload = await DriverInProgressView.findOne({ _id: driver._id }).lean();

        await mqttService.publishMessage(topic, payload || { driverId: driver._id });
      } catch (error) {
        console.error('MQTT publish error for driver detail:', error);
      }
    })
  );
};

const createZone = catchAsync(async (req, res) => {
  const zone = await zoneService.createZone(req.body);
  const response = Response(true, zone, 'Success');
  res.status(httpStatus.CREATED).send(response);
});

const zoneCreate = catchAsync(async (req, res) => {
  if (!req.headers.clientid) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ClientID not found');
  } else {
    req.body.clientId = req.headers.clientid;
  }

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(httpStatus.UNAUTHORIZED).send({ message: 'Authorization header is missing or invalid' });
    return;
  }
  // Remove the 'Bearer ' prefix and get the token
  const token = authHeader.substring(7);

  const user = await tokenService.verifyTokenAndGetUser(token);

  const zoneData = {
    zoneLevel: req.body.zoneLevel,
    country: req.body.country,
    paymentTypes: req.body.paymentTypes,
    zoneName: req.body.zoneName,
    nonServiceZone: req.body.nonServiceZone,
    primaryZoneId: req.body.primaryZoneId,
    clientId: req.body.clientId,
    createdBy: user.id,
    mapZone: req.body.mapCooder,
  };

  const zone = await zoneService.zoneCreate(zoneData);

  const zonePriceBody = req.body.zonePriceData.map((item) => ({
    ...item,
    zoneId: zone.id,
    clientId: req.body.clientId,
    createdBy: user.id,
  }));

  await ZonePrice.insertMany(zonePriceBody);

  const zoneSurgePriceBody = req.body.zonesurgePriceData.map((item) => ({
    ...item,
    zoneId: zone.id,
    clientId: req.body.clientId,
    createdBy: user.id,
  }));

  await ZoneSurgePrice.insertMany(zoneSurgePriceBody);

  const response = Response(true, 'test', 'Success');
  res.status(httpStatus.CREATED).send(response);
});

const getZones = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await zoneService.queryZone(filter, options);
  const response = Response(true, result, 'Success');
  res.status(httpStatus.OK).send(response);
});

const getZone = catchAsync(async (req, res) => {
  const zone = await zoneService.getZoneById(req.params.zoneId);
  if (!zone) {
    throw new ApiError(httpStatus.NOT_FOUND, 'zone not found');
  }
  const response = Response(true, zone, 'Success');
  res.status(httpStatus.OK).send(response);
});

const getZonePagination = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'role']);

  const options = pick(req.query, ['sortBy', 'limit', 'page'], { allowDiskUse: true });
  if (req.query.search) {
    filter.$or = [{ question: { $regex: req.query.search, $options: 'i' } }];
  }
  const zone = await zoneService.getZone(req, filter, options);
  if (!zone) {
    throw new ApiError(httpStatus.NOT_FOUND, 'zone not found');
  }
  const response = Response(true, zone, 'Success');
  res.status(httpStatus.OK).send(response);
});

const getZoneWithOutPagination = catchAsync(async (req, res) => {
  const zone = await zoneService.getPrimaryZone(req);
  if (!zone) {
    throw new ApiError(httpStatus.NOT_FOUND, 'zone not found');
  }
  const response = Response(true, zone, 'Success');
  res.status(httpStatus.OK).send(response);
});

const updateZone = catchAsync(async (req, res) => {
  const exitingZone = await zoneService.getZoneById(req.params.zoneId);
  const currentZone = Array.isArray(exitingZone) ? exitingZone[0] : exitingZone;
  const zonePriceIds = (req.body.zonePriceData || []).map((item) => item?._id).filter(Boolean);
  const previousZonePrices = zonePriceIds.length
    ? await ZonePrice.find({ _id: { $in: zonePriceIds } }).select('_id status vehicleId').lean()
    : [];
  const previousZonePriceMap = new Map(previousZonePrices.map((item) => [String(item._id), item]));
  const changedVehicleIds = new Set();
  const cascadedSecondaryZoneIds = [];

  const zoneData = {
    zoneLevel: req.body.zoneLevel,
    country: req.body.country,
    paymentTypes: req.body.paymentTypes,
    primaryZoneId: req.body.primaryZoneId || exitingZone[0].primaryZoneId,
    zoneName: req.body.zoneName,
    mapZone: req.body.mapCooder,
  };

  if (req.body.nonServiceZone != undefined) {
    zoneData.nonServiceZone = req.body.nonServiceZone;
  }

  const zone = await zoneService.updateZoneById(req.params.zoneId, zoneData);

  for (const zonePriceData of req.body.zonePriceData) {
    const id = zonePriceData._id;
    const updateData = { ...zonePriceData };
    delete updateData._id;

    // Secondary zone cannot enable a vehicle when that vehicle is disabled in its primary zone.
    if (
      currentZone &&
      String(currentZone.zoneLevel).toUpperCase() === 'SECONDARY' &&
      updateData.status === true &&
      currentZone.primaryZoneId &&
      updateData.vehicleId
    ) {
      const primaryPrice = await ZonePrice.findOne({
        zoneId: new ObjectId(String(currentZone.primaryZoneId)),
        vehicleId: new ObjectId(String(updateData.vehicleId)),
      })
        .select('status')
        .lean();

      if (!primaryPrice || primaryPrice.status !== true) {
        const vehicle = await Vehicle.findById(updateData.vehicleId).select('vehicleName').lean();
        const vehicleName = vehicle?.vehicleName || 'this vehicle';
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          `Please enable ${vehicleName} in primary zone first`
        );
      }
    }

    await zonePriceService.updateZonePriceById(id, updateData, req.params.zoneId);

    const previousZonePrice = previousZonePriceMap.get(String(id));
    if (
      previousZonePrice &&
      typeof updateData.status === 'boolean' &&
      previousZonePrice.status !== updateData.status
    ) {
      const effectiveVehicleId = updateData.vehicleId || previousZonePrice.vehicleId;
      if (effectiveVehicleId) {
        changedVehicleIds.add(String(effectiveVehicleId));
      }
    }
  }

  // When vehicle is disabled in PRIMARY zone, cascade the same vehicle disable to all SECONDARY zones.
  if (currentZone && String(currentZone.zoneLevel).toUpperCase() === 'PRIMARY') {
    const disabledVehicleIds = (req.body.zonePriceData || [])
      .filter((zp) => zp?.status === false && zp?.vehicleId)
      .map((zp) => String(zp.vehicleId));

    if (disabledVehicleIds.length > 0) {
      const secondaryZones = await Zone.find({
        primaryZoneId: new ObjectId(String(currentZone._id)),
        zoneLevel: 'SECONDARY',
      })
        .select('_id')
        .lean();

      const secondaryZoneIds = secondaryZones.map((z) => z._id);
      cascadedSecondaryZoneIds.push(...secondaryZoneIds);

      if (secondaryZoneIds.length > 0) {
        await ZonePrice.updateMany(
          {
            zoneId: { $in: secondaryZoneIds },
            vehicleId: { $in: disabledVehicleIds.map((id) => new ObjectId(id)) },
          },
          { $set: { status: false } }
        );
      }
    }
  }

  for (const zoneSorgePriceData of req.body.zonesurgePriceData) {
    const id = zoneSorgePriceData._id;
    const updateData = { ...zoneSorgePriceData };
    delete updateData._id;
    await zoneSurgePriceService.updateZoneSurgePriceById(id, updateData, req.params.zoneId);
  }

  const keepVehicleIds = Array.isArray(req.body.vehicleTypes)
    ? req.body.vehicleTypes
      .map((v) => (typeof v === 'string' ? v : v?._id || v?.id))
      .filter(Boolean)
    : [];

  if (keepVehicleIds.length > 0) {
    await ZonePrice.deleteMany({
      zoneId: req.params.zoneId,
      vehicleId: { $nin: keepVehicleIds },
    });
    await ZoneSurgePrice.deleteMany({
      zoneId: req.params.zoneId,
      vehicleId: { $nin: keepVehicleIds },
    });
  } else {
    await ZonePrice.deleteMany({ zoneId: req.params.zoneId });
    await ZoneSurgePrice.deleteMany({ zoneId: req.params.zoneId });
  }

  if (changedVehicleIds.size > 0) {
    await publishDriverDetailMqtt({
      zoneIds: [req.params.zoneId, ...cascadedSecondaryZoneIds],
      vehicleIds: [...changedVehicleIds],
    });
  }

  const response = Response(true, zone, 'Success');
  res.status(httpStatus.OK).send(response);
});

const deleteZone = catchAsync(async (req, res) => {
  const zone = await zoneService.deleteZoneById(req.params.zoneId);
  const response = Response(true, zone, 'Success');
  res.status(httpStatus.OK).send(response);
});

const updateZoneStatus = catchAsync(async (req, res) => {
  const { zoneId } = req.params;
  const { status } = req.body;

  const existingZone = await Zone.findById(zoneId).lean();

  if (!existingZone) {
    throw new ApiError(httpStatus.NOT_FOUND, 'zone not found');
  }

  // Secondary can be activated only when its primary zone is active.
  if (status === true && String(existingZone.zoneLevel).toUpperCase() === 'SECONDARY' && existingZone.primaryZoneId) {
    const primaryZone = await Zone.findById(existingZone.primaryZoneId).select('status').lean();

    if (!primaryZone || primaryZone.status !== true) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Please activate primary zone first');
    }
  }

  const affectedZoneIds = [zoneId];
  const zone = await zoneService.updateZoneById(zoneId, { status });

  if (!zone) {
    throw new ApiError(httpStatus.NOT_FOUND, 'zone not found');
  }

  // When primary zone is deactivated, cascade deactivation to all its secondary zones.
  if (status === false && String(zone.zoneLevel).toUpperCase() === 'PRIMARY') {
    const secondaryZones = await Zone.find({ primaryZoneId: zone._id, zoneLevel: 'SECONDARY' })
      .select('_id')
      .lean();
    const secondaryZoneIds = secondaryZones.map((item) => item._id);

    if (secondaryZoneIds.length > 0) {
      await Zone.updateMany({ _id: { $in: secondaryZoneIds } }, { $set: { status: false } });
      affectedZoneIds.push(...secondaryZoneIds);
    }
  }

  await publishDriverDetailMqtt({ zoneIds: affectedZoneIds });

  const response = Response(true, zone, 'zone status updated successfully');
  res.status(httpStatus.OK).send(response);
});

module.exports = {
  createZone,
  zoneCreate,
  getZones,
  getZone,
  getZonePagination,
  updateZone,
  deleteZone,
  updateZoneStatus,
  getZoneWithOutPagination,
};
