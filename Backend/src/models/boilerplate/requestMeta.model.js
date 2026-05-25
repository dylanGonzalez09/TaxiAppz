
const mongoose = require('mongoose');
const { toJSON, paginate } = require('../plugins');

const requestMetaSchema = mongoose.Schema(
    {
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      allowNull: false,
      references: {
        model: 'Requests', // Refers to the Request model
        key: 'id',
      },
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      allowNull: false,
    },
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      allowNull: true,
      references: {
        model: 'Users', // Refers to the User model
        key: 'id',
      },
    },
    active: {
      type: Boolean,
      defaultValue: false,
    },
    isLater: {
      type: Boolean,
      defaultValue: false,
    },
    assignMethod: {
      type: String,
      allowNull: true,
    },
  },
  {
    timestamps: true,
  }
);
// Define associations
// RequestMeta.belongsTo(Request, { foreignKey: 'requestId', as: 'request' });
// RequestMeta.belongsTo(User, { foreignKey: 'driverId', as: 'driver' });


const RequestMeta = mongoose.model('RequestMeta', requestMetaSchema);

module.exports = RequestMeta;