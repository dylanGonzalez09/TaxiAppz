const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');



// Configure storage for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/categoryImage/')); // Set upload directory
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`); // Save file with unique name
  }
});


// Configure storage for multer
const userStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/user/')); // Set upload directory
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`); // Save file with unique name
  }
});

// Configure storage for multer
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/intro/'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  }
});

// Configure storage for multer
const vehiclestorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/vehicles/'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(file.originalname);
    const filename = `${uniqueSuffix}${ext}`;
    cb(null, filename);
  }
});

const vehicleModelstorage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, path.join(__dirname, '../../uploads/vehicleModels/'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(file.originalname);
    const filename = `${uniqueSuffix}${ext}`;
    cb(null, filename); // Save file with unique name
  }
});


const driverdocumentModelstorage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, path.join(__dirname, '../../uploads/documentImage/'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(file.originalname);
    const filename = `${uniqueSuffix}${ext}`;
    cb(null, filename); // Save file with unique name
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg','application/octet-stream'];

  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error('Only JPG, JPEG, and PNG files are allowed.'));
  }

  cb(null, true);
};


const settingstorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/setting/'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(file.originalname);
    const filename = `${uniqueSuffix}${ext}`;
    cb(null, filename);
  }
});


const promoModelstorage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, path.join(__dirname, '../../uploads/promo/'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(file.originalname);
    const filename = `${uniqueSuffix}${ext}`;
    cb(null, filename); // Save file with unique name
  }
});


const dispatcherModelstorage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, path.join(__dirname, '../../uploads/dispatcher/'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(file.originalname);
    const filename = `${uniqueSuffix}${ext}`;
    cb(null, filename); // Save file with unique name
  }
});

const pushNotificationstorage = multer.diskStorage({

  destination: (req, file, cb) => {
      cb(null, path.join(__dirname, '../../uploads/pushnotification/'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(file.originalname);
    const filename = `${uniqueSuffix}${ext}`;
    cb(null, filename); // Save file with unique name
  }
});


const tripstorage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, path.join(__dirname, '../../uploads/trips/'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(file.originalname);
    const filename = `${uniqueSuffix}${ext}`;
    cb(null, filename); // Save file with unique name
  }
});

const upload = multer({ storage });

const userUpload = multer({ storage : userStorage });

const vehicleUpload = multer({ storage : vehiclestorage});

const vehicleModelUpload = multer({ storage : vehicleModelstorage });

const imageModelUpload = multer({ storage : imageStorage });

const documentModelUpload = multer({ storage : driverdocumentModelstorage,fileFilter });

const settingUpload = multer({ storage : settingstorage});

const promoUpload = multer({ storage : promoModelstorage});

const dispatcherUpload = multer({ storage : dispatcherModelstorage});

const pushNotificationUpload = multer({ storage : pushNotificationstorage});

const tripsUpload = multer({ storage : tripstorage});



module.exports = {upload,userUpload,vehicleUpload,vehicleModelUpload,imageModelUpload,documentModelUpload,settingUpload,promoUpload,dispatcherUpload,pushNotificationUpload,tripsUpload};
