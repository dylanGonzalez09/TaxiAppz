const express = require('express');
const auth = require('../../../middlewares/auth');
const validate = require('../../../middlewares/validate');
const groupDocumentValidation = require('../../../validations/web/master/groupdocument.validation');
const groupDocumentController = require('../../../controllers/web/master/groupdocument.controller');

const router = express.Router();

router.route('/create').post(auth('GroupDocument'),validate(groupDocumentValidation.createGroupDocument), groupDocumentController.createGroupDocument);
router.route('/getGroupDocumentsWithPagination').get(auth('GroupDocument'), groupDocumentController.getGroupDocuments);
router.route('/getGroupDocuments/:groupDocumentId').get(auth('GroupDocument'),validate(groupDocumentValidation.getGroupDocument), groupDocumentController.getGroupDocument);
router.route('/getGroupDocument/list').get(auth('GroupDocument'),groupDocumentController.getGroupDocumentWithOutPagination);
router.route('/updateGroupDocuments/:groupDocumentId').patch(auth('GroupDocument'),validate(groupDocumentValidation.updateGroupDocument), groupDocumentController.updateGroupDocument);
router.route('/deleteGroupDocuments/:groupDocumentId').delete(auth('GroupDocument'),validate(groupDocumentValidation.deleteGroupDocument), groupDocumentController.deleteGroupDocument);
router.patch('/updateGroupDocumentStatus/:groupDocumentId', auth('GroupDocument'), validate(groupDocumentValidation.updateGroupDocumentStatus), groupDocumentController.updateGrouoDocumentStatus);


module.exports = router;

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 * /groupDocument/admin/create:
 *   post:
 *     summary: Create a new group document
 *     description: Create a new group document with the specified details.
 *     tags: [GroupDocument]
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
 * /groupDocument/admin/getGroupDocuments:
 *   get:
 *     summary: Get group documents
 *     description: Retrieve a list of group documents.
 *     tags: [GroupDocument]
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
 * /groupDocument/admin/getGroupDocument/list:
 *   get:
 *     summary: Get list of group documents
 *     description: Retrieve a list of group documents.
 *     tags: [GroupDocument]
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
 * /groupDocument/admin/getGroupDocuments/{id}:
 *   get:
 *     summary: Get a specific group document by ID
 *     description: Retrieve details of a specific group document by its ID.
 *     tags: [GroupDocument]
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
 * /groupDocument/admin/updateGroupDocuments/{id}:
 *   put:
 *     summary: Update a specific group document by ID
 *     description: Update the details of a specific group document using its ID.
 *     tags: [GroupDocument]
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
 * /groupDocument/admin/deleteGroupDocuments/{id}:
 *   delete:
 *     summary: Delete a specific group document by ID
 *     description: Delete a specific group document using its ID.
 *     tags: [GroupDocument]
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

