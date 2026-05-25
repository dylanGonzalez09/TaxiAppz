const httpStatus = require('http-status');
const pick = require('../../../utils/pick');
const ApiError = require('../../../utils/ApiError');
const catchAsync = require('../../../utils/catchAsync');
const { zoneService, zonePriceService, zoneSurgePriceService } = require('../../../services');
const { tokenService } = require('../../../services');
const { ZonePrice } = require('../../../models');
const { ZoneSurgePrice } = require('../../../models');

const Response = require('../../../config/response');

const createZone = catchAsync(async (req, res) => {
  const zone = await zoneService.createZone(req.body);
  const response = Response(true, zone, "Success");
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
    currency: req.body.currency,
    paymentTypes: req.body.paymentTypes,
    zoneName: req.body.zoneName,
    unit:req.body.unit,
    nonServiceZone: req.body.nonServiceZone,
    biddingZone: req.body.biddingZone,
    primaryZoneId: req.body.primaryZoneId,
    clientId: req.body.clientId,
    createdBy: user.id,
    mapZone: req.body.mapCooder
  }


  const zone = await zoneService.zoneCreate(zoneData);


  const zonePriceBody = req.body.zonePriceData.map(item => ({
    ...item,
    zoneId: zone.id,
    clientId: req.body.clientId,
    createdBy: user.id
  }));

  await ZonePrice.insertMany(zonePriceBody);



  const zoneSurgePriceBody = req.body.zonesurgePriceData.map(item => ({
    ...item,
    zoneId: zone.id,
    clientId: req.body.clientId,
    createdBy: user.id
  }));


  await ZoneSurgePrice.insertMany(zoneSurgePriceBody)

  const response = Response(true, "test", "Success");
  res.status(httpStatus.CREATED).send(response);
});

const zoneCheck = catchAsync(async (req, res) => {

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
  const response = Response(true, "test", "Success");
  res.status(httpStatus.CREATED).send(response);
});

const getZones = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await zoneService.queryZone(filter, options);
  const response = Response(true, result, "Success");
  res.status(httpStatus.OK).send(response);
});

const getZone = catchAsync(async (req, res) => {
  const zone = await zoneService.getZoneById(req.params.zoneId);
  if (!zone) {
    throw new ApiError(httpStatus.NOT_FOUND, 'zone not found');
  }
  const response = Response(true, zone, "Success");
  res.status(httpStatus.OK).send(response);
});

const getZonePagination = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'role']);

  const options = pick(req.query, ['sortBy', 'limit', 'page'],{ allowDiskUse: true });
  if (req.query.search) {
    filter.$or = [
      { question: { $regex: req.query.search, $options: 'i' } },
    ];
  }
  options.sortBy = options.sortBy || 'createdAt:desc';

  const zone = await zoneService.getZone(req, filter, options);
  if (!zone) {
    throw new ApiError(httpStatus.NOT_FOUND, 'zone not found');
  }
  const response = Response(true, zone, "Success");
  res.status(httpStatus.OK).send(response);
});


const getZoneWithOutPagination = catchAsync(async (req, res) => {
  const zone = await zoneService.getZoneWithOutPagination(req);
  if (!zone) {
    throw new ApiError(httpStatus.NOT_FOUND, 'zone not found');
  }
  const response = Response(true, zone, "Success");
  res.status(httpStatus.OK).send(response);
});


const getPrimaryZone = catchAsync(async (req, res) => {
  const zone = await zoneService.getPrimaryZone(req);
  if (!zone) {
    throw new ApiError(httpStatus.NOT_FOUND, 'zone not found');
  }
  const response = Response(true, zone, "Success");
  res.status(httpStatus.OK).send(response);
});

const updateZone = catchAsync(async (req, res) => {

  const exitingZone = await zoneService.getZoneById(req.params.zoneId);


  const zoneData = {
    zoneLevel: req.body.zoneLevel,
    unit:req.body.unit,
    country: req.body.country,
    paymentTypes: req.body.paymentTypes,
    primaryZoneId: req.body.primaryZoneId || exitingZone[0].primaryZoneId,
    zoneName: req.body.zoneName,
    mapZone: req.body.mapCooder,
    currency:req.body.currency,
  }

  if (req.body.nonServiceZone != undefined) {
     zoneData.nonServiceZone = req.body.nonServiceZone;
  }

  if (req.body.biddingZone != undefined) {
     zoneData.biddingZone = req.body.biddingZone;
  }


  const zone = await zoneService.updateZoneById(req.params.zoneId, zoneData);

  for (const zonePriceData of req.body.zonePriceData) {
    const id = zonePriceData._id;
    const updateData = { ...zonePriceData };
    delete updateData._id;
    await zonePriceService.updateZonePriceById(id, updateData,req.params.zoneId);
  }


  for (const zoneSorgePriceData of req.body.zonesurgePriceData) {
    const id = zoneSorgePriceData._id;
    const updateData = { ...zoneSorgePriceData };
    delete updateData._id;
    await zoneSurgePriceService.updateZoneSurgePriceById(id, updateData,req.params.zoneId);
  }

  const response = Response(true, zone, "Success");
  res.status(httpStatus.OK).send(response);
});

const deleteZone = catchAsync(async (req, res) => {
  const zone = await zoneService.deleteZoneById(req.params.zoneId);
  const response = Response(true, zone, "Success");
  res.status(httpStatus.OK).send(response);
});


const updateZoneStatus = catchAsync(async (req, res) => {
  const zoneId = req.params.zoneId;
  const { status } = req.body;

  const zone = await zoneService.updateZoneById(zoneId, { status });

  if (!zone) {
    throw new ApiError(httpStatus.NOT_FOUND, 'zone not found');
  }

  const response = Response(true, zone, "zone status updated successfully");
  res.status(httpStatus.OK).send(response);
});

const getDropDownList = catchAsync(async (req, res) => {
  let data = await zoneService.getDropDowns(req.params.clientId);

  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, 'data not found');
  }
  const response = Response(true, data, "Success");
  res.status(httpStatus.OK).send(response);
});

module.exports = {
  createZone,
  zoneCreate,
  getZones,
  zoneCheck,
  getZone,
  getZonePagination,
  updateZone,
  deleteZone,
  updateZoneStatus,
  getZoneWithOutPagination,
  getPrimaryZone,
  getDropDownList,
};
