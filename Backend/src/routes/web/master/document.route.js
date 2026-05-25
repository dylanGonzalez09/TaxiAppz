const express = require('express');
const auth = require('../../../middlewares/auth.js');
const validate = require('../../../middlewares/validate.js');
const DocumentValidation = require('../../../validations/web/master/document.validation.js');
const DocumentController = require('../../../controllers/web/master/document.controller.js');

const router = express.Router();

router.route('/create').post(auth('Document'),validate(DocumentValidation.createDocument), DocumentController.createDocument);
router.route('/creates').post(auth('Document'),validate(DocumentValidation.createDocuments), DocumentController.createBulkDocument);
router.route('/getDocumentsWithPagination').get(auth('Document'), DocumentController.getDocuments);
router.route('/getDocuments/:documentId').get(auth('Document'),validate(DocumentValidation.getDocument), DocumentController.getDocument);
router.route('/getDocument/list').get(auth('Document'),DocumentController.getDocumentWithOutPagination);
router.route('/updateDocuments/:documentId').patch(auth('Document'),validate(DocumentValidation.updateDocument), DocumentController.updateDocument);
router.route('/deleteDocuments/:documentId').delete(auth('Document'),validate(DocumentValidation.deleteDocument), DocumentController.deleteDocument);
router.patch('/updateDocumentStatus/:documentId', auth('Document'), validate(DocumentValidation.updateDocumentStatus), DocumentController.updateDocumentStatus);
router.route('/getDropDown/list/:clientId').get(DocumentController.getDropDownList);


module.exports = router;

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 * /v1/document/create:
 *   post:
 *     summary: Create a new document
 *     description: Create a new document with the specified details.
 *     tags: [Document]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               documentName:
 *                 type: string
 *                 example: "location test"
 *               required:
 *                 type: boolean
 *                 example: true
 *               identifier:
 *                 type: boolean
 *                 example: true
 *               expiryDate:
 *                 type: boolean
 *                 example: "06-08-2024"
 *               documentId:
 *                 type: string
 *                 example: "66b0bd0639d30fcdfc7fe6ab"
 *               status:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       "200":
 *         description: Successfully created a new document
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
 *                     documentName:
 *                       type: string
 *                       example: "location test"
 *                     required:
 *                       type: boolean
 *                       example: true
 *                     identifier:
 *                       type: boolean
 *                       example: true
 *                     expiryDate:
 *                       type: boolean
 *                       example: "2024-06-07T18:30:00.000Z"
 *                     documentId:
 *                       type: string
 *                       example: "66b0bd0639d30fcdfc7fe6ab"
 *                     status:
 *                       type: boolean
 *                       example: true
 *                     id:
 *                       type: string
 *                       example: "66b19dca026751117d971cfd"
 *                 message:
 *                   type: string
 *                   example: Success
 *       "401":
 *         description: Unauthorized, authentication token is missing or invalid
 *       "403":
 *         description: Forbidden, authenticated user does not have permission to create documents
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
 * /v1/document/create:
 *   post:
 *     summary: Create a new document
 *     description: Create a new document with the specified details.
 *     tags: [Document]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               documentName:
 *                 type: string
 *                 example: "location test"
 *               required:
 *                 type: boolean
 *                 example: true
 *               identifier:
 *                 type: boolean
 *                 example: true
 *               expiryDate:
 *                 type: boolean
 *                 example: "06-08-2024"
 *               documentId:
 *                 type: string
 *                 example: "66b0bd0639d30fcdfc7fe6ab"
 *               status:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       "200":
 *         description: Successfully created a new document
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
 *                     documentName:
 *                       type: string
 *                       example: "location test"
 *                     required:
 *                       type: boolean
 *                       example: true
 *                     identifier:
 *                       type: boolean
 *                       example: true
 *                     expiryDate:
 *                       type: boolean
 *                       example: "2024-06-07T18:30:00.000Z"
 *                     documentId:
 *                       type: string
 *                       example: "66b0bd0639d30fcdfc7fe6ab"
 *                     status:
 *                       type: boolean
 *                       example: true
 *                     id:
 *                       type: string
 *                       example: "66b19dca026751117d971cfd"
 *                 message:
 *                   type: string
 *                   example: Success
 *       "401":
 *         description: Unauthorized, authentication token is missing or invalid
 *       "403":
 *         description: Forbidden, authenticated user does not have permission to create documents
 *       "400":
 *         description: Bad Request, invalid input data
 *
 * /v1/document/getDocuments:
 *   get:
 *     summary: Get documents with pagination
 *     description: Retrieve a list of documents with pagination.
 *     tags: [Document]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: Successfully retrieved documents
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
 *                           documentName:
 *                             type: string
 *                             example: "location"
 *                           required:
 *                             type: boolean
 *                             example: true
 *                           identifier:
 *                             type: boolean
 *                             example: true
 *                           expiryDate:
 *                             type: boolean
 *                             example: true
 *                           documentId:
 *                             type: string
 *                             example: "66b0bd0639d30fcdfc7fe6ab"
 *                           status:
 *                             type: boolean
 *                             example: true
 *                           id:
 *                             type: string
 *                             example: "66b19d0b026751117d971cf5"
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
 *         description: Forbidden, authenticated user does not have permission to view documents
 *       "400":
 *         description: Bad Request, invalid input data
 *
 * /v1/document/getDocument/list:
 *   get:
 *     summary: Get documents without pagination
 *     description: Retrieve a list of documents without pagination.
 *     tags: [Document]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: Successfully retrieved documents
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
 *                       documentName:
 *                         type: string
 *                         example: "location"
 *                       required:
 *                         type: boolean
 *                         example: true
 *                       identifier:
 *                         type: boolean
 *                         example: true
 *                       expiryDate:
 *                         type: boolean
 *                         example: true
 *                       documentId:
 *                         type: string
 *                         example: "66b0bd0639d30fcdfc7fe6ab"
 *                       status:
 *                         type: boolean
 *                         example: true
 *                       id:
 *                         type: string
 *                         example: "66b19d0b026751117d971cf5"
 *                 message:
 *                   type: string
 *                   example: Success
 *       "401":
 *         description: Unauthorized, authentication token is missing or invalid
 *       "403":
 *         description: Forbidden, authenticated user does not have permission to view documents
 *       "400":
 *         description: Bad Request, invalid input data
 *
 * /v1/document/getDocuments/{documentId}:
 *   get:
 *     summary: Get a single document
 *     description: Retrieve a single document by ID.
 *     tags: [Document]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: documentId
 *         required: true
 *         schema:
 *           type: string
 *           example: "66b19d0b026751117d971cf5"
 *     responses:
 *       "200":
 *         description: Successfully retrieved the document
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
 *                     documentName:
 *                       type: string
 *                       example: "location"
 *                     required:
 *                       type: boolean
 *                       example: true
 *                     identifier:
 *                       type: boolean
 *                       example: true
 *                     expiryDate:
 *                       type: Boolean
 *                       example: true
 *                     documentId:
 *                       type: string
 *                       example: "66b0bd0639d30fcdfc7fe6ab"
 *                     status:
 *                       type: boolean
 *                       example: true
 *                     id:
 *                       type: string
 *                       example: "66b19d0b026751117d971cf5"
 *                 message:
 *                   type: string
 *                   example: Success
 *       "401":
 *         description: Unauthorized, authentication token is missing or invalid
 *       "403":
 *         description: Forbidden, authenticated user does not have permission to view documents
 *       "400":
 *         description: Bad Request, invalid input data
 *
 * /v1/document/updateDocuments/{documentId}:
 *   patch:
 *     summary: Update a document
 *     description: Update the specified fields of a document by ID.
 *     tags: [Document]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: documentId
 *         required: true
 *         schema:
 *           type: string
 *           example: "66b19d0b026751117d971cf5"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               documentName:
 *                 type: string
 *                 example: "location1"
 *               documentId:
 *                 type: string
 *                 example: "66b0bd0639d30fcdfc7fe6ab"
 *               status:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       "200":
 *         description: Successfully updated the document
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
 *                     documentName:
 *                       type: string
 *                       example: "location1"
 *                     required:
 *                       type: boolean
 *                       example: true
 *                     identifier:
 *                       type: boolean
 *                       example: true
 *                     expiryDate:
 *                       type: boolean
 *                       example: true
 *                     documentId:
 *                       type: string
 *                       example: "66b0bd0639d30fcdfc7fe6ab"
 *                     status:
 *                       type: boolean
 *                       example: true
 *                     id:
 *                       type: string
 *                       example: "66b19d0b026751117d971cf5"
 *                 message:
 *                   type: string
 *                   example: Success
 *       "401":
 *         description: Unauthorized, authentication token is missing or invalid
 *       "403":
 *         description: Forbidden, authenticated user does not have permission to update documents
 *       "400":
 *         description: Bad Request, invalid input data
 *
 * /v1/document/deleteDocuments/{documentId}:
 *   delete:
 *     summary: Delete a document
 *     description: Delete a document by ID.
 *     tags: [Document]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: documentId
 *         required: true
 *         schema:
 *           type: string
 *           example: "66b19dca026751117d971cfd"
 *     responses:
 *       "200":
 *         description: Successfully deleted the document
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
 *         description: Forbidden, authenticated user does not have permission to delete documents
 *       "400":
 *         description: Bad Request, invalid input data
 */
