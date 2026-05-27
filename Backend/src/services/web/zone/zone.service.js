const httpStatus = require('http-status').default || require('http-status').status || require('http-status');
const ApiError = require('../../../utils/ApiError');
const { Zone, ZonePrice, ZoneSurgePrice,Driver,Request,GroupDocument,Document,PromoCode,Role } = require('../../../models');
const { tokenService } = require('../../../services');

const { getUserById,getClientId,getZoneId } = require('../../../utils/commonFunction');
const { getZoneCache, setZoneCache, invalidateZoneCache } = require('../../../utils/cache');

const ObjectId = require('mongoose').Types.ObjectId
const { HttpStatusCode } = require('axios');
const ROLE_CACHE_TTL_MS = 2 * 60 * 1000;
const roleFlagsCache = new Map();

const getRoleCacheKey = (roleIds = []) =>
  roleIds
    .map((id) => String(id))
    .sort()
    .join(',');

/**
 * PRIMARY zones have no parent; SECONDARY may omit selection in the UI.
 * Empty string cannot be cast to ObjectId — use null so Mongoose accepts the document.
 */
const normalizePrimaryZoneId = (zoneBody) => {
  if (!zoneBody || typeof zoneBody !== 'object') return;
  const raw = zoneBody.primaryZoneId;
  if (zoneBody.zoneLevel === 'PRIMARY' || raw == null || String(raw).trim() === '') {
    zoneBody.primaryZoneId = null;
  }
};

const ensureProfileImageDocumentForGroup = async (groupDocumentId, zoneDoc) => {
  const existingDocument = await Document.findOne({
    documentId: groupDocumentId,
    documentName: 'Profile Image',
  }).select('_id required imageRequired status identifier expiryDate issueDate');

  if (!existingDocument) {
    await Document.create({
      documentName: 'Profile Image',
      required: true,
      identifier: false,
      expiryDate: false,
      issueDate: false,
      imageRequired: true,
      documentId: groupDocumentId,
      status: true,
      clientId: zoneDoc.clientId || null,
    });
    return;
  }

  let shouldSave = false;
  if (existingDocument.required !== true) {
    existingDocument.required = true;
    shouldSave = true;
  }
  if (existingDocument.imageRequired !== true) {
    existingDocument.imageRequired = true;
    shouldSave = true;
  }
  if (existingDocument.status !== true) {
    existingDocument.status = true;
    shouldSave = true;
  }

  if (shouldSave) {
    await existingDocument.save();
  }
};

const ensureDriverGroupDocumentForPrimaryZone = async (zoneDoc) => {
  if (!zoneDoc || zoneDoc.zoneLevel !== 'PRIMARY') return;

  const existingGroupDoc = await GroupDocument.findOne({
    zoneId: zoneDoc._id,
    name: 'Driver',
    type: 'driver',
  }).select('_id');

  let groupDoc = existingGroupDoc;

  if (!groupDoc) {
    groupDoc = await GroupDocument.create({
      name: 'Driver',
      type: 'driver',
      status: true,
      zoneId: zoneDoc._id,
      clientId: zoneDoc.clientId || null,
    });
  }

  await ensureProfileImageDocumentForGroup(groupDoc._id, zoneDoc);
};

const getUserRole = async (roleIds) => {
  const cacheKey = getRoleCacheKey(roleIds);
  const cached = roleFlagsCache.get(cacheKey);

  if (cached && Date.now() < cached.expiresAt) {
    return cached.value;
  }

  const roles = await Role.find({ _id: { $in: roleIds } }).select('role').lean();
  const roleNames = roles.map((r) => r.role);
  const isClient = roleNames.includes('Client');
  const isAdmin = roleNames.includes('Admin');
  const roleFlags = { isClient, isAdmin };

  roleFlagsCache.set(cacheKey, { value: roleFlags, expiresAt: Date.now() + ROLE_CACHE_TTL_MS });

  return roleFlags;
};


/**
 * Create a zone
 * @param {Object} zoneBody
 * @returns {Promise<Zone>}
 */
const createZone = async (zoneBody) => {
  normalizePrimaryZoneId(zoneBody);
  const zone = await Zone.create(zoneBody);
  await ensureDriverGroupDocumentForPrimaryZone(zone);
  if (zone.clientId) invalidateZoneCache(String(zone.clientId));
  return zone;
};


/**
 * Create a zone
 * @param {Object} zoneBody
 * @returns {Promise<Zone>}
 */
const zoneCreate = async (zoneBody) => {
  normalizePrimaryZoneId(zoneBody);
  const zone = await Zone.create(zoneBody);
  await ensureDriverGroupDocumentForPrimaryZone(zone);
  if (zone.clientId) invalidateZoneCache(String(zone.clientId));

  return zone;
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
    const zoneId = await getZoneId(req);

    const results = await Zone.aggregate([
      {
        $match: {
          _id: new ObjectId(zoneId),
          clientId: new ObjectId(clientId),
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


const getSecondaryZone = async (req) => {

  try {
    const clientId = await getClientId(req);
    const zoneId = await getZoneId(req);

    const results = await Zone.aggregate([
      {
        $match: {
          primaryZoneId: new ObjectId(zoneId),
          clientId: new ObjectId(clientId),
          zoneLevel: "SECONDARY",
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
          status: true
        
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

const getPrimaryZoneMenu = async (req) => {
  try {
    const clientId = await getClientId(req);
    const user = req.user || (await getUserById(req));
    const { isClient } = await getUserRole(user.roleIds); // Get user roles
    const userId = String(user?._id || user?.id || '');
    const cacheKey = `${String(clientId)}:primaryZoneMenu:${userId}`;
    const cachedResult = getZoneCache(cacheKey);

    if (cachedResult) {
      return cachedResult;
    }

    let results;

    if (isClient) {
      // If the user is a client, return all primary zones for the clientId.
      results = await Zone.find(
        {
          clientId: new ObjectId(clientId),
          zoneLevel: 'PRIMARY',
        },
        {
          _id: 1,
          zoneName: 1,
          primaryZoneId: 1,
          zoneLevel: 1,
          mapZone: 1,
        }
      ).lean();
    } else {
      // Normalize zoneId to always be an array
      const zoneIds = Array.isArray(user.zoneId)
        ? user.zoneId
        : user.zoneId
        ? [user.zoneId]
        : [];

      // If no zoneIds assigned, return empty array early
      if (zoneIds.length === 0) {
        return [];
      }

      const normalizedZoneIds = zoneIds
        .map((zoneId) => {
          if (zoneId instanceof ObjectId) return zoneId;
          if (typeof zoneId === 'string' && ObjectId.isValid(zoneId)) return new ObjectId(zoneId);
          return null;
        })
        .filter(Boolean);

      if (normalizedZoneIds.length === 0) {
        return [];
      }

      results = await Zone.find(
        {
          _id: { $in: normalizedZoneIds },
          zoneLevel: 'PRIMARY',
          status: true,
        },
        {
          _id: 1,
          zoneName: 1,
          primaryZoneId: 1,
          zoneLevel: 1,
          mapZone: 1,
        }
      ).lean();
    }

    setZoneCache(cacheKey, results);

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
    const zoneId = await getZoneId(req);
    const limit = parseInt(options.limit, 10) || 10;
    const page = parseInt(options.page, 10) || 1;

    // First, get the total count of documents matching the criteria
    const totalResults = await Zone.countDocuments({
      clientId: new ObjectId(clientId),
      $or:[{_id: new ObjectId(zoneId)},{primaryZoneId: new ObjectId(zoneId)}]
    });

    const results = await Zone.aggregate([
      {
        $match: { 
          clientId: new ObjectId(clientId),
          $or:[{_id: new ObjectId(zoneId)},{primaryZoneId: new ObjectId(zoneId)}]
        }
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
const getActiveZone = async (filter, options) => {

  try {
    filter.status = true
    filter.zoneLevel = 'PRIMARY'
    const results = await Zone.paginate(filter, options)
    return results
  
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
      $lookup: {
        from: 'zones',
        let: { rootZoneId: '$_id', rootClientId: '$clientId' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$primaryZoneId', '$$rootZoneId'] },
                  { $eq: ['$clientId', '$$rootClientId'] },
                  { $eq: ['$zoneLevel', 'SECONDARY'] },
                ],
              },
            },
          },
          {
            $project: {
              _id: 1,
              zoneName: 1,
              primaryZoneId: 1,
              zoneLevel: 1,
              mapZone: 1,
              status: 1,
              unit: 1,
              paymentTypes: 1,
              country: 1,
              currency: 1,
            },
          },
        ],
        as: 'secondaryZones',
      },
    },
    /** Do not $unwind vehicleDetails — that duplicated one document per vehicle. */
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
          $map: {
            input: { $ifNull: ['$vehicleDetails', []] },
            as: 'vd',
            in: {
              vehicleName: '$$vd.vehicleName',
              image: '$$vd.image',
              capacity: '$$vd.capacity',
              serviceType: '$$vd.serviceType',
              categoryId: '$$vd.categoryId',
              highlightImage: '$$vd.highlightImage',
              status: '$$vd.status',
              id: '$$vd._id',
            },
          },
        },
        secondaryZones: { $ifNull: ['$secondaryZones', []] },
      },
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
        ridenowBasePrice: priceDetail.ridenowBasePrice?.toString(),
        ridenowPricePerTime: priceDetail.ridenowPricePerTime,
        ridenowBaseDistance: priceDetail.ridenowBaseDistance,
        ridenowPricePerDistance: priceDetail.ridenowPricePerDistance?.toString(),
        ridenowFreeWaitingTime: priceDetail.ridenowFreeWaitingTime,
        ridenowFreeWaitingTimeAfterStart: priceDetail.ridenowFreeWaitingTimeAfterStart,
        ridenowWaitingCharge: priceDetail.ridenowWaitingCharge?.toString(),
        ridenowCancellationFeeAfterAccept: priceDetail.ridenowCancellationFeeAfterAccept?.toString(),
        ridenowCancellationFeeAfterArrive: priceDetail.ridenowCancellationFeeAfterArrive?.toString(),
        ridenowCancellationFeeAfterStart: priceDetail.ridenowCancellationFeeAfterStart?.toString(),
        ridenowAdminCommissionType: priceDetail.ridenowAdminCommissionType,
        ridenowAdminCommission: priceDetail.ridenowAdminCommission?.toString(),
        ridelaterBasePrice: priceDetail.ridelaterBasePrice?.toString(),
        ridelaterPricePerTime: priceDetail.ridelaterPricePerTime,
        ridelaterBaseDistance: priceDetail.ridelaterBaseDistance,
        ridelaterPricePerDistance: priceDetail.ridelaterPricePerDistance?.toString(),
        ridelaterFreeWaitingTime: priceDetail.ridelaterFreeWaitingTime,
        ridelaterFreeWaitingTimeStart: priceDetail.ridelaterFreeWaitingTimeStart,
        ridelaterWaitingCharge: priceDetail.ridelaterWaitingCharge?.toString(),
        ridelaterCancellationFeeAfterAccept: priceDetail.ridelaterCancellationFeeAfterAccept?.toString(),
        ridelaterCancellationFeeAfterArrive: priceDetail.ridelaterCancellationFeeAfterArrive?.toString(),
        ridelaterCancellationFeeAfterStart: priceDetail.ridelaterCancellationFeeAfterStart?.toString(),
        ridelaterAdminCommissionType: priceDetail.ridelaterAdminCommissionType,
        ridelaterAdminCommission: priceDetail.ridelaterAdminCommission?.toString(),
        status: priceDetail.status,
        createdBy: priceDetail.createdBy,
        createdAt: priceDetail.createdAt,
        updatedAt: priceDetail.updatedAt,
      };
    });

    const zoneSurgePriceGrouped = groupBy(zone.zoneSurgePriceDetails, 'vehicleId');

    const rawVehicles = Array.isArray(zone.vehicleDetails) ? zone.vehicleDetails : [];
    const vehicleTypes = rawVehicles
      .filter((v) => v && (v.vehicleName || v.id))
      .map((vehicleDetail) => ({
        id: vehicleDetail.id,
        vehicleName: vehicleDetail.vehicleName,
        image: vehicleDetail.image,
        capacity: vehicleDetail.capacity,
        serviceType: vehicleDetail.serviceType,
        categoryId: vehicleDetail.categoryId,
        highlightImage: vehicleDetail.highlightImage,
        status: vehicleDetail.status,
      }));

    /** Legacy: single `vehicleDetails` object (first vehicle) for older clients. */
    const vehicleDetailsLegacy = vehicleTypes[0] ?? null;

    return {
      ...zone,
      zonePriceDetails: zonePriceGrouped,
      zoneSurgePriceDetails: zoneSurgePriceGrouped,
      vehicleTypes,
      vehicleDetails: vehicleDetailsLegacy,
    };
  });

  return transformedData;
};

const getZoneVehicle = async (id) => {
  const aggregation = [
    {
      $match: { _id: new ObjectId(id) }
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
        from: 'vehicles',
        localField: 'zonePriceDetails.vehicleId',
        foreignField: '_id',
        as: 'vehicleDetails',
      },
    },
    {
      $unwind: {
        path: '$vehicleDetails',
        preserveNullAndEmptyArrays: false, // If no vehicle match, skip
      },
    },
    {
      $project: {
        vehicleDetails: {
          id: '$vehicleDetails._id',
          vehicleName: '$vehicleDetails.vehicleName',
          capacity: '$vehicleDetails.capacity',
        }
      }
    }
  ];

  const responseData = await Zone.aggregate(aggregation).exec();

  // Deduplicate vehicle types by vehicleName
  const vehicleMap = new Map();
  responseData.forEach(zone => {
    const vehicle = zone.vehicleDetails;
    if (vehicle && !vehicleMap.has(vehicle.vehicleName)) {
      vehicleMap.set(vehicle.vehicleName, vehicle);
    }
  });

  return Array.from(vehicleMap.values());
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
  if (zoneUpdate.clientId) invalidateZoneCache(String(zoneUpdate.clientId));
  return zoneUpdate;
};





const getDropDowns = async (clientId, zoneId) => {
  // build a base filter on clientId
  const filter= { clientId };
 
  // if a zoneId was passed, only match that one
  if (zoneId) {
    // cast to ObjectId so it matches your _id field
    filter._id = new ObjectId(zoneId);
  }

  const zonedata = await Zone.find(filter);

  return {
    zone: zonedata.map(zone => ({
      id: zone._id,
      zoneName: zone.zoneName,
      currency_symbol: zone.currency,
    })),
  };
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
  if (zone.clientId) invalidateZoneCache(String(zone.clientId));
  return { status: HttpStatusCode.Ok, msg: "data Deleted Successfully" };
};


const getZoneListByZoneId = async (zoneId)=>{
  if (!ObjectId.isValid(zoneId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid zoneId');
  }
  const zones = await Zone.find({ $or: [{ _id: zoneId }, { primaryZoneId: zoneId }] });

  return zones;
}

module.exports = {
  createZone,
  zoneCreate,
  queryZone,
  getZoneById,
  getZone,
  getDropDowns,
  getZoneListByZoneId,
  updateZoneById,
  deleteZoneById,
  getCategoryByIdUpdate,
  getZoneWithOutPagination,
  getPrimaryZone,
  getPrimaryZoneMenu,
  getSecondaryZone,
  getZoneVehicle,
  getActiveZone
};
