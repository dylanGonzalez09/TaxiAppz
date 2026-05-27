const express = require('express');
const auth = require('../../../middlewares/auth');
const validate = require('../../../middlewares/validate');
const requestValidation = require('../../../validations/api/auth/request.validation');
const requestController = require('../../../controllers/api/auth/request.controller');

const router = express.Router();

router
  .route('/getRequests/inprogress')
  .get(auth('Request'), validate(requestValidation.getRequest), requestController.getRequestsInProgress);
router
  .route('/getRequestsList')
  .get(auth('Request'), validate(requestValidation.getRequest), requestController.getRequestsList);
router
  .route('/getRequestsByView/:requestId')
  .get(auth('Request'), validate(requestValidation.getRequestById), requestController.getRequestsListView);
router
  .route('/user/getRequests/inprogress')
  .get(auth('Request'), validate(requestValidation.getRequest), requestController.userGetRequestsInProgress);
router
  .route('/recents/list')
  .get(auth('Request'), validate(requestValidation.getRequest), requestController.getLastTripHistory);
router.route('/eta').post(auth('Request'), requestController.getTypes);
router.route('/checkZone').post(auth('Request'), requestController.checkPickUpZone);
router.route('/convertLatLngToAddess').post(auth('Request'), requestController.convertLatLngAddress);
router.route('/converAddressLatLng').post(auth('Request'), requestController.convertAddressLatLng);
router.route('/convertPolygoLine').post(requestController.getPolygonLine);
router.route('/allconvertPolygoLine').post(requestController.getAllPolygonLine);
router.route('/travelTime').post(requestController.getAllTravelTime);
module.exports = router;
