const mongoose = require('mongoose');
const { toJSON, paginate } = require('../plugins');

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
      type: [
        {
          _id: false,
          status: {
            type: Boolean,
            required: true,
          },
          id: {
            type: String,
            required: true,
          },
          question: {
            type: String,
            required: true,
          },
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

requestRatingSchema.index(
  { userId: 1, requestId: 1 },
  { unique: true }
);

requestRatingSchema.plugin(toJSON);
requestRatingSchema.plugin(paginate);


/**
 * @typedef RequestRating
 */
const RequestRating = mongoose.model('RequestRating', requestRatingSchema);

module.exports = RequestRating;
