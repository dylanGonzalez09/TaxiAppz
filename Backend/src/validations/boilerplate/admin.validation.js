const Joi = require('joi');
const { password, objectId } = require('../custom.validation');

const createAdmin = {
  body: Joi.object().keys({
    slug: Joi.string().required(),
    firstname: Joi.string().required(),
    lastname: Joi.string().required(),
    email: Joi.string().email().required(),
    phone_number: Joi.string().required(),
    gender: Joi.string(),
    roleIds: Joi.array().items(Joi.string().hex().length(24)).required(),
    time_zone: Joi.string().required(),
    user_type: Joi.string(),
    device_info_hash: Joi.string(),
    password: Joi.string().required().custom(password),
    avatar: Joi.string(),
    active: Joi.boolean(),
    last_seen: Joi.date(),
    social_unique_id: Joi.string(),
    mobile_application_type: Joi.string().valid('ANDROID', 'IOS'),
    token: Joi.string(),

    country_code: Joi.string().custom(objectId),
    remember_token: Joi.string(),
    profile_pic: Joi.string(),
    referral_code: Joi.string(),
    online_by: Joi.number().integer(),
    block_reson: Joi.string(),
    language: Joi.string().default('en'),
    address: Joi.string(),
    emergency_number: Joi.string(),
    user_referral_code: Joi.string(),
    otp: Joi.string(),
    demo_key: Joi.string(),
    country: Joi.string(),
    trips_count: Joi.number().integer(),
    otp_expires_at: Joi.date(),
    created_by: Joi.number().integer(),
    admin_demo_key: Joi.string(),
    rating: Joi.number().integer(),
    clientId: Joi.string().custom(objectId).optional(),
    others_user_id: Joi.number().integer(),
  }),
};

const getAdmins = {
  query: Joi.object().keys({
    name: Joi.string(),
    role: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getAdmin = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

const getAdminByRole = {
  params: Joi.object().keys({
    roleId: Joi.string().custom(objectId),
  }),
};

const updateAdmin = {
  params: Joi.object().keys({
    userId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      slug: Joi.string(),
      firstname: Joi.string(),
      lastname: Joi.string(),
      email: Joi.string().email(),
      phone_number: Joi.string(),
      gender: Joi.string(),
      time_zone: Joi.string(),
      user_type: Joi.string(),
      roleIds: Joi.array().items(Joi.string().hex().length(24)).required(),
      device_info_hash: Joi.string(),
      password: Joi.string().custom(password),
      avatar: Joi.string(),
      active: Joi.boolean(),
      last_seen: Joi.date(),
      social_unique_id: Joi.string(),
      mobile_application_type: Joi.string().valid('ANDROID', 'IOS'),
      token: Joi.string(),
      country_code: Joi.string().custom(objectId),
      remember_token: Joi.string(),
      profile_pic: Joi.string(),
      referral_code: Joi.string(),
      online_by: Joi.number().integer(),
      block_reson: Joi.string(),
      language: Joi.string().default('en'),
      address: Joi.string(),
      emergency_number: Joi.string(),
      user_referral_code: Joi.string(),
      otp: Joi.string(),
      demo_key: Joi.string(),
      country: Joi.string(),
      trips_count: Joi.number().integer(),
      otp_expires_at: Joi.date(),
      created_by: Joi.number().integer(),
      admin_demo_key: Joi.string(),
      rating: Joi.number().integer(),
      others_user_id: Joi.number().integer(),
    })
    .min(1),
};

const deleteAdmin = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createAdmin,
  getAdmins,
  getAdmin,
  getAdminByRole,
  updateAdmin,
  deleteAdmin,
};
