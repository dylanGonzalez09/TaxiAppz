const express = require('express');
const auth = require('../../../middlewares/auth');
const validate = require('../../../middlewares/validate');
const fineValidation = require('../../../validations/web/master/fine.validation');
const fineController = require('../../../controllers/web/master/fine.controller');


const router = express.Router();

// Routes with authentication and validation
router.post('/create', auth('Fine'), validate(fineValidation.createFine), fineController.createFine);
router.get('/getFine/:userId', auth('Fine'), fineController.queryFine);
// router.get('/getCategories/:categoryId', auth('Category'), validate(categoryValidation.getCategory), categoryController.getCategory);
// router.get('/getCategory/list', auth('Category'), categoryController.getCategoriesWithoutPagination);
// router.patch('/updateCategories/:categoryId', auth('Category'), validate(categoryValidation.updateCategory), upload.single('categoryImage'), categoryController.updateCategory);
// router.delete('/deleteCategories/:categoryId', auth('Category'), validate(categoryValidation.deleteCategory), categoryController.deleteCategory);
// router.patch('/updateStatus/:categoryId', auth('Category'), validate(categoryValidation.updateCategoryStatus), categoryController.updateCategoryStatus);


module.exports = router;