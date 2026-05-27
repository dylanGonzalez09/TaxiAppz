const express = require('express');
const auth = require('../../../middlewares/auth');
const validate = require('../../../middlewares/validate');
const advertisementValidation = require('../../../validations/web/master/advertisement.validation');
const advertisementController = require('../../../controllers/web/master/advertisement.controller');
const { advertisementUpload } = require('../../../middlewares/upload');

const router = express.Router();

router
  .route('/create')
  .post(
    auth('Advertisement'),
    validate(advertisementValidation.createAdvertisement),
    advertisementUpload.single('image'),
    advertisementController.createAdvertisement,
  );
router.route('/getAdvertisementsWithPagination').get(auth('Advertisement'), advertisementController.getAdvertisements);
router
  .route('/getAdvertisements/:advertisementId')
  .get(auth('Advertisement'), validate(advertisementValidation.getAdvertisement), advertisementController.getAdvertisement);
router.route('/getAdvertisement/list').get(auth('Advertisement'), advertisementController.getAdvertisementWithOutPagination);
router
  .route('/updateAdvertisements/:advertisementId')
  .patch(
    auth('Advertisement'),
    validate(advertisementValidation.updateAdvertisement),
    advertisementUpload.single('image'),
    advertisementController.updateAdvertisement,
  );
router
  .route('/deleteAdvertisements/:advertisementId')
  .delete(
    auth('Advertisement'),
    validate(advertisementValidation.deleteAdvertisement),
    advertisementController.deleteAdvertisement,
  );
router.patch(
  '/updateAdvertisementStatus/:advertisementId',
  auth('Advertisement'),
  validate(advertisementValidation.updateAdvertisementStatus),
  advertisementController.updateAdvertisementStatus,
); // Fixed function name

router.get('/driver/list', auth('Advertisement'), advertisementController.getDriverAdvertisementWithoutPagination);
router.get('/user/list', auth('Advertisement'), advertisementController.getUserAdvertisementWithoutPagination);

module.exports = router;

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 * /advertisement/admin/create:
 *   post:
 *     summary: Create a new group document
 *     description: Create a new group document with the specified details.
 *     tags: [Advertisement]
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
 *                 example: "test"
 *               status:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       "200":
 *         description: Successfully created a new group document
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
 *                       example: "test"
 *                     status:
 *                       type: boolean
 *                       example: true
 *                     id:
 *                       type: string
 *                       example: "66b0bd0639d30fcdfc7fe6ab"
 *                 message:
 *                   type: string
 *                   example: Success
 *       "401":
 *         description: Unauthorized, authentication token is missing or invalid
 *       "403":
 *         description: Forbidden, authenticated user does not have permission to create group documents
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
 * /advertisement/admin/getAdvertisements:
 *   get:
 *     summary: Get group documents
 *     description: Retrieve a list of group documents.
 *     tags: [Advertisement]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: Successfully retrieved group documents
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
 *                             example: "test"
 *                           status:
 *                             type: boolean
 *                             example: true
 *                           id:
 *                             type: string
 *                             example: "66b0bc1a39d30fcdfc7fe69f"
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
 *         description: Forbidden, authenticated user does not have permission to view group documents
 *       "400":
 *         description: Bad Request, invalid request parameters
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 * /advertisement/admin/getAdvertisement/list:
 *   get:
 *     summary: Get list of group documents
 *     description: Retrieve a list of group documents.
 *     tags: [Advertisement]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: Successfully retrieved list of group documents
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
 *                         example: "test"
 *                       status:
 *                         type: boolean
 *                         example: true
 *                       id:
 *                         type: string
 *                         example: "66b0bc1a39d30fcdfc7fe69f"
 *                 message:
 *                   type: string
 *                   example: Success
 *       "401":
 *         description: Unauthorized, authentication token is missing or invalid
 *       "403":
 *         description: Forbidden, authenticated user does not have permission to view group documents
 *       "400":
 *         description: Bad Request, invalid request parameters
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 * /advertisement/admin/getAdvertisements/{id}:
 *   get:
 *     summary: Get a specific group document by ID
 *     description: Retrieve details of a specific group document by its ID.
 *     tags: [Advertisement]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the group document to retrieve
 *     responses:
 *       "200":
 *         description: Successfully retrieved the group document
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
 *                       example: "test"
 *                     status:
 *                       type: boolean
 *                       example: true
 *                     id:
 *                       type: string
 *                       example: "66b0bc1a39d30fcdfc7fe69f"
 *                 message:
 *                   type: string
 *                   example: Success
 *       "401":
 *         description: Unauthorized, authentication token is missing or invalid
 *       "403":
 *         description: Forbidden, authenticated user does not have permission to view this group document
 *       "404":
 *         description: Not Found, group document with specified ID does not exist
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 * /advertisement/admin/updateAdvertisements/{id}:
 *   put:
 *     summary: Update a specific group document by ID
 *     description: Update the details of a specific group document using its ID.
 *     tags: [Advertisement]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the group document to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "testqwee"
 *               status:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       "200":
 *         description: Successfully updated the group document
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
 *                       example: "testqwee"
 *                     status:
 *                       type: boolean
 *                       example: true
 *                     id:
 *                       type: string
 *                       example: "66b0bc1a39d30fcdfc7fe69f"
 *                 message:
 *                   type: string
 *                   example: Success
 *       "401":
 *         description: Unauthorized, authentication token is missing or invalid
 *       "403":
 *         description: Forbidden, authenticated user does not have permission to update this group document
 *       "404":
 *         description: Not Found, group document with specified ID does not exist
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
 * /advertisement/admin/deleteAdvertisements/{id}:
 *   delete:
 *     summary: Delete a specific group document by ID
 *     description: Delete a specific group document using its ID.
 *     tags: [Advertisement]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the group document to delete
 *     responses:
 *       "200":
 *         description: Successfully deleted the group document
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
 *         description: Forbidden, authenticated user does not have permission to delete this group document
 *       "404":
 *         description: Not Found, group document with specified ID does not exist
 */
