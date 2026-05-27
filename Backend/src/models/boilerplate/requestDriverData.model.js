const mongoose = require('mongoose');
const { toJSON, paginate } = require('../plugins');

const requestDriverDataSchema = mongoose.Schema(
  {
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      allowNull: false,
      references: {
        model: 'Requests', // Refers to the Request model
        key: 'id',
      },
    },
    driverIds: [
      {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Drivers',
        required: true,
      },
    ],
  },
  {
    timestamps: true,
  },
);

const requestDriverData = mongoose.model('RequestDriverData', requestDriverDataSchema);

module.exports = requestDriverData;
