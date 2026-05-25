const express = require('express');
const auth = require('../../../middlewares/auth');
const validate = require('../../../middlewares/validate');
const vehicleValidation = require('../../../validations/web/master/vehicle.validation');
const vehicleController = require('../../../controllers/web/master/vehicle.controller');
const { vehicleUpload } = require('../../../middlewares/upload');

const router = express.Router();

// Routes with authentication and validation
router.post('/create', auth('Vehicle'), validate(vehicleValidation.createVehicle), vehicleUpload.fields([{ name: 'image', maxCount: 1 }, { name: 'highlightImage', maxCount: 1 }]), vehicleController.createVehicle);
router.get('/getVehiclesWithPagination', auth('Vehicle'), vehicleController.getVehicles);
router.get('/getVehicles/:vehicleId', auth('Vehicle'), validate(vehicleValidation.getVehicle), vehicleController.getVehicle);
router.get('/getVehicle/list', auth('Vehicle'), vehicleController.getVehiclesWithoutPagination);
router.patch('/updateVehicles/:vehicleId', auth('Vehicle'), validate(vehicleValidation.updateVehicle), vehicleUpload.fields([{ name: 'image', maxCount: 1 }, { name: 'highlightImage', maxCount: 1 }]), vehicleController.updateVehicle);
router.delete('/deleteVehicles/:vehicleId', auth('Vehicle'), validate(vehicleValidation.deleteVehicle), vehicleController.deleteVehicle);
router.patch('/updateVehicleStatus/:vehicleId', auth('Vehicle'), validate(vehicleValidation.updateVehicleStatus), vehicleController.updateVehicleStatus);
router.route('/getDropDown/list/:clientId').get(vehicleController.getDropDownList);

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
 *   /vehicle/create:
 *     post:
 *       summary: Create a new vehicle
 *       description: Create a new vehicle with specified details.
 *       tags: [Vehicle]
 *       security:
 *         - bearerAuth: []
 *       requestBody:
 *         required: true
 *         content:
 *           multipart/form-data:
 *             schema:
 *               type: object
 *               properties:
 *                 vehicleName:
 *                   type: string
 *                   example: "location"
 *                 capacity:
 *                   type: integer
 *                   example: 2
 *                 serviceType:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["service"]
 *                 categoryId:
 *                   type: string
 *                   example: "66b0aa1b7704dba62e5a5b17"
 *                 sortingorder:
 *                   type: integer
 *                   example: 2
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 image:
 *                   type: string
 *                   format: binary
 *                 highlightImage:
 *                   type: string
 *                   format: binary
 *       responses:
 *         "200":
 *           description: Successfully created a new vehicle
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
 *                       vehicleName:
 *                         type: string
 *                         example: "location"
 *                       image:
 *                         type: string
 *                         example: "/uploads/vehicles/8f4a505da650df41c852cb61b34f5cbb.png"
 *                       capacity:
 *                         type: integer
 *                         example: 2
 *                       serviceType:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: ["service"]
 *                       categoryId:
 *                         type: string
 *                         example: "66b0aa1b7704dba62e5a5b17"
 *                       sortingorder:
 *                         type: integer
 *                         example: 2
 *                       highlightImage:
 *                         type: string
 *                         example: "/uploads/vehicles/2ececc69c452cfc295d89ce2e839f68d.jpeg"
 *                       status:
 *                         type: boolean
 *                         example: true
 *                       id:
 *                         type: string
 *                         example: "66b2ed006aa34c6baaffa88c"
 *                   message:
 *                     type: string
 *                     example: "Vehicle created successfully"
 *         "401":
 *           description: Unauthorized, authentication token is missing or invalid
 *         "403":
 *           description: Forbidden, authenticated user does not have permission to create vehicles
 *         "400":
 *           description: Bad Request, invalid input data
 *
 *   /vehicle/getVehicles:
 *     get:
 *       summary: Get list of vehicles
 *       description: Retrieve a list of all vehicles.
 *       tags: [Vehicle]
 *       security:
 *         - bearerAuth: []
 *       responses:
 *         "200":
 *           description: Successfully retrieved list of vehicles
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
 *                         vehicleName:
 *                           type: string
 *                           example: "location"
 *                         capacity:
 *                           type: integer
 *                           example: 2
 *                         serviceType:
 *                           type: array
 *                           items:
 *                             type: string
 *                           example: ["service"]
 *                         categoryId:
 *                           type: string
 *                           example: "66b0aa1b7704dba62e5a5b17"
 *                         sortingorder:
 *                           type: integer
 *                           example: 2
 *                         status:
 *                           type: boolean
 *                           example: true
 *                         id:
 *                           type: string
 *                           example: "66b2ed006aa34c6baaffa88c"
 *         "401":
 *           description: Unauthorized, authentication token is missing or invalid
 *         "403":
 *           description: Forbidden, authenticated user does not have permission to view vehicles
 *
 *   /vehicle/getVehicles/{vehicleId}:
 *     get:
 *       summary: Get vehicle details
 *       description: Retrieve details of a specific vehicle.
 *       tags: [Vehicle]
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: path
 *           name: vehicleId
 *           required: true
 *           schema:
 *             type: string
 *           description: The vehicle ID
 *       responses:
 *         "200":
 *           description: Successfully retrieved vehicle details
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
 *                       vehicleName:
 *                         type: string
 *                         example: "location"
 *                       capacity:
 *                         type: integer
 *                         example: 2
 *                       serviceType:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: ["service"]
 *                       categoryId:
 *                         type: string
 *                         example: "66b0aa1b7704dba62e5a5b17"
 *                       sortingorder:
 *                         type: integer
 *                         example: 2
 *                       status:
 *                         type: boolean
 *                         example: true
 *                       id:
 *                         type: string
 *                         example: "66b2ed006aa34c6baaffa88c"
 *         "401":
 *           description: Unauthorized, authentication token is missing or invalid
 *         "403":
 *           description: Forbidden, authenticated user does not have permission to view vehicle details
 *         "404":
 *           description: Vehicle not found
 *
 *   /vehicle/getVehicle/list:
 *     get:
 *       summary: Get list of vehicles without pagination
 *       description: Retrieve a list of all vehicles without pagination.
 *       tags: [Vehicle]
 *       security:
 *         - bearerAuth: []
 *       responses:
 *         "200":
 *           description: Successfully retrieved list of vehicles
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
 *                         vehicleName:
 *                           type: string
 *                           example: "location"
 *                         capacity:
 *                           type: integer
 *                           example: 2
 *                         serviceType:
 *                           type: array
 *                           items:
 *                             type: string
 *                           example: ["service"]
 *                         categoryId:
 *                           type: string
 *                           example: "66b0aa1b7704dba62e5a5b17"
 *                         sortingorder:
 *                           type: integer
 *                           example: 2
 *                         status:
 *                           type: boolean
 *                           example: true
 *                         id:
 *                           type: string
 *                           example: "66b2ed006aa34c6baaffa88c"
 *         "401":
 *           description: Unauthorized, authentication token is missing or invalid
 *         "403":
 *           description: Forbidden, authenticated user does not have permission to view vehicles
 *
 *   /vehicle/updateVehicles/{vehicleId}:
 *     patch:
 *       summary: Update vehicle details
 *       description: Update the details of a specific vehicle.
 *       tags: [Vehicle]
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: path
 *           name: vehicleId
 *           required: true
 *           schema:
 *             type: string
 *           description: The vehicle ID
 *       requestBody:
 *         required: true
 *         content:
 *           multipart/form-data:
 *             schema:
 *               type: object
 *               properties:
 *                 vehicleName:
 *                   type: string
 *                   example: "new location"
 *                 capacity:
 *                   type: integer
 *                   example: 4
 *                 serviceType:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["new service"]
 *                 categoryId:
 *                   type: string
 *                   example: "66b0aa1b7704dba62e5a5b17"
 *                 sortingorder:
 *                   type: integer
 *                   example: 3
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 image:
 *                   type: string
 *                   format: binary
 *                 highlightImage:
 *                   type: string
 *                   format: binary
 *       responses:
 *         "200":
 *           description: Successfully updated vehicle details
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
 *                       vehicleName:
 *                         type: string
 *                         example: "new location"
 *                       image:
 *                         type: string
 *                         example: "/uploads/vehicles/updated_image.png"
 *                       capacity:
 *                         type: integer
 *                         example: 4
 *                       serviceType:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: ["new service"]
 *                       categoryId:
 *                         type: string
 *                         example: "66b0aa1b7704dba62e5a5b17"
 *                       sortingorder:
 *                         type: integer
 *                         example: 3
 *                       highlightImage:
 *                         type: string
 *                         example: "/uploads/vehicles/updated_highlight_image.jpeg"
 *                       status:
 *                         type: boolean
 *                         example: false
 *                       id:
 *                         type: string
 *                         example: "66b2ed006aa34c6baaffa88c"
 *                   message:
 *                     type: string
 *                     example: "Vehicle updated successfully"
 *         "401":
 *           description: Unauthorized, authentication token is missing or invalid
 *         "403":
 *           description: Forbidden, authenticated user does not have permission to update vehicle details
 *         "404":
 *           description: Vehicle not found
 *
 *   /vehicle/deleteVehicles/{vehicleId}:
 *     delete:
 *       summary: Delete a vehicle
 *       description: Delete a specific vehicle.
 *       tags: [Vehicle]
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: path
 *           name: vehicleId
 *           required: true
 *           schema:
 *             type: string
 *           description: The vehicle ID
 *       responses:
 *         "200":
 *           description: Successfully deleted the vehicle
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
 *                     example: "Vehicle deleted successfully"
 *         "401":
 *           description: Unauthorized, authentication token is missing or invalid
 *         "403":
 *           description: Forbidden, authenticated user does not have permission to delete vehicle
 *         "404":
 *           description: Vehicle not found
 */
