const httpStatus = require('http-status');
const ApiError = require('../../../utils/ApiError');
const { FavouritePlace,Request } = require('../../../models');
const ObjectId = require('mongoose').Types.ObjectId


const getFavouritesByUser = async (userId) => {
  return FavouritePlace.find({ userId }).sort({ createdAt: -1 });
};

const getLastTripHistory = async (userId) => {
  return Request.aggregate([
    { $match: { userId, tripType: 'LOCAL' } },
    { $group: { _id: '$drop_address', details: { $first: '$$ROOT' } } },
    { $project: { details: 1, _id: 0 } },
    { $sort: { 'details.createdAt': -1 } },
    { $limit: 2 },
  ]);
};

const isFavouriteExists = async (userId, address) => {
  return FavouritePlace.exists({ userId, address });
};

const createFavourite = async (data) => {
  return FavouritePlace.create(data);
};

const getFavouriteById = async (id) => {
  return FavouritePlace.findById(id);
};
module.exports = {
  getFavouritesByUser,
  getLastTripHistory,
  isFavouriteExists,
  createFavourite,
  getFavouriteById
};
