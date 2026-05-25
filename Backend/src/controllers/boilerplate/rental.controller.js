const httpStatus = require('http-status');
const pick = require('../../utils/pick');
const ApiError = require('../../utils/ApiError');
const catchAsync = require('../../utils/catchAsync');
const { rentalService } = require('../../services');
const Response = require('../../config/response');
const { Vehicle } = require('../../models');

const createRental = catchAsync(async (req, res) => {
  if (!req.headers.clientid) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'ClientID not found');
  }

  req.body.clientId = req.headers.clientid;

  const rental = await rentalService.createRental(req.body);

  res.status(httpStatus.CREATED).json({
    success: true,
    data: rental,
    message: 'Rental created successfully',
  });
});



  const getAllPackages = catchAsync(async (req, res) => {

    const rental = await rentalService.getPackages(req);
    if (!rental) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Rental not found');
    }
    const response = Response(true, rental, "Success");
    res.status(httpStatus.OK).send(response);
  });
  

const getRental = catchAsync(async (req, res) => {
  const rental = await rentalService.getRentalById(req.params.rentalId);
  if (!rental) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Rental not found');
  }
  const response = Response(true, rental, "Success");
  res.status(httpStatus.OK).send(response);
});
const getRentals = catchAsync(async (req, res) => {
    const filter = pick(req.query, ['km']);
    const options = pick(req.query, ['sortBy', 'limit', 'page']);
    const result = await rentalService.queryRental(filter, options);
    const response = Response(true, result, "Success");
    res.status(httpStatus.OK).send(response);
  });

const getRentalWithPagination = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['km','hour']);  
  const options = pick(req.query, ['sortBy', 'limit', 'page'],{ allowDiskUse: true });
  if (req.query.search) {
    filter.$or = [
      { km: Number(req.query.search) },
      { hour: Number(req.query.search) },

    ];
  }
  
  const result = await rentalService.queryRental(req,filter, options);
  const response = Response(true, result, "Success");
  res.status(httpStatus.OK).send(response);
});



const updateRental = catchAsync(async (req, res) => {
  const rental = await rentalService.updateRentalById(req.params.rentalId, req.body);
  const response = Response(true, rental, "Success");
  res.status(httpStatus.OK).send(response);
});

const deleteRental = catchAsync(async (req, res) => {
  const rental= await rentalService.deleteRentalById(req.params.rentalId);
  const response = Response(true, rental, "Success");
  res.status(httpStatus.OK).send(response);
});


const UpdateRentalStatus = catchAsync(async (req, res) => {
  const rentalId = req.params.rentalId;
  const { status } = req.body;

  const rental = await rentalService.updateRentalById(rentalId, { status });

  if (!rental) {
    throw new ApiError(httpStatus.NOT_FOUND, 'rental not found');
  }

  const response = Response(true, rental, "rental status updated successfully");
  res.status(httpStatus.OK).send(response);
});

const getDropDownList = catchAsync(async (req, res) => {
  let data = await rentalService.getDropDowns(req.params.clientId);
  
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, 'data not found');
  }
  const response = Response(true, data, "Success");
  res.status(httpStatus.OK).send(response);
});

const getRentalCount = catchAsync(async (req, res) => {
  try {
    const count = await rentalService.countRentalDocuments();
    const response = Response(true, { count }, "Success");
    res.status(httpStatus.OK).send(response);
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error fetching rental count');
  }
});

const getZoneWithPagination = catchAsync(async (req, res) => {
  
  if(!req.headers.clientid || req.headers.clientid == '')
  {
    throw new ApiError(httpStatus.NOT_FOUND, 'ClientID not found');
  }
  const clientId = req.headers.clientid;
  const result = await rentalService.getZones(clientId);
  const response = Response(true, result, "Success");
  res.status(httpStatus.OK).send(response);
});

const getRentalPackagesByZone = catchAsync(async (req, res) => {
  const result = await rentalService.getRentalPackagesByZone(req);
  const response = Response(true, result, "Success");
  res.status(httpStatus.OK).send(response);
});

module.exports = {
  createRental,
  getRentals,
  getRental,
  getRentalWithPagination,
  updateRental,
  deleteRental,
  UpdateRentalStatus,
  getDropDownList,
  getAllPackages,
  getRentalCount,
  getZoneWithPagination,
  getRentalPackagesByZone
};
