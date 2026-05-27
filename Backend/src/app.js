const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');
const passport = require('passport');
const path = require('path');
const httpStatus = require('./config/httpStatus');
const config = require('./config/config');
const morgan = require('./config/morgan');
const { jwtStrategy } = require('./config/passport');
const { authLimiter } = require('./middlewares/rateLimiter');
const routes = require('./routes/v1');
const { errorConverter, errorHandler } = require('./middlewares/error');
const ApiError = require('./utils/ApiError');
require('./config/firebase');
const MqttService = require('./services/mqtt/mqtt.service');

const app = express();

require('./cron/cron');

if (config.env !== 'test') {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}
app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }));

// Limit JSON body size to avoid slow parsing of huge payloads
app.use(express.json({ limit: '500kb' }));
app.use(express.urlencoded({ extended: true, limit: '500kb' }));

// Compress responses above 1kb (was 10kb) for faster transfer
app.use(
  compression({
    level: 6,
    threshold: 1024,
    filter: (req, res) => {
      if (req.headers['x-no-compression']) return false;
      return compression.filter(req, res);
    },
  }),
);

// // Response time header for monitoring (X-Response-Time in ms)
// app.use((req, res, next) => {
//   const start = Date.now();
//   const end = res.end;
//   res.end = function (...args) {
//     res.setHeader('X-Response-Time', `${Date.now() - start}ms`);
//     return end.apply(this, args);
//   };
//   next();
// });

app.use((req, res, next) => {
  const start = Date.now();
  const { end } = res;

  res.end = function (...args) {
    if (!res.headersSent) {
      res.setHeader('X-Response-Time', `${Date.now() - start}ms`);
    }
    return end.apply(this, args);
  };

  next();
});

// Configure CORS
const corsOptions = {
  origin: [
    'http://13.205.201.71:6002',
    'https://app.Copilot.co.bw',
    'http://localhost:3000',
    'http://98.94.246.41:6002',
    'http://54.164.5.5:5002',
     'http://34.234.81.245:6002',
    'https://c5xl7tw9-3000.inc1.devtunnels.ms',
    'https://n4ftkn7t-3000.inc1.devtunnels.ms'
  ],
  credentials: true, // Allow credentials (cookies)
  methods: 'GET,POST,PUT,PATCH,DELETE,OPTIONS', // Allowed methods
  allowedHeaders: 'Content-Type,Authorization,clientId,zoneId',
};
app.use(cors(corsOptions));

app.use(passport.initialize());
passport.use('jwt', jwtStrategy);

if (config.env === 'production') {
  app.use('/v1/auth', authLimiter);
}
app.use('/uploads/brands', express.static(path.join(__dirname, '..', 'uploads/brands')));
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
app.use('/uploads/advertisement', express.static(path.join(__dirname, '..', 'uploads/advertisement')));
app.use('/uploads/vehicleVariants', express.static(path.join(__dirname, '..', 'uploads/vehicleVariants')));

// API routes
app.use('/v1', routes);

app.get('/privacy-policy', (req, res) => {
  res.sendFile(path.join(__dirname, 'privacy_policy.html'));
});

app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
});

app.use(errorConverter);
app.use(errorHandler);

MqttService.listenToUserChanges();

module.exports = app;
