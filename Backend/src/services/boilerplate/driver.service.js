const httpStatus = require('http-status');
const ApiError = require('../../utils/ApiError');
const { Driver, Vehicle, Role,Wallet,Request,DriverDocument,Users,GroupDocument,Document,User,Zone,Settings } = require('../../models');
const { driverService } = require('..');
const ObjectId = require('mongoose').Types.ObjectId
const { HttpStatusCode } = require('axios');
const { sendNotification } = require('../../utils/commonFunction');
const mqttService = require('../../services/mqtt/mqtt.service');
const moment = require('moment');

const getClientId = async (req) => {
  clientId = '';
  if (!req.headers.clientid) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ClientID not found');
  } else {
    clientId = req.headers.clientid;
  }
  return clientId;
}

const getRoleIdsByRoleName = async (roleName) => {
  const roles = await Role.find({ role: roleName });
  return roles.map((role) => new ObjectId(role.id));
};


const getCompanyId = async (req) => {
  companyId = '';
  if (!req.headers.companyid) {
    companyId = null;
  } else {
    companyId = req.headers.companyid;

  }
  return companyId;
}

/**
 * Create a driver
 * @param {Object} driverBody
 * @returns {Promise<Driver>}
 */
const createDriver = async (driverBody) => {
  return Driver.create(driverBody);
};

/**
 * Query for Drivers
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryDrivers = async (filter, options) => {
  const Drivers = await Driver.paginate(filter, options);
  return Drivers;
};

/**
 * Get Drivers
 * @returns {Promise<Driver>}
 */
const getDrivers = async () => {
  return Driver.find();
};

/**
 * Get Driver by id
 * @param {ObjectId} driverId
 * @returns {Promise<Driver>}
 */
const getDriverById = async (driverId) => {
  return Driver.findById(driverId);
};

/**
 * Get Drivers by id
 * @param {ObjectId} id
 * @returns {Promise<Driver>}
 */
const getDriversById = async (id) => {

  const aggregation = [
    {
      $match: { _id: new ObjectId(id) }, // Match by the driver's ID
    },
    {
      $lookup: {
        from: 'vehicles', // Collection name of Vehicle
        localField: 'type',
        foreignField: '_id',
        as: 'vehicle',
      },
    },
    { $unwind: { path: '$vehicle', preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: 'vehiclemodels', // Collection name of VehicleModel
        localField: 'carModel',
        foreignField: '_id',
        as: 'vehicleModel',
      },
    },
    { $unwind: { path: '$vehicleModel', preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: 'users', // Collection name of User
        localField: 'userId',
        foreignField: '_id',
        as: 'user',
      },
    },
    { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: 'companies', // Collection name of Company
        localField: 'companyId',
        foreignField: '_id',
        as: 'company',
      },
    },
    { $unwind: { path: '$company', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 1,
        type: 1,
        isAvailable: 1,
        isActive: 1,
        isApprove: 1,
        totalAccept: 1,
        totalReject: 1,
        carNumber: 1,
        carYear: 1,
        carColour: 1,
        carModel: 1,
        serviceLocation: 1,
        rejectCount: 1,
        documentUploadStatus: 1,
        referenceCount: 1,
        city: 1,
        state: 1,
        pincode: 1,
        acceptanceRatio: 1,
        serviceType: 1,
        subscriptionType: 1,
        serviceCategory: 1,
        brandLabel: 1,
        loginMethod: 1,
        approvedBy: 1,
        notes: 1,
        companyId: 1,
        vehicleName: '$vehicle.vehicleName',
        vehicleId: '$vehicle._id',
        vehicleModelName: '$vehicleModel.modelname',
        vehicleModelId: '$vehicleModel._id',
        firstName: '$user.firstName',
        lastName: '$user.lastName',
        email: '$user.email',
        address: '$user.address',
        rating: '$user.rating',
        roleid: '$user.roleIds',
        phoneNumber: '$user.phoneNumber',
        profilePic: '$user.profilePic',
        userId: '$user._id',
        companyName: '$company.companyName',
        companyId: '$company._id',
        country: '$user.countryCode',
        gender: '$user.gender'
      },
    },
  ];
  return Driver.aggregate(aggregation);
};

/**
 * Update Driver by id
 * @param {ObjectId} driverId
 * @param {Object} updateBody
 * @returns {Promise<Category>}
 */

const updateDriversById = async (driverId, updateBody) => {
  const driver = await getDriverById(driverId);
  if (!driver) {
  throw new ApiError(httpStatus.NOT_FOUND, 'Driver not found');
  }
  Object.assign(driver, updateBody);
  await driver.save();
  return driver;
};

/**
 * Delete driver by id
 * @param {ObjectId} driverId
 * @returns {Object}
 */
const deleteDriverById = async (driverId) => {
  const driver = await getDriverById(driverId);
  if (!driver) {
    return { status: httpStatus.NOT_FOUND, msg: "Driver not found" };
  }
  const driverInUser = await getUserById(driver.userId);
  if (!driverInUser) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Driver not found');
  }

  const driverRequest = await Request.countDocuments({driverId:driver._id});

  if(driverRequest > 0)
  {
    return { status: httpStatus.FORBIDDEN, msg: "The driver has trip history...so you cannot delete this driver..." };
  }

  await DriverDocument.deleteMany({driverId: new ObjectId(driver._id)});
  await driver.deleteOne();
  await Wallet.deleteOne({userId: new ObjectId(driverInUser._id)});
  await driverInUser.deleteOne();

  return { status: HttpStatusCode.Ok, msg: "Data Deleted Successfully" };
};



const aggregateDrivers = async (req, filter, options) => {
  try {
    const clientId = await getClientId(req);
    const companyId = await getCompanyId(req);
    const limit = parseInt(options.limit, 10) || 10;
    const page = parseInt(options.page, 10) || 1;

    filter = {
      ...filter,
      clientId: new ObjectId(clientId),
      ...(companyId && { companyId: new ObjectId(companyId) }),
    };

    const filterTwo = { clientId: new ObjectId(clientId) };

    if (req.query.search) {
      filterTwo.$or = [
        { firstName: { $regex: '^' + req.query.search, $options: 'i' } },
        { phoneNumber: { $regex: '^' + req.query.search, $options: 'i' } },
      ];
    }

    const countPipeline = [
      { $match: filter },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      ...(req.query.search
        ? [
            {
              $match: {
                $or: [
                  { 'user.firstName': { $regex: `^${req.query.search}`, $options: 'i' } },
                  { 'user.phoneNumber': { $regex: `^${req.query.search}`, $options: 'i' } },
                ],
              },
            },
          ]
        : []),
      { $count: 'total' },
    ];

    const countResult = await Driver.aggregate(countPipeline);
    const totalResults = countResult[0]?.total || 0;

    const results = await Driver.aggregate([
      { $match: filter },
      {
        $lookup: {
          from: 'vehicles',
          localField: 'type',
          foreignField: '_id',
          as: 'vehicle',
        },
      },
      { $unwind: { path: '$vehicle', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'wallets',
          localField: 'userId',
          foreignField: 'userId',
          as: 'walletData',
        },
      },
      { $unwind: { path: '$walletData', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'vehiclemodels',
          localField: 'carModel',
          foreignField: '_id',
          as: 'vehicleModel',
        },
      },
      { $unwind: { path: '$vehicleModel', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      ...(req.query.search
        ? [
            {
              $match: {
                $or: [
                  { 'user.firstName': { $regex: `^${req.query.search}`, $options: 'i' } },
                  { 'user.phoneNumber': { $regex: `^${req.query.search}`, $options: 'i' } },
                ],
              },
            },
          ]
        : []),
      {
        $lookup: {
          from: 'companies',
          localField: 'companyId',
          foreignField: '_id',
          as: 'company',
        },
      },
      { $unwind: { path: '$company', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'requests',
          localField: '_id',
          foreignField: 'driverId',
          as: 'requests',
        },
      },
      {
        $lookup: {
          from: 'driversubscriptions',
          localField: '_id',
          foreignField: 'driverId',
          as: 'driverSubscriptionDetails'
        }
      },
      {
        $unwind: {
          path: '$driverSubscriptionDetails',
          preserveNullAndEmptyArrays: true,
        }
      },
      {
        $lookup: {
          from: 'subscriptions',
          localField: 'driverSubscriptionDetails.subScriptionId',
          foreignField: '_id',
          as: 'SubscriptionDetails'
        }
      },
      {
        $unwind: {
          path: '$SubscriptionDetails',
          preserveNullAndEmptyArrays: true,
        }
      },
      {
        $lookup: {
          from: 'requestratings',
          let: { userId: '$userId' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$userId', '$$userId'] },
              },
            },
            {
              $group: {
                _id: '$userId',
                averageRating: { $avg: '$rating' },
              },
            },
          ],
          as: 'ratingDetails',
        },
      },
      { $unwind: { path: '$ratingDetails', preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          tripCount: { $size: '$requests' },
          isDriverSubscriptionValid: {
            $cond: {
              if: { $ifNull: ['$driverSubscriptionDetails', false] }, // Check if demoKeyDetails exists
              then: { // If demoKeyDetails exists
                $cond: {
                  if: { $gt: ['$driverSubscriptionDetails.Enddate', new Date()] }, // Check if EndDate is in future
                  then: { // If demoKeyDetails exists
                    $cond: {
                      if: { $eq: ['$driverSubscriptionDetails.status', true] }, // Check if EndDate is in future
                      then: true,
                      else: false
                    }
                  },
                  else: false
                }
              },
              else: null // If demoKeyDetails is null
            }
          },
          subscriptionName: "$SubscriptionDetails.name", // Get the subscription package name
          remainingDays: {
            $cond: [
              {
                $and: [
                  { $ifNull: ["$driverSubscriptionDetails.Enddate", false] }, // Check if Enddate exists
                  { $gt: ["$driverSubscriptionDetails.Enddate", new Date()] }  // Check if it's in future
                ]
              },
              {
                $ceil: {
                  $divide: [
                    { $subtract: ["$driverSubscriptionDetails.Enddate", new Date()] }, // milliseconds difference
                    86400000 // milliseconds in a day (1000*60*60*24)
                  ]
                }
              },
              null // Return null if no valid end date
            ]
          }
        },
      },
      {
        $project: {
          _id: 1,
          type: 1,
          isDriverSubscriptionValid: 1,
          subscriptionName: 1,
          remainingDays: 1,
          isAvailable: 1,
          isActive: 1,
          isApprove: 1,
          totalAccept: 1,
          totalReject: 1,
          carNumber: 1,
          carYear: 1,
          carModel: 1,
          carColour: 1,
          serviceLocation: 1,
          serviceType: 1,
          rejectCount: 1,
          documentUploadStatus: 1,
          referenceCount: 1,
          city: 1,
          state: 1,
          pincode: 1,
          acceptanceRatio: 1,
          subscriptionType: 1,
          serviceCategory: 1,
          companyId: 1,
          brandLabel: 1,
          loginMethod: 1,
          approvedBy: 1,
          status: 1,
          notes: 1,
          createdAt: 1,
          vehicleName: '$vehicle.vehicleName',
          vehicleId: '$vehicle._id',
          vehicleModelName: '$vehicleModel.modelname',
          vehicleModelId: '$vehicleModel._id',
          firstName: '$user.firstName',
          // lastName: '$user.lastName',
          email: '$user.email',
          rating: {
            $round: [
              { $toDouble: { $ifNull: ['$ratingDetails.averageRating', 0.0] } },
              2,
            ],
          },
          roleid: '$user.roleIds',
          phoneNumber: '$user.phoneNumber',
          profilePic: '$user.profilePic',
          userId: '$user._id',
          country: '$user.countryCode',
          companyName: '$company.companyName',
          tripCount: 1,
          completedTripCount: 1,
          cancelledTripCount: 1,
          Wallet: {
            $round: [
              { $toDouble: { $ifNull: ['$walletData.balance', 0.0] } },
              2,
            ],
          },
          completedTripCount: 1, // Include completed trip count
          cancelledTripCount: 1, // Include cancelled trip count,
          onlineBy: {
            $cond:{
              if:{$eq:['$user.onlineBy',1]},
              then: 'Online',
              else: 'Offline'
            }
          }
        },
      },
    ])
      .sort(options.sortBy || { createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const totalPages = Math.ceil(totalResults / limit);

    return {
      results,
      page,
      limit,
      totalPages,
      totalResults,
    };
  } catch (error) {
    console.error('Error in aggregation:', error);
    throw error;
  }
};


/**
 * Get roles
  * @param {ObjectId} clientId
 * @returns {Promise<Role>}
 */
const getDropDowns = async (clientId) => {

  const countryData = await Country.find({ clientId: clientId, status: true });

  const VehicleData = await Vehicle.find({ clientId: clientId });

  const updatedVehicles = VehicleData.map(vehicle => {
    if (vehicle.image) {
      vehicle.image = `/uploads/vehicles/${vehicle.image}`;
    }
    if (vehicle.highlightImage) {
      vehicle.highlightImage = `/uploads/vehicles/${vehicle.highlightImage}`;
    }
    return vehicle;
  });

  const data = {
    country: countryData,
    vehicle: updatedVehicles
  }

  return data;
};
// get Driver wallet balance
const getDriverWallet = async () => {
  try {
    // const result = await Driver.aggregate([
    //   {
    //     $lookup: {
    //       from: 'users',
    //       localField: 'userId',
    //       foreignField: '_id',
    //       as: 'userData',
    //     },
    //   },
    //   {
    //     $unwind: {
    //       path: '$userData',
    //       preserveNullAndEmptyArrays: true,
    //     },
    //   },

    //   {
    //     $lookup: {
    //       from: 'drivers',
    //       localField: 'driverId',
    //       foreignField: '_id',
    //       as: 'driverData',
    //     },
    //   },
    //   {
    //     $unwind: {
    //       path: '$driverData',
    //       preserveNullAndEmptyArrays: true,
    //     },
    //   },

    //   {
    //     $lookup: {
    //       from: 'users',
    //       localField: 'driverData.userId',
    //       foreignField: '_id',
    //       as: 'driverUserData',
    //     },
    //   },
    //   {
    //     $unwind: {
    //       path: '$driverUserData',
    //       preserveNullAndEmptyArrays: true,
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: 'wallets',
    //       localField: 'driverId',
    //       foreignField: 'driverId',
    //       as: 'walletData',
    //     },
    //   },
    //   {
    //     $unwind: {
    //       path: '$walletData',
    //       preserveNullAndEmptyArrays: true,
    //     },
    //   },
    //   {
    //     $project: {
    //       driverId: '$userData._id',
    //       driverName:'$userData.firstName',
    //       phoneNumber: '$userData.phoneNumber',
    //       walletBalance: '$walletData.balance',
    //       _id: 0,
    //     },
    //   },
    // ]);

    const result = await Wallet.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userData',
        },
      },
      {
        $unwind: {
          path: '$userData',
          preserveNullAndEmptyArrays: true,
        }
      },
      {
        $lookup: {
          from: 'countries',
          localField: 'userData.countryCode',
          foreignField: '_id',
          as: 'countryDetails'
        }
      },
      {
        $unwind: {
          path: '$countryDetails',
          preserveNullAndEmptyArrays: true,
        }
      },
      {
        $addFields: {
          roundedBalance: {
            $round: [{ $toDouble: { $ifNull: ['$balance', 0.00] } }, 2]
          }
        }
      },
      {
        $project: {
          driverId: '$userData._id',
          driverName: { $concat: ['$userData.firstName'] },
          phoneNumber: '$userData.phoneNumber',
          walletBalance: { $concat: [{ $ifNull: ['$countryDetails.currencySymbol', "₹"] }, ' ', { $toString: { $ifNull: ['$roundedBalance', 0.00] } }] },
          _id: 0,
        },
      },
    ]);
    return result;
  } catch (error) {
    console.error(error);
    throw new Error('Error fetching request data');
  }
};

const getDriverReport = async (req,filter,options,clientId) => {
  try
  {
      const { onlineBy } = req.query;
      const limit = parseInt(options.limit, 10) || 10;
      const page = parseInt(options.page, 10) || 1;

      const today = moment().format('YYYY-MM-DD');
      const yesterday = moment().subtract(1, 'days').format('YYYY-MM-DD');
      const startOfMonth = moment().startOf('month').format('YYYY-MM-DD');
      const startOfWeek = moment().subtract(7, 'days').format('YYYY-MM-DD');

      const driverRoleIds = await getRoleIdsByRoleName("Driver");

      if(onlineBy)
      {
          if(onlineBy != '')
          {
              filter.onlineBy = onlineBy == 'ONLINE' ? 1 : 0;
          }
      }

      filter.roleIds = { $in: driverRoleIds };
      filter.clientId = new ObjectId(clientId);

      const basePipeline = [
        { $match: filter},
        { $lookup: { from: 'drivers', localField: '_id', foreignField: 'userId', as: 'driver'}},
        { $unwind: {path: '$driver'} },
        { $lookup: { from: 'vehicles', localField: 'driver.type', foreignField: '_id', as: 'vehicles'}},
        { $unwind: {path: '$vehicles'} },
        {
            $lookup:{
                from: 'requests',
                localField: 'driver._id',
                foreignField: 'driverId',
                pipeline: [
                    { $group: { _id: null, completed: { $sum: { $cond: [{ $eq: ['$isCompleted', true] }, 1, 0] } }, cancelled: { $sum: { $cond: [{ $eq: ['$isCancelled', true] }, 1, 0] } } } }
                ],
                as: 'tripStatus'
            }
        },
        {
            $lookup: {
                from: 'driverlogs',
                localField: '_id',
                foreignField: 'driverId',
                pipeline: [
                    { 
                        $addFields: {
                            date: { $dateFromString: { dateString: "$date" } }, 
                            workingTime: {
                              $cond: {
                                if: { $eq: ["$workingTime", "00:00:00"] }, // If workingTime is "00:00:00"
                                then: {
                                  $let: {
                                    vars: {
                                      // Calculate the difference between current time and onlineTime
                                      currentTime: new Date(),
                                      timeDifference: { $subtract: [new Date(), "$onlineTime"] }
                                    },
                                    in: {
                                      // Convert time difference to hours, minutes, seconds
                                      $concat: [
                                        { $toString: { $floor: { $divide: ["$$timeDifference", 3600000] } } }, // Hours
                                        ":",
                                        { $toString: { $floor: { $divide: [{ $mod: ["$$timeDifference", 3600000] }, 60000] } } }, // Minutes
                                        ":",
                                        { $toString: { $floor: { $divide: [{ $mod: ["$$timeDifference", 60000] }, 1000] } } } // Seconds
                                      ]
                                    }
                                  }
                                },
                                else: {
                                $let: {
                                    vars: {
                                        timeParts: { $split: ["$workingTime", ":"] } // Split HH:MM:SS
                                    },
                                    in: {
                                        $add: [
                                            { $multiply: [{ $toInt: { $arrayElemAt: ["$$timeParts", 0] } }, 3600] }, // Hours * 3600
                                            { $multiply: [{ $toInt: { $arrayElemAt: ["$$timeParts", 1] } }, 60] },  // Minutes * 60
                                            { $toInt: { $arrayElemAt: ["$$timeParts", 2] } }                          // Seconds
                                        ]
                                    }
                                }
                              }
                              }
                            }
                        }
                    },
                    { $match: { date: { $eq: new Date(today)} } }, 
                    { $project: { _id: 0, workingTime: 1 } } 
                ],
                as: 'todayLogs'
            }
        },
        {
            $lookup: {
                from: 'driverlogs',
                localField: '_id',
                foreignField: 'driverId',
                pipeline: [
                      { 
                        $addFields: {
                            date: { $dateFromString: { dateString: "$date" } },
                            workingTime: {
                              $cond: {
                                if: { $eq: ["$workingTime", "00:00:00"] }, // If workingTime is "00:00:00"
                                then: {
                                  $let: {
                                    vars: {
                                      // Calculate the difference between current time and onlineTime
                                      currentTime: new Date(),
                                      timeDifference: { $subtract: [new Date(), "$onlineTime"] }
                                    },
                                    in: {
                                      // Convert time difference to hours, minutes, seconds
                                      $concat: [
                                        { $toString: { $floor: { $divide: ["$$timeDifference", 3600000] } } }, // Hours
                                        ":",
                                        { $toString: { $floor: { $divide: [{ $mod: ["$$timeDifference", 3600000] }, 60000] } } }, // Minutes
                                        ":",
                                        { $toString: { $floor: { $divide: [{ $mod: ["$$timeDifference", 60000] }, 1000] } } } // Seconds
                                      ]
                                    }
                                  }
                                },
                                else: {
                                  $let: {
                                      vars: {
                                          timeParts: { $split: ["$workingTime", ":"] }
                                      },
                                      in: {
                                          $add: [
                                              { $multiply: [{ $toInt: { $arrayElemAt: ["$$timeParts", 0] } }, 3600] },
                                              { $multiply: [{ $toInt: { $arrayElemAt: ["$$timeParts", 1] } }, 60] },
                                              { $toInt: { $arrayElemAt: ["$$timeParts", 2] } }
                                          ]
                                      }
                                  }
                                }
                              }
                            }
                        }
                    },
                    { $match: { date: { $eq: new Date(yesterday)} } },
                    { $project: { _id: 0, workingTime: 1 } }
                ],
                as: 'yesterdayLogs'
            }
        },
        {
            $lookup: {
                from: 'driverlogs',
                localField: '_id',
                foreignField: 'driverId',
                pipeline: [
                      { 
                        $addFields: {
                            date: { $dateFromString: { dateString: "$date" } },
                            workingTime: {
                              $cond: {
                                if: { $eq: ["$workingTime", "00:00:00"] }, // If workingTime is "00:00:00"
                                then: {
                                  $let: {
                                    vars: {
                                      // Calculate the difference between current time and onlineTime
                                      currentTime: new Date(),
                                      timeDifference: { $subtract: [new Date(), "$onlineTime"] }
                                    },
                                    in: {
                                      // Convert time difference to hours, minutes, seconds
                                      $concat: [
                                        { $toString: { $floor: { $divide: ["$$timeDifference", 3600000] } } }, // Hours
                                        ":",
                                        { $toString: { $floor: { $divide: [{ $mod: ["$$timeDifference", 3600000] }, 60000] } } }, // Minutes
                                        ":",
                                        { $toString: { $floor: { $divide: [{ $mod: ["$$timeDifference", 60000] }, 1000] } } } // Seconds
                                      ]
                                    }
                                  }
                                },
                                else: {
                                  $let: {
                                      vars: {
                                          timeParts: { $split: ["$workingTime", ":"] }
                                      },
                                      in: {
                                          $add: [
                                              { $multiply: [{ $toInt: { $arrayElemAt: ["$$timeParts", 0] } }, 3600] },
                                              { $multiply: [{ $toInt: { $arrayElemAt: ["$$timeParts", 1] } }, 60] },
                                              { $toInt: { $arrayElemAt: ["$$timeParts", 2] } }
                                          ]
                                      }
                                  }
                                }
                              }
                            }
                        }
                    },
                    { $match: { date: { $gte: new Date(startOfWeek), $lte: new Date(today) } } },
                    { $project: { _id: 0, workingTime: 1 } }
                ],
                as: 'weekLogs'
            }
        },          
        {
            $lookup: {
                from: 'driverlogs',
                localField: '_id',
                foreignField: 'driverId',
                pipeline: [
                      { 
                        $addFields: {
                            date: { $dateFromString: { dateString: "$date" } },
                            workingTime: {
                              $cond: {
                                if: { $eq: ["$workingTime", "00:00:00"] }, // If workingTime is "00:00:00"
                                then: {
                                  $let: {
                                    vars: {
                                      // Calculate the difference between current time and onlineTime
                                      currentTime: new Date(),
                                      timeDifference: { $subtract: [new Date(), "$onlineTime"] }
                                    },
                                    in: {
                                      // Convert time difference to hours, minutes, seconds
                                      $concat: [
                                        { $toString: { $floor: { $divide: ["$$timeDifference", 3600000] } } }, // Hours
                                        ":",
                                        { $toString: { $floor: { $divide: [{ $mod: ["$$timeDifference", 3600000] }, 60000] } } }, // Minutes
                                        ":",
                                        { $toString: { $floor: { $divide: [{ $mod: ["$$timeDifference", 60000] }, 1000] } } } // Seconds
                                      ]
                                    }
                                  }
                                },
                                else: {
                                  $let: {
                                      vars: {
                                          timeParts: { $split: ["$workingTime", ":"] }
                                      },
                                      in: {
                                          $add: [
                                              { $multiply: [{ $toInt: { $arrayElemAt: ["$$timeParts", 0] } }, 3600] },
                                              { $multiply: [{ $toInt: { $arrayElemAt: ["$$timeParts", 1] } }, 60] },
                                              { $toInt: { $arrayElemAt: ["$$timeParts", 2] } }
                                          ]
                                      }
                                  } // If not "00:00:00", leave the original workingTime
                                }
                              }
                            }
                        }
                    },
                    { $match: { date: { $gte: new Date(startOfMonth), $lte: new Date(today) } } },
                    { $project: { _id: 0, workingTime: 1 } }
                ],
                as: 'monthLogs'
            }
        },
        {
            $addFields: {
              todayWorking: { $sum: { $ifNull: ['$todayLogs.workingTime',0]} },
              yesterdayWorking: { $sum: { $ifNull: ['$yesterdayLogs.workingTime',0]} },
              weekWorking: { $sum: { $ifNull: ['$weekLogs.workingTime',0]} },
              monthWorking: { $sum: { $ifNull: ['$monthLogs.workingTime',0]} },
              tripCompleted: { $ifNull: [{ $arrayElemAt: ['$tripStatus.completed', 0] }, 0] },
              tripCancelled: { $ifNull: [{ $arrayElemAt: ['$tripStatus.cancelled', 0] }, 0] }
            }
        },
        {
            $addFields:{
              todayWorkingTime:{
                $concat: [
                  { $toString: {$cond: [{ $gte: [{ $floor: { $divide: ["$todayWorking",3600]}},10]},
                    { $floor: { $divide: ["$todayWorking", 3600] } },
                    { $concat: ["0",{ $toString: { $floor: {$divide: ["$todayWorking", 3600] } } }] } ] },
                  },
                  ":",
                  { $toString: { $cond: [{ $gte: [{ $floor: { $divide: [{ $mod: ["$todayWorking", 3600] }, 60] } }, 10] }, 
                    { $floor: { $divide: [{ $mod: ["$todayWorking", 3600] }, 60] } }, 
                    { $concat: ["0", { $toString: { $floor: { $divide: [{ $mod: ["$todayWorking", 3600] }, 60] } } } ] }] }, 
                  },
                  ":",
                  { $toString: { $cond: [{ $gte: [{ $mod: ["$todayWorking", 60] }, 10] }, 
                    { $mod: ["$todayWorking", 60] }, 
                    { $concat: ["0", { $toString: { $mod: ["$todayWorking", 60] } }] }] } 
                  }
                ]
              },
              yesterdayWorkingTime:{
                $concat: [
                  { $toString: {$cond: [{ $gte: [{ $floor: { $divide: ["$yesterdayWorking",3600]}},10]},
                    { $floor: { $divide: ["$yesterdayWorking", 3600] } },
                    { $concat: ["0",{ $toString: { $floor: {$divide: ["$yesterdayWorking", 3600] } } }] } ] },
                  },
                  ":",
                  { $toString: { $cond: [{ $gte: [{ $floor: { $divide: [{ $mod: ["$yesterdayWorking", 3600] }, 60] } }, 10] }, 
                    { $floor: { $divide: [{ $mod: ["$yesterdayWorking", 3600] }, 60] } }, 
                    { $concat: ["0", { $toString: { $floor: { $divide: [{ $mod: ["$yesterdayWorking", 3600] }, 60] } } }] }] },  
                  },
                  ":",
                  { $toString: { $cond: [{ $gte: [{ $mod: ["$yesterdayWorking", 60] }, 10] }, 
                    { $mod: ["$yesterdayWorking", 60] }, 
                    { $concat: ["0", { $toString: { $mod: ["$yesterdayWorking", 60] } }] }] }  
                  }
                ]
              },
              weeklyWorkingTime:{
                $concat: [
                  { $toString: {$cond: [{ $gte: [{ $floor: { $divide: ["$weekWorking",3600]}},10]},
                    { $floor: { $divide: ["$weekWorking", 3600] } },
                    { $concat: ["0",{ $toString: { $floor: {$divide: ["$weekWorking", 3600] } } }] } ] },
                  },
                  ":",
                  { $toString: { $cond: [{ $gte: [{ $floor: { $divide: [{ $mod: ["$weekWorking", 3600] }, 60] } }, 10] }, 
                    { $floor: { $divide: [{ $mod: ["$weekWorking", 3600] }, 60] } }, 
                    { $concat: ["0", { $toString: { $floor: { $divide: [{ $mod: ["$weekWorking", 3600] }, 60] } } }] }] }, 
                  },
                  ":",
                  { $toString: { $cond: [{ $gte: [{ $mod: ["$weekWorking", 60] }, 10] }, 
                    { $mod: ["$weekWorking", 60] }, 
                    { $concat: ["0", { $toString: { $mod: ["$weekWorking", 60] } }] }] } 
                  }
                ]
              },
              monthlyWorkingTime:{
                $concat: [
                  { $toString: {$cond: [{ $gte: [{ $floor: { $divide: ["$monthWorking",3600]}},10]},
                    { $floor: { $divide: ["$monthWorking", 3600] } },
                    { $concat: ["0",{ $toString: { $floor: {$divide: ["$monthWorking", 3600] } } }] } ] },
                  },
                  ":",
                  { $toString: { $cond: [{ $gte: [{ $floor: { $divide: [{ $mod: ["$monthWorking", 3600] }, 60] } }, 10] }, 
                    { $floor: { $divide: [{ $mod: ["$monthWorking", 3600] }, 60] } }, 
                    { $concat: ["0", { $toString: { $floor: { $divide: [{ $mod: ["$monthWorking", 3600] }, 60] } } }] }] },
                  },
                  ":",
                  { $toString: { $cond: [{ $gte: [{ $mod: ["$monthWorking", 60] }, 10] }, 
                    { $mod: ["$monthWorking", 60] }, 
                    { $concat: ["0", { $toString: { $mod: ["$monthWorking", 60] } }] }] } 
                  }
                ]
              },
            }
        },
      ];

  

      const dataPipeline = [
        ...basePipeline,
        {
          $project: {
            driverName:{
              $ifNull:[
                {$concat: ['$firstName']},
                'N/A',
              ]
            },
            phoneNumber: { $ifNull: ['$phoneNumber', null] },
            currentStatus: { 
              $cond: {
                if: { $eq: ["$onlineBy", 0] },
                then: "Offline",   
                else: "Online"
              }
            },
            driverStatus: { $cond:{
              if:{ $eq: ["$active",true]},
              then: "Active",
              else: "Inactive"
            } },
            vehicleType: { $ifNull: ['$vehicles.vehicleName', null] },
            todayWorkingTime: 1,
            yesterdayWorkingTime: 1,
            weeklyWorkingTime: 1,
            monthlyWorkingTime: 1,
            tripCompleted: 1,
            tripCancelled: 1,
          }
        }
      ];

      const driverReports = await User.aggregate(dataPipeline);
      return driverReports;
  }
  catch (error) {
      // throw new Error(`Failed to fetch driver trips: ${error.message}`);
      console.error('Error in aggregation:', error);
      throw error;
  }
};
const getUserById = async (id) => {
  return Users.findById(id);
};

const getUserId = async(id) => {
  return User.findById(id);
};


const getEaringsReport = async (driverid) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1); 
    
    const reports = await Request.aggregate([
      {
        $match: {
          driverId: new ObjectId(driverid),
          createdAt: { $gte: today, $lt: tomorrow }, // Only today’s requests
        },
      },
      {
        $addFields:{
          currentDate:{
            $dateToString:{ format: '%Y-%m-%d',date: new Date()}
          },
        }
      },
      {
        $lookup: {
          from: "requestbills",
          localField: "_id",
          foreignField: "requestId",
          as: "billData",
        },
      },
      { $unwind: { path: "$billData", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: null,
          completed: { 
            $sum: { 
              $cond: [{ 
                $and: [
                  {$eq: ['$isCompleted', true]},
                  {$eq: ['$isCancelled', false]},
                  { $eq: [{ $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, '$currentDate'] }
                ],
              },
              1, 0] 
            } 
          },
          cancelled: { 
            $sum: { 
              $cond: [{ 
                $and: [
                  {$eq: ['$isCompleted', false]},
                  {$eq: ['$isCancelled', true]},
                  { $eq: [{ $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, '$currentDate'] }
                ],
              }, 
              1, 0] 
            } 
          },
          ongoing: {
            $sum: {
              $cond: [{ 
                $and: [
                  {$eq: ['$isTripStart', true]},
                  {$eq: ['$isCompleted', false]},
                  {$eq: ['$isCancelled', false]},
                  { $eq: [{ $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, '$currentDate'] }
                ],
              },
              1, 0]
            },
          },
          pendingAmount: {
            $sum: {
              $cond: [{
                $and: [
                  {$eq: ['$isTripStart', false]},
                  {$eq: ['$isCompleted', false]},
                  {$eq: ['$isCancelled', false]},
                  { $eq: [{ $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, '$currentDate'] }
                ],
              },
              1, 0],
            },
          },
          cashPayments: { 
            $sum: { 
              $cond: [{
                $and:[
                  {$eq: ['$isCompleted', true]},
                  { $eq: ["$paymentOpt", "CASH"] },
                  { $eq: [{ $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, '$currentDate'] }
                ]
              },
              { $ifNull: ["$billData.totalAmount", 0] }, 
              0],
            } 
          },
          cardPayments: { 
            $sum: { 
              $cond: [{ 
                $and:[
                  {$eq: ['$isCompleted', true]},
                  { $eq: ["$paymentOpt", "CARD"] },
                  { $eq: [{ $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, '$currentDate'] }
                ]
              }, 
              { $ifNull: ["$billData.totalAmount", 0] }, 
              0] 
            } 
          },
          walletPayments: {
            $sum: {
              $cond: [{ 
                $and:[
                  {$eq: ['$isCompleted', true]},
                  { $eq: ["$paymentOpt", "WALLET"] },
                  { $eq: [{ $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, '$currentDate'] }
                ]
              }, 
              { $ifNull: ["$billData.totalAmount", 0] }, 
              0]
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          completed: 1,
          cancelled: 1,
          ongoing: 1,
          pendingAmount: 1,
          cashPayments: { $ifNull: ["$cashPayments", 0] },
          cardPayments: { $ifNull: ["$cardPayments", 0] },
          walletPayments: { $ifNull: ["$walletPayments", 0] },
          currency: {$ifNull: ["$requestedCurrencySymbol", "₹"] },
        },
      },
    ]);

    return {
      completed: reports[0]?.completed || 0,
      cancelled: reports[0]?.cancelled || 0,
      ongoing: reports[0]?.ongoing || 0,
      pendingAmount: reports[0]?.pendingAmount || 0,
      cashPayments: reports[0]?.cashPayments || 0,
      cardPayments: reports[0]?.cardPayments || 0,
      walletPayments: reports[0]?.walletPayments || 0,
      currency: reports[0]?.currency || "₹",
    };
  } catch (error) {
    console.error('Error fetching today report:', error);
    throw new Error('Failed to fetch today report');
  }
};
const getWeeklyEarningsReport = async (driverId) => {
  try {
    // Get the dates for the current week (Sunday to Saturday)
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 is Sunday, 1 is Monday, etc.
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek);
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    
    // Get all completed trips for the week
    const weeklyData = await Request.aggregate([
      {
        $match: {
          driverId: new ObjectId(driverId),
          createdAt: { $gte: startOfWeek, $lte: endOfWeek },
        },
      },
      {
        $lookup: {
          from: "requestbills",
          localField: "_id",
          foreignField: "requestId",
          as: "billData",
        },
      },
      { $unwind: { path: "$billData", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          dayOfWeek: { $dayOfWeek: "$createdAt" }, // 1 (Sunday) to 7 (Saturday)
          isCompleted: 1,
          isCancelled: 1,
          totalAmount: "$billData.totalAmount"
        }
      },
      {
        $group: {
          _id: "$dayOfWeek",
          completedTrips: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ["$isCompleted", true] }, { $eq: ["$isCancelled", false] }] },
                1,
                0
              ]
            }
          },
          totalEarnings: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ["$isCompleted", true] }, { $eq: ["$isCancelled", false] }] },
                { $ifNull: ["$totalAmount", 0] },
                0
              ]
            }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Map MongoDB's day numbers (1-7, where 1 is Sunday) to our format (0-6, where 0 is Sunday)
    const dayNames = ['sun', 'mon', 'tue', 'wed', 'thur', 'fri', 'sat'];
    
    // Create array with all days of the week
    const fullWeekData = dayNames.map((dayName, index) => {
      const dayData = weeklyData.find(d => d._id === index + 1);
      const currentDate = new Date(startOfWeek);
      currentDate.setDate(startOfWeek.getDate() + index);
      
      return {
        dayName,
        completedTrips: dayData ? dayData.completedTrips : 0,
        totalEarnings: dayData ? dayData.totalEarnings : 0,
        isInPast: currentDate <= today
      };
    });
    
    return fullWeekData;
  } catch (error) {
    console.error('Error fetching weekly report:', error);
    throw new Error('Failed to fetch weekly report');
  }
};

const getMonthlyEarningsReport = async (driverId) => {
  try {
    // Get the current date
    const today = new Date();

    // Calculate the start and end dates for the current month
    const startOfCurrentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfCurrentMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);

    // Calculate the start and end dates for the previous month
    const startOfPreviousMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const endOfPreviousMonth = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59, 999);

    // Fetch the completed trips and earnings for both the current month and previous month
    const monthlyData = await Request.aggregate([
      {
        $match: {
          driverId: new ObjectId(driverId),
          isCompleted: true,
          isCancelled: false,
          $or: [
            {
              createdAt: { $gte: startOfCurrentMonth, $lte: endOfCurrentMonth },
            },
            {
              createdAt: { $gte: startOfPreviousMonth, $lte: endOfPreviousMonth },
            }
          ]
        },
      },
      {
        $lookup: {
          from: "requestbills",
          localField: "_id",
          foreignField: "requestId",
          as: "billData",
        },
      },
      { $unwind: { path: "$billData", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: {
            month: {
              $cond: [
                { $gte: ["$createdAt", startOfCurrentMonth] }, // For current month
                "currentMonth", 
                "previousMonth" // Otherwise previous month
              ]
            }
          },
          totalTrips: { $sum: 1 },
          totalEarnings: { $sum: { $ifNull: ["$billData.totalAmount", 0] } }
        }
      }
    ]);

    // Process the data to separate current month and previous month
    const result = {
      currentMonth: { totalTrips: 0, totalEarnings: 0 },
      previousMonth: { totalTrips: 0, totalEarnings: 0 },
    };

    // Distribute the results from the aggregation
    monthlyData.forEach(item => {
      if (item._id.month === "currentMonth") {
        result.currentMonth.totalTrips = item.totalTrips;
        result.currentMonth.totalEarnings = item.totalEarnings;
      } else if (item._id.month === "previousMonth") {
        result.previousMonth.totalTrips = item.totalTrips;
        result.previousMonth.totalEarnings = item.totalEarnings;
      }
    });

    return result;
  } catch (error) {
    console.error('Error fetching monthly report:', error);
    throw new Error('Failed to fetch monthly report');
  }
};

const getYesterdayEarningsReport = async (driverId) => {
  try {
    // Calculate yesterday's date
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    
    const yesterdayEnd = new Date(yesterday);
    yesterdayEnd.setHours(23, 59, 59, 999);
    
    const yesterdayDateString = yesterday.toISOString().split('T')[0]; // Format: YYYY-MM-DD

    const reports = await Request.aggregate([
      {
        $match: {
          driverId: new ObjectId(driverId),
          createdAt: { $gte: yesterday, $lte: yesterdayEnd },
        },
      },
      {
        $addFields:{
          yesterdayDate: yesterdayDateString
        }
      },
      {
        $lookup: {
          from: "requestbills",
          localField: "_id",
          foreignField: "requestId",
          as: "billData",
        },
      },
      { $unwind: { path: "$billData", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: null,
          completed: { 
            $sum: { 
              $cond: [{ 
                $and: [
                  {$eq: ['$isCompleted', true]},
                  {$eq: ['$isCancelled', false]},
                ],
              },
              1, 0] 
            } 
          },
          cancelled: { 
            $sum: { 
              $cond: [{ 
                $and: [
                  {$eq: ['$isCompleted', false]},
                  {$eq: ['$isCancelled', true]},
                ],
              }, 
              1, 0] 
            } 
          },
          cashPayments: { 
            $sum: { 
              $cond: [{
                $and:[
                  {$eq: ['$isCompleted', true]},
                  { $eq: ["$paymentOpt", "CASH"] },
                ]
              },
              { $ifNull: ["$billData.totalAmount", 0] }, 
              0],
            } 
          },
          cardPayments: { 
            $sum: { 
              $cond: [{ 
                $and:[
                  {$eq: ['$isCompleted', true]},
                  { $eq: ["$paymentOpt", "CARD"] },
                ]
              }, 
              { $ifNull: ["$billData.totalAmount", 0] }, 
              0] 
            } 
          },
          walletPayments: {
            $sum: {
              $cond: [{ 
                $and:[
                  {$eq: ['$isCompleted', true]},
                  { $eq: ["$paymentOpt", "WALLET"] },
                ]
              }, 
              { $ifNull: ["$billData.totalAmount", 0] }, 
              0]
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          completed: 1,
          cancelled: 1,
          cashPayments: { $ifNull: ["$cashPayments", 0] },
          cardPayments: { $ifNull: ["$cardPayments", 0] },
          walletPayments: { $ifNull: ["$walletPayments", 0] },
          currency: {$ifNull: ["$requestedCurrencySymbol", "₹"] },
        },
      },
    ]);

    return {
      completed: reports[0]?.completed || 0,
      cancelled: reports[0]?.cancelled || 0,
      cashPayments: reports[0]?.cashPayments || 0,
      cardPayments: reports[0]?.cardPayments || 0,
      walletPayments: reports[0]?.walletPayments || 0,
      currency: reports[0]?.currency || "₹",
    };
  } catch (error) {
    console.error('Error fetching yesterday report:', error);
    throw new Error('Failed to fetch yesterday report');
  }
};
const getDriverTripsByMonth = async (driverId, month, year) => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999); // end of month

  const trips = await Request.aggregate([
    {
      $match: {
        driverId: new ObjectId(driverId),
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: {
          day: { $dayOfMonth: "$createdAt" },
          month: { $month: "$createdAt" },
          year: { $year: "$createdAt" }
        },
        tripCount: { $sum: 1 },
        earnings: { $sum: "$fareAmount" } 
      }
    },
    {
      $project: {
        _id: 0,
        date: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: {
              $dateFromParts: {
                year: "$_id.year",
                month: "$_id.month",
                day: "$_id.day"
              }
            }
          }
        },
        tripCount: 1,
        earnings: 1
      }
    },
    {
      $sort: { date: 1 }
    }
  ]);

  return trips;
};

const getRequest = async (zoneId, userId) => {

  const groupDocument = await GroupDocument.find({zoneId: new ObjectId(zoneId),status:true}).select('_id').lean();
  const groupDocumentIds = groupDocument.map(doc => doc._id);
  
  const documents = await Document.find({required:true,documentId:{$in:groupDocumentIds}}).select('_id').lean();

  const document = documents.map(doc => doc._id);
  // const document = await Document.find({ clientId: clientId,status:true });
  const getRequest = Driver.aggregate([
    {
      $match: {
        // clientId: new ObjectId(clientId),
        userId: new ObjectId(userId)
      }
    },
    {
      $lookup: {
        from: 'driverdocuments',
        localField: '_id',
        foreignField: 'driverId',
        as: 'driverDocumentDetails'
      }
    },
    {
      $lookup: {
        from: 'requests',
        localField: '_id',
        foreignField: 'userId',
        as: 'requestDetails'
      }
    },
    {
      $unwind: {
        path: '$requestDetails',
        preserveNullAndEmptyArrays: true,
      }
    },
    {
      $lookup: {
        from: 'requestbills',
        localField: '_id',
        foreignField: 'requestDetails._id',
        as: 'billingDetails'
      }
    },
    {
      $lookup: {
        from: 'requestplaces',
        localField: '_id',
        foreignField: 'requestDetails._id',
        as: 'placesDetails'
      }
    },
    {
      $lookup: {
        from: 'requestratings',
        localField: '_id',
        foreignField: 'requestDetails._id',
        as: 'ratingDetails'
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'user',
      },
    },
    {
      $unwind: {
        path: '$billingDetails',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $unwind: {
        path: '$ratingDetails',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $unwind: {
        path: '$user',
        preserveNullAndEmptyArrays: true,
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'driverPersonalDetails',
      }
    },
    {
      $lookup: {
        from: 'vehicles',
        localField: 'type',
        foreignField: '_id',
        as: 'vehicleDetails',
      }
    },
    {
      $lookup: {
        from: 'vehiclemodels',
        localField: 'carModel',
        foreignField: '_id',
        as: 'vehicleModelDetails',
      }
    },
    {
      $unwind: {
        path: '$driverPersonalDetails',
        preserveNullAndEmptyArrays: true,
      }
    },
    {
      $unwind: {
        path: '$vehicleDetails',
        preserveNullAndEmptyArrays: true,
      }
    },
    {
      $unwind: {
        path: '$vehicleModelDetails',
        preserveNullAndEmptyArrays: true,
      }
    },
    {
      $addFields: {
        active: {
          $cond: [
            {
              $or: [
                { $eq: [{ $size: '$driverDocumentDetails' }, 0] }, // No documents
                {
                  $gt: [
                    {
                      $size: {
                        $filter: {
                          input: '$driverDocumentDetails',
                          as: 'doc',
                          cond: {
                            $or: [
                              { $eq: ['$$doc.documentStatus', 'DENIED'] }, // Denied documents
                              {
                                $and: [
                                  { $ifNull: ['$$doc.expiryDate', false] }, // expiryDate exists
                                  { $lt: ['$$doc.expiryDate', new Date()] } // expiryDate < today
                                ]
                              }
                            ]
                          }
                        }
                      }
                    },
                    0
                  ]
                },
                { $ne: [{ $size: '$driverDocumentDetails' }, document.length] }, // Document count not equal to expected count
                {
                  $gt: [
                    {
                      $size: {
                        $filter: {
                          input: '$driverDocumentDetails',
                          as: 'doc',
                          cond: { $ne: ['$$doc.documentStatus', 'APPROVED'] } // Not approved documents
                        }
                      }
                    },
                    0
                  ]
                } // Any document is not approved
              ]
            },
            false, // Inactive
            true // Active
          ]
        },
        blockReason: {
          $cond: {
            if: {
              $gt: [
                {
                  $size: {
                    $filter: {
                      input: '$driverDocumentDetails',
                      as: 'doc',
                      cond: { $eq: ['$$doc.documentStatus', 'WAITINGFORAPPROVAL'] } // Check for WAITINGFORAPPROVAL
                    }
                  }
                },
                0
              ]
            },
            then: 'WAITINGFORAPPROVAL', // If any document is WAITINGFORAPPROVAL
            else: {
              $cond: {
                if: { $eq: [{ $size: '$driverDocumentDetails' }, 0] }, // No documents
                then: 'DOCUMENT_NOT_UPLOADED',
                else: {
                  $cond: {
                    if: {
                      $gt: [
                        {
                          $size: {
                            $filter: {
                              input: '$driverDocumentDetails',
                              as: 'doc',
                              cond: {
                                $and: [
                                  { $ifNull: ['$$doc.expiryDate', false] }, // expiryDate exists
                                  { $lt: ['$$doc.expiryDate', new Date()] } // expiryDate is in the past
                                ]
                              }
                            }
                          }
                        },
                        0
                      ]
                    },
                    then: 'EXPIRED',
                    else: {
                      $cond: {
                        if: { $ne: [{ $size: '$driverDocumentDetails' }, document.length] }, // Document count does not match driver document count
                        then: 'DOCUMENT_NOT_UPLOADED', // Document and driver document counts do not match
                        else: {
                          $cond: {
                            if: {
                              $eq: [
                                {
                                  $size: {
                                    $filter: {
                                      input: '$driverDocumentDetails',
                                      as: 'doc',
                                      cond: { $ne: ['$$doc.documentStatus', 'APPROVED'] } // Any document not approved
                                    }
                                  }
                                },
                                0
                              ]
                            }, // All documents are approved
                            then: 'APPROVED',
                            else: 'DENIED' // Not all documents are approved
                          }
                        },
                      }
                    }
                  }
                }
              }
            }
          }
        },
        onlineBy: {
          $cond: {
            if: { $eq: ['$driverPersonalDetails.onlineBy', 1] },
            then: true,
            else: false,
          },
        }
      },
    },
    {
      $project: {
        _id: { $ifNull: ['$_id', null] },
        _id: { $ifNull: ['$_id', null] },
        blockReason: { $ifNull: ['$blockReason', null] },
        onlineBy: { $ifNull: ['$onlineBy', null] },
        active: { $ifNull: ['$active', null] },
        'driver.id': { $ifNull: ['$_id', null] },
        'driver.carNumber': { $ifNull: ['$carNumber', null] },
        'driver.serviceType': { $ifNull: ['$serviceType', null] },
        'driver.vehicleId': { $ifNull: ['$vehicleDetails._id', null] },
        'driver.vehicleName': { $ifNull: ['$vehicleDetails.vehicleName', null] },
        'driver.vehicleImage': { $ifNull: ['$vehicleDetails.image', null] },
        'driver.capacity': { $ifNull: ['$vehicleDetails.capacity', null] },
        'driver.highlightImage': { $ifNull: ['$vehicleDetails.highlightImage', null] },
        'driver.modelname': { $ifNull: ['$vehicleModelDetails.modelname', null] },
        'user.userId': { $ifNull: ['$user._id', null] },
        'user.firstName': { $ifNull: ['$user.firstName', null] },
        'user.lastName': { $ifNull: ['$user.lastName', null] },
        'user.email': { $ifNull: ['$user.email', null] },
        'user.phoneNumber': { $ifNull: ['$user.phoneNumber', null] },
        'user.referralCode': { $ifNull: ['$user.referralCode', null] },
        'user.gender': { $ifNull: ['$user.gender', null] },
        'user.country': { $ifNull: ['$user.country', null] },
        'user.profilePic': { $ifNull: ['$user.profilePic', null] },
      }
    }
  ]);

  return getRequest;
};

const updateDriversStatus = async (req,driverId, updateBody) => {
  const driver = await getDriverById(driverId);
  if (!driver) {
    return { status: httpStatus.NOT_FOUND, msg: "Driver not found" };
  }

  const driverInUser = await getUserId(driver.userId);
  if (!driverInUser) {
    return { status: httpStatus.NOT_FOUND, msg: "Driver not found" };
  }

  let inProgress = await getRequest(driver.serviceLocation, driverInUser._id);

  const topic = `driver/detail/` + driver.driverId;

  if (inProgress != null && Array.isArray(inProgress)) {
    inProgress = inProgress[0];
    inProgress.documentStatus = inProgress.blockReason;
  }

  if(driver.status === true)
  {
    Object.assign(driver, updateBody);
    await driver.save();


    driverInUser.active = updateBody.status;
    driverInUser.blockReson = 'Admin Blocked';
    
    await driverInUser.save();

    await mqttService.publishMessage(topic, inProgress).then((successMessage) => {
        })
        .catch((errorMessage) => {
          console.error(errorMessage); // Will print error message if publishing fails
        });

    const messageData = {
      title: "Your Account Is Blocked",
      message: "Your account is blocked by admin. Please, contact admin.",
      imageName: "", // Add an optional image URL if required
    };

    // Send notification
    await sendNotification(req, driverInUser._id, messageData);
    return { status: HttpStatusCode.Ok, msg: "Status Changed Successfully" };
    // return driverInUser;
  }
  else
  {
    //chk driver document uploaded and approved or not
    const groupDocument = await GroupDocument.find({zoneId: new ObjectId(driver.serviceLocation),status:true}).select('_id').lean();

    const groupDocumentIds = groupDocument.map(doc => doc._id);
    
    const documents = await Document.find({required:true,documentId:{$in:groupDocumentIds}}).select('_id').lean();

    const documentIds = documents.map(doc => doc._id);

    const driverDocument = await DriverDocument.countDocuments({driverId: new ObjectId(driver._id),documentStatus:"APPROVED",documentId:{$in:documentIds}});

    const driverWallet = await Wallet.findOne({userId: new ObjectId(driverInUser._id)});
    const settings = await Settings.findOne({name:"driverBlockWalletBalance"});

    if(documentIds.length <= driverDocument && driverWallet.balance >= settings.value)
    {
      Object.assign(driver, updateBody);
      await driver.save();

      driverInUser.active = updateBody.status;
      driverInUser.blockReson = '';
      await driverInUser.save();

      await mqttService.publishMessage(topic, inProgress).then((successMessage) => {
      })
      .catch((errorMessage) => {
        console.error(errorMessage); // Will print error message if publishing fails
      });

      const messageData = {
        title: "Your Account Is Unblocked",
        message: "Your account is unblocked by admin.",
        imageName: "", // Add an optional image URL if required
      };

      // Send notification
      await sendNotification(req, driverInUser._id, messageData);
      return { status: HttpStatusCode.Ok, msg: "Status Changed Successfully" };
      // return driverInUser;
    }
    else
    {
      if(documentIds.length > driverDocument)
      {
        return { status: httpStatus.FORBIDDEN, msg: "Driver's required documents are not uploded or not approved...so you cannot change status for this driver" };
      }
      else if(driverWallet.balance < settings.value)
      {
        return { status: httpStatus.FORBIDDEN, msg: "Insufficient balance in driver wallet...so you cannot change status for this driver" };
      }
    }
  }
};

const getZones = async(clientId) =>
{
  const zone = await Zone.find({zoneLevel: 'PRIMARY',clientId : clientId}).select('_id zoneName zoneLevel status');
  return zone;
};

const getDriverByZone = async(req,filter,options) => {
  const clientId = await getClientId(req);

  const limit = parseInt(options.limit, 10) || 10;
  const page = parseInt(options.page, 10) || 1;
  const skip = (page - 1) * limit;

  filter.clientId = new ObjectId(clientId);
  filter.serviceLocation = new ObjectId(req.params.zoneId);

  const now = new Date(); // current time
  const currentDate = new Date(now.toISOString().split('T')[0]); 

  const drivers = await Driver.aggregate([
    {
      $match: filter
    },
    {
      $lookup:{
        from: 'driverdocuments',
        localField: '_id',
        foreignField: 'driverId',
        as: 'driverDocuments',
      }
    },
    {
      $addFields: {
        expiringDocuments: {
          $filter: {
            input: '$driverDocuments',
            as: 'doc',
            cond: {
              $and: [
                { $gte: ['$$doc.expiryDate', currentDate] },
                { $ne: ['$$doc.expiryDate', null] }
              ]
            }
          }
        }
      }
    },
    {
      $match: {
        'expiringDocuments.0': { $exists: true } // At least one document matched
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'driverPersonalDetails'
      }
    },
    {
      $unwind: {
        path: '$driverPersonalDetails',
        // preserveNullAndEmptyArrays: true
      }
    },
    ...(req.query.search
      ? [
          {
            $match: {
              $or: [
                { 'driverPersonalDetails.firstName': { $regex: req.query.search, $options: 'i' } },
                { 'driverPersonalDetails.phoneNumber': { $regex: req.query.search, $options: 'i' } }
              ]
            }
          }
        ]
      : []),
      {
      $facet: {
        paginatedResults: [
          { $project: {
              driverName: {
                $ifNull: [
                  {
                    $concat: [
                      { $ifNull: ['$driverPersonalDetails.firstName', ''] },
                      ' ',
                      { $ifNull: ['$driverPersonalDetails.lastName', ''] }
                    ]
                  },
                  'N/A'
                ]
              },
              userId: 1,
              phoneNumber: '$driverPersonalDetails.phoneNumber',
              expiringDocuments: 1
            }
          },
          { $skip: skip },
          { $limit: limit }
        ],
        totalCount: [
          { $count: 'count' }
        ]
      }
    } 
  ]);

  const results = drivers[0] || {};
  const data = results.paginatedResults || [];
  const totalResults = results.totalCount[0]?.count || 0;

  const totalPages = Math.ceil(totalResults / limit);

  return {
    data,
    page,
    limit,
    totalPages,
    totalResults,
  };
};

module.exports = {
  createDriver,
  queryDrivers,
  getDriversById,
  getDrivers,
  updateDriversById,
  deleteDriverById,
  aggregateDrivers,
  getDriverById,
  getDropDowns,
  getDriverWallet,
  getDriverReport,
  getEaringsReport,
  getWeeklyEarningsReport,
  getMonthlyEarningsReport,
  getYesterdayEarningsReport,
  getDriverTripsByMonth,
  updateDriversStatus,
  getZones,
  getDriverByZone
};
