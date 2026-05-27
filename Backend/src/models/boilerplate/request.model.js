const mongoose = require('mongoose');
const { toJSON, paginate } = require('../plugins');

const requestSchema = mongoose.Schema(
  {
    requestNumber: {
      type: String,
      unique: true,
      trim: true,
    },
    requestOtp: {
      type: Number,
      default: 1234,
    },
    isLater: {
      type: Boolean,
      default: false,
    },
    isInstantTrip: {
      type: Boolean,
      default: false,
    },
    ifDispatch: {
      type: Boolean,
      default: false,
    },
    zoneTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ZonePrice',
      default: null,
    },
    zoneSurgeTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ZoneSurgePrice',
      default: null,
    },
    driverVehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver',
      default: null,
    },
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      default: null,
    },
    tripStartTime: {
      type: Date,
      default: null,
    },
    arrivedAt: {
      type: Date,
      default: null,
    },
    acceptedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    isLater: {
      type: Boolean,
      default: false,
    },
    tripTime: {
      type: Number,
      default: null,
    },
    isDriverStarted: {
      type: Boolean,
      default: false,
    },
    isDriverArrived: {
      type: Boolean,
      default: false,
    },
    isTripStart: {
      type: Boolean,
      default: false,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    isCancelled: {
      type: Boolean,
      default: false,
    },
    customReason: {
      type: String,
      default: null,
    },
    reason: {
      type: String,
      default: null,
    },
    cancelMethod: {
      type: String,
      enum: ['Automatic', 'User', 'Driver', 'Dispatcher', ''],
      required: null,
    },
    reasonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'cancellationReason',
      default: null,
    },
    totalDistance: {
      type: Number,
      default: 0.0,
    },
    totalTime: {
      type: Number,
      default: 0.0,
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    userRated: {
      type: Boolean,
      default: false,
    },
    driverRated: {
      type: Boolean,
      default: false,
    },
    timezone: {
      type: Number,
      default: null,
    },
    attemptForSchedule: {
      type: Number,
      default: 0,
    },
    dispatcherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Dispatcher',
      default: null,
    },
    driverNotes: {
      type: String,
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    canceledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    adminDemoKey: {
      type: String,
      default: null,
    },
    estimatedAmount: {
      type: String,
      default: null,
    },
    paymentOpt: {
      type: String,
      enum: ['CARD', 'CASH', 'WALLET'],
      required: true,
    },
    rideType: {
      type: String,
      enum: ['RIDE_NOW', 'RIDE_LATER'],
      required: true,
    },
    unit: {
      type: String,
      default: null,
    },
    requestedCurrencyCode: {
      type: String,
      default: null,
    },
    requestedCurrencySymbol: {
      type: String,
      default: null,
    },
    promoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Promo',
      default: null,
    },
    locationChanged: {
      type: Boolean,
      default: false,
    },
    locationChangeAddress: {
      type: String,
      default: false,
    },
    locationApprove: {
      type: Boolean,
      default: false,
    },
    holdStatus: {
      type: Number,
      default: 0,
    },
    availablesStatus: {
      type: Number,
      default: 0,
    },
    tripType: {
      type: String,
      enum: ['LOCAL', 'RENTAL', 'OUTSTATION'],
      default: null,
    },
    rentalPackage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RentalPackage',
      default: null,
    },
    manualTrip: {
      type: String,
      enum: ['AUTOMATIC', 'MANUAL'],
      default: null,
    },
    outstationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Outstation',
      default: null,
    },
    outstationTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'OutstationType',
      default: null,
    },
    packageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Package',
      default: null,
    },
    packageKm: {
      type: Number,
      required: false,
    },
    packageHr: {
      type: Number,
      required: false,
    },
    bookingFor: {
      type: String,
      enum: ['MYSELF', 'OTHERS'],
      default: null,
    },
    othersUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
    },
    startKm: {
      type: Number,
      required: false,
    },
    startKmImage: {
      type: String,
      required: false,
    },
    endKm: {
      type: Number,
      required: false,
    },
    endKmImage: {
      type: String,
      required: false,
    },
    zoneId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Zone',
      default: null,
    },
    driverCommission: {
      type: Number,
      required: false,
    },
  },
  {
    timestamps: true,
  },
);

// Pre-save hook to generate requestNumber
requestSchema.pre('save', async function () {
  if (this.isNew && !this.requestNumber) {
    let retries = 3;
    while (retries > 0) {
      try {
        const lastRequest = await Request.findOne().sort({ requestNumber: -1 });
        let lastNumber = 0;

        if (lastRequest && lastRequest.requestNumber) {
          const matches = lastRequest.requestNumber.match(/\d+$/);
          lastNumber = matches ? parseInt(matches[0], 10) : 0;
        }

        this.requestNumber = `TAXI_${String(lastNumber + 1).padStart(5, '0')}`;

        // Verify uniqueness
        const exists = await Request.findOne({ requestNumber: this.requestNumber });
        if (!exists) {
          break;
        }
      } catch (err) {
        // Ignore and retry
      }
      retries--;
    }

    // Final fallback if all retries fail
    if (!this.requestNumber) {
      this.requestNumber = `TAXI_${Date.now().toString().slice(-5)}`;
    }
  }
});

requestSchema.plugin(toJSON);
requestSchema.plugin(paginate);

// Indexes for list/sort, filters and aggregations (reports, history, counts). requestNumber index from schema (unique: true)
requestSchema.index({ createdAt: -1 }, { background: true });
requestSchema.index({ clientId: 1, createdAt: -1 }, { background: true });
requestSchema.index({ driverId: 1, createdAt: -1 }, { background: true });
requestSchema.index({ userId: 1, createdAt: -1 }, { background: true });
requestSchema.index({ userId: 1, isCompleted: 1 }, { background: true });
requestSchema.index({ driverId: 1, isCompleted: 1 }, { background: true });
requestSchema.index({ promoId: 1, userId: 1, isCompleted: 1 }, { background: true });
requestSchema.index({ zoneTypeId: 1 }, { background: true });

/**
 * @typedef Request
 */
const Request = mongoose.model('request', requestSchema);

module.exports = Request;
