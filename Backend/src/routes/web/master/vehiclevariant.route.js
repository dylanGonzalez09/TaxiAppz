const express = require('express');
const auth = require('../../../middlewares/auth');
const validate = require('../../../middlewares/validate');
const vehicleVariantValidation = require('../../../validations/web/master/vehiclevariant.validation');
const vehicleVariantController = require('../../../controllers/web/master/vehiclevariant.controller');
const { vehicleVariantUpload } = require('../../../middlewares/upload');

const router = express.Router();

router.post(
  '/create',
  auth('VehicleVariants'),
  vehicleVariantUpload.single('image'),
  validate(vehicleVariantValidation.createVehicleVariant),
  vehicleVariantController.createVehicleVariant,
);

router.get(
  '/getVehicleVariantsWithPagination/:vehicleModelId',
  auth('VehicleVariants'),
  vehicleVariantController.getVehicleVariants,
);

router.get(
  '/getByVehicleModel/:vehicleModelId',
  auth('VehicleVariants'),
  vehicleVariantController.getVehicleVariantsByVehicleModel,
);

router.get(
  '/getVehicleVariant/:vehicleVariantId',
  auth('VehicleVariants'),
  validate(vehicleVariantValidation.getVehicleVariant),
  vehicleVariantController.getVehicleVariant,
);

router.patch(
  '/updateVehicleVariant/:vehicleVariantId',
  auth('VehicleVariants'),
  validate(vehicleVariantValidation.updateVehicleVariant),
  vehicleVariantUpload.single('image'),
  vehicleVariantController.updateVehicleVariant,
);

router.delete(
  '/deleteVehicleVariant/:vehicleVariantId',
  auth('VehicleVariants'),
  validate(vehicleVariantValidation.deleteVehicleVariant),
  vehicleVariantController.deleteVehicleVariant,
);

router.patch(
  '/updateVehicleVariantStatus/:vehicleVariantId',
  auth('VehicleVariants'),
  validate(vehicleVariantValidation.updateVehicleVariantStatus),
  vehicleVariantController.updateVehicleVariantStatus,
);

module.exports = router;
