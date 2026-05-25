const httpStatus = require('http-status');
const pick = require('../../../utils/pick');
const ApiError = require('../../../utils/ApiError');
const catchAsync = require('../../../utils/catchAsync');
const { driverSubscriptionService } = require('../../../services');
const Response = require('../../../config/response');

const createSubscription = catchAsync(async (req, res) => {
    const subscription = await driverSubscriptionService.createSubscription(req);
    const response = Response(true, subscription, "Success");
    res.status(httpStatus.CREATED).send(response);
});

const getSubscriptions = catchAsync(async (req, res) => {
    const filter = pick(req.query, ['name', 'role']);
    const options = pick(req.query, ['sortBy', 'limit', 'page']);
    const result = await driverSubscriptionService.querySubscriptions(filter, options, req);
    const response = Response(true, result, "Success");
    res.status(httpStatus.OK).send(response);
});

const getSubscription = catchAsync(async (req, res) => {
    const subscription = await driverSubscriptionService.getSubscriptionById(req.params.SubscriptionId);
    if (!subscription) {
        throw new ApiError(httpStatus.NOT_FOUND, 'subscription not found');
    }
    const response = Response(true, subscription, "Success");
    res.status(httpStatus.OK).send(response);
});

const getSubscriptionsWithOutPagination = catchAsync(async (req, res) => {
    const subscription = await driverSubscriptionService.getSubscriptions(req);
    if (!subscription) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Sos not found');
    }
    const response = Response(true, subscription, "Success");
    res.status(httpStatus.OK).send(response);
});

const updateSubscription = catchAsync(async (req, res) => {
    const subscription = await driverSubscriptionService.updateSubscriptionById(req.params.subscriptionId, req.body);
    const response = Response(true, subscription, "Success");
    res.status(httpStatus.OK).send(response);
});

const deleteSubscription = catchAsync(async (req, res) => {
    const subscription = await driverSubscriptionService.deleteSubscriptionById(req.params.faqId);
    const response = Response(true, subscription, "Success");
    res.status(httpStatus.OK).send(response);
});

module.exports = {
    createSubscription,
    getSubscriptions,
    getSubscription,
    getSubscriptionsWithOutPagination,
    updateSubscription,
    deleteSubscription,
};
