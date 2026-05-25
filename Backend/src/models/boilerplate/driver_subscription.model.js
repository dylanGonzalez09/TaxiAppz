const mongoose = require('mongoose');
const { toJSON, paginate } = require('./../plugins');

const driverSubscriptionSchema = mongoose.Schema(
  {
    driverId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Driver',
      required: true,
    },
    subScriptionId: {
      type: mongoose.SchemaTypes.ObjectId, 
      ref: 'SubScription',
      required: false,
    },
    Startdate: {
      type: Date,
      required: true
    },
    Enddate: {
      type: Date,
      required: true
    },
    status: {
      type: Boolean,
      required: true,
      default: true
    },
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
    },
  },
  {
    timestamps: true,
  }
);

driverSubscriptionSchema.plugin(toJSON);
driverSubscriptionSchema.plugin(paginate);

/**
 * @typedef DriverSubscription
 */
const DriverSubscription = mongoose.model('DriverSubscription', driverSubscriptionSchema);

module.exports = DriverSubscription;
