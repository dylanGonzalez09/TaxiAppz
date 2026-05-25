const express = require('express');
const auth = require('../../../middlewares/auth');
const validate = require('../../../middlewares/validate');

const zonePriceValidation = require('../../../validations/web/zone/zoneprice.validation');

const zonePriceController = require('../../../controllers/web/zone/zoneprice.controller');

const router = express.Router();

router.route('/create').post(auth('ZonePrice'), validate(zonePriceValidation.createZonePrice), zonePriceController.createZonePrice);
router.route('/getZonePrices').get(auth('ZonePrice'), validate(zonePriceValidation.getZonePrices), zonePriceController.getZonePrices);
router.route('/getZonePrice/:zonePriceId').get(auth('ZonePrice'), validate(zonePriceValidation.getZonePrice), zonePriceController.getZonePrice);
router.route('/updateZonePrice/:zonePriceId').patch(auth('ZonePrice'), validate(zonePriceValidation.updateZonePrice), zonePriceController.updateZonePrice);
router.route('/deleteZonePrice/:zonePriceId').delete(auth('ZonePrice'), validate(zonePriceValidation.deleteZonePrice), zonePriceController.deleteZonePrice);

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
 *   /zonePrice/create:
 *     post:
 *       summary: Create a new zone price
 *       description: Create a new zone price with specified details.
 *       tags: [ZonePrice]
 *       security:
 *         - bearerAuth: []
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 zoneId:
 *                   type: string
 *                   example: "60b0aa1b7704dba62e5a5b17"
 *                 typeId:
 *                   type: string
 *                   example: "60b0aa1b7704dba62e5a5b18"
 *                 ridenowBasePrice:
 *                   type: number
 *                   example: 50.00
 *                 ridenowPricePerDistance:
 *                   type: number
 *                   example: 10.00
 *                 ridenowWaitingCharge:
 *                   type: number
 *                   example: 5.00
 *                 ridenowCancellationFee:
 *                   type: number
 *                   example: 15.00
 *                 ridelaterBasePrice:
 *                   type: number
 *                   example: 40.00
 *                 ridelaterPricePerDistance:
 *                   type: number
 *                   example: 8.00
 *                 ridelaterWaitingCharge:
 *                   type: number
 *                   example: 4.00
 *                 ridelaterCancellationFee:
 *                   type: number
 *                   example: 10.00
 *                 status:
 *                   type: boolean
 *                   example: true
 *       responses:
 *         "200":
 *           description: Successfully created a new zone price
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
 *                       zoneId:
 *                         type: string
 *                         example: "60b0aa1b7704dba62e5a5b17"
 *                       ridenowBasePrice:
 *                         type: number
 *                         example: 50.00
 *                       status:
 *                         type: boolean
 *                         example: true
 *                   message:
 *                     type: string
 *                     example: "Zone price created successfully"
 *         "400":
 *           description: Bad Request, invalid input data
 *         "401":
 *           description: Unauthorized, authentication token is missing or invalid
 *         "403":
 *           description: Forbidden, authenticated user does not have permission to create zone prices
 *
 *   /zonePrice/getZonePrices:
 *     get:
 *       summary: Get list of zone prices
 *       description: Retrieve a list of all zone prices.
 *       tags: [ZonePrice]
 *       security:
 *         - bearerAuth: []
 *       responses:
 *         "200":
 *           description: Successfully retrieved list of zone prices
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
 *                         zoneId:
 *                           type: string
 *                           example: "60b0aa1b7704dba62e5a5b17"
 *                         ridenowBasePrice:
 *                           type: number
 *                           example: 50.00
 *                         status:
 *                           type: boolean
 *                           example: true
 *         "401":
 *           description: Unauthorized, authentication token is missing or invalid
 *         "403":
 *           description: Forbidden, authenticated user does not have permission to view zone prices
 *
 *   /zonePrice/getZonePrice/{zonePriceId}:
 *     get:
 *       summary: Get zone price details
 *       description: Retrieve details of a specific zone price.
 *       tags: [ZonePrice]
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: path
 *           name: zonePriceId
 *           required: true
 *           schema:
 *             type: string
 *           description: The zone price ID
 *       responses:
 *         "200":
 *           description: Successfully retrieved zone price details
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
 *                       zoneId:
 *                         type: string
 *                         example: "60b0aa1b7704dba62e5a5b17"
 *                       ridenowBasePrice:
 *                         type: number
 *                         example: 50.00
 *                       status:
 *                         type: boolean
 *                         example: true
 *         "401":
 *           description: Unauthorized, authentication token is missing or invalid
 *         "403":
 *           description: Forbidden, authenticated user does not have permission to view zone price details
 *         "404":
 *           description: Zone price not found
 *
 *   /zonePrice/updateZonePrice/{zonePriceId}:
 *     patch:
 *       summary: Update zone price details
 *       description: Update the details of a specific zone price.
 *       tags: [ZonePrice]
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: path
 *           name: zonePriceId
 *           required: true
 *           schema:
 *             type: string
 *           description: The zone price ID
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ridenowBasePrice:
 *                   type: number
 *                   example: 55.00
 *                 status:
 *                   type: boolean
 *                   example: false
 *       responses:
 *         "200":
 *           description: Successfully updated zone price details
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
 *                       ridenowBasePrice:
 *                         type: number
 *                         example: 55.00
 *                       status:
 *                         type: boolean
 *                         example: false
 *                   message:
 *                     type: string
 *                     example: "Zone price updated successfully"
 *         "401":
 *           description: Unauthorized, authentication token is missing or invalid
 *         "403":
 *           description: Forbidden, authenticated user does not have permission to update zone price details
 *         "404":
 *           description: Zone price not found
 *
 *   /zonePrice/deleteZonePrice/{zonePriceId}:
 *     delete:
 *       summary: Delete a zone price
 *       description: Delete a specific zone price.
 *       tags: [ZonePrice]
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: path
 *           name: zonePriceId
 *           required: true
 *           schema:
 *             type: string
 *           description: The zone price ID
 *       responses:
 *         "200":
 *           description: Successfully deleted the zone price
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
 *                     example: "Zone price deleted successfully"
 *         "401":
 *           description: Unauthorized, authentication token is missing or invalid
 *         "403":
 *           description: Forbidden, authenticated user does not have permission to delete zone price
 *         "404":
 *           description: Zone price not found
 */


