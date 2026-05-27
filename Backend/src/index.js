const mongoose = require('mongoose');
const app = require('./app');
const config = require('./config/config');
const logger = require('./config/logger');
const {
  createDriverRequestView,
  createUserRequestView,
  createRequestListView,
  DriverDailyReport,
} = require('./utils/views/createView'); // Import the createView function

let server;

mongoose
  .connect(config.mongoose.url)
  .then(() => {
    logger.info('Connected to MongoDB');
    server = app.listen(config.port, () => {
      logger.info(`Listening to port ${config.port}`);
    });
  })
  .catch((error) => {
    logger.error('Error connecting to MongoDB Atlas:', error);
  });

mongoose.connection.once('open', async () => {
  try {
    await Promise.all([DriverDailyReport(), createDriverRequestView(), createUserRequestView(), createRequestListView()]);
    logger.info('All MongoDB views created successfully');
  } catch (error) {
    logger.error('Failed to create view(s):', error);
  }
});

const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info('Server closed');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error) => {
  logger.error(error);
  exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  if (server) {
    server.close();
  }
});
