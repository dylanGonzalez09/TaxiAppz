const mongoose = require('mongoose');
const app = require('./app');
const config = require('./config/config');
const logger = require('./config/logger');
const { createDriverRequestView, createUserRequestView, createRequestListView,DriverDailyReport,createDriverBidListView } = require('./utils/views/createView'); // Import the createView function

let server;

mongoose.connect(config.mongoose.url)
  .then(() => {
    logger.info('Connected to MongoDB');
    server = app.listen(config.port, () => {
      logger.info(`Listening to port ${config.port}`);
    });
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB Atlas:', error);
  });

mongoose.connection.once('open', async () => {
  console.log('MongoDB connection is ready');

  try {

    await DriverDailyReport()
      .then(() => {
        console.log('DriverDailyReport recreated successfully');
      })
      .catch((error) => {
        console.error('Failed to recreate view:', error);
      });

  } catch (error) {
    logger.error('Failed to create view:', error);
  }

  try {

    await createDriverRequestView()
      .then(() => {
        console.log('createDriverRequestView recreated successfully');
      })
      .catch((error) => {
        console.error('Failed to recreate view:', error);
      });

  } catch (error) {
    logger.error('Failed to create view:', error);
  }

  try {

    await createUserRequestView()
      .then(() => {
        console.log('createUserRequestView recreated successfully');
      })
      .catch((error) => {
        console.error('Failed to recreate view:', error);
      });

  } catch (error) {
    logger.error('Failed to create view:', error);
  }

  try {
    await createRequestListView()
      .then(() => {
        console.log('createRequestListView recreated successfully');
      })
      .catch((error) => {
        console.error('Failed to recreate view:', error);
      });

  } catch (error) {
    logger.error('Failed to create view:', error);
  }

  try {
    await createDriverBidListView()
      .then(() => {
        console.log('createDriverBidListView recreated successfully');
      })
      .catch((error) => {
        console.error('Failed to recreate view:', error);
      });

  } catch (error) {
    logger.error('Failed to create view:', error);
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
