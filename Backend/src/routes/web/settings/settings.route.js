const express = require('express');
const webSettingsController = require('../../../controllers/web/settings/settings.controller');

const router = express.Router();

// Web-specific settings routes (no clientId required - platform-wide)
// These routes are for web booking system only

// Get settings list (for map API key, etc.) - no auth required for public settings
router.get('/list', webSettingsController.getSettingsList);

// Get specific setting by name (e.g., geoCoderApiKey)
router.get('/:name', webSettingsController.getSettingByName);

module.exports = router;

