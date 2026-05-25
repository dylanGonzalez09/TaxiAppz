const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const adminValidation = require('../../validations/boilerplate/admin.validation');
const adminController = require('../../controllers/boilerplate/admin.controller');

const router = express.Router();

router.route('/create').post(auth('Admin'),validate(adminValidation.createAdmin), adminController.createAdmin);
router.route('/getAdmins').get(auth('Admin'),validate(adminValidation.getAdmins), adminController.getAdmins);
router.route('/getAdmin/:adminId').get(auth('Admin'),validate(adminValidation.getAdmin), adminController.getAdmin);
router.route('/getAdminByRole/:roleId').get(auth('Admin'),validate(adminValidation.getAdminByRole), adminController.getAdminByRole);
router.route('/updateAdmins/:adminId').patch(auth('Admin'),validate(adminValidation.updateAdmin), adminController.updatAdmin);
router.route('/deleteAdmins/:adminId').delete(auth('Admin'),validate(adminValidation.deleteAdmin), adminController.deleteAdmin);
router.route('/getDropDown/list/:clientId').get(adminController.getDropDownList);

module.exports = router;

/**
 * @swagger
 * /admin/create:
 *   post:
 *     summary: Create a new admin
 *     description: Create a new admin with the provided details.
 *     tags: [Admin]
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
 *         description: Admin created successfully
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
 * /admin/getAdmins:
 *   get:
 *     summary: Get all admins
 *     description: Retrieve a list of all admins.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: A list of admins
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
 * /admin/getAdmin/{adminId}:
 *   get:
 *     summary: Get a admin by ID
 *     description: Retrieve details of a admin by their ID.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: adminId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user to fetch
 *     responses:
 *       "200":
 *         description: Details of the admin
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
 * /admin/getAdminByRole/{roleId}:
 *   get:
 *     summary: Get admin by role ID
 *     description: Retrieve users belonging to a specific role.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the role to fetch admis for
 *     responses:
 *       "200":
 *         description: List of admin belonging to the role
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
 * /admin/updateAdmins/{adminId}:
 *   patch:
 *     summary: Update admin details
 *     description: Update specific details of a admin identified by their ID.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: adminId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the admin to update
 *       - in: body
 *         name: body
 *         required: true
 *         description: Updated admin details
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
 *         description: Admin updated successfully
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
 * /admin/deleteAdmin/{adminId}:
 *   delete:
 *     summary: Delete a admin
 *     description: Delete a admin identified by their ID.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: adminId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the admin to delete
 *     responses:
 *       "200":
 *         description: Admin deleted successfully
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
