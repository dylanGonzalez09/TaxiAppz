const mongoose = require('mongoose');
const { toJSON, paginate } = require('./../plugins');

const clientSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
    },
    Name: {
      type: String,
      required: true
    },
    subScriptionId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'SubScription',
      required: true,
    },
    clientCode: {
      type: String,
      required: true
    },
    Startdate: {
      type: Date,
      required: true
    },
    Enddate: {
      type: Date,
      required: true
    },
    noOfDrivers: {
      type: Number,
      required: true
    },
    noOfUsers: {
      type: Number,
      required: true
    },
    features: {
      type: String,
      required: true
    },
    taxiModules: {
      type: String,
      required: true
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

clientSchema.plugin(toJSON);
clientSchema.plugin(paginate);

/**
 * @typedef Client
 */
const Client = mongoose.model('Client', clientSchema);

module.exports = Client;
