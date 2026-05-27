const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const settingValidation = require('../../validations/boilerplate/setting.validation');
const settingController = require('../../controllers/boilerplate/settings.controller');
const { settingUpload } = require('../../middlewares/upload');

const router = express.Router();

router.route('/create').post(auth('Setting'), validate(settingValidation.createSetting), settingController.createSettings);
router.route('/getSettings').get(auth('Setting'), validate(settingValidation.getSettings), settingController.getSettings);
router
  .route('/getSetting/:settingId')
  .get(auth('Setting'), validate(settingValidation.getSetting), settingController.getSetting);
router.route('/getSettings/list').get(settingController.getSettingWithOutPagination);
router
  .route('/updateSetting/:settingId')
  .patch(auth('Setting'), validate(settingValidation.updateSetting), settingController.updateSetting);
router
  .route('/deleteSetting/:settingId')
  .delete(auth('Setting'), validate(settingValidation.deleteSetting), settingController.deleteSetting);
router.route('/getSettingsApi/list').get(auth('Setting'), settingController.getSettingApi);
router.route('/getSettings/:settingId').get(auth('Setting'), settingController.getSettingsById);
router.route('/getDefaultLanguage').get(settingController.getDefaultLanguage);

router.route('/bulkInsert').post(
  auth('Setting'),
  settingUpload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'notificationSound', maxCount: 1 },
    { name: 'tripSound', maxCount: 1 },
  ]),
  settingController.bulkInsertSettings,
);

router.route('/bulkUpdate').patch(
  auth('Setting'),
  settingUpload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'notificationSound', maxCount: 1 },
    { name: 'tripSound', maxCount: 1 },
  ]),
  settingController.bulkUpdateSettings,
);

router.route('/getmoduleSettings').get(auth('Setting'),settingController.getModuleSettings)

module.exports = router;

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 * /setting/create:
 *   post:
 *     summary: Create a new setting
 *     description: Create a new setting with specified details.
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "s3_bucket_name"
 *               value:
 *                 type: string
 *                 example: "null"
 *               status:
 *                 type: boolean
 *                 example: true
 *               slug:
 *                 type: string
 *                 example: "key"
 *               type:
 *                 type: string
 *                 example: "Text"
 *     responses:
 *       "200":
 *         description: Successfully created a new setting
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
 *                     name:
 *                       type: string
 *                       example: "s3_bucket_name"
 *                     value:
 *                       type: string
 *                       example: "null"
 *                     status:
 *                       type: boolean
 *                       example: true
 *                     slug:
 *                       type: string
 *                       example: "key"
 *                     type:
 *                       type: string
 *                       example: "Text"
 *                     id:
 *                       type: string
 *                       example: "66975b416fa1f1557c9ee554"
 *                 message:
 *                   type: string
 *                   example: Success
 *       "401":
 *         description: Unauthorized, authentication token is missing or invalid
 *       "403":
 *         description: Forbidden, authenticated user does not have permission to create settings
 *       "400":
 *         description: Bad Request, invalid input data
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 * /setting/getSettings:
 *   get:
 *     summary: Retrieve settings
 *     description: Get a list of settings.
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: Successfully retrieved settings
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
 *                           name:
 *                             type: string
 *                             example: "s3_bucket_name"
 *                           value:
 *                             type: string
 *                             example: "null"
 *                           status:
 *                             type: boolean
 *                             example: true
 *                           slug:
 *                             type: string
 *                             example: "key"
 *                           type:
 *                             type: string
 *                             example: "Text"
 *                           id:
 *                             type: string
 *                             example: "6697591b9d16f528f4b9526b"
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     totalPages:
 *                       type: integer
 *                       example: 1
 *                     totalResults:
 *                       type: integer
 *                       example: 1
 *                 message:
 *                   type: string
 *                   example: Success
 *       "401":
 *         description: Unauthorized, authentication token is missing or invalid
 *       "403":
 *         description: Forbidden, authenticated user does not have permission to view settings
 *       "400":
 *         description: Bad Request, invalid input data
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 * /setting/getSettings/list:
 *   get:
 *     summary: Retrieve settings list
 *     description: Get a list of all settings.
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: Successfully retrieved settings list
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
 *                         example: "s3_bucket_name"
 *                       value:
 *                         type: string
 *                         example: "null"
 *                       status:
 *                         type: boolean
 *                         example: true
 *                       slug:
 *                         type: string
 *                         example: "key"
 *                       type:
 *                         type: string
 *                         example: "Text"
 *                       id:
 *                         type: string
 *                         example: "6697591b9d16f528f4b9526b"
 *                 message:
 *                   type: string
 *                   example: Success
 *       "401":
 *         description: Unauthorized, authentication token is missing or invalid
 *       "403":
 *         description: Forbidden, authenticated user does not have permission to view settings
 *       "400":
 *         description: Bad Request, invalid input data
 *
 * /setting/getSetting/{id}:
 *   get:
 *     summary: Retrieve a specific setting
 *     description: Get a specific setting by ID.
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The setting ID
 *     responses:
 *       "200":
 *         description: Successfully retrieved the setting
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
 *                     name:
 *                       type: string
 *                       example: "s3_bucket_name"
 *                     value:
 *                       type: string
 *                       example: "null"
 *                     status:
 *                       type: boolean
 *                       example: true
 *                     slug:
 *                       type: string
 *                       example: "key"
 *                     type:
 *                       type: string
 *                       example: "Text"
 *                     id:
 *                       type: string
 *                       example: "6697591b9d16f528f4b9526b"
 *                 message:
 *                   type: string
 *                   example: Success
 *       "401":
 *         description: Unauthorized, authentication token is missing or invalid
 *       "403":
 *         description: Forbidden, authenticated user does not have permission to view this setting
 *       "400":
 *         description: Bad Request, invalid input data
 *
 * /setting/updateSetting/{id}:
 *   patch:
 *     summary: Update a specific setting
 *     description: Update a specific setting by ID.
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The setting ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "s3_bucket_name"
 *               value:
 *                 type: string
 *                 example: "test"
 *               status:
 *                 type: boolean
 *                 example: true
 *               slug:
 *                 type: string
 *                 example: "key"
 *               type:
 *                 type: string
 *                 example: "Text"
 *     responses:
 *       "200":
 *         description: Successfully updated the setting
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
 *                     name:
 *                       type: string
 *                       example: "s3_bucket_name"
 *                     value:
 *                       type: string
 *                       example: "test"
 *                     status:
 *                       type: boolean
 *                       example: true
 *                     slug:
 *                       type: string
 *                       example: "key"
 *                     type:
 *                       type: string
 *                       example: "Text"
 *                     id:
 *                       type: string
 *                       example: "6697591b9d16f528f4b9526b"
 *                 message:
 *                   type: string
 *                   example: Success
 *       "401":
 *         description: Unauthorized, authentication token is missing or invalid
 *       "403":
 *         description: Forbidden, authenticated user does not have permission to update this setting
 *       "400":
 *         description: Bad Request, invalid input data
 *
 * /setting/deleteSetting/{id}:
 *   delete:
 *     summary: Delete a specific setting
 *     description: Delete a specific setting by ID.
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The setting ID
 *     responses:
 *       "200":
 *         description: Successfully deleted the setting
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
 *                     status:
 *                       type: string
 *                       example: "success"
 *                     msg:
 *                       type: string
 *                       example: "data Deleted Successfully"
 *                 message:
 *                   type: string
 *                   example: Success
 *       "401":
 *         description: Unauthorized, authentication token is missing or invalid
 *       "403":
 *         description: Forbidden, authenticated user does not have permission to delete this setting
 *       "400":
 *         description: Bad Request, invalid input data
 */
