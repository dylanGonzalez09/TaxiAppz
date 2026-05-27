const express = require('express');
const deleteAccountController = require('../../../controllers/web/delete/deleteAccount.controller');
const catchAsync = require('../../../utils/catchAsync');

const router = express.Router();

// router.post('/sendOtp', deleteAccountController.sendOTP);
router.post('/sendOtp', catchAsync(deleteAccountController.sendOTP));
router.post('/remove', deleteAccountController.deleteAccount);

module.exports = router;
