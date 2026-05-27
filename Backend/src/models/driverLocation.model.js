const mongoose = require('mongoose');

const { Schema } = mongoose;

// Driver Location Schema
const driverLocationSchema = new Schema({
  driverId: { type: Schema.Types.ObjectId, required: true },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  location: {
    type: { type: String, enum: ['Point'], required: true },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  vehicleId: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Vehicle',
  },
  zoneId: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Zone',
    default: null,
  },
  secondaryZone: {
    type: [mongoose.Schema.Types.ObjectId],
    default: null,
  },
  bearing: { type: Number },
  speed: { type: Number },
  serviceType: { type: String },
  color: { type: String },
  isOnline: { type: Boolean, default: false },
  isAvailable: { type: Boolean, default: true },
  lastUpdated: { type: Number, required: true },
});

driverLocationSchema.index({ location: '2dsphere' });

const DriverLocation = mongoose.model('driverlocations', driverLocationSchema);

module.exports = DriverLocation;
