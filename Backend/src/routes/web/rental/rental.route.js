const express = require('express');
const webRentalController = require('../../../controllers/web/rental/rental.controller');

const router = express.Router();

router.post('/allPackages', webRentalController.allPackages);

module.exports = router;
