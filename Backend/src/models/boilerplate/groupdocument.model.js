const mongoose = require('mongoose');
const { toJSON, paginate } = require('../plugins');

const groupDocumentSchema = mongoose.Schema(
  {
    name: {
      type: String,
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
    type: {
      type: String,
      enum: ['driver'],
      default: 'driver',
    },
    zoneId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Zone',
    },
  },
  {
    timestamps: true,
  },
);

// add plugin that converts mongoose to json
groupDocumentSchema.plugin(toJSON);
groupDocumentSchema.plugin(paginate);

// Indexes for findOne by name (createView), count by zoneId (zone service)
groupDocumentSchema.index({ name: 1 }, { background: true });
groupDocumentSchema.index({ zoneId: 1, type: 1, status: 1 }, { background: true });

/**
 * @typedef GroupDocument
 */
const GroupDocument = mongoose.model('groupDocument', groupDocumentSchema);

module.exports = GroupDocument;
