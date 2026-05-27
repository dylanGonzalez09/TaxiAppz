const httpStatus = require('http-status').default || require('http-status').status || require('http-status');
const pick = require('../../../utils/pick');
const ApiError = require('../../../utils/ApiError');
const catchAsync = require('../../../utils/catchAsync');
const { promoCodeService, apipromoCodeService } = require('../../../services');
const Response = require('../../../config/response');
const { User } = require('../../../models');

const createPromoCode = catchAsync(async (req, res) => {
  const clientId = req.headers.clientid;

  if (!clientId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'ClientID not found');
  }

  req.body = req.body || {};
  req.body.clientId = clientId;

  const promoCodeData = {
    ...req.body,
    userId: req.body.userId || [],
  };

  const promoCode = await promoCodeService.createPromoCode(promoCodeData);

  const response = Response(true, promoCode, 'Promo code created successfully');
  res.status(httpStatus.CREATED).send(response);
});

const getPromoCodes = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['promoCode', 'promoCodeType', 'targetAmount', 'promoType', 'toDate', 'fromDate', 'role']);

  if (req.headers.clientid) {
    filter.clientId = req.headers.clientid;
  } else {
    throw new ApiError(httpStatus.BAD_REQUEST, 'ClientID not found');
  }

  if (req.headers.zoneid) {
    filter.zoneId = req.headers.zoneid;
  } else {
    throw new ApiError(httpStatus.BAD_REQUEST, 'ZoneID not found');
  }

  const options = pick(req.query, ['sortBy', 'limit', 'page'], { allowDiskUse: true });

  if (req.query.search) {
    filter.$or = [
      { promoCode: { $regex: req.query.search, $options: 'i' } },
      { promoCodeType: { $regex: req.query.search, $options: 'i' } },
      { promoType: { $regex: req.query.search, $options: 'i' } },
    ];

    const searchNumber = parseFloat(req.query.search);
    if (!isNaN(searchNumber)) {
      filter.$or.push({ targetAmount: searchNumber });
    }
  }

  const result = await promoCodeService.queryPromoCodes(filter, options);

  const response = Response(true, result, 'Promo codes retrieved successfully');
  res.status(httpStatus.OK).send(response);
});

const getPromoCode = catchAsync(async (req, res) => {
  const promoCode = await promoCodeService.getPromoCodeById(req.params.promoCodeId);
  if (!promoCode) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Promo code not found');
  }
  const response = Response(true, promoCode, 'Promo code retrieved successfully');
  res.status(httpStatus.OK).send(response);
});

const updatePromoCode = catchAsync(async (req, res) => {
  const updateData = req.body;

  if (req.file) {
    updateData.banner = req.file.filename;
  }

  const promoCode = await promoCodeService.updatePromoCodeById(req.params.promoCodeId, updateData);

  if (promoCode && promoCode.banner) {
    promoCode.banner = `/uploads/promo/${promoCode.banner}`;
  }

  const response = Response(true, promoCode, 'Promo code updated successfully');

  res.status(httpStatus.OK).send(response);
});

const deletePromoCode = catchAsync(async (req, res) => {
  const promo = await promoCodeService.deletePromoCodeById(req.params.promoCodeId);
  const response = Response(true, promo, 'Promo code deleted successfully');
  res.status(httpStatus.OK).send(response);
});

const getPromosWithoutPagination = catchAsync(async (req, res) => {
  if (!req.headers.clientid) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ClientID not found');
  }

  const promoCodes = await promoCodeService.getPromoCodes();

  if (!promoCodes) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Vehicles not found');
  }

  const updatedVehicles = promoCodes.map((promoCode) => {
    if (promoCode.banner) {
      promoCode.banner = `/uploads/promo/${promoCode.banner}`;
    }
    return promoCode;
  });

  const response = Response(true, updatedVehicles, 'Vehicles retrieved successfully');
  res.status(httpStatus.OK).send(response);
});

const updatePromoStatus = catchAsync(async (req, res) => {
  const promoId = req.params.promoCodeId;
  const { status } = req.body;

  const promoCode = await promoCodeService.updatePromoCodeById(promoId, { status });

  if (!promoCode) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Vehicle not found');
  }

  const response = Response(true, promoCode, 'Vehicle status updated successfully');
  res.status(httpStatus.OK).send(response);
});
const getDropDownList = catchAsync(async (req, res) => {
  const data = await promoCodeService.getDropDowns(req.params.clientId);

  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, 'data not found');
  }
  const response = Response(true, data, 'Success');
  res.status(httpStatus.OK).send(response);
});

const getPromoCodeDropDownList = catchAsync(async (req, res) => {
  const { zoneId, passengerNumber } = req.params;

  const user = await User.findOne({ phoneNumber: passengerNumber });
  const userId = user._id || null

  if(!user || !userId){
    throw new ApiError(httpStatus.NOT_FOUND,"User not found!")
  }

  const data = await apipromoCodeService.getPromode({ req, zoneId, userId});

  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, 'data not found');
  }
  const response = Response(true, data, 'Success');
  res.status(httpStatus.OK).send(response);
});
const getPromoUseReport = catchAsync(async (req, res) => {
  const zoneId = req.headers.zoneid;
  const clientId = req.headers.clientid;

  if (!zoneId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'ZoneID not found');
  }

  if (!clientId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'ClientID not found');
  }

  try {
    const data = await promoCodeService.getPromoUseReport(zoneId);

    const response = Response(true, data, 'Success');
    res.status(httpStatus.OK).send(response);
  } catch (err) {
    console.error('Error in getPromoUseReport controller:', err);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to fetch promo usage report');
  }
});

const getExpiredPromo = catchAsync(async (req, res) => {
  let expiredPromo;
  if (!req.headers.clientid) {
    expiredPromo = await promoCodeService.getSuperAdminExpiredPromo(req);
  } else {
    expiredPromo = await promoCodeService.getExpiredPromo(req);
  }

  if (!expiredPromo) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No expired promo found');
  }

  const response = Response(true, expiredPromo, 'Expired promo fetched successfully');
  res.status(httpStatus.OK).send(response);
});
module.exports = {
  createPromoCode,
  getPromoCodes,
  getPromoCode,
  updatePromoCode,
  deletePromoCode,
  getPromosWithoutPagination,
  updatePromoStatus,
  getDropDownList,
  getPromoCodeDropDownList,
  getPromoUseReport,
  getExpiredPromo,
};
