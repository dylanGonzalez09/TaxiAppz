const mongoose = require('mongoose');
const { toJSON, paginate } = require('../plugins');

const complaintSchema = mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      default: null,
    },
    category:{
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Category',
        required: false,
    },
    type: {
      type: String,
      trim: true,
      default: null,
    },
     status: {
            type: Boolean,
            default: true,
        },
    complaintType: {
      type: Number,
      required: true,
      default: 1,
    },
   
    language: {
      type: String,
      trim: true,
      default: null,
    },
 
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
    }
  },
  {
    timestamps: {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    },
  }
);

// Add plugin that converts mongoose to json
complaintSchema.plugin(toJSON);
complaintSchema.plugin(paginate);

/**
 * @typedef Complaint
 */
const Complaint = mongoose.model('Complaint', complaintSchema);

module.exports = Complaint;
