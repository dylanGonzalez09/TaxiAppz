const mongoose = require('mongoose');
const { toJSON, paginate } = require('../plugins');

const countrySchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    dial_code: {
      type: String,
    },
    code: {
      type: String,
    },
    currency_name: {
      type: String,
    },
    currency_code: {
      type: String,
    },
    currency_symbol: {
      type: String,
    },
    status: {
      type: Boolean,
      default: false,
    },
    capital: {
      type: String,
    },
    citizenship: {
      type: String,
    },
    country_code: {
      type: String,
    },
    currency: {
      type: String,
    },
    currency_sub_unit: {
      type: String,
    },
    full_name: {
      type: String,
    },
    iso_3166_3: {
      type: String,
    },
    region_code: {
      type: String,
    },
    sub_region_code: {
      type: String,
    },
    eea: {
      type: String,
    },
    currency_decimals: {
      type: String,
    },
    flag: {
      type: String,
    },
    flag_base_64: {
      type: String,
    },
    time_zone: {
      type: String,
    },
    phoneLength: {
      type: String,
    },
    gmt_offset: {
      type: String,
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
    },
  },
  {
    timestamps: true,
  },
);

// add plugins for toJSON and pagination
countrySchema.plugin(toJSON);
countrySchema.plugin(paginate);

/**
 * @typedef Country
 */
const Country = mongoose.model('Country', countrySchema);

module.exports = Country;
