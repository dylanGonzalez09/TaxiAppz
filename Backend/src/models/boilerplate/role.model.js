const mongoose = require('mongoose');
const { toJSON, paginate } = require('./../plugins');

const roleSchema = mongoose.Schema(
  {
    role: {
      type: String,
      required: true
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
roleSchema.plugin(toJSON);
roleSchema.plugin(paginate);


/**
 * @typedef Role
 */
const Role = mongoose.model('Role', roleSchema);

module.exports = Role;
