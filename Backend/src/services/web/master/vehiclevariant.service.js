const httpStatus = require('../../../utils/httpStatus');
const ApiError = require('../../../utils/ApiError');
const { VehicleVariant } = require('../../../models');
const mongoose = require('mongoose');
const {ObjectId} = require('mongoose')

const createVehicleVariant = async (body) => {
  return VehicleVariant.create(body);
};


const queryVehicleVariants = async (req, filter = {}, options = {}) => {
  const clientId = req.headers.clientid;
  const { vehicleModelId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(vehicleModelId)) {
    throw new ApiError(400, 'Invalid vehicleModelId');
  }

  filter.vehicleModelId = new mongoose.Types.ObjectId(vehicleModelId);


  if (clientId && mongoose.Types.ObjectId.isValid(clientId)) {
    filter.clientId = new mongoose.Types.ObjectId(clientId);
  }

  const page = Math.max(1, parseInt(options.page) || 1);
  const limit = Math.max(1, parseInt(options.limit) || 10);
  const skip = Math.max(0, (page - 1) * limit);

  const docs = await VehicleVariant.find(filter)
    .populate({
      path: 'vehicleModelId',
      select: 'modelname brandId',
      populate: {
        path: 'brandId',
        select: 'brandName vehicleId',
        populate: {
          path: 'vehicleId',
          select: 'vehicleName'
        }
      }
    })
    .skip(skip)
    .limit(limit)
    .lean();

  const totalResults = await VehicleVariant.countDocuments(filter);

  return {
    results: docs,
    page,
    limit,
    totalPages: Math.ceil(totalResults / limit),
    totalResults,
  };
};

const getVehicleVariantById = async (id) => {
  return VehicleVariant.findById(id);
};

const updateVehicleVariantById = async (id, updateBody) => {
  const variant = await getVehicleVariantById(id);
  if (!variant) {
    throw new ApiError(httpStatus.NOT_FOUND, 'VehicleVariant not found');
  }
  Object.assign(variant, updateBody);
  await variant.save();
  return variant;
};

const deleteVehicleVariantById = async (id) => {
  const variant = await getVehicleVariantById(id);
  if (!variant) {
    throw new ApiError(httpStatus.NOT_FOUND, 'VehicleVariant not found');
  }
  await variant.deleteOne();
  return { message: 'Deleted Successfully' };
};

const getVehicleVariantsByVehicleModel = async (req) => {
  const clientId = req.headers.clientid;

  if (!mongoose.Types.ObjectId.isValid(req.params.vehicleModelId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid vehicleModelId');
  }

  const vehicleModelObjectId = new mongoose.Types.ObjectId(req.params.vehicleModelId);

  const filter = {
    clientId: clientId && mongoose.Types.ObjectId.isValid(clientId) ? new mongoose.Types.ObjectId(clientId) : clientId,
    vehicleModelId: vehicleModelObjectId,
  };


  const docs = await VehicleVariant.find(filter)
    .populate({
      path: 'vehicleModelId',
      select: 'modelname brandId',
      populate: {
        path: 'brandId',
        select: 'brandName vehicleId',
        populate: {
          path: 'vehicleId',
          select: 'vehicleName'
        }
      }
    })
    .lean();

  // Transform populated fields to match frontend expectations
  const transformedDocs = docs.map(doc => {
    const transformed = { ...doc };

    // Normalize `id` field for frontend consumers
    if (!transformed.id) {
      transformed.id = doc._id?.toString ? doc._id.toString() : doc._id;
    }
    if (doc.vehicleModelId && typeof doc.vehicleModelId === 'object') {
      transformed.vehicleModelName = doc.vehicleModelId.modelname || '';
      transformed.vehicleModelId = doc.vehicleModelId._id || doc.vehicleModelId;

      // VehicleModel has vehicleId (ref Vehicle) - get vehicle info
      if (doc.vehicleModelId.vehicleId && typeof doc.vehicleModelId.vehicleId === 'object') {
        transformed.vehicleName = doc.vehicleModelId.vehicleId.vehicleName || '';
        transformed.vehicleId = doc.vehicleModelId.vehicleId._id || doc.vehicleModelId.vehicleId;
      }
      transformed.brandName = transformed.brandName || '';
      transformed.brandId = transformed.brandId || null;
    }
    return transformed;
  });

  return transformedDocs;
};

const getVehicleVariantsByVehicleModelId = async (vehicleModelId) => {
  // Convert vehicleModelId to ObjectId if it's a string
  const vehicleModelObjectId = vehicleModelId instanceof ObjectId ? vehicleModelId : new mongoose.Types.ObjectId(vehicleModelId);
  
  const variants = await VehicleVariant.find({ vehicleModelId: vehicleModelObjectId })
    .populate({
      path: 'vehicleModelId',
      select: 'modelname brandId',
      populate: {
        path: 'brandId',
        select: 'brandName vehicleId',
        populate: {
          path: 'vehicleId',
          select: 'vehicleName'
        }
      }
    })
    .lean();
  
  // Transform the data to include model, brand, and vehicle info
  variants.forEach(variant => {
    if (variant.vehicleModelId) {
      // Store the vehicleModelId value before transforming
      const vehicleModelIdValue = variant.vehicleModelId._id || variant.vehicleModelId;
      
      // Extract populated data
      variant.vehicleModelName = variant.vehicleModelId.modelname || '';
      if (variant.vehicleModelId.brandId) {
        variant.brandName = variant.vehicleModelId.brandId.brandName || '';
        if (variant.vehicleModelId.brandId.vehicleId) {
          variant.vehicleName = variant.vehicleModelId.brandId.vehicleId.vehicleName || '';
        }
      }
      
      // Replace the populated object with just the ID
      variant.vehicleModelId = vehicleModelIdValue.toString ? vehicleModelIdValue.toString() : vehicleModelIdValue;
    }
    // Ensure id field exists
    if (variant._id && !variant.id) {
      variant.id = variant._id.toString();
    }
  });
  
  return variants;
};

module.exports = {
  createVehicleVariant,
  queryVehicleVariants,
  getVehicleVariantById,
  updateVehicleVariantById,
  deleteVehicleVariantById,
  getVehicleVariantsByVehicleModel,
  getVehicleVariantsByVehicleModelId
};