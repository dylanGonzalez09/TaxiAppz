const express = require('express');
const webPromoController = require('../../../controllers/web/promo/promo.controller');

const router = express.Router();

// Web-specific promo code routes (no clientId required - platform-wide)
// These routes are for web booking system only

// Get list of active promo codes for web booking
router.get('/list', webPromoController.getPromoCodesList);

module.exports = router;

