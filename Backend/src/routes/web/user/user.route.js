const express = require('express');
const auth = require('../../../middlewares/auth');
const validate = require('../../../middlewares/validate');

const authValidation = require('../../../validations/api/auth/auth.validation');
const userValidation = require('../../../validations/api/auth/user.validation');
const webUserController = require('../../../controllers/web/user/user.controller');

const router = express.Router();
const { userUpload } = require('../../../middlewares/upload');

// Web-specific user routes (separate from mobile API routes)
// These routes are for web booking system only
// No clientId required - web is platform-wide

router.post('/login', validate(authValidation.login), webUserController.userOtpSent);
router.post('/verify', validate(authValidation.verify), webUserController.userVerify);
router.post('/create', validate(userValidation.mobileCreateUser), userUpload.single('profilePic'), webUserController.createUser);
router.route('/getProfile').get(auth('Users'), webUserController.getUser);
router.route('/updateUsers').put(auth('Users'), validate(userValidation.updateUser), userUpload.single('profilePic'), webUserController.updateUser);
router.get('/places', webUserController.getAutocompletePlaces);
router.get('/request/history', webUserController.getRequestsHistory);
router.get('/cancellation-reasons', auth('Users'), webUserController.getCancellationReasons);

module.exports = router;

