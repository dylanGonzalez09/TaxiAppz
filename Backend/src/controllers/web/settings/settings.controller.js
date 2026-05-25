const httpStatus = require('http-status');
const catchAsync = require('../../../utils/catchAsync');
const { settingService } = require('../../../services');
const Response = require('../../../config/response');
const { Settings } = require('../../../models');

/**
 * Get all settings list (for web booking - no clientId required)
 * Returns public settings like map API keys
 */
const getSettingsList = catchAsync(async (req, res) => {
  // Get public settings (map keys, etc.) - no clientId filter for web
  const settings = await Settings.find({
    name: {
      $in: [
        'geoCoderApiKey',
        'places_api_key',
        'PLACES_API_KEY',
        'distance_api_key',
        'directional_api_key',
        'GEO_CODER_API_KEY',
      ],
    },
    status: true,
  }).lean();

  const response = Response(true, settings, 'Settings retrieved successfully');
  res.status(httpStatus.OK).send(response);
});

/**
 * Get specific setting by name (e.g., geoCoderApiKey)
 */
const getSettingByName = catchAsync(async (req, res) => {
  const { name } = req.params;

  const setting = await Settings.findOne({
    name: name,
    status: true,
  }).lean();

  if (!setting) {
    const response = Response(false, null, 'Setting not found');
    return res.status(httpStatus.NOT_FOUND).send(response);
  }

  const response = Response(true, setting, 'Setting retrieved successfully');
  res.status(httpStatus.OK).send(response);
});

module.exports = {
  getSettingsList,
  getSettingByName,
};

