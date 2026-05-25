const Joi = require('joi');
const { password, objectId } = require('../../custom.validation');

const createUser = {
  body: Joi.object().keys({
    firstname: Joi.string().required(),
    lastname: Joi.string().required(),
    email: Joi.string().email().optional().allow("", null),
    phone_number: Joi.string().required(),
    gender: Joi.string(),
    roleIds: Joi.array().items(Joi.string().hex().length(24)).required(),
    time_zone: Joi.string().optional(),
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
    language: Joi.string().custom(objectId).optional(),
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
  }),
};

const getUsers = {
  query: Joi.object().keys({
    name: Joi.string(),
    role: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

const getUserByRole = {
  params: Joi.object().keys({
    roleId: Joi.string().custom(objectId),
  }),
};
const getUserByEmail = {
  body: Joi.object().keys({
    email: Joi.string(),
    token: Joi.string().optional()
  }),
};

const updateUser = {
  params: Joi.object().keys({
    userId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
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

const deleteUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createUser,
  getUsers,
  getUser,
  getUserByRole,
  updateUser,
  deleteUser,
  getUserByEmail,
};
