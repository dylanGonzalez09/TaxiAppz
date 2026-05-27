const mongoose = require('mongoose');
const { toJSON, paginate } = require('../plugins');

const categorySchema = mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
    },
    categoryImage: {
      type: String,
      required: true,
    },
    status: {
      type: Boolean,
      required: true,
      default: true,
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
    },

    zoneId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Zone',
    },
  },
  {
    timestamps: true,
  },
);

// add plugin that converts mongoose to json
categorySchema.plugin(toJSON);
categorySchema.plugin(paginate);

/**
 * @typedef Category
 */
const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
