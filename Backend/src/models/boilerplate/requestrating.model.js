const mongoose = require('mongoose');
const { toJSON, paginate } = require('./../plugins');

const requestRatingSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Request',
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
    },
    rating: {
      type: Number,
      required: true,
    },
    feedback: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

requestRatingSchema.plugin(toJSON);
requestRatingSchema.plugin(paginate);

/**
 * @typedef RequestRating
 */
const RequestRating = mongoose.model('RequestRating', requestRatingSchema);

module.exports = RequestRating;
