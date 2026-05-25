const mongoose = require('mongoose');
const { toJSON, paginate } = require('../plugins');

const userComplaintSchema = mongoose.Schema(
    {
       userId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: 'User',
        },
        answer: {
            type: String,
            trim: true,
            default: null,
        },
        complainId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Complaint',
          },
        requestId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Request',
        },
        status: {
            type: Boolean,
            default: true,
        },
        clientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Client',
        },
    },
    {
        timestamps: {
            createdAt: 'createdAt',
            updatedAt: 'updatedAt',
        },
    }
);

// Add plugin that converts mongoose to json
userComplaintSchema.plugin(toJSON);
userComplaintSchema.plugin(paginate);

/**
 * @typedef userComplaint
 */
const userComplaint = mongoose.model('userComplaint', userComplaintSchema);

module.exports = userComplaint;
