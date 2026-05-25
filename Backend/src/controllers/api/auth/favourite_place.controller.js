const httpStatus = require('http-status');
const pick = require('../../../utils/pick');
const ApiError = require('../../../utils/ApiError');
const catchAsync = require('../../../utils/catchAsync');
const { favouritePlaceService } = require('../../../services');
const Response = require('../../../config/response');

const getFavouriteList = catchAsync(async (req, res) => {
  const userId = req.user._id;

  const favourites = await favouritePlaceService.getFavouritesByUser(userId);

  const data = {
    FavouriteList: favourites,
  };

  const response = Response(true, data, 'Data Found');
  res.status(httpStatus.OK).send(response);
});

const createFavourite = catchAsync(async (req, res) => {

  const userId = req.user._id;
  req.body.userId = userId;

  const exists = await favouritePlaceService.isFavouriteExists(userId, req.body.address);

  if (exists) {
    throw new ApiError(httpStatus.CONFLICT, 'Address already exists');
  }

  const favourite = await favouritePlaceService.createFavourite(req.body);
  const response = Response(true, favourite, 'Favourite added successfully');
  res.status(httpStatus.CREATED).send(response);
});

const updateFavourite = catchAsync(async (req, res) => {
  const { id } = req.params;
  const favourite = await favouritePlaceService.getFavouriteById(id);

  if (!favourite) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Favourite not found');
  }

  Object.assign(favourite, req.body);
  await favourite.save();

  const response = Response(true, favourite, 'Favourite updated successfully');
  res.status(httpStatus.OK).send(response);
});

const deleteFavourite = catchAsync(async (req, res) => {
  const { id } = req.params;
  const favourite = await favouritePlaceService.getFavouriteById(id);

  if (!favourite) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Favourite not found');
  }

  await favourite.deleteOne();
  const response = Response(true, {}, 'Favourite deleted successfully');
  res.status(httpStatus.OK).send(response);
});

module.exports = {
  getFavouriteList,
  createFavourite,
  updateFavourite,
  deleteFavourite
};
