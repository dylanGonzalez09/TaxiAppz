const dotenv = require('dotenv');


const settingType = {
    S3_BUCKET_NAME : 's3_bucket_name',
    S3_BUCKET_KEY_ID : 's3_bucket_key_id',
    S3_BUCKET_SECRETE_ACCESS_KEY : 's3_bucket_secret_access_key',
    S3_BUCKET_DEFAULT_REGION: 's3_bucket_default_region',
    PLACES_API_KEY: 'places_api_key',
    DISTANCE_API_KEY: 'distance_api_key',
    GEO_CODER_API_KEY: 'geo_coder_api_key',
    DIRECTIONAL_API_KEY: 'directional_api_key',
    IOS_PLACES_API_KEY: 'ios_places_api_key',
    IOS_DISTANCE_API_KEY: 'ios_distance_api_key',
    IOS_GEO_CODER_API_KEY: 'ios_geo_coder_api_key',
    IOS_DIRECTION_API_KEY: 'ios_directional_api_key',
    FIREBASE_DB_URL: 'firebase_db_url'
  };

  const baseMqttConfig  = {
    //receive mqtt
    DRIVER_LOCATION_UPDATE: 'driver/locationUpdate',
    USER_LISTEN_DRIVER: 'user/listenDriver',
    USER_POST_ALL_DRIVERS: 'user/postAllDrivers',
    USER_POST_VEHICLE_DRIVER: 'user/postVehicle/driver',
    WEB_POST_ALL_ZONE_DRIVERS: 'web/postAllZoneDrivers',
    WEB_GET_ALL_ZONE_DRIVERS: 'web/getAllZoneDrivers',
    USER_POST_TRIP_DRIVER: 'user/postTripDriver',
    POST_TRIP_DETAILS: 'post/tripDetails',
    POST_TRIP_WAITING_TIME: 'post/trip/waitingTime',
    USER_REQUEST_PICKUP: 'user/request/pickup',
    USER_REQUEST_DROP: 'user/request/drop',
    USER_REQUEST_STOP: 'user/request/stop',

    //sent mqtt

    USER_GET_ALL_DRIVERS:'user/getAllDrivers/',
    USER_GET_VEHICLE_DRIVERS:'user/getVehicle/driver/',
    DRIVER_REQUEST:'driver/request/',
    USER_REQUEST:'user/request/',
    USER_GET_TRIP_DRIVER:'user/getTripDriver/',
    GET_TRIP_DETAILS:'get/tripDetails/',
    GET_TRIP_WAITING_TIME:'get/trip/waitingTime/',
    DRIVER_DETAIL:'driver/detail/',
    CHAT_RECEIVE: 'chat/',
};

// Function to add prefix to all MQTT topics
function addMqttPrefix(config, prefix = process.env.MQTT_HEADER+'/') {
  const prefixedConfig = {};
  for (const [key, value] of Object.entries(config)) {
      prefixedConfig[key] = prefix + value;
  }
  return prefixedConfig;
}

// Create the prefixed configuration
const mqttConfig = addMqttPrefix(baseMqttConfig);




const smsMessage = {
  OTP_VERIFICATION_MESSAGE : 'This is a confirmation code from 24/7 Taxi Iceland. Please add this code into the taxi app.  Your OTP code is: ',
};


  module.exports = {
    settingType,
    mqttConfig,
    baseMqttConfig,
    smsMessage
  };
