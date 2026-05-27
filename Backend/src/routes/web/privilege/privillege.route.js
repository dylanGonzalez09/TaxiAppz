const express = require('express');
const auth = require('../../../middlewares/auth');
const validate = require('../../../middlewares/validate');
const privillegeValidation = require('../../../validations/web/privilege/privillege.validation');
const privilegeController = require('../../../controllers/web/privilege/privilege.controller');

const router = express.Router();

router
  .route('/create')
  .post(auth('Privillege'), validate(privillegeValidation.createPrivillege), privilegeController.createPrivillege);
router
  .route('/getPrivilleges')
  .get(auth('Privillege'), validate(privillegeValidation.getPrivilleges), privilegeController.getPrivilleges);
router
  .route('/getPrivillege/:privillegeId')
  .get(auth('Privillege'), validate(privillegeValidation.getPrivillege), privilegeController.getPrivillege);
router
  .route('/updatePrivillege/:privillegeId')
  .patch(auth('Privillege'), validate(privillegeValidation.updatePrivillege), privilegeController.updatePrivillege);
router
  .route('/deletePrivillege/:privillegeId')
  .delete(auth('Privillege'), validate(privillegeValidation.deletePrivillege), privilegeController.deletePrivillege);
router
  .route('/getPrivillegeDetails')
  .get(auth('Privillege'), validate(privillegeValidation.getPrivillegesDetails), privilegeController.PrivillegeDetails);
router
  .route('/getPrivillegeWithRole/:roleId')
  .get(auth('Privillege'), validate(privillegeValidation.getPrivillegesDetails), privilegeController.PrivillegeWithRole);
router
  .route('/privillegeUpdate/:privillegeId')
  .patch(auth('Privillege'), validate(privillegeValidation.updatePrivillege), privilegeController.updatePrivillege);
router
  .route('/giveprivillege/:privillegeId')
  .patch(auth('Privillege'), validate(privillegeValidation.updatePrivillege), privilegeController.privillegeUpdate);
router
  .route('/getPrivillegeWithRoleName/:roleId')
  .get(auth('Privillege'), validate(privillegeValidation.getPrivillegesDetails), privilegeController.PrivillegeWithRoleName);

// web
router.patch(
  '/admin/giveprivillege/:privillegeId',
  validate(privillegeValidation.updatePrivillege),
  privilegeController.privillegeUpdate,
);
router.get(
  '/admin/getPrivillegeWithRole/:roleId',
  validate(privillegeValidation.getPrivillegesDetails),
  privilegeController.PrivillegeWithRole,
);

module.exports = router;

/**
 * @swagger
 * /privillege/create:
 *   post:
 *     summary: Create privileges for a role
 *     description: Create privileges for a role specified by roleId.
 *     tags: [Privileges]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               permissionIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   example: "66866cbc05a0980addb7ebfc"
 *               roleId:
 *                 type: string
 *                 example: "668645462e75510101af8b43"
 *     responses:
 *       "201":
 *         description: Privileges created successfully
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
 *                     permissionIds:
 *                       type: array
 *                       items:
 *                         type: string
 *                         example: "66866cbc05a0980addb7ebfc"
 *                     roleId:
 *                       type: string
 *                       example: "668645462e75510101af8b43"
 *                     id:
 *                       type: string
 *                       example: "6687e099f6f62e139862cfe0"
 *                 message:
 *                   type: string
 *                   example: Success
 */

/**
 * @swagger
 * /privillege/getPrivilleges:
 *   get:
 *     summary: Get all privileges
 *     description: Retrieve a list of all privileges.
 *     tags: [Privileges]
 *     responses:
 *       "200":
 *         description: A list of privileges
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
 *                           permissionIds:
 *                             type: array
 *                             items:
 *                               type: string
 *                               example: "66866cbc05a0980addb7ebfc"
 *                           roleId:
 *                             type: string
 *                             example: "6686416a37db8b3d4c69d371"
 *                           id:
 *                             type: string
 *                             example: "66867a73006f38d5fe63323a"
 *                     page:
 *                       type: number
 *                       example: 1
 *                     limit:
 *                       type: number
 *                       example: 10
 *                     totalPages:
 *                       type: number
 *                       example: 1
 *                     totalResults:
 *                       type: number
 *                       example: 3
 *                 message:
 *                   type: string
 *                   example: Success
 */

/**
 * @swagger
 * /privillege/getPrivillegeDetails:
 *   post:
 *     summary: Get privilege details
 *     description: Retrieve details of privileges for roles.
 *     tags: [Privileges]
 *     responses:
 *       "200":
 *         description: A list of privilege details
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
 *                       _id:
 *                         type: string
 *                         example: "66867a73006f38d5fe63323a"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-07-04T10:33:23.567Z"
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-07-04T10:33:23.567Z"
 *                       role:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: "6686416a37db8b3d4c69d371"
 *                           role:
 *                             type: string
 *                             example: "user"
 *                       permissions:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             _id:
 *                               type: string
 *                               example: "66866cc805a0980addb7ebff"
 *                             permissionName:
 *                               type: string
 *                               example: "Edit"
 *                             groupName:
 *                               type: string
 *                               example: "User"
 *                 message:
 *                   type: string
 *                   example: Success
 */

/**
 * @swagger
 * /privillege/getPrivillege/{id}:
 *   get:
 *     summary: Get privilege by ID
 *     description: Retrieve details of a specific privilege by its ID.
 *     tags: [Privileges]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: "66867aa0006f38d5fe63323d"
 *         description: ID of the privilege to retrieve.
 *     responses:
 *       "200":
 *         description: Details of the requested privilege
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
 *                     permissionIds:
 *                       type: array
 *                       items:
 *                         type: string
 *                         example: "66866cbc05a0980addb7ebfc"
 *                     roleId:
 *                       type: string
 *                       example: "668645462e75510101af8b43"
 *                     id:
 *                       type: string
 *                       example: "66867aa0006f38d5fe63323d"
 *                 message:
 *                   type: string
 *                   example: Success
 *       "404":
 *         description: Privilege not found
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
 *                   example: Privilege not found
 */

/**
 * @swagger
 * /privillege/updatePrivillege/{id}:
 *   patch:
 *     summary: Update privilege by ID
 *     description: Update details of a specific privilege by its ID.
 *     tags: [Privileges]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: "6687e099f6f62e139862cfe0"
 *         description: ID of the privilege to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               permissionIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   example: "66866cbc05a0980addb7ebfc"
 *               roleId:
 *                 type: string
 *                 example: "668645462e75510101af8b43"
 *             required:
 *               - permissionIds
 *               - roleId
 *     responses:
 *       "200":
 *         description: Updated privilege details
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
 *                     permissionIds:
 *                       type: array
 *                       items:
 *                         type: string
 *                         example: "66866cbc05a0980addb7ebfc"
 *                     roleId:
 *                       type: string
 *                       example: "668645462e75510101af8b43"
 *                     id:
 *                       type: string
 *                       example: "6687e099f6f62e139862cfe0"
 *                 message:
 *                   type: string
 *                   example: Success
 *       "404":
 *         description: Privilege not found
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
 *                   example: Privilege not found
 */

/**
 * @swagger
 * /privillege/deletePrivillege/{id}:
 *   delete:
 *     summary: Delete privilege by ID
 *     description: Delete a specific privilege by its ID.
 *     tags: [Privileges]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: "6687e099f6f62e139862cfe0"
 *         description: ID of the privilege to delete.
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
 *                       example: "data Deleted Successfully"
 *                 message:
 *                   type: string
 *                   example: Success
 *       "404":
 *         description: Privilege not found
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
 *                   example: Privilege not found
 */
