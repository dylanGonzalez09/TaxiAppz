const mongoose = require('mongoose');

const modelName = 'userRequestView';

const userRequestView = new mongoose.Schema(
  {},
  {
    collection: 'userRequestView',
    strict: false,
    autoCreate: false,
  },
);

module.exports = mongoose.models[modelName] || mongoose.model(modelName, userRequestView);
