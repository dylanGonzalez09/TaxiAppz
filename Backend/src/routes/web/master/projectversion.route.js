const express = require('express');
const auth = require('../../../middlewares/auth');
const validate = require('../../../middlewares/validate');
const versionValidation = require('../../../validations/web/master/projectVersion.validation');
const versionController = require('../../../controllers/web/master/projectversion.controller');

const router = express.Router();

router
  .route('/create')
  .post(auth('Version'), validate(versionValidation.createProjectVersion), versionController.createVersion);
router.route('/getVersionsWithPagination').get(auth('Version'), versionController.getVersions);
router
  .route('/getVersions/:versionId')
  .get(auth('Version'), validate(versionValidation.getProjectVersion), versionController.getVersion);
router.route('/getVersion/list').get(auth('Version'), versionController.getVersionWithOutPagination);
router
  .route('/updateVersion/:versionId')
  .patch(auth('Version'), validate(versionValidation.updateProjectVersion), versionController.updateVersion);
router
  .route('/deleteVersions/:versionId')
  .delete(auth('Version'), validate(versionValidation.deleteProjectVersion), versionController.deleteVersion);
router.get(
  '/getVersionCode/:versionCode',
  validate(versionValidation.getProjectVersionCode),
  versionController.getVersionCode,
);
router.patch(
  '/updateVersionStatus/:versionId',
  auth('Version'),
  validate(versionValidation.updateVersionStatus),
  versionController.updateVersionStatus,
);

module.exports = router;

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 * /version/create:
 *   post:
 *     summary: Create a new version
 *     description: Create a new version with specified details.
 *     tags: [Version]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               slug:
 *                 type: string
 *                 example: "project-v1"
 *               versionNumber:
 *                 type: string
 *                 example: "1.0.0"
 *               versionCode:
 *                 type: string
 *                 example: "v100"
 *               description:
 *                 type: string
 *                 example: "Initial release of the project"
 *               applicationType:
 *                 type: string
 *                 example: "web"
 *               status:
 *                 type: string
 *                 example: "active"
 *     responses:
 *       "200":
 *         description: Successfully created a new version
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
 *                       example: "project-v1"
 *                     versionNumber:
 *                       type: string
 *                       example: "1.0.0"
 *                     versionCode:
 *                       type: string
 *                       example: "v100"
 *                     description:
 *                       type: string
 *                       example: "Initial release of the project"
 *                     applicationType:
 *                       type: string
 *                       example: "web"
 *                     status:
 *                       type: string
 *                       example: "active"
 *                     id:
 *                       type: string
 *                       example: "6690d29bb7118593fc561589"
 *                 message:
 *                   type: string
 *                   example: "Success"
 *       "401":
 *         description: Unauthorized, authentication token is missing or invalid
 *       "400":
 *         description: Bad Request, invalid input data
 * /version/getVersions:
 *   get:
 *     summary: Get all versions
 *     description: Retrieve a list of all versions.
 *     tags: [Version]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: Successfully retrieved versions
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
 *                             example: "project-v1"
 *                           versionNumber:
 *                             type: string
 *                             example: "1.0.0"
 *                           versionCode:
 *                             type: string
 *                             example: "v100"
 *                           description:
 *                             type: string
 *                             example: "Initial release of the project"
 *                           applicationType:
 *                             type: string
 *                             example: "web"
 *                           status:
 *                             type: string
 *                             example: "active"
 *                           id:
 *                             type: string
 *                             example: "6690d049e533c407531fbc7b"
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
 *                       example: 1
 *                 message:
 *                   type: string
 *                   example: "Success"
 *       "401":
 *         description: Unauthorized, authentication token is missing or invalid
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 * /version/create:
 *   post:
 *     summary: Create a new version
 *     description: Create a new version with specified details.
 *     tags: [Version]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               slug:
 *                 type: string
 *                 example: "project-v1"
 *               versionNumber:
 *                 type: string
 *                 example: "1.0.0"
 *               versionCode:
 *                 type: string
 *                 example: "v100"
 *               description:
 *                 type: string
 *                 example: "Initial release of the project"
 *               applicationType:
 *                 type: string
 *                 example: "web"
 *               status:
 *                 type: string
 *                 example: "active"
 *     responses:
 *       "200":
 *         description: Successfully created a new version
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
 *                       example: "project-v1"
 *                     versionNumber:
 *                       type: string
 *                       example: "1.0.0"
 *                     versionCode:
 *                       type: string
 *                       example: "v100"
 *                     description:
 *                       type: string
 *                       example: "Initial release of the project"
 *                     applicationType:
 *                       type: string
 *                       example: "web"
 *                     status:
 *                       type: string
 *                       example: "active"
 *                     id:
 *                       type: string
 *                       example: "6690d29bb7118593fc561589"
 *                 message:
 *                   type: string
 *                   example: "Success"
 *       "401":
 *         description: Unauthorized, authentication token is missing or invalid
 *       "400":
 *         description: Bad Request, invalid input data
 * /version/getVersion/list:
 *   get:
 *     summary: Get all versions
 *     description: Retrieve a list of all versions.
 *     tags: [Version]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: Successfully retrieved versions
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
 *                       slug:
 *                         type: string
 *                         example: "project-v1"
 *                       versionNumber:
 *                         type: string
 *                         example: "1.0.0"
 *                       versionCode:
 *                         type: string
 *                         example: "v100"
 *                       description:
 *                         type: string
 *                         example: "Initial release of the project"
 *                       applicationType:
 *                         type: string
 *                         example: "web"
 *                       status:
 *                         type: string
 *                         example: "active"
 *                       id:
 *                         type: string
 *                         example: "6690d049e533c407531fbc7b"
 *                 message:
 *                   type: string
 *                   example: "Success"
 *       "401":
 *         description: Unauthorized, authentication token is missing or invalid
 * /version/getVersions/{id}:
 *   get:
 *     summary: Get version by ID
 *     description: Retrieve a version by its ID.
 *     tags: [Version]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       "200":
 *         description: Successfully retrieved the version
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
 *                       example: "project-v1"
 *                     versionNumber:
 *                       type: string
 *                       example: "1.0.0"
 *                     versionCode:
 *                       type: string
 *                       example: "v100"
 *                     description:
 *                       type: string
 *                       example: "Initial release of the project"
 *                     applicationType:
 *                       type: string
 *                       example: "web"
 *                     status:
 *                       type: string
 *                       example: "active"
 *                     id:
 *                       type: string
 *                       example: "6690d049e533c407531fbc7b"
 *                 message:
 *                   type: string
 *                   example: "Success"
 *       "401":
 *         description: Unauthorized, authentication token is missing or invalid
 *       "404":
 *         description: Version not found
 * /version/updateVersion/{id}:
 *   patch:
 *     summary: Update a version
 *     description: Update a version's details.
 *     tags: [Version]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               versionCode:
 *                 type: string
 *                 example: "100"
 *     responses:
 *       "200":
 *         description: Successfully updated the version
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
 *                       example: "project-v1"
 *                     versionNumber:
 *                       type: string
 *                       example: "1.0.0"
 *                     versionCode:
 *                       type: string
 *                       example: "100"
 *                     description:
 *                       type: string
 *                       example: "Initial release of the project"
 *                     applicationType:
 *                       type: string
 *                       example: "web"
 *                     status:
 *                       type: string
 *                       example: "active"
 *                     id:
 *                       type: string
 *                       example: "6690d049e533c407531fbc7b"
 *                 message:
 *                   type: string
 *                   example: "Success"
 *       "401":
 *         description: Unauthorized, authentication token is missing or invalid
 *       "404":
 *         description: Version not found
 * /version/deleteVersions/{id}:
 *   delete:
 *     summary: Delete a version
 *     description: Delete a version by its ID.
 *     tags: [Version]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       "200":
 *         description: Successfully deleted the version
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
 *                   example: "Success"
 *       "401":
 *         description: Unauthorized, authentication token is missing or invalid
 *       "404":
 *         description: Version not found
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 * /version/getVersionCode/{versionCode}:
 *   get:
 *     summary: Get version details by version code
 *     description: Retrieve version details including language, country, and configuration settings by version code.
 *     tags: [Version]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: versionCode
 *         required: true
 *         schema:
 *           type: string
 *         description: Version code to fetch details for.
 *     responses:
 *       "200":
 *         description: Successfully retrieved version details
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
 *                     language:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                             example: "test"
 *                           code:
 *                             type: string
 *                             example: "test"
 *                           status:
 *                             type: boolean
 *                             example: true
 *                           id:
 *                             type: string
 *                             example: "668e60a7acf6052dc1583527"
 *                       example:
 *                         - name: "test"
 *                           code: "test"
 *                           status: true
 *                           id: "668e60a7acf6052dc1583527"
 *                     country:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                             example: "United States"
 *                           dial_code:
 *                             type: string
 *                             example: "+1"
 *                           code:
 *                             type: string
 *                             example: "US"
 *                           currency_name:
 *                             type: string
 *                             example: "United States Dollar"
 *                           currency_code:
 *                             type: string
 *                             example: "USD"
 *                           currency_symbol:
 *                             type: string
 *                             example: "$"
 *                           status:
 *                             type: boolean
 *                             example: true
 *                           capital:
 *                             type: string
 *                             example: "Washington, D.C."
 *                           citizenship:
 *                             type: string
 *                             example: "American"
 *                           country_code:
 *                             type: string
 *                             example: "USA"
 *                           currency:
 *                             type: string
 *                             example: "Dollar"
 *                           currency_sub_unit:
 *                             type: string
 *                             example: "Cent"
 *                           full_name:
 *                             type: string
 *                             example: "United States of America"
 *                           iso_3166_3:
 *                             type: string
 *                             example: "USA"
 *                           region_code:
 *                             type: string
 *                             example: "019"
 *                           sub_region_code:
 *                             type: string
 *                             example: "021"
 *                           eea:
 *                             type: string
 *                             example: "No"
 *                           currency_decimals:
 *                             type: string
 *                             example: "2"
 *                           flag:
 *                             type: string
 *                             example: "🇺🇸"
 *                           flag_base_64:
 *                             type: string
 *                             example: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA..."
 *                           time_zone:
 *                             type: string
 *                             example: "EST"
 *                           gmt_offset:
 *                             type: string
 *                             example: "-5:00"
 *                           id:
 *                             type: string
 *                             example: "668e5da886c2f4091f4152ea"
 *                       example:
 *                         - name: "United States"
 *                           dial_code: "+1"
 *                           code: "US"
 *                           currency_name: "United States Dollar"
 *                           currency_code: "USD"
 *                           currency_symbol: "$"
 *                           status: true
 *                           capital: "Washington, D.C."
 *                           citizenship: "American"
 *                           country_code: "USA"
 *                           currency: "Dollar"
 *                           currency_sub_unit: "Cent"
 *                           full_name: "United States of America"
 *                           iso_3166_3: "USA"
 *                           region_code: "019"
 *                           sub_region_code: "021"
 *                           eea: "No"
 *                           currency_decimals: "2"
 *                           flag: "🇺🇸"
 *                           flag_base_64: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA..."
 *                           time_zone: "EST"
 *                           gmt_offset: "-5:00"
 *                           id: "668e5da886c2f4091f4152ea"
 *                     s3_bucket_name:
 *                       type: string
 *                       example: "test"
 *                     s3_bucket_key_id:
 *                       type: string
 *                       example: "null"
 *                     s3_bucket_secrete_access_key:
 *                       type: string
 *                       example: "null"
 *                     places_api_key:
 *                       type: string
 *                       example: "null"
 *                     distance_api_key:
 *                       type: string
 *                       example: "null"
 *                     geo_coder_api_key:
 *                       type: string
 *                       example: "null"
 *                     directional_api_key:
 *                       type: string
 *                       example: "null"
 *                     ios_places_api_key:
 *                       type: string
 *                       example: "null"
 *                     ios_distance_api_key:
 *                       type: string
 *                       example: "null"
 *                     ios_geo_coder_api_key:
 *                       type: string
 *                       example: "null"
 *                     ios_directional_api_key:
 *                       type: string
 *                       example: "null"
 *                     firebase_db_url:
 *                       type: string
 *                       example: "null"
 *                 message:
 *                   type: string
 *                   example: "Success"
 *       "401":
 *         description: Unauthorized, authentication token is missing or invalid
 *       "404":
 *         description: Version code not found
 */
