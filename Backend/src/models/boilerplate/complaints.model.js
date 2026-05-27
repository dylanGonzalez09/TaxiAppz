const mongoose = require('mongoose');
const { toJSON, paginate } = require('../plugins');

const complaintSchema = mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      default: null,
    },
    category: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Category',
      required: false,
      default: null,
    },
    type: {
      type: String,
      trim: true,
      default: null,
    },
    status: {
      type: Number,
      required: true,
      default: 1,
    },
    complaintType: {
      type: Number,
      required: true,
      default: 1,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    language: {
      type: String,
      trim: true,
      default: null,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
    },
    zoneId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Zone',
      required: true,
      default: null,
    },
  },
  {
    timestamps: {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    },
  },
);

// Add plugin that converts mongoose to json
complaintSchema.plugin(toJSON);
complaintSchema.plugin(paginate);

/**
 * @typedef Complaint
 */
const Complaint = mongoose.model('Complaint', complaintSchema);

module.exports = Complaint;
