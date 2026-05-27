const httpStatus = require('../../../utils/httpStatus');
const pick = require('../../../utils/pick');
const ApiError = require('../../../utils/ApiError');
const catchAsync = require('../../../utils/catchAsync');
const { brandService } = require('../../../services');
const Response = require('../../../config/response');
const { brandUpload } = require('../../../middlewares/upload');
const path = require('path');
const fs = require('fs');

// Create a brand with an image
const createBrand = catchAsync(async (req, res) => {

  let clientId;
  let zoneId = null;

  if (!req.headers.clientid) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ClientID not found');
  } else {
    clientId = req.headers.clientid;
  }
  if (req.headers.zoneid) {
    zoneId = req.headers.zoneid;
  }

  const { brandName, vehicleId, status, description } = req.body;

  brandUpload.single('image')(req, res, async (err) => {
    const image = req.file ? req.file.filename : '';

    const brandData = {
      brandName,
      image,
      vehicleId,
      clientId,
      zoneId,
      status,
      description
    };

    const newBrand = await brandService.createBrand(brandData);
    if (newBrand && newBrand.image) {
      newBrand.image = `/uploads/brands/${newBrand.image}`;
    }
    const response = Response(true, newBrand, "Brand created successfully");
    res.status(httpStatus.CREATED).send(response);
  });
});

// Get all brands with pagination
const getBrands = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['brandName', 'description']);
  const options = pick(req.query, ['sortBy', 'limit', 'page'], { allowDiskUse: true });

  if (req.query.search) {
    filter.$or = [
      { brandName: { $regex: req.query.search, $options: 'i' } },
      { description: { $regex: req.query.search, $options: 'i' } },
    ];
  }

  const result = await brandService.queryBrands(req, filter, options);

  // ✅ Fix image path for each brand
  if (result.results && result.results.length > 0) {
    result.results = result.results.map((brand) => ({
      ...brand.toObject?.() || brand,
      image: brand.image ? `/uploads/brands/${brand.image}` : null,
    }));
  }

  const response = Response(true, result, "Brands retrieved successfully");
  res.status(httpStatus.OK).send(response);
});

// Get a single brand by ID
const getBrand = catchAsync(async (req, res) => {
  const brand = await brandService.getBrandById(req.params.brandId);
  if (!brand) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Brand not found');
  }

  if (brand && brand.image) {
    brand.image = `/uploads/brands/${brand.image}`;
  }
  const response = Response(true, brand, "Brand retrieved successfully");
  res.status(httpStatus.OK).send(response);
});

const getBrandByVehicle = catchAsync(async (req, res) => {
  const brand = await brandService.getBrandByVehicleId(req.params.vehicleId, req.headers.zoneid || null);
  if (!brand) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Brand not found');
  }

  const updatedBrands = brand.map(b => {
    if (b.image) {
      b.image = `/uploads/brands/${b.image}`;
    }
    return b;
  });
  const response = Response(true, updatedBrands, "Brand retrieved successfully");
  res.status(httpStatus.OK).send(response);
});

// Get all brands without pagination
const getBrandWithoutPagination = catchAsync(async (req, res) => {
  if (!req.headers.clientid) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ClientID not found');
  }

  const brands = await brandService.getBrands(req.headers.clientid, req.headers.zoneid || null);
  if (!brands) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Brands not found');
  }

  const updatedBrands = brands.map(brand => {
    if (brand.image) {
      brand.image = `/uploads/brands/${brand.image}`;
    }
    return brand;
  });

  const response = Response(true, updatedBrands, "Brands retrieved successfully");
  res.status(httpStatus.OK).send(response);
});

// Update a brand
const updateBrand = catchAsync(async (req, res) => {
  const { brandName, vehicleId, status, description } = req.body;

  brandUpload.single('image')(req, res, async (err) => {
    const newImage = req.file ? req.file.filename : null;

    const existingBrand = await brandService.getBrandById(req.params.brandId);
    if (!existingBrand) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Brand not found');
    }

    const updateData = { brandName, vehicleId, status, description };

    if (newImage) {
      if (existingBrand.image) {
        const oldImagePath = path.join(__dirname, '../../uploads/brands/', existingBrand.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      updateData.image = newImage;
    }

    const updatedBrand = await brandService.updateBrandById(req.params.brandId, updateData);
    if (updatedBrand && updatedBrand.image) {
      updatedBrand.image = `/uploads/brands/${updatedBrand.image}`;
    }
    const response = Response(true, updatedBrand, "Brand updated successfully");
    res.status(httpStatus.OK).send(response);
  });
});

// Delete a brand
const deleteBrand = catchAsync(async (req, res) => {
  const brand = await brandService.deleteBrandById(req.params.brandId);
  const response = Response(true, brand, "Brand deleted successfully");
  res.status(httpStatus.OK).send(response);
});

const updateBrandStatus = catchAsync(async (req, res) => {
  const brandId = req.params.brandId;
  const { status } = req.body;

  const brand = await brandService.updateBrandById(brandId, { status });

  if (!brand) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Brand not found');
  }

  const response = Response(true, brand, "Brand status updated successfully");
  res.status(httpStatus.OK).send(response);
});

const getDropDownList = catchAsync(async (req, res) => {
  let data = await brandService.getDropDowns(req.params.clientId, req.headers.zoneid || null);

  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, 'data not found');
  }
  const response = Response(true, data, "Success");
  res.status(httpStatus.OK).send(response);
});

module.exports = {
  createBrand,
  getBrands,
  getBrand,
  getBrandWithoutPagination,
  updateBrand,
  deleteBrand,
  getBrandByVehicle,
  updateBrandStatus,
  getDropDownList
};
