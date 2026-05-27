const express = require('express');
const auth = require('../../../middlewares/auth');
const validate = require('../../../middlewares/validate');
const brandValidation = require('../../../validations/web/master/brand.validation');
const brandController = require('../../../controllers/web/master/brand.controller');
const { brandUpload } = require('../../../middlewares/upload');

const router = express.Router();

// Routes with authentication and validation
router.post(
  '/create',
  auth('Brands'),
  validate(brandValidation.createBrand),
  brandUpload.single('image'),
  brandController.createBrand,
);
router.get('/getBrandsWithPagination/:id', brandController.getBrands);
router.get('/getBrands/:brandId', auth('Brands'), validate(brandValidation.getBrand), brandController.getBrand);
router.get(
  '/getBrand/:vehicleId',
  auth('Brands'),
  validate(brandValidation.getBrandByVehicle),
  brandController.getBrandByVehicle,
);
router.get('/getAllBrand/list', auth('Brands'), brandController.getBrandWithoutPagination);
router.patch(
  '/updateBrands/:brandId',
  auth('Brands'),
  validate(brandValidation.updateBrand),
  brandUpload.single('image'),
  brandController.updateBrand,
);
router.delete('/deleteBrands/:brandId', auth('Brands'), validate(brandValidation.deleteBrand), brandController.deleteBrand);
router.patch(
  '/updateBrandStatus/:brandId',
  auth('Brands'),
  validate(brandValidation.updateBrandStatus),
  brandController.updateBrandStatus,
);
router.route('/getDropDown/list/:clientId').get(brandController.getDropDownList);

module.exports = router;
