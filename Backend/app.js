const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');
const passport = require('passport');
const httpStatus = require('./utils/httpStatus');
const path = require('path');
const config = require('./config/config');
const morgan = require('./config/morgan');
const { jwtStrategy } = require('./config/passport');
const { authLimiter } = require('./middlewares/rateLimiter');
const routes = require('./routes/v1');
const { errorConverter, errorHandler } = require('./middlewares/error');
const ApiError = require('./utils/ApiError');
const MqttService = require('./services/mqtt/mqtt.service');
const { authorizeNetWebviewPage } = require('./views/authorizeNetWebview.page');

// Initialize Firebase Admin so it exists before any service uses it
require('./config/firebase');

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
  origin: ['http://localhost:3000','http://16.52.94.38:6002','https://app.23cabs.ca','https://p678vzcd-3000.inc1.devtunnels.ms'],
  credentials: true, // Allow credentials (cookies)
  methods: 'GET,POST,PUT,PATCH,DELETE,OPTIONS', // Allowed methods
  allowedHeaders: 'Content-Type,Authorization,clientId',
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
app.use('/uploads/vehicleVariants', express.static(path.join(__dirname, '..', 'uploads/vehicleVariants')));
app.use('/uploads/user', express.static(path.join(__dirname, '..', 'uploads/user')));
app.use('/uploads/intro', express.static(path.join(__dirname, '..', 'uploads/intro')));
app.use('/uploads/documentImage', express.static(path.join(__dirname, '..', 'uploads/documentImage')));
app.use('/uploads/setting', express.static(path.join(__dirname, '..', 'uploads/setting')));
app.use('/uploads/promo', express.static(path.join(__dirname, '..', 'uploads/promo')));
app.use('/uploads/dispatcher', express.static(path.join(__dirname, '..', 'uploads/dispatcher')));
app.use('/uploads/trips', express.static(path.join(__dirname, '..', 'uploads/trips')));
app.use('/uploads/brands', express.static(path.join(__dirname, '..', 'uploads/brands')));
app.use('/uploads/pushnotification', express.static(path.join(__dirname, '..', 'uploads/pushnotification')));
// API routes
app.use('/v1', routes);


app.get('/privacy-policy', (req, res) => {
  res.sendFile(path.join(__dirname, 'privacy_policy.html'));
});

/**
 * Authorize.Net hosted payment webview page.
 * Example:
 * /v1/payment/authorizenet/webview?token=BearerToken&amount=900&currency=usd&requestId=<tripId>&apiBase=https://api.example.com&successUrl=<url>&failureUrl=<url>&authHold=1
 */
app.get('/v1/payment/authorizenet/webview', authorizeNetWebviewPage);

app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
});

app.use(errorConverter);
app.use(errorHandler);


MqttService.listenToUserChanges();

module.exports = app;
