const mongoose = require('mongoose');
const { toJSON, paginate } = require('../plugins');
const Counter = require('./counter.model');

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
      default: null
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
      required: false
    },
    packageHr: {
      type: Number,
      required: false
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
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      default: null,
    },
    startKm:{
      type: Number,
      required: false
    },
    startKmImage:{
      type: String,
      required: false
    },
    endKm:{
      type: Number,
      required: false
    },
    endKmImage:{
      type: String,
      required: false
    },
    zoneId:{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Zone',
      default: null
    },
    etaAmount: {
      type: Number,
      default: 0.0,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to generate requestNumber
requestSchema.pre('save', async function (next) {
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
  next();
});

// Performance indexes
requestSchema.index({ requestNumber: 1 }, { unique: true });
requestSchema.index({ userId: 1, createdAt: -1 });
requestSchema.index({ driverId: 1, isCompleted: 1 });
requestSchema.index({ tripType: 1, isCompleted: 1 });

/**
 * Generate unique request number atomically
 * Format: TAXI_YYYYMMDD_HHMMSS_XXXXX
 */
// requestSchema.statics.generateRequestNumber = async function() {
//   const now = new Date();
//   const dateStr = now.toISOString().slice(2, 10).replace(/-/g, ''); // 250725
//   const counterId = `taxi_${dateStr}`;
  
//   try {
//     const counter = await Counter.findOneAndUpdate(
//       { _id: counterId },
//       { 
//         $inc: { sequence: 1 },
//         $set: { lastReset: now }
//       },
//       { 
//         new: true, 
//         upsert: true,
//         setDefaultsOnInsert: true 
//       }
//     );
    
//     // Convert to base36 and pad: TX250725A1, TX250725A2, etc.
//     const sequenceBase36 = counter.sequence.toString(36).toUpperCase();
//     const requestNumber = `TX${dateStr}${sequenceBase36}`;
    
//     console.log(`✅ Generated requestNumber: ${requestNumber}`);
//     return requestNumber;
    
//   } catch (error) {
//     console.error('❌ Error generating requestNumber:', error);
//     // Fallback with timestamp
//     const timestamp = Math.floor(now.getTime() / 1000).toString(36).toUpperCase();
//     return `TX${timestamp}`;
//   }
// };

requestSchema.plugin(toJSON);
requestSchema.plugin(paginate);

/**
 * @typedef Request
 */
const Request = mongoose.model('Request', requestSchema);

module.exports = Request;
