const mongoose = require('mongoose');
const { toJSON, paginate } = require('../plugins');

const introSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: false,
    },
    description: {
      type: String,
      required: false,
    },
    type: {
      type: String,
      required: false,
    },
    image: {
      type: String,
      required: true,
    },
    status: {
      type: Boolean,
      required: false,
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

// add plugin that converts mongoose to json
introSchema.plugin(toJSON);
introSchema.plugin(paginate);

/**
 * @typedef IntroImage
 */
const IntroImage = mongoose.model('IntroImage', introSchema);

module.exports = IntroImage;
