const mongoose = require('mongoose');
const { toJSON, paginate } = require('../plugins');

const documentSchema = mongoose.Schema(
  {
    documentName: {
      type: String,
      required: true,
    },
    required: {
      type: Boolean,
      required: true,
    },
    identifier: {
      type: Boolean,
      required: true,
    },
    expiryDate: {
      type: Boolean,
      required: true,
    },
    issueDate: {
      type: Boolean,
      required: true,
    },
    imageRequired: {
      type: Boolean,
      required: true,
      default: false,
    },
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'groupDocument',
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
  {
    timestamps: true,
  },
);

// add plugin that converts mongoose to json
documentSchema.plugin(toJSON);
documentSchema.plugin(paginate);

// Index for find by documentId + status (createView, driver docs)
documentSchema.index({ documentId: 1, status: 1 }, { background: true });

/**
 * @typedef Document
 */
const Document = mongoose.model('document', documentSchema);

module.exports = Document;
