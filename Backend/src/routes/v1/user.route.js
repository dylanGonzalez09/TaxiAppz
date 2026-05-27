const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const userValidation = require('../../validations/user.validation');
const userController = require('../../controllers/user.controller');

const router = express.Router();

router.route('/manageUsers').post(auth('Users'), validate(userValidation.createUser), userController.createUser);
router.route('/getUsers').get(auth('Users'), validate(userValidation.getUsers), userController.getUsers);
router.route('/getAllUser').get(auth('Users'), userController.getUserPagination);

router.route('/web/getAllUser').get(auth('Users'), userController.getUserWithOutPagination);

router.route('/getAllAdmin').get(auth('Users'), userController.getAdminPagination);
router.route('/getAllUsers').get(auth('Users'), userController.getUserPagination);
router.route('/getUsers/:userId').get(auth('Users'), validate(userValidation.getUser), userController.getUser);
router.route('/manageUsers/:userId').patch(auth('Users'), validate(userValidation.updateUser), userController.updateUser);
router.route('/manageUsers/:userId').delete(auth('Users'), validate(userValidation.deleteUser), userController.deleteUser);
router
  .route('/getUserByRole/:roleId')
  .get(auth('Users'), validate(userValidation.getUserByRole), userController.getUserByRole);
router
  .route('/updateProfile/:userId')
  .patch(auth('Users'), validate(userValidation.updateProfile), userController.updateUser);
router
  .route('/updatePassword/:userId')
  .patch(auth('Users'), validate(userValidation.updatePassword), userController.updateUser);

router
  .route('/active-status/:userId')
  .patch(auth('Users'), validate(userValidation.updateActiveStatus), userController.updateActiveStatus);
router.post('/getUserByEmailDetails', validate(userValidation.getUserByEmail), userController.getUserByEmailDetails);

module.exports = router;
