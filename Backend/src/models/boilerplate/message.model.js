const mongoose = require('mongoose');

const messageSchema = mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'senderType', // can be User or Driver
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'receiverType', // can be User or Driver
    },
    senderType: {
      type: String,
      enum: ['Users', 'Driver'],
      required: true,
    },
    receiverType: {
      type: String,
      enum: ['Users', 'Driver'],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    delivered: {
      type: Boolean,
      default: false,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Messages', messageSchema);