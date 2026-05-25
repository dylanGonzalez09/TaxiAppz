const mongoose = require('mongoose');
const { toJSON, paginate } = require('./../plugins');

const favouritePlaceSchema = mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        type: {
            type: String,
            enum: ['HOME','WORK','OTHERS'],
            default: 'ANDROID',
        },
        latitude: {
            type: Number,
            default: null,
        },
        longitude: {
            type: Number,
            default: null,
        },
        address: {
            type: String,
            required: true,
        },
        status: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true,
    }
);

favouritePlaceSchema.plugin(toJSON);
favouritePlaceSchema.plugin(paginate);

/**
 * @typedef FavouritePlace
 */
const FavouritePlace = mongoose.model('favouritePlace', favouritePlaceSchema);

module.exports = FavouritePlace;
