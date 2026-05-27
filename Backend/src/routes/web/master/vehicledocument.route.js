const express = require('express');
const auth = require('../../../middlewares/auth');
const validate = require('../../../middlewares/validate');
const vehicleDocumentValidation = require('../../../validations/web/master/vehicledocument.validation');
const vehicleDocumentController = require('../../../controllers/web/master/vehicledocument.controller');
const { documentModelUpload } = require('../../../middlewares/upload');

const router = express.Router();

router
  .route('/getVehicleDocuments/:vehicleId')
  .get(validate(vehicleDocumentValidation.getVehicleDocument), vehicleDocumentController.getVehicleDocument);

router
  .route('/VehicleDocument/create')
  .post(
    auth('VehicleDocument'),
    validate(vehicleDocumentValidation.createVehicleDocument),
    documentModelUpload.single('documentImage'),
    vehicleDocumentController.createVehicleDocument,
  );

router
  .route('/VehicleDocument/update/:vehicleDocumentId')
  .patch(
    auth('VehicleDocument'),
    validate(vehicleDocumentValidation.updateVehicleDocument),
    documentModelUpload.single('documentImage'),
    vehicleDocumentController.updateVehicleDocument,
  );

router
  .route('/updateDocumentStatus/:vehicleDocumentId')
  .patch(
    auth('VehicleDocument'),
    validate(vehicleDocumentValidation.updateVehicleDocumentStatus),
    vehicleDocumentController.updateVehicleDocumentStatus,
  );

router.route('/expired-documents/:vehicleId').get(auth('VehicleDocument'), vehicleDocumentController.getExpiredDocuments);

module.exports = router;
