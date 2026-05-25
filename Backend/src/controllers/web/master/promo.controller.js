const httpStatus = require('http-status');
const pick = require('../../../utils/pick');
const ApiError = require('../../../utils/ApiError');
const catchAsync = require('../../../utils/catchAsync');
const { promoCodeService } = require('../../../services');
const Response = require('../../../config/response');

const createPromoCode = catchAsync(async (req, res) => {

    // Check if clientId exists in the request headers
  const clientId = req.headers.clientid;
  if (!clientId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'ClientID not found');
  }

   req.body = req.body || {}; 
  req.body.clientId = clientId;


  const promoCodeData = {
    ...req.body,
    userId: req.body.userId || [], // If userId is missing, default to an empty array
  };

  const promoCode = await promoCodeService.createPromoCode(promoCodeData);

 
  const response = Response(true, promoCode, "Promo code created successfully");
  res.status(httpStatus.CREATED).send(response);
});

const getPromoCodes = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['promoCode', 'promoCodeType', 'targetAmount', 'promoType', 'toDate', 'fromDate', 'role', 'status']);

  // If clientId exists in the headers, filter by it
  if (req.headers.clientid) {
    filter.clientId = req.headers.clientid; // Add clientId to the filter to get promo codes specific to this client
  } else {
    throw new ApiError(httpStatus.BAD_REQUEST, 'ClientID not found');
  }

  const options = pick(req.query, ['sortBy', 'limit', 'page'], { allowDiskUse: true });

  // Handle search query
  if (req.query.search) {
    filter.$or = [
      { promoCode: { $regex: req.query.search, $options: 'i' } },
      { promoCodeType: { $regex: req.query.search, $options: 'i' } },
      { promoType: { $regex: req.query.search, $options: 'i' } }
    ];

    const searchNumber = parseFloat(req.query.search);
    if (!isNaN(searchNumber)) {
      filter.$or.push({ targetAmount: searchNumber });
    }
  }

  const result = await promoCodeService.queryPromoCodes(filter, options);

  const now = new Date();

  const promoCodes = Array.isArray(result) ? result : result.docs || result.results || result.promoCodes || [];
  promoCodes.forEach(promo => {
    if (promo.toDate) {
      const expiry = new Date(promo.toDate);
      if (expiry < now) {
        promo.status = false;
        promo.save();
      }
    }
  });

  if (!Array.isArray(result)) {
    if (result.docs) result.docs = promoCodes;
    else if (result.results) result.results = promoCodes;
    else if (result.promoCodes) result.promoCodes = promoCodes;
  }

  const response = Response(true, result, "Promo codes retrieved successfully");
  res.status(httpStatus.OK).send(response);
});

const getPromoCode = catchAsync(async (req, res) => {
  const promoCode = await promoCodeService.getPromoCodeById(req.params.promoCodeId);
  if (!promoCode) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Promo code not found');
  }
  const response = Response(true, promoCode, "Promo code retrieved successfully");
  res.status(httpStatus.OK).send(response);
});

const updatePromoCode = catchAsync(async (req, res) => {

  const updateData = req.body;



  const promoCode = await promoCodeService.updatePromoCodeById(req.params.promoCodeId, updateData);


  const response = Response(true, promoCode, "Promo code updated successfully");

  res.status(httpStatus.OK).send(response);
});

const deletePromoCode = catchAsync(async (req, res) => {
  const promo = await promoCodeService.deletePromoCodeById(req.params.promoCodeId);
  const response = Response(true, promo, "Promo code deleted successfully");
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



  const response = Response(true, promoCodes, "Vehicles retrieved successfully");
  res.status(httpStatus.OK).send(response);
});

const updatePromoStatus = catchAsync(async (req, res) => {
  const promoId = req.params.promoCodeId;
  const { status } = req.body;

  const promoCode = await promoCodeService.updatePromoCodeById(promoId, { status });

  if (!promoCode) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Vehicle not found');
  }

  const response = Response(true, promoCode, "Vehicle status updated successfully");
  res.status(httpStatus.OK).send(response);
});
const getDropDownList = catchAsync(async (req, res) => {
  let data = await promoCodeService.getDropDowns(req.params.clientId);
  
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, 'data not found');
  }
  const response = Response(true, data, "Success");
  res.status(httpStatus.OK).send(response);
});

const getPromoCodeDropDownList = catchAsync(async (req, res) => {
  let data = await promoCodeService.getPromoCodeDropDowns(req.params.clientId);
  
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, 'data not found');
  }
  const response = Response(true, data, "Success");
  res.status(httpStatus.OK).send(response);
});
const getPromoUseReport = catchAsync(async (req, res) => {
  let data = await promoCodeService.getPromoUseReport();
  
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, 'data not found');
  }
  const response = Response(true, data, "Success");
  res.status(httpStatus.OK).send(response);
});

const getExpiredPromo = catchAsync(async (req, res) => {
  
  let expiredPromo;
  if (!req.headers.clientid) {
    expiredPromo = await promoCodeService.getSuperAdminExpiredPromo(req);
  }else{
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
  getExpiredPromo
};
