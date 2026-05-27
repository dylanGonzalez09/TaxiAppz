const mongoose = require('mongoose');
const { toJSON, paginate } = require('../plugins');

const requestMetaSchema = mongoose.Schema(
  {
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      allowNull: false,
      references: {
        model: 'Requests', // Refers to the Request model
        key: 'id',
      },
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      allowNull: false,
    },
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      allowNull: true,
      references: {
        model: 'Users', // Refers to the User model
        key: 'id',
      },
    },
    active: {
      type: Boolean,
      defaultValue: false,
    },
    isLater: {
      type: Boolean,
      defaultValue: false,
    },
    assignMethod: {
      type: String,
      allowNull: true,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for countDocuments(driverId, active) in createTrip/assignDriver
requestMetaSchema.index({ driverId: 1, active: 1 }, { background: true });
requestMetaSchema.index({ requestId: 1 }, { background: true });

requestMetaSchema.index({ createdAt: 1 }, { expireAfterSeconds: 80 });

const RequestMeta = mongoose.model('RequestMeta', requestMetaSchema);

module.exports = RequestMeta;
