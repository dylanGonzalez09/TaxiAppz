const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');
const passport = require('passport');
const httpStatus = require('http-status');
const path = require('path');
const config = require('./config/config');
const morgan = require('./config/morgan');
const { jwtStrategy } = require('./config/passport');
const { authLimiter } = require('./middlewares/rateLimiter');
const routes = require('./routes/v1');
const { errorConverter, errorHandler } = require('./middlewares/error');
const ApiError = require('./utils/ApiError');
const { firebase } = require('./config/firebase');
const MqttService = require('./services/mqtt/mqtt.service');

const app = express();

require('./cron/cron');

if (config.env !== 'test') {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}
app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }));

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(compression({
  level: 6,
  threshold: 10 * 1000,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false
    }
    return compression.filter(req, res);
  }
}));



// Configure CORS
const corsOptions = {
  origin: ['http://localhost:4000','http://37.59.107.248:6002','https://app.alfatogo.com','http://13.62.26.82:6002','http://107.20.88.47:6002','https://app.mndriverscooperative.com','https://app.24x7taxi.is','http://34.197.170.0:6002','https://app.luxecarz.co.uk','http://16.170.137.107:6002','https://pro.taxiappz.com','http://localhost:3000', 'http://174.129.125.145:6002','http://3.10.79.13:6002','http://34.201.48.124:6002','http://85.214.211.128:6002','http://136.243.190.115:6002'],
  credentials: true, // Allow credentials (cookies)
  methods: 'GET,POST,PUT,PATCH,DELETE,OPTIONS', // Allowed methods
  allowedHeaders: 'Content-Type,Authorization,clientId,companyid',
};
app.use(cors(corsOptions));

app.use(passport.initialize());
passport.use('jwt', jwtStrategy);

if (config.env === 'production') {
  app.use('/v1/auth', authLimiter);
}

app.use('/uploads/categoryImage', express.static(path.join(__dirname, '..', 'uploads/categoryImage')));
app.use('/uploads/vehicles', express.static(path.join(__dirname, '..', 'uploads/vehicles')));
app.use('/uploads/vehicleModels', express.static(path.join(__dirname, '..', 'uploads/vehicleModels')));
app.use('/uploads/user', express.static(path.join(__dirname, '..', 'uploads/user')));
app.use('/uploads/intro', express.static(path.join(__dirname, '..', 'uploads/intro')));
app.use('/uploads/documentImage', express.static(path.join(__dirname, '..', 'uploads/documentImage')));
app.use('/uploads/setting', express.static(path.join(__dirname, '..', 'uploads/setting')));
app.use('/uploads/promo', express.static(path.join(__dirname, '..', 'uploads/promo')));
app.use('/uploads/dispatcher', express.static(path.join(__dirname, '..', 'uploads/dispatcher')));
app.use('/uploads/trips', express.static(path.join(__dirname, '..', 'uploads/trips')));

// API routes
app.use('/v1', routes);

app.listen(4001, () => console.log('Server running on http://localhost:4001'));

app.get('/privacy-policy', (req, res) => {
  res.sendFile(path.join(__dirname, 'privacy_policy.html'));
});

// app.use((req, res, next) => {
//   next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
// });

// app.use((err, req, res, next) => {
//   res.status(err.status || 500).json({ message: err.message });
// });



app.use(errorConverter);
app.use(errorHandler);


MqttService.listenToUserChanges();

module.exports = app;
