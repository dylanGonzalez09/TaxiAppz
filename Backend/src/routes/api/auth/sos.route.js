const express = require('express');
const auth = require('../../../middlewares/auth');
const validate = require('../../../middlewares/validate');
const sosValidation = require('../../../validations/api/auth/sos.validation');
const sosController = require('../../../controllers/api/auth/sos.controller');

const router = express.Router();

router.route('/create').post(auth('Sos'),validate(sosValidation.createSOS), sosController.createSos);
router.route('/getSoss').get(auth('Sos'),validate(sosValidation.getSOSs), sosController.getSoss);
router.route('/getSoss/:sosId').get(auth('Sos'),validate(sosValidation.getSOS), sosController.getSos);
router.route('/getSos/list').get(auth('Sos'),sosController.getSosWithOutPagination);
router.route('/updateSos/:sosId').patch(auth('Sos'),validate(sosValidation.updateSOS), sosController.updateSos);
router.route('/deleteSos/:sosId').delete(auth('Sos'),validate(sosValidation.deleteSOS), sosController.deleteSos);

module.exports = router;

/**
 * @swagger
 * /create:
 *   post:
 *     summary: Create a new SOS request
 *     tags: [SOS]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 example: "123456789"
 *               description:
 *                 type: string
 *                 example: "Emergency at the park."
 *               title:
 *                 type: string
 *                 example: "Emergency"
 *               status:
 *                 type: integer
 *                 default: 1
 *     responses:
 *       201:
 *         description: SOS created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "SOS request created successfully"
 *       400:
 *         description: Bad Request
 */

/**
 * @swagger
 * /getSoss:
 *   get:
 *     summary: Get all SOS requests
 *     tags: [SOS]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of records per page
 *     responses:
 *       200:
 *         description: List of SOS requests
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   phoneNumber:
 *                     type: string
 *                     example: "123456789"
 *                   description:
 *                     type: string
 *                     example: "Emergency at the park."
 *                   title:
 *                     type: string
 *                     example: "Emergency"
 *                   status:
 *                     type: integer
 *                     example: 1
 *       400:
 *         description: Bad Request
 */

/**
 * @swagger
 * /getSoss/{sosId}:
 *   get:
 *     summary: Get a specific SOS request
 *     tags: [SOS]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sosId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the SOS request
 *     responses:
 *       200:
 *         description: SOS request details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 phoneNumber:
 *                   type: string
 *                   example: "123456789"
 *                 description:
 *                   type: string
 *                   example: "Emergency at the park."
 *                 title:
 *                   type: string
 *                   example: "Emergency"
 *                 status:
 *                   type: integer
 *                   example: 1
 *       404:
 *         description: SOS request not found
 */

/**
 * @swagger
 * /getSos/list:
 *   get:
 *     summary: Get all SOS requests without pagination
 *     tags: [SOS]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of all SOS requests
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   phoneNumber:
 *                     type: string
 *                     example: "123456789"
 *                   description:
 *                     type: string
 *                     example: "Emergency at the park."
 *                   title:
 *                     type: string
 *                     example: "Emergency"
 *                   status:
 *                     type: integer
 *                     example: 1
 */

/**
 * @swagger
 * /updateSoss/{sosId}:
 *   patch:
 *     summary: Update an SOS request
 *     tags: [SOS]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sosId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the SOS request
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 example: "123456789"
 *               description:
 *                 type: string
 *                 example: "Updated emergency description."
 *               title:
 *                 type: string
 *                 example: "Updated Title"
 *               status:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       200:
 *         description: SOS request updated successfully
 *       404:
 *         description: SOS request not found
 */

/**
 * @swagger
 * /deleteSoss/{sosId}:
 *   delete:
 *     summary: Delete an SOS request
 *     tags: [SOS]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sosId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the SOS request
 *     responses:
 *       200:
 *         description: SOS request deleted successfully
 *       404:
 *         description: SOS request not found
 */

