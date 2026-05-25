const express = require('express');
const auth = require('../../../middlewares/auth');
const validate = require('../../../middlewares/validate');
const walletValidation = require('../../../validations/web/master/wallet.validation');
const walletController = require('../../../controllers/web/master/wallet.controller');

const router = express.Router();

router.route('/create').post(auth('Wallet'),validate(walletValidation.createWallet), walletController.createWallet);
router.route('/getWallets').get(auth('Wallet'),validate(walletValidation.getWallets), walletController.getWallets);
router.route('/getWallets/:walletId').get(auth('Wallet'),validate(walletValidation.getWallet), walletController.getWallet);
router.route('/getWallet/list').get(auth('Wallet'),walletController.getWalletWithOutPagination);
router.route('/updateWallets/:walletId').patch(auth('Wallet'),validate(walletValidation.updateWallet), walletController.updateWallet);
router.route('/deleteWallets/:walletId').delete(auth('Wallet'),validate(walletValidation.deleteWallet), walletController.deleteWallet);

router.route('/getWalletTransaction/:userId').get(auth('Wallet'),validate(walletValidation.getWalletTransaction), walletController.getWalletTransaction);


module.exports = router;


/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 * /country/create:
 *   post:
 *     summary: Create a new country
 *     description: Create a new country with specified details.
 *     tags: [Country]
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
 *                 example: "United States"
 *               dial_code:
 *                 type: string
 *                 example: "+1"
 *               code:
 *                 type: string
 *                 example: "US"
 *               currency_name:
 *                 type: string
 *                 example: "United States Dollar"
 *               currency_code:
 *                 type: string
 *                 example: "USD"
 *               currency_symbol:
 *                 type: string
 *                 example: "$"
 *               status:
 *                 type: boolean
 *                 example: true
 *               capital:
 *                 type: string
 *                 example: "Washington, D.C."
 *               citizenship:
 *                 type: string
 *                 example: "American"
 *               country_code:
 *                 type: string
 *                 example: "USA"
 *               currency:
 *                 type: string
 *                 example: "Dollar"
 *               currency_sub_unit:
 *                 type: string
 *                 example: "Cent"
 *               full_name:
 *                 type: string
 *                 example: "United States of America"
 *               iso_3166_3:
 *                 type: string
 *                 example: "USA"
 *               region_code:
 *                 type: string
 *                 example: "019"
 *               sub_region_code:
 *                 type: string
 *                 example: "021"
 *               eea:
 *                 type: string
 *                 example: "No"
 *               currency_decimals:
 *                 type: string
 *                 example: "2"
 *               flag:
 *                 type: string
 *                 example: "🇺🇸"
 *               flag_base_64:
 *                 type: string
 *                 example: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA..."
 *               time_zone:
 *                 type: string
 *                 example: "EST"
 *               gmt_offset:
 *                 type: string
 *                 example: "-5:00"
 *     responses:
 *       "200":
 *         description: Successfully created a new country
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
 *                       example: "United States"
 *                     dial_code:
 *                       type: string
 *                       example: "+1"
 *                     code:
 *                       type: string
 *                       example: "US"
 *                     currency_name:
 *                       type: string
 *                       example: "United States Dollar"
 *                     currency_code:
 *                       type: string
 *                       example: "USD"
 *                     currency_symbol:
 *                       type: string
 *                       example: "$"
 *                     status:
 *                       type: boolean
 *                       example: true
 *                     capital:
 *                       type: string
 *                       example: "Washington, D.C."
 *                     citizenship:
 *                       type: string
 *                       example: "American"
 *                     country_code:
 *                       type: string
 *                       example: "USA"
 *                     currency:
 *                       type: string
 *                       example: "Dollar"
 *                     currency_sub_unit:
 *                       type: string
 *                       example: "Cent"
 *                     full_name:
 *                       type: string
 *                       example: "United States of America"
 *                     iso_3166_3:
 *                       type: string
 *                       example: "USA"
 *                     region_code:
 *                       type: string
 *                       example: "019"
 *                     sub_region_code:
 *                       type: string
 *                       example: "021"
 *                     eea:
 *                       type: string
 *                       example: "No"
 *                     currency_decimals:
 *                       type: string
 *                       example: "2"
 *                     flag:
 *                       type: string
 *                       example: "🇺🇸"
 *                     flag_base_64:
 *                       type: string
 *                       example: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA..."
 *                     time_zone:
 *                       type: string
 *                       example: "EST"
 *                     gmt_offset:
 *                       type: string
 *                       example: "-5:00"
 *                     id:
 *                       type: string
 *                       example: "668e5228522f12f273635c13"
 *                 message:
 *                   type: string
 *                   example: Success
 *       "401":
 *         description: Unauthorized, authentication token is missing or invalid
 *       "403":
 *         description: Forbidden, authenticated user does not have permission to create countries
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
 * /country/getCountry:
 *   get:
 *     summary: Get list of countries
 *     description: Retrieve a list of all countries with their details.
 *     tags: [Country]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: Successfully retrieved the list of countries
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
 *                             example: "United States"
 *                           dial_code:
 *                             type: string
 *                             example: "+1"
 *                           code:
 *                             type: string
 *                             example: "US"
 *                           currency_name:
 *                             type: string
 *                             example: "United States Dollar"
 *                           currency_code:
 *                             type: string
 *                             example: "USD"
 *                           currency_symbol:
 *                             type: string
 *                             example: "$"
 *                           status:
 *                             type: boolean
 *                             example: true
 *                           capital:
 *                             type: string
 *                             example: "Washington, D.C."
 *                           citizenship:
 *                             type: string
 *                             example: "American"
 *                           country_code:
 *                             type: string
 *                             example: "USA"
 *                           currency:
 *                             type: string
 *                             example: "Dollar"
 *                           currency_sub_unit:
 *                             type: string
 *                             example: "Cent"
 *                           full_name:
 *                             type: string
 *                             example: "United States of America"
 *                           iso_3166_3:
 *                             type: string
 *                             example: "USA"
 *                           region_code:
 *                             type: string
 *                             example: "019"
 *                           sub_region_code:
 *                             type: string
 *                             example: "021"
 *                           eea:
 *                             type: string
 *                             example: "No"
 *                           currency_decimals:
 *                             type: string
 *                             example: "2"
 *                           flag:
 *                             type: string
 *                             example: "🇺🇸"
 *                           flag_base_64:
 *                             type: string
 *                             example: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA..."
 *                           time_zone:
 *                             type: string
 *                             example: "EST"
 *                           gmt_offset:
 *                             type: string
 *                             example: "-5:00"
 *                           id:
 *                             type: string
 *                             example: "668e5193522f12f273635c06"
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
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 * /country/getCountry/list:
 *   get:
 *     summary: Get list of countries
 *     description: Retrieve a list of all countries with their details.
 *     tags: [Country]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: Successfully retrieved the list of countries
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
 *                         example: "United States"
 *                       dial_code:
 *                         type: string
 *                         example: "+1"
 *                       code:
 *                         type: string
 *                         example: "US"
 *                       currency_name:
 *                         type: string
 *                         example: "United States Dollar"
 *                       currency_code:
 *                         type: string
 *                         example: "USD"
 *                       currency_symbol:
 *                         type: string
 *                         example: "$"
 *                       status:
 *                         type: boolean
 *                         example: true
 *                       capital:
 *                         type: string
 *                         example: "Washington, D.C."
 *                       citizenship:
 *                         type: string
 *                         example: "American"
 *                       country_code:
 *                         type: string
 *                         example: "USA"
 *                       currency:
 *                         type: string
 *                         example: "Dollar"
 *                       currency_sub_unit:
 *                         type: string
 *                         example: "Cent"
 *                       full_name:
 *                         type: string
 *                         example: "United States of America"
 *                       iso_3166_3:
 *                         type: string
 *                         example: "USA"
 *                       region_code:
 *                         type: string
 *                         example: "019"
 *                       sub_region_code:
 *                         type: string
 *                         example: "021"
 *                       eea:
 *                         type: string
 *                         example: "No"
 *                       currency_decimals:
 *                         type: string
 *                         example: "2"
 *                       flag:
 *                         type: string
 *                         example: "🇺🇸"
 *                       flag_base_64:
 *                         type: string
 *                         example: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA..."
 *                       time_zone:
 *                         type: string
 *                         example: "EST"
 *                       gmt_offset:
 *                         type: string
 *                         example: "-5:00"
 *                       id:
 *                         type: string
 *                         example: "668e5193522f12f273635c06"
 *                 message:
 *                   type: string
 *                   example: Success
 *       "401":
 *         description: Unauthorized, authentication token is missing or invalid
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 * /country/getCountryes/{countryId}:
 *   get:
 *     summary: Get country by ID
 *     description: Retrieve a country's details by its ID.
 *     tags: [Country]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: countryId
 *         required: true
 *         schema:
 *           type: string
 *           example: "668e5193522f12f273635c06"
 *         description: ID of the country to retrieve
 *     responses:
 *       "200":
 *         description: Successfully retrieved country by ID
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
 *                       example: "United States"
 *                     dial_code:
 *                       type: string
 *                       example: "+1"
 *                     code:
 *                       type: string
 *                       example: "US"
 *                     currency_name:
 *                       type: string
 *                       example: "United States Dollar"
 *                     currency_code:
 *                       type: string
 *                       example: "USD"
 *                     currency_symbol:
 *                       type: string
 *                       example: "$"
 *                     status:
 *                       type: boolean
 *                       example: true
 *                     capital:
 *                       type: string
 *                       example: "Washington, D.C."
 *                     citizenship:
 *                       type: string
 *                       example: "American"
 *                     country_code:
 *                       type: string
 *                       example: "USA"
 *                     currency:
 *                       type: string
 *                       example: "Dollar"
 *                     currency_sub_unit:
 *                       type: string
 *                       example: "Cent"
 *                     full_name:
 *                       type: string
 *                       example: "United States of America"
 *                     iso_3166_3:
 *                       type: string
 *                       example: "USA"
 *                     region_code:
 *                       type: string
 *                       example: "019"
 *                     sub_region_code:
 *                       type: string
 *                       example: "021"
 *                     eea:
 *                       type: string
 *                       example: "No"
 *                     currency_decimals:
 *                       type: string
 *                       example: "2"
 *                     flag:
 *                       type: string
 *                       example: "🇺🇸"
 *                     flag_base_64:
 *                       type: string
 *                       example: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA..."
 *                     time_zone:
 *                       type: string
 *                       example: "EST"
 *                     gmt_offset:
 *                       type: string
 *                       example: "-5:00"
 *                     id:
 *                       type: string
 *                       example: "668e5193522f12f273635c06"
 *                 message:
 *                   type: string
 *                   example: Success
 *       "401":
 *         description: Unauthorized, authentication token is missing or invalid
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 * /country/updateCountry/{countryId}:
 *   patch:
 *     summary: Update country by ID
 *     description: Update a country's details by its ID.
 *     tags: [Country]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: countryId
 *         required: true
 *         schema:
 *           type: string
 *           example: "668e5193522f12f273635c06"
 *         description: ID of the country to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "United States"
 *               dial_code:
 *                 type: string
 *                 example: "+1"
 *               code:
 *                 type: string
 *                 example: "US"
 *               currency_name:
 *                 type: string
 *                 example: "United States Dollar"
 *               currency_code:
 *                 type: string
 *                 example: "USD"
 *               currency_symbol:
 *                 type: string
 *                 example: "$"
 *               status:
 *                 type: boolean
 *                 example: true
 *               capital:
 *                 type: string
 *                 example: "Washington, D.C."
 *               citizenship:
 *                 type: string
 *                 example: "American"
 *               country_code:
 *                 type: string
 *                 example: "USA"
 *               currency:
 *                 type: string
 *                 example: "Dollar"
 *               currency_sub_unit:
 *                 type: string
 *                 example: "Cent"
 *               full_name:
 *                 type: string
 *                 example: "United States of America"
 *               iso_3166_3:
 *                 type: string
 *                 example: "USA"
 *               region_code:
 *                 type: string
 *                 example: "019"
 *               sub_region_code:
 *                 type: string
 *                 example: "021"
 *               eea:
 *                 type: string
 *                 example: "No"
 *               currency_decimals:
 *                 type: string
 *                 example: "2"
 *               flag:
 *                 type: string
 *                 example: "🇺🇸"
 *               flag_base_64:
 *                 type: string
 *                 example: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA..."
 *               time_zone:
 *                 type: string
 *                 example: "EST"
 *               gmt_offset:
 *                 type: string
 *                 example: "-5:00"
 *     responses:
 *       "200":
 *         description: Successfully updated country by ID
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
 *                       example: "United States"
 *                     dial_code:
 *                       type: string
 *                       example: "+1"
 *                     code:
 *                       type: string
 *                       example: "US"
 *                     currency_name:
 *                       type: string
 *                       example: "United States Dollar"
 *                     currency_code:
 *                       type: string
 *                       example: "USD"
 *                     currency_symbol:
 *                       type: string
 *                       example: "$"
 *                     status:
 *                       type: boolean
 *                       example: true
 *                     capital:
 *                       type: string
 *                       example: "Washington, D.C."
 *                     citizenship:
 *                       type: string
 *                       example: "American"
 *                     country_code:
 *                       type: string
 *                       example: "USA"
 *                     currency:
 *                       type: string
 *                       example: "Dollar"
 *                     currency_sub_unit:
 *                       type: string
 *                       example: "Cent"
 *                     full_name:
 *                       type: string
 *                       example: "United States of America"
 *                     iso_3166_3:
 *                       type: string
 *                       example: "USA"
 *                     region_code:
 *                       type: string
 *                       example: "019"
 *                     sub_region_code:
 *                       type: string
 *                       example: "021"
 *                     eea:
 *                       type: string
 *                       example: "No"
 *                     currency_decimals:
 *                       type: string
 *                       example: "2"
 *                     flag:
 *                       type: string
 *                       example: "🇺🇸"
 *                     flag_base_64:
 *                       type: string
 *                       example: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA..."
 *                     time_zone:
 *                       type: string
 *                       example: "EST"
 *                     gmt_offset:
 *                       type: string
 *                       example: "-5:00"
 *                     id:
 *                       type: string
 *                       example: "668e5193522f12f273635c06"
 *                 message:
 *                   type: string
 *                   example: Success
 *       "401":
 *         description: Unauthorized, authentication token is missing or invalid
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 * /country/deleteCountry/{countryId}:
 *   delete:
 *     summary: Delete country by ID
 *     description: Delete a country by its ID.
 *     tags: [Country]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: countryId
 *         required: true
 *         schema:
 *           type: string
 *           example: "668e5228522f12f273635c13"
 *         description: ID of the country to delete
 *     responses:
 *       "200":
 *         description: Successfully deleted country by ID
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
 */
