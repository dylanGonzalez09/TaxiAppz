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
  },
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
  },
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
  },
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
  },
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
  },
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
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/octet-stream'];

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
  },
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
  },
});

const advertisementStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/advertisement/'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(file.originalname);
    const filename = `${uniqueSuffix}${ext}`;
    cb(null, filename); // Save file with unique name
  },
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
  },
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
  },
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
  },
});

const combinedStorage = multer.diskStorage({
  destination(req, file, cb) {
    if (file.fieldname === 'profileImage') {
      cb(null, path.join(__dirname, '../../uploads/user/'));
    } else if (file.fieldname === 'documentImage') {
      cb(null, path.join(__dirname, '../../uploads/documentImage/'));
    } else {
      cb(new Error('Unexpected field name'), null);
    }
  },
  filename(req, file, cb) {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const combinedUpload = multer({
  storage: combinedStorage,
  fileFilter(req, file, cb) {
    // Accept both profileImage and documentImage
    if (file.fieldname === 'profileImage') {
      cb(null, true);
    } else {
      cb(new Error('Unexpected field name'), false);
    }
  },
});

const vehicleVariantStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/vehicleVariants/'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const brandStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/brands/'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(file.originalname);
    const filename = `${uniqueSuffix}${ext}`;
    cb(null, filename);
  },
});

const upload = multer({ storage });

const userUpload = multer({ storage: userStorage });

const vehicleUpload = multer({ storage: vehiclestorage });

const vehicleModelUpload = multer({ storage: vehicleModelstorage });

const imageModelUpload = multer({ storage: imageStorage });

const documentModelUpload = multer({ storage: driverdocumentModelstorage, fileFilter });

const settingUpload = multer({ storage: settingstorage });

const promoUpload = multer({ storage: promoModelstorage });

const advertisementUpload = multer({ storage: advertisementStorage });

const dispatcherUpload = multer({ storage: dispatcherModelstorage });

const pushNotificationUpload = multer({ storage: pushNotificationstorage });

const tripsUpload = multer({ storage: tripstorage });

const brandUpload = multer({ storage: brandStorage });

const vehicleVariantUpload = multer({ storage: vehicleVariantStorage });

module.exports = {
  advertisementUpload,
  upload,
  userUpload,
  vehicleUpload,
  vehicleModelUpload,
  imageModelUpload,
  documentModelUpload,
  settingUpload,
  promoUpload,
  dispatcherUpload,
  pushNotificationUpload,
  tripsUpload,
  combinedUpload,
  brandUpload,
  vehicleVariantUpload,
};
