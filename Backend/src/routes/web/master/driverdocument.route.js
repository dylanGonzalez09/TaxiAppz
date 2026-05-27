const express = require('express');
const auth = require('../../../middlewares/auth');
const validate = require('../../../middlewares/validate');
const driverDocumentValidation = require('../../../validations/web/master/driverdocument.validation');
const driverDocumentController = require('../../../controllers/web/master/driverdocument.controller');

const { documentModelUpload } = require('../../../middlewares/upload');

const router = express.Router();

router
  .route('/getDriverDocuments/:driverId')
  .get(
    auth('DriverDocument'),
    validate(driverDocumentValidation.getDriverDocument),
    driverDocumentController.getDriverDocument,
  );
router
  .route('/getDriverDocumentsByDriver/:driverId')
  .get(
    auth('DriverDocument'),
    validate(driverDocumentValidation.getDriverDocument),
    driverDocumentController.getDriverDocumentByDriver,
  );
router
  .route('/DriverDocument/create')
  .post(
    auth('DriverDocument'),
    validate(driverDocumentValidation.createDriverDocument),
    documentModelUpload.single('documentImage'),
    driverDocumentController.createDriverDocument,
  );
router
  .route('/DriverDocument/update/:driverDocumentId')
  .patch(
    auth('DriverDocument'),
    validate(driverDocumentValidation.updateDriverDocument),
    documentModelUpload.single('documentImage'),
    driverDocumentController.updateDriverDocument,
  );
router
  .route('/updateDocumentStatus/:driverDocumentId')
  .patch(
    auth('DriverDocument'),
    validate(driverDocumentValidation.updateDriverDocumentStatus),
    driverDocumentController.updateDriverDocumentStatus,
  );

router.route('/expired-documents').get(auth('DriverDocument'), driverDocumentController.getExpiredDocuments);

module.exports = router;
