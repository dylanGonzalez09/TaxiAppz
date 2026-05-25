const express = require('express');
const auth = require('../../../middlewares/auth');
const validate = require('../../../middlewares/validate');
const favouritePlaceValidation = require('../../../validations/web/master/favourite_place.validation');
const favouritePlaceController = require('../../../controllers/api/auth/favourite_place.controller');

const router = express.Router();

router.route('/list').get(auth('Favourite'), favouritePlaceController.getFavouriteList);
router.route('/create').post(auth('Favourite'), validate(favouritePlaceValidation.createFavouritePlace), favouritePlaceController.createFavourite);
router.route('/update/:id').patch(auth('Favourite'), validate(favouritePlaceValidation.updateFavouritePlace), favouritePlaceController.updateFavourite);
router.route('/delete/:id').delete(auth('Favourite'), favouritePlaceController.deleteFavourite);


module.exports = router;
