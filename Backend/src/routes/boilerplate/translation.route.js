const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const translationController = require('../../controllers/boilerplate/translation.controller');

const router = express.Router();

router.route('/create').post(auth('Translation'), translationController.createTranslation);
router.route('/gettranslation/list').get(auth('Translation'), translationController.getlanguageWithOutPagination);
router.route('/get').get(auth('Translation'), translationController.getlanguageByCode);
router.route('/mobile/get').get(auth('Translation'),translationController.getMobilelanguageByCode);
router.route('/').get(auth('Translation'),translationController.getActivelanguage);
router.route('/getlanguage').get(translationController.getActivelanguageAndId);
// auth('Translation'),
router.route('/delete/:key').delete(auth('Translation'), translationController.deleteTranslation);


module.exports = router;

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 * /language/create:
 *   post:
 *     summary: Create a new language
 *     description: Create a new language with specified name, code, and status.
 *     tags: [Languages]
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
 *               code:
 *                 type: string
 *                 example: "test"
 *               status:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       "200":
 *         description: Successfully created a new language
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
 *                     code:
 *                       type: string
 *                       example: "test"
 *                     status:
 *                       type: boolean
 *                       example: true
 *                     id:
 *                       type: string
 *                       example: "668e2d1419f3970480212027"
 *                 message:
 *                   type: string
 *                   example: Success
 *       "400":
 *         description: Bad Request, missing or invalid parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Invalid input data"
 *       "401":
 *         description: Unauthorized, authentication token is missing or invalid
 *       "403":
 *         description: Forbidden, authenticated user does not have permission to create languages
 */

/**
 * @swagger
 * /language/getLanguage:
 *   get:
 *     summary: Get all languages
 *     description: Retrieve a list of all languages.
 *     tags: [Languages]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: Successfully retrieved languages
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
 *                             example: "English"
 *                           code:
 *                             type: string
 *                             example: "en"
 *                           status:
 *                             type: boolean
 *                             example: true
 *                           id:
 *                             type: string
 *                             example: "668e2c4519f3970480212015"
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
 *         description: Forbidden, authenticated user does not have permission to retrieve languages
 */

/**
 * @swagger
 * /language/getLanguage/list:
 *   get:
 *     summary: Get language list
 *     description: Retrieve a list of languages.
 *     tags: [Languages]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: Successfully retrieved languages list
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
 *                         example: "English"
 *                       code:
 *                         type: string
 *                         example: "en"
 *                       status:
 *                         type: boolean
 *                         example: true
 *                       id:
 *                         type: string
 *                         example: "668e2c4519f3970480212015"
 *                 message:
 *                   type: string
 *                   example: Success
 *       "401":
 *         description: Unauthorized, authentication token is missing or invalid
 *       "403":
 *         description: Forbidden, authenticated user does not have permission to retrieve languages
 */

/**
 * @swagger
 * /language/getLanguages/{id}:
 *   get:
 *     summary: Get language by ID
 *     description: Retrieve a language by its ID.
 *     tags: [Languages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: "668e2c4519f3970480212015"
 *         description: ID of the language to retrieve
 *     responses:
 *       "200":
 *         description: Successfully retrieved language by ID
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
 *                       example: "English"
 *                     code:
 *                       type: string
 *                       example: "en"
 *                     status:
 *                       type: boolean
 *                       example: true
 *                     id:
 *                       type: string
 *                       example: "668e2c4519f3970480212015"
 *                 message:
 *                   type: string
 *                   example: Success
 *       "401":
 *         description: Unauthorized, authentication token is missing or invalid
 *       "403":
 *         description: Forbidden, authenticated user does not have permission to retrieve the language
 */

/**
 * @swagger
 * /language/updateLanguages/{id}:
 *   patch:
 *     summary: Update language by ID
 *     description: Update a language's details by its ID.
 *     tags: [Languages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: "668e2c4519f3970480212015"
 *         description: ID of the language to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "English"
 *               code:
 *                 type: string
 *                 example: "en"
 *               status:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       "200":
 *         description: Successfully updated language by ID
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
 *                       example: "English"
 *                     code:
 *                       type: string
 *                       example: "en"
 *                     status:
 *                       type: boolean
 *                       example: true
 *                     id:
 *                       type: string
 *                       example: "668e2c4519f3970480212015"
 *                 message:
 *                   type: string
 *                   example: Success
 *       "401":
 *         description: Unauthorized, authentication token is missing or invalid
 *       "403":
 *         description: Forbidden, authenticated user does not have permission to update the language
 */

/**
 * @swagger
 * /language/deleteLanguages/{id}:
 *   delete:
 *     summary: Delete language by ID
 *     description: Delete a language by its ID.
 *     tags: [Languages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: "668e2d1419f3970480212027"
 *         description: ID of the language to delete
 *     responses:
 *       "200":
 *         description: Successfully deleted language by ID
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
 *         description: Forbidden, authenticated user does not have permission to delete the language
 */

