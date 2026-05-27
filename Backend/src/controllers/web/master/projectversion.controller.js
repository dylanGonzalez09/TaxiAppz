const httpStatus = require('../../../config/httpStatus');
const pick = require('../../../utils/pick');
const ApiError = require('../../../utils/ApiError');
const catchAsync = require('../../../utils/catchAsync');
const { versionService, countryService, languagesService, settingService } = require('../../../services');
const settingType = require('../../../config/string');

const Response = require('../../../config/response');

const createVersion = catchAsync(async (req, res) => {
  let clientId;

  if (!req.headers.clientid) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ClientID not found');
  } else {
    clientId = req.headers.clientid;
    req.body.clientId = clientId;
  }
  const version = await versionService.createVersion(req.body);
  const response = Response(true, version, 'Success');
  res.status(httpStatus.CREATED).send(response);
});

const getVersions = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['applicationType', 'versionCode', 'versionNumber', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page'], { allowDiskUse: true });
  if (req.query.search) {
    filter.$or = [
      { applicationType: { $regex: req.query.search, $options: 'i' } },
      { versionCode: { $regex: req.query.search, $options: 'i' } },
      { versionNumber: { $regex: req.query.search, $options: 'i' } },
    ];
  }
  const result = await versionService.queryVersions(filter, options);
  const response = Response(true, result, 'Success');
  res.status(httpStatus.OK).send(response);
});

const getVersion = catchAsync(async (req, res) => {
  const version = await versionService.getVersionsById(req.params.versionId);
  if (!version) {
    throw new ApiError(httpStatus.NOT_FOUND, 'version not found');
  }
  const response = Response(true, version, 'Success');
  res.status(httpStatus.OK).send(response);
});

const getVersionCode = catchAsync(async (req, res) => {
  const version = await versionService.getVersionsByCode(req.params.versionCode);
  if (!version) {
    throw new ApiError(httpStatus.NOT_FOUND, 'version not found');
  }

  // Version is considered "open" only when status is true
  if (version.status !== true) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Please Update Your Application');
  }

  const language = await languagesService.getIntroLanguage();
  const countries = await countryService.getCountrys();
  const settings = await settingService.getSettings();

  const s3_bucket_name = settings.find((item) => item.name === 's3_bucket_name');
  const s3_bucket_key_id = settings.find((item) => item.name === 's3_bucket_key_id');
  const s3_bucket_secrete_access_key = settings.find((item) => item.name === 's3_bucket_secret_access_key');
  const s3_bucket_default_region_key = settings.find((item) => item.name === 's3_bucket_default_region');
  const places_api_key = settings.find((item) => item.name === 'places_api_key');
  const distance_api_key = settings.find((item) => item.name === 'distance_api_key');
  const geo_coder_api_key = settings.find((item) => item.name === 'geo_coder_api_key');
  const directional_api_key = settings.find((item) => item.name === 'directional_api_key');
  const ios_places_api_key = settings.find((item) => item.name === 'ios_places_api_key');
  const ios_distance_api_key = settings.find((item) => item.name === 'ios_distance_api_key');
  const ios_geo_coder_api_key = settings.find((item) => item.name === 'ios_geo_coder_api_key');
  const ios_directional_api_key = settings.find((item) => item.name === 'ios_directional_api_key');
  const firebase_db_url = settings.find((item) => item.name === 'firebase_db_url');

  const data = {
    language,
    country: countries,
    // s3_bucket_name:s3_bucket_name.value,
    // s3_bucket_key_id:s3_bucket_key_id.value,
    // s3_bucket_secrete_access_key:s3_bucket_secrete_access_key.value,
    // places_api_key:places_api_key.value,
    // distance_api_key:distance_api_key.value,
    // geo_coder_api_key:geo_coder_api_key.value,
    // directional_api_key:directional_api_key.value,
    // ios_places_api_key:ios_places_api_key.value,
    // ios_distance_api_key:ios_distance_api_key.value,
    // ios_geo_coder_api_key:ios_geo_coder_api_key.value,
    // ios_directional_api_key:ios_directional_api_key.value,
    // firebase_db_url:firebase_db_url.value
  };
  const response = Response(true, data, 'Success');
  res.status(httpStatus.OK).send(response);
});

const getVersionWithOutPagination = catchAsync(async (req, res) => {
  const version = await versionService.getVersions();
  if (!version) {
    throw new ApiError(httpStatus.NOT_FOUND, 'version not found');
  }
  const response = Response(true, version, 'Success');
  res.status(httpStatus.OK).send(response);
});

const updateVersion = catchAsync(async (req, res) => {
  const version = await versionService.updateVersionById(req.params.versionId, req.body);
  const response = Response(true, version, 'Success');
  res.status(httpStatus.OK).send(response);
});

const deleteVersion = catchAsync(async (req, res) => {
  const version = await versionService.deleteVersionById(req.params.versionId);
  const response = Response(true, version, 'Success');
  res.status(httpStatus.OK).send(response);
});

const updateVersionStatus = catchAsync(async (req, res) => {
  const { versionId } = req.params;
  const { status } = req.body;

  const version = await versionService.updateVersionById(versionId, { status });

  if (!version) {
    throw new ApiError(httpStatus.NOT_FOUND, 'version not found');
  }

  const response = Response(true, version, 'version status updated successfully');
  res.status(httpStatus.OK).send(response);
});
module.exports = {
  createVersion,
  getVersions,
  getVersion,
  getVersionWithOutPagination,
  updateVersion,
  deleteVersion,
  getVersionCode,
  updateVersionStatus,
};
