const mongoose = require('mongoose');
const { toJSON, paginate } = require('./../plugins');

const privillegeSchema = mongoose.Schema(
  {
    permissionIds: [{
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Permission',
        required: true,
      }],
    roleId: {
        type: mongoose.SchemaTypes.ObjectId,
         ref: 'Role',
         required: true,
    },
    groupName: {
      type: String,
       required: true,
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
privillegeSchema.plugin(toJSON);
privillegeSchema.plugin(paginate);


/**
 * @typedef Privillege
 */
const Privillege = mongoose.model('Privillege', privillegeSchema);

module.exports = Privillege;
