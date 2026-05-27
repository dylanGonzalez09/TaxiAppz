const mongoose = require('mongoose');

const modelName = 'driverRequestDetailedView';

const driverRequestDetailedView = new mongoose.Schema(
  {},
  {
    collection: 'driverRequestDetailedView',
    strict: false,
    autoCreate: false,
  },
);

module.exports = mongoose.models[modelName] || mongoose.model(modelName, driverRequestDetailedView);
