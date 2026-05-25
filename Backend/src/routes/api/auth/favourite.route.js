const express = require('express');
const auth = require('../../../middlewares/auth');
const validate = require('../../../middlewares/validate');
const favouriteValidation = require('../../../validations/web/master/favourite_place.validation');
const favouriteController = require('../../../controllers/api/auth/favourite_place.controller');

const router = express.Router();

router.route('/list').get(auth('Favourite'), favouriteController.getFavouriteList);
router.route('/create').post(auth('Favourite'), validate(favouriteValidation.createFavouritePlace), favouriteController.createFavourite);
router.route('/update/:id').patch(auth('Favourite'), validate(favouriteValidation.updateFavouritePlace), favouriteController.updateFavourite);
router.route('/delete/:id').delete(auth('Favourite'), favouriteController.deleteFavourite);

module.exports = router;