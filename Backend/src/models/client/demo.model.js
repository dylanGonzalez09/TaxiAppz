const mongoose = require('mongoose');
const { toJSON, paginate } = require('../plugins');

const demoSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
    },
    Name: {
      type: String,
      required: true,
    },
    subScriptionId: {
      type: mongoose.Schema.Types.Mixed,
      ref: 'SubScription',
      required: false,
    },
    demoCode: {
      type: String,
      required: false,
    },
    demoKey: {
      type: String,
      required: false,
    },
    demo: {
      type: Boolean,
      required: false,
    },
    Startdate: {
      type: Date,
      required: true,
    },
    Enddate: {
      type: Date,
      required: true,
    },
    noOfDrivers: {
      type: Number,
      required: false,
    },
    noOfUsers: {
      type: Number,
      required: false,
    },
    features: {
      type: String,
      required: false,
    },
    taxiModules: {
      type: String,
      required: false,
    },

    status: {
      type: Boolean,
      required: true,
      default: true,
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

demoSchema.plugin(toJSON);
demoSchema.plugin(paginate);

/**
 * @typedef Demo
 */
const Demo = mongoose.model('Demo', demoSchema);

module.exports = Demo;
