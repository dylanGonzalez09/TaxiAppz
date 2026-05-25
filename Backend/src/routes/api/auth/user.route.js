const express = require('express');
const auth = require('../../../middlewares/auth');
const validate = require('../../../middlewares/validate');

const authValidation = require('../../../validations/api/auth/auth.validation');
const userValidation = require('../../../validations/api/auth/user.validation');
const authController = require('../../../controllers/api/auth/auth.controller');
const userController = require('../../../controllers/api/auth/user.controller');

const router = express.Router();
const { userUpload } = require('../../../middlewares/upload');

// Routes with authentication and validation

router.post('/login', validate(authValidation.login),authController.userOtpSent);
router.post('/verify', validate(authValidation.verify), authController.userVerify);
router.post('/create',validate(userValidation.mobileCreateUser), userUpload.single('profilePic'), userController.createUser);
router.route('/getProfile').get(auth('Users'), userController.getUser);
router.route('/updateUsers').put(auth('Users'), validate(userValidation.updateUser), userUpload.single('profilePic'), userController.updateUser);
router.get('/places', userController.getAutocompletePlaces);
router.get('/request/history', userController.getRequestsHistory);

module.exports = router;


/**
 * @swagger
 * /driver/login:
 *   post:
 *     summary: Authenticate the driver and send OTP
 *     description: Authenticate the driver using the provided phone number and country code. Sends an OTP to the specified phone number.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               authenticationType:
 *                 type: string
 *                 description: Type of authentication (e.g., OTP).
 *                 example: "OTP"
 *               email:
 *                 type: string
 *                 description: Email address (optional for OTP).
 *               password:
 *                 type: string
 *                 description: Password (optional for OTP).
 *               phoneNumber:
 *                 type: string
 *                 description: The phone number of the user.
 *                 example: "9003734129"
 *               countryCode:
 *                 type: string
 *                 description: Country code hash associated with the user.
 *                 example: "66d5848ce928e7a8d374d85b"
 *     responses:
 *       "200":
 *         description: OTP sent successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates whether the operation was successful.
 *                   example: true
 *                 data:
 *                   type: string
 *                   description: Response message for successful OTP generation.
 *                   example: "Otp Sent Successfully"
 *                 message:
 *                   type: string
 *                   description: Additional details on the response.
 *                   example: "Data Found"
 *       "400":
 *         description: Invalid input data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Invalid phone number or country code."
 *       "500":
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "An unexpected error occurred."
 * /driver/verify:
 *   post:
 *     summary: Verify the OTP and authenticate the driver
 *     description: Verify the OTP sent to the driver's phone number, and authenticate the driver. Returns access and refresh tokens upon successful verification.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 description: The phone number of the user.
 *                 example: "9003734129"
 *               countryCode:
 *                 type: string
 *                 description: Country code hash associated with the user.
 *                 example: "66d5848ce928e7a8d374d85b"
 *               otp:
 *                 type: string
 *                 description: The OTP sent to the user's phone number.
 *                 example: "1234"
 *               deviceInfoHash:
 *                 type: string
 *                 description: A unique hash of the user's device information.
 *                 example: "testing hash"
 *               isPrimary:
 *                 type: string
 *                 description: Indicates if the device is the primary device.
 *                 example: "yes"
 *               deviceType:
 *                 type: string
 *                 description: Type of device used for login.
 *                 example: "Android"
 *     responses:
 *       "200":
 *         description: OTP verified successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the operation was successful.
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     usertype:
 *                       type: string
 *                       description: The type of user.
 *                       example: "ExitUser"
 *                     tokens:
 *                       type: object
 *                       properties:
 *                         access:
 *                           type: object
 *                           properties:
 *                             token:
 *                               type: string
 *                               description: The access token.
 *                               example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                             expires:
 *                               type: string
 *                               format: date-time
 *                               description: The expiry date and time of the access token.
 *                               example: "2024-11-20T14:27:47.645Z"
 *                         refresh:
 *                           type: object
 *                           properties:
 *                             token:
 *                               type: string
 *                               description: The refresh token.
 *                               example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                             expires:
 *                               type: string
 *                               format: date-time
 *                               description: The expiry date and time of the refresh token.
 *                               example: "2025-09-14T12:27:47.649Z"
 *                 message:
 *                   type: string
 *                   description: Response message for successful verification.
 *                   example: "Otp Verify Successfully"
 *       "400":
 *         description: Invalid input data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Invalid OTP or phone number."
 *       "500":
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "An unexpected error occurred."
* /driver/getCategory/list:
 *   get:
 *     summary: Get categories
 *     description: Retrieve a list of all categories without pagination.
 *     tags: [Authentication]
 *     responses:
 *       "200":
 *         description: List of categories
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       category:
 *                         type: string
 *                         example: uber
 *                       categoryImage:
 *                         type: string
 *                         example: /uploads/categoryImage/example.jpg
 *                       status:
 *                         type: boolean
 *                         example: true
 *                       clientId:
 *                         type: string
 *                         example: 66d477418c8e995c9073c512
 *                       id:
 *                         type: string
 *                         example: 66fe6be8a4b27b5145f5796d
 *                 message:
 *                   type: string
 *                   example: Categories retrieved successfully
 * 
 * /driver/getVehicle/list:
 *   get:
 *     summary: Get vehicles
 *     description: Retrieve a list of all vehicles without pagination.
 *     tags: [Authentication]
 *     responses:
 *       "200":
 *         description: List of vehicles
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       vehicleName:
 *                         type: string
 *                         example: four wheeler
 *                       image:
 *                         type: string
 *                         example: /uploads/vehicles/example.png
 *                       capacity:
 *                         type: integer
 *                         example: 6
 *                       serviceType:
 *                         type: string
 *                         example: ["Local", "Rental"]
 *                       categoryId:
 *                         type: string
 *                         example: 66fe6be8a4b27b5145f5796d
 *                       sortingorder:
 *                         type: integer
 *                         example: 3
 *                       highlightImage:
 *                         type: string
 *                         example: /uploads/vehicles/highlight.png
 *                       status:
 *                         type: boolean
 *                         example: true
 *                       clientId:
 *                         type: string
 *                         example: 66d477418c8e995c9073c512
 *                       id:
 *                         type: string
 *                         example: 66b5aac6259a9c94f2643969
 *                 message:
 *                   type: string
 *                   example: Vehicles retrieved successfully
 * 
 * /driver/getVehicleModel/list:
 *   get:
 *     summary: Get vehicle models
 *     description: Retrieve a list of all vehicle models without pagination.
 *     tags: [Authentication]
 *     responses:
 *       "200":
 *         description: List of vehicle models
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       modelname:
 *                         type: string
 *                         example: test
 *                       description:
 *                         type: string
 *                         example: test description
 *                       image:
 *                         type: string
 *                         example: /uploads/vehicleModels/example.png
 *                       vehicleId:
 *                         type: string
 *                         example: 66b5aac6259a9c94f2643969
 *                       status:
 *                         type: boolean
 *                         example: true
 *                       clientId:
 *                         type: string
 *                         example: 66d477418c8e995c9073c512
 *                       id:
 *                         type: string
 *                         example: 66b5b6eb259a9c94f2643a1f
 *                 message:
 *                   type: string
 *                   example: Vehicle models retrieved successfully
 * 
 * /driver/getCountry/list:
 *   get:
 *     summary: Get countries
 *     description: Retrieve a list of all countries without pagination.
 *     tags: [Authentication]
 *     responses:
 *       "200":
 *         description: List of countries
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         example: Afghanistan
 *                       dial_code:
 *                         type: string
 *                         example: +93
 *                       code:
 *                         type: string
 *                         example: AF
 *                       currency_code:
 *                         type: string
 *                         example: AFN
 *                       currency_symbol:
 *                         type: string
 *                         example: ؋
 *                       status:
 *                         type: boolean
 *                         example: true
 *                       capital:
 *                         type: string
 *                         example: Kabul
 *                       citizenship:
 *                         type: string
 *                         example: Afghan
 *                       country_code:
 *                         type: string
 *                         example: 004
 *                       currency:
 *                         type: string
 *                         example: afghani
 *                       currency_sub_unit:
 *                         type: string
 *                         example: pul
 *                       full_name:
 *                         type: string
 *                         example: Islamic Republic of Afghanistan
 *                       iso_3166_3:
 *                         type: string
 *                         example: AFG
 *                       region_code:
 *                         type: string
 *                         example: 142
 *                       sub_region_code:
 *                         type: string
 *                         example: 034
 *                       flag:
 *                         type: string
 *                         example: AF.png
 *                       flag_base_64:
 *                         type: string
 *                         example: base64encodedflagdata
 *                 message:
 *                   type: string
 *                   example: Countries retrieved successfully
 */
