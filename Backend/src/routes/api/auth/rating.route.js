const express = require('express');
const auth = require('../../../middlewares/auth');
const validate = require('../../../middlewares/validate');
const ratingValidation = require('../../../validations/api/auth/rating.validation');
const ratingController = require('../../../controllers/api/auth/rating.controller');

const router = express.Router();

router.route('/create').post(auth('Rating'), validate(ratingValidation.createRating), ratingController.createRating);
router.route('/getRating').get(auth('Rating'), validate(ratingValidation.getRating), ratingController.getRating);
router.route('/getRatings/:ratingId').get(auth('Rating'), validate(ratingValidation.getRatings), ratingController.getRatings);
router.route('/getRating/list').get(auth('Rating'), ratingController.getRatingWithOutPagination);
router.route('/updateRating/:ratingId').patch(auth('Rating'), validate(ratingValidation.updateRating), ratingController.updateRating);
router.route('/deleteRating/:ratingId').delete(auth('Rating'), validate(ratingValidation.deleteRating), ratingController.deleteRating);
router.route('/getUserRatings/:userId').get(auth('Rating'), ratingController.getUserRatings);

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

