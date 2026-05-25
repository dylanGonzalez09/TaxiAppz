const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config();
// Update the path to your desired directory on the server
const uploadPath = process.env.TRANSLATION_PATH

// Set up storage configuration for Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Ensure the directory exists  
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

// Create Multer instance with the configured storage
const upload = multer({ storage });

// Controller function to handle file upload
const createJson = catchAsync(async (req, res) => {
  // Middleware to handle the file upload

  upload.single('file')(req, res, (err) => {
    if (err) {
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'File upload failed', error: err.message });
    }
    res.status(httpStatus.OK).send('File uploaded successfully');
  });
});

module.exports = {
  createJson,
};
