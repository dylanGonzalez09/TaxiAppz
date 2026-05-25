const express = require('express');
const auth = require('../../../middlewares/auth');
const validate = require('../../../middlewares/validate');
const requestValidation = require('../../../validations/web/request/request.validation');
const requestController = require('../../../controllers/web/request/request.controller');

const router = express.Router();

router.route('/create').post(auth('Request'), validate(requestValidation.createRequest), requestController.createRequest);
router.route('/place/create').post(auth('Request'),requestController.createRequestPlace);
router.route('/getRequests').get(auth('Request'), validate(requestValidation.getRequests), requestController.getRequests);
router.route('/getRequest/list').get(auth('Request'), validate(requestValidation.getRequests), requestController.getRequestsWithOutPagination);
router.route('/getRequest/pagination').get(auth('Request'),requestController.getRequestsWithPagination);
router.route('/getRequest/:requestId').get(validate(requestValidation.getRequestById), requestController.getRequestById);
router.route('/updateRequest/:requestId').patch(auth('Request'), validate(requestValidation.updateRequest), requestController.updateRequest);
router.route('/deleteRequest/:requestId').delete(auth('Request'), validate(requestValidation.deleteRequest), requestController.deleteRequest);
router.route('/getRequestByUserId/:requestId').get(auth('Request'),  requestController.getRequestsByUserId);
router.route('/getRequest/history/:phoneNumber').get(auth('Request'), validate(requestValidation.getRequestHistoryById), requestController.getRequestsHistory);
router.route('/eta').post(auth('Request'),requestController.getTypes);
// Web-specific ETA endpoint (no clientId required, optional auth)
router.route('/web/eta').post(auth('Request'),requestController.getWebTypes);
// Web-specific request creation (no clientId required, auth required)
router.route('/web/create').post(auth('Request'), requestController.createWebRequest);
// Web-specific request status (for polling)
router.route('/web/status/:requestId').get(auth('Request'), requestController.getWebRequestStatus);
// Web-specific request cancellation
router.route('/web/cancel').post(auth('Request'), requestController.cancelWebRequest);
router.route('/getTripReports').get(requestController.getTripReports);
router.route('/getTripCount').get(requestController.getTripCount);
router.route('/getLastTrips').get(requestController.getLastTrips);
router.route('/getLogisticsEarnings').get(requestController.getLogisticsEarnings);
router.route('/getTotalEarnings').get(requestController.getTotalEarnings);
router.route('/getUserTrips/:userId').get(requestController.getUserTrips);
router.route('/getTripsByDriver').get(requestController.getTripsByDriver);
router.route('/getDriverRequestTrips/:userId').get(requestController.getDriverTrips);
router.route('/getDriverSummaries').get(requestController.getDriverSummaries);
router.route('/getTripWiseReports').get(requestController.getTripWiseReports);
router.route('/getCompletedLocalTrip').get(requestController.getCompletedLocalTrip);
router.route('/getCompletedRentalTrip').get(requestController.getCompletedRentalTrip);
router.route('/getRentalList').get(requestController.getRentalList);
router.route('/getTodayEarnings').get(requestController.getTodayEarnings);
router.route('/getTodayReport').get(requestController.getTodayReport);
router.route('/getWeeklyReport').get(requestController.getWeeklyReport);
router.route('/getMonthlyReport').get(requestController.getMonthlyReport);
router.route('/getYearlyRevenue').get(requestController.getYearlyRevenue);
router.route('/getTripsByDriver').get(requestController.getTripsByDriver);
router.route('/getTripsByUser').get(requestController.getTripsByUser);
router.route('/getErrorLogs').get(requestController.getErrorLogs);


module.exports = router;


/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 * paths:
 *   /request/create:
 *     post:
 *       summary: Create a new request
 *       description: Create a new service request.
 *       tags: [Request]
 *       security:
 *         - bearerAuth: []
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 serviceType:
 *                   type: string
 *                   example: "Delivery"
 *                 userId:
 *                   type: string
 *                   example: "60b0aa1b7704d52e5a5b17"
 *                 driverId:
 *                   type: string
 *                   example: "60b0aa1b7704d52e5a5b17"
 *                 isCompleted:
 *                   type: boolean
 *                   example: false
 *                 isCancelled:
 *                   type: boolean
 *                   example: false
 *       responses:
 *         "200":
 *           description: Successfully created a new request
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   success:
 *                     type: boolean
 *                     example: true
 *                   data:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 */
