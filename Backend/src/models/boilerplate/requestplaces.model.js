const mongoose = require('mongoose');
const { toJSON, paginate } = require('./../plugins');

const requestPlaceSchema = mongoose.Schema(
  {
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Request',
    },
    pickLat: {
      type: Number,
      default: null,
    },
    pickLng: {
      type: Number,
      default: null,
    },
    dropLat: {
      type: Number,
      default: null,
    },
    dropLng: {
      type: Number,
      default: null,
    },
    pickAddress: {
      type: String,
      default: null,
    },
    dropAddress: {
      type: String,
      default: null,
    },
    pickUpId: {
      type: String,
      default: null,
    },
    dropId: {
      type: String,
      default: null,
    },
    stopLat: {
      type: Number,
      default: null,
    },
    stopLng: {
      type: Number,
      default: null,
    },
    stopAddress: {
      type: String,
      default: null,
    },
    stopId: {
      type: String,
      default: null,
    },
    vehicleType:{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      default: null,
    },
    requestPath: {
      type: String, // Using String for longtext
      default: null,
    },
    createdAt: {
      type: Date,
      default: null,
    },
    updatedAt: {
      type: Date,
      default: null,
    },
    polyString: {
      type: String, // Using String for longtext
      default: null,
    },
    stops: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

requestPlaceSchema.plugin(toJSON);
requestPlaceSchema.plugin(paginate);

/**
 * @typedef RequestPlace
 */
const RequestPlace = mongoose.model('RequestPlace', requestPlaceSchema);

module.exports = RequestPlace;
