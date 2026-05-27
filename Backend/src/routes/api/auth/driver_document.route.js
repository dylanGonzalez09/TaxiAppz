const express = require('express');
const auth = require('../../../middlewares/auth');
const validate = require('../../../middlewares/validate');
const driverDocumentValidation = require('../../../validations/web/master/driverdocument.validation');
const driverDocumentController = require('../../../controllers/api/auth/driver_document.controller');

const { documentModelUpload, combinedUpload } = require('../../../middlewares/upload');

const router = express.Router();

router
  .route('/')
  .get(
    auth('DriverDocument'),
    validate(driverDocumentValidation.getDriverDocument),
    driverDocumentController.getDriverDocumentByDriver,
  );
router
  .route('/upload')
  .post(
    auth('DriverDocument'),
    validate(driverDocumentValidation.createDriverDocument),
    documentModelUpload.single('documentImage'),
    driverDocumentController.createOrUpdateDriverDocument,
  );
// Route with two separate upload middlewares for different locations
router
  .route('/profile/upload')
  .post(
    auth('DriverDocument'),
    combinedUpload.fields([{ name: 'profileImage', maxCount: 1 }]),
    driverDocumentController.updateDriverProfileDocument,
  );
module.exports = router;
