const express = require('express');
const auth = require('../../../middlewares/auth');
const validate = require('../../../middlewares/validate');
const categoryValidation = require('../../../validations/web/master/category.validation');
const categoryController = require('../../../controllers/web/master/category.controller');

const { upload } = require('../../../middlewares/upload');

const router = express.Router();

// Routes with authentication and validation
router.post(
  '/create',
  auth('Category'),
  validate(categoryValidation.createCategory),
  upload.single('categoryImage'),
  categoryController.createCategory,
);
router.get('/getCategorieswithPagination', auth('Category'), categoryController.getCategories);
router.get(
  '/getCategories/:categoryId',
  auth('Category'),
  validate(categoryValidation.getCategory),
  categoryController.getCategory,
);
router.get('/getCategory/list', auth('Category'), categoryController.getCategoriesWithoutPagination);
router.patch(
  '/updateCategories/:categoryId',
  auth('Category'),
  validate(categoryValidation.updateCategory),
  upload.single('categoryImage'),
  categoryController.updateCategory,
);
router.delete(
  '/deleteCategories/:categoryId',
  auth('Category'),
  validate(categoryValidation.deleteCategory),
  categoryController.deleteCategory,
);
router.patch(
  '/updateStatus/:categoryId',
  auth('Category'),
  validate(categoryValidation.updateCategoryStatus),
  categoryController.updateCategoryStatus,
);

module.exports = router;

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 * paths:
 *   /v1/category/create:
 *     post:
 *       summary: Create a new category
 *       description: Create a new category with specified details.
 *       tags: [Category]
 *       security:
 *         - bearerAuth: []
 *       requestBody:
 *         required: true
 *         content:
 *           multipart/form-data:
 *             schema:
 *               type: object
 *               properties:
 *                 category:
 *                   type: string
 *                   example: "location"
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 categoryImage:
 *                   type: string
 *                   format: binary
 *       responses:
 *         "200":
 *           description: Successfully created a new category
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   success:
 *                     type: boolean
 *                     example: true
 *                   data:
 *                     type: object
 *                     properties:
 *                       category:
 *                         type: string
 *                         example: "location"
 *                       categoryImage:
 *                         type: string
 *                         example: "aed894a0ec1736f3c0fa9cd32fca0e7a.png"
 *                       status:
 *                         type: boolean
 *                         example: true
 *                       id:
 *                         type: string
 *                         example: "66b2fcb5ef6a9d1ca2d43713"
 *                   message:
 *                     type: string
 *                     example: "Category created successfully"
 *         "401":
 *           description: Unauthorized, authentication token is missing or invalid
 *         "403":
 *           description: Forbidden, authenticated user does not have permission to create categories
 *         "400":
 *           description: Bad Request, invalid input data
 *
 *   /v1/category/getCategories:
 *     get:
 *       summary: Get list of categories
 *       description: Retrieve a list of all categories.
 *       tags: [Category]
 *       security:
 *         - bearerAuth: []
 *       responses:
 *         "200":
 *           description: Successfully retrieved list of categories
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   success:
 *                     type: boolean
 *                     example: true
 *                   data:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         category:
 *                           type: string
 *                           example: "location"
 *                         categoryImage:
 *                           type: string
 *                           example: "aed894a0ec1736f3c0fa9cd32fca0e7a.png"
 *                         status:
 *                           type: boolean
 *                           example: true
 *                         id:
 *                           type: string
 *                           example: "66b2fcb5ef6a9d1ca2d43713"
 *         "401":
 *           description: Unauthorized, authentication token is missing or invalid
 *         "403":
 *           description: Forbidden, authenticated user does not have permission to view categories
 *
 *   /v1/category/getCategories/{categoryId}:
 *     get:
 *       summary: Get category details
 *       description: Retrieve details of a specific category.
 *       tags: [Category]
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: path
 *           name: categoryId
 *           required: true
 *           schema:
 *             type: string
 *           description: The category ID
 *       responses:
 *         "200":
 *           description: Successfully retrieved category details
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   success:
 *                     type: boolean
 *                     example: true
 *                   data:
 *                     type: object
 *                     properties:
 *                       category:
 *                         type: string
 *                         example: "location"
 *                       categoryImage:
 *                         type: string
 *                         example: "aed894a0ec1736f3c0fa9cd32fca0e7a.png"
 *                       status:
 *                         type: boolean
 *                         example: true
 *                       id:
 *                         type: string
 *                         example: "66b2fcb5ef6a9d1ca2d43713"
 *         "401":
 *           description: Unauthorized, authentication token is missing or invalid
 *         "403":
 *           description: Forbidden, authenticated user does not have permission to view category details
 *         "404":
 *           description: Category not found
 *
 *   /v1/category/getCategory/list:
 *     get:
 *       summary: Get list of categories without pagination
 *       description: Retrieve a list of all categories without pagination.
 *       tags: [Category]
 *       security:
 *         - bearerAuth: []
 *       responses:
 *         "200":
 *           description: Successfully retrieved list of categories
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   success:
 *                     type: boolean
 *                     example: true
 *                   data:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         category:
 *                           type: string
 *                           example: "location"
 *                         categoryImage:
 *                           type: string
 *                           example: "aed894a0ec1736f3c0fa9cd32fca0e7a.png"
 *                         status:
 *                           type: boolean
 *                           example: true
 *                         id:
 *                           type: string
 *                           example: "66b2fcb5ef6a9d1ca2d43713"
 *         "401":
 *           description: Unauthorized, authentication token is missing or invalid
 *         "403":
 *           description: Forbidden, authenticated user does not have permission to view categories
 *
 *   /v1/category/updateCategories/{categoryId}:
 *     patch:
 *       summary: Update category details
 *       description: Update the details of a specific category.
 *       tags: [Category]
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: path
 *           name: categoryId
 *           required: true
 *           schema:
 *             type: string
 *           description: The category ID
 *       requestBody:
 *         required: true
 *         content:
 *           multipart/form-data:
 *             schema:
 *               type: object
 *               properties:
 *                 category:
 *                   type: string
 *                   example: "new location"
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 categoryImage:
 *                   type: string
 *                   format: binary
 *       responses:
 *         "200":
 *           description: Successfully updated category details
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   success:
 *                     type: boolean
 *                     example: true
 *                   data:
 *                     type: object
 *                     properties:
 *                       category:
 *                         type: string
 *                         example: "new location"
 *                       categoryImage:
 *                         type: string
 *                         example: "updated_image.png"
 *                       status:
 *                         type: boolean
 *                         example: false
 *                       id:
 *                         type: string
 *                         example: "66b2fcb5ef6a9d1ca2d43713"
 *                   message:
 *                     type: string
 *                     example: "Category updated successfully"
 *         "401":
 *           description: Unauthorized, authentication token is missing or invalid
 *         "403":
 *           description: Forbidden, authenticated user does not have permission to update category details
 *         "404":
 *           description: Category not found
 *
 *   /v1/category/deleteCategories/{categoryId}:
 *     delete:
 *       summary: Delete a category
 *       description: Delete a specific category.
 *       tags: [Category]
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: path
 *           name: categoryId
 *           required: true
 *           schema:
 *             type: string
 *           description: The category ID
 *       responses:
 *         "200":
 *           description: Successfully deleted the category
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   success:
 *                     type: boolean
 *                     example: true
 *                   message:
 *                     type: string
 *                     example: "Category deleted successfully"
 *         "401":
 *           description: Unauthorized, authentication token is missing or invalid
 *         "403":
 *           description: Forbidden, authenticated user does not have permission to delete category
 *         "404":
 *           description: Category not found
 */
