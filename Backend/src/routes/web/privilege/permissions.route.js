const express = require('express');
const auth = require('../../../middlewares/auth');
const validate = require('../../../middlewares/validate');
const permissionsValidation = require('../../../validations/web/privilege/permissions.validation');
const permissionsController = require('../../../controllers/web/privilege/permissions.controller');

const router = express.Router();

router
  .route('/create')
  .post(auth('Permissions'), validate(permissionsValidation.createPermission), permissionsController.createPermission);
router.route('/getPermissionsWithPagination').get(auth('Permissions'), permissionsController.getPermissions);
router
  .route('/getPermissions/:permissionId')
  .get(auth('Permissions'), validate(permissionsValidation.getPermission), permissionsController.getPermission);
router.route('/getPermission/list').get(auth('Permissions'), permissionsController.getPermissionWithOutPagination);
router
  .route('/updatePermissions/:permissionId')
  .patch(auth('Permissions'), validate(permissionsValidation.updatePermission), permissionsController.updatePermission);
router
  .route('/deletePermissions/:permissionId')
  .delete(auth('Permissions'), validate(permissionsValidation.deletePermission), permissionsController.deletePermission);
// router.route('/getDropDown/list/:clientId').get(permissionsController.getDropDownList);

module.exports = router;

/**
 * @swagger
 * /permission/create:
 *   post:
 *     summary: Create a new permission
 *     description: Create a new permission with a specified name and group.
 *     tags: [Permissions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               permissionName:
 *                 type: string
 *                 example: "test"
 *               groupName:
 *                 type: string
 *                 example: "User"
 *     responses:
 *       "200":
 *         description: Successfully created a new permission
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
 *                     permissionName:
 *                       type: string
 *                       example: "test"
 *                     groupName:
 *                       type: string
 *                       example: "User"
 *                     id:
 *                       type: string
 *                       example: "6687e2a01d7924f264ab17d5"
 *                 message:
 *                   type: string
 *                   example: Success
 */

/**
 * @swagger
 * /permission/getPermissions:
 *   get:
 *     summary: Get all permissions
 *     description: Retrieve a list of all permissions.
 *     tags: [Permissions]
 *     responses:
 *       "200":
 *         description: Successfully retrieved permissions
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
 *                           permissionName:
 *                             type: string
 *                             example: "Add"
 *                           groupName:
 *                             type: string
 *                             example: "User"
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
 * /permission/getPermissions/{id}:
 *   get:
 *     summary: Get permission by ID
 *     description: Retrieve a specific permission by its ID.
 *     tags: [Permissions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: "66866cbc05a0980addb7ebfc"
 *         description: ID of the permission to retrieve.
 *     responses:
 *       "200":
 *         description: Successfully retrieved the permission
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
 *                     permissionName:
 *                       type: string
 *                       example: "Add"
 *                     groupName:
 *                       type: string
 *                       example: "User"
 *                     id:
 *                       type: string
 *                       example: "66866cbc05a0980addb7ebfc"
 *                 message:
 *                   type: string
 *                   example: Success
 */

/**
 * @swagger
 * /permission/updatePermissions/{id}:
 *   patch:
 *     summary: Update permission by ID
 *     description: Update a specific permission by its ID.
 *     tags: [Permissions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: "6687e2a01d7924f264ab17d5"
 *         description: ID of the permission to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               permissionName:
 *                 type: string
 *                 example: "Add"
 *               groupName:
 *                 type: string
 *                 example: "User"
 *     responses:
 *       "200":
 *         description: Successfully updated the permission
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
 *                     permissionName:
 *                       type: string
 *                       example: "Add"
 *                     groupName:
 *                       type: string
 *                       example: "User"
 *                     id:
 *                       type: string
 *                       example: "6687e2a01d7924f264ab17d5"
 *                 message:
 *                   type: string
 *                   example: Success
 */

/**
 * @swagger
 * /permission/deletePermissions/{id}:
 *   delete:
 *     summary: Delete permission by ID
 *     description: Delete a specific permission by its ID.
 *     tags: [Permissions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: "6687e2a01d7924f264ab17d5"
 *         description: ID of the permission to delete.
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
 */
