const express = require('express');
const auth = require('../../../middlewares/auth');
const validate = require('../../../middlewares/validate');
const clientValidation = require('../../../validations/web/client/democlient.validation');
const clientController = require('../../../controllers/web/client/democlient.controller');

const router = express.Router();

router.route('/create').post(auth('Client'), validate(clientValidation.createClient), clientController.createClient);
router.route('/getClientsWithPagination').get(auth('Client'), clientController.queryClients);
router.route('/getClient/:clientId').get(auth('Client'), validate(clientValidation.getClient), clientController.getClient);
router.route('/listAll').get(auth('Client'), clientController.getClientDetails);
router
  .route('/updateClient/:clientId')
  .patch(auth('Client'), validate(clientValidation.updateClient), clientController.updateClient);
router
  .route('/deleteClient/:clientId')
  .delete(auth('Client'), validate(clientValidation.deleteClient), clientController.deleteClient);
router.patch(
  '/updateClientStatus/:clientId',
  auth('Client'),
  validate(clientValidation.updateActiveStatus),
  clientController.updateActiveStatus,
);
router.route('/getDropDown/list').get(clientController.getDropDownList);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Clients
 *   description: Client management and retrieval
 */

/**
 * @swagger
 * /client/create:
 *   post:
 *     summary: Create a new client
 *     description: Create a new client with specified details.
 *     tags: [Clients]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "6108e3d58f623b0015432d4a"
 *               Name:
 *                 type: string
 *                 example: "John Doe"
 *               clientCode:
 *                 type: string
 *                 example: "JD12345"
 *               Startdate:
 *                 type: string
 *                 format: date
 *                 example: "2024-08-01"
 *               Enddate:
 *                 type: string
 *                 format: date
 *                 example: "2024-12-31"
 *               noOfVehicle:
 *                 type: string
 *                 example: "5"
 *               status:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       "200":
 *         description: Successfully created a new client
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
 *                     Name:
 *                       type: string
 *                       example: "John Doe"
 *                     clientCode:
 *                       type: string
 *                       example: "JD12345"
 *                     Startdate:
 *                       type: string
 *                       format: date
 *                       example: "2024-08-01"
 *                     Enddate:
 *                       type: string
 *                       format: date
 *                       example: "2024-12-31"
 *                     noOfVehicle:
 *                       type: string
 *                       example: "5"
 *                     status:
 *                       type: boolean
 *                       example: true
 *                     id:
 *                       type: string
 *                       example: "6687e2a01d7924f264ab17d5"
 *                 message:
 *                   type: string
 *                   example: Success
 */

/**
 * @swagger
 * /client/getClients:
 *   get:
 *     summary: Get all clients
 *     description: Retrieve a list of all clients.
 *     tags: [Clients]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *         description: The page number to retrieve
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *         description: The number of items per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           example: "name:asc"
 *         description: Sort criteria in the format `field:order`
 *       - in: query
 *         name: status
 *         schema:
 *           type: boolean
 *           example: true
 *         description: Filter by client status
 *     responses:
 *       "200":
 *         description: Successfully retrieved clients
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
 *                           Name:
 *                             type: string
 *                             example: "John Doe"
 *                           clientCode:
 *                             type: string
 *                             example: "JD12345"
 *                           Startdate:
 *                             type: string
 *                             format: date
 *                             example: "2024-08-01"
 *                           Enddate:
 *                             type: string
 *                             format: date
 *                             example: "2024-12-31"
 *                           noOfVehicle:
 *                             type: string
 *                             example: "5"
 *                           status:
 *                             type: boolean
 *                             example: true
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
 * /client/getClient/{clientId}:
 *   get:
 *     summary: Get client by ID
 *     description: Retrieve a specific client by its ID.
 *     tags: [Clients]
 *     parameters:
 *       - in: path
 *         name: clientId
 *         required: true
 *         schema:
 *           type: string
 *           example: "66866cbc05a0980addb7ebfc"
 *         description: ID of the client to retrieve.
 *     responses:
 *       "200":
 *         description: Successfully retrieved the client
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
 *                     Name:
 *                       type: string
 *                       example: "John Doe"
 *                     clientCode:
 *                       type: string
 *                       example: "JD12345"
 *                     Startdate:
 *                       type: string
 *                       format: date
 *                       example: "2024-08-01"
 *                     Enddate:
 *                       type: string
 *                       format: date
 *                       example: "2024-12-31"
 *                     noOfVehicle:
 *                       type: string
 *                       example: "5"
 *                     status:
 *                       type: boolean
 *                       example: true
 *                     id:
 *                       type: string
 *                       example: "66866cbc05a0980addb7ebfc"
 *                 message:
 *                   type: string
 *                   example: Success
 */

/**
 * @swagger
 * /client/listAll:
 *   get:
 *     summary: List all clients without pagination
 *     description: Retrieve a list of all clients without pagination.
 *     tags: [Clients]
 *     responses:
 *       "200":
 *         description: Successfully retrieved all clients
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
 *                       Name:
 *                         type: string
 *                         example: "John Doe"
 *                       clientCode:
 *                         type: string
 *                         example: "JD12345"
 *                       Startdate:
 *                         type: string
 *                         format: date
 *                         example: "2024-08-01"
 *                       Enddate:
 *                         type: string
 *                         format: date
 *                         example: "2024-12-31"
 *                       noOfVehicle:
 *                         type: string
 *                         example: "5"
 *                       status:
 *                         type: boolean
 *                         example: true
 *                       id:
 *                         type: string
 *                         example: "66866cbc05a0980addb7ebfc"
 *                 message:
 *                   type: string
 *                   example: Success
 */

/**
 * @swagger
 * /client/updateClient/{clientId}:
 *   patch:
 *     summary: Update client by ID
 *     description: Update a specific client by its ID.
 *     tags: [Clients]
 *     parameters:
 *       - in: path
 *         name: clientId
 *         required: true
 *         schema:
 *           type: string
 *           example: "6687e2a01d7924f264ab17d5"
 *         description: ID of the client to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Name:
 *                 type: string
 *                 example: "John Doe"
 *               clientCode:
 *                 type: string
 *                 example: "JD12345"
 *               Startdate:
 *                 type: string
 *                 format: date
 *                 example: "2024-08-01"
 *               Enddate:
 *                 type: string
 *                 format: date
 *                 example: "2024-12-31"
 *               noOfVehicle:
 *                 type: string
 *                 example: "5"
 *               status:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       "200":
 *         description: Successfully updated the client
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
 *                     Name:
 *                       type: string
 *                       example: "John Doe"
 *                     clientCode:
 *                       type: string
 *                       example: "JD12345"
 *                     Startdate:
 *                       type: string
 *                       format: date
 *                       example: "2024-08-01"
 *                     Enddate:
 *                       type: string
 *                       format: date
 *                       example: "2024-12-31"
 *                     noOfVehicle:
 *                       type: string
 *                       example: "5"
 *                     status:
 *                       type: boolean
 *                       example: true
 *                     id:
 *                       type: string
 *                       example: "66866cbc05a0980addb7ebfc"
 *                 message:
 *                   type: string
 *                   example: Success
 */

/**
 * @swagger
 * /client/deleteClient/{clientId}:
 *   delete:
 *     summary: Delete client by ID
 *     description: Delete a specific client by its ID.
 *     tags: [Clients]
 *     parameters:
 *       - in: path
 *         name: clientId
 *         required: true
 *         schema:
 *           type: string
 *           example: "6687e2a01d7924f264ab17d5"
 *         description: ID of the client to delete.
 *     responses:
 *       "200":
 *         description: Successfully deleted the client
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Client deleted successfully"
 */
