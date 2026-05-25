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
  const db = mongoose.connection.db;

  try {
    // Drop the existing view (if it exists)
    const collections = await db.listCollections({ name: 'driverDailyView' }).toArray();
    const viewExists = collections.length > 0;
    if (viewExists) {
      console.log('View "driverDailyView" already exists, skipping creation.');
    } else {
      await db.createCollection("driverDailyView", {
        viewOn: "requests",
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
              from: "requestbills",
              localField: "_id",
              foreignField: "requestId",
              as: "billing",
            },
          },
          {
            $unwind: { path: "$billing", preserveNullAndEmptyArrays: true },
          },
          {
            $project: {
              driverId: 1,
              isCompleted: 1,
              isCancelled: 1,
              billing: { $ifNull: ["$billing", { totalAmount: 0 }] }
            }
          },
          {
            $group: {
              _id: "$driverId",
              todayCompleted: { $sum: { $cond: ["$isCompleted", 1, 0] } },
              todayCancelled: { $sum: { $cond: ["$isCancelled", 1, 0] } },
              totalAmount: { $sum: "$billing.totalAmount" },
              totalAssigned: {
                $sum: {
                  $cond: [
                    { $and: [{ $eq: ["$isCompleted", false] }, { $eq: ["$isCancelled", false] }] },
                    1,
                    0,
                  ],
                },
              },
            },
          },
          {
            $project: {
              driverId: "$_id",
              todayCompleted: 1,
              todayCancelled: 1,
              totalAmount: 1,
              totalAssigned: 1,
              _id: 0,
            }
          }
        ]
      });
    }

  } catch (error) {
    console.error('Error creating view:', error);
    throw error; // Re-throw the error for the caller to handle
  }
};

// const createDriverRequestView = async () => {
//   if (!mongoose.connection.db) {
//     return;
//   }

//   const db = mongoose.connection.db;

//   try {

//     const driverDocumetID = await getDriverDocumentsByName();


//     // Check if the view already exists
//     const collections = await db.listCollections({ name: 'driverRequestDetailedView' }).toArray();
//     const viewExists = collections.length > 0;

//     if (viewExists) {
//       return;
//     }

//     // Get the documents collection first since we need it in the pipeline
//     const documents = await Document.find({ status: true }).lean();

//     // Create the view
//     await db.createCollection("driverRequestDetailedView", {
//       viewOn: "drivers",
//       pipeline: [
//         {
//           $lookup: {
//             from: 'driverdocuments',
//             localField: '_id',
//             foreignField: 'driverId',
//             as: 'driverDocumentDetails'
//           }
//         },
//         {
//           $lookup: {
//             from: 'wallets',
//             localField: 'userId',
//             foreignField: 'userId',
//             as: 'walletDetails'
//           }
//         },
//         {
//           $lookup: {
//             from: 'driverDailyView',
//             let: { driverId: '$_id' }, // Use driverId from the drivers collection
//             pipeline: [
//               {
//                 $match: {
//                   $expr: {
//                     $and: [
//                       { $eq: ['$driverId', '$$driverId'] }, // Match requests for this driver
//                     ]
//                   }
//                 }
//               }
//             ],
//             as: 'todayStatus'
//           },
//         },
//         {
//           $lookup: {
//             from: 'requestratings',
//             let: { driverId: '$userId' },
//             pipeline: [
//               {
//                 $match: {
//                   $expr: {
//                     $eq: ['$userId', '$$driverId']
//                   }
//                 }
//               }
//             ],
//             as: 'driverAllRatings'
//           }
//         },
//         {
//           $unwind: {
//             path: '$todayStatus',
//             preserveNullAndEmptyArrays: true,
//           }
//         },
//         {
//           $lookup: {
//             from: 'requestmetas',
//             let: { driverId: '$_id' },
//             pipeline: [
//               {
//                 $match: {
//                   $expr: {
//                     $and: [
//                       { $eq: ['$driverId', '$$driverId'] },
//                       { $eq: ['$active', true] }
//                     ]
//                   }
//                 }
//               }
//             ],
//             as: 'requestMetaDetails'
//           }
//         },
//         {
//           $unwind: {
//             path: '$requestMetaDetails',
//             preserveNullAndEmptyArrays: true,
//           }
//         },
//         {
//           $lookup: {
//             from: 'requests',
//             let: { requestId: '$requestMetaDetails.requestId' },
//             pipeline: [
//               {
//                 $match: {
//                   $expr: {
//                     $eq: ['$_id', '$$requestId']
//                   }
//                 }
//               }
//             ],
//             as: 'requestDetailsData'
//           }
//         },
//         {
//           $lookup: {
//             from: 'requestplaces',
//             let: { requestId: '$requestMetaDetails.requestId' },
//             pipeline: [
//               {
//                 $match: {
//                   $expr: {
//                     $eq: ['$requestId', '$$requestId']
//                   }
//                 }
//               }
//             ],
//             as: 'requestPlaceDetailsData'
//           }
//         },
//         {
//           $lookup: {
//             from: 'users',
//             let: { userId: '$requestMetaDetails.userId' },
//             pipeline: [
//               {
//                 $match: {
//                   $expr: {
//                     $eq: ['$_id', '$$userId']
//                   }
//                 }
//               }
//             ],
//             as: 'requestMetaUsers'
//           }
//         },
//         {
//           $unwind: {
//             path: '$requestPlaceDetailsData',
//             preserveNullAndEmptyArrays: true,
//           }
//         },
//         {
//           $unwind: {
//             path: '$requestMetaUsers',
//             preserveNullAndEmptyArrays: true,
//           }
//         },
//         {
//           $lookup: {
//             from: 'requests',
//             let: { driverId: '$_id' },
//             pipeline: [
//               {
//                 $match: {
//                   $expr: {
//                     $and: [
//                       { $eq: ['$driverId', '$$driverId'] },
//                       { $eq: ['$isCompleted', false] },
//                       { $eq: ['$isCancelled', false] },
//                       { $eq: ['$isPaid', false] }
//                     ]
//                   }
//                 }
//               }
//             ],
//             as: 'requestDetails'
//           }
//         },
//         {
//           $unwind: {
//             path: '$requestDetails',
//             preserveNullAndEmptyArrays: true,
//           }
//         },
//         {
//           $lookup: {
//             from: 'requestbills',
//             let: { requestId: '$requestDetails._id' },
//             pipeline: [
//               {
//                 $match: {
//                   $expr: {
//                     $eq: ['$requestId', '$$requestId']
//                   }
//                 }
//               }
//             ],
//             as: 'billingDetails'
//           }
//         },
//         {
//           $lookup: {
//             from: 'requestplaces',
//             localField: 'requestDetails._id',
//             foreignField: 'requestId',
//             as: 'placesDetails'
//           }
//         },
//         {
//           $lookup: {
//             from: 'requestratings',
//             localField: 'requestDetails._id',
//             foreignField: 'requestId',
//             as: 'ratingDetails'
//           }
//         },
//         {
//           $lookup: {
//             from: 'users',
//             localField: 'requestDetails.userId',
//             foreignField: '_id',
//             as: 'requestUser'
//           }
//         },
//         {
//           $lookup: {
//             from: 'users',
//             localField: 'requestDetails.othersUserId',
//             foreignField: '_id',
//             as: 'requestOthersUserUsers'
//           }
//         },
//         {
//           $unwind: {
//             path: '$requestOthersUserUsers',
//             preserveNullAndEmptyArrays: true,
//           }
//         },
//         {
//           $lookup: {
//             from: 'requestratings',
//             let: { userId: '$requestDetails.userId' },
//             pipeline: [
//               {
//                 $match: {
//                   $expr: {
//                     $eq: ['$userId', '$$userId']
//                   }
//                 }
//               }
//             ],
//             as: 'userAllRatings'
//           }
//         },
//         {
//           $lookup: {
//             from: 'users',
//             localField: 'userId',
//             foreignField: '_id',
//             as: 'user'
//           }
//         },
//         {
//           $unwind: {
//             path: '$billingDetails',
//             preserveNullAndEmptyArrays: true
//           }
//         },
//         {
//           $unwind: {
//             path: '$ratingDetails',
//             preserveNullAndEmptyArrays: true
//           }
//         },
//         {
//           $unwind: {
//             path: '$user',
//             preserveNullAndEmptyArrays: true,
//           }
//         },
//         {
//           $unwind: {
//             path: '$placesDetails',
//             preserveNullAndEmptyArrays: true,
//           }
//         },
//         {
//           $lookup: {
//             from: 'users',
//             localField: 'userId',
//             foreignField: '_id',
//             as: 'driverPersonalDetails'
//           }
//         },
//         {
//           $lookup: {
//             from: 'vehicles',
//             localField: 'type',
//             foreignField: '_id',
//             as: 'vehicleDetails'
//           }
//         },
//         {
//           $lookup: {
//             from: 'vehiclemodels',
//             localField: 'carModel',
//             foreignField: '_id',
//             as: 'vehicleModelDetails'
//           }
//         },
//         {
//           $unwind: {
//             path: '$driverPersonalDetails',
//             preserveNullAndEmptyArrays: true,
//           }
//         },
//         {
//           $lookup: {
//             from: 'demos',
//             localField: 'driverPersonalDetails.adminDemoKey',
//             foreignField: 'demoKey',
//             as: 'demoKeyDetails'
//           }
//         },
//         {
//           $unwind: {
//             path: '$demoKeyDetails',
//             preserveNullAndEmptyArrays: true,
//           }
//         },
//         {
//           $lookup: {
//             from: 'driversubscriptions',
//             localField: '_id',
//             foreignField: 'driverId',
//             as: 'driverSubscriptionDetails'
//           }
//         },
//         {
//           $unwind: {
//             path: '$driverSubscriptionDetails',
//             preserveNullAndEmptyArrays: true,
//           }
//         },
//         {
//           $lookup: {
//             from: 'subscriptions',
//             localField: 'driverSubscriptionDetails.subScriptionId',
//             foreignField: '_id',
//             as: 'SubscriptionDetails'
//           }
//         },
//         {
//           $unwind: {
//             path: '$SubscriptionDetails',
//             preserveNullAndEmptyArrays: true,
//           }
//         },
//         {
//           $lookup: {
//             from: 'countries',
//             let: { countryId: '$driverPersonalDetails.country' },
//             pipeline: [
//               {
//                 $match: {
//                   $expr: {
//                     $eq: [
//                       '$_id',
//                       { $toObjectId: '$$countryId' } // Convert string to ObjectId
//                     ]
//                   }
//                 }
//               }
//             ],
//             as: 'countriesDetails'
//           }
//         },
//         {
//           $unwind: {
//             path: '$countriesDetails',
//             preserveNullAndEmptyArrays: true,
//           }
//         },
//         {
//           $unwind: {
//             path: '$vehicleDetails',
//             preserveNullAndEmptyArrays: true,
//           }
//         },
//         {
//           $unwind: {
//             path: '$vehicleModelDetails',
//             preserveNullAndEmptyArrays: true,
//           }
//         },
//         {
//           $unwind: {
//             path: '$requestUser',
//             preserveNullAndEmptyArrays: true,
//           }
//         },
//         {
//           $lookup: {
//             from: 'clients',
//             let: { clientId: '$clientId' },
//             pipeline: [
//               {
//                 $match: {
//                   $expr: {
//                     $eq: ['$_id', '$$clientId']
//                   }
//                 }
//               }
//             ],
//             as: 'clientData'
//           }
//         },
//         {
//           $unwind: {
//             path: '$clientData',
//             preserveNullAndEmptyArrays: true
//           }
//         },
//         {
//           $lookup: {
//             from: 'driverdocuments',
//             localField: '_id',
//             foreignField: 'driverId',
//             as: 'DriverDocumentsDetails',
//             pipeline: [
//               {
//                 $match: {
//                   documentId: { $in: driverDocumetID } // Filter by documentId
//                 }
//               }
//             ]
//           }
//         },
//         {
//           $lookup: {
//             from: 'users',
//             let: { userId: '$clientData.userId' },
//             pipeline: [
//               {
//                 $match: {
//                   $expr: {
//                     $eq: ['$_id', '$$userId']
//                   }
//                 }
//               }
//             ],
//             as: 'clientDetails'
//           }
//         },
//         {
//           $unwind: {
//             path: '$clientDetails',
//             preserveNullAndEmptyArrays: true
//           }
//         },
//         {
//           $lookup: {
//             from: 'settings',
//             let: { settingsName: 'driverBlockWalletBalance' },
//             pipeline: [
//               {
//                 $match: {
//                   $expr: {
//                     $eq: ['$name', '$$settingsName']
//                   }
//                 }
//               }
//             ],
//             as: 'settingsDriverBlockWalletBalance'
//           }
//         },
//         {
//           $addFields: {
//             // active: {
//             //   $cond: [
//             //     {
//             //       $or: [
//             //         { $eq: [{ $size: '$driverDocumentDetails' }, 0] },
//             //         {
//             //           $gt: [
//             //             {
//             //               $size: {
//             //                 $filter: {
//             //                   input: '$driverDocumentDetails',
//             //                   as: 'doc',
//             //                   cond: {
//             //                     $or: [
//             //                       { $eq: ['$$doc.documentStatus', 'DENIED'] },
//             //                       {
//             //                         $and: [
//             //                           { $ifNull: ['$$doc.expiryDate', false] },
//             //                           { $lt: ['$$doc.expiryDate', new Date()] }
//             //                         ]
//             //                       }
//             //                     ]
//             //                   }
//             //                 }
//             //               }
//             //             },
//             //             0
//             //           ]
//             //         },
//             //         {
//             //           $ne: [
//             //             {
//             //               $size: {
//             //                 $filter: {
//             //                   input: documents,
//             //                   as: "doc",
//             //                   cond: { $eq: ["$$doc.required", true] }
//             //                 }
//             //               }
//             //             },
//             //             {
//             //               $size: {
//             //                 $filter: {
//             //                   input: documents,
//             //                   as: "doc",
//             //                   cond: {
//             //                     $and: [
//             //                       { $eq: ["$$doc.required", true] },
//             //                       {
//             //                         $in: [
//             //                           "$$doc._id",
//             //                           {
//             //                             $map: {
//             //                               input: "$driverDocumentDetails",
//             //                               as: "driverDoc",
//             //                               in: "$$driverDoc.documentId"
//             //                             }
//             //                           }
//             //                         ]
//             //                       }
//             //                     ]
//             //                   }
//             //                 }
//             //               }
//             //             }
//             //           ]
//             //         },
//             //         {
//             //           $gt: [
//             //             {
//             //               $size: {
//             //                 $filter: {
//             //                   input: '$driverDocumentDetails',
//             //                   as: 'doc',
//             //                   cond: { $ne: ['$$doc.documentStatus', 'APPROVED'] }
//             //                 }
//             //               }
//             //             },
//             //             0
//             //           ]
//             //         }
//             //       ]
//             //     },
//             //     false,
//             //     true
//             //   ]
//             // },


//             // walletBalance: { $ifNull: ['$walletDetails.balance', 0] },

//             walletBalance: {
//               $ifNull: [
//                 { $getField: { field: 'balance', input: { $arrayElemAt: ['$walletDetails', 0] } } },
//                 0
//               ]
//             },
//             settingsDriverBlockWalletBalance: {
//               $ifNull: [
//                 { $toInt: { $first: '$settingsDriverBlockWalletBalance.value' } }, // pick the value
//                 -500 // fallback default
//               ]
//             },
//             active: {
//               $cond: [
//                 {
//                   $and: [
//                     { $ne: ['$demoKeyDetails', null] },
//                     { $eq: ['$status', true] },
//                     { $eq: ['$isApprove', true] }
//                   ]
//                 },
//                 true, // If demoKey + status + isApprove are valid → ACTIVE (true)
//                 {
//                   // Otherwise, check the original conditions
//                   $cond: [
//                     {
//                       $or: [
//                         { $eq: [{ $size: '$driverDocumentDetails' }, 0] },
//                         {
//                           $gt: [
//                             {
//                               $size: {
//                                 $filter: {
//                                   input: '$driverDocumentDetails',
//                                   as: 'doc',
//                                   cond: {
//                                     $or: [
//                                       { $eq: ['$$doc.documentStatus', 'DENIED'] },
//                                       {
//                                         $and: [
//                                           { $ifNull: ['$$doc.expiryDate', false] },
//                                           { $lt: ['$$doc.expiryDate', new Date()] }
//                                         ]
//                                       }
//                                     ]
//                                   }
//                                 }
//                               }
//                             },
//                             0
//                           ]
//                         },
//                         {
//                           $ne: [
//                             {
//                               $size: {
//                                 $filter: {
//                                   input: documents,
//                                   as: "doc",
//                                   cond: { $eq: ["$$doc.required", true] }
//                                 }
//                               }
//                             },
//                             {
//                               $size: {
//                                 $filter: {
//                                   input: documents,
//                                   as: "doc",
//                                   cond: {
//                                     $and: [
//                                       { $eq: ["$$doc.required", true] },
//                                       {
//                                         $in: [
//                                           "$$doc._id",
//                                           {
//                                             $map: {
//                                               input: "$driverDocumentDetails",
//                                               as: "driverDoc",
//                                               in: "$$driverDoc.documentId"
//                                             }
//                                           }
//                                         ]
//                                       }
//                                     ]
//                                   }
//                                 }
//                               }
//                             }
//                           ]
//                         },
//                         {
//                           $gt: [
//                             {
//                               $size: {
//                                 $filter: {
//                                   input: '$driverDocumentDetails',
//                                   as: 'doc',
//                                   cond: { $ne: ['$$doc.documentStatus', 'APPROVED'] }
//                                 }
//                               }
//                             },
//                             0
//                           ]
//                         }
//                       ]
//                     },
//                     false,
//                     true
//                   ]
//                 }
//               ]
//             },
//             blockReason: {
//               $cond: {
//                 if: {
//                   $ne: [
//                     {
//                       $size: {
//                         $filter: {
//                           input: documents,
//                           as: "doc",
//                           cond: { $eq: ["$$doc.required", true] }
//                         }
//                       }
//                     },
//                     {
//                       $size: {
//                         $filter: {
//                           input: documents,
//                           as: "doc",
//                           cond: {
//                             $and: [
//                               { $eq: ["$$doc.required", true] },
//                               {
//                                 $in: [
//                                   "$$doc._id",
//                                   {
//                                     $map: {
//                                       input: "$driverDocumentDetails",
//                                       as: "driverDoc",
//                                       in: "$$driverDoc.documentId"
//                                     }
//                                   }
//                                 ]
//                               }
//                             ]
//                           }
//                         }
//                       }
//                     }
//                   ]
//                 },
//                 then: "DOCUMENT_NOT_UPLOADED",
//                 else: {
//                   $cond: {
//                     if: {
//                       $gt: [
//                         {
//                           $size: {
//                             $filter: {
//                               input: '$driverDocumentDetails',
//                               as: 'doc',
//                               cond: { $eq: ['$$doc.documentStatus', 'WAITINGFORAPPROVAL'] }
//                             }
//                           }
//                         },
//                         0
//                       ]
//                     },
//                     then: 'WAITINGFORAPPROVAL',
//                     else: {
//                       $cond: {
//                         if: { $eq: [{ $size: '$driverDocumentDetails' }, 0] },
//                         then: 'DOCUMENT_NOT_UPLOADED',
//                         else: {
//                           $cond: {
//                             if: {
//                               $gt: [
//                                 {
//                                   $size: {
//                                     $filter: {
//                                       input: '$driverDocumentDetails',
//                                       as: 'doc',
//                                       cond: {
//                                         $and: [
//                                           { $ifNull: ['$$doc.expiryDate', false] },
//                                           { $lt: ['$$doc.expiryDate', new Date()] }
//                                         ]
//                                       }
//                                     }
//                                   }
//                                 },
//                                 0
//                               ]
//                             },
//                             then: 'EXPIRED',
//                             else: {
//                               $cond: {
//                                 if: {
//                                   $ne: [
//                                     {
//                                       $size: {
//                                         $filter: {
//                                           input: documents,
//                                           as: "doc",
//                                           cond: { $eq: ["$$doc.required", true] }
//                                         }
//                                       }
//                                     },
//                                     {
//                                       $size: {
//                                         $filter: {
//                                           input: documents,
//                                           as: "doc",
//                                           cond: {
//                                             $and: [
//                                               { $eq: ["$$doc.required", true] },
//                                               {
//                                                 $in: [
//                                                   "$$doc._id",
//                                                   {
//                                                     $map: {
//                                                       input: "$driverDocumentDetails",
//                                                       as: "driverDoc",
//                                                       in: "$$driverDoc.documentId"
//                                                     }
//                                                   }
//                                                 ]
//                                               }
//                                             ]
//                                           }
//                                         }
//                                       }
//                                     }
//                                   ]
//                                 },
//                                 then: 'DOCUMENT_NOT_UPLOADED',
//                                 else: {
//                                   $cond: {
//                                     if: {
//                                       $eq: [
//                                         {
//                                           $size: {
//                                             $filter: {
//                                               input: '$driverDocumentDetails',
//                                               as: 'doc',
//                                               cond: { $ne: ['$$doc.documentStatus', 'APPROVED'] }
//                                             }
//                                           }
//                                         },
//                                         0
//                                       ]
//                                     },
//                                     then: 'APPROVED',
//                                     else: 'DENIED'
//                                   }
//                                 }
//                               }
//                             }
//                           }
//                         }
//                       }
//                     }
//                   }
//                 }
//               }
//             },
//             onlineBy: {
//               $cond: {
//                 if: { $eq: ['$driverPersonalDetails.onlineBy', 1] },
//                 then: true,
//                 else: false,
//               }
//             },
//             driverAverageRating: {
//               $toInt: {
//                 $ifNull: [
//                   { $avg: '$driverAllRatings.rating' },
//                   0
//                 ]
//               }
//             },
//             userAverageRating: {
//               $toInt: {
//                 $ifNull: [
//                   { $avg: '$userAllRatings.rating' },
//                   0
//                 ]
//               }
//             },
//             isDemoValid: {
//               $cond: {
//                 if: { $ifNull: ['$demoKeyDetails', false] }, // Check if demoKeyDetails exists
//                 then: { // If demoKeyDetails exists
//                   $cond: {
//                     if: { $gt: ['$demoKeyDetails.Enddate', new Date()] }, // Check if EndDate is in future
//                     then: { // If demoKeyDetails exists
//                       $cond: {
//                         if: { $eq: ['$demoKeyDetails.status', true] }, // Check if EndDate is in future
//                         then: true,
//                         else: false
//                       }
//                     },
//                     else: false
//                   }
//                 },
//                 else: null // If demoKeyDetails is null
//               }
//             },
//             isDriverSubscriptionValid: {
//               $cond: {
//                 if: { $ifNull: ['$driverSubscriptionDetails', false] }, // Check if demoKeyDetails exists
//                 then: { // If demoKeyDetails exists
//                   $cond: {
//                     if: { $gt: ['$driverSubscriptionDetails.Enddate', new Date()] }, // Check if EndDate is in future
//                     then: { // If demoKeyDetails exists
//                       $cond: {
//                         if: { $eq: ['$driverSubscriptionDetails.status', true] }, // Check if EndDate is in future
//                         then: true,
//                         else: false
//                       }
//                     },
//                     else: false
//                   }
//                 },
//                 else: null // If demoKeyDetails is null
//               }
//             },
//             subscriptionName: "$SubscriptionDetails.name", // Get the subscription package name
//             remainingDays: {
//               $cond: [
//                 {
//                   $and: [
//                     { $gt: ["$driverSubscriptionDetails.Enddate", "$$NOW"] },
//                     { $ifNull: ["$driverSubscriptionDetails.Enddate", false] }
//                   ]
//                 },
//                 {
//                   $dateDiff: {
//                     startDate: "$$NOW",
//                     endDate: "$driverSubscriptionDetails.Enddate",
//                     unit: "day"
//                   }
//                 },
//                 null
//               ]
//             }
//           }
//         },
//         {
//           $project: {
//             _id: { $ifNull: ['$_id', null] },
//             blockReason: { $ifNull: ['$blockReason', null] },
//             onlineBy: { $ifNull: ['$onlineBy', null] },
//             active: { $ifNull: ['$active', null] },
//             userId: { $ifNull: ['$userId', null] },
//             clientId: { $ifNull: ['$clientId', null] },
//             countryCode: '$countriesDetails.dial_code',
//             currencySymbol: '$countriesDetails.currency_symbol',
//             isDemoValid: { $ifNull: ['$isDemoValid', null] },
//             isDriverSubScriptionValid: { $ifNull: ['$isDriverSubscriptionValid', null] },
//             subscriptionName: { $ifNull: ['$subscriptionName', null] },
//             remainingDays: { $ifNull: ['$remainingDays', null] },
//             secondaryZone: { $ifNull: ['$secondaryZone', null] },
//             settingsDriverBlockWalletBalance: 1,
//             walletBalance: { $ifNull: ['$walletBalance', 0] },
//             zoneId: { $ifNull: ['$serviceLocation', null] },
//             todayStatus: {
//               todayCompleted: { $ifNull: ['$todayStatus.todayCompleted', 0] }, // Default to 0 if missing
//               todayCancelled: { $ifNull: ['$todayStatus.todayCancelled', 0] }, // Default to 0 if missing
//               totalAmount: { $ifNull: ['$todayStatus.totalAmount', 0] }, // Default to 0 if missing
//               totalAssigned: { $ifNull: ['$todayStatus.totalAssigned', 0] }, // Default to 0 if missing
//               driverId: { $ifNull: ['$todayStatus.driverId', '$_id'] } // Default to empty string if missing
//             },
//             'driver.id': { $ifNull: ['$_id', null] },
//             'driver.firstName': { $ifNull: ['$driverPersonalDetails.firstName', null] },
//             'driver.lastName': { $ifNull: ['$driverPersonalDetails.lastName', null] },
//             'driver.carNumber': { $ifNull: ['$carNumber', null] },
//             'driver.serviceType': { $ifNull: ['$serviceType', null] },
//             'driver.vehicleId': { $ifNull: ['$vehicleDetails._id', null] },
//             'driver.vehicleName': { $ifNull: ['$vehicleDetails.vehicleName', null] },
//             'driver.vehicleImage': { $ifNull: ['$vehicleDetails.image', null] },
//             'driver.capacity': { $ifNull: ['$vehicleDetails.capacity', null] },
//             'driver.highlightImage': { $ifNull: ['$vehicleDetails.highlightImage', null] },
//             'driver.modelname': { $ifNull: ['$vehicleModelDetails.modelname', null] },
//             'user.userId': { $ifNull: ['$user._id', null] },
//             'user.firstName': { $ifNull: ['$user.firstName', null] },
//             'user.lastName': { $ifNull: ['$user.lastName', null] },
//             'user.email': { $ifNull: ['$user.email', null] },
//             'user.phoneNumber': { $ifNull: ['$user.phoneNumber', null] },
//             'user.referralCode': { $ifNull: ['$user.referralCode', null] },
//             'user.gender': { $ifNull: ['$user.gender', null] },
//             'user.country': { $ifNull: ['$user.country', null] },
//             'user.profilePic': {
//               $ifNull: [
//                 {
//                   $arrayElemAt: [
//                     {
//                       $map: {
//                         input: '$DriverDocumentsDetails',
//                         as: 'doc',
//                         in: {
//                           $concat: [
//                             "/uploads/documentimage/",
//                             { $ifNull: ['$$doc.documentImage', ''] }
//                           ]
//                         }
//                       }
//                     },
//                     0 // Take first element of the mapped array
//                   ]
//                 },
//                 "" // Fallback to empty string if array is empty
//               ]
//             },
//             'user.adminPhoneNumber': { $ifNull: ['$clientDetails.phoneNumber', null] },
//             'user.headofficeNumber': { $ifNull: ['$clientDetails.emergencyNumber', null] },
//             trip: {
//               $ifNull: [
//                 {
//                   $let: {
//                     vars: {
//                       billingDetails: '$billingDetails',
//                       ratingDetails: '$ratingDetails',
//                       vehicleDetails: '$vehicleDetails',
//                       vehicleModelDetails: '$vehicleModelDetails',
//                       placeDetailsData: {
//                         $cond: {
//                           if: { $ifNull: ['$requestPlaceDetailsData', false] },
//                           then: '$requestPlaceDetailsData',
//                           else: {
//                             $cond: {
//                               if: { $ifNull: ['$placesDetails', false] },
//                               then: '$placesDetails',
//                               else: null
//                             }
//                           }
//                         }
//                       },
//                       userDetailsData: {
//                         $cond: {
//                           if: { $ifNull: ['$requestMetaUsers', false] },
//                           then: '$requestMetaUsers',
//                           else: {
//                             $cond: {
//                               if: { $ne: ['$requestUser', null] },
//                               then: '$requestUser',
//                               else: null
//                             }
//                           }
//                         }
//                       },
//                       requestData: {
//                         $cond: {
//                           if: { $and: [{ $isArray: "$requestDetailsData" }, { $ne: [{ $size: "$requestDetailsData" }, 0] }] },
//                           then: { $arrayElemAt: ['$requestDetailsData', 0] },
//                           else: {
//                             $cond: {
//                               if: { $ne: ['$requestDetails', null] },
//                               then: '$requestDetails',
//                               else: null
//                             }
//                           }
//                         }
//                       }
//                     },
//                     in: {
//                       $cond: {
//                         if: {
//                           $and: [
//                             { $ne: [{ $ifNull: ["$$requestData", null] }, null] },
//                             {
//                               $and: [
//                                 { $eq: [{ "$ifNull": ["$$requestData.isCancelled", false] }, false] },
//                                 { $eq: [{ "$ifNull": ["$$requestData.isCompleted", false] }, false] }
//                               ]
//                             }
//                           ]
//                         },
//                         then: {
//                           _id: { $ifNull: ['$$requestData._id', null] },
//                           requestNumber: { $ifNull: ['$$requestData.requestNumber', null] },
//                           requestOtp: { $ifNull: ['$$requestData.requestOtp', null] },
//                           isLater: { $ifNull: ['$$requestData.isLater', null] },
//                           ifDispatch: { $ifNull: ['$$requestData.ifDispatch', null] },
//                           zoneTypeId: { $ifNull: ['$$requestData.zoneTypeId', null] },
//                           userId: { $ifNull: ['$$requestData.userId', null] },
//                           unit: { $ifNull: ['$$requestData.unit', null] },
//                           driverId: { $ifNull: ['$$requestData.driverId', null] },
//                           tripStartTime: { $ifNull: ['$$requestData.tripStartTime', null] },
//                           arrivedAt: { $ifNull: ['$$requestData.arrivedAt', null] },
//                           acceptedAt: { $ifNull: ['$$requestData.acceptedAt', null] },
//                           completedAt: { $ifNull: ['$$requestData.completedAt', null] },
//                           cancelledAt: { $ifNull: ['$$requestData.cancelledAt', null] },
//                           isDriverStarted: { $ifNull: ['$$requestData.isDriverStarted', null] },
//                           isDriverArrived: { $ifNull: ['$$requestData.isDriverArrived', null] },
//                           isTripStart: { $ifNull: ['$$requestData.isTripStart', null] },
//                           isCompleted: { $ifNull: ['$$requestData.isCompleted', null] },
//                           isCancelled: { $ifNull: ['$$requestData.isCancelled', null] },
//                           customReason: { $ifNull: ['$$requestData.customReason', null] },
//                           cancelMethod: { $ifNull: ['$$requestData.cancelMethod', null] },
//                           totalDistance: { $ifNull: ['$$requestData.totalDistance', null] },
//                           totalTime: { $ifNull: ['$$requestData.totalTime', null] },
//                           isPaid: { $ifNull: ['$$requestData.isPaid', null] },
//                           userRated: { $ifNull: ['$$requestData.userRated', null] },
//                           driverRated: { $ifNull: ['$$requestData.driverRated', null] },
//                           timezone: { $ifNull: ['$$requestData.timezone', null] },
//                           attemptForSchedule: { $ifNull: ['$$requestData.attemptForSchedule', null] },
//                           dispatcherId: { $ifNull: ['$$requestData.dispatcherId', null] },
//                           driverNotes: { $ifNull: ['$$requestData.driverNotes', null] },
//                           createdBy: { $ifNull: ['$$requestData.createdBy', null] },
//                           paymentOpt: { $ifNull: ['$$requestData.paymentOpt', null] },
//                           rideType: { $ifNull: ['$$requestData.rideType', null] },
//                           locationChanged: { $ifNull: ['$$requestData.locationChanged', null] },
//                           locationChangeAddress: { $ifNull: ['$$requestData.locationChangeAddress', null] },
//                           startKm: { $toString: { $ifNull: ['$$requestData.startKm', 0] } },
//                           startKmImage: {
//                             $concat: [
//                               "/uploads/trips/",
//                               { $ifNull: ['$$requestData.startKmImage', ''] }
//                             ]
//                           },
//                           endKm: { $toString: { $ifNull: ['$$requestData.endKm', 0] } },
//                           endKmImage: {
//                             $concat: [
//                               "/uploads/trips/",
//                               { $ifNull: ['$$requestData.endKmImage', ''] }
//                             ]
//                           },
//                           requestedCurrencyCode: { $ifNull: ['$$requestData.requestedCurrencyCode', null] },
//                           requestedCurrencySymbol: { $ifNull: ['$$requestData.requestedCurrencySymbol', null] },
//                           promoId: { $ifNull: ['$$requestData.promoId', null] },
//                           locationApprove: { $ifNull: ['$$requestData.locationApprove', null] },
//                           availablesStatus: { $ifNull: ['$$requestData.availablesStatus', null] },
//                           tripType: { $ifNull: ['$$requestData.tripType', null] },
//                           rentalPackage: { $ifNull: ['$$requestData.rentalPackage', null] },
//                           manualTrip: { $ifNull: ['$$requestData.manualTrip', null] },
//                           packageId: { $ifNull: ['$$requestData.packageId', null] },
//                           packageItemId: { $ifNull: ['$$requestData.packageItemId', null] },
//                           bookingFor: { $ifNull: ['$$requestData.bookingFor', null] },
//                           othersUserId: { $ifNull: ['$$requestData.othersUserId', null] },
//                           othersName: { $ifNull: ['$requestOthersUserUsers.firstName', null] },
//                           othersPhoneNumber: { $ifNull: ['$requestOthersUserUsers.phoneNumber', null] },
//                           pickLat: { $ifNull: ['$$placeDetailsData.pickLat', null] },
//                           pickLng: { $ifNull: ['$$placeDetailsData.pickLng', null] },
//                           pickAddress: { $ifNull: ['$$placeDetailsData.pickAddress', null] },
//                           dropLat: { $ifNull: ['$$placeDetailsData.dropLat', null] },
//                           dropLng: { $ifNull: ['$$placeDetailsData.dropLng', null] },
//                           dropAddress: { $ifNull: ['$$placeDetailsData.dropAddress', null] },
//                           stopLat: { $ifNull: ['$$placeDetailsData.stopLat', null] },
//                           stopLng: { $ifNull: ['$$placeDetailsData.stopLng', null] },
//                           stopAddress: { $ifNull: ['$$placeDetailsData.stopAddress', null] },
//                           billingDetails: {
//                             _id: { $ifNull: ['$$billingDetails._id', null] },
//                             requestId: { $ifNull: ['$$billingDetails.requestId', null] },
//                             basePrice: { $toString: { $ifNull: ['$$billingDetails.basePrice', 0] } },
//                             baseDistance: { $toString: { $ifNull: ['$$billingDetails.baseDistance', 0] } },
//                             totalDistance: { $toString: { $ifNull: ['$$billingDetails.totalDistance', 0] } },
//                             totalTime: { $toString: { $ifNull: ['$$billingDetails.totalTime', 0] } },
//                             pricePerDistance: { $toString: { $ifNull: ['$$billingDetails.pricePerDistance', 0] } },
//                             distancePrice: { $toString: { $ifNull: ['$$billingDetails.distancePrice', 0] } },
//                             pricePerTime: { $toString: { $ifNull: ['$$billingDetails.pricePerTime', 0] } },
//                             timePrice: { $toString: { $ifNull: ['$$billingDetails.timePrice', 0] } },
//                             waitingCharge: { $toString: { $ifNull: ['$$billingDetails.waitingCharge', 0] } },
//                             cancellationFee: { $toString: { $ifNull: ['$$billingDetails.cancellationFee', 0] } },
//                             serviceTax: { $toString: { $ifNull: ['$$billingDetails.serviceTax', 0] } },
//                             serviceTaxPercentage: { $toString: { $ifNull: ['$$billingDetails.serviceTaxPercentage', 0] } },
//                             promoDiscount: { $toString: { $ifNull: ['$$billingDetails.promoDiscount', 0] } },
//                             adminCommission: { $toString: { $ifNull: ['$$billingDetails.adminCommission', 0] } },
//                             adminCommissionWithTax: { $toString: { $ifNull: ['$$billingDetails.adminCommissionWithTax', 0] } },
//                             driverCommission: { $toString: { $ifNull: ['$$billingDetails.driverCommission', 0] } },
//                             totalAmount: { $toString: { $ifNull: ['$$billingDetails.totalAmount', 0] } },
//                             requestedCurrencyCode: { $ifNull: ['$$billingDetails.requestedCurrencyCode', null] },
//                             requestedCurrencySymbol: { $ifNull: ['$$billingDetails.requestedCurrencySymbol', null] },
//                             createdAt: { $ifNull: ['$$billingDetails.createdAt', null] },
//                             updatedAt: { $ifNull: ['$$billingDetails.updatedAt', null] },
//                             subTotal: { $toString: { $ifNull: ['$$billingDetails.subTotal', 0] } },
//                             outOfZonePrice: { $toString: { $ifNull: ['$$billingDetails.outOfZonePrice', 0] } },
//                             bookingFees: { $toString: { $ifNull: ['$$billingDetails.bookingFees', 0] } },
//                             hillStationPrice: { $toString: { $ifNull: ['$$billingDetails.hillStationPrice', 0] } },
//                           },
//                           ratingDetails: { $ifNull: ['$$ratingDetails', null] },
//                           userDetails: { $ifNull: ['$$userDetailsData', null] },
//                           driverAverageRating: 1,
//                           userAverageRating: 1,
//                           vehicleDetails: {
//                             vehicleName: { $ifNull: ['$$vehicleDetails.vehicleName', null] },
//                             image: {
//                               $concat: [
//                                 "/uploads/vehicles/",
//                                 { $ifNull: ['$$vehicleDetails.image', ''] }
//                               ]
//                             },
//                             capacity: { $ifNull: ['$$vehicleDetails.capacity', null] },
//                             serviceType: { $ifNull: ['$$vehicleDetails.serviceType', null] },
//                             categoryId: { $ifNull: ['$$vehicleDetails.categoryId', null] },
//                             sortingorder: { $ifNull: ['$$vehicleDetails.sortingorder', null] },
//                             highlightImage: {
//                               $concat: [
//                                 "/uploads/vehicles/",
//                                 { $ifNull: ['$$vehicleDetails.highlightImage', ''] }
//                               ]
//                             },
//                             status: { $ifNull: ['$$vehicleDetails.status', null] },
//                             clientId: { $ifNull: ['$$vehicleDetails.clientId', null] },
//                           },
//                           vehicleModelDetails: {
//                             modelname: { $ifNull: ['$$vehicleModelDetails.modelname', null] },
//                             description: { $ifNull: ['$$vehicleModelDetails.description', null] },
//                             image: {
//                               $concat: [
//                                 "/uploads/vehicleModels/",
//                                 { $ifNull: ['$$vehicleModelDetails.image', ''] }
//                               ]
//                             },
//                             vehicleId: { $ifNull: ['$$vehicleModelDetails.vehicleId', null] },
//                             status: { $ifNull: ['$$vehicleModelDetails.status', null] },
//                             clientId: { $ifNull: ['$$vehicleModelDetails.clientId', null] },
//                           },
//                         },
//                         else: null
//                       }
//                     }
//                   }
//                 },
//                 null
//               ]
//             }
//           }
//         }
//       ]
//     });

//   } catch (error) {
//     console.error('Error creating view:', error);
//     throw error;
//   }
// };

const createDriverRequestView = async () => {
  if (!mongoose.connection.db) {
    return;
  }

  const db = mongoose.connection.db;

  try {
    const driverDocumetID = await getDriverDocumentsByName();

    // Check if the view already exists
    const collections = await db.listCollections({ name: 'driverRequestDetailedView' }).toArray();
    const viewExists = collections.length > 0;

    if (viewExists) {
      return;
    }

    // Get the documents collection first since we need it in the pipeline
    const documents = await Document.find({ status: true }).lean();

    // Create the view with optimized pipeline
    await db.createCollection("driverRequestDetailedView", {
      viewOn: "drivers",
      pipeline: [
        // Stage 1: Lookup all driver-related data in one go
        {
          $lookup: {
            from: 'driverdocuments',
            localField: '_id',
            foreignField: 'driverId',
            as: 'driverDocumentDetails'
          }
        },
        // Stage 2: Lookup wallet and user data
        {
          $lookup: {
            from: 'wallets',
            localField: 'userId',
            foreignField: 'userId',
            as: 'walletDetails'
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
        // Stage 3: Lookup vehicle information
        {
          $lookup: {
            from: 'vehicles',
            localField: 'type',
            foreignField: '_id',
            as: 'vehicleDetails'
          }
        },
        {
          $lookup: {
            from: 'vehiclemodels',
            localField: 'carModel',
            foreignField: '_id',
            as: 'vehicleModelDetails'
          }
        },
        // Stage 4: Lookup client and demo data
        {
          $lookup: {
            from: 'clients',
            localField: 'clientId',
            foreignField: '_id',
            as: 'clientData'
          }
        },
        // Stage 5: Lookup demo data through user
        {
          $lookup: {
            from: 'demos',
            let: { adminDemoKey: { $arrayElemAt: ['$driverPersonalDetails.adminDemoKey', 0] } },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ['$demoKey', '$$adminDemoKey'] }
                }
              }
            ],
            as: 'demoKeyDetails'
          }
        },
        // Stage 6: Lookup subscription data
        {
          $lookup: {
            from: 'driversubscriptions',
            localField: '_id',
            foreignField: 'driverId',
            as: 'driverSubscriptionDetails'
          }
        },
        {
          $lookup: {
            from: 'subscriptions',
            let: { subId: { $arrayElemAt: ['$driverSubscriptionDetails.subScriptionId', 0] } },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ['$_id', '$$subId'] }
                }
              }
            ],
            as: 'SubscriptionDetails'
          }
        },
        // Stage 7: Lookup country data
        {
          $lookup: {
            from: 'countries',
            let: { countryId: { $arrayElemAt: ['$driverPersonalDetails.country', 0] } },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: [
                      '$_id',
                      { $toObjectId: '$$countryId' }
                    ]
                  }
                }
              }
            ],
            as: 'countriesDetails'
          }
        },
        // Stage 8: Lookup client user details
        {
          $lookup: {
            from: 'users',
            let: { clientUserId: { $arrayElemAt: ['$clientData.userId', 0] } },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ['$_id', '$$clientUserId'] }
                }
              }
            ],
            as: 'clientDetails'
          }
        },
        // Stage 9: Lookup driver document details with filter
        {
          $lookup: {
            from: 'driverdocuments',
            let: { driverId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$driverId', '$$driverId'] },
                      { $in: ['$documentId', driverDocumetID] }
                    ]
                  }
                }
              }
            ],
            as: 'DriverDocumentsDetails'
          }
        },
        // Stage 10: Lookup today's status
        {
          $lookup: {
            from: 'driverDailyView',
            localField: '_id',
            foreignField: 'driverId',
            as: 'todayStatus'
          }
        },
        // Stage 11: Lookup driver ratings
        {
          $lookup: {
            from: 'requestratings',
            localField: 'userId',
            foreignField: 'userId',
            as: 'driverAllRatings'
          }
        },
        // Stage 12: Lookup settings
        {
          $lookup: {
            from: 'settings',
            pipeline: [
              {
                $match: {
                  name: 'driverBlockWalletBalance'
                }
              }
            ],
            as: 'settingsDriverBlockWalletBalance'
          }
        },
        // Stage 13: Lookup active request metadata
        {
          $lookup: {
            from: 'requestmetas',
            let: { driverId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$driverId', '$$driverId'] },
                      { $eq: ['$active', true] }
                    ]
                  }
                }
              },
              {
                $lookup: {
                  from: 'requests',
                  localField: 'requestId',
                  foreignField: '_id',
                  as: 'requestDetailsData'
                }
              },
              {
                $lookup: {
                  from: 'requestplaces',
                  localField: 'requestId',
                  foreignField: 'requestId',
                  as: 'requestPlaceDetailsData'
                }
              },
              {
                $lookup: {
                  from: 'users',
                  localField: 'userId',
                  foreignField: '_id',
                  as: 'requestMetaUsers'
                }
              }
            ],
            as: 'activeRequestMeta'
          }
        },
        // Stage 14: Lookup incomplete requests
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
                      { $eq: ['$isCompleted', false] },
                      { $eq: ['$isCancelled', false] },
                      { $eq: ['$isPaid', false] }
                    ]
                  }
                }
              },
              {
                $lookup: {
                  from: 'requestbills',
                  localField: '_id',
                  foreignField: 'requestId',
                  as: 'billingDetails'
                }
              },
              {
                $lookup: {
                  from: 'requestplaces',
                  localField: '_id',
                  foreignField: 'requestId',
                  as: 'placesDetails'
                }
              },
              {
                $lookup: {
                  from: 'requestratings',
                  localField: '_id',
                  foreignField: 'requestId',
                  as: 'ratingDetails'
                }
              },
              {
                $lookup: {
                  from: 'users',
                  localField: 'userId',
                  foreignField: '_id',
                  as: 'requestUser'
                }
              },
              {
                $lookup: {
                  from: 'users',
                  localField: 'othersUserId',
                  foreignField: '_id',
                  as: 'requestOthersUserUsers'
                }
              },
              {
                $lookup: {
                  from: 'requestratings',
                  localField: 'userId',
                  foreignField: 'userId',
                  as: 'userAllRatings'
                }
              }
            ],
            as: 'incompleteRequests'
          }
        },
        // Stage 15: Add computed fields
        {
          $addFields: {
            // Flatten arrays for easier access
            driverPersonalDetails: { $arrayElemAt: ['$driverPersonalDetails', 0] },
            vehicleDetails: { $arrayElemAt: ['$vehicleDetails', 0] },
            vehicleModelDetails: { $arrayElemAt: ['$vehicleModelDetails', 0] },
            clientData: { $arrayElemAt: ['$clientData', 0] },
            demoKeyDetails: { $arrayElemAt: ['$demoKeyDetails', 0] },
            driverSubscriptionDetails: { $arrayElemAt: ['$driverSubscriptionDetails', 0] },
            SubscriptionDetails: { $arrayElemAt: ['$SubscriptionDetails', 0] },
            countriesDetails: { $arrayElemAt: ['$countriesDetails', 0] },
            clientDetails: { $arrayElemAt: ['$clientDetails', 0] },
            todayStatus: { $arrayElemAt: ['$todayStatus', 0] },

            // Wallet balance
            walletBalance: {
              $ifNull: [
                { $getField: { field: 'balance', input: { $arrayElemAt: ['$walletDetails', 0] } } },
                0
              ]
            },

            // Settings
            settingsDriverBlockWalletBalance: {
              $convert: {
                input: { $first: '$settingsDriverBlockWalletBalance.value' },
                to: "int",
                onError: -500,
                onNull: -500
              }
            },

            // Driver ratings
            driverAverageRating: {
              $convert: {
                input: { $avg: '$driverAllRatings.rating' },
                to: "int",
                onError: 0,
                onNull: 0
              }
            },
          }
        },
        // Stage 16: Add remaining computed fields
        {
          $addFields: {

            // Active status calculation
            active: {
              $cond: [
                {
                  $and: [
                    { $ne: ['$demoKeyDetails', null] },
                    { $eq: ['$status', true] },
                    { $eq: ['$isApprove', true] },
                    // ADD WALLET BALANCE CHECK HERE
                    { $gte: ['$walletBalance', '$settingsDriverBlockWalletBalance'] }
                  ]
                },
                true, // If demoKey + status + isApprove + walletBalance are valid → ACTIVE (true)
                {
                  // Otherwise, check the original conditions
                  $cond: [
                    {
                      $or: [
                        // ADD WALLET BALANCE CHECK IN OR CONDITIONS TOO
                        { $lt: ['$walletBalance', '$settingsDriverBlockWalletBalance'] },
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
                                          { $lt: ['$$doc.expiryDate', new Date()] }
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
                        {
                          $ne: [
                            {
                              $size: {
                                $filter: {
                                  input: documents,
                                  as: "doc",
                                  cond: { $eq: ["$$doc.required", true] }
                                }
                              }
                            },
                            {
                              $size: {
                                $filter: {
                                  input: documents,
                                  as: "doc",
                                  cond: {
                                    $and: [
                                      { $eq: ["$$doc.required", true] },
                                      {
                                        $in: [
                                          "$$doc._id",
                                          {
                                            $map: {
                                              input: "$driverDocumentDetails",
                                              as: "driverDoc",
                                              in: "$$driverDoc.documentId"
                                            }
                                          }
                                        ]
                                      }
                                    ]
                                  }
                                }
                              }
                            }
                          ]
                        },
                        {
                          $gt: [
                            {
                              $size: {
                                $filter: {
                                  input: '$driverDocumentDetails',
                                  as: 'doc',
                                  cond: { $ne: ['$$doc.documentStatus', 'APPROVED'] }
                                }
                              }
                            },
                            0
                          ]
                        }
                      ]
                    },
                    false,
                    true
                  ]
                }
              ]
            },
            // Block reason logic
           blockReason: {
            $cond: {
              // First check wallet balance
              if: { $lt: ['$walletBalance', '$settingsDriverBlockWalletBalance'] },
              then: "INSUFFICIENT_WALLET_BALANCE",
              else: {
                $cond: {
                  if: {
                    $ne: [
                      {
                        $size: {
                          $filter: {
                            input: documents,
                            as: "doc",
                            cond: { $eq: ["$$doc.required", true] }
                          }
                        }
                      },
                      {
                        $size: {
                          $filter: {
                            input: documents,
                            as: "doc",
                            cond: {
                              $and: [
                                { $eq: ["$$doc.required", true] },
                                {
                                  $in: [
                                    "$$doc._id",
                                    {
                                      $map: {
                                        input: "$driverDocumentDetails",
                                        as: "driverDoc",
                                        in: "$$driverDoc.documentId"
                                      }
                                    }
                                  ]
                                }
                              ]
                            }
                          }
                        }
                      }
                    ]
                  },
                  then: "DOCUMENT_NOT_UPLOADED",
                  else: {
                    $switch: {
                      branches: [
                        {
                          case: {
                            $gt: [
                              {
                                $size: {
                                  $filter: {
                                    input: '$driverDocumentDetails',
                                    as: 'doc',
                                    cond: { $eq: ['$$doc.documentStatus', 'WAITINGFORAPPROVAL'] }
                                  }
                                }
                              },
                              0
                            ]
                          },
                          then: 'WAITINGFORAPPROVAL'
                        },
                        {
                          case: { $eq: [{ $size: '$driverDocumentDetails' }, 0] },
                          then: 'DOCUMENT_NOT_UPLOADED'
                        },
                        {
                          case: {
                            $gt: [
                              {
                                $size: {
                                  $filter: {
                                    input: '$driverDocumentDetails',
                                    as: 'doc',
                                    cond: {
                                      $and: [
                                        { $ifNull: ['$$doc.expiryDate', false] },
                                        { $lt: ['$$doc.expiryDate', new Date()] }
                                      ]
                                    }
                                  }
                                }
                              },
                              0
                            ]
                          },
                          then: 'EXPIRED'
                        }
                      ],
                      default: {
                        $cond: {
                          if: {
                            $eq: [
                              {
                                $size: {
                                  $filter: {
                                    input: '$driverDocumentDetails',
                                    as: 'doc',
                                    cond: { $ne: ['$$doc.documentStatus', 'APPROVED'] }
                                  }
                                }
                              },
                              0
                            ]
                          },
                          then: 'APPROVED',
                          else: 'DENIED'
                        }
                      }
                    }
                  }
                }
              }
            }
          },

            // Other computed fields
            onlineBy: {
              $cond: {
                if: { $eq: ['$driverPersonalDetails.onlineBy', 1] },
                then: true,
                else: false
              }
            },

            isDemoValid: {
              $cond: {
                if: { $ifNull: ['$demoKeyDetails', false] },
                then: {
                  $and: [
                    { $gt: ['$demoKeyDetails.Enddate', new Date()] },
                    { $eq: ['$demoKeyDetails.status', true] }
                  ]
                },
                else: null
              }
            },

            isDriverSubscriptionValid: {
              $cond: {
                if: { $ifNull: ['$driverSubscriptionDetails', false] },
                then: {
                  $and: [
                    { $gt: ['$driverSubscriptionDetails.Enddate', new Date()] },
                    { $eq: ['$driverSubscriptionDetails.status', true] }
                  ]
                },
                else: null
              }
            },

            subscriptionName: "$SubscriptionDetails.name",

            remainingDays: {
              $cond: [
                {
                  $and: [
                    { $gt: ["$driverSubscriptionDetails.Enddate", "$$NOW"] },
                    { $ifNull: ["$driverSubscriptionDetails.Enddate", false] }
                  ]
                },
                {
                  $dateDiff: {
                    startDate: "$$NOW",
                    endDate: "$driverSubscriptionDetails.Enddate",
                    unit: "day"
                  }
                },
                null
              ]
            }
          }
        },
        // Stage 17: Final projection
        {
          $project: {
            _id: 1,
            blockReason: 1,
            onlineBy: 1,
            active: 1,
            userId: 1,
            clientId: 1,
            countryCode: '$countriesDetails.dial_code',
            currencySymbol: '$countriesDetails.currency_symbol',
            isDemoValid: 1,
            isDriverSubScriptionValid: '$isDriverSubscriptionValid',
            subscriptionName: 1,
            remainingDays: 1,
            secondaryZone: 1,
            settingsDriverBlockWalletBalance: 1,
            walletBalance: 1,
            zoneId: '$serviceLocation',
            todayStatus: {
              todayCompleted: { $ifNull: ['$todayStatus.todayCompleted', 0] },
              todayCancelled: { $ifNull: ['$todayStatus.todayCancelled', 0] },
              totalAmount: { $ifNull: ['$todayStatus.totalAmount', 0] },
              totalAssigned: { $ifNull: ['$todayStatus.totalAssigned', 0] },
              driverId: { $ifNull: ['$todayStatus.driverId', '$_id'] }
            },
            'driver.id': '$_id',
            'driver.firstName': '$driverPersonalDetails.firstName',
            'driver.lastName': '$driverPersonalDetails.lastName',
            'driver.carNumber': '$carNumber',
            'driver.serviceType': '$serviceType',
            'driver.vehicleId': '$vehicleDetails._id',
            'driver.vehicleName': '$vehicleDetails.vehicleName',
            'driver.vehicleImage': '$vehicleDetails.image',
            'driver.capacity': '$vehicleDetails.capacity',
            'driver.highlightImage': '$vehicleDetails.highlightImage',
            'driver.modelname': '$vehicleModelDetails.modelname',
            'user.userId': '$driverPersonalDetails._id',
            'user.firstName': '$driverPersonalDetails.firstName',
            'user.lastName': '$driverPersonalDetails.lastName',
            'user.email': '$driverPersonalDetails.email',
            'user.phoneNumber': '$driverPersonalDetails.phoneNumber',
            'user.referralCode': '$driverPersonalDetails.referralCode',
            'user.gender': '$driverPersonalDetails.gender',
            'user.country': '$driverPersonalDetails.country',
            'user.profilePic': {
              $ifNull: [
                {
                  $concat: [
                    "/uploads/documentimage/",
                    { $ifNull: [{ $arrayElemAt: ['$DriverDocumentsDetails.documentImage', 0] }, ''] }
                  ]
                },
                ""
              ]
            },
            'user.adminPhoneNumber': '$clientDetails.phoneNumber',
            'user.headofficeNumber': '$clientDetails.emergencyNumber',
            driverAverageRating: 1,

            // Simplified trip data - only include if there's an active request
            trip: {
              $cond: {
                if: { $gt: [{ $size: '$incompleteRequests' }, 0] },
                then: {
                  $let: {
                    vars: {
                      request: { $arrayElemAt: ['$incompleteRequests', 0] }
                    },
                    in: {
                      _id: '$$request._id',
                      requestNumber: '$$request.requestNumber',
                      requestOtp: '$$request.requestOtp',
                      isLater: '$$request.isLater',
                      userId: '$$request.userId',
                      tripType: '$$request.tripType',
                      driverId: '$$request.driverId',
                      tripStartTime: '$$request.tripStartTime',
                      arrivedAt: '$$request.arrivedAt',
                      acceptedAt: '$$request.acceptedAt',
                      isDriverStarted: '$$request.isDriverStarted',
                      isDriverArrived: '$$request.isDriverArrived',
                      isTripStart: '$$request.isTripStart',
                      totalDistance: '$$request.totalDistance',
                      totalTime: '$$request.totalTime',
                      paymentOpt: '$$request.paymentOpt',
                      rideType: '$$request.rideType',
                      startKm: { $toString: { $ifNull: ['$$request.startKm', 0] } },
                      endKm: { $toString: { $ifNull: ['$$request.endKm', 0] } },
                      // Include essential nested data
                      billingDetails: { $arrayElemAt: ['$$request.billingDetails', 0] },
                      placesDetails: { $arrayElemAt: ['$$request.placesDetails', 0] },
                      requestUser: { $arrayElemAt: ['$$request.requestUser', 0] },
                      vehicleDetails: '$vehicleDetails',
                      vehicleModelDetails: '$vehicleModelDetails',
                      driverAverageRating: '$driverAverageRating',
                      userAverageRating: {
                        $convert: {
                          input: { $avg: '$$request.userAllRatings.rating' },
                          to: "int",
                          onError: 0,
                          onNull: 0
                        }
                      }
                    }
                  }
                },
                else: null
              }
            }
          }
        }
      ]
    });

  } catch (error) {
    console.error('Error creating view:', error);
    throw error;
  }
};

const getDriverDocumentsByName = async () => {
  const groupDocument = await GroupDocument.findOne({ name: 'Driver' });
  if (!groupDocument) {
    throw new Error('Vehicle not found');
  }

  const documents = await Document.find({ documentId: groupDocument._id });

  const documentIds = documents.map(doc => doc._id);

  return documentIds;
};

const createUserRequestView = async () => {
  if (!mongoose.connection.db) {
    return;
  }

  const db = mongoose.connection.db;

  try {
    // Check if the view already exists
    const collections = await db.listCollections({ name: 'userRequestView' }).toArray();
    const viewExists = collections.length > 0;

    const settingsPlaces = await Settings.findOne({ name: 'adminNumber' });
    const adminNumber = settingsPlaces.value;

    if (viewExists) {
      return;
    }

    // Create the view
    await db.createCollection("userRequestView", {
      viewOn: "users",
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
                    userId: '$$userId'  // Assuming _id is the user's ID in the main collection
                  },
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $and: [
                            { $eq: ['$requestId', '$$requestId'] },
                            { $eq: ['$userId', '$$userId'] }
                          ]
                        }
                      }
                    }
                  ],
                  as: 'tripRatings'
                }
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
                              { $eq: ['$isPaid', false] }
                            ]
                          },
                          {
                            $and: [
                              { $eq: [{ $size: '$tripRatings' }, 0] },
                              { $eq: ['$isCancelled', false] },
                            ]
                          }
                        ]
                      }
                    ]
                  }
                }
              }
            ],
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
            from: 'wallets',
            localField: '_id',
            foreignField: 'userId',
            as: 'walletDetails'
          }
        },
        {
          $lookup: {
            from: 'requestratings',
            let: {
              requestId: '$requestDetails._id',
              userId: '$_id'  // Assuming _id is the user's ID in the main collection
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$requestId', '$$requestId'] },
                      { $eq: ['$userId', '$$userId'] }
                    ]
                  }
                }
              }
            ],
            as: 'userRatingDetails'
          }
        },
        {
          $unwind: {
            path: '$userRatingDetails',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $lookup: {
            from: 'demos',
            localField: 'adminDemoKey',
            foreignField: 'demoKey',
            as: 'demoKeyDetails'
          }
        },
        {
          $unwind: {
            path: '$demoKeyDetails',
            preserveNullAndEmptyArrays: true,
          }
        },
        {
          $lookup: {
            from: 'requestbills',
            let: { requestId: '$requestDetails._id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ['$requestId', '$$requestId']
                  }
                }
              }
            ],
            as: 'billingDetails'
          }
        },
        {
          $lookup: {
            from: 'requestplaces',
            localField: 'requestDetails._id',
            foreignField: 'requestId',
            as: 'placesDetails'
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'requestDetails.othersUserId',
            foreignField: '_id',
            as: 'requestOthersUserUsers'
          }
        },
        {
          $unwind: {
            path: '$requestOthersUserUsers',
            preserveNullAndEmptyArrays: true,
          }
        },
        {
          $lookup: {
            from: 'requestratings',
            localField: 'requestDetails._id',
            foreignField: 'requestId',
            as: 'ratingDetails'
          }
        },
        {
          $lookup: {
            from: 'drivers',
            localField: 'requestDetails.driverId',
            foreignField: '_id',
            as: 'driverDetails'
          }
        },
        {
          $unwind: {
            path: '$driverDetails',
            preserveNullAndEmptyArrays: true
          }
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
                      { $toObjectId: '$$countryId' } // Convert string to ObjectId
                    ]
                  }
                }
              }
            ],
            as: 'countriesDetails'
          }
        },
        {
          $unwind: {
            path: '$countriesDetails',
            preserveNullAndEmptyArrays: true,
          }
        },
        {
          $lookup: {
            from: 'vehicles',
            localField: 'driverDetails.type',
            foreignField: '_id',
            as: 'vehicleDetails'
          }
        },
        {
          $lookup: {
            from: 'vehiclemodels',
            localField: 'driverDetails.carModel',
            foreignField: '_id',
            as: 'vehicleModelDetails'
          }
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
            path: '$placesDetails',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'driverDetails.userId',
            foreignField: '_id',
            as: 'driverPersonalDetails'
          }
        },
        {
          $unwind: {
            path: '$driverPersonalDetails',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $unwind: {
            path: '$vehicleDetails',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $unwind: {
            path: '$vehicleModelDetails',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $lookup: {
            from: 'requestratings',
            let: { userId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ['$_id', '$$userId']
                  }
                }
              }
            ],
            as: 'userAllRatings'
          }
        },
        {
          $lookup: {
            from: 'requestratings',
            let: { userId: '$requestDetails.driverId' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ['$userId', '$$userId']
                  }
                }
              }
            ],
            as: 'driverAllRatings'
          }
        },
        {
          $addFields: {
            walletBalance: {
              $ifNull: [
                { $getField: { field: 'balance', input: { $arrayElemAt: ['$walletDetails', 0] } } },
                0
              ]
            },
            driverAverageRating: {
              $toInt: {
                $ifNull: [
                  { $avg: '$driverAllRatings.rating' },
                  0
                ]
              }
            },
            userAverageRating: {
              $toInt: {
                $ifNull: [
                  { $avg: '$userAllRatings.rating' },
                  0
                ]
              }
            },
            isDemoValid: {
              $cond: {
                if: { $ifNull: ['$demoKeyDetails', false] }, // Check if demoKeyDetails exists
                then: { // If demoKeyDetails exists
                  $cond: {
                    if: { $gt: ['$demoKeyDetails.Enddate', new Date()] }, // Check if EndDate is in future
                    then: { // If demoKeyDetails exists
                      $cond: {
                        if: { $eq: ['$demoKeyDetails.status', true] }, // Check if EndDate is in future
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
          }
        },
        {
          $lookup: {
            from: 'clients',
            let: { clientId: '$clientId' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ['$_id', '$$clientId']
                  }
                }
              }
            ],
            as: 'clientData'
          }
        },
        {
          $unwind: {
            path: '$clientData',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $lookup: {
            from: 'users',
            let: { userId: '$clientData.userId' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ['$_id', '$$userId']
                  }
                }
              }
            ],
            as: 'clientDetails'
          }
        },
        {
          $unwind: {
            path: '$clientDetails',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $project: {
            _id: { $ifNull: ['$_id', null] },
            clientId: { $ifNull: ['$clientId', null] },
            walletBalance: { $ifNull: ['$walletBalance', 0] },
            adminNumber: adminNumber,
            countryCode: '$countriesDetails.dial_code',
            currencySymbol: '$countriesDetails.currency_symbol',
            isDemoValid: { $ifNull: ['$isDemoValid', null] },
            'user._id': { $ifNull: ['$_id', null] },
            'user.firstName': { $ifNull: ['$firstName', null] },
            'user.lastName': { $ifNull: ['$lastName', null] },
            'user.email': { $ifNull: ['$email', null] },
            'user.phoneNumber': { $ifNull: ['$phoneNumber', null] },
            'user.referralCode': { $ifNull: ['$referralCode', null] },
            'user.gender': { $ifNull: ['$gender', null] },
            'user.country': { $ifNull: ['$country', null] },
            'user.profilePic': { $concat: ['', '$profilePic'] },
            'user.active': { $ifNull: ['$active', null] },
            'user.adminPhoneNumber': { $ifNull: ['$clientDetails.phoneNumber', null] },
            'user.headofficeNumber': { $ifNull: ['$clientDetails.emergencyNumber', null] },
            trip: {
              $cond: {
                // if: true,
                if: {
                  $or: [
                    {
                      $and: [
                        { $ne: [{ $ifNull: ["$requestDetails", null] }, null] },
                        { $eq: [{ $ifNull: ["$requestDetails.isCancelled", false] }, false] },
                        { $eq: [{ $ifNull: ["$requestDetails.isCompleted", false] }, false] }
                      ]
                    },
                    {
                      $and: [
                        { $eq: [{ $ifNull: ["$requestDetails.isLater", false] }, true] },
                        { $ne: ["$requestDetails.driverId", null] },
                        { $eq: [{ $ifNull: ["$requestDetails.isCancelled", false] }, false] },
                        { $eq: [{ $ifNull: ["$requestDetails.isCompleted", false] }, false] }
                      ]
                    },
                    { $ne: ["$userRatingDetails", null] }
                  ]
                },
                then: {
                  _id: { $ifNull: ['$requestDetails._id', null] },
                  requestNumber: { $ifNull: ['$requestDetails.requestNumber', null] },
                  requestOtp: { $ifNull: ['$requestDetails.requestOtp', null] },
                  driverAverageRating: 1,
                  userAverageRating: 1,
                  userRatingDetails: { $ifNull: ['$userRatingDetails', null] },
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
                    $concat: [
                      "/uploads/trips/",
                      { $ifNull: ['$requestDetails.startKmImage', ''] }
                    ]
                  },
                  endKm: { $toString: { $ifNull: ['$requestDetails.endKm', 0] } },
                  endKmImage: {
                    $concat: [
                      "/uploads/trips/",
                      { $ifNull: ['$requestDetails.endKmImage', ''] }
                    ]
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
                    profilePic: { $ifNull: ['$driverPersonalDetails.profilePic', null] },
                    active: { $ifNull: ['$driverPersonalDetails.active', null] }
                  },
                  vehicleDetails: {
                    vehicleName: { $ifNull: ['$vehicleDetails.vehicleName', null] },
                    image: {
                      $concat: [
                        "/uploads/vehicles/",
                        { $ifNull: ['$vehicleDetails.image', ''] }
                      ]
                    },
                    capacity: { $ifNull: ['$vehicleDetails.capacity', null] },
                    serviceType: { $ifNull: ['$vehicleDetails.serviceType', null] },
                    categoryId: { $ifNull: ['$vehicleDetails.categoryId', null] },
                    sortingorder: { $ifNull: ['$vehicleDetails.sortingorder', null] },
                    highlightImage: {
                      $concat: [
                        "/uploads/vehicles/",
                        { $ifNull: ['$vehicleDetails.highlightImage', ''] }
                      ]
                    },
                    status: { $ifNull: ['$vehicleDetails.status', null] },
                    clientId: { $ifNull: ['$vehicleDetails.clientId', null] },
                  },
                  vehicleModelDetails: {
                    modelname: { $ifNull: ['$vehicleModelDetails.modelname', null] },
                    description: { $ifNull: ['$vehicleModelDetails.description', null] },
                    image: {
                      $concat: [
                        "/uploads/vehicleModels/",
                        { $ifNull: ['$vehicleModelDetails.image', ''] }
                      ]
                    },
                    vehicleId: { $ifNull: ['$vehicleModelDetails.vehicleId', null] },
                    status: { $ifNull: ['$vehicleModelDetails.status', null] },
                    clientId: { $ifNull: ['$vehicleModelDetails.clientId', null] },
                  }
                },
                else: null
              }
            }
          }
        }
      ]
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

  const db = mongoose.connection.db;

  try {
    // Check if the view already exists
    const collections = await db.listCollections({ name: 'requestListView' }).toArray();
    const viewExists = collections.length > 0;

    if (viewExists) {
      return;
    }

    // Create the view
    await db.createCollection("requestListView", {
      viewOn: "requests",
      pipeline: [
        {
          $lookup: {
            from: 'requestbills',
            localField: '_id',
            foreignField: 'requestId',
            as: 'billingDetails'
          }
        },
        {
          $lookup: {
            from: 'requestplaces',
            localField: '_id',
            foreignField: 'requestId',
            as: 'placesDetails'
          }
        },
        {
          $lookup: {
            from: 'requestratings',
            localField: '_id',
            foreignField: 'requestId',
            as: 'ratingDetails'
          }
        },
        {
          $lookup: {
            from: 'requestbids',
            localField: '_id',
            foreignField: 'requestId',
            as: 'requestBidsDetails'
          }
        },
        {
          $unwind: {
            path: '$requestBidsDetails',
            preserveNullAndEmptyArrays: true,
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'user'
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'othersUserId',
            foreignField: '_id',
            as: 'requestOthersUserUsers'
          }
        },
        {
          $unwind: {
            path: '$requestOthersUserUsers',
            preserveNullAndEmptyArrays: true,
          }
        },
        {
          $lookup: {
            from: 'drivers',
            localField: 'driverId',
            foreignField: '_id',
            as: 'driverDetails'
          }
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
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $unwind: {
            path: '$driverDetails',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'driverDetails.userId',
            foreignField: '_id',
            as: 'driverPersonalDetails'
          }
        },
        {
          $lookup: {
            from: 'vehicles',
            localField: 'driverDetails.type',
            foreignField: '_id',
            as: 'vehicleDetails'
          }
        },
        {
          $lookup: {
            from: 'vehiclemodels',
            localField: 'driverDetails.carModel',
            foreignField: '_id',
            as: 'vehicleModelDetails'
          }
        },
        {
          $unwind: {
            path: '$driverPersonalDetails',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $unwind: {
            path: '$vehicleDetails',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $unwind: {
            path: '$vehicleModelDetails',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $lookup: {
            from: 'requestplaces',
            localField: '_id',
            foreignField: 'requestId',
            as: 'placeDetails'
          }
        },
        {
          $unwind: {
            path: '$placeDetails',
            preserveNullAndEmptyArrays: true,
          }
        },
        {
          $lookup: {
            from: 'zones',
            localField: 'zoneId',
            foreignField: '_id',
            as: 'zoneDetails'
          }
        },
        {
          $unwind: {
            path: '$zoneDetails',
            preserveNullAndEmptyArrays: true,
          }
        },
        {
          $project: {
            placesDetails: 1,
            _id: { $ifNull: ['$_id', null] },
            requestNumber: { $ifNull: ['$requestNumber', null] },
            requestOtp: { $ifNull: ['$requestOtp', null] },
            isLater: { $ifNull: ['$isLater', null] },
            isInstantTrip: { $ifNull: ['$isInstantTrip', null] },
            ifDispatch: { $ifNull: ['$ifDispatch', null] },
            zoneTypeId: { $ifNull: ['$zoneTypeId', null] },
            biddigZone: { $ifNull: ['$zoneDetails.biddingZone', null] },
            estAmount: { $ifNull: ['$etaAmount', null] },
            userId: { $ifNull: ['$userId', null] },
            driverId: { $ifNull: ['$driverId', null] },
            tripStartTime: { $ifNull: ['$tripStartTime', null] },
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
              $concat: [
                "/uploads/trips/",
                { $ifNull: ['$startKmImage', ''] }
              ]
            },
            endKm: { $toString: { $ifNull: ['$endKm', 0] } },
            endKmImage: {
              $concat: [
                "/uploads/trips/",
                { $ifNull: ['$endKmImage', ''] }
              ]
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
            'driverDetails._id': { $ifNull: ['$driverDetails._id', null] },
            'driverDetails.userId': { $ifNull: ['$driverDetails.userId', null] },
            'driverDetails.carNumber': { $ifNull: ['$driverDetails.carNumber', null] },
            'driverDetails._id': { $ifNull: ['$driverPersonalDetails._id', null] },
            'driverDetails.firstName': { $ifNull: ['$driverPersonalDetails.firstName', null] },
            'driverDetails.lastName': { $ifNull: ['$driverPersonalDetails.lastName', null] },
            'driverDetails.email': { $ifNull: ['$driverPersonalDetails.email', null] },
            'driverDetails.phoneNumber': { $ifNull: ['$driverPersonalDetails.phoneNumber', null] },
            'driverDetails.emergencyNumber': { $ifNull: ['$driverPersonalDetails.emergencyNumber', null] },
            'driverDetails.gender': { $ifNull: ['$driverPersonalDetails.gender', null] },
            'driverDetails.language': { $ifNull: ['$driverPersonalDetails.language', null] },
            'driverDetails.country': { $ifNull: ['$driverPersonalDetails.country', null] },
            'driverDetails.address': { $ifNull: ['$driverPersonalDetails.address', null] },
            'driverDetails.profilePic': { $ifNull: ['$driverDetails.profilePic', null] },
            'driverDetails.active': { $ifNull: ['$driverPersonalDetails.active', null] },
            'driverDetails.clientId': { $ifNull: ['$driverPersonalDetails.clientId', null] },
            'user._id': { $ifNull: ['$user._id', null] },
            'user.firstName': { $ifNull: ['$user.firstName', null] },
            'user.lastName': { $ifNull: ['$user.lastName', null] },
            'user.email': { $ifNull: ['$user.email', null] },
            'user.phoneNumber': { $ifNull: ['$user.phoneNumber', null] },
            'user.emergencyNumber': { $ifNull: ['$user.emergencyNumber', null] },
            'user.referralCode': { $ifNull: ['$user.referralCode', null] },
            'user.gender': { $ifNull: ['$user.gender', null] },
            'user.language': { $ifNull: ['$user.language', null] },
            'user.country': { $ifNull: ['$user.country', null] },
            'user.address': { $ifNull: ['$user.address', null] },
            'user.active': { $ifNull: ['$user.active', null] },
            'user.profilePic': { $ifNull: ['$user.profilePic', null] },
            'user.password': { $ifNull: ['$user.password', null] },
            'user.clientId': { $ifNull: ['$user.clientId', null] },
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
            'ratingDetails.rating': { $ifNull: ['$ratingDetails.rating', null] },
            'ratingDetails.feedback': { $ifNull: ['$ratingDetails.feedback', null] },
            'ratingDetails.userId': { $ifNull: ['$ratingDetails.userId', null] },
            'ratingDetails.requestId': { $ifNull: ['$ratingDetails.requestId', null] },
            'ratingDetails.createdAt': { $ifNull: ['$ratingDetails.createdAt', null] },
            'ratingDetails.updatedAt': { $ifNull: ['$ratingDetails.updatedAt', null] },
            'ratingDetails.deletedAt': { $ifNull: ['$ratingDetails.deletedAt', null] },
            'vehicleDetails.vehicleName': { $ifNull: ['$vehicleDetails.vehicleName', null] },
            'vehicleDetails.image': { $ifNull: ['$vehicleDetails.image', null] },
            'vehicleDetails.capacity': { $ifNull: ['$vehicleDetails.capacity', null] },
            'vehicleDetails.serviceType': { $ifNull: ['$vehicleDetails.serviceType', null] },
            'vehicleDetails.categoryId': { $ifNull: ['$vehicleDetails.categoryId', null] },
            'vehicleDetails.sortingorder': { $ifNull: ['$vehicleDetails.sortingorder', null] },
            'vehicleDetails.highlightImage': { $ifNull: ['$vehicleDetails.highlightImage', null] },
            'vehicleDetails.status': { $ifNull: ['$vehicleDetails.status', null] },
            'vehicleDetails.clientId': { $ifNull: ['$vehicleDetails.clientId', null] },
            'vehicleModelDetails.modelname': { $ifNull: ['$vehicleModelDetails.modelname', null] },
            'vehicleModelDetails.description': { $ifNull: ['$vehicleModelDetails.description', null] },
            'vehicleModelDetails.image': { $ifNull: ['$vehicleModelDetails.image', null] },
            'vehicleModelDetails.vehicleId': { $ifNull: ['$vehicleModelDetails.vehicleId', null] },
            'vehicleModelDetails.status': { $ifNull: ['$vehicleModelDetails.status', null] },
            'vehicleModelDetails.clientId': { $ifNull: ['$vehicleModelDetails.clientId', null] }
          }
        }
      ]
    });

  } catch (error) {
    console.error('Error creating request list view:', error);
    throw error;
  }
};

const createRequestView = async () => {

  if (!mongoose.connection.db) {
    return;
  }
  const db = mongoose.connection.db;

  try {
    // Drop the existing view (if it exists)

    const driverDocumetID = await getDriverDocumentsByName();

    const collections = await db.listCollections({ name: 'requestView' }).toArray();
    const viewExists = collections.length > 0;
    if (viewExists) {
      console.log('View "requestView" already exists, skipping creation.');
    } else {
      await db.createCollection("requestView", {
        viewOn: "requests", // The collection on which the view is based
        pipeline: [
          {
            $lookup: {
              from: 'requestbills',
              localField: '_id',
              foreignField: 'requestId',
              as: 'billingDetails'
            }
          },
          {
            $lookup: {
              from: 'requestplaces',
              localField: '_id',
              foreignField: 'requestId',
              as: 'placesDetails'
            }
          },
          {
            $lookup: {
              from: 'requestratings',
              localField: '_id',
              foreignField: 'requestId',
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
            $lookup: {
              from: 'drivers',
              localField: 'driverId',
              foreignField: '_id',
              as: 'driverDetails',
            },
          },
          {
            $lookup: {
              from: 'goods',
              localField: 'goodsId',
              foreignField: '_id',
              as: 'goodsDetails',
            },
          },
          {
            $unwind: {
              path: '$goodsDetails',
              preserveNullAndEmptyArrays: true
            }
          },
          {
            $lookup: {
              from: 'categories',
              localField: 'categoryId',
              foreignField: '_id',
              as: 'categoriesDetails'
            }
          },
          {
            $unwind: {
              path: '$categoriesDetails',
              preserveNullAndEmptyArrays: true
            }
          },
          {
            $lookup: {
              from: 'categories',
              localField: 'categoryId',
              foreignField: '_id',
              as: 'categoriesDetails'
            }
          },
          {
            $unwind: {
              path: '$categoriesDetails',
              preserveNullAndEmptyArrays: true
            }
          },
          {
            $lookup: {
              from: 'requestbids',
              let: { requestId: '$_id', driverId: '$driverId' }, // Define variables for use in the pipeline
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ['$requestId', '$$requestId'] }, // Match requests for this driver
                        { $eq: ['$driverId', '$$driverId'] },
                      ]
                    }
                  }
                },
              ],
              as: 'requestbids', // Store the filtered results in this field
            },
          },
          {
            $unwind: {
              path: '$requestbids',
              preserveNullAndEmptyArrays: true
            }
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
            $unwind: {
              path: '$driverDetails',
              preserveNullAndEmptyArrays: true,
            }
          },
          {
            $lookup: {
              from: 'users',
              localField: 'driverDetails.userId',
              foreignField: '_id',
              as: 'driverPersonalDetails',
            }
          },
          {
            $lookup: {
              from: 'vehicles',
              localField: 'driverDetails.type',
              foreignField: '_id',
              as: 'vehicleDetails',
            }
          },
          {
            $lookup: {
              from: 'vehiclemodels',
              localField: 'driverDetails.carModel',
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
            $unwind: {
              path: '$placesDetails',
              preserveNullAndEmptyArrays: true,
            }
          },
          {
            $lookup: {
              from: 'driverdocuments',
              localField: 'driverDetails._id',
              foreignField: 'driverId',
              as: 'DriverDocumentsDetails',
              pipeline: [
                {
                  $match: {
                    documentId: { $in: driverDocumetID } // Filter by documentId
                  }
                }
              ]
            }
          },
          {
            $lookup: {
              from: 'requestratings',
              let: { driverId: '$driverId' },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ['$userId', '$$driverId']
                    }
                  }
                }
              ],
              as: 'driverAllRatings'
            }
          },
          {
            $lookup: {
              from: 'requestratings',
              let: { userId: '$userId' },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ['$userId', '$$userId']
                    }
                  }
                }
              ],
              as: 'userAllRatings'
            }
          },
          {
            $addFields: {
              driverAverageRating: {
                $toInt: {
                  $ifNull: [
                    { $avg: '$driverAllRatings.rating' },
                    0
                  ]
                }
              },
              userAverageRating: {
                $toInt: {
                  $ifNull: [
                    { $avg: '$userAllRatings.rating' },
                    0
                  ]
                }
              }
            }
          },
          {
            $project: {
              driverAverageRating: 1,
              userAverageRating: 1,
              requestId: { $ifNull: ['$_id', null] },
              requestNumber: { $ifNull: ['$requestNumber', null] },
              requestOtp: { $ifNull: ['$requestOtp', null] },
              isLater: { $ifNull: ['$isLater', null] },
              isInstantTrip: { $ifNull: ['$isInstantTrip', null] },
              ifDispatch: { $ifNull: ['$ifDispatch', null] },
              zoneTypeId: { $ifNull: ['$zoneTypeId', null] },
              userId: { $ifNull: ['$userId', null] },
              driverId: { $ifNull: ['$driverId', null] },
              tripStartTime: { $ifNull: ['$tripStartTime', null] },
              arrivedAt: { $ifNull: ['$arrivedAt', null] },
              acceptedAt: { $ifNull: ['$acceptedAt', null] },
              completedAt: { $ifNull: ['$completedAt', null] },
              cancelledAt: { $ifNull: ['$cancelledAt', null] },
              isDriverStarted: { $ifNull: ['$isDriverStarted', null] },
              isDriverArrived: { $ifNull: ['$isDriverArrived', null] },
              isTripStart: { $ifNull: ['$isTripStart', null] },
              isCompleted: { $ifNull: ['$isCompleted', null] },
              isCancelled: { $ifNull: ['$isCancelled', null] },
              categoryName: { $ifNull: ['$categoriesDetails.category', null] },
              customReason: { $ifNull: ['$customReason', null] },
              cancelMethod: { $ifNull: ['$cancelMethod', null] },
              totalDistance: { $ifNull: ['$totalDistance', null] },
              totalTime: { $ifNull: ['$totalTime', null] },
              isPaid: { $ifNull: ['$isPaid', null] },
              userRated: { $ifNull: ['$userRated', null] },
              driverRated: { $ifNull: ['$driverRated', null] },
              timezone: { $ifNull: ['$timezone', null] },
              attemptForSchedule: { $ifNull: ['$attemptForSchedule', null] },
              dispatcherId: { $ifNull: ['$dispatcherId', null] },
              driverNotes: { $ifNull: ['$driverNotes', null] },
              createdBy: { $ifNull: ['$createdBy', null] },
              paymentOpt: { $ifNull: ['$paymentOpt', null] },
              rideType: { $ifNull: ['$rideType', null] },
              requestedCurrencyCode: { $ifNull: ['$requestedCurrencyCode', null] },
              requestedCurrencySymbol: { $ifNull: ['$requestedCurrencySymbol', null] },
              unit: { $ifNull: ['$unit', "Km"] },
              promoId: { $ifNull: ['$promoId', null] },
              locationApprove: { $ifNull: ['$locationApprove', null] },
              availablesStatus: { $ifNull: ['$availablesStatus', null] },
              tripType: { $ifNull: ['$tripType', null] },
              rentalPackage: { $ifNull: ['$rentalPackage', null] },
              manualTrip: { $ifNull: ['$manualTrip', null] },
              packageId: { $ifNull: ['$packageId', null] },
              packageItemId: { $ifNull: ['$packageItemId', null] },
              bookingFor: { $ifNull: ['$bookingFor', null] },
              othersUserId: { $ifNull: ['$othersUserId', null] },
              pickLat: { $ifNull: ['$placesDetails.pickLat', null] },
              pickLng: { $ifNull: ['$placesDetails.pickLng', null] },
              pickAddress: { $ifNull: ['$placesDetails.pickAddress', null] },
              dropLat: { $ifNull: ['$placesDetails.dropLat', null] },
              dropLng: { $ifNull: ['$placesDetails.dropLng', null] },
              dropAddress: { $ifNull: ['$placesDetails.dropAddress', null] },
              stopLat: { $ifNull: ['$placesDetails.stopLat', null] },
              stopLng: { $ifNull: ['$placesDetails.stopLng', null] },
              stopAddress: { $ifNull: ['$placesDetails.stopAddress', null] },
              receiverName: { $ifNull: ['$receiverName', null] },
              isEmergency: { $ifNull: ['$isEmergency', null] },
              receiverPhoneNumber: { $ifNull: ['$receiverPhoneNumber', null] },
              labour: { $ifNull: ['$labour', null] },
              courierImage: { $ifNull: ['$courierImage', null] },
              invoice: { $ifNull: ['$invoice', null] },
              'userDetails._id': { $ifNull: ['$user._id', null] },
              'userDetails.firstName': { $ifNull: ['$user.firstName', null] },
              'userDetails.lastName': { $ifNull: ['$user.lastName', null] },
              'userDetails.email': { $ifNull: ['$user.email', null] },
              'userDetails.phoneNumber': { $ifNull: ['$user.phoneNumber', null] },
              'userDetails.emergencyNumber': { $ifNull: ['$user.emergencyNumber', null] },
              'userDetails.referralCode': { $ifNull: ['$user.referralCode', null] },
              'userDetails.gender': { $ifNull: ['$user.gender', null] },
              'userDetails.language': { $ifNull: ['$user.language', null] },
              'userDetails.country': { $ifNull: ['$user.country', null] },
              'userDetails.address': { $ifNull: ['$user.address', null] },
              'userDetails.active': { $ifNull: ['$user.active', null] },
              'userDetails.profilePic': { $ifNull: ['$user.profilePic', null] },
              'userDetails.password': { $ifNull: ['$user.password', null] },
              'userDetails.clientId': { $ifNull: ['$user.clientId', null] },
              'driver._id': { $ifNull: ['$driverDetails._id', null] },
              'driver.userId': { $ifNull: ['$driverDetails.userId', null] },
              'driver.carNumber': { $ifNull: ['$driverDetails.carNumber', null] },
              'driver._id': { $ifNull: ['$driverPersonalDetails._id', null] },
              'driver.firstName': { $ifNull: ['$driverPersonalDetails.firstName', null] },
              'driver.lastName': { $ifNull: ['$driverPersonalDetails.lastName', null] },
              'driver.email': { $ifNull: ['$driverPersonalDetails.email', null] },
              'driver.phoneNumber': { $ifNull: ['$driverPersonalDetails.phoneNumber', null] },
              'driver.emergencyNumber': { $ifNull: ['$driverPersonalDetails.emergencyNumber', null] },
              'driver.gender': { $ifNull: ['$driverPersonalDetails.gender', null] },
              'driver.language': { $ifNull: ['$driverPersonalDetails.language', null] },
              'driver.country': { $ifNull: ['$driverPersonalDetails.country', null] },
              'driver.address': { $ifNull: ['$driverPersonalDetails.address', null] },
              'driver.profilePic': { $ifNull: ['$driverDetails.profilePic', null] },
              'driver.active': { $ifNull: ['$driverPersonalDetails.active', null] },
              'ratingDetails.rating': { $ifNull: ['$ratingDetails.rating', null] },
              'ratingDetails.feedback': { $ifNull: ['$ratingDetails.feedback', null] },
              'ratingDetails.userId': { $ifNull: ['$ratingDetails.userId', null] },
              'ratingDetails.requestId': { $ifNull: ['$ratingDetails.requestId', null] },
              'ratingDetails.createdAt': { $ifNull: ['$ratingDetails.createdAt', null] },
              'ratingDetails.updatedAt': { $ifNull: ['$ratingDetails.updatedAt', null] },
              'ratingDetails.deletedAt': { $ifNull: ['$ratingDetails.deletedAt', null] },
              driverDocuments: {
                $map: {
                  input: '$DriverDocumentsDetails',
                  as: 'doc',
                  in: {
                    documentImage: {
                      $concat: [
                        "/uploads/documentimage/",
                        { $ifNull: ['$$doc.documentImage', ''] }
                      ]
                    }
                  }
                }
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
              'goods.id': { $ifNull: ['$goodsDetails._id', null] },
              'goods.goodsName': { $ifNull: ['$goodsDetails.goodsName', null] },
              'goods.image': {
                $concat: [
                  "/uploads/goodsImage/",
                  {
                    $cond: {
                      if: { $isArray: "$goodsDetails.image" },
                      then: { $ifNull: [{ $arrayElemAt: ["$goodsDetails.image", 0] }, ""] },
                      else: { $ifNull: ["$goodsDetails.image", ""] }
                    }
                  }
                ]
              },
              requestBids: {
                // $push: {
                driverId: '$requestBids.driverId',
                firstName: '$driverPersonalDetails.firstName',
                phoneNumber: '$driverPersonalDetails.phoneNumber',
                profile: {
                  $concat: [
                    "/uploads/user/",
                    { $ifNull: ['$driverPersonalDetails.profilePic', ''] }
                  ]
                },
                rating: '$driverPersonalDetails.rating',
                bidAmount: '$requestBids.bidAmount',
                promoAmount: '$requestBids.promoAmount',
                tripType: '$requestBids.tripType',
                vehicleModel: '$vehicleModelDetails.modelname',
                vehicle: {
                  _id: '$vehicleDetails._id',
                  vehicleName: '$vehicleDetails.vehicleName',
                  image: {
                    $concat: [
                      "/uploads/vehicles/",
                      { $ifNull: ['$vehicleDetails.image', ''] }
                    ]
                  },
                  highlightImage: {
                    $concat: [
                      "/uploads/vehicles/",
                      { $ifNull: ['$vehicleDetails.highlightImage', ''] }
                    ]
                  }
                },
                driverDocuments: {
                  $map: {
                    input: '$DriverDocumentsDetails',
                    as: 'doc',
                    in: {
                      documentImage: {
                        $concat: [
                          "/uploads/documentimage/",
                          { $ifNull: ['$$doc.documentImage', ''] }
                        ]
                      }
                    }
                  }
                },
              },
              bidDetails: {
                bidAmount: { $ifNull: ['$requestbids.bidAmount', null] },
                promoAmount: { $ifNull: ['$requestbids.promoAmount', null] },
                tripType: { $ifNull: ['$requestbids.tripType', null] },
                isMissed: { $ifNull: ['$requestbids.isMissed', null] },
                requestId: { $ifNull: ['$requestbids.requestId', null] },
                driverId: { $ifNull: ['$requestbids.driverId', null] }
              },
              vehicleDetails: {
                vehicleName: { $ifNull: ['$vehicleDetails.vehicleName', null] },
                image: {
                  $concat: [
                    "/uploads/vehicles/",
                    { $ifNull: ['$vehicleDetails.image', ''] }
                  ]
                },
                capacity: { $ifNull: ['$vehicleDetails.capacity', null] },
                serviceType: { $ifNull: ['$vehicleDetails.serviceType', null] },
                categoryId: { $ifNull: ['$vehicleDetails.categoryId', null] },
                sortingorder: { $ifNull: ['$vehicleDetails.sortingorder', null] },
                highlightImage: {
                  $concat: [
                    "/uploads/vehicles/",
                    { $ifNull: ['$vehicleDetails.highlightImage', ''] }
                  ]
                },
                status: { $ifNull: ['$vehicleDetails.status', null] },
                clientId: { $ifNull: ['$vehicleDetails.clientId', null] },
              },
              vehicleModelDetails: {
                modelname: { $ifNull: ['$vehicleModelDetails.modelname', null] },
                description: { $ifNull: ['$vehicleModelDetails.description', null] },
                image: {
                  $concat: [
                    "/uploads/vehicleModels/",
                    { $ifNull: ['$vehicleModelDetails.image', ''] }
                  ]
                },
                vehicleId: { $ifNull: ['$vehicleModelDetails.vehicleId', null] },
                status: { $ifNull: ['$vehicleModelDetails.status', null] },
                clientId: { $ifNull: ['$vehicleModelDetails.clientId', null] },
              },
            }
          }
        ]
      });
    };

  } catch (error) {
    console.error('Error creating view:', error);
    throw error; // Re-throw the error for the caller to handle
  }
};

const createDriverBidListView = async () => {
  if (!mongoose.connection.db) {
    return;
  }
  const db = mongoose.connection.db;

  try {
    // Check if the view already exists
    const collections = await db.listCollections({ name: 'driverBidListView' }).toArray();
    const viewExists = collections.length > 0;

    if (viewExists) {
      console.log('View "driverBidListView" already exists, skipping creation.');
    } else {
      await db.createCollection("driverBidListView", {
        viewOn: "requestbids", // The collection on which the view is based
        pipeline: [
          {
            $lookup: {
              from: 'requests',
              localField: 'requestId',
              foreignField: '_id',
              as: 'requestDetails'
            }
          },
          { $unwind: { path: '$requestDetails', preserveNullAndEmptyArrays: true } },
          {
            $match: {
              'requestDetails.driverId': null,
              'requestDetails.isCompleted': false,
              'requestDetails.isCancelled': false
            }
          },
          {
            $lookup: {
              from: 'users',
              localField: 'requestDetails.userId',
              foreignField: '_id',
              as: 'userDetails'
            }
          },
          { $unwind: { path: '$userDetails', preserveNullAndEmptyArrays: true } },
          {
            $lookup: {
              from: 'drivers',
              localField: 'driverId',
              foreignField: '_id',
              as: 'driverPersonalDetails'
            }
          },
          { $unwind: { path: '$driverPersonalDetails', preserveNullAndEmptyArrays: true } },
          {
            $lookup: {
              from: 'users',
              localField: 'driverPersonalDetails.userId',
              foreignField: '_id',
              as: 'driverDetails'
            }
          },
          { $unwind: { path: '$driverDetails', preserveNullAndEmptyArrays: true } },
          {
            $lookup: {
              from: 'vehicles',
              localField: 'requestDetails.vehicleId',
              foreignField: '_id',
              as: 'vehicleDetails'
            }
          },
          { $unwind: { path: '$vehicleDetails', preserveNullAndEmptyArrays: true } },
          {
            $lookup: {
              from: 'requestplaces',
              localField: 'requestDetails._id',
              foreignField: 'requestId',
              as: 'requestPlace'
            }
          },
          { $unwind: { path: '$requestPlace', preserveNullAndEmptyArrays: true } },
          {
            $lookup: {
              from: 'request',
              localField: 'requestDetails._id',
              foreignField: 'requestId',
              as: 'requestbids'
            }
          },
          { $unwind: { path: '$requestbids', preserveNullAndEmptyArrays: true } },
          {
            $project: {
              _id: '$requestDetails._id',
              requestNumber: '$requestDetails.requestNumber',
              bidDriverId: '$driverId',
              driverId: '$requestDetails.driverId',
              requestOtp: '$requestDetails.requestOtp',
              tripStartTime: '$requestDetails.tripStartTime',
              isDriverStarted: '$requestDetails.isDriverStarted',
              isCompleted: '$requestDetails.isCompleted',
              isCancelled: '$requestDetails.isCancelled',
              rideType: '$requestDetails.rideType',
              unit: '$requestDetails.unit',
              categoryName: '$categoriesDetails.category',
              requestedCurrencyCode: '$requestDetails.requestedCurrencyCode',
              requestedCurrencySymbol: '$requestDetails.requestedCurrencySymbol',
              receiverName: '$requestDetails.receiverName',
              receiverPhoneNumber: '$requestDetails.receiverPhoneNumber',
              paymentOpt: '$requestDetails.paymentOpt',
              isEmergency: '$requestDetails.isEmergency',
              invoice: '$requestDetails.invoice',
              clientId: 1,
              'user.firstName': { $ifNull: ['$userDetails.firstName', null] },
              'user.lastName': { $ifNull: ['$userDetails.lastName', null] },
              'user.phoneNumber': { $ifNull: ['$userDetails.phoneNumber', null] },
              'driver.firstName': { $ifNull: ['$driverDetails.firstName', null] },
              'driver.lastName': { $ifNull: ['$driverDetails.lastName', null] },
              'driver.phoneNumber': { $ifNull: ['$driverDetails.phoneNumber', null] },
              'vehicle._id': { $ifNull: ['$vehicleDetails._id', null] },
              'vehicle.vehicleName': { $ifNull: ['$vehicleDetails.vehicleName', null] },
              'vehicle.image': {
                $concat: ['/uploads/vehicles/', { $ifNull: ['$vehicleDetails.image', ''] }]
              },
              'requestPlace.pickup_lat': { $ifNull: ['$requestPlace.pickLat', null] },
              'requestPlace.pickup_lang': { $ifNull: ['$requestPlace.pickLng', null] },
              'requestPlace.pickup_address': { $ifNull: ['$requestPlace.pickAddress', null] },
              'requestPlace.drop_lat': { $ifNull: ['$requestPlace.dropLat', null] },
              'requestPlace.drop_lang': { $ifNull: ['$requestPlace.stopLng', null] },
              'requestPlace.drop_address': { $ifNull: ['$requestPlace.dropAddress', null] },
              'requestPlace.stop_lat': { $ifNull: ['$requestPlace.stopLat', null] },
              'requestPlace.stop_lang': { $ifNull: ['$requestPlace.stopLng', null] },
              'requestPlace.stop_address': { $ifNull: ['$requestPlace.stopAddress', null] },
              'requestBids.requestId': { $ifNull: ['$requestId', null] },
              'requestBids.driverId': { $ifNull: ['$driverId', null] },
              'requestBids.bidAmount': { $ifNull: ['$bidAmount', null] },
              'requestBids.promoAmount': { $ifNull: ['$promoAmount', null] },
              'requestBids.estAmount': { $ifNull: ['$estAmount', null] },
              'requestBids.tripType': { $ifNull: ['$tripType', null] },
              'requestBids.isMissed': { $ifNull: ['$isMissed', 0] },
            }
          }
        ]
      });

    }
  } catch (error) {
    console.error('Error creating view:', error);
    throw error; // Re-throw the error for the caller to handle
  }
};

module.exports = {
  DriverDailyReport,
  createDriverRequestView,
  createUserRequestView,
  createRequestListView,
  createRequestView,
  createDriverBidListView,

};
