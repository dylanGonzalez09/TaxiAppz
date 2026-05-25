const express = require('express');
const auth = require('../../../middlewares/auth');
const validate = require('../../../middlewares/validate');
const driverDocumentValidation = require('../../../validations/web/master/driverdocument.validation');
const driverDocumentController = require('../../../controllers/api/auth/driver_document.controller');

const {documentModelUpload} = require('../../../middlewares/upload');

const router = express.Router();

router.route('/').get(auth('DriverDocument'),validate(driverDocumentValidation.getDriverDocument), driverDocumentController.getDriverDocumentByDriver);
router.route('/upload').post(auth('DriverDocument'), validate(driverDocumentValidation.createDriverDocument), documentModelUpload.single('documentImage'), driverDocumentController.createOrUpdateDriverDocument);
router.route('/profile/upload').post(auth('DriverDocument'), validate(driverDocumentValidation.createDriverDocument), documentModelUpload.single('documentImage'), driverDocumentController.updateDriverProfileDocument);

module.exports = router;
