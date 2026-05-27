const path = require('path');
const fs = require('fs');
const httpStatus = require('../../../utils/httpStatus');
const pick = require('../../../utils/pick');
const ApiError = require('../../../utils/ApiError');
const catchAsync = require('../../../utils/catchAsync');
const { vehicleVariantService } = require('../../../services');
const Response = require('../../../config/response');
const { vehicleVariantUpload } = require('../../../middlewares/upload');

// ✅ Create Vehicle Variant
const createVehicleVariant = catchAsync(async (req, res) => {
  if (!req.headers.clientid) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ClientID not found');
  }

  const zoneId = req.headers.zoneid || null;

  const clientId = req.headers.clientid;

  const image = req.file ? req.file.filename : '';
  if (!image) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Vehicle variant image is required');
  }

  const vehicleVariantData = {
    ...req.body,
    image,
    clientId,
    zoneId,
  };

  const newVariant = await vehicleVariantService.createVehicleVariant(vehicleVariantData);

  if (newVariant.image) {
    newVariant.image = `/uploads/vehicleVariants/${newVariant.image}`;
  }

  const response = Response(true, newVariant, 'Vehicle variant created successfully');
  res.status(httpStatus.CREATED).send(response);
});

// ✅ Get Vehicle Variants with Pagination (Based on VehicleModelId)
const getVehicleVariants = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['variantName', 'vehicleModelId']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);

  if (req.query.search) {
    filter.$or = [{ variantName: { $regex: req.query.search, $options: 'i' } }];
  }
  const result = await vehicleVariantService.queryVehicleVariants(req, filter, options);

  // Attach image path (only if not already a full path)
  result.results = result.results.map((item) => {
    if (item.image && !item.image.startsWith('/uploads/')) {
      item.image = `/uploads/vehicleVariants/${item.image}`;
    }
    return item;
  });

  const response = Response(true, result, 'Vehicle variants retrieved successfully');
  res.status(httpStatus.OK).send(response);
});

// ✅ Get Single Vehicle Variant
const getVehicleVariant = catchAsync(async (req, res) => {
  const variant = await vehicleVariantService.getVehicleVariantById(req.params.vehicleVariantId);

  if (!variant) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Vehicle variant not found');
  }

  if (variant.image && !variant.image.startsWith('/uploads/')) {
    variant.image = `/uploads/vehicleVariants/${variant.image}`;
  }

  const response = Response(true, variant, 'Vehicle variant retrieved successfully');
  res.status(httpStatus.OK).send(response);
});

// ✅ Update Vehicle Variant
const updateVehicleVariant = catchAsync(async (req, res) => {
  const newImage = req.file ? req.file.filename : null;

  const existingVariant = await vehicleVariantService.getVehicleVariantById(req.params.vehicleVariantId);

  if (!existingVariant) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Vehicle variant not found');
  }

  const updateData = { ...req.body };

  if (newImage) {
    // delete old image
    if (existingVariant.image) {
      // Extract filename if it's a full path
      const oldImageFilename = existingVariant.image.includes('/')
        ? existingVariant.image.split('/').pop()
        : existingVariant.image;
      const oldImagePath = path.join(__dirname, '../../../uploads/vehicleVariants/', oldImageFilename);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }
    updateData.image = newImage;
  }

  const updatedVariant = await vehicleVariantService.updateVehicleVariantById(req.params.vehicleVariantId, updateData);

  if (updatedVariant.image && !updatedVariant.image.startsWith('/uploads/')) {
    updatedVariant.image = `/uploads/vehicleVariants/${updatedVariant.image}`;
  }

  const response = Response(true, updatedVariant, 'Vehicle variant updated successfully');
  res.status(httpStatus.OK).send(response);
});

// ✅ Delete Vehicle Variant
const deleteVehicleVariant = catchAsync(async (req, res) => {
  const variant = await vehicleVariantService.deleteVehicleVariantById(req.params.vehicleVariantId);

  const response = Response(true, variant, 'Vehicle variant deleted successfully');
  res.status(httpStatus.OK).send(response);
});

// ✅ Update Vehicle Variant Status
const updateVehicleVariantStatus = catchAsync(async (req, res) => {
  const { vehicleVariantId } = req.params;
  const { status } = req.body;

  const variant = await vehicleVariantService.updateVehicleVariantById(vehicleVariantId, { status });

  if (!variant) {
    throw new ApiError(httpStatus.NOT_FOUND, 'VehicleVariant not found');
  }

  if (variant.image && !variant.image.startsWith('/uploads/')) {
    variant.image = `/uploads/vehicleVariants/${variant.image}`;
  }

  const response = Response(true, variant, 'VehicleVariant status updated successfully');
  res.status(httpStatus.OK).send(response);
});

// ✅ Get Vehicle Variants by Vehicle Model (without pagination)
const getVehicleVariantsByVehicleModel = catchAsync(async (req, res) => {
  if (!req.headers.clientid) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ClientID not found');
  }

  const variants = await vehicleVariantService.getVehicleVariantsByVehicleModel(req);

  if (!variants) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Vehicle variants not found');
  }

  // Attach image path (only if not already a full path)
  const updatedVariants = variants.map((variant) => {
    if (variant.image && !variant.image.startsWith('/uploads/')) {
      variant.image = `/uploads/vehicleVariants/${variant.image}`;
    }
    return variant;
  });

  const response = Response(true, updatedVariants, 'Vehicle variants retrieved successfully');
  res.status(httpStatus.OK).send(response);
});

module.exports = {
  createVehicleVariant,
  getVehicleVariants,
  getVehicleVariant,
  updateVehicleVariant,
  deleteVehicleVariant,
  updateVehicleVariantStatus,
  getVehicleVariantsByVehicleModel,
};
