const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const usersValidation = require('../../validations/web/master/users.validation');
const usersController = require('../../controllers/boilerplate/users.controller');

const router = express.Router();

router.post('/create', validate(usersValidation.createUser), usersController.createUser);
router.post('/getUserByEmail', validate(usersValidation.getUserByEmail), usersController.getUserByEmail);
router.post('/getUserByEmailDetails', validate(usersValidation.getUserByEmail), usersController.getUserByEmailDetails);
router.route('/getUsers').get(auth('Users'), validate(usersValidation.getUsers), usersController.getUsers);
router.route('/getUser/:userId').get(auth('Users'), validate(usersValidation.getUser), usersController.getUser);
router
  .route('/getUserByRole/:roleId')
  .get(auth('Users'), validate(usersValidation.getUserByRole), usersController.getUserByRole);
router.route('/updateUsers/:userId').patch(auth('Users'), validate(usersValidation.updateUser), usersController.updateUser);
router.route('/deleteUsers/:userId').delete(auth('Users'), validate(usersValidation.deleteUser), usersController.deleteUser);

router.post('/admin/create', validate(usersValidation.createUser), usersController.createUser);
router.post('/admin/getUserByEmail', validate(usersValidation.getUserByEmail), usersController.getUserByEmail);
router.get('/admin/getUsers', validate(usersValidation.getUsers), usersController.getUsers);
router.get('/admin/getUser/:userId', validate(usersValidation.getUser), usersController.getUser);
router.get('/admin/getUserByRole/:roleId', validate(usersValidation.getUserByRole), usersController.getUserByRole);
router.patch('/admin/updateUsers/:userId', validate(usersValidation.updateUser), usersController.updateUser);
router.delete('/admin/deleteUsers/:userId', validate(usersValidation.deleteUser), usersController.deleteUser);

router.route('/getDropDown/list/:clientId').get(usersController.getDropDownList);

router.route('/getDashboardCount').get(usersController.getDashboardCount);
router.route('/allAdmin').get(usersController.getAllAdmin);
router.route('/getUserProfileDetails/:userId').get(usersController.getUserProfileDetails);
router.route('/getDriverProfileDetails/:userId').get(usersController.getDriverProfileDetails);
router.route('/getLogisticalCounts').get(usersController.getLogisticalCounts);

module.exports = router;

/**
 * @swagger
 * /users/create:
 *   post:
 *     summary: Create a new user
 *     description: Create a new user with the provided details.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               slug:
 *                 type: string
 *                 example: siva
 *               firstname:
 *                 type: string
 *                 example: siva
 *               lastname:
 *                 type: string
 *                 example: kumar
 *               email:
 *                 type: string
 *                 example: sivakumar@gmail.com
 *               phone_number:
 *                 type: string
 *                 example: 91591745054
 *               time_zone:
 *                 type: string
 *                 example: india
 *               roleIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   example: "668645462e75510101af8b43"
 *               password:
 *                 type: string
 *                 example: mani@123
 *     responses:
 *       "201":
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     slug:
 *                       type: string
 *                       example: siva
 *                     firstname:
 *                       type: string
 *                       example: siva
 *                     lastname:
 *                       type: string
 *                       example: kumar
 *                     email:
 *                       type: string
 *                       example: sivakumar@gmail.com
 *                     phone_number:
 *                       type: string
 *                       example: 91591745054
 *                     gender:
 *                       type: string
 *                       example: null
 *                     time_zone:
 *                       type: string
 *                       example: india
 *                     user_type:
 *                       type: string
 *                       example: null
 *                     roleIds:
 *                       type: array
 *                       items:
 *                         type: string
 *                         example: "668645462e75510101af8b43"
 *                     device_info_hash:
 *                       type: string
 *                       example: null
 *                     avatar:
 *                       type: string
 *                       example: null
 *                     active:
 *                       type: boolean
 *                       example: true
 *                     last_seen:
 *                       type: string
 *                       format: date-time
 *                       example: null
 *                     social_unique_id:
 *                       type: string
 *                       example: null
 *                     mobile_application_type:
 *                       type: string
 *                       example: ANDROID
 *                     token:
 *                       type: string
 *                       example: null
 *                     country_code:
 *                       type: string
 *                       example: null
 *                     remember_token:
 *                       type: string
 *                       example: null
 *                     profile_pic:
 *                       type: string
 *                       example: null
 *                     referral_code:
 *                       type: string
 *                       example: null
 *                     online_by:
 *                       type: number
 *                       example: 0
 *                     block_reson:
 *                       type: string
 *                       example: null
 *                     language:
 *                       type: string
 *                       example: en
 *                     address:
 *                       type: string
 *                       example: null
 *                     emergency_number:
 *                       type: string
 *                       example: null
 *                     user_referral_code:
 *                       type: string
 *                       example: null
 *                     otp:
 *                       type: string
 *                       example: null
 *                     demo_key:
 *                       type: string
 *                       example: null
 *                     country:
 *                       type: string
 *                       example: null
 *                     trips_count:
 *                       type: number
 *                       example: 0
 *                     otp_expires_at:
 *                       type: string
 *                       format: date-time
 *                       example: null
 *                     created_by:
 *                       type: number
 *                       example: null
 *                     admin_demo_key:
 *                       type: string
 *                       example: null
 *                     rating:
 *                       type: number
 *                       example: null
 *                     others_user_id:
 *                       type: number
 *                       example: null
 *                     id:
 *                       type: string
 *                       example: 6687d4ef6c61f85a46df6ca2
 *                 message:
 *                   type: string
 *                   example: Success
 */

/**
 * @swagger
 * /users/getUsers:
 *   get:
 *     summary: Get all users
 *     description: Retrieve a list of all users.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: A list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     results:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           slug:
 *                             type: string
 *                             example: Manoj
 *                           firstname:
 *                             type: string
 *                             example: Manoj
 *                           lastname:
 *                             type: string
 *                             example: kumar
 *                           email:
 *                             type: string
 *                             example: manojkumarr21@gmail.com
 *                           phone_number:
 *                             type: string
 *                             example: 9360454540
 *                           gender:
 *                             type: string
 *                             example: null
 *                           time_zone:
 *                             type: string
 *                             example: india
 *                           user_type:
 *                             type: string
 *                             example: null
 *                           roleIds:
 *                             type: array
 *                             items:
 *                               type: string
 *                               example: "668645462e75510101af8b43"
 *                           device_info_hash:
 *                             type: string
 *                             example: null
 *                           avatar:
 *                             type: string
 *                             example: null
 *                           active:
 *                             type: boolean
 *                             example: true
 *                           last_seen:
 *                             type: string
 *                             format: date-time
 *                             example: null
 *                           social_unique_id:
 *                             type: string
 *                             example: null
 *                           mobile_application_type:
 *                             type: string
 *                             example: ANDROID
 *                           token:
 *                             type: string
 *                             example: null
 *                           country_code:
 *                             type: string
 *                             example: null
 *                           remember_token:
 *                             type: string
 *                             example: null
 *                           profile_pic:
 *                             type: string
 *                             example: null
 *                           referral_code:
 *                             type: string
 *                             example: null
 *                           online_by:
 *                             type: number
 *                             example: 0
 *                           block_reson:
 *                             type: string
 *                             example: null
 *                           language:
 *                             type: string
 *                             example: en
 *                           address:
 *                             type: string
 *                             example: null
 *                           emergency_number:
 *                             type: string
 *                             example: null
 *                           user_referral_code:
 *                             type: string
 *                             example: null
 *                           otp:
 *                             type: string
 *                             example: null
 *                           demo_key:
 *                             type: string
 *                             example: null
 *                           country:
 *                             type: string
 *                             example: null
 *                           trips_count:
 *                             type: number
 *                             example: 0
 *                           otp_expires_at:
 *                             type: string
 *                             format: date-time
 *                             example: null
 *                           created_by:
 *                             type: number
 *                             example: null
 *                           admin_demo_key:
 *                             type: string
 *                             example: null
 *                           rating:
 *                             type: number
 *                             example: null
 *                           others_user_id:
 *                             type: number
 *                             example: null
 *                           id:
 *                             type: string
 *                             example: "66878894c0fb87cb7f7e3800"
 *                     page:
 *                       type: number
 *                       example: 1
 *                     limit:
 *                       type: number
 *                       example: 10
 *                     totalPages:
 *                       type: number
 *                       example: 1
 *                     totalResults:
 *                       type: number
 *                       example: 6
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 */

/**
 * @swagger
 * /users/getUser/{userId}:
 *   get:
 *     summary: Get a user by ID
 *     description: Retrieve details of a user by their ID.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user to fetch
 *     responses:
 *       "200":
 *         description: Details of the user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     slug:
 *                       type: string
 *                       example: Mani
 *                     firstname:
 *                       type: string
 *                       example: Mani
 *                     lastname:
 *                       type: string
 *                       example: Kandan
 *                     email:
 *                       type: string
 *                       example: mani@gmail.com
 *                     phone_number:
 *                       type: string
 *                       example: "91591745055"
 *                     gender:
 *                       type: string
 *                       example: null
 *                     time_zone:
 *                       type: string
 *                       example: india
 *                     user_type:
 *                       type: string
 *                       example: null
 *                     roleIds:
 *                       type: array
 *                       items:
 *                         type: string
 *                         example: "668645462e75510101af8b43"
 *                     device_info_hash:
 *                       type: string
 *                       example: null
 *                     avatar:
 *                       type: string
 *                       example: null
 *                     active:
 *                       type: boolean
 *                       example: true
 *                     last_seen:
 *                       type: string
 *                       format: date-time
 *                       example: null
 *                     social_unique_id:
 *                       type: string
 *                       example: null
 *                     mobile_application_type:
 *                       type: string
 *                       example: ANDROID
 *                     token:
 *                       type: string
 *                       example: null
 *                     country_code:
 *                       type: string
 *                       example: null
 *                     remember_token:
 *                       type: string
 *                       example: null
 *                     profile_pic:
 *                       type: string
 *                       example: null
 *                     referral_code:
 *                       type: string
 *                       example: null
 *                     online_by:
 *                       type: number
 *                       example: 0
 *                     block_reson:
 *                       type: string
 *                       example: null
 *                     language:
 *                       type: string
 *                       example: en
 *                     address:
 *                       type: string
 *                       example: null
 *                     emergency_number:
 *                       type: string
 *                       example: null
 *                     user_referral_code:
 *                       type: string
 *                       example: null
 *                     otp:
 *                       type: string
 *                       example: null
 *                     demo_key:
 *                       type: string
 *                       example: null
 *                     country:
 *                       type: string
 *                       example: null
 *                     trips_count:
 *                       type: number
 *                       example: 0
 *                     otp_expires_at:
 *                       type: string
 *                       format: date-time
 *                       example: null
 *                     created_by:
 *                       type: number
 *                       example: null
 *                     admin_demo_key:
 *                       type: string
 *                       example: null
 *                     rating:
 *                       type: number
 *                       example: null
 *                     others_user_id:
 *                       type: number
 *                       example: null
 *                     id:
 *                       type: string
 *                       example: "66878c4fe706f2030e29e495"
 *                 message:
 *                   type: string
 *                   example: Success
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 */

/**
 * @swagger
 * /users/getUserByRole/{roleId}:
 *   get:
 *     summary: Get users by role ID
 *     description: Retrieve users belonging to a specific role.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the role to fetch users for
 *     responses:
 *       "200":
 *         description: List of users belonging to the role
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
 *                       gender:
 *                         type: string
 *                         example: null
 *                       user_type:
 *                         type: string
 *                         example: null
 *                       roleIds:
 *                         type: array
 *                         items:
 *                           type: string
 *                           example: "668645462e75510101af8b43"
 *                       device_info_hash:
 *                         type: string
 *                         example: null
 *                       avatar:
 *                         type: string
 *                         example: null
 *                       active:
 *                         type: boolean
 *                         example: true
 *                       last_seen:
 *                         type: string
 *                         format: date-time
 *                         example: null
 *                       social_unique_id:
 *                         type: string
 *                         example: null
 *                       mobile_application_type:
 *                         type: string
 *                         example: ANDROID
 *                       token:
 *                         type: string
 *                         example: null
 *                       country_code:
 *                         type: string
 *                         example: null
 *                       remember_token:
 *                         type: string
 *                         example: null
 *                       profile_pic:
 *                         type: string
 *                         example: null
 *                       referral_code:
 *                         type: string
 *                         example: null
 *                       online_by:
 *                         type: number
 *                         example: 0
 *                       block_reson:
 *                         type: string
 *                         example: null
 *                       language:
 *                         type: string
 *                         example: en
 *                       address:
 *                         type: string
 *                         example: null
 *                       emergency_number:
 *                         type: string
 *                         example: null
 *                       user_referral_code:
 *                         type: string
 *                         example: null
 *                       otp:
 *                         type: string
 *                         example: null
 *                       demo_key:
 *                         type: string
 *                         example: null
 *                       country:
 *                         type: string
 *                         example: null
 *                       trips_count:
 *                         type: number
 *                         example: 0
 *                       otp_expires_at:
 *                         type: string
 *                         format: date-time
 *                         example: null
 *                       created_by:
 *                         type: number
 *                         example: null
 *                       admin_demo_key:
 *                         type: string
 *                         example: null
 *                       rating:
 *                         type: number
 *                         example: null
 *                       others_user_id:
 *                         type: number
 *                         example: null
 *                       email:
 *                         type: string
 *                         example: manojkumar@gmail.com
 *                       id:
 *                         type: string
 *                         example: "668384422f79e7b31d7b6b02"
 *                 message:
 *                   type: string
 *                   example: Success
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 */

/**
 * @swagger
 * /users/updateUsers/{userId}:
 *   patch:
 *     summary: Update user details
 *     description: Update specific details of a user identified by their ID.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user to update
 *       - in: body
 *         name: body
 *         required: true
 *         description: Updated user details
 *         schema:
 *           type: object
 *           properties:
 *             slug:
 *               type: string
 *               example: Mani
 *             firstname:
 *               type: string
 *               example: Mani
 *             lastname:
 *               type: string
 *               example: Kandan
 *             email:
 *               type: string
 *               example: mani@gmail.com
 *             phone_number:
 *               type: string
 *               example: "91591745055"
 *             time_zone:
 *               type: string
 *               example: india
 *             roleIds:
 *               type: array
 *               items:
 *                 type: string
 *                 example: "668645462e75510101af8b43"
 *             password:
 *               type: string
 *               example: mani@123
 *     responses:
 *       "200":
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     slug:
 *                       type: string
 *                       example: Mani
 *                     firstname:
 *                       type: string
 *                       example: Mani
 *                     lastname:
 *                       type: string
 *                       example: Kandan
 *                     email:
 *                       type: string
 *                       example: mani@gmail.com
 *                     phone_number:
 *                       type: string
 *                       example: "91591745055"
 *                     gender:
 *                       type: string
 *                       example: null
 *                     time_zone:
 *                       type: string
 *                       example: india
 *                     user_type:
 *                       type: string
 *                       example: null
 *                     roleIds:
 *                       type: array
 *                       items:
 *                         type: string
 *                         example: "668645462e75510101af8b43"
 *                     device_info_hash:
 *                       type: string
 *                       example: null
 *                     avatar:
 *                       type: string
 *                       example: null
 *                     active:
 *                       type: boolean
 *                       example: true
 *                     last_seen:
 *                       type: string
 *                       format: date-time
 *                       example: null
 *                     social_unique_id:
 *                       type: string
 *                       example: null
 *                     mobile_application_type:
 *                       type: string
 *                       example: ANDROID
 *                     token:
 *                       type: string
 *                       example: null
 *                     country_code:
 *                       type: string
 *                       example: null
 *                     remember_token:
 *                       type: string
 *                       example: null
 *                     profile_pic:
 *                       type: string
 *                       example: null
 *                     referral_code:
 *                       type: string
 *                       example: null
 *                     online_by:
 *                       type: number
 *                       example: 0
 *                     block_reson:
 *                       type: string
 *                       example: null
 *                     language:
 *                       type: string
 *                       example: en
 *                     address:
 *                       type: string
 *                       example: null
 *                     emergency_number:
 *                       type: string
 *                       example: null
 *                     user_referral_code:
 *                       type: string
 *                       example: null
 *                     otp:
 *                       type: string
 *                       example: null
 *                     demo_key:
 *                       type: string
 *                       example: null
 *                     country:
 *                       type: string
 *                       example: null
 *                     trips_count:
 *                       type: number
 *                       example: 0
 *                     otp_expires_at:
 *                       type: string
 *                       format: date-time
 *                       example: null
 *                     created_by:
 *                       type: number
 *                       example: null
 *                     admin_demo_key:
 *                       type: string
 *                       example: null
 *                     rating:
 *                       type: number
 *                       example: null
 *                     others_user_id:
 *                       type: number
 *                       example: null
 *                     id:
 *                       type: string
 *                       example: "66878c4fe706f2030e29e495"
 *                 message:
 *                   type: string
 *                   example: Success
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 */

/**
 * @swagger
 * /users/deleteUsers/{userId}:
 *   delete:
 *     summary: Delete a user
 *     description: Delete a user identified by their ID.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user to delete
 *     responses:
 *       "200":
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     msg:
 *                       type: string
 *                       example: data Deleted Successfully
 *                 message:
 *                   type: string
 *                   example: Success
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 */
