const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const driverValidation = require('../../validations/boilerplate/driver.validation');
const driverController = require('../../controllers/boilerplate/driver.controller');
const { userUpload } = require('../../middlewares/upload');

const router = express.Router();

// Routes with authentication and validation
router.route('/create').post(auth('Driver'), validate(driverValidation.createDriver), userUpload.single('profilePic'), driverController.createDriver);
router.route('/getDrivers').get(auth('Driver'), validate(driverValidation.getDrivers), driverController.getDrivers);
router.route('/getDrivers/:driverId').get(auth('Driver'), validate(driverValidation.getDriver), driverController.getDriver);
router.route('/getDriver/list').get(auth('Driver'), driverController.getDriverWithoutPagination);
router.route('/updateDrivers/:driverId').patch(auth('Driver'), validate(driverValidation.updateDriver), userUpload.single('profilePic'), driverController.updateDriver);
router.route('/deleteDrivers/:driverId').delete(auth('Driver'), validate(driverValidation.deleteDriver), driverController.deleteDriver);
router.route('/getDriver/aggregation').get(auth('Driver'), driverController.aggregateDrivers);
router.get('/getVehicle/:zoneId',driverController.getVehiclesByZoneWithoutPagination);

router.route('/updateActiveStatus/:id').patch(auth('Driver'),validate(driverValidation.updateActiveStatus), driverController.updateActiveStatus);
router.route('/getDropDown/list/:clientId').get(driverController.getDropDownList);
router.route('/getDriverWalletReport').get(driverController.getDriverWallet);
router.route('/getDriverReport').get(driverController.getDriverReport);
router.route('/getZones').get(auth('Driver'), driverController.getZones);
router.route('/getDriverByZone/:zoneId').get( driverController.getDriverByZone);
// auth('Driver'),
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
 *   /admin/create:
 *     post:
 *       summary: Create a new driver
 *       description: Create a new driver with specified details.
 *       tags: [Driver]
 *       security:
 *         - bearerAuth: []
 *       requestBody:
 *         required: true
 *         content:
 *           multipart/form-data:
 *             schema:
 *               type: object
 *               properties:
 *                 firstName:
 *                   type: string
 *                   example: "John"
 *                 lastName:
 *                   type: string
 *                   example: "Doe"
 *                 email:
 *                   type: string
 *                   example: "john.doe@example.com"
 *                 phoneNumber:
 *                   type: string
 *                   example: "1234567890"
 *                 roleIds:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["roleId1", "roleId2"]
 *                 gender:
 *                   type: string
 *                   example: "Male"
 *                 language:
 *                   type: string
 *                   example: "English"
 *                 country:
 *                   type: string
 *                   example: "USA"
 *                 address:
 *                   type: string
 *                   example: "123 Main St"
 *                 active:
 *                   type: boolean
 *                   example: true
 *                 profilePic:
 *                   type: string
 *                   format: binary
 *       responses:
 *         "200":
 *           description: Successfully created a new driver
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
 *                       userId:
 *                         type: string
 *                       city:
 *                         type: string
 *                       state:
 *                         type: string
 *                       pincode:
 *                         type: string
 *                       type:
 *                         type: string
 *                       carModel:
 *                         type: string
 *                       serviceLocation:
 *                         type: string
 *                       notes:
 *                         type: string
 *                       serviceCategory:
 *                         type: string
 *                   message:
 *                     type: string
 *                     example: "Driver created successfully"
 *         "401":
 *           description: Unauthorized, authentication token is missing or invalid
 *         "403":
 *           description: Forbidden, authenticated user does not have permission to create drivers
 *         "400":
 *           description: Bad Request, invalid input data
 *
 *   /admin/getDrivers:
 *     get:
 *       summary: Get list of drivers
 *       description: Retrieve a list of all drivers.
 *       tags: [Driver]
 *       security:
 *         - bearerAuth: []
 *       responses:
 *         "200":
 *           description: Successfully retrieved list of drivers
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   success:
 *                     type: boolean
 *                     example: true
 *                   data:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         userId:
 *                           type: string
 *                           example: "userId1"
 *                         firstName:
 *                           type: string
 *                           example: "John"
 *                         lastName:
 *                           type: string
 *                           example: "Doe"
 *                         email:
 *                           type: string
 *                           example: "john.doe@example.com"
 *                         phoneNumber:
 *                           type: string
 *                           example: "1234567890"
 *                         roleIds:
 *                           type: array
 *                           items:
 *                             type: string
 *                           example: ["roleId1", "roleId2"]
 *                         gender:
 *                           type: string
 *                           example: "Male"
 *                         language:
 *                           type: string
 *                           example: "English"
 *                         country:
 *                           type: string
 *                           example: "USA"
 *                         address:
 *                           type: string
 *                           example: "123 Main St"
 *                         active:
 *                           type: boolean
 *                           example: true
 *         "401":
 *           description: Unauthorized, authentication token is missing or invalid
 *         "403":
 *           description: Forbidden, authenticated user does not have permission to view drivers
 *
 *   /admin/getDrivers/{driverId}:
 *     get:
 *       summary: Get driver details
 *       description: Retrieve details of a specific driver.
 *       tags: [Driver]
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: path
 *           name: driverId
 *           required: true
 *           schema:
 *             type: string
 *           description: The driver ID
 *       responses:
 *         "200":
 *           description: Successfully retrieved driver details
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
 *                       userId:
 *                         type: string
 *                       firstName:
 *                         type: string
 *                         example: "John"
 *                       lastName:
 *                         type: string
 *                         example: "Doe"
 *                       email:
 *                         type: string
 *                         example: "john.doe@example.com"
 *                       phoneNumber:
 *                         type: string
 *                         example: "1234567890"
 *                       roleIds:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: ["roleId1", "roleId2"]
 *                       gender:
 *                         type: string
 *                         example: "Male"
 *                       language:
 *                         type: string
 *                         example: "English"
 *                       country:
 *                         type: string
 *                         example: "USA"
 *                       address:
 *                         type: string
 *                         example: "123 Main St"
 *                       active:
 *                         type: boolean
 *                         example: true
 *         "401":
 *           description: Unauthorized, authentication token is missing or invalid
 *         "403":
 *           description: Forbidden, authenticated user does not have permission to view driver details
 *         "404":
 *           description: Driver not found
 *
 *   /admin/getDriver/list:
 *     get:
 *       summary: Get list of drivers without pagination
 *       description: Retrieve a list of all drivers without pagination.
 *       tags: [Driver]
 *       security:
 *         - bearerAuth: []
 *       responses:
 *         "200":
 *           description: Successfully retrieved list of drivers
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   success:
 *                     type: boolean
 *                     example: true
 *                   data:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         userId:
 *                           type: string
 *                           example: "userId1"
 *                         firstName:
 *                           type: string
 *                           example: "John"
 *                         lastName:
 *                           type: string
 *                           example: "Doe"
 *                         email:
 *                           type: string
 *                           example: "john.doe@example.com"
 *                         phoneNumber:
 *                           type: string
 *                           example: "1234567890"
 *                         roleIds:
 *                           type: array
 *                           items:
 *                             type: string
 *                           example: ["roleId1", "roleId2"]
 *                         gender:
 *                           type: string
 *                           example: "Male"
 *                         language:
 *                           type: string
 *                           example: "English"
 *                         country:
 *                           type: string
 *                           example: "USA"
 *                         address:
 *                           type: string
 *                           example: "123 Main St"
 *                         active:
 *                           type: boolean
 *                           example: true
 *         "401":
 *           description: Unauthorized, authentication token is missing or invalid
 *         "403":
 *           description: Forbidden, authenticated user does not have permission to view drivers
 *
 *   /admin/updateDrivers/{driverId}:
 *     patch:
 *       summary: Update driver details
 *       description: Update the details of a specific driver.
 *       tags: [Driver]
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: path
 *           name: driverId
 *           required: true
 *           schema:
 *             type: string
 *           description: The driver ID
 *       requestBody:
 *         required: true
 *         content:
 *           multipart/form-data:
 *             schema:
 *               type: object
 *               properties:
 *                 firstName:
 *                   type: string
 *                   example: "John"
 *                 lastName:
 *                   type: string
 *                   example: "Doe"
 *                 email:
 *                   type: string
 *                   example: "john.doe@example.com"
 *                 phoneNumber:
 *                   type: string
 *                   example: "1234567890"
 *                 roleIds:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["roleId1", "roleId2"]
 *                 gender:
 *                   type: string
 *                   example: "Male"
 *                 language:
 *                   type: string
 *                   example: "English"
 *                 country:
 *                   type: string
 *                   example: "USA"
 *                 address:
 *                   type: string
 *                   example: "123 Main St"
 *                 active:
 *                   type: boolean
 *                   example: true
 *                 profilePic:
 *                   type: string
 *                   format: binary
 *       responses:
 *         "200":
 *           description: Successfully updated driver details
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
 *                       userId:
 *                         type: string
 *                       firstName:
 *                         type: string
 *                         example: "John"
 *                       lastName:
 *                         type: string
 *                         example: "Doe"
 *                       email:
 *                         type: string
 *                         example: "john.doe@example.com"
 *                       phoneNumber:
 *                         type: string
 *                         example: "1234567890"
 *                       roleIds:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: ["roleId1", "roleId2"]
 *                       gender:
 *                         type: string
 *                         example: "Male"
 *                       language:
 *                         type: string
 *                         example: "English"
 *                       country:
 *                         type: string
 *                         example: "USA"
 *                       address:
 *                         type: string
 *                         example: "123 Main St"
 *                       active:
 *                         type: boolean
 *                         example: true
 *                   message:
 *                     type: string
 *                     example: "Driver updated successfully"
 *         "401":
 *           description: Unauthorized, authentication token is missing or invalid
 *         "403":
 *           description: Forbidden, authenticated user does not have permission to update driver details
 *         "404":
 *           description: Driver not found
 *
 *   /admin/deleteDrivers/{driverId}:
 *     delete:
 *       summary: Delete a driver
 *       description: Delete a specific driver.
 *       tags: [Driver]
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: path
 *           name: driverId
 *           required: true
 *           schema:
 *             type: string
 *           description: The driver ID
 *       responses:
 *         "200":
 *           description: Successfully deleted the driver
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   success:
 *                     type: boolean
 *                     example: true
 *                   message:
 *                     type: string
 *                     example: "Driver deleted successfully"
 *         "401":
 *           description: Unauthorized, authentication token is missing or invalid
 *         "403":
 *           description: Forbidden, authenticated user does not have permission to delete driver
 *         "404":
 *           description: Driver not found
 */
