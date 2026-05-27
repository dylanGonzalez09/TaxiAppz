const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const dispatcherValidation = require('../../validations/boilerplate/dispatcher.validation');
const dispatcherController = require('../../controllers/boilerplate/dispatcher.controller');
const { dispatcherUpload } = require('../../middlewares/upload');

const router = express.Router();

// Routes with authentication and validation
router
  .route('/create')
  .post(
    auth('Dispatcher'),
    validate(dispatcherValidation.createDispatcher),
    dispatcherUpload.single('image'),
    dispatcherController.createDispatcher,
  );
router
  .route('/update/:dispatcherId')
  .patch(
    auth('Dispatcher'),
    validate(dispatcherValidation.updateDispatcher),
    dispatcherUpload.single('image'),
    dispatcherController.updateDispatcher,
  );
router
  .route('/getDispatchers')
  .get(auth('Dispatcher'), validate(dispatcherValidation.getDispatchers), dispatcherController.getDispatchers);
router
  .route('/getDispatchers/:dispatcherId')
  .get(auth('Dispatcher'), validate(dispatcherValidation.getDispatcher), dispatcherController.getDispatcher);
router
  .route('/delete/:dispatcherId')
  .delete(auth('Dispatcher'), validate(dispatcherValidation.deleteDispatcher), dispatcherController.deleteDispatcher);
router
  .route('/updateActiveStatus/:id')
  .patch(auth('Dispatcher'), validate(dispatcherValidation.updateActiveStatus), dispatcherController.updateActiveStatus);
router.route('/getDispatcher/list').get(auth('Dispatcher'), dispatcherController.getDispatcherPagination);
router.route('/getDropDown/list/:clientId').get(dispatcherController.getDropDownList);

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
 *   /admin/create:
 *     post:
 *       summary: Create a new dispatcher
 *       description: Create a new dispatcher with specified details.
 *       tags: [Dispatcher]
 *       security:
 *         - bearerAuth: []
 *       requestBody:
 *         required: true
 *         content:
 *           multipart/form-data:
 *             schema:
 *               type: object
 *               properties:
 *                 firstName:
 *                   type: string
 *                   example: "John"
 *                 lastName:
 *                   type: string
 *                   example: "Doe"
 *                 email:
 *                   type: string
 *                   example: "john.doe@example.com"
 *                 phoneNumber:
 *                   type: string
 *                   example: "1234567890"
 *                 roleIds:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["roleId1", "roleId2"]
 *                 gender:
 *                   type: string
 *                   example: "Male"
 *                 language:
 *                   type: string
 *                   example: "English"
 *                 country:
 *                   type: string
 *                   example: "USA"
 *                 address:
 *                   type: string
 *                   example: "123 Main St"
 *                 active:
 *                   type: boolean
 *                   example: true
 *                 profilePic:
 *                   type: string
 *                   format: binary
 *       responses:
 *         "200":
 *           description: Successfully created a new dispatcher
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
 *                       userId:
 *                         type: string
 *                       city:
 *                         type: string
 *                       state:
 *                         type: string
 *                       pincode:
 *                         type: string
 *                       type:
 *                         type: string
 *                       carModel:
 *                         type: string
 *                       serviceLocation:
 *                         type: string
 *                       notes:
 *                         type: string
 *                       serviceCategory:
 *                         type: string
 *                   message:
 *                     type: string
 *                     example: "Dispatcher created successfully"
 *         "401":
 *           description: Unauthorized, authentication token is missing or invalid
 *         "403":
 *           description: Forbidden, authenticated user does not have permission to create dispatchers
 *         "400":
 *           description: Bad Request, invalid input data
 *
 *   /admin/getDispatchers:
 *     get:
 *       summary: Get list of dispatchers
 *       description: Retrieve a list of all dispatchers.
 *       tags: [Dispatcher]
 *       security:
 *         - bearerAuth: []
 *       responses:
 *         "200":
 *           description: Successfully retrieved list of dispatchers
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
 *                         userId:
 *                           type: string
 *                           example: "userId1"
 *                         firstName:
 *                           type: string
 *                           example: "John"
 *                         lastName:
 *                           type: string
 *                           example: "Doe"
 *                         email:
 *                           type: string
 *                           example: "john.doe@example.com"
 *                         phoneNumber:
 *                           type: string
 *                           example: "1234567890"
 *                         roleIds:
 *                           type: array
 *                           items:
 *                             type: string
 *                           example: ["roleId1", "roleId2"]
 *                         gender:
 *                           type: string
 *                           example: "Male"
 *                         language:
 *                           type: string
 *                           example: "English"
 *                         country:
 *                           type: string
 *                           example: "USA"
 *                         address:
 *                           type: string
 *                           example: "123 Main St"
 *                         active:
 *                           type: boolean
 *                           example: true
 *         "401":
 *           description: Unauthorized, authentication token is missing or invalid
 *         "403":
 *           description: Forbidden, authenticated user does not have permission to view dispatchers
 *
 *   /admin/getDispatchers/{dispatcherId}:
 *     get:
 *       summary: Get dispatcher details
 *       description: Retrieve details of a specific dispatcher.
 *       tags: [Dispatcher]
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: path
 *           name: dispatcherId
 *           required: true
 *           schema:
 *             type: string
 *           description: The dispatcher ID
 *       responses:
 *         "200":
 *           description: Successfully retrieved dispatcher details
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
 *                       userId:
 *                         type: string
 *                       firstName:
 *                         type: string
 *                         example: "John"
 *                       lastName:
 *                         type: string
 *                         example: "Doe"
 *                       email:
 *                         type: string
 *                         example: "john.doe@example.com"
 *                       phoneNumber:
 *                         type: string
 *                         example: "1234567890"
 *                       roleIds:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: ["roleId1", "roleId2"]
 *                       gender:
 *                         type: string
 *                         example: "Male"
 *                       language:
 *                         type: string
 *                         example: "English"
 *                       country:
 *                         type: string
 *                         example: "USA"
 *                       address:
 *                         type: string
 *                         example: "123 Main St"
 *                       active:
 *                         type: boolean
 *                         example: true
 *         "401":
 *           description: Unauthorized, authentication token is missing or invalid
 *         "403":
 *           description: Forbidden, authenticated user does not have permission to view dispatcher details
 *         "404":
 *           description: Dispatcher not found
 *
 *   /admin/getDispatcher/list:
 *     get:
 *       summary: Get list of dispatchers without pagination
 *       description: Retrieve a list of all dispatchers without pagination.
 *       tags: [Dispatcher]
 *       security:
 *         - bearerAuth: []
 *       responses:
 *         "200":
 *           description: Successfully retrieved list of dispatchers
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
 *                         userId:
 *                           type: string
 *                           example: "userId1"
 *                         firstName:
 *                           type: string
 *                           example: "John"
 *                         lastName:
 *                           type: string
 *                           example: "Doe"
 *                         email:
 *                           type: string
 *                           example: "john.doe@example.com"
 *                         phoneNumber:
 *                           type: string
 *                           example: "1234567890"
 *                         roleIds:
 *                           type: array
 *                           items:
 *                             type: string
 *                           example: ["roleId1", "roleId2"]
 *                         gender:
 *                           type: string
 *                           example: "Male"
 *                         language:
 *                           type: string
 *                           example: "English"
 *                         country:
 *                           type: string
 *                           example: "USA"
 *                         address:
 *                           type: string
 *                           example: "123 Main St"
 *                         active:
 *                           type: boolean
 *                           example: true
 *         "401":
 *           description: Unauthorized, authentication token is missing or invalid
 *         "403":
 *           description: Forbidden, authenticated user does not have permission to view dispatchers
 *
 *   /admin/updateDispatchers/{dispatcherId}:
 *     patch:
 *       summary: Update dispatcher details
 *       description: Update the details of a specific dispatcher.
 *       tags: [Dispatcher]
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: path
 *           name: dispatcherId
 *           required: true
 *           schema:
 *             type: string
 *           description: The dispatcher ID
 *       requestBody:
 *         required: true
 *         content:
 *           multipart/form-data:
 *             schema:
 *               type: object
 *               properties:
 *                 firstName:
 *                   type: string
 *                   example: "John"
 *                 lastName:
 *                   type: string
 *                   example: "Doe"
 *                 email:
 *                   type: string
 *                   example: "john.doe@example.com"
 *                 phoneNumber:
 *                   type: string
 *                   example: "1234567890"
 *                 roleIds:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["roleId1", "roleId2"]
 *                 gender:
 *                   type: string
 *                   example: "Male"
 *                 language:
 *                   type: string
 *                   example: "English"
 *                 country:
 *                   type: string
 *                   example: "USA"
 *                 address:
 *                   type: string
 *                   example: "123 Main St"
 *                 active:
 *                   type: boolean
 *                   example: true
 *                 profilePic:
 *                   type: string
 *                   format: binary
 *       responses:
 *         "200":
 *           description: Successfully updated dispatcher details
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
 *                       userId:
 *                         type: string
 *                       firstName:
 *                         type: string
 *                         example: "John"
 *                       lastName:
 *                         type: string
 *                         example: "Doe"
 *                       email:
 *                         type: string
 *                         example: "john.doe@example.com"
 *                       phoneNumber:
 *                         type: string
 *                         example: "1234567890"
 *                       roleIds:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: ["roleId1", "roleId2"]
 *                       gender:
 *                         type: string
 *                         example: "Male"
 *                       language:
 *                         type: string
 *                         example: "English"
 *                       country:
 *                         type: string
 *                         example: "USA"
 *                       address:
 *                         type: string
 *                         example: "123 Main St"
 *                       active:
 *                         type: boolean
 *                         example: true
 *                   message:
 *                     type: string
 *                     example: "Dispatcher updated successfully"
 *         "401":
 *           description: Unauthorized, authentication token is missing or invalid
 *         "403":
 *           description: Forbidden, authenticated user does not have permission to update dispatcher details
 *         "404":
 *           description: Dispatcher not found
 *
 *   /admin/deleteDispatchers/{dispatcherId}:
 *     delete:
 *       summary: Delete a dispatcher
 *       description: Delete a specific dispatcher.
 *       tags: [Dispatcher]
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: path
 *           name: dispatcherId
 *           required: true
 *           schema:
 *             type: string
 *           description: The dispatcher ID
 *       responses:
 *         "200":
 *           description: Successfully deleted the dispatcher
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
 *                     example: "Dispatcher deleted successfully"
 *         "401":
 *           description: Unauthorized, authentication token is missing or invalid
 *         "403":
 *           description: Forbidden, authenticated user does not have permission to delete dispatcher
 *         "404":
 *           description: Dispatcher not found
 */
