const mongoose = require('mongoose');

const modelName = 'driverBidListView';

const driverBidListViewSchema = new mongoose.Schema(
  {},
  {
    collection: 'driverBidListView',
    strict: false,
    autoCreate: false
  }
);

module.exports = mongoose.models[modelName] || mongoose.model(modelName, driverBidListViewSchema);
