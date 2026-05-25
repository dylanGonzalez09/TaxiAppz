const httpStatus = require('http-status');
const pick = require('../../../utils/pick');
const ApiError = require('../../../utils/ApiError');
const catchAsync = require('../../../utils/catchAsync');
const { vehicleModelService } = require('../../../services');
const Response = require('../../../config/response');
const { vehicleModelUpload } = require('../../../middlewares/upload');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config(); // Load environment variables




// Create a vehicle model with an image
const createVehicleModel = catchAsync(async (req, res) => {
  let clientId;

  if (!req.headers.clientid) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ClientID not found');
  }else{
    clientId = req.headers.clientid;
  }


    const { modelname, vehicleId, status } = req.body;

    vehicleModelUpload.single('image')(req, res, async (err) => {


        const image = req.file ? req.file.filename : '';

        const vehicleModelData = {
            modelname,
            image,
            vehicleId,
            clientId,
            status
        };

        const newVehicleModel = await vehicleModelService.createVehicleModel(vehicleModelData);
        if (newVehicleModel && newVehicleModel.image) {
          newVehicleModel.image = `/uploads/vehicleModels/${newVehicleModel.image}`;
        }
        const response = Response(true, newVehicleModel, "Vehicle model created successfully");
        res.status(httpStatus.CREATED).send(response);
    });
});

// Get all vehicle models with pagination
const getVehicleModels = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['modelname', 'description', 'role']);
  
  const options = pick(req.query, ['sortBy', 'limit', 'page'],{ allowDiskUse: true });
  if (req.query.search) {
    filter.$or = [
      { modelname: { $regex: req.query.search, $options: 'i' } },
      { description: { $regex: req.query.search, $options: 'i' } },
    ];
  }

    const result = await vehicleModelService.queryVehicleModels(req,filter, options);
    
    const response = Response(true, result, "Vehicle models retrieved successfully");
    res.status(httpStatus.OK).send(response);
});

// Get a single vehicle model by ID
const getVehicleModel = catchAsync(async (req, res) => {
    const vehicleModel = await vehicleModelService.getVehicleModelById(req.params.vehicleModelId);
    if (!vehicleModel) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Vehicle model not found');
    }

    if (vehicleModel && vehicleModel.image) {
        vehicleModel.image = `/uploads/vehicleModels/${vehicleModel.image}`;
    }
    const response = Response(true, vehicleModel, "Vehicle model retrieved successfully");
    res.status(httpStatus.OK).send(response);
});


const getVehicleModelByVehicle = catchAsync(async (req, res) => {
  const vehicleModel = await vehicleModelService.getVehicleModelByVehicleId(req.params.vehicleId);
  if (!vehicleModel) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Vehicle model not found');
  }

  if (vehicleModel && vehicleModel.image) {
      vehicleModel.image = `/uploads/vehicleModels/${vehicleModel.image}`;
  }
  const response = Response(true, vehicleModel, "Vehicle model retrieved successfully");
  res.status(httpStatus.OK).send(response);
});
// Get all vehicle models without pagination
const getVehicleModelWithoutPagination = catchAsync(async (req, res) => {

  if (!req.headers.clientid) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ClientID not found');
  }

    const vehicleModels = await vehicleModelService.getVehicleModels(req.headers.clientid);
    if (!vehicleModels) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Vehicle models not found');
    }

    const updatedVehicleModels = vehicleModels.map(vehicleModel => {
        if (vehicleModel.image) {
            vehicleModel.image = `/uploads/vehicleModels/${vehicleModel.image}`;
        }
        return vehicleModel;
    });

    const response = Response(true, updatedVehicleModels, "Vehicle models retrieved successfully");
    res.status(httpStatus.OK).send(response);
});

// Update a vehicle model
const updateVehicleModel = catchAsync(async (req, res) => {
    const { modelname, vehicleId, status } = req.body;

    vehicleModelUpload.single('image')(req, res, async (err) => {
        const newImage = req.file ? req.file.filename : null;

        const existingVehicleModel = await vehicleModelService.getVehicleModelById(req.params.vehicleModelId);
        if (!existingVehicleModel) {
            throw new ApiError(httpStatus.NOT_FOUND, 'Vehicle model not found');
        }

        const updateData = { modelname, vehicleId, status };

        if (newImage) {
            if (existingVehicleModel.image) {
                const oldImagePath = path.join(__dirname, '../../uploads/vehicleModels/', existingVehicleModel.image);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
            updateData.image = newImage;
        }

        const updatedVehicleModel = await vehicleModelService.updateVehicleModelById(req.params.vehicleModelId, updateData);
        if (updatedVehicleModel && updatedVehicleModel.image) {
          updatedVehicleModel.image = `/uploads/vehicleModels/${updatedVehicleModel.image}`;
        }
        const response = Response(true, updatedVehicleModel, "Vehicle model updated successfully");
        res.status(httpStatus.OK).send(response);
    });
});

// Delete a vehicle model
const deleteVehicleModel = catchAsync(async (req, res) => {
    const vehicleModel = await vehicleModelService.deleteVehicleModelById(req.params.vehicleModelId);
    const response = Response(true, vehicleModel, "Vehicle model deleted successfully");
    res.status(httpStatus.OK).send(response);
});

const updateVehicleModelStatus = catchAsync(async (req, res) => {
  const vehicleModelId = req.params.vehicleModelId;
  const { status } = req.body;

  const vehicleModel = await vehicleModelService.updateVehicleModelById(vehicleModelId, { status });

  if (!vehicleModel) {
    throw new ApiError(httpStatus.NOT_FOUND, 'VehicleModel not found');
  }

  const response = Response(true, vehicleModel, "VehicleModel status updated successfully");
  res.status(httpStatus.OK).send(response);
});

const getDropDownList = catchAsync(async (req, res) => {
  let data = await vehicleModelService.getDropDowns(req.params.clientId);
  
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, 'data not found');
  }
  const response = Response(true, data, "Success");
  res.status(httpStatus.OK).send(response);
});

module.exports = {
    createVehicleModel,
    getVehicleModels,
    getVehicleModel,
    getVehicleModelWithoutPagination,
    updateVehicleModel,
    deleteVehicleModel,
    getVehicleModelByVehicle,
    updateVehicleModelStatus,
    getDropDownList
};
