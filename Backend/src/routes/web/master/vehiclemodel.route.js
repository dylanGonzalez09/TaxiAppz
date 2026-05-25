const express = require('express');
const auth = require('../../../middlewares/auth');
const validate = require('../../../middlewares/validate');
const vehicleModelValidation = require('../../../validations/web/master/vehiclemodel.validation');
const vehicleModelController = require('../../../controllers/web/master/vehiclemodel.controller');
const { vehicleModelUpload } = require('../../../middlewares/upload');

const router = express.Router();

// Routes with authentication and validation
router.post('/create', auth('VehicleModels'), validate(vehicleModelValidation.createVehicleModel), vehicleModelUpload.single('image'), vehicleModelController.createVehicleModel);
router.get('/getVehicleModelsWithPagination/:id', auth('VehicleModels'), vehicleModelController.getVehicleModels);
router.get('/getVehicleModels/:vehicleModelId', auth('VehicleModels'), validate(vehicleModelValidation.getVehicleModel), vehicleModelController.getVehicleModel);
router.get('/getVehicleModel/:vehicleId', auth('VehicleModels'),validate(vehicleModelValidation.getVehicleModelbyVehicle), vehicleModelController.getVehicleModelByVehicle);
router.get('/getAllVehicleModel/list', auth('VehicleModels'), vehicleModelController.getVehicleModelWithoutPagination);
router.patch('/updateVehicleModels/:vehicleModelId', auth('VehicleModels'), validate(vehicleModelValidation.updateVehicleModel), vehicleModelUpload.single('image'), vehicleModelController.updateVehicleModel);
router.delete('/deleteVehicleModels/:vehicleModelId', auth('VehicleModels'), validate(vehicleModelValidation.deleteVehicleModel), vehicleModelController.deleteVehicleModel);
router.patch('/updateVehicleModelStatus/:vehicleModelId', auth('VehicleModels'), validate(vehicleModelValidation.updateVehicleStatus), vehicleModelController.updateVehicleModelStatus);
router.route('/getDropDown/list/:clientId').get(vehicleModelController.getDropDownList);

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
 *   /v1/vehicleModel/create:
 *     post:
 *       summary: Create a new vehicle model
 *       description: Create a new vehicle model with specified details.
 *       tags: [Vehicle Model]
 *       security:
 *         - bearerAuth: []
 *       requestBody:
 *         required: true
 *         content:
 *           multipart/form-data:
 *             schema:
 *               type: object
 *               properties:
 *                 modelname:
 *                   type: string
 *                   example: "location"
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 description:
 *                   type: string
 *                   example: "test"
 *                 vehicleId:
 *                   type: string
 *                   example: "66b2ef6bf96153bcd8272fcb"
 *                 image:
 *                   type: string
 *                   format: binary
 *       responses:
 *         "200":
 *           description: Successfully created a new vehicle model
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
 *                       modelname:
 *                         type: string
 *                         example: "location"
 *                       description:
 *                         type: string
 *                         example: "test"
 *                       image:
 *                         type: string
 *                         example: "e1ea6d7c51a7565c8002252a02098a7d.png"
 *                       vehicleId:
 *                         type: string
 *                         example: "66b2ef6bf96153bcd8272fcb"
 *                       status:
 *                         type: boolean
 *                         example: true
 *                       id:
 *                         type: string
 *                         example: "66b2f8f84b9b4216616d988c"
 *                   message:
 *                     type: string
 *                     example: "Vehicle model created successfully"
 *         "401":
 *           description: Unauthorized, authentication token is missing or invalid
 *         "403":
 *           description: Forbidden, authenticated user does not have permission to create vehicle models
 *         "400":
 *           description: Bad Request, invalid input data
 *
 *   /v1/vehicleModel/getVehicleModels:
 *     get:
 *       summary: Get list of vehicle models
 *       description: Retrieve a list of all vehicle models.
 *       tags: [Vehicle Model]
 *       security:
 *         - bearerAuth: []
 *       responses:
 *         "200":
 *           description: Successfully retrieved list of vehicle models
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
 *                         modelname:
 *                           type: string
 *                           example: "location"
 *                         description:
 *                           type: string
 *                           example: "test"
 *                         vehicleId:
 *                           type: string
 *                           example: "66b2ef6bf96153bcd8272fcb"
 *                         status:
 *                           type: boolean
 *                           example: true
 *                         id:
 *                           type: string
 *                           example: "66b2f8f84b9b4216616d988c"
 *         "401":
 *           description: Unauthorized, authentication token is missing or invalid
 *         "403":
 *           description: Forbidden, authenticated user does not have permission to view vehicle models
 *
 *   /v1/vehicleModel/getVehicleModels/{vehicleModelId}:
 *     get:
 *       summary: Get vehicle model details
 *       description: Retrieve details of a specific vehicle model.
 *       tags: [Vehicle Model]
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: path
 *           name: vehicleModelId
 *           required: true
 *           schema:
 *             type: string
 *           description: The vehicle model ID
 *       responses:
 *         "200":
 *           description: Successfully retrieved vehicle model details
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
 *                       modelname:
 *                         type: string
 *                         example: "location"
 *                       description:
 *                         type: string
 *                         example: "test"
 *                       vehicleId:
 *                         type: string
 *                         example: "66b2ef6bf96153bcd8272fcb"
 *                       status:
 *                         type: boolean
 *                         example: true
 *                       id:
 *                         type: string
 *                         example: "66b2f8f84b9b4216616d988c"
 *         "401":
 *           description: Unauthorized, authentication token is missing or invalid
 *         "403":
 *           description: Forbidden, authenticated user does not have permission to view vehicle model details
 *         "404":
 *           description: Vehicle model not found
 *
 *   /v1/vehicleModel/getVehicleModel/list:
 *     get:
 *       summary: Get list of vehicle models without pagination
 *       description: Retrieve a list of all vehicle models without pagination.
 *       tags: [Vehicle Model]
 *       security:
 *         - bearerAuth: []
 *       responses:
 *         "200":
 *           description: Successfully retrieved list of vehicle models
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
 *                         modelname:
 *                           type: string
 *                           example: "location"
 *                         description:
 *                           type: string
 *                           example: "test"
 *                         vehicleId:
 *                           type: string
 *                           example: "66b2ef6bf96153bcd8272fcb"
 *                         status:
 *                           type: boolean
 *                           example: true
 *                         id:
 *                           type: string
 *                           example: "66b2f8f84b9b4216616d988c"
 *         "401":
 *           description: Unauthorized, authentication token is missing or invalid
 *         "403":
 *           description: Forbidden, authenticated user does not have permission to view vehicle models
 *
 *   /v1/vehicleModel/updateVehicleModels/{vehicleModelId}:
 *     patch:
 *       summary: Update vehicle model details
 *       description: Update the details of a specific vehicle model.
 *       tags: [Vehicle Model]
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: path
 *           name: vehicleModelId
 *           required: true
 *           schema:
 *             type: string
 *           description: The vehicle model ID
 *       requestBody:
 *         required: true
 *         content:
 *           multipart/form-data:
 *             schema:
 *               type: object
 *               properties:
 *                 modelname:
 *                   type: string
 *                   example: "new location"
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 description:
 *                   type: string
 *                   example: "new test"
 *                 vehicleId:
 *                   type: string
 *                   example: "66b2ef6bf96153bcd8272fcb"
 *                 image:
 *                   type: string
 *                   format: binary
 *       responses:
 *         "200":
 *           description: Successfully updated vehicle model details
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
 *                       modelname:
 *                         type: string
 *                         example: "new location"
 *                       description:
 *                         type: string
 *                         example: "new test"
 *                       image:
 *                         type: string
 *                         example: "updated_image.png"
 *                       vehicleId:
 *                         type: string
 *                         example: "66b2ef6bf96153bcd8272fcb"
 *                       status:
 *                         type: boolean
 *                         example: false
 *                       id:
 *                         type: string
 *                         example: "66b2f8f84b9b4216616d988c"
 *                   message:
 *                     type: string
 *                     example: "Vehicle model updated successfully"
 *         "401":
 *           description: Unauthorized, authentication token is missing or invalid
 *         "403":
 *           description: Forbidden, authenticated user does not have permission to update vehicle model details
 *         "404":
 *           description: Vehicle model not found
 *
 *   /v1/vehicleModel/deleteVehicleModels/{vehicleModelId}:
 *     delete:
 *       summary: Delete a vehicle model
 *       description: Delete a specific vehicle model.
 *       tags: [Vehicle Model]
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: path
 *           name: vehicleModelId
 *           required: true
 *           schema:
 *             type: string
 *           description: The vehicle model ID
 *       responses:
 *         "200":
 *           description: Successfully deleted the vehicle model
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
 *                     example: "Vehicle model deleted successfully"
 *         "401":
 *           description: Unauthorized, authentication token is missing or invalid
 *         "403":
 *           description: Forbidden, authenticated user does not have permission to delete vehicle model
 *         "404":
 *           description: Vehicle model not found
 */
