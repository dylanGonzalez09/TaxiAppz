const httpStatus = require('http-status');
const ApiError = require('../../../utils/ApiError');
const { DriverSubscription,SubScription,Driver } = require('../../../models');
const { tokenService } = require('../../../services');
const ObjectId = require('mongoose').Types.ObjectId
const { sendPushNotification } = require('../../../utils/commonFunction')

/**
  from the mobile side they need to send Client Id and Code (Version code)
  1. Check the Version Available or not if not redirect to update screen 
  2. check the avaliable languages for client send the avaliable languages 
 */

const getClientId = async (req) => {
    clientId = '';
    if (!req.headers.clientid) {
        throw new ApiError(httpStatus.NOT_FOUND, 'ClientID not found');
    } else {
        clientId = req.headers.clientid;
    }
    return clientId;
}



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


const getDriverrId = async (req) => {

    let userId = '';

    let driverId = '';

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(httpStatus.UNAUTHORIZED).send({ message: 'Authorization header is missing or invalid' });
        return;
    }
    // Remove the 'Bearer ' prefix and get the token
    const token = authHeader.substring(7);

    const user = await tokenService.verifyTokenAndGetUser(token);

    userId = user.id

    const driver = await Driver.find({ userId: userId })


    driverId = driver[0]._id;

    return driverId;
}



const createSubscription = async (req) => {
    req.body.driverId = await getDriverrId(req);
    let userId = await getUserId(req);

    // Validate required fields
    if (!req.body.driverId) {
        throw new Error('Driver ID is required');
    }

    // Verify driver exists
    const driverExists = await Driver.exists({ _id: req.body.driverId });
    if (!driverExists) {
        throw new Error('Driver not found');
    }

    req.body.clientId = await getClientId(req);
    req.body.Startdate = new Date(); // Set start date as current date

    let subscription;
    if (req.body.subScriptionId) {
        subscription = await SubScription.findById(req.body.subScriptionId);
        if (!subscription) {
            throw new Error('Subscription not found');
        }
        req.body.Enddate = calculateEndDate(req.body.Startdate, subscription);
    }

    // Set active status based on dates
    req.body.status = req.body.Enddate ? new Date() < req.body.Enddate : true;

    // Check if subscription exists for driver, then update; otherwise, create
    const existingSubscription = await DriverSubscription.findOneAndUpdate(
        { driverId: req.body.driverId }, // Filter by driverId
        req.body,                       // Update with new data
        { 
            new: true,                   // Return the updated document
            upsert: true,                // Create if not exists
            runValidators: true          // Validate schema on update
        }
    );

    // Send push notification if subscription was applied
    if (subscription && req.body.Enddate) {
        sendPushNotification(userId, {
            title: "Driver Subscription",
            message: `You've subscribed to ${subscription.name} plan. Enjoy uninterrupted service until ${req.body.Enddate.toDateString()}.`
        });
    }

    return existingSubscription;
};

/**
 * Update a driver subscription
 * @param {string} subscriptionId - ID of the subscription to update
 * @param {Object} updateData - Data to update
 * @returns {Promise<DriverSubscription>}
 */
const updateSubscriptionById = async (subscriptionId, updateData) => {
    // Find existing subscription
    const existingSubscription = await DriverSubscription.findById(subscriptionId);
    if (!existingSubscription) {
        throw new Error('Driver subscription not found');
    }

    let newSubscription = '';

    // If updating subscription plan, recalculate end date
    if (updateData.subScriptionId) {
         newSubscription = await SubScription.findById(updateData.subScriptionId);
        if (!newSubscription) {
            throw new Error('New subscription plan not found');
        }

        const startDate = updateData.Startdate || existingSubscription.Startdate;
        updateData.Enddate = calculateEndDate(startDate, newSubscription);
    }

    // If updating start date and subscription exists, recalculate end date
    if (updateData.Startdate && existingSubscription.subScriptionId) {
        const subscription = await SubScription.findById(existingSubscription.subScriptionId);
        updateData.Enddate = calculateEndDate(updateData.Startdate, subscription);
    }

    // Update status if dates are changed
    if (updateData.Startdate || updateData.Enddate) {
        const endDate = updateData.Enddate || existingSubscription.Enddate;
        updateData.status = new Date() < endDate;
    }

    const updated = await DriverSubscription.findByIdAndUpdate(
        subscriptionId,
        updateData,
        { new: true, runValidators: true }
    );

    const driverExists = await Driver.exists({ _id: existingSubscription.driverId });
    if (!driverExists) {
        throw new Error('Driver not found');
    }

    sendPushNotification(driverExists.userId, {
        title: "Driver Subscription",
        message: `You've subscribed to ${newSubscription.name} plan. Enjoy uninterrupted service until ${updateData.Enddate.toDateString()}.`
      });

    return updated;
};

/**
 * Calculate end date based on subscription plan
 * @param {Date} startDate - Subscription start date
 * @param {Object} subscription - Subscription plan
 * @returns {Date} Calculated end date
 */
const calculateEndDate = (startDate, subscription) => {
    const endDate = new Date(startDate);
    
    if (!subscription.validityPeriod || isNaN(subscription.validityPeriod)) {
        throw new Error('Invalid validity period in subscription');
    }

    const period = parseInt(subscription.validityPeriod);

    switch (subscription.unit) {
        case 'DAY':
            endDate.setDate(endDate.getDate() + period);
            break;
        case 'WEEK':
            endDate.setDate(endDate.getDate() + (period * 7));
            break;
        case 'MONTH':
            endDate.setMonth(endDate.getMonth() + period);
            break;
        case 'YEAR':
            endDate.setFullYear(endDate.getFullYear() + period);
            break;
        default:
            throw new Error('Invalid subscription unit');
    }

    return endDate;
};

/**
 * Query for wallets
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {Object} req
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const querySubscriptions = async (filter, options, req) => {
    // Get the clientId from request
    const clientId = await getClientId(req);

    // Add clientId to the filter
    if (clientId) {
        filter.clientId = clientId;
    }

    const faq = await DriverSubscription.paginate(filter, options);
    return faq;
};


/**
 * Get wallets
 * @returns {Promise<DriverSubscription>}
 */
const getSubscriptions = async (req) => {
    let clientId = await getClientId(req);
    return DriverSubscription.find({ clientId: new ObjectId(clientId) });
};


/**
 * Get wallet by id
 * @param {ObjectId} id
 * @returns {Promise<DriverSubscription>}
 */
const getSubscriptionById = async (id) => {
    return DriverSubscription.findById(id);
};


// /**
//  * Update Sos by id
//  * @param {ObjectId} subScriptionId
//  * @param {Object} updateBody
//  * @returns {Promise<Sos>}
//  */
// const updateSubscriptionById = async (subScriptionId, updateBody) => {
//     const SubScription = await getSubscriptionById(subScriptionId);
//     if (!SubScription) {
//         throw new ApiError(httpStatus.NOT_FOUND, 'sos not found');
//     }

//     Object.assign(SubScription, updateBody);
//     await SubScription.save();
//     return SubScription;
// };

/**
 * Delete sos by id
 * @param {ObjectId} subscriptionId
 * @returns {Object}
 */
const deleteSubscriptionById = async (subscriptionId) => {
    const subscription = await getSubscriptionById(subscriptionId);
    if (!subscription) {
        throw new ApiError(httpStatus.NOT_FOUND, 'subscription not found');
    }
    await subscription.deleteOne();
    return { status: "success", msg: "data Deleted Successfully" };
};

module.exports = {
    createSubscription,
    querySubscriptions,
    getSubscriptionById,
    getSubscriptions,
    updateSubscriptionById,
    deleteSubscriptionById,
};
