const httpStatus = require('http-status');
const ApiError = require('../../../utils/ApiError');
const { Zone, ZonePrice, ZoneSurgePrice,Driver,Request,GroupDocument,PromoCode } = require('../../../models');
const ObjectId = require('mongoose').Types.ObjectId
const { HttpStatusCode } = require('axios');


const getClientId = async (req) => {
  clientId = '';
  if (!req.headers.clientid) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ClientID not found');
  } else {
    clientId = req.headers.clientid;
  }
  return clientId;
}

/**
 * Create a zone
 * @param {Object} zoneBody
 * @returns {Promise<Zone>}
 */
const createZone = async (zoneBody) => {
  return Zone.create(zoneBody);
};


/**
 * Create a zone
 * @param {Object} zoneBody
 * @returns {Promise<Zone>}
 */
const zoneCreate = async (zoneBody) => {
  return Zone.create(zoneBody);
};


/**
 * Query for zones
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryZone = async (filter, options) => {
  const zone = await Zone.paginate(filter, options);
  return zone;
};


/**
 * Get Category by id
 * @param {ObjectId} zoneId
 * @returns {Promise<Zone>}
 */
const getCategoryByIdUpdate = async (zoneId) => {
  return Zone.findById(zoneId);
};




/**
 * @returns {Promise<Zone>}
 */
const getZoneWithOutPagination = async (req) => {

  try {
    const clientId = await getClientId(req);

    const results = await Zone.aggregate([
      {
        $match: {
          clientId: new ObjectId(clientId),
          status:true
        }
      },
      {
        $project: {
          _id: 1,
          zoneName: 1,
          primaryZoneId: 1,
          zoneLevel: 1,
          mapZone:1,
          currency:1
        },
      },
    ]);

    return results;
  } catch (error) {
    console.error('Error in aggregation:', error);
    throw error;
  }
};



/**
 * @returns {Promise<Zone>}
 */
const getPrimaryZone = async (req) => {

  try {
    const clientId = await getClientId(req);

    const results = await Zone.aggregate([
      {
        $match: {
          clientId: new ObjectId(clientId),
          zoneLevel: "PRIMARY"
        }
      },
      {
        $project: {
          _id: 1,
          zoneName: 1,
          primaryZoneId: 1,
          zoneLevel: 1,
          mapZone:1
        },
      },
    ]);

    return results;
  } catch (error) {
    console.error('Error in aggregation:', error);
    throw error;
  }
};



/**
 * @returns {Promise<Zone>}
 */
const getZone = async (req, filter, options) => {

  try {
    const clientId = await getClientId(req);
    const limit = parseInt(options.limit, 10) || 10;
    const page = parseInt(options.page, 10) || 1;

    // First, get the total count of documents matching the criteria
    const totalResults = await Zone.countDocuments({
      clientId: new ObjectId(clientId),
    });

    const results = await Zone.aggregate([
      {
        $match: { clientId: new ObjectId(clientId) }
      },
      {
        $lookup: {
          from: 'countries', // Collection name of Country (use lowercase and plural if it's defined like this in MongoDB)
          localField: 'country',
          foreignField: '_id',
          as: 'countrydetails',
        },
      },
      {
        $unwind: '$countrydetails', // Unwind to get a single country object instead of an array
      },
      {
        $project: {
          _id: 1,
          zoneName: 1,
          primaryZoneId: 1,
          country: 1,
          adminCommissionType: 1,
          adminCommission: 1,
          mapZone: 1,
          paymentTypes: 1,
          nonServiceZone: 1,
          biddingZone: 1,
          zoneLevel: 1,
          unit: 1,
          typesId: 1,
          createdBy: 1,
          clientId: 1,
          status: 1,
          currency: 1,
          'countrydetails.name': 1,
          'countrydetails.currency_name': 1,
          'countrydetails.currency_code': 1,
          'countrydetails.currency_symbol': 1,
          'countrydetails.capital': 1,
        },
      },
    ]).sort(options.sortBy || { _id: 1 })
      .skip((page - 1) * limit)
      .limit(limit);

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


/**
 * @param {ObjectId} id
 * @returns {Promise<Zone>}
 */
const getZoneById = async (id) => {

  const groupBy = (arr, key) => {
    return arr.reduce((result, item) => {
      (result[item[key]] = result[item[key]] || []).push(item);
      return result;
    }, {});
  };

  const aggregation = [
    {
      $match: { _id: new ObjectId(id) }
    },
    {
      $lookup: {
        from: 'countries',
        localField: 'country',
        foreignField: '_id',
        as: 'countrydetails',
      },
    },
    {
      $unwind: '$countrydetails',
    },
    {
      $lookup: {
        from: 'zoneprices',
        localField: '_id',
        foreignField: 'zoneId',
        as: 'zonePriceDetails',
      },
    },
    {
      $lookup: {
        from: 'zonesurgeprices',
        localField: '_id',
        foreignField: 'zoneId',
        as: 'zoneSurgePriceDetails',
      },
    },
    {
      $lookup: {
        from: 'vehicles',
        localField: 'zonePriceDetails.vehicleId',
        foreignField: '_id',
        as: 'vehicleDetails',
      },
    },
    {
      $unwind: {
        path: '$vehicleDetails',
        preserveNullAndEmptyArrays: true, // In case there's no vehicle match
      },
    },
    {
      $project: {
        _id: 1,
        zoneName: 1,
        primaryZoneId: 1,
        country: 1,
        adminCommissionType: 1,
        adminCommission: 1,
        mapZone: 1,
        unit:1,
        paymentTypes: 1,
        nonServiceZone: 1,
        biddingZone: 1,
        zoneLevel: 1,
        typesId: 1,
        createdBy: 1,
        clientId: 1,
        status: 1,
        currency:1,
        'countrydetails.name': 1,
        'countrydetails.currency_name': 1,
        'countrydetails.currency_code': 1,
        'countrydetails.currency_symbol': 1,
        'countrydetails.capital': 1,
        zonePriceDetails: {
          $map: {
            input: '$zonePriceDetails',
            as: 'priceDetail',
            in: {
              _id: '$$priceDetail._id',
              zoneId: '$$priceDetail.zoneId',
              vehicleId: '$$priceDetail.vehicleId',
              ridenowBasePrice: { $toDouble: '$$priceDetail.ridenowBasePrice' },
              ridenowPricePerTime: '$$priceDetail.ridenowPricePerTime',
              ridenowBaseDistance: '$$priceDetail.ridenowBaseDistance',
              ridenowPricePerDistance: { $toDouble: '$$priceDetail.ridenowPricePerDistance' },
              ridenowFreeWaitingTime: '$$priceDetail.ridenowFreeWaitingTime',
              ridenowFreeWaitingTimeAfterStart: '$$priceDetail.ridenowFreeWaitingTimeAfterStart',
              ridenowWaitingCharge: { $toDouble: '$$priceDetail.ridenowWaitingCharge' },
              ridenowCancellationFeeAfterAccept: { $toDouble: '$$priceDetail.ridenowCancellationFeeAfterAccept' },
              ridenowCancellationFeeAfterArrive: { $toDouble: '$$priceDetail.ridenowCancellationFeeAfterArrive' },
              ridenowCancellationFeeAfterStart: { $toDouble: '$$priceDetail.ridenowCancellationFeeAfterStart' },
              ridenowAdminCommissionType: '$$priceDetail.ridenowAdminCommissionType',
              ridenowAdminCommission: '$$priceDetail.ridenowAdminCommission',
              ridelaterBasePrice: { $toDouble: '$$priceDetail.ridelaterBasePrice' },
              ridelaterPricePerTime: '$$priceDetail.ridelaterPricePerTime',
              ridelaterBaseDistance: '$$priceDetail.ridelaterBaseDistance',
              ridelaterPricePerDistance: { $toDouble: '$$priceDetail.ridelaterPricePerDistance' },
              ridelaterFreeWaitingTime: '$$priceDetail.ridelaterFreeWaitingTime',
              ridelaterFreeWaitingTimeStart: '$$priceDetail.ridelaterFreeWaitingTimeStart',
              ridelaterWaitingCharge: { $toDouble: '$$priceDetail.ridelaterWaitingCharge' },
              ridelaterCancellationFeeAfterAccept: { $toDouble: '$$priceDetail.ridelaterCancellationFeeAfterAccept' },
              ridelaterCancellationFeeAfterArrive: { $toDouble: '$$priceDetail.ridelaterCancellationFeeAfterArrive' },
              ridelaterCancellationFeeAfterStart: { $toDouble: '$$priceDetail.ridelaterCancellationFeeAfterStart' },
              ridelaterAdminCommissionType: '$$priceDetail.ridelaterAdminCommissionType',
              ridelaterAdminCommission: '$$priceDetail.ridelaterAdminCommission',
              status: '$$priceDetail.status',
              createdBy: '$$priceDetail.createdBy',
              createdAt: '$$priceDetail.createdAt',
              updatedAt: '$$priceDetail.updatedAt',
            }
          }
        },
        zoneSurgePriceDetails: {
          $map: {
            input: '$zoneSurgePriceDetails',
            as: 'surgePriceDetail',
            in: {
              _id: '$$surgePriceDetail._id',
              zoneId: '$$surgePriceDetail.zoneId',
              vehicleId: '$$surgePriceDetail.vehicleId',
              surgePrice: { $toDouble: '$$surgePriceDetail.surgePrice' },
              surgeDistancePrice: { $toDouble: '$$surgePriceDetail.surgeDistancePrice' },
              startTime: '$$surgePriceDetail.startTime',
              endTime: '$$surgePriceDetail.endTime',
              availableDays: '$$surgePriceDetail.availableDays',
              status: '$$surgePriceDetail.status',
              createdBy: '$$surgePriceDetail.createdBy',
              createdAt: '$$surgePriceDetail.createdAt',
              updatedAt: '$$surgePriceDetail.updatedAt',
            }
          }
        },
        vehicleDetails: {
          vehicleName: '$vehicleDetails.vehicleName',
          image: '$vehicleDetails.image',
          capacity: '$vehicleDetails.capacity',
          serviceType: '$vehicleDetails.serviceType',
          categoryId: '$vehicleDetails.categoryId',
          highlightImage: '$vehicleDetails.highlightImage',
          status: '$vehicleDetails.status',
          id: '$vehicleDetails._id',
        }
      }
    },
  ];

  const responseData = await Zone.aggregate(aggregation).exec();


  const transformedData = responseData.map(zone => {
    const zonePriceGrouped = {};
    zone.zonePriceDetails.forEach(priceDetail => {
      zonePriceGrouped[priceDetail.vehicleId] = {
        _id: priceDetail._id,
        zoneId: priceDetail.zoneId,
        unit:zone.unit,
        vehicleId: priceDetail.vehicleId,
        ridenowBasePrice: priceDetail.ridenowBasePrice.toString(),
        ridenowPricePerTime: priceDetail.ridenowPricePerTime,
        ridenowBaseDistance: priceDetail.ridenowBaseDistance,
        ridenowPricePerDistance: priceDetail.ridenowPricePerDistance.toString(),
        ridenowFreeWaitingTime: priceDetail.ridenowFreeWaitingTime,
        ridenowFreeWaitingTimeAfterStart: priceDetail.ridenowFreeWaitingTimeAfterStart,
        ridenowWaitingCharge: priceDetail.ridenowWaitingCharge.toString(),
        ridenowCancellationFeeAfterAccept: priceDetail.ridenowCancellationFeeAfterAccept.toString(),
        ridenowCancellationFeeAfterArrive: priceDetail.ridenowCancellationFeeAfterArrive.toString(),
        ridenowCancellationFeeAfterStart: priceDetail.ridenowCancellationFeeAfterStart.toString(),
        ridenowAdminCommissionType: priceDetail.ridenowAdminCommissionType,
        ridenowAdminCommission: priceDetail.ridenowAdminCommission.toString(),
        ridelaterBasePrice: priceDetail.ridelaterBasePrice.toString(),
        ridelaterPricePerTime: priceDetail.ridelaterPricePerTime,
        ridelaterBaseDistance: priceDetail.ridelaterBaseDistance,
        ridelaterPricePerDistance: priceDetail.ridelaterPricePerDistance.toString(),
        ridelaterFreeWaitingTime: priceDetail.ridelaterFreeWaitingTime,
        ridelaterFreeWaitingTimeStart: priceDetail.ridelaterFreeWaitingTimeStart,
        ridelaterWaitingCharge: priceDetail.ridelaterWaitingCharge.toString(),
        ridelaterCancellationFeeAfterAccept: priceDetail.ridelaterCancellationFeeAfterAccept.toString(),
        ridelaterCancellationFeeAfterArrive: priceDetail.ridelaterCancellationFeeAfterArrive.toString(),
        ridelaterCancellationFeeAfterStart: priceDetail.ridelaterCancellationFeeAfterStart.toString(),
        ridelaterAdminCommissionType: priceDetail.ridelaterAdminCommissionType,
        ridelaterAdminCommission: priceDetail.ridelaterAdminCommission.toString(),
        status: priceDetail.status,
        createdBy: priceDetail.createdBy,
        createdAt: priceDetail.createdAt,
        updatedAt: priceDetail.updatedAt,
      };
    });

    const zoneSurgePriceGrouped = groupBy(zone.zoneSurgePriceDetails, 'vehicleId');

    const convertToVehicleTypes = (responseData) => {
      const vehicleMap = new Map();
      responseData.forEach(zone => {
        const vehicleDetail = zone.vehicleDetails;
        if (!vehicleMap.has(vehicleDetail.vehicleName)) {
          vehicleMap.set(vehicleDetail.vehicleName, {
            id: vehicleDetail.id,
            vehicleName: vehicleDetail.vehicleName,
            image: vehicleDetail.image,
            capacity: vehicleDetail.capacity,
            serviceType: vehicleDetail.serviceType,
            categoryId: vehicleDetail.categoryId,
            highlightImage: vehicleDetail.highlightImage,
            status: vehicleDetail.status,
          });
        }
      });

      return Array.from(vehicleMap.values());
    };

    const vehicleTypes = convertToVehicleTypes(responseData);

    return {
      ...zone,
      zonePriceDetails: zonePriceGrouped,
      zoneSurgePriceDetails: zoneSurgePriceGrouped,
      vehicleTypes: vehicleTypes
    };
  });

  return transformedData;
};

/**
 * Update role by id
 * @param {ObjectId} zoneId
 * @param {Object} updateBody
 * @returns {Promise<Zone>}
 */
const updateZoneById = async (zoneId, updateBody) => {
  const zoneUpdate = await getCategoryByIdUpdate(zoneId);
  if (!zoneUpdate) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Zone not found');
  }

  Object.assign(zoneUpdate, updateBody);
  await zoneUpdate.save();
  return zoneUpdate;
};

const getDropDowns = async (clientId) => {
  const zonedata = await Zone.find({ clientId: clientId });

  const data = {
    zone: zonedata.map(zone => ({
      id: zone._id,
      zoneName: zone.zoneName,
      currency_symbol: zone.currency,
    })),
  };

  return data;
};



/**
 * Delete groupDocument by id
 * @param {ObjectId} zoneId
 * @returns {Object}
 */
const deleteZoneById = async (zoneId) => {
  const zone = await getCategoryByIdUpdate(zoneId);

  if (!zone) {
    return { status: httpStatus.NOT_FOUND, msg: "Zone not found" };
  }

  const zonePrice = await ZonePrice.find({zoneId: zone._id}).select('_id').exec();
  const priceIds = zonePrice.map(zonePrice => zonePrice._id.toString());

  //chk whether driver registered in this zone
  const driverZone = await Driver.countDocuments({serviceLocation: new ObjectId(zone._id)});
  if(driverZone > 0)
  {
    return { status: httpStatus.FORBIDDEN, msg: "Sorry!. Drivers are registered under this zone.so cannot delete this zone..." };
  }

  //chk whether any documents available in this zone
  const groupDocuments = await GroupDocument.countDocuments({zoneId: new ObjectId(zone._id)});
  if(groupDocuments > 0)
  {
    return { status: httpStatus.FORBIDDEN, msg: "Sorry!. Some driver documents are added under this zone.so cannot delete this zone..." };
  }

  //chk whether any promo added under this zone
  const promo = await PromoCode.countDocuments({zoneId: new ObjectId(zone._id)});
  if(promo > 0)
  {
    return { status: httpStatus.FORBIDDEN, msg: "Sorry!. Promo code are added under this zone.so cannot delete this zone..." };
  }

  //chk whether any request exists under this zone
  const request = await Request.countDocuments({ zoneTypeId: { $in:priceIds }});
  if(request > 0)
  {
    return { status: httpStatus.FORBIDDEN, msg: "Sorry!. Already have a trip in this zone.so cannot delete this zone..." };
  }

  const filter = { zoneId: zoneId };
  await ZonePrice.deleteMany(filter);
  await ZoneSurgePrice.deleteMany(filter);

  await zone.deleteOne();
  return { status: HttpStatusCode.Ok, msg: "data Deleted Successfully" };
};

module.exports = {
  createZone,
  zoneCreate,
  queryZone,
  getZoneById,
  getZone,
  getDropDowns,
  updateZoneById,
  deleteZoneById,
  getCategoryByIdUpdate,
  getZoneWithOutPagination,
  getPrimaryZone
};
