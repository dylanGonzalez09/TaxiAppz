const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const { toJSON, paginate } = require('./plugins');
const { required } = require('joi');

const userSchema = mongoose.Schema(
  {
    firstName: {
      type: String,
      required: false,
      trim: true,
    },
    lastName: {
      type: String,
      required: false,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      unique: true,
      sparse: true, // Ensures the email can be null
      validate(value) {
        if (value && !validator.isEmail(value)) {
          throw new Error('Invalid email');
        }
      },
    },
    phoneNumber: {
      type: String,
      required: true,
      unique: false
    },
    gender: {
      type: String,
      trim: true,
      default: null,
    },
    timeZone: {
      type: String,
      trim: true,
      required: false,
    },
    userType: {
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
    country: {
      type: String,
      trim: true,
      default: null,
    },
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
      trim: true,
      private: true,
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
    lastSeen: {
      type: Date,
      default: null,
    },
    socialUniqueId: {
      type: String,
      trim: true,
      default: null,
    },
    mobileApplicationType: {
      type: String,
      enum: ['ANDROID', 'IOS'],
      default: 'ANDROID',
    },
    token: {
      type: String,
      trim: true,
      default: null,
    },
    countryCode: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Country',
      default: null,
    },
    rememberToken: {
      type: String,
      trim: true,
      default: null,
    },
    profilePic: {
      type: String,
      trim: true,
      default: null,
    },
    referralCode: {
      type: String,
      trim: true,
    },
    onlineBy: {
      type: Number,
      default: 0,
    },
    blockReson: {
      type: String,
      trim: true,
      default: null,
    },
    language: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'language',
      required:false
    },
    address: {
      type: String,
      trim: true,
      default: null,
    },
    emergencyNumber: {
      type: String,
      trim: true,
      default: null,
    },
    otp: {
      type: String,
      trim: true,
      default: null,
    },
    demoKey: {
      type: String,
      trim: true,
      default: null,
    },
    tripsCount: {
      type: Number,
      default: 0,
    },
    otpExpiresAt: {
      type: Date,
      default: null,
    },
    createdBy: {
      type: Number,
      default: null,
    },
    adminDemoKey: {
      type: String,
      trim: true,
      default: null,
    },
    rating: {
      type: Number,
      default: 5,
    },
    othersUserId: {
      type: Number,
      default: null,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref:'Company',
      default: null,
    },
    zoneId:{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Zone',
      default: null
    }
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
userSchema.plugin(toJSON);
userSchema.plugin(paginate);

/**
 * Check if email is taken
 * @param {string} email - The user's email
 * @param {ObjectId} [excludeUserId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
userSchema.statics.isEmailTaken = async function (email, excludeUserId) {
  const user = await this.findOne({ email, _id: { $ne: excludeUserId } });
  return !!user;
};

/**
 * Check if email is taken
 * @param {string} phoneNumber - The user's email
 * @param {ObjectId} [excludeUserId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
userSchema.statics.isPhoneNoTaken = async function (phoneNumber, excludeUserId) {
  const user = await this.findOne({ phoneNumber, _id: { $ne: excludeUserId } });
  return !!user;
};


/**
 * Check if password matches the user's password
 * @param {string} password
 * @returns {Promise<boolean>}
 */
userSchema.methods.isPasswordMatch = async function (password) {
  const user = this;
  return bcrypt.compare(password, user.password);
};

userSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

/**
 * @typedef User
 */
const User = mongoose.model('User', userSchema);

module.exports = User;
