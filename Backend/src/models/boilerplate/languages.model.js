const mongoose = require('mongoose');
const { toJSON, paginate } = require('./../plugins');

const languageSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    code: {
      type: String,
      required: true
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
    },
    status: {
      type: Boolean,
      required: true,
      default: true
    }
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
languageSchema.plugin(toJSON);
languageSchema.plugin(paginate);

/**
 * @typedef Language
 */
const Language = mongoose.model('language', languageSchema);

module.exports = Language;
