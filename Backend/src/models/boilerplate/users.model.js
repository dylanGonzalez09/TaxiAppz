const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const { toJSON, paginate } = require('../plugins');

const usersSchema = mongoose.Schema(
  {
    firstname: {
      type: String,
      required: true,
      trim: true,
    },
    lastname: {
      type: String,
      required: false,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
      validate(value) {
        if (value && !validator.isEmail(value)) {
          throw new Error('Invalid email');
        }
      },
    },
    phone_number: {
      type: String,
      required: true,
      trim: true,
    },
    gender: {
      type: String,
      trim: true,
      default: null,
    },
    time_zone: {
      type: String,
      required: false,
      trim: true,
    },
    user_type: {
      type: String,
      trim: true,
      default: null,
    },
    roleIds: [
      {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Role',
        required: true,
      },
    ],
    deviceInfoHash: {
      type: String,
      trim: true,
      default: null,
    },
    deviceType: {
      type: String,
      trim: true,
      default: null,
    },
    isPrimary: {
      type: String,
      trim: true,
      default: null,
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 8,
      validate(value) {
        if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
          throw new Error('Password must contain at least one letter and one number');
        }
      },
      private: true, // used by the toJSON plugin
    },
    avatar: {
      type: String,
      trim: true,
      default: null,
    },
    active: {
      type: Boolean,
      default: true,
    },
    last_seen: {
      type: Date,
      default: null,
    },
    social_unique_id: {
      type: String,
      trim: true,
      default: null,
    },
    mobile_application_type: {
      type: String,
      enum: ['ANDROID', 'IOS'],
      default: 'ANDROID',
    },
    token: {
      type: String,
      trim: true,
      default: null,
    },
    country_code: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Country',
      default: null,
    },
    countryCode: {
      type: String,
      trim: true,
      default: null,
    },
    remember_token: {
      type: String,
      trim: true,
      default: null,
    },
    profile_pic: {
      type: String,
      trim: true,
      default: null,
    },
    referral_code: {
      type: String,
      trim: true,
      default: null,
    },
    online_by: {
      type: Number,
      default: 0,
    },
    block_reson: {
      type: String,
      trim: true,
      default: null,
    },
    language: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'language',
      required: false,
    },
    address: {
      type: String,
      trim: true,
      default: null,
    },
    emergency_number: {
      type: String,
      trim: true,
      default: null,
    },
    user_referral_code: {
      type: String,
      trim: true,
      default: null,
    },
    otp: {
      type: String,
      trim: true,
      default: null,
    },
    demo_key: {
      type: String,
      trim: true,
      default: null,
    },

    isDemo: {
      type: Boolean,
      default: false,
    },
    country: {
      type: String,
      trim: true,
      default: null,
    },
    trips_count: {
      type: Number,
      default: 0,
    },
    otp_expires_at: {
      type: Date,
      default: null,
    },
    created_by: {
      type: Number,
      default: null,
    },
    admin_demo_key: {
      type: String,
      trim: true,
      default: null,
    },
    rating: {
      type: Number,
      default: 5,
    },
    others_user_id: {
      type: Number,
      default: null,
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
    },
    zoneId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Zone',
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// add plugin that converts mongoose to json
usersSchema.plugin(toJSON);
usersSchema.plugin(paginate);

// Indexes for auth and list (findOne by phone, filter by roleIds/clientId). email index from schema (unique: true)
usersSchema.index({ phone_number: 1 }, { background: true });
usersSchema.index({ roleIds: 1 }, { background: true });
usersSchema.index({ clientId: 1 }, { background: true });

/**
 * Check if email is taken
 * @param {string} email - The user's email
 * @param {ObjectId} [excludeUserId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
usersSchema.statics.isEmailTaken = async function (email, excludeUserId) {
  const user = await this.findOne({ email, _id: { $ne: excludeUserId } });
  return !!user;
};

/**
 * Check if email is taken
 * @param {string} phoneNumber - The user's email
 * @param {ObjectId} [excludeUserId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
usersSchema.statics.isPhoneNoTaken = async function (phoneNumber, excludeUserId) {
  const user = await this.findOne({ phoneNumber, _id: { $ne: excludeUserId } });
  return !!user;
};

// /**
//  * Check if phone number is taken and matches specified role(s)
//  * @param {string} phoneNumber - The user's phone number
//  * @param {ObjectId} [excludeUserId] - The ID of the user to be excluded
//  * @param {ObjectId[]} [roleIds] - Array of role IDs to check against
//  * @returns {Promise<boolean>}
//  */
// usersSchema.statics.isPhoneNoWithRoleTaken = async function (phoneNumber, excludeUserId, roleIds) {
//   const query = {
//     phoneNumber,
//     _id: { $ne: excludeUserId },
//   };

//   if (roleIds && roleIds.length > 0) {
//     query.roleIds = { $in: roleIds }; // Match any of the specified role IDs
//   }

//   const user = await this.findOne(query);
//   return !!user;
// };

// /**
//  * Check if email is taken
//  * @param {string} email - The user's email
//  * @param {ObjectId} [excludeUserId] - The id of the user to be excluded
//  * @param {ObjectId[]} [roleIds] - Array of role IDs to check against
//  * @returns {Promise<boolean>}
//  */
// /**
//  * Check if email is taken and matches specified role(s)
//  * @param {string} email - The user's email
//  * @param {ObjectId} [excludeUserId] - The ID of the user to be excluded
//  * @param {ObjectId[]} [roleIds] - Array of role IDs to check against
//  * @returns {Promise<boolean>}
//  */
// usersSchema.statics.isEmailRoleTaken = async function (email, excludeUserId, roleIds) {
//   const query = {
//     email,
//     _id: { $ne: excludeUserId },
//   };

//   if (roleIds && roleIds.length > 0) {
//     query.roleIds = { $in: roleIds }; // Match any of the specified role IDs
//   }

//   const user = await this.findOne(query);
//   return !!user;
// };

/**
 * Check if password matches the user's password
 * @param {string} password
 * @returns {Promise<boolean>}
 */
usersSchema.methods.isPasswordMatch = async function (password) {
  const user = this;
  return bcrypt.compare(password, user.password);
};

usersSchema.pre('save', async function () {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.Password, 8);
  }
});

/**
 * @typedef Users
 */
const Users = mongoose.model('Users', usersSchema);

module.exports = Users;
