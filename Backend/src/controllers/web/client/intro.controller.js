const httpStatus = require('http-status').default || require('http-status').status || require('http-status');
const pick = require('../../../utils/pick');
const ApiError = require('../../../utils/ApiError');
const catchAsync = require('../../../utils/catchAsync');
const { introService } = require('../../../services');
const Response = require('../../../config/response');
const { imageModelUpload } = require('../../../middlewares/upload');
;const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config({ quiet: true }); // Load environment variables

// Create a vehicle with images
const createIntro = catchAsync(async (req, res) => {


  let clientId;

  if (!req.headers.clientid) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ClientID not found');
  }else{
    clientId = req.headers.clientid;
  }
  const { status,title,description,type } = req.body;


  imageModelUpload.single('image')(req, res, async (err) => {

    const image = req.file ? req.file.filename : '';



    const introModelData = {
      image,
      title,
      description,
      clientId,
      type,
      status
    };

    const newIntroModel = await introService.createIntro(introModelData);
    if (newIntroModel && newIntroModel.image) {
      newIntroModel.image = `/uploads/intro/${newIntroModel.image}`;
    }
    const response = Response(true, newIntroModel, "Intro created successfully");
    res.status(httpStatus.CREATED).send(response);
  });
});

// Get all vehicles with pagination
const getIntros = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['vehicleName', 'serviceType', 'categoryId']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await introService.queryIntros(filter, options);
  const response = Response(true, result, "Intro retrieved successfully");
  res.status(httpStatus.OK).send(response);
});

// Get a single vehicle by ID
const getIntro = catchAsync(async (req, res) => {
  const intro = await introService.getIntroById(req.params.introId);
  if (!intro) {
    throw new ApiError(httpStatus.NOT_FOUND, 'intro not found');
  }

  if (intro && intro.image) {
    intro.image = `/uploads/intro/${intro.image}`;
  }

  const response = Response(true, intro, "intro retrieved successfully");
  res.status(httpStatus.OK).send(response);
});

// Get all vehicles without pagination
const getIntrosWithoutPagination = catchAsync(async (req, res) => {
  if (!req.headers.clientid) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ClientID not found');
  }
  const intro = await introService.getIntross(req.headers.clientid);
  if (!intro) {
    throw new ApiError(httpStatus.NOT_FOUND, 'intro not found');
  }

  const updatedIntros = intro.map(intro => {
    if (intro.image) {
      intro.image = `/uploads/intro/${intro.image}`;
    }

    return intro;
  });

  const response = Response(true, updatedIntros, "Intro retrieved successfully");
  res.status(httpStatus.OK).send(response);
});

// Update a vehicle
const updateIntro = catchAsync(async (req, res) => {
  const { title, description, type, status } = req.body;
  // Handle file upload first
    imageModelUpload.single('image')(req, res, async (err) => {


        const image = req.file ? req.file.filename : null;

        // Fetch existing category
        const existinImage = await introService.getIntroById(req.params.introId);
        if (!existinImage) {
            throw new ApiError(httpStatus.NOT_FOUND, 'Image not found');
        }

        // Prepare data for update
    
        const updateData = {
          title: title ?? existinImage.title,
          description: description ?? existinImage.description,
          type: type ?? existinImage.type,
          status: status ?? existinImage.status,
        };
        // If a new image is provided, update the image field
        if (image) {
            // Optionally, remove the old image file from the server
            if (existinImage.image) {
                const oldImagePath = path.join(__dirname, '../../uploads/intro/', existinImage.image);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }

            // Set the new image path
            updateData.image = image;
        }

        // Update category
        const updatedImage = await introService.updateIntroById(req.params.introId, updateData);

        // Update the image path for the response
        if (updatedImage.image) {
          updatedImage.image = `/uploads/intro/${updatedImage.image}`;
        }

        const response = Response(true, updatedImage, "Image updated successfully");
        res.status(httpStatus.OK).send(response);
    });
});

// Delete a vehicle
const deleteIntro = catchAsync(async (req, res) => {
  const intro = await introService.deleteIntroById(req.params.introId);
  const response = Response(true, intro, "intro deleted successfully");
  res.status(httpStatus.OK).send(response);
});

const updateIntroStatus = catchAsync(async (req, res) => {
  const introId = req.params.introId;
  const { status } = req.body;

  const intro = await introService.updateIntroById(introId, { status });

  if (!intro) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Intro not found');
  }

  const response = Response(true, intro, "Intro status updated successfully");
  res.status(httpStatus.OK).send(response);
});

module.exports = {
  createIntro,
  getIntros,
  getIntro,
  getIntrosWithoutPagination,
  updateIntro,
  deleteIntro,
  updateIntroStatus
};
