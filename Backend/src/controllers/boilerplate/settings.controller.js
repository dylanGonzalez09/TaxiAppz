const httpStatus = require('http-status');
const pick = require('../../utils/pick');
const ApiError = require('../../utils/ApiError');
const catchAsync = require('../../utils/catchAsync');
const { settingService } = require('../../services');
const Response = require('../../config/response');

const createSettings = catchAsync(async (req, res) => {
  const settings = await settingService.createSetting(req.body);
  const response = Response(true, settings, "Success");
  res.status(httpStatus.CREATED).send(response);
});

const getSettings = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await settingService.querySettings(filter, options);
  const response = Response(true, result, "Success");
  res.status(httpStatus.OK).send(response);
});

const getSettingsById = catchAsync(async (req, res) => {
  if (! req.params.settingId) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ClientID not found');
  }
  const setting = await settingService.getSettings( req.params.settingId);
  if (!setting) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Setting not found');
  }
  const response = Response(true, setting, "Success");
  res.status(httpStatus.OK).send(response);
});



const getSetting = catchAsync(async (req, res) => {
  const setting = await settingService.getSettingById(req.params.settingId);
  if (!setting) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Setting not found');
  }
  const response = Response(true, setting, "Success");
  res.status(httpStatus.OK).send(response);
});

const getSettingWithOutPagination = catchAsync(async (req, res) => {

  if (!req.headers.clientid) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ClientID not found');
  }
  const setting = await settingService.getSettings(req.headers.clientid);
  if (!setting) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Setting not found');
  }
  const response = Response(true, setting, "Success");
  res.status(httpStatus.OK).send(response);
});

const updateSetting = catchAsync(async (req, res) => {
  const setting = await settingService.updateSettingsById(req.params.settingId, req.body);
  const response = Response(true, setting, "Success");
  res.status(httpStatus.OK).send(response);
});

const deleteSetting = catchAsync(async (req, res) => {
  const setting = await settingService.deleteSettingsById(req.params.settingId);
  const response = Response(true, setting, "Success");
  res.status(httpStatus.OK).send(response);
});

const bulkInsertSettings = catchAsync(async (req, res) => {

  let clientId;

  if (!req.headers.clientid) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ClientID not found');
  } else {
    clientId = req.headers.clientid;
  }

  const settingsFromBody = req.body;

   if (req.files && req.files.logo) {
    settingsFromBody.logo = req.files.logo[0].filename;
  }
  if (req.files && req.files.feviIcon) {
  settingsFromBody.feviIcon = req.files.feviIcon[0].filename;
  }
  if (req.files && req.files.notificationSound) {
    settingsFromBody.notificationSound = req.files.notificationSound[0].filename;
  }

  if (req.files && req.files.tripSound) {
    settingsFromBody.tripSound = req.files.tripSound[0].filename;
  }

  const typeValue = settingsFromBody.type;

  const { type, ...settingsWithoutType } = settingsFromBody;
  const formattedSettings = Object.fromEntries(
    Object.entries(settingsWithoutType).map(([key, value]) => [key, String(value)])
  );

  const settingsBody = Object.entries(formattedSettings).map(([key, value]) => {
    return {
        name: key,
        value: (key === 'logo' && req.files.logo) ? req.files.logo[0].filename :
              (key === 'feviIcon' && req.files.feviIcon) ? req.files.feviIcon[0].filename :
              (key === 'notificationSound' && req.files.notificationSound) ? req.files.notificationSound[0].filename :
               (key === 'tripSound' && req.files.tripSound) ? req.files.tripSound[0].filename :
               value, // Fallback to the provided value
        status: true,
        type: typeValue,
        clientId: clientId
    };
})

  const settings = await settingService.bulkInsertSettings(settingsBody);
  const response = Response(true, settings, "Success");
  res.status(httpStatus.CREATED).send(response);
});

const bulkUpdateSettings = catchAsync(async (req, res) => {
  let clientId;

  if (!req.headers.clientid) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ClientID not found');
  } else {
    clientId = req.headers.clientid;
  }

  const settingsFromBody = req.body;

  // Process files if they exist
  if (req.files) {
    if (req.files.logo) {
      settingsFromBody.logo = req.files.logo[0].filename;
    }
    if (req.files.feviIcon) {
      settingsFromBody.feviIcon = req.files.feviIcon[0].filename;
      }
    if (req.files.notificationSound) {
      settingsFromBody.notificationSound = req.files.notificationSound[0].filename;
    }

    if (req.files.tripSound) {
      settingsFromBody.tripSound = req.files.tripSound[0].filename;
    }
  }

  // Extract type and remove it from the settings data
  const typeValue = settingsFromBody.type;
  const { type, ...settingsWithoutType } = settingsFromBody;

  // Format settings data to ensure all values are strings
  const formattedSettings = Object.fromEntries(
    Object.entries(settingsWithoutType).map(([key, value]) => [key, String(value)])
  );

  // Prepare the update data
  const settingsBody = Object.entries(formattedSettings).map(([key, value]) => {
    return {
      name: key,
      value: (key === 'logo' && req.files.logo) ? req.files.logo[0].filename :
             (key === 'feviIcon' && req.files.feviIcon) ? req.files.feviIcon[0].filename :
             (key === 'notificationSound' && req.files.notificationSound) ? req.files.notificationSound[0].filename :
             (key === 'tripSound' && req.files.tripSound) ? req.files.tripSound[0].filename :
             value, // Fallback to the provided value
      status: true,
      type: typeValue,
      clientId: clientId
    };
  });

  // Perform the bulk update
  const settings = await settingService.bulkUpdateSettings(settingsBody);
  const response = Response(true, settings, "Success");
  res.status(httpStatus.OK).send(response);
});


const getSettingApi = catchAsync(async (req, res) => {

  if (!req.headers.clientid) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ClientID not found');
  }
  const setting = await settingService.getSettingsApi(req.headers.clientid);
  if (!setting) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Setting not found');
  }
  const response = Response(true, setting, "Success");
  res.status(httpStatus.OK).send(response);
});

const getDefaultLanguage = catchAsync(async(req,res) => {
  const defaultLanguage = await settingService.getDefaultLanguage(req);
  const response = Response(true, defaultLanguage, "Success");
  res.status(httpStatus.OK).send(response);
});

module.exports = {
  createSettings,
  getSettings,
  getSetting,
  getSettingWithOutPagination,
  updateSetting,
  deleteSetting,
  bulkInsertSettings,
  bulkUpdateSettings,
  getSettingApi,
  getSettingsById,
  getDefaultLanguage
};
