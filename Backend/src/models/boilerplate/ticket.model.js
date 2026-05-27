const mongoose = require('mongoose');
const { toJSON, paginate } = require('../plugins');

const ticketSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  notes: [
    {
      note: { type: String, required: false },
      status: {
        type: String,
        enum: ['open', 'In-Progress', 'Action-Taken', 'closed'],
        required: true,
      },
      createdAt: { type: Date, default: Date.now },
    },
  ],
  status: {
    type: String,
    enum: ['open', 'In-Progress', 'Action-Taken', 'closed'],
    default: 'open',
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
  },
  requestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Request',
    required: false,
  },
  zoneId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Zone',
    required: false,
  },
},{timestamps: true});

// add plugin that converts mongoose to json
ticketSchema.plugin(toJSON);
ticketSchema.plugin(paginate);

/**
 * @typedef Ticket
 */
const Ticket = mongoose.model('ticket', ticketSchema);

module.exports = Ticket;
