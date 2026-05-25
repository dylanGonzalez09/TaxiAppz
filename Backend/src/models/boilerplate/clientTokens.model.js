const mongoose = require('mongoose');
const { toJSON, paginate } = require('./../plugins');

const ClientTokenSchema = mongoose.Schema(
    {
        clientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Client',
        },
        deviceInfoHash: {
            type: [String],
            default: null
        },
    },
    {
        timestamps: true,
    }
);

// add plugin that converts mongoose to json
ClientTokenSchema.plugin(toJSON);
ClientTokenSchema.plugin(paginate);


/**
 * @typedef ClientToken
 */
const ClientToken = mongoose.model('ClientToken', ClientTokenSchema);

module.exports = ClientToken;
