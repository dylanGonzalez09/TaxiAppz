const mongoose = require('mongoose');
const { toJSON, paginate } = require('./../plugins');

const ticketSchema = mongoose.Schema(
    {
      title: {
        type: String,
        required: true,
      },
      description: {
        type: String,
        required: true,
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
        required: false
      },
      requestId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Request',
        required: false
      },
    },
    {
      timestamps: true,
    }
  );
  
  ticketSchema.pre('save', function (next) {
    // Check if the status is 'open' and if no notes are present, add the default notes
    if (this.status === 'open' && this.notes.length === 0) {
      this.notes = [
        {
          note: 'This task is open, awaiting investigation.',
          status: 'open',
          createdAt: new Date(),
        },
        {
          note: '',
          status: 'In-Progress',
          createdAt: new Date(),
        },
        {
          note: '',
          status: 'Action-Taken',
          createdAt: new Date(),
        },
        {
          note: '',
          status: 'closed',
          createdAt: new Date(),
        }
      ];
    }
    next();
  });
  
  
  // add plugin that converts mongoose to json
  ticketSchema.plugin(toJSON);
  ticketSchema.plugin(paginate);
  
  /**
   * @typedef Ticket
   */
  const Ticket = mongoose.model('ticket', ticketSchema);
  
  module.exports = Ticket;
  













