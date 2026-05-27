const mongoose = require('mongoose');
const { toJSON, paginate } = require('../plugins');

const permissionSchema = mongoose.Schema(
  {
    permissionName: {
      type: String,
      required: true,
    },
    groupName: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// add plugin that converts mongoose to json
permissionSchema.plugin(toJSON);
permissionSchema.plugin(paginate);

/**
 * @typedef Permissions
 */
const Permissions = mongoose.model('Permission', permissionSchema);

module.exports = Permissions;
