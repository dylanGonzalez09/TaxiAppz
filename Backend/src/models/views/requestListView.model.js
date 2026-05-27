const mongoose = require('mongoose');

const modelName = 'requestListView';

const requestListView = new mongoose.Schema(
  {},
  {
    collection: 'requestListView',
    strict: false,
    autoCreate: false,
  },
);

module.exports = mongoose.models[modelName] || mongoose.model(modelName, requestListView);
