const express = require('express');
const auth = require('../../../middlewares/auth');
const validate = require('../../../middlewares/validate');
const createrRequestValidation = require('../../../validations/api/request/createRequest.validation');
const acceptrejectValidation = require('../../../validations/api/request/acceptReject.validation');
const arrivedValidation = require('../../../validations/api/request/arrived.validation');
const startTripValidation = require('../../../validations/api/request/startTrip.validation');
const endTripValidation = require('../../../validations/api/request/endTrip.validation');
const cancelValidation = require('../../../validations/api/request/cancel.validation');
const requestValidation = require('../../../validations/api/auth/request.validation');

const createRequestController = require('../../../controllers/api/request/createRequest.controller');
const acceptRejectController = require('../../../controllers/api/request/acceptReject.controller');
const arrivedController = require('../../../controllers/api/request/arrived.controller');
const startTripController = require('../../../controllers/api/request/startTrip.controller');
const endTripController = require('../../../controllers/api/request/endTrip.controller');
const cancelController = require('../../../controllers/api/request/cancel.controller');
const requestController = require('../../../controllers/api/auth/request.controller');

const router = express.Router();

const {tripsUpload} = require('../../../middlewares/upload');

router.route('/create').post(auth('Request'), validate(createrRequestValidation.createTripValidation), createRequestController.createTrip);
router.route('/respond').post(auth('Request'), validate(acceptrejectValidation.respondValidation), acceptRejectController.respondTrip);
router.route('/locationChange').post(auth('Request'), acceptRejectController.locationChangeTrip);
router.route('/arrived').post(auth('Request'), validate(arrivedValidation.arrivedValidation), arrivedController.arrivedTrip);
router.route('/start').post(auth('Request'), validate(startTripValidation.starttripValidation),startTripController.startTripsController);
router.route('/complete').post(auth('Request'), validate(endTripValidation.completeValidation),endTripController.completeTrip);
router.route('/cancel').post(auth('Request'), validate(cancelValidation.cancelValidation), cancelController.cancelTrips);
router.route('/user/getRequests/inprogress').get(auth('Request'), validate(requestValidation.getRequest), requestController.userGetRequestsInProgress);
router.route('/dispatcher').post(auth('Request'), validate(createrRequestValidation.createDispatcherValidation), createRequestController.createDispatcher);
router.route('/getRequest/pagination').get(auth('Request'),createRequestController.getRequestpagination);
router.route('/driver/getRequest/pagination').get(auth('Request'),createRequestController.getDriverRequestpagination);
router.route('/upload-image').post(auth('Request'), tripsUpload.single('image'), createRequestController.uploadImage);
router.route('/delete-image/:filename').delete(auth('Request'), createRequestController.deleteImage);


router.route('/bidding/create').post(auth('Request'), validate(createrRequestValidation.createTripValidation), createRequestController.createBiddingTrip);
router.route('/bidding/respond').post(auth('Request'), validate(acceptrejectValidation.respondValidation), acceptRejectController.respondBiddingTrip);
router.route('/bidding/list').post(auth('Request'), validate(acceptrejectValidation.userRequestList), acceptRejectController.UserRequestBiddingList);
router.route('/bidding/list/all').post(auth('Request'), acceptRejectController.UserRequestAllBiddingList);
router.route('/bidding/updateBidAmount').put(auth('Request'), validate(acceptrejectValidation.bidAmountUpdate), acceptRejectController.UpdateBidAmount);
router.route('/bidding/assign').post(validate(acceptrejectValidation.AssignRequest), acceptRejectController.AssignRequest);
router.route('/driver/bidding/list').post(auth('Request'), acceptRejectController.DriverBidList);


//payment
router.route('/payment/create').post(auth('Request'), validate(createrRequestValidation.createPaymentValidation), createRequestController.createPayment);
router.route('/payment/confirm').post(auth('Request'), validate(createrRequestValidation.confirmPaymentValidation), createRequestController.confirmPayment);
router.route('/payment/status').get(auth('Request'), createRequestController.getPaymentStatus);

router.route('/payment/history').post(auth('Request'), endTripController.getpaymentHistory);
router.route('/payment/movetocash').post(auth('Request'), endTripController.moveToCash);

module.exports = router;

