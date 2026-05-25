const httpStatus = require('http-status');
const ApiError = require('../../utils/ApiError');
const { Rental, Vehicle, Country, Zone, User, Request } = require('../../models');
const { vehicleService } = require('..');
const fs = require('fs').promises;
const { getPickupZone, applyPromoCode, webGetPickupZone, webGetZoneDetails } = require('../../utils/commonFunction');
const { tokenService } = require('../../services');
const ObjectId = require('mongoose').Types.ObjectId;
const { HttpStatusCode } = require('axios');


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
/**
 * Create a rental
 * @param {Object} rentalBody
 * @returns {Promise<Rental>}
 */
const createRental = async (rentalBody) => {
  const { zone, km, hour } = rentalBody;

  const existingRental = await Rental.findOne({ zone, km, hour });

  if (existingRental) {
    return { status: httpStatus.FORBIDDEN, msg: "This package is used in trip.so you cannot delete it." };

  }

  return Rental.create(rentalBody);
};
/**
 * Query for roles
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryRental = async (req, filter, options) => {
  const limit = parseInt(options.limit, 10) || 10;
  const page = parseInt(options.page, 10) || 1;

  filter.zoneId = new ObjectId(req.params.zoneId);
  // const rental = await Rental.paginate(filter, options);

  const rental = await Rental.aggregate([
    {
      $match: filter

    },
    {
      $lookup: {
        from: 'countries',
        localField: 'countryId',
        foreignField: '_id',
        as: 'countryDetails'
      }
    },
    {
      $unwind: { path: '$countryDetails', preserveNullAndEmptyArrays: true }
    },
    {
      $project: {
        km: 1,
        hour: 1,
        countryId: 1,
        zoneId: 1,
        vehiclePrices: 1,
        status: 1,
        clientId: 1,
        currency: { $ifNull: ['$countryDetails.currency_symbol', null] }
      }
    },
    {
      $skip: (page - 1) * limit, // Pagination: Skip previous pages
    },
    {
      $limit: limit, // Limit number of results per page
    },
  ]);
  const totalResults = await Rental.countDocuments(filter);
  const totalPages = Math.ceil(totalResults / limit);

  return {
    results: rental,
    page,
    limit,
    totalPages,
    totalResults,
  };
  // return rental;
};


/**
 * @param {Object} clientId - The match criteria for the aggregation
 * Get roles
 * @returns {Promise<Rental>}
 */
const getRental = async (clientId) => {
  return Rental.find({ clientId: clientId });
};


/**
 * Get role by id
 * @param {ObjectId} rentalId
 * @returns {Promise<Rental>}
 */
const getRentalById = async (rentalId) => {
  return Rental.findById(rentalId);
};



const sendError = (message, data, code) => ({
  success: false,
  message,
  data,
  code,
});

const getPackages = async (req) => {
  const userId = await getUserId(req);

  const user = await User.findById(userId);
  if (!user) return { status: 401, data: sendError('Unauthorized', [], 401) };

  let clientId;

  let baseUrl = "/uploads/vehicles";

  let minKm = 0;
  let maxKm = 0;
  let minHr = 0;
  let maxHr = 0;

  if (!req.headers.clientid) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ClientID not found');
  } else {
    clientId = req.headers.clientid;
  }

  let zone = await getPickupZone(req);

  let rental = await Rental.find({ clientId: clientId, zoneId: zone._id }).populate({
    path: 'vehiclePrices.vehicleId',
    model: 'Vehicle',
  });

  minKm = Math.min(...rental.map(r => r.km || 0));
  maxKm = Math.max(...rental.map(r => r.km || 0));
  minHr = Math.min(...rental.map(r => r.hour || 0));
  maxHr = Math.max(...rental.map(r => r.hour || 0));

  // Use Promise.all to handle the async operations in map
  const transformedRentals = await Promise.all(rental.map(async (rentalItem) => {
    const vehiclePricesWithPromo = await Promise.all(rentalItem.vehiclePrices.map(async (vehiclePrice) => {
      const imageUrl = vehiclePrice.vehicleId.image
        ? `${baseUrl}/${vehiclePrice.vehicleId.image}`
        : null;

      const highlightImageUrl = vehiclePrice.vehicleId.highlightImage
        ? `${baseUrl}/${vehiclePrice.vehicleId.highlightImage}`
        : null;

      const vehicleId = vehiclePrice.vehicleId.id
        ? vehiclePrice.vehicleId.id
        : null;

      const vehicleName = vehiclePrice.vehicleId.vehicleName
        ? vehiclePrice.vehicleId.vehicleName
        : null;

      const capacity = vehiclePrice.vehicleId.capacity
        ? vehiclePrice.vehicleId.capacity
        : null;

      const status = vehiclePrice.vehicleId.status
        ? vehiclePrice.vehicleId.status
        : null;

      let promoAmount = await applyPromoCode(req, vehiclePrice.price, user);

      return {
        vehicleId: vehicleId,
        image: imageUrl,
        highlightImage: highlightImageUrl,
        vehicleName: vehicleName,
        capacity: capacity,
        status: status,
        promoAmount: promoAmount,
        price: vehiclePrice.price,
        graceTime: vehiclePrice.graceTime,
        extraKmPrice: vehiclePrice.extraKmPrice,
        _id: vehiclePrice._id,
      };
    }));

    return {
      ...rentalItem.toObject(),
      vehiclePrices: vehiclePricesWithPromo
    };
  }));

  const data = {
    minHr: minHr,
    maxHr: maxHr,
    minKm: minKm,
    maxKm: maxKm,
    biddingZone: zone.biddingZone,
    zone: zone != null ? true : false,
    paymentTypes: zone.paymentTypes,
    package: transformedRentals
  }

  return data;
};

/**
 * Get rental packages for web booking (no auth required).
 * Uses pick_lat, pick_lng from body to resolve zone; if missing, uses first available zone.
 * Same response shape as getPackages.
 */
const getPackagesWeb = async (req) => {
  const baseUrl = '/uploads/vehicles';
  let minKm = 0;
  let maxKm = 0;
  let minHr = 0;
  let maxHr = 0;
  let zone = null;

  if (req.body && req.body.pick_lat != null && req.body.pick_lng != null) {
    zone = await webGetPickupZone(req);
  }
  if (!zone) {
    const zones = await webGetZoneDetails();
    if (!zones || zones.length === 0) {
      throw new ApiError(httpStatus.NOT_FOUND, 'No zone found');
    }
    zone = zones.find((z) => z.clientId) || zones[0];
  }

  const clientId = zone.clientId ? zone.clientId.toString() : zone.clientId;
  if (!clientId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Zone has no clientId');
  }

  const rental = await Rental.find({ clientId, zoneId: zone._id }).populate({
    path: 'vehiclePrices.vehicleId',
    model: 'Vehicle',
  });

  if (!rental || rental.length === 0) {
    const data = {
      minHr: 0,
      maxHr: 0,
      minKm: 0,
      maxKm: 0,
      biddingZone: 'no',
      zone: !!zone,
      paymentTypes: zone.paymentTypes || [],
      package: [],
    };
    return data;
  }

  minKm = Math.min(...rental.map((r) => r.km || 0));
  maxKm = Math.max(...rental.map((r) => r.km || 0));
  minHr = Math.min(...rental.map((r) => r.hour || 0));
  maxHr = Math.max(...rental.map((r) => r.hour || 0));

  // If a promo is provided, resolve the user so promo limits can be applied
  let user = null;
  if (req.body && req.body.promo_code) {
    const userId = await getUserId(req);
    user = await User.findById(userId);
    if (!user) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Unauthorized');
    }
  }

  const transformedRentals = await Promise.all(
    rental.map(async (rentalItem) => {
      const vehiclePricesWithPromo = await Promise.all(
        rentalItem.vehiclePrices.map(async (vehiclePrice) => {
          const img = vehiclePrice.vehicleId?.image;
          const imageUrl = img
            ? (img.startsWith('/') ? img : img.startsWith('uploads') ? `/${img}` : `${baseUrl}/${img.replace(/^\/+/, '')}`)
            : null;
          const highlightImg = vehiclePrice.vehicleId?.highlightImage;
          const highlightImageUrl = highlightImg
            ? (highlightImg.startsWith('/') ? highlightImg : highlightImg.startsWith('uploads') ? `/${highlightImg}` : `${baseUrl}/${highlightImg.replace(/^\/+/, '')}`)
            : null;

          let promoAmount = 0;
          let finalPrice = vehiclePrice.price;

          if (req.body && req.body.promo_code && user) {
            const discountedTotal = await applyPromoCode(req, vehiclePrice.price, user);
            // promoAmount = discount value; finalPrice = price after discount
            promoAmount = vehiclePrice.price - discountedTotal;
            finalPrice = discountedTotal;
          }

          return {
            vehicleId: vehiclePrice.vehicleId?._id?.toString() || vehiclePrice.vehicleId,
            image: imageUrl,
            highlightImage: highlightImageUrl,
            vehicleName: vehiclePrice.vehicleId?.vehicleName || null,
            capacity: vehiclePrice.vehicleId?.capacity ?? null,
            status: vehiclePrice.vehicleId?.status ?? null,
            promoAmount: promoAmount,
            price: finalPrice,
            graceTime: vehiclePrice.graceTime,
            extraKmPrice: vehiclePrice.extraKmPrice,
            _id: vehiclePrice._id,
          };
        })
      );
      return {
        ...rentalItem.toObject(),
        vehiclePrices: vehiclePricesWithPromo,
      };
    })
  );

  const data = {
    minHr,
    maxHr,
    minKm,
    maxKm,
    biddingZone: zone.biddingZone || 'no',
    zone: true,
    paymentTypes: zone.paymentTypes || [],
    package: transformedRentals,
  };
  return data;
};

/**
 * Update rental by id
 * @param {ObjectId} rentalId
 * @param {Object} updateBody
 * @returns {Promise<Rental>}
 */
const updateRentalById = async (rentalId, updateBody) => {
  const rental = await getRentalById(rentalId);
  if (!rental) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Rental not found');
  }

  Object.assign(rental, updateBody);
  await rental.save();
  return rental;
};

/**
 * Delete rental by id
 * @param {ObjectId} rentalId
 * @returns {Object}
 */
const deleteRentalById = async (rentalId) => {
  const rental = await getRentalById(rentalId);
  if (!rental) {
    return { status: httpStatus.NOT_FOUND, msg: "Package not found" };
  }

  //chk whether package exists in request table

  const request = await Request.countDocuments({ packageId: new ObjectId(rental._id) });

  if (request > 0) {
    return { status: httpStatus.FORBIDDEN, msg: "This package is used in trip.so you cannot delete it." };
  }

  await rental.deleteOne();
  return { status: HttpStatusCode.Ok, msg: "data Deleted Successfully" };
};

/**
 * Get roles
  * @param {ObjectId} clientId
 * @returns {Promise<Role>}
 */
const getDropDowns = async (clientId) => {

  const countryData = await Country.find({ status: true, clientId: clientId });
  const zoneData = await Zone.find({ status: true, clientId: clientId });

  const vehicleData = await Vehicle.find({ status: true, clientId: clientId });

  const data = {
    country: countryData,
    zone: zoneData,
    vehicle: vehicleData,
  }


  return data;
};
const countRentalDocuments = async () => {
  return Rental.countDocuments();
};

const getZones = async (clientId) => {
  const zone = await Zone.find({ clientId: clientId }).select('_id zoneName zoneLevel status');
  return zone;
};

const getRentalPackagesByZone = async(req) => {
  const zoneId = req.params.zoneId;
  if (!req.headers.clientid) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ClientID not found');
  } else {
    clientId = req.headers.clientid;
  }

  const zone = await Zone.findById(new ObjectId(zoneId));
  if(!zone)
  {
    throw new ApiError(httpStatus.NOT_FOUND, 'Zone not found');
  }

  const rental = await Rental.find({ clientId: clientId, zoneId: zone._id,status: true }).populate([
    {
      path: 'vehiclePrices.vehicleId',
      model: 'Vehicle',
    },
    {
      path: 'zoneId',
      model: 'Zone'
    }
  ]);

  if(!rental)
  {
    throw new ApiError(httpStatus.NOT_FOUND, 'Rental package not found');
  }

  return rental;
};


module.exports = {
  createRental,
  getRental,
  queryRental,
  getRentalById,
  updateRentalById,
  deleteRentalById,
  getDropDowns,
  getPackages,
  getPackagesWeb,
  countRentalDocuments,
  getZones,
  getRentalPackagesByZone
};
