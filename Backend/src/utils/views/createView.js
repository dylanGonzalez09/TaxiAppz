// createView.js
const mongoose = require('mongoose');
const { Document, Settings, GroupDocument } = require('../../models');

/**
 * Creates a MongoDB view with the given clientId and userId.
 *
 *
 */

const DriverDailyReport = async () => {
  if (!mongoose.connection.db) {
    return;
  }
  const { db } = mongoose.connection;

  try {
    // Drop the existing view (if it exists)
    const collections = await db.listCollections({ name: 'driverDailyView' }).toArray();
    const viewExists = collections.length > 0;
    if (viewExists) {
      console.log('View "driverDailyView" already exists, skipping creation.');
    } else {
      await db.createCollection('driverDailyView', {
        viewOn: 'requests',
        pipeline: [
          {
            $match: {
              createdAt: {
                $gte: new Date(new Date().setHours(0, 0, 0, 0)), // Start of the day
                $lt: new Date(new Date().setHours(23, 59, 59, 999)), // End of the day
              },
            },
          },
          {
            $lookup: {
              from: 'requestbills',
              localField: '_id',
              foreignField: 'requestId',
              as: 'billing',
            },
          },
          {
            $unwind: { path: '$billing', preserveNullAndEmptyArrays: true },
          },
          {
            $project: {
              driverId: 1,
              isCompleted: 1,
              isCancelled: 1,
              billing: { $ifNull: ['$billing', { driverCommission: 0 }] },
            },
          },
          {
            $group: {
              _id: '$driverId',
              todayCompleted: { $sum: { $cond: ['$isCompleted', 1, 0] } },
              todayCancelled: { $sum: { $cond: ['$isCancelled', 1, 0] } },
              totalAmount: { $sum: '$billing.driverCommission' },
              totalAssigned: {
                $sum: {
                  $cond: [{ $and: [{ $eq: ['$isCompleted', false] }, { $eq: ['$isCancelled', false] }] }, 1, 0],
                },
              },
            },
          },
          {
            $project: {
              driverId: '$_id',
              todayCompleted: 1,
              todayCancelled: 1,
              totalAmount: 1,
              totalAssigned: 1,
              _id: 0,
            },
          },
        ],
      });
    }
  } catch (error) {
    console.error('Error creating view:', error);
    throw error; // Re-throw the error for the caller to handle
  }
};

const createDriverRequestView = async () => {
  if (!mongoose.connection.db) {
    return;
  }

  const { db } = mongoose.connection;

  try {
    // Check if the view already exists
    const collections = await db.listCollections({ name: 'driverRequestDetailedView' }).toArray();
    const viewExists = collections.length > 0;

    if (viewExists) {
      // Recreate to ensure pipeline changes take effect.
      // (Views/collections created with an aggregation pipeline are not auto-updated.)
      await db.collection('driverRequestDetailedView').drop();
    }

    await db.createCollection('driverRequestDetailedView', {
      viewOn: 'drivers',
      pipeline: [
        // 1. Driver Documents
        {
          $lookup: {
            from: 'driverdocuments',
            let: { driverId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [{ $eq: ['$driverId', '$$driverId'] }, { $eq: ['$status', true] }],
                  },
                },
              },
            ],
            as: 'driverDocumentDetails',
          },
        },
        // 2. Wallet
        {
          $lookup: {
            from: 'wallets',
            localField: 'userId',
            foreignField: 'userId',
            as: 'walletDetails',
          },
        },
        {
          $unwind: { path: '$walletDetails', preserveNullAndEmptyArrays: true },
        },
        // 4. Trip Data (accepted requests)
        // NOTE: `requestmetas` is deleted on accept, so build trip from `requests` (driverId) instead.
        {
          $lookup: {
            from: 'requests',
            let: { driverId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$driverId', '$$driverId'] },
                      { $eq: [{ $ifNull: ['$isCancelled', false] }, false] },
                      { $eq: [{ $ifNull: ['$isCompleted', false] }, false] },
                    ],
                  },
                },
              },
              // Join Request Places
              {
                $lookup: {
                  from: 'requestplaces',
                  let: { requestId: '$_id' },
                  pipeline: [{ $match: { $expr: { $eq: ['$requestId', '$$requestId'] } } }],
                  as: 'requestPlaceDetailsData',
                },
              },
              { $unwind: { path: '$requestPlaceDetailsData', preserveNullAndEmptyArrays: true } },
              // Join Request Bills
              {
                $lookup: {
                  from: 'requestbills',
                  let: { requestId: '$_id' },
                  pipeline: [{ $match: { $expr: { $eq: ['$requestId', '$$requestId'] } } }],
                  as: 'billingDetails',
                },
              },
              { $unwind: { path: '$billingDetails', preserveNullAndEmptyArrays: true } },
              // Join Ratings
              {
                $lookup: {
                  from: 'requestratings',
                  let: { requestId: '$_id' },
                  pipeline: [{ $match: { $expr: { $eq: ['$requestId', '$$requestId'] } } }],
                  as: 'ratingDetails',
                },
              },
              { $unwind: { path: '$ratingDetails', preserveNullAndEmptyArrays: true } },
              // Join Users (request user)
              {
                $lookup: {
                  from: 'users',
                  let: { userId: '$userId' },
                  pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$userId'] } } }],
                  as: 'requestMetaUsers',
                },
              },
              { $unwind: { path: '$requestMetaUsers', preserveNullAndEmptyArrays: true } },
              // Keep the field names the rest of the view expects.
              {
                $project: {
                  userId: 1,
                  driverId: 1,
                  requestDetailsData: '$$ROOT',
                  requestPlaceDetailsData: 1,
                  requestMetaUsers: 1,
                  billingDetails: 1,
                  ratingDetails: 1,
                },
              },
            ],
            as: 'tripData',
          },
        },
        {
          $unwind: { path: '$tripData', preserveNullAndEmptyArrays: true },
        },
        // 5. Driver Ratings (All)
        {
          $lookup: {
            from: 'requestratings',
            let: { userId: '$userId' },
            pipeline: [{ $match: { $expr: { $eq: ['$userId', '$$userId'] } } }],
            as: 'driverAllRatings',
          },
        },
        // 6. Driver Personal Details
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'driverPersonalDetails',
          },
        },
        {
          $unwind: { path: '$driverPersonalDetails', preserveNullAndEmptyArrays: true },
        },
        // 7. Demo Key
        {
          $lookup: {
            from: 'demos',
            localField: 'driverPersonalDetails.adminDemoKey',
            foreignField: 'demoKey',
            as: 'demoKeyDetails',
          },
        },
        {
          $unwind: { path: '$demoKeyDetails', preserveNullAndEmptyArrays: true },
        },
        // 8. Driver Subscription
        {
          $lookup: {
            from: 'driversubscriptions',
            localField: '_id',
            foreignField: 'driverId',
            as: 'driverSubscriptionDetails',
          },
        },
        {
          $unwind: { path: '$driverSubscriptionDetails', preserveNullAndEmptyArrays: true },
        },
        {
          $lookup: {
            from: 'subscriptions',
            let: { subId: '$driverSubscriptionDetails.subScriptionId' },
            pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$subId'] } } }],
            as: 'SubscriptionDetails',
          },
        },
        {
          $unwind: { path: '$SubscriptionDetails', preserveNullAndEmptyArrays: true },
        },
        // 9. Country Details
        {
          $lookup: {
            from: 'countries',
            let: { countryId: '$driverPersonalDetails.country' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ['$_id', { $toObjectId: '$$countryId' }],
                  },
                },
              },
            ],
            as: 'countriesDetails',
          },
        },
        {
          $unwind: { path: '$countriesDetails', preserveNullAndEmptyArrays: true },
        },
        // 10. Client Data
        {
          $lookup: {
            from: 'clients',
            let: { clientId: '$clientId' },
            pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$clientId'] } } }],
            as: 'clientData',
          },
        },
        {
          $unwind: { path: '$clientData', preserveNullAndEmptyArrays: true },
        },
        // 11. Client User Details
        {
          $lookup: {
            from: 'users',
            let: { userId: '$clientData.userId' },
            pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$userId'] } } }],
            as: 'clientDetails',
          },
        },
        {
          $unwind: { path: '$clientDetails', preserveNullAndEmptyArrays: true },
        },
      
        // 14. Driver Group Documents
        {
          $lookup: {
            from: 'groupdocuments',
            let: { driverZoneId: '$serviceLocation' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [{ $eq: ['$zoneId', '$$driverZoneId'] }, { $eq: ['$type', 'driver'] }, { $eq: ['$status', true] }],
                  },
                },
              },
            ],
            as: 'driverGroupDocuments',
          },
        },
        // 15. Filtered Documents (from Group)
        {
          $lookup: {
            from: 'documents',
            let: {
              groupDocIds: {
                $map: {
                  input: '$driverGroupDocuments',
                  as: 'groupDoc',
                  in: '$$groupDoc._id',
                },
              },
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [{ $in: ['$documentId', '$$groupDocIds'] }, { $eq: ['$status', true] }],
                  },
                },
              },
            ],
            as: 'filteredDocuments',
          },
        },
        // 15. Today Status
        {
          $lookup: {
            from: 'driverDailyView',
            let: { driverId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ['$driverId', '$$driverId'] },
                },
              },
            ],
            as: 'todayStatus',
          },
        },
        {
          $unwind: { path: '$todayStatus', preserveNullAndEmptyArrays: true },
        },
        // 19. User All Ratings (from trip user)
        {
          $lookup: {
            from: 'requestratings',
            let: { userId: '$tripData.userId' },
            pipeline: [{ $match: { $expr: { $eq: ['$userId', '$$userId'] } } }],
            as: 'userAllRatings',
          },
        },
        // 20. Main User Details (fallback for user block)
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'user',
          },
        },
        {
          $unwind: { path: '$user', preserveNullAndEmptyArrays: true },
        },
        // Zone + zone/vehicle price (for isDisableReason: ZONE_DISABLED / VEHICLE_DISABLED)
        {
          $lookup: {
            from: 'zones',
            let: { zoneId: '$serviceLocation' },
            pipeline: [
              { $match: { $expr: { $eq: ['$_id', '$$zoneId'] } } },
              { $project: { status: 1 } },
            ],
            as: 'zoneDisableDetails',
          },
        },
        {
          $unwind: { path: '$zoneDisableDetails', preserveNullAndEmptyArrays: true },
        },
        {
          $lookup: {
            from: 'zoneprices',
            let: { zoneId: '$serviceLocation', vehicleId: '$type' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$zoneId', '$$zoneId'] },
                      { $eq: ['$vehicleId', '$$vehicleId'] },
                    ],
                  },
                },
              },
              { $project: { status: 1 } },
              { $limit: 1 },
            ],
            as: 'zonePriceVehicleDisable',
          },
        },
        {
          $unwind: { path: '$zonePriceVehicleDisable', preserveNullAndEmptyArrays: true },
        },
        // --- COMPUTED FIELDS ---
        {
          $addFields: {
            active: {
              $cond: [
                {
                  $or: [
                    { $eq: [{ $size: '$driverDocumentDetails' }, 0] },
                    {
                      $gt: [
                        {
                          $size: {
                            $filter: {
                              input: '$driverDocumentDetails',
                              as: 'doc',
                              cond: {
                                $or: [
                                  { $eq: ['$$doc.documentStatus', 'DENIED'] },
                                  {
                                    $and: [
                                      { $ifNull: ['$$doc.expiryDate', false] },
                                      { $lt: ['$$doc.expiryDate', new Date()] },
                                    ],
                                  },
                                ],
                              },
                            },
                          },
                        },
                        0,
                      ],
                    },
                    {
                      $ne: [
                        {
                          $size: {
                            $filter: {
                              input: '$filteredDocuments',
                              as: 'doc',
                              cond: { $eq: ['$$doc.required', true] },
                            },
                          },
                        },
                        {
                          $size: {
                            $filter: {
                              input: '$filteredDocuments',
                              as: 'doc',
                              cond: {
                                $and: [
                                  { $eq: ['$$doc.required', true] },
                                  {
                                    $or: [
                                      {
                                        $in: [
                                          { $toString: '$$doc._id' },
                                          {
                                            $map: {
                                              input: '$driverDocumentDetails',
                                              as: 'driverDoc',
                                              in: { $toString: '$$driverDoc.documentId' },
                                            },
                                          },
                                        ],
                                      },
                                      {
                                        $in: [
                                          { $toString: '$$doc.documentId' },
                                          {
                                            $map: {
                                              input: '$driverDocumentDetails',
                                              as: 'driverDoc',
                                              in: { $toString: '$$driverDoc.documentId' },
                                            },
                                          },
                                        ],
                                      },
                                    ],
                                  },
                                ],
                              },
                            },
                          },
                        },
                      ],
                    },
                    {
                      $gt: [
                        {
                          $size: {
                            $filter: {
                              input: '$driverDocumentDetails',
                              as: 'doc',
                              cond: { $ne: ['$$doc.documentStatus', 'APPROVED'] },
                            },
                          },
                        },
                        0,
                      ],
                    },
                  ],
                },
                false,
                true,
              ],
            },
            blockReason: {
              $cond: {
                if: {
                  $ne: [
                    {
                      $size: {
                        $filter: {
                          input: '$filteredDocuments',
                          as: 'doc',
                          cond: { $eq: ['$$doc.required', true] },
                        },
                      },
                    },
                    {
                      $size: {
                        $filter: {
                          input: '$filteredDocuments',
                          as: 'doc',
                          cond: {
                            $and: [
                              { $eq: ['$$doc.required', true] },
                              {
                                $or: [
                                  {
                                    $in: [
                                      { $toString: '$$doc._id' },
                                      {
                                        $map: {
                                          input: '$driverDocumentDetails',
                                          as: 'driverDoc',
                                          in: { $toString: '$$driverDoc.documentId' },
                                        },
                                      },
                                    ],
                                  },
                                  {
                                    $in: [
                                      { $toString: '$$doc.documentId' },
                                      {
                                        $map: {
                                          input: '$driverDocumentDetails',
                                          as: 'driverDoc',
                                          in: { $toString: '$$driverDoc.documentId' },
                                        },
                                      },
                                    ],
                                  },
                                ],
                              },
                            ],
                          },
                        },
                      },
                    },
                  ],
                },
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
                              cond: { $eq: ['$$doc.documentStatus', 'WAITINGFORAPPROVAL'] },
                            },
                          },
                        },
                        0,
                      ],
                    },
                    then: 'WAITINGFORAPPROVAL',
                    else: {
                      $cond: {
                        if: { $eq: [{ $size: '$driverDocumentDetails' }, 0] },
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
                                          { $ifNull: ['$$doc.expiryDate', false] },
                                          { $lt: ['$$doc.expiryDate', new Date()] },
                                        ],
                                      },
                                    },
                                  },
                                },
                                0,
                              ],
                            },
                            then: 'EXPIRED',
                            else: {
                              $cond: {
                                if: {
                                  $ne: [
                                    {
                                      $size: {
                                        $filter: {
                                          input: '$filteredDocuments',
                                          as: 'doc',
                                          cond: { $eq: ['$$doc.required', true] },
                                        },
                                      },
                                    },
                                    {
                                      $size: {
                                        $filter: {
                                          input: '$filteredDocuments',
                                          as: 'doc',
                                          cond: {
                                            $and: [
                                              { $eq: ['$$doc.required', true] },
                                              {
                                                $or: [
                                                  {
                                                    $in: [
                                                      { $toString: '$$doc._id' },
                                                      {
                                                        $map: {
                                                          input: '$driverDocumentDetails',
                                                          as: 'driverDoc',
                                                          in: { $toString: '$$driverDoc.documentId' },
                                                        },
                                                      },
                                                    ],
                                                  },
                                                  {
                                                    $in: [
                                                      { $toString: '$$doc.documentId' },
                                                      {
                                                        $map: {
                                                          input: '$driverDocumentDetails',
                                                          as: 'driverDoc',
                                                          in: { $toString: '$$driverDoc.documentId' },
                                                        },
                                                      },
                                                    ],
                                                  },
                                                ],
                                              },
                                            ],
                                          },
                                        },
                                      },
                                    },
                                  ],
                                },
                                then: 'DOCUMENT_NOT_UPLOADED',
                                else: {
                                  $cond: {
                                    if: {
                                      $eq: [
                                        {
                                          $size: {
                                            $filter: {
                                              input: '$driverDocumentDetails',
                                              as: 'doc',
                                              cond: { $ne: ['$$doc.documentStatus', 'APPROVED'] },
                                            },
                                          },
                                        },
                                        0,
                                      ],
                                    },
                                    then: 'APPROVED',
                                    else: 'DENIED',
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            onlineBy: {
              $cond: {
                if: { $eq: ['$driverPersonalDetails.onlineBy', 1] },
                then: true,
                else: false,
              },
            },
            driverAverageRating: {
              $toInt: {
                $ifNull: [{ $avg: '$driverAllRatings.rating' }, 0],
              },
            },
            userAverageRating: {
              $toInt: {
                $ifNull: [{ $avg: '$userAllRatings.rating' }, 0],
              },
            },
            isDemoValid: {
              $cond: {
                if: { $ifNull: ['$demoKeyDetails', false] },
                then: {
                  $cond: {
                    if: { $gt: ['$demoKeyDetails.Enddate', new Date()] },
                    then: {
                      $cond: {
                        if: { $eq: ['$demoKeyDetails.status', true] },
                        then: true,
                        else: false,
                      },
                    },
                    else: false,
                  },
                },
                else: null,
              },
            },
            isDriverSubscriptionValid: {
              $cond: {
                if: { $ifNull: ['$driverSubscriptionDetails', false] },
                then: {
                  $and: [
                    { $gt: ['$driverSubscriptionDetails.Enddate', new Date()] },
                    { $eq: ['$driverSubscriptionDetails.status', true] },
                    { $eq: ['$SubscriptionDetails.zoneId', '$serviceLocation'] },
                  ],
                },
                else: false,
              },
            },
            subscriptionName: '$SubscriptionDetails.name',
            remainingDays: {
              $cond: [
                {
                  $and: [
                    { $gt: ['$driverSubscriptionDetails.Enddate', '$$NOW'] },
                    { $ifNull: ['$driverSubscriptionDetails.Enddate', false] },
                  ],
                },
                {
                  $dateDiff: {
                    startDate: '$$NOW',
                    endDate: '$driverSubscriptionDetails.Enddate',
                    unit: 'day',
                  },
                },
                null,
              ],
            },
            isDisableReason: {
              $let: {
                vars: {
                  hasActiveTrip: {
                    $and: [
                      { $ne: [{ $ifNull: ['$tripData', null] }, null] },
                      { $ne: [{ $ifNull: ['$tripData.requestDetailsData', null] }, null] },
                    ],
                  },
                  zoneDisabled: { $eq: [{ $ifNull: ['$zoneDisableDetails.status', true] }, false] },
                  vehicleDisabledInZone: {
                    $and: [
                      { $ne: [{ $ifNull: ['$zonePriceVehicleDisable', null] }, null] },
                      { $eq: [{ $ifNull: ['$zonePriceVehicleDisable.status', true] }, false] },
                    ],
                  },
                },
                in: {
                  $cond: [
                    { $eq: ['$$hasActiveTrip', true] },
                    null,
                    {
                      $cond: [
                        { $eq: ['$$zoneDisabled', true] },
                        'ZONE_DISABLED',
                        {
                          $cond: [
                            { $eq: ['$$vehicleDisabledInZone', true] },
                            'VEHICLE_DISABLED',
                            null,
                          ],
                        },
                      ],
                    },
                  ],
                },
              },
            },
          },
        },
        {
          $addFields: {
            // Show AdminBlocked only when docs are approved and admin disabled the driver.
            active: {
              $cond: [{ $eq: ['$status', false] }, false, '$active'],
            },
            blockReason: {
              $cond: [
                { $and: [{ $eq: ['$status', false] }, { $eq: ['$blockReason', 'APPROVED'] }] },
                'AdminBlocked',
                '$blockReason',
              ],
            },
          },
        },
        // --- PROJECTION ---
        {
          $project: {
            _id: { $ifNull: ['$_id', null] },
            blockReason: { $ifNull: ['$blockReason', null] },
            onlineBy: { $ifNull: ['$onlineBy', null] },
            active: { $ifNull: ['$active', null] },
            userId: { $ifNull: ['$userId', null] },
            carColor: { $ifNull: ['$carColour', null] },
            clientId: { $ifNull: ['$clientId', null] },
            countryCode: '$countriesDetails.dial_code',
            currencySymbol: '$countriesDetails.currency_symbol',
            isDemoValid: { $ifNull: ['$isDemoValid', null] },
            isDriverSubScriptionValid: { $ifNull: ['$isDriverSubscriptionValid', false] },
            subscriptionName: { $ifNull: ['$subscriptionName', null] },
            remainingDays: { $ifNull: ['$remainingDays', null] },
            secondaryZone: { $ifNull: ['$secondaryZone', null] },
            zoneId: { $ifNull: ['$serviceLocation', null] },
            isDisableReason: { $ifNull: ['$isDisableReason', 'APPROVED'] },
            isDisable: { $eq: [{ $ifNull: ['$isDisableReason', null] }, null] },
            todayStatus: {
              todayCompleted: { $ifNull: ['$todayStatus.todayCompleted', 0] },
              todayCancelled: { $ifNull: ['$todayStatus.todayCancelled', 0] },
              totalAmount: { $ifNull: ['$todayStatus.totalAmount', 0] },
              totalAssigned: { $ifNull: ['$todayStatus.totalAssigned', 0] },
              driverId: { $ifNull: ['$todayStatus.driverId', '$_id'] },
            },
            driver: {
              id: { $ifNull: ['$_id', null] },
              firstName: { $ifNull: ['$driverPersonalDetails.firstName', null] },
              regDate: { $ifNull: ['$driverPersonalDetails.regDate', null] },
              regTime: { $ifNull: ['$driverPersonalDetails.regTime', null] },
              lastName: { $ifNull: ['$driverPersonalDetails.lastName', null] },
              carNumber: { $ifNull: ['$carNumber', null] },
              serviceType: { $ifNull: ['$serviceType', null] },
              vehicleId: { $ifNull: ['$type', null] },
              walletBalance: {
                $cond: {
                  if: { $ifNull: ['$walletDetails.balance', false] },
                  then: { $round: ['$walletDetails.balance', 2] },
                  else: null,
                },
              },
            },
            user: {
              userId: { $ifNull: ['$user._id', null] },
              firstName: { $ifNull: ['$user.firstName', null] },
              lastName: { $ifNull: ['$user.lastName', null] },
              email: { $ifNull: ['$user.email', null] },
              phoneNumber: { $ifNull: ['$user.phoneNumber', null] },
              referralCode: { $ifNull: ['$user.referralCode', null] },
              gender: { $ifNull: ['$user.gender', null] },
              country: { $ifNull: ['$user.country', null] },
              profilePic: {
                $ifNull: [
                  {
                    $arrayElemAt: [
                      {
                        $map: {
                          input: '$driverDocumentDetails',
                          as: 'doc',
                          in: {
                            $concat: ['/uploads/documentimage/', { $ifNull: ['$$doc.documentImage', ''] }],
                          },
                        },
                      },
                      0,
                    ],
                  },
                  '',
                ],
              },
              adminPhoneNumber: { $ifNull: ['$clientDetails.phoneNumber', null] },
              headofficeNumber: { $ifNull: ['$clientDetails.emergencyNumber', null] },
            },
            trip: {
              $ifNull: [
                {
                  $let: {
                    vars: {
                      billingDetails: '$tripData.billingDetails',
                      ratingDetails: '$tripData.ratingDetails',
                      placeDetailsData: '$tripData.requestPlaceDetailsData',
                      userDetailsData: '$tripData.requestMetaUsers',
                      requestData: '$tripData.requestDetailsData',
                    },
                    in: {
                      $cond: {
                        if: {
                          $and: [
                            { $ne: [{ $ifNull: ['$$requestData', null] }, null] },
                            {
                              $and: [
                                { $eq: [{ $ifNull: ['$$requestData.isCancelled', false] }, false] },
                                { $eq: [{ $ifNull: ['$$requestData.isCompleted', false] }, false] },
                              ],
                            },
                          ],
                        },
                        then: {
                          _id: { $ifNull: ['$$requestData._id', null] },
                          requestNumber: { $ifNull: ['$$requestData.requestNumber', null] },
                          requestOtp: { $ifNull: ['$$requestData.requestOtp', null] },
                          isLater: { $ifNull: ['$$requestData.isLater', null] },
                          ifDispatch: { $ifNull: ['$$requestData.ifDispatch', null] },
                          zoneTypeId: { $ifNull: ['$$requestData.zoneTypeId', null] },
                          userId: { $ifNull: ['$$requestData.userId', null] },
                          unit: { $ifNull: ['$$requestData.unit', null] },
                          driverId: { $ifNull: ['$$requestData.driverId', null] },
                          tripStartTime: { $ifNull: ['$$requestData.tripStartTime', null] },
                          arrivedAt: { $ifNull: ['$$requestData.arrivedAt', null] },
                          acceptedAt: { $ifNull: ['$$requestData.acceptedAt', null] },
                          completedAt: { $ifNull: ['$$requestData.completedAt', null] },
                          cancelledAt: { $ifNull: ['$$requestData.cancelledAt', null] },
                          isDriverStarted: { $ifNull: ['$$requestData.isDriverStarted', null] },
                          isDriverArrived: { $ifNull: ['$$requestData.isDriverArrived', null] },
                          isTripStart: { $ifNull: ['$$requestData.isTripStart', null] },
                          isCompleted: { $ifNull: ['$$requestData.isCompleted', null] },
                          isCancelled: { $ifNull: ['$$requestData.isCancelled', null] },
                          customReason: { $ifNull: ['$$requestData.customReason', null] },
                          cancelMethod: { $ifNull: ['$$requestData.cancelMethod', null] },
                          totalDistance: { $ifNull: ['$$requestData.totalDistance', null] },
                          totalTime: { $ifNull: ['$$requestData.totalTime', null] },
                          isPaid: { $ifNull: ['$$requestData.isPaid', null] },
                          userRated: { $ifNull: ['$$requestData.userRated', null] },
                          driverRated: { $ifNull: ['$$requestData.driverRated', null] },
                          timezone: { $ifNull: ['$$requestData.timezone', null] },
                          attemptForSchedule: { $ifNull: ['$$requestData.attemptForSchedule', null] },
                          dispatcherId: { $ifNull: ['$$requestData.dispatcherId', null] },
                          driverNotes: { $ifNull: ['$$requestData.driverNotes', null] },
                          createdBy: { $ifNull: ['$$requestData.createdBy', null] },
                          paymentOpt: { $ifNull: ['$$requestData.paymentOpt', null] },
                          rideType: { $ifNull: ['$$requestData.rideType', null] },
                          locationChanged: { $ifNull: ['$$requestData.locationChanged', null] },
                          locationChangeAddress: { $ifNull: ['$$requestData.locationChangeAddress', null] },
                          startKm: { $toString: { $ifNull: ['$$requestData.startKm', 0] } },
                          startKmImage: {
                            $concat: ['/uploads/trips/', { $ifNull: ['$$requestData.startKmImage', ''] }],
                          },
                          endKm: { $toString: { $ifNull: ['$$requestData.endKm', 0] } },
                          endKmImage: {
                            $concat: ['/uploads/trips/', { $ifNull: ['$$requestData.endKmImage', ''] }],
                          },
                          requestedCurrencyCode: { $ifNull: ['$$requestData.requestedCurrencyCode', null] },
                          requestedCurrencySymbol: { $ifNull: ['$$requestData.requestedCurrencySymbol', null] },
                          promoId: { $ifNull: ['$$requestData.promoId', null] },
                          locationApprove: { $ifNull: ['$$requestData.locationApprove', null] },
                          availablesStatus: { $ifNull: ['$$requestData.availablesStatus', null] },
                          tripType: { $ifNull: ['$$requestData.tripType', null] },
                          rentalPackage: { $ifNull: ['$$requestData.rentalPackage', null] },
                          manualTrip: { $ifNull: ['$$requestData.manualTrip', null] },
                          packageId: { $ifNull: ['$$requestData.packageId', null] },
                          packageItemId: { $ifNull: ['$$requestData.packageItemId', null] },
                          bookingFor: { $ifNull: ['$$requestData.bookingFor', null] },
                          othersUserId: { $ifNull: ['$$requestData.othersUserId', null] },
                          othersName: {
                            $ifNull: ['$tripData.requestMetaUsers.firstName', null],
                          },
                          othersPhoneNumber: {
                            $ifNull: ['$tripData.requestMetaUsers.phoneNumber', null],
                          },
                          pickLat: { $ifNull: ['$$placeDetailsData.pickLat', null] },
                          pickLng: { $ifNull: ['$$placeDetailsData.pickLng', null] },
                          pickAddress: { $ifNull: ['$$placeDetailsData.pickAddress', null] },
                          dropLat: { $ifNull: ['$$placeDetailsData.dropLat', null] },
                          dropLng: { $ifNull: ['$$placeDetailsData.dropLng', null] },
                          dropAddress: { $ifNull: ['$$placeDetailsData.dropAddress', null] },
                          stopLat: { $ifNull: ['$$placeDetailsData.stopLat', null] },
                          stopLng: { $ifNull: ['$$placeDetailsData.stopLng', null] },
                          stopAddress: { $ifNull: ['$$placeDetailsData.stopAddress', null] },
                          rideType: { $ifNull: ['$$requestData.rideType', null] },
                          driverCommission: { $ifNull: ['$$requestData.driverCommission', 0] },
                          isDriverSubScriptionValid: { $ifNull: ['$isDriverSubscriptionValid', false] },
                          subscriptionName: { $ifNull: ['$subscriptionName', null] },
                          remainingDays: { $ifNull: ['$remainingDays', null] },
                          billingDetails: {
                            _id: { $ifNull: ['$$billingDetails._id', null] },
                            requestId: { $ifNull: ['$$billingDetails.requestId', null] },
                            basePrice: { $toString: { $ifNull: ['$$billingDetails.basePrice', 0] } },
                            baseDistance: { $toString: { $ifNull: ['$$billingDetails.baseDistance', 0] } },
                            totalDistance: { $toString: { $ifNull: ['$$billingDetails.totalDistance', 0] } },
                            totalTime: { $toString: { $ifNull: ['$$billingDetails.totalTime', 0] } },
                            pricePerDistance: { $toString: { $ifNull: ['$$billingDetails.pricePerDistance', 0] } },
                            distancePrice: { $toString: { $ifNull: ['$$billingDetails.distancePrice', 0] } },
                            pricePerTime: { $toString: { $ifNull: ['$$billingDetails.pricePerTime', 0] } },
                            timePrice: { $toString: { $ifNull: ['$$billingDetails.timePrice', 0] } },
                            waitingCharge: { $toString: { $ifNull: ['$$billingDetails.waitingCharge', 0] } },
                            cancellationFee: { $toString: { $ifNull: ['$$billingDetails.cancellationFee', 0] } },
                            serviceTax: { $toString: { $ifNull: ['$$billingDetails.serviceTax', 0] } },
                            serviceTaxPercentage: { $toString: { $ifNull: ['$$billingDetails.serviceTaxPercentage', 0] } },
                            promoDiscount: { $toString: { $ifNull: ['$$billingDetails.promoDiscount', 0] } },
                            adminCommission: { $toString: { $ifNull: ['$$billingDetails.adminCommission', 0] } },
                            adminCommissionWithTax: {
                              $toString: { $ifNull: ['$$billingDetails.adminCommissionWithTax', 0] },
                            },
                            driverCommission: { $toString: { $ifNull: ['$$billingDetails.driverCommission', 0] } },
                            totalAmount: { $toString: { $ifNull: ['$$billingDetails.totalAmount', 0] } },
                            requestedCurrencyCode: { $ifNull: ['$$billingDetails.requestedCurrencyCode', null] },
                            requestedCurrencySymbol: { $ifNull: ['$$billingDetails.requestedCurrencySymbol', null] },
                            createdAt: { $ifNull: ['$$billingDetails.createdAt', null] },
                            updatedAt: { $ifNull: ['$$billingDetails.updatedAt', null] },
                            subTotal: { $toString: { $ifNull: ['$$billingDetails.subTotal', 0] } },
                            outOfZonePrice: { $toString: { $ifNull: ['$$billingDetails.outOfZonePrice', 0] } },
                            bookingFees: { $toString: { $ifNull: ['$$billingDetails.bookingFees', 0] } },
                            hillStationPrice: { $toString: { $ifNull: ['$$billingDetails.hillStationPrice', 0] } },
                          },
                          ratingDetails: { $ifNull: ['$$ratingDetails', null] },
                          userDetails: { $ifNull: ['$$userDetailsData', null] },
                          driverAverageRating: 1,
                          userAverageRating: 1,
                        },
                        else: null,
                      },
                    },
                  },
                },
                null,
              ],
            },
          },
        },
      ],
    });
  } catch (error) {
    console.error('Error creating view:', error);
    throw error;
  }
};

const createUserRequestView = async () => {
  if (!mongoose.connection.db) {
    return;
  }

  const { db } = mongoose.connection;

  try {
    // Check if the view already exists
    const collections = await db.listCollections({ name: 'userRequestView' }).toArray();
    const viewExists = collections.length > 0;

    const settingsPlaces = await Settings.findOne({ name: 'adminNumber' });
    const adminNumber = settingsPlaces.value;

    if (viewExists) {
      // Recreate to ensure pipeline changes take effect.
      await db.collection('userRequestView').drop();
    }

    // Create the view
    await db.createCollection('userRequestView', {
      viewOn: 'users',
      pipeline: [
        {
          $lookup: {
            from: 'requests',
            let: { userId: '$_id' },
            pipeline: [
              // First lookup ratings for each request
              {
                $lookup: {
                  from: 'requestratings',
                  let: {
                    requestId: '$_id',
                    userId: '$$userId', // Assuming _id is the user's ID in the main collection
                  },
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $and: [{ $eq: ['$requestId', '$$requestId'] }, { $eq: ['$userId', '$$userId'] }],
                        },
                      },
                    },
                  ],
                  as: 'tripRatings',
                },
              },
              // Then apply your conditions
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$userId', '$$userId'] },
                      {
                        $or: [
                          {
                            $and: [
                              { $eq: ['$isCompleted', false] },
                              { $eq: ['$isCancelled', false] },
                              { $eq: ['$isPaid', false] },
                            ],
                          },
                          {
                            $and: [{ $eq: [{ $size: '$tripRatings' }, 0] }, { $eq: ['$isCancelled', false] }],
                          },
                        ],
                      },
                    ],
                  },
                },
              },
            ],
            as: 'requestDetails',
          },
        },
        {
          $unwind: {
            path: '$requestDetails',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'wallets',
            localField: '_id',
            foreignField: 'userId',
            as: 'walletDetails',
          },
        },
        {
          $lookup: {
            from: 'requestratings',
            let: {
              requestId: '$requestDetails._id',
              userId: '$_id', // Assuming _id is the user's ID in the main collection
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [{ $eq: ['$requestId', '$$requestId'] }, { $eq: ['$userId', '$$userId'] }],
                  },
                },
              },
            ],
            as: 'userRatingDetails',
          },
        },
        {
          $unwind: {
            path: '$userRatingDetails',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'demos',
            localField: 'adminDemoKey',
            foreignField: 'demoKey',
            as: 'demoKeyDetails',
          },
        },
        {
          $unwind: {
            path: '$demoKeyDetails',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'requestbills',
            let: { requestId: '$requestDetails._id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ['$requestId', '$$requestId'],
                  },
                },
              },
            ],
            as: 'billingDetails',
          },
        },
        {
          $lookup: {
            from: 'requestplaces',
            localField: 'requestDetails._id',
            foreignField: 'requestId',
            as: 'placesDetails',
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'requestDetails.othersUserId',
            foreignField: '_id',
            as: 'requestOthersUserUsers',
          },
        },
        {
          $unwind: {
            path: '$requestOthersUserUsers',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'requestratings',
            localField: 'requestDetails._id',
            foreignField: 'requestId',
            as: 'ratingDetails',
          },
        },
        {
          $lookup: {
            from: 'drivers',
            localField: 'requestDetails.driverId',
            foreignField: '_id',
            as: 'driverDetails',
          },
        },
        {
          $unwind: {
            path: '$driverDetails',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'countries',
            let: { countryId: '$country' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: [
                      '$_id',
                      { $toObjectId: '$$countryId' }, // Convert string to ObjectId
                    ],
                  },
                },
              },
            ],
            as: 'countriesDetails',
          },
        },
        {
          $unwind: {
            path: '$countriesDetails',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'vehicles',
            localField: 'driverDetails.type',
            foreignField: '_id',
            as: 'vehicleDetails',
          },
        },
        {
          $lookup: {
            from: 'vehiclemodels',
            localField: 'driverDetails.carModel',
            foreignField: '_id',
            as: 'vehicleModelDetails',
          },
        },
        {
          $unwind: {
            path: '$billingDetails',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $unwind: {
            path: '$ratingDetails',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $unwind: {
            path: '$placesDetails',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'driverDetails.userId',
            foreignField: '_id',
            as: 'driverPersonalDetails',
          },
        },
        {
          $unwind: {
            path: '$driverPersonalDetails',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $unwind: {
            path: '$vehicleDetails',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $unwind: {
            path: '$vehicleModelDetails',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'requestratings',
            let: { userId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ['$_id', '$$userId'],
                  },
                },
              },
            ],
            as: 'userAllRatings',
          },
        },
        {
          $lookup: {
            from: 'requestratings',
            let: { userId: '$requestDetails.driverId' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ['$userId', '$$userId'],
                  },
                },
              },
            ],
            as: 'driverAllRatings',
          },
        },
        {
          $addFields: {
            driverAverageRating: {
              $toInt: {
                $ifNull: [{ $avg: '$driverAllRatings.rating' }, 0],
              },
            },
            userAverageRating: {
              $toInt: {
                $ifNull: [{ $avg: '$userAllRatings.rating' }, 0],
              },
            },
            isDemoValid: {
              $cond: {
                if: { $ifNull: ['$demoKeyDetails', false] }, // Check if demoKeyDetails exists
                then: {
                  // If demoKeyDetails exists
                  $cond: {
                    if: { $gt: ['$demoKeyDetails.Enddate', new Date()] }, // Check if EndDate is in future
                    then: {
                      // If demoKeyDetails exists
                      $cond: {
                        if: { $eq: ['$demoKeyDetails.status', true] }, // Check if EndDate is in future
                        then: true,
                        else: false,
                      },
                    },
                    else: false,
                  },
                },
                else: null, // If demoKeyDetails is null
              },
            },
          },
        },
        {
          $lookup: {
            from: 'clients',
            let: { clientId: '$clientId' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ['$_id', '$$clientId'],
                  },
                },
              },
            ],
            as: 'clientData',
          },
        },
        {
          $unwind: {
            path: '$clientData',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'users',
            let: { userId: '$clientData.userId' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ['$_id', '$$userId'],
                  },
                },
              },
            ],
            as: 'clientDetails',
          },
        },
        {
          $unwind: {
            path: '$clientDetails',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: { $ifNull: ['$_id', null] },
            clientId: { $ifNull: ['$clientId', null] },
            adminNumber,
            countryCode: '$countriesDetails.dial_code',
            currencySymbol: '$countriesDetails.currency_symbol',
            isDemoValid: { $ifNull: ['$isDemoValid', null] },
            user: {
              _id: { $ifNull: ['$_id', null] },
              firstName: { $ifNull: ['$firstName', null] },
              lastName: { $ifNull: ['$lastName', null] },
              email: { $ifNull: ['$email', null] },
              phoneNumber: { $ifNull: ['$phoneNumber', null] },
              referralCode: { $ifNull: ['$referralCode', null] },
              gender: { $ifNull: ['$gender', null] },
              zoneId: { $ifNull: ['$zoneId', null] },
              country: { $ifNull: ['$country', null] },
              profilePic: { $concat: ['', '$profilePic'] },
              active: { $ifNull: ['$active', null] },
              regDate: { $ifNull: ['$regDate', null] },
              regTime: { $ifNull: ['$regTime', null] },
              adminPhoneNumber: { $ifNull: ['$clientDetails.phoneNumber', null] },
              headofficeNumber: { $ifNull: ['$clientDetails.emergencyNumber', null] },
            },

            trip: {
              $cond: {
                if: {
                  $or: [
                    {
                      $and: [
                        { $ne: [{ $ifNull: ['$requestDetails', null] }, null] },
                        { $eq: [{ $ifNull: ['$requestDetails.isCancelled', false] }, false] },
                        { $eq: [{ $ifNull: ['$requestDetails.isCompleted', false] }, false] },
                      ],
                    },
                    {
                      $and: [
                        { $eq: [{ $ifNull: ['$requestDetails.isLater', false] }, true] },
                        { $ne: ['$requestDetails.driverId', null] },
                        { $eq: [{ $ifNull: ['$requestDetails.isCancelled', false] }, false] },
                        { $eq: [{ $ifNull: ['$requestDetails.isCompleted', false] }, false] },
                      ],
                    },
                    { $ne: ['$userRatingDetails', null] },
                  ],
                },
                then: {
                  _id: { $ifNull: ['$requestDetails._id', null] },
                  requestNumber: { $ifNull: ['$requestDetails.requestNumber', null] },
                  requestOtp: { $ifNull: ['$requestDetails.requestOtp', null] },
                  driverAverageRating: 1,
                  userAverageRating: 1,
                  isLater: { $ifNull: ['$requestDetails.isLater', null] },
                  ifDispatch: { $ifNull: ['$requestDetails.ifDispatch', null] },
                  zoneTypeId: { $ifNull: ['$requestDetails.zoneTypeId', null] },
                  userId: { $ifNull: ['$requestDetails.userId', null] },
                  driverId: { $ifNull: ['$requestDetails.driverId', null] },
                  tripStartTime: { $ifNull: ['$requestDetails.tripStartTime', null] },
                  arrivedAt: { $ifNull: ['$requestDetails.arrivedAt', null] },
                  acceptedAt: { $ifNull: ['$requestDetails.acceptedAt', null] },
                  completedAt: { $ifNull: ['$requestDetails.completedAt', null] },
                  cancelledAt: { $ifNull: ['$requestDetails.cancelledAt', null] },
                  isDriverStarted: { $ifNull: ['$requestDetails.isDriverStarted', null] },
                  isDriverArrived: { $ifNull: ['$requestDetails.isDriverArrived', null] },
                  isTripStart: { $ifNull: ['$requestDetails.isTripStart', null] },
                  isCompleted: { $ifNull: ['$requestDetails.isCompleted', null] },
                  isCancelled: { $ifNull: ['$requestDetails.isCancelled', null] },
                  customReason: { $ifNull: ['$requestDetails.customReason', null] },
                  cancelMethod: { $ifNull: ['$requestDetails.cancelMethod', null] },
                  totalDistance: { $ifNull: ['$requestDetails.totalDistance', null] },
                  unit: { $ifNull: ['$requestDetails.unit', null] },
                  totalTime: { $ifNull: ['$requestDetails.totalTime', null] },
                  isPaid: { $ifNull: ['$requestDetails.isPaid', null] },
                  userRated: { $ifNull: ['$requestDetails.userRated', null] },
                  driverRated: { $ifNull: ['$requestDetails.driverRated', null] },
                  timezone: { $ifNull: ['$requestDetails.timezone', null] },
                  attemptForSchedule: { $ifNull: ['$requestDetails.attemptForSchedule', null] },
                  dispatcherId: { $ifNull: ['$requestDetails.dispatcherId', null] },
                  driverNotes: { $ifNull: ['$requestDetails.driverNotes', null] },
                  createdBy: { $ifNull: ['$requestDetails.createdBy', null] },
                  paymentOpt: { $ifNull: ['$requestDetails.paymentOpt', null] },
                  rideType: { $ifNull: ['$requestDetails.rideType', null] },
                  locationChanged: { $ifNull: ['$requestDetails.locationChanged', null] },
                  locationChangeAddress: { $ifNull: ['$requestDetails.locationChangeAddress', null] },
                  requestedCurrencyCode: { $ifNull: ['$requestDetails.requestedCurrencyCode', null] },
                  requestedCurrencySymbol: { $ifNull: ['$requestDetails.requestedCurrencySymbol', null] },
                  promoId: { $ifNull: ['$requestDetails.promoId', null] },
                  locationApprove: { $ifNull: ['$requestDetails.locationApprove', null] },
                  availablesStatus: { $ifNull: ['$requestDetails.availablesStatus', null] },
                  tripType: { $ifNull: ['$requestDetails.tripType', null] },
                  rentalPackage: { $ifNull: ['$requestDetails.rentalPackage', null] },
                  manualTrip: { $ifNull: ['$requestDetails.manualTrip', null] },
                  packageId: { $ifNull: ['$requestDetails.packageId', null] },
                  packageItemId: { $ifNull: ['$requestDetails.packageItemId', null] },
                  bookingFor: { $ifNull: ['$requestDetails.bookingFor', null] },
                  othersUserId: { $ifNull: ['$requestDetails.othersUserId', null] },
                  othersName: { $ifNull: ['$requestOthersUserUsers.firstName', null] },
                  othersPhoneNumber: { $ifNull: ['$requestOthersUserUsers.phoneNumber', null] },
                  pickLat: { $ifNull: ['$placesDetails.pickLat', null] },
                  pickLng: { $ifNull: ['$placesDetails.pickLng', null] },
                  pickAddress: { $ifNull: ['$placesDetails.pickAddress', null] },
                  dropLat: { $ifNull: ['$placesDetails.dropLat', null] },
                  dropLng: { $ifNull: ['$placesDetails.dropLng', null] },
                  dropAddress: { $ifNull: ['$placesDetails.dropAddress', null] },
                  stopLat: { $ifNull: ['$placeDetails.stopLat', null] },
                  stopLng: { $ifNull: ['$placeDetails.stopLng', null] },
                  stopAddress: { $ifNull: ['$placeDetails.stopAddress', null] },
                  startKm: { $toString: { $ifNull: ['$requestDetails.startKm', 0] } },
                  startKmImage: {
                    $concat: ['/uploads/trips/', { $ifNull: ['$requestDetails.startKmImage', ''] }],
                  },
                  endKm: { $toString: { $ifNull: ['$requestDetails.endKm', 0] } },
                  endKmImage: {
                    $concat: ['/uploads/trips/', { $ifNull: ['$requestDetails.endKmImage', ''] }],
                  },
                  billingDetails: {
                    _id: { $ifNull: ['$billingDetails._id', null] },
                    requestId: { $ifNull: ['$billingDetails.requestId', null] },
                    basePrice: { $toString: { $ifNull: ['$billingDetails.basePrice', 0] } },
                    baseDistance: { $toString: { $ifNull: ['$billingDetails.baseDistance', 0] } },
                    totalDistance: { $toString: { $ifNull: ['$billingDetails.totalDistance', 0] } },
                    totalTime: { $toString: { $ifNull: ['$billingDetails.totalTime', 0] } },
                    pricePerDistance: { $toString: { $ifNull: ['$billingDetails.pricePerDistance', 0] } },
                    distancePrice: { $toString: { $ifNull: ['$billingDetails.distancePrice', 0] } },
                    pricePerTime: { $toString: { $ifNull: ['$billingDetails.pricePerTime', 0] } },
                    timePrice: { $toString: { $ifNull: ['$billingDetails.timePrice', 0] } },
                    waitingCharge: { $toString: { $ifNull: ['$billingDetails.waitingCharge', 0] } },
                    cancellationFee: { $toString: { $ifNull: ['$billingDetails.cancellationFee', 0] } },
                    serviceTax: { $toString: { $ifNull: ['$billingDetails.serviceTax', 0] } },
                    serviceTaxPercentage: { $toString: { $ifNull: ['$billingDetails.serviceTaxPercentage', 0] } },
                    promoDiscount: { $toString: { $ifNull: ['$billingDetails.promoDiscount', 0] } },
                    adminCommission: { $toString: { $ifNull: ['$billingDetails.adminCommission', 0] } },
                    adminCommissionWithTax: { $toString: { $ifNull: ['$billingDetails.adminCommissionWithTax', 0] } },
                    driverCommission: { $toString: { $ifNull: ['$billingDetails.driverCommission', 0] } },
                    totalAmount: { $toString: { $ifNull: ['$billingDetails.totalAmount', 0] } },
                    requestedCurrencyCode: { $ifNull: ['$billingDetails.requestedCurrencyCode', null] },
                    requestedCurrencySymbol: { $ifNull: ['$billingDetails.requestedCurrencySymbol', null] },
                    createdAt: { $ifNull: ['$billingDetails.createdAt', null] },
                    updatedAt: { $ifNull: ['$billingDetails.updatedAt', null] },
                    subTotal: { $toString: { $ifNull: ['$billingDetails.subTotal', 0] } },
                    outOfZonePrice: { $toString: { $ifNull: ['$billingDetails.outOfZonePrice', 0] } },
                    bookingFees: { $toString: { $ifNull: ['$billingDetails.bookingFees', 0] } },
                    hillStationPrice: { $toString: { $ifNull: ['$billingDetails.hillStationPrice', 0] } },
                  },
                  ratingDetails: { $ifNull: ['$ratingDetails', null] },
                  driver: {
                    userId: { $ifNull: ['$driverDetails.userId', null] },
                    carNumber: { $ifNull: ['$driverDetails.carNumber', null] },
                    carColor: { $ifNull: ['$driverDetails.carColour', null] },
                    _id: { $ifNull: ['$driverPersonalDetails._id', null] },
                    regDate: { $ifNull: ['$driverPersonalDetails.regDate', null] },
                    regTime: { $ifNull: ['$driverPersonalDetails.regTime', null] },
                    referralCode: { $ifNull: ['$driverPersonalDetails.referralCode', null] },
                    firstName: { $ifNull: ['$driverPersonalDetails.firstName', null] },
                    lastName: { $ifNull: ['$driverPersonalDetails.lastName', null] },
                    email: { $ifNull: ['$driverPersonalDetails.email', null] },
                    phoneNumber: { $ifNull: ['$driverPersonalDetails.phoneNumber', null] },
                    emergencyNumber: { $ifNull: ['$driverPersonalDetails.emergencyNumber', null] },
                    gender: { $ifNull: ['$driverPersonalDetails.gender', null] },
                    language: { $ifNull: ['$driverPersonalDetails.language', null] },
                    country: { $ifNull: ['$driverPersonalDetails.country', null] },
                    address: { $ifNull: ['$driverPersonalDetails.address', null] },
                    profilePic: { $ifNull: ['$driverPersonalDetails.profilePic', null] },
                    active: { $ifNull: ['$driverPersonalDetails.active', null] },
                  },
                  vehicleDetails: {
                    vehicleName: { $ifNull: ['$vehicleDetails.vehicleName', null] },
                    image: {
                      $concat: ['/uploads/vehicles/', { $ifNull: ['$vehicleDetails.image', ''] }],
                    },
                    capacity: { $ifNull: ['$vehicleDetails.capacity', null] },
                    serviceType: { $ifNull: ['$vehicleDetails.serviceType', null] },
                    categoryId: { $ifNull: ['$vehicleDetails.categoryId', null] },
                    sortingorder: { $ifNull: ['$vehicleDetails.sortingorder', null] },
                    highlightImage: {
                      $concat: ['/uploads/vehicles/', { $ifNull: ['$vehicleDetails.highlightImage', ''] }],
                    },
                    status: { $ifNull: ['$vehicleDetails.status', null] },
                    clientId: { $ifNull: ['$vehicleDetails.clientId', null] },
                  },
                  vehicleModelDetails: {
                    modelname: { $ifNull: ['$vehicleModelDetails.modelname', null] },
                    description: { $ifNull: ['$vehicleModelDetails.description', null] },
                    image: {
                      $concat: ['/uploads/vehicleModels/', { $ifNull: ['$vehicleModelDetails.image', ''] }],
                    },
                    vehicleId: { $ifNull: ['$vehicleModelDetails.vehicleId', null] },
                    status: { $ifNull: ['$vehicleModelDetails.status', null] },
                    clientId: { $ifNull: ['$vehicleModelDetails.clientId', null] },
                  },
                },
                else: null,
              },
            },
          },
        },
      ],
    });
  } catch (error) {
    console.error('Error creating user request view:', error);
    throw error;
  }
};

const createRequestListView = async () => {
  if (!mongoose.connection.db) {
    return;
  }

  const { db } = mongoose.connection;

  try {
    // Check if the view already exists
    const collections = await db.listCollections({ name: 'requestListView' }).toArray();
    const viewExists = collections.length > 0;

    if (viewExists) {
      return;
    }

    // Create the view
    await db.createCollection('requestListView', {
      viewOn: 'requests',
      pipeline: [
        {
          $lookup: {
            from: 'requestbills',
            localField: '_id',
            foreignField: 'requestId',
            as: 'billingDetails',
          },
        },
        {
          $lookup: {
            from: 'requestplaces',
            localField: '_id',
            foreignField: 'requestId',
            as: 'placesDetails',
          },
        },
        {
          $lookup: {
            from: 'requestratings',
            localField: '_id',
            foreignField: 'requestId',
            as: 'ratingDetails',
          },
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
          $lookup: {
            from: 'users',
            localField: 'othersUserId',
            foreignField: '_id',
            as: 'requestOthersUserUsers',
          },
        },
        {
          $unwind: {
            path: '$requestOthersUserUsers',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'drivers',
            localField: 'driverId',
            foreignField: '_id',
            as: 'driverDetails',
          },
        },
        {
          $unwind: {
            path: '$billingDetails',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $unwind: {
            path: '$ratingDetails',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $unwind: {
            path: '$user',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $unwind: {
            path: '$driverDetails',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'driverDetails.userId',
            foreignField: '_id',
            as: 'driverPersonalDetails',
          },
        },
        {
          $lookup: {
            from: 'vehicles',
            localField: 'vehicleId',
            foreignField: '_id',
            as: 'vehicleDetails',
          },
        },
        {
          $lookup: {
            from: 'vehiclemodels',
            localField: 'vehicleDetails._id',
            foreignField: 'vehicleId',
            as: 'vehicleModelDetails',
          },
        },
        {
          $unwind: {
            path: '$driverPersonalDetails',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $unwind: {
            path: '$vehicleDetails',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $unwind: {
            path: '$vehicleModelDetails',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'requestplaces',
            localField: '_id',
            foreignField: 'requestId',
            as: 'placeDetails',
          },
        },
        {
          $unwind: {
            path: '$placeDetails',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'requestratings',
            let: { userId: '$userId' },
            pipeline: [
              { $match: { $expr: { $eq: ['$userId', '$$userId'] } } },
              { $group: { _id: null, avgUserRating: { $avg: '$rating' } } },
            ],
            as: 'userAvgRating',
          },
        },
        {
          $unwind: {
            path: '$userAvgRating',
            preserveNullAndEmptyArrays: true,
          },
        },

        {
          $project: {
            placesDetails: 1,
            _id: { $ifNull: ['$_id', null] },
            requestNumber: { $ifNull: ['$requestNumber', null] },
            estimatedAmount: { $ifNull: ['$estimatedAmount', null] },
            // avgUserRating: { $ifNull: ['$userAvgRating.avgUserRating', null] },
            avgUserRating: {
              $ifNull: [{ $round: ['$userAvgRating.avgUserRating', 2] }, null],
            },
            vehicleName: { $ifNull: ['$vehicleDetails.vehicleName', null] },
            requestOtp: { $ifNull: ['$requestOtp', null] },
            isLater: { $ifNull: ['$isLater', null] },
            isInstantTrip: { $ifNull: ['$isInstantTrip', null] },
            ifDispatch: { $ifNull: ['$ifDispatch', null] },
            zoneTypeId: { $ifNull: ['$zoneTypeId', null] },
            userId: { $ifNull: ['$userId', null] },
            driverId: { $ifNull: ['$driverId', null] },
            tripStartTime: { $ifNull: ['$tripStartTime', null] },
            driverCommission: { $ifNull: ['$driverCommission', 0] },
            arrivedAt: { $ifNull: ['$arrivedAt', null] },
            acceptedAt: { $ifNull: ['$acceptedAt', null] },
            completedAt: { $ifNull: ['$completedAt', null] },
            cancelledAt: { $ifNull: ['$cancelledAt', null] },
            isDriverStarted: { $ifNull: ['$isDriverStarted', null] },
            isDriverArrived: { $ifNull: ['$isDriverArrived', null] },
            isTripStart: { $ifNull: ['$isTripStart', null] },
            isCompleted: { $ifNull: ['$isCompleted', null] },
            isCancelled: { $ifNull: ['$isCancelled', null] },
            customReason: { $ifNull: ['$customReason', null] },
            cancelMethod: { $ifNull: ['$cancelMethod', null] },
            totalDistance: { $ifNull: ['$totalDistance', null] },
            locationChanged: { $ifNull: ['$locationChanged', null] },
            locationChangeAddress: { $ifNull: ['$locationChangeAddress', null] },
            totalTime: { $ifNull: ['$totalTime', null] },
            isPaid: { $ifNull: ['$isPaid', null] },
            userRated: { $ifNull: ['$userRated', null] },
            driverRated: { $ifNull: ['$driverRated', null] },
            timezone: { $ifNull: ['$timezone', null] },
            attemptForSchedule: { $ifNull: ['$attemptForSchedule', null] },
            dispatcherId: { $ifNull: ['$dispatcherId', null] },
            driverNotes: { $ifNull: ['$driverNotes', null] },
            createdBy: { $ifNull: ['$createdBy', null] },
            adminDemoKey: { $ifNull: ['$adminDemoKey', null] },
            paymentOpt: { $ifNull: ['$paymentOpt', null] },
            rideType: { $ifNull: ['$rideType', null] },
            unit: { $ifNull: ['$unit', null] },
            requestedCurrencyCode: { $ifNull: ['$requestedCurrencyCode', null] },
            requestedCurrencySymbol: { $ifNull: ['$requestedCurrencySymbol', null] },
            promoId: { $ifNull: ['$promoId', null] },
            locationApprove: { $ifNull: ['$locationApprove', null] },
            holdStatus: { $ifNull: ['$holdStatus', null] },
            availablesStatus: { $ifNull: ['$availablesStatus', null] },
            tripType: { $ifNull: ['$tripType', null] },
            rentalPackage: { $ifNull: ['$rentalPackage', null] },
            manualTrip: { $ifNull: ['$manualTrip', null] },
            outstationId: { $ifNull: ['$outstationId', null] },
            outstationTypeId: { $ifNull: ['$outstationTypeId', null] },
            packageId: { $ifNull: ['$packageId', null] },
            packageItemId: { $ifNull: ['$packageItemId', null] },
            bookingFor: { $ifNull: ['$bookingFor', null] },
            othersUserId: { $ifNull: ['$othersUserId', null] },
            othersName: { $ifNull: ['$requestOthersUserUsers.firstName', null] },
            othersPhoneNumber: { $ifNull: ['$requestOthersUserUsers.phoneNumber', null] },
            startKm: { $toString: { $ifNull: ['$startKm', 0] } },
            startKmImage: {
              $ifNull: [{ $concat: ['/uploads/trips/', '$startKmImage'] }, null],
            },
            endKm: { $toString: { $ifNull: ['$endKm', 0] } },
            endKmImage: {
              $ifNull: [{ $concat: ['/uploads/trips/', '$endKmImage'] }, null],
            },
            clientId: { $ifNull: ['$user.clientId', null] },
            pickLat: { $ifNull: ['$placeDetails.pickLat', null] },
            pickLng: { $ifNull: ['$placeDetails.pickLng', null] },
            pickAddress: { $ifNull: ['$placeDetails.pickAddress', null] },
            dropLat: { $ifNull: ['$placeDetails.dropLat', null] },
            dropLng: { $ifNull: ['$placeDetails.dropLng', null] },
            dropAddress: { $ifNull: ['$placeDetails.dropAddress', null] },
            stopLat: { $ifNull: ['$placeDetails.stopLat', null] },
            stopLng: { $ifNull: ['$placeDetails.stopLng', null] },
            stopAddress: { $ifNull: ['$placeDetails.stopAddress', null] },
            driverDetails: {
              // _id: { $ifNull: ['$driverDetails._id', null] },
              userId: { $ifNull: ['$driverDetails.userId', null] },
              carNumber: { $ifNull: ['$driverDetails.carNumber', null] },
              _id: { $ifNull: ['$driverPersonalDetails._id', null] },
              firstName: { $ifNull: ['$driverPersonalDetails.firstName', null] },
              lastName: { $ifNull: ['$driverPersonalDetails.lastName', null] },
              email: { $ifNull: ['$driverPersonalDetails.email', null] },
              phoneNumber: { $ifNull: ['$driverPersonalDetails.phoneNumber', null] },
              emergencyNumber: { $ifNull: ['$driverPersonalDetails.emergencyNumber', null] },
              gender: { $ifNull: ['$driverPersonalDetails.gender', null] },
              language: { $ifNull: ['$driverPersonalDetails.language', null] },
              country: { $ifNull: ['$driverPersonalDetails.country', null] },
              address: { $ifNull: ['$driverPersonalDetails.address', null] },
              profilePic: { $ifNull: [{ $concat: ['/uploads/user/', '$driverPersonalDetails.profilePic'] }, null] },
              active: { $ifNull: ['$driverPersonalDetails.active', null] },
              clientId: { $ifNull: ['$driverPersonalDetails.clientId', null] },
            },

            user: {
              _id: { $ifNull: ['$user._id', null] },
              firstName: { $ifNull: ['$user.firstName', null] },
              lastName: { $ifNull: ['$user.lastName', null] },
              email: { $ifNull: ['$user.email', null] },
              phoneNumber: { $ifNull: ['$user.phoneNumber', null] },
              emergencyNumber: { $ifNull: ['$user.emergencyNumber', null] },
              referralCode: { $ifNull: ['$user.referralCode', null] },
              gender: { $ifNull: ['$user.gender', null] },
              language: { $ifNull: ['$user.language', null] },
              country: { $ifNull: ['$user.country', null] },
              address: { $ifNull: ['$user.address', null] },
              active: { $ifNull: ['$user.active', null] },
              profilePic: { $ifNull: ['$user.profilePic', null] },
              password: { $ifNull: ['$user.password', null] },
              clientId: { $ifNull: ['$user.clientId', null] },
            },
            billingDetails: {
              _id: { $ifNull: ['$billingDetails._id', null] },
              requestId: { $ifNull: ['$billingDetails.requestId', null] },
              basePrice: { $toString: { $ifNull: ['$billingDetails.basePrice', 0] } },
              baseDistance: { $toString: { $ifNull: ['$billingDetails.baseDistance', 0] } },
              totalDistance: { $toString: { $ifNull: ['$billingDetails.totalDistance', 0] } },
              totalTime: { $toString: { $ifNull: ['$billingDetails.totalTime', 0] } },
              pricePerDistance: { $toString: { $ifNull: ['$billingDetails.pricePerDistance', 0] } },
              distancePrice: { $toString: { $ifNull: ['$billingDetails.distancePrice', 0] } },
              pricePerTime: { $toString: { $ifNull: ['$billingDetails.pricePerTime', 0] } },
              timePrice: { $toString: { $ifNull: ['$billingDetails.timePrice', 0] } },
              waitingCharge: { $toString: { $ifNull: ['$billingDetails.waitingCharge', 0] } },
              cancellationFee: { $toString: { $ifNull: ['$billingDetails.cancellationFee', 0] } },
              serviceTax: { $toString: { $ifNull: ['$billingDetails.serviceTax', 0] } },
              serviceTaxPercentage: { $toString: { $ifNull: ['$billingDetails.serviceTaxPercentage', 0] } },
              promoDiscount: { $toString: { $ifNull: ['$billingDetails.promoDiscount', 0] } },
              adminCommission: { $toString: { $ifNull: ['$billingDetails.adminCommission', 0] } },
              adminCommissionWithTax: { $toString: { $ifNull: ['$billingDetails.adminCommissionWithTax', 0] } },
              driverCommission: { $toString: { $ifNull: ['$billingDetails.driverCommission', 0] } },
              totalAmount: { $toString: { $ifNull: ['$billingDetails.totalAmount', 0] } },
              requestedCurrencyCode: { $ifNull: ['$billingDetails.requestedCurrencyCode', null] },
              requestedCurrencySymbol: { $ifNull: ['$billingDetails.requestedCurrencySymbol', null] },
              createdAt: { $ifNull: ['$billingDetails.createdAt', null] },
              updatedAt: { $ifNull: ['$billingDetails.updatedAt', null] },
              subTotal: { $toString: { $ifNull: ['$billingDetails.subTotal', 0] } },
              outOfZonePrice: { $toString: { $ifNull: ['$billingDetails.outOfZonePrice', 0] } },
              bookingFees: { $toString: { $ifNull: ['$billingDetails.bookingFees', 0] } },
              hillStationPrice: { $toString: { $ifNull: ['$billingDetails.hillStationPrice', 0] } },
            },
            ratingDetails: {
              rating: { $ifNull: ['$ratingDetails.rating', null] },
              feedback: { $ifNull: ['$ratingDetails.feedback', null] },
              userId: { $ifNull: ['$ratingDetails.userId', null] },
              requestId: { $ifNull: ['$ratingDetails.requestId', null] },
              createdAt: { $ifNull: ['$ratingDetails.createdAt', null] },
              updatedAt: { $ifNull: ['$ratingDetails.updatedAt', null] },
              deletedAt: { $ifNull: ['$ratingDetails.deletedAt', null] },
            },
            vehicleDetails: {
              vehicleName: { $ifNull: ['$vehicleDetails.vehicleName', null] },
              image: { $ifNull: [{ $concat: ['/uploads/vehicles/', '$vehicleDetails.image'] }, null] },
              capacity: { $ifNull: ['$vehicleDetails.capacity', null] },
              serviceType: { $ifNull: ['$vehicleDetails.serviceType', null] },
              categoryId: { $ifNull: ['$vehicleDetails.categoryId', null] },
              sortingorder: { $ifNull: ['$vehicleDetails.sortingorder', null] },
              highlightImage: {
                $ifNull: [{ $concat: ['/uploads/vehicles/', '$vehicleDetails.highlightImage'] }, null],
              },
              status: { $ifNull: ['$vehicleDetails.status', null] },
              clientId: { $ifNull: ['$vehicleDetails.clientId', null] },
            },

            vehicleModelDetails: {
              modelname: { $ifNull: ['$vehicleModelDetails.modelname', null] },
              description: { $ifNull: ['$vehicleModelDetails.description', null] },
              image: {
                $ifNull: [{ $concat: ['/uploads/vehicleModels/', '$vehicleModelDetails.image'] }, null],
              },
              vehicleId: { $ifNull: ['$vehicleModelDetails.vehicleId', null] },
              status: { $ifNull: ['$vehicleModelDetails.status', null] },
              clientId: { $ifNull: ['$vehicleModelDetails.clientId', null] },
            },
          },
        },
      ],
    });
  } catch (error) {
    console.error('Error creating request list view:', error);
    throw error;
  }
};

module.exports = {
  DriverDailyReport,
  createDriverRequestView,
  createUserRequestView,
  createRequestListView,
};
