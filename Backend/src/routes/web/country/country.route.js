const express = require('express');
const countryController = require('../../../controllers/boilerplate/country.controller');

const router = express.Router();

// Web-specific country routes (separate from mobile API routes)
// These routes are for web booking system only

// Get list of countries (no auth required, public endpoint for web)
router.get('/list', countryController.getCountries);

module.exports = router;

