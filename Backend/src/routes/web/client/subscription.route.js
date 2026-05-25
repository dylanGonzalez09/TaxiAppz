const express = require('express');
const auth = require('../../../middlewares/auth');
const validate = require('../../../middlewares/validate');
const subscriptionValidation = require('../../../validations/web/client/subscription.validation');
const subscriptionController = require('../../../controllers/web/client/subscription.controller');

const router = express.Router();

router.route('/create').post(auth('SubScription'), validate(subscriptionValidation.createSubScription), subscriptionController.createSubScription);
router.route('/getSubScriptionsWithPagination').get(auth('SubScription'), subscriptionController.getSubScriptions);
router.route('/getSubScription/:subScriptionId').get(auth('SubScription'), validate(subscriptionValidation.getSubScription), subscriptionController.getSubScription);
router.route('/listAll').get(auth('SubScription'), subscriptionController.getSubScriptionWithOutPagination);
router.route('/updateSubScription/:subScriptionId').patch(auth('SubScription'), validate(subscriptionValidation.updateSubScription), subscriptionController.updateSubScription);
router.route('/deleteSubScription/:subScriptionId').delete(auth('SubScription'), validate(subscriptionValidation.deleteSubScription), subscriptionController.deleteSubScription);
router.patch('/updateSubScriptionStatus/:subScriptionId', auth('SubScription'), validate(subscriptionValidation.updateSubScriptionStatus), subscriptionController.updateSubScriptionStatus);

/** Get Client list && Superadmin list */

router.route('/get/superadmin/list').get(subscriptionController.getSuperadminlist);

router.route('/get/client/list').get(auth('SubScription'), subscriptionController.getClientlist);

module.exports = router;



/**
 * @swagger
 * /subscription/create:
 *   post:
 *     summary: Create a new subscription
 *     description: Create a new subscription with specified name, validity period, description, and number of drivers.
 *     tags: [Subscriptions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Premium Plan"
 *               validityPeriod:
 *                 type: string
 *                 example: "30 days"
 *               description:
 *                 type: string
 *                 example: "Access to all features"
 *               onOfDrivers:
 *                 type: number
 *                 example: 5
 *     responses:
 *       "200":
 *         description: Successfully created a new subscription
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
 *                       example: "Premium Plan"
 *                     validityPeriod:
 *                       type: string
 *                       example: "30 days"
 *                     description:
 *                       type: string
 *                       example: "Access to all features"
 *                     onOfDrivers:
 *                       type: number
 *                       example: 5
 *                     id:
 *                       type: string
 *                       example: "6687e2a01d7924f264ab17d5"
 *                 message:
 *                   type: string
 *                   example: Success
 */

/**
 * @swagger
 * /subscription/getSubScriptions:
 *   get:
 *     summary: Get all subscriptions
 *     description: Retrieve a list of all subscriptions.
 *     tags: [Subscriptions]
 *     responses:
 *       "200":
 *         description: Successfully retrieved subscriptions
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
 *                             example: "Premium Plan"
 *                           validityPeriod:
 *                             type: string
 *                             example: "30 days"
 *                           description:
 *                             type: string
 *                             example: "Access to all features"
 *                           onOfDrivers:
 *                             type: number
 *                             example: 5
 *                           id:
 *                             type: string
 *                             example: "66866cbc05a0980addb7ebfc"
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
 *                       example: 5
 *                 message:
 *                   type: string
 *                   example: Success
 */

/**
 * @swagger
 * /subscription/getSubScription/{subScriptionId}:
 *   get:
 *     summary: Get subscription by ID
 *     description: Retrieve a specific subscription by its ID.
 *     tags: [Subscriptions]
 *     parameters:
 *       - in: path
 *         name: subScriptionId
 *         required: true
 *         schema:
 *           type: string
 *           example: "66866cbc05a0980addb7ebfc"
 *         description: ID of the subscription to retrieve.
 *     responses:
 *       "200":
 *         description: Successfully retrieved the subscription
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
 *                       example: "Premium Plan"
 *                     validityPeriod:
 *                       type: string
 *                       example: "30 days"
 *                     description:
 *                       type: string
 *                       example: "Access to all features"
 *                     onOfDrivers:
 *                       type: number
 *                       example: 5
 *                     id:
 *                       type: string
 *                       example: "66866cbc05a0980addb7ebfc"
 *                 message:
 *                   type: string
 *                   example: Success
 */

/**
 * @swagger
 * /subscription/updateSubScription/{subScriptionId}:
 *   patch:
 *     summary: Update subscription by ID
 *     description: Update a specific subscription by its ID.
 *     tags: [Subscriptions]
 *     parameters:
 *       - in: path
 *         name: subScriptionId
 *         required: true
 *         schema:
 *           type: string
 *           example: "6687e2a01d7924f264ab17d5"
 *         description: ID of the subscription to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Premium Plan"
 *               validityPeriod:
 *                 type: string
 *                 example: "30 days"
 *               description:
 *                 type: string
 *                 example: "Access to all features"
 *               onOfDrivers:
 *                 type: number
 *                 example: 5
 *     responses:
 *       "200":
 *         description: Successfully updated the subscription
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
 *                       example: "Premium Plan"
 *                     validityPeriod:
 *                       type: string
 *                       example: "30 days"
 *                     description:
 *                       type: string
 *                       example: "Access to all features"
 *                     onOfDrivers:
 *                       type: number
 *                       example: 5
 *                     id:
 *                       type: string
 *                       example: "6687e2a01d7924f264ab17d5"
 *                 message:
 *                   type: string
 *                   example: Success
 */

/**
 * @swagger
 * /subscription/deleteSubScription/{subScriptionId}:
 *   delete:
 *     summary: Delete subscription by ID
 *     description: Delete a specific subscription by its ID.
 *     tags: [Subscriptions]
 *     parameters:
 *       - in: path
 *         name: subScriptionId
 *         required: true
 *         schema:
 *           type: string
 *           example: "6687e2a01d7924f264ab17d5"
 *         description: ID of the subscription to delete.
 *     responses:
 *       "200":
 *         description: Deleted successfully
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
 *                     msg:
 *                       type: string
 *                       example: "Subscription Deleted Successfully"
 *                 message:
 *                   type: string
 *                   example: Success
 */
