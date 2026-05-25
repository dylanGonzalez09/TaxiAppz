const mongoose = require('mongoose');
const { toJSON, paginate } = require('./../plugins');

const groupDocumentSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        status: {
            type: Boolean,
            required: true,
            default:true
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
    }
);

// add plugin that converts mongoose to json
groupDocumentSchema.plugin(toJSON);
groupDocumentSchema.plugin(paginate);


/**
 * @typedef GroupDocument
 */
const GroupDocument = mongoose.model('groupDocument', groupDocumentSchema);

module.exports = GroupDocument;
