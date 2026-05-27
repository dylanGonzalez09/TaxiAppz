const mongoose = require('mongoose');
const { toJSON, paginate } = require('../plugins');

const vehicleDocumentSchema = mongoose.Schema(
  {
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    documentImage: {
      type: String,
      default: null,
    },
    expiryDate: {
      type: Date,
      default: null,
    },
    expiryReason: {
      type: String,
      default: null,
    },
    expiryStatus: {
      type: Boolean,
      required: true,
      default: false,
    },
    identifier: {
      type: String,
      default: null,
    },
    issueDate: {
      type: Date,
      default: null,
    },
    documentStatus: {
      type: String,
      enum: ['NOTUPLOADED', 'WAITINGFORAPPROVAL', 'APPROVED', 'EXPIRED', 'DENIED'],
      required: true,
      default: 'NOTUPLOADED',
    },
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      required: true,
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
  { timestamps: true },
);

vehicleDocumentSchema.plugin(toJSON);
vehicleDocumentSchema.plugin(paginate);

const VehicleDocument = mongoose.model('vehicleDocument', vehicleDocumentSchema);

module.exports = VehicleDocument;
