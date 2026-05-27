const express = require('express');
const auth = require('../../../middlewares/auth');
const validate = require('../../../middlewares/validate');
const zoneValidation = require('../../../validations/web/zone/zone.validation');
const zoneController = require('../../../controllers/web/zone/zone.controller');

const router = express.Router();

router.route('/create').post(auth('Zone'), validate(zoneValidation.createZone), zoneController.createZone);
router.route('/createZone').post(zoneController.zoneCreate);
router.route('/getZones').get(auth('Zone'), validate(zoneValidation.getZones), zoneController.getZones);
router.route('/getZone').get(auth('Zone'), zoneController.getZonePagination);
router.route('/getActiveZone').get(auth('Zone'), zoneController.getActiveZonePagination);
router.route('/getZone/list').get(auth('Zone'), zoneController.getZoneWithOutPagination);
router.route('/getPrimaryZone/list').get(auth('Zone'), zoneController.getPrimaryZone);
router.route('/getSecondaryZone/list').get(auth('Zone'), zoneController.getSecondaryZone);
router.route('/getZones/:zoneId').get(auth('Zone'), validate(zoneValidation.getZone), zoneController.getZone);
router.route('/getZoneVehicle/:zoneId').get(auth('Zone'), validate(zoneValidation.getZone), zoneController.getZoneVehicle);

router.route('/updateZones/:zoneId').patch(zoneController.updateZone);
router.route('/deleteZones/:zoneId').delete(auth('Zone'), validate(zoneValidation.deleteZone), zoneController.deleteZone);
router.patch(
  '/updateZoneStatus/:zoneId',
  auth('Zone'),
  validate(zoneValidation.updateZoneStatus),
  zoneController.updateZoneStatus,
);
router.route('/getDropDown/list/:clientId/:zoneId').get(zoneController.getDropDownList);
router.route('/primaryZoneMenu/list').get(auth('Zone'), zoneController.getPrimaryZoneMenu);
router.route('/getDropDown/list/:clientId').get(zoneController.getDropDownList);
router.route('/getZoneListByZoneId/:zoneId').get(zoneController.zoneListByZoneId);

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
 *   /zone/create:
 *     post:
 *       summary: Create a new zone
 *       description: Create a new zone with specified details.
 *       tags: [Zone]
 *       security:
 *         - bearerAuth: []
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 zoneName:
 *                   type: string
 *                   example: "Central Zone"
 *                 primaryZoneId:
 *                   type: integer
 *                   example: 1
 *                 country:
 *                   type: string
 *                   example: "60b0aa1b7704dba62e5a5b17"
 *                 adminCommissionType:
 *                   type: string
 *                   example: "PERCENTAGE"
 *                 adminCommission:
 *                   type: string
 *                   example: "10"
 *                 mapZone:
 *                   type: object
 *                 paymentTypes:
 *                   type: string
 *                   example: "ONLINE"
 *                 unit:
 *                   type: string
 *                   example: "KM"
 *                 nonServiceZone:
 *                   type: string
 *                   example: "FALSE"
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 createdBy:
 *                   type: string
 *                   example: "60b0aa1b7704dba62e5a5b17"
 *       responses:
 *         "200":
 *           description: Successfully created a new zone
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
 *                         example: "60b2ed006aa34c6baaffa88c"
 *                       zoneName:
 *                         type: string
 *                         example: "Central Zone"
 *                       country:
 *                         type: string
 *                         example: "60b0aa1b7704dba62e5a5b17"
 *                       status:
 *                         type: boolean
 *                         example: true
 *                   message:
 *                     type: string
 *                     example: "Zone created successfully"
 *         "400":
 *           description: Bad Request, invalid input data
 *         "401":
 *           description: Unauthorized, authentication token is missing or invalid
 *         "403":
 *           description: Forbidden, authenticated user does not have permission to create zones
 *
 *   /zone/getZones:
 *     get:
 *       summary: Get list of zones
 *       description: Retrieve a list of all zones.
 *       tags: [Zone]
 *       security:
 *         - bearerAuth: []
 *       responses:
 *         "200":
 *           description: Successfully retrieved list of zones
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
 *                         zoneName:
 *                           type: string
 *                           example: "Central Zone"
 *                         primaryZoneId:
 *                           type: integer
 *                           example: 1
 *                         country:
 *                           type: string
 *                           example: "60b0aa1b7704dba62e5a5b17"
 *                         adminCommissionType:
 *                           type: string
 *                           example: "PERCENTAGE"
 *                         status:
 *                           type: boolean
 *                           example: true
 *                         id:
 *                           type: string
 *                           example: "60b2ed006aa34c6baaffa88c"
 *         "401":
 *           description: Unauthorized, authentication token is missing or invalid
 *         "403":
 *           description: Forbidden, authenticated user does not have permission to view zones
 *
 *   /zone/getZones/{zoneId}:
 *     get:
 *       summary: Get zone details
 *       description: Retrieve details of a specific zone.
 *       tags: [Zone]
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: path
 *           name: zoneId
 *           required: true
 *           schema:
 *             type: string
 *           description: The zone ID
 *       responses:
 *         "200":
 *           description: Successfully retrieved zone details
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
 *                       zoneName:
 *                         type: string
 *                         example: "Central Zone"
 *                       country:
 *                         type: string
 *                         example: "60b0aa1b7704dba62e5a5b17"
 *                       status:
 *                         type: boolean
 *                         example: true
 *         "401":
 *           description: Unauthorized, authentication token is missing or invalid
 *         "403":
 *           description: Forbidden, authenticated user does not have permission to view zone details
 *         "404":
 *           description: Zone not found
 *
 *   /zone/updateZones/{zoneId}:
 *     patch:
 *       summary: Update zone details
 *       description: Update the details of a specific zone.
 *       tags: [Zone]
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: path
 *           name: zoneId
 *           required: true
 *           schema:
 *             type: string
 *           description: The zone ID
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 zoneName:
 *                   type: string
 *                   example: "Updated Zone Name"
 *                 adminCommission:
 *                   type: string
 *                   example: "15"
 *                 status:
 *                   type: boolean
 *                   example: false
 *       responses:
 *         "200":
 *           description: Successfully updated zone details
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
 *                       zoneName:
 *                         type: string
 *                         example: "Updated Zone Name"
 *                       status:
 *                         type: boolean
 *                         example: false
 *                   message:
 *                     type: string
 *                     example: "Zone updated successfully"
 *         "401":
 *           description: Unauthorized, authentication token is missing or invalid
 *         "403":
 *           description: Forbidden, authenticated user does not have permission to update zone details
 *         "404":
 *           description: Zone not found
 *
 *   /zone/deleteZones/{zoneId}:
 *     delete:
 *       summary: Delete a zone
 *       description: Delete a specific zone.
 *       tags: [Zone]
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: path
 *           name: zoneId
 *           required: true
 *           schema:
 *             type: string
 *           description: The zone ID
 *       responses:
 *         "200":
 *           description: Successfully deleted the zone
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
 *                     example: "Zone deleted successfully"
 *         "401":
 *           description: Unauthorized, authentication token is missing or invalid
 *         "403":
 *           description: Forbidden, authenticated user does not have permission to delete zone
 *         "404":
 *           description: Zone not found
 */
