const express = require('express');
const auth = require('../../../middlewares/auth');
const validate = require('../../../middlewares/validate');
const driverValidation = require('../../../validations/web/driver/driver.validation');
const driverDocumentValidation = require('../../../validations/web/driver/driver_document.validation');
const authValidation = require('../../../validations/api/auth/auth.validation');
const driverController = require('../../../controllers/web/driver/driver.controller');
const driverDocumentController = require('../../../controllers/web/driver/driver_document.controller');
const authController = require('../../../controllers/api/auth/auth.controller');
const { documentModelUpload } = require('../../../middlewares/upload');

const router = express.Router();

// Web-specific driver routes (no clientId in header - derived from zone)

// Public - OTP flow (reuse existing auth controller)
router.post('/login', validate(authValidation.login), authController.otpSent);
router.post('/verify', validate(authValidation.verify), authController.verify);

// Public - Driver registration form data
router.get('/zones', driverController.getZonesForDriver);
router.get('/zones/secondary/:primaryZoneId', driverController.getSecondaryZonesByPrimary);
router.get('/service-types', driverController.getServiceTypes);
router.get('/documents/by-zone/:zoneId', driverController.getDocumentsByZone);
router.get('/categories', driverController.getCategoriesWithoutPagination);
router.get('/vehicles/:zoneId', driverController.getVehiclesByZoneWithoutPagination);
router.get('/vehicle-models', driverController.getVehicleModelWithoutPagination); // ?zoneId=...&vehicleId=...

// Public - Create driver (clientId from zone in body)
router.post('/create', validate(driverValidation.createWebDriver), driverController.createWebDriver);

// Protected - Document upload (driver token required)
// Multer must run before validate so req.body is parsed from multipart
router
  .route('/document/upload')
  .post(
    auth('DriverDocument'),
    documentModelUpload.single('documentImage'),
    validate(driverDocumentValidation.uploadDriverDocument),
    driverDocumentController.uploadWebDriverDocument
  );
router.route('/document/list').get(auth('DriverDocument'), driverDocumentController.getWebDriverDocuments);
router
  .route('/document/details')
  .patch(
    auth('DriverDocument'),
    validate(driverDocumentValidation.updateDocumentDetails),
    driverDocumentController.updateDocumentDetails
  );

module.exports = router;
