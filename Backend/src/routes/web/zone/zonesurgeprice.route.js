const express = require('express');
const auth = require('../../../middlewares/auth');
const validate = require('../../../middlewares/validate');
const zoneSurgePriceValidation = require('../../../validations/web/zone/zonesurgeprice.validation');

const zoneSurgePriceController = require('../../../controllers/web/zone/zonesurgeprice.controller');

const router = express.Router();

router.route('/create').post(auth('ZoneSurgePrice'), validate(zoneSurgePriceValidation.createZoneSurgePrice), zoneSurgePriceController.createZoneSurgePrice);
router.route('/getZoneSurgePrices').get(auth('ZoneSurgePrice'), validate(zoneSurgePriceValidation.getZoneSurgePrices), zoneSurgePriceController.getZoneSurgePrices);
router.route('/getZoneSurgePrice/:zoneSurgePriceId').get(auth('ZoneSurgePrice'), validate(zoneSurgePriceValidation.getZoneSurgePrice), zoneSurgePriceController.getZoneSurgePrice);
router.route('/updateZoneSurgePrice/:zoneSurgePriceId').patch(auth('ZoneSurgePrice'), validate(zoneSurgePriceValidation.updateZoneSurgePrice), zoneSurgePriceController.updateZoneSurgePrice);
router.route('/deleteZoneSurgePrice/:zoneSurgePriceId').delete(auth('ZoneSurgePrice'), validate(zoneSurgePriceValidation.deleteZoneSurgePrice), zoneSurgePriceController.deleteZoneSurgePrice);

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
 *   /zoneSurgePrice/create:
 *     post:
 *       summary: Create a new zone surge price
 *       description: Create a new zone surge price with specified details.
 *       tags: [ZoneSurgePrice]
 *       security:
 *         - bearerAuth: []
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 zonePriceId:
 *                   type: string
 *                   example: "60b0aa1b7704dba62e5a5b17"
 *                 surgePrice:
 *                   type: number
 *                   example: 1.5
 *                 startTime:
 *                   type: string
 *                   example: "18:00"
 *                 endTime:
 *                   type: string
 *                   example: "20:00"
 *                 availableDays:
 *                   type: string
 *                   example: "Mon,Tue,Wed"
 *                 status:
 *                   type: boolean
 *                   example: true
 *       responses:
 *         "200":
 *           description: Successfully created a new zone surge price
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
 *                         example: "60b2ed006aa34c6baaffa88d"
 *                       zonePriceId:
 *                         type: string
 *                         example: "60b0aa1b7704dba62e5a5b17"
 *                       surgePrice:
 *                         type: number
 *                         example: 1.5
 *                       status:
 *                         type: boolean
 *                         example: true
 *                   message:
 *                     type: string
 *                     example: "Zone surge price created successfully"
 *         "400":
 *           description: Bad Request, invalid input data
 *         "401":
 *           description: Unauthorized, authentication token is missing or invalid
 *         "403":
 *           description: Forbidden, authenticated user does not have permission to create surge prices
 *
 *   /zoneSurgePrice/getZoneSurgePrices:
 *     get:
 *       summary: Get list of zone surge prices
 *       description: Retrieve a list of all zone surge prices.
 *       tags: [ZoneSurgePrice]
 *       security:
 *         - bearerAuth: []
 *       responses:
 *         "200":
 *           description: Successfully retrieved list of zone surge prices
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
 *                         id:
 *                           type: string
 *                           example: "60b2ed006aa34c6baaffa88d"
 *                         zonePriceId:
 *                           type: string
 *                           example: "60b0aa1b7704dba62e5a5b17"
 *                         surgePrice:
 *                           type: number
 *                           example: 1.5
 *                         status:
 *                           type: boolean
 *                           example: true
 *         "401":
 *           description: Unauthorized, authentication token is missing or invalid
 *         "403":
 *           description: Forbidden, authenticated user does not have permission to view surge prices
 *
 *   /zoneSurgePrice/getZoneSurgePrice/{zoneSurgePriceId}:
 *     get:
 *       summary: Get zone surge price details
 *       description: Retrieve details of a specific zone surge price.
 *       tags: [ZoneSurgePrice]
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: path
 *           name: zoneSurgePriceId
 *           required: true
 *           schema:
 *             type: string
 *           description: The zone surge price ID
 *       responses:
 *         "200":
 *           description: Successfully retrieved zone surge price details
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
 *                         example: "60b2ed006aa34c6baaffa88d"
 *                       zonePriceId:
 *                         type: string
 *                         example: "60b0aa1b7704dba62e5a5b17"
 *                       surgePrice:
 *                         type: number
 *                         example: 1.5
 *                       status:
 *                         type: boolean
 *                         example: true
 *         "401":
 *           description: Unauthorized, authentication token is missing or invalid
 *         "403":
 *           description: Forbidden, authenticated user does not have permission to view surge price details
 *         "404":
 *           description: Zone surge price not found
 *
 *   /zoneSurgePrice/updateZoneSurgePrice/{zoneSurgePriceId}:
 *     patch:
 *       summary: Update zone surge price details
 *       description: Update the details of a specific zone surge price.
 *       tags: [ZoneSurgePrice]
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: path
 *           name: zoneSurgePriceId
 *           required: true
 *           schema:
 *             type: string
 *           description: The zone surge price ID
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 surgePrice:
 *                   type: number
 *                   example: 2.0
 *                 status:
 *                   type: boolean
 *                   example: false
 *       responses:
 *         "200":
 *           description: Successfully updated zone surge price details
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
 *                         example: "60b2ed006aa34c6baaffa88d"
 *                       surgePrice:
 *                         type: number
 *                         example: 2.0
 *                       status:
 *                         type: boolean
 *                         example: false
 *                   message:
 *                     type: string
 *                     example: "Zone surge price updated successfully"
 *         "401":
 *           description: Unauthorized, authentication token is missing or invalid
 *         "403":
 *           description: Forbidden, authenticated user does not have permission to update surge price details
 *         "404":
 *           description: Zone surge price not found
 *
 *   /zoneSurgePrice/deleteZoneSurgePrice/{zoneSurgePriceId}:
 *     delete:
 *       summary: Delete a zone surge price
 *       description: Delete a specific zone surge price.
 *       tags: [ZoneSurgePrice]
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: path
 *           name: zoneSurgePriceId
 *           required: true
 *           schema:
 *             type: string
 *           description: The zone surge price ID
 *       responses:
 *         "200":
 *           description: Successfully deleted the zone surge price
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
 *                     example: "Zone surge price deleted successfully"
 *         "401":
 *           description: Unauthorized, authentication token is missing or invalid
 *         "403":
 *           description: Forbidden, authenticated user does not have permission to delete surge price
 *         "404":
 *           description: Zone surge price not found
 */
