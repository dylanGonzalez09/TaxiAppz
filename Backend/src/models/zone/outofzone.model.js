const mongoose = require('mongoose');
const { toJSON, paginate } = require('../plugins');

const OutOfZoneSchema = mongoose.Schema(
    {
        kilometer: {
            type: Number,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        status: {
            type: Boolean,
            required: true,
            default: true,
        },
         companyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref:'Company',
            default: null,
          },
          clientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Client',
          }
    },
    {
        timestamps: true,
    }
);

// add plugin that converts mongoose to json
OutOfZoneSchema.plugin(toJSON);
OutOfZoneSchema.plugin(paginate);

/**
 * @typedef OutOfZone
 */
const OutOfZone = mongoose.model('outOfZone', OutOfZoneSchema);

module.exports = OutOfZone;
