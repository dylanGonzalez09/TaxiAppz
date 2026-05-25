const express = require('express');
const router = express.Router();
const driverLocationController = require('../../../controllers/api/auth/driver_location.controller');

// Routes
router.get('/:lat/:lng/:vehicle_type/:radius', driverLocationController.queryGeoLocation);
router.get('/get-drivers', driverLocationController.queryGetDrivers);
router.get('/drivers-logout/:lat/:lng/:radius', driverLocationController.queryGetDriversLogout);
router.get('/get-drivers-not-updated/:lat/:lng/:radius', driverLocationController.queryGetDriversNotUpdated);

module.exports = router;
