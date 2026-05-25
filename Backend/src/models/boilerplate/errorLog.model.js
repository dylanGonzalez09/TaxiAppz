const mongoose = require('mongoose');
const { toJSON, paginate } = require('../plugins');

const errorLogSchema = new mongoose.Schema({
  message: String,
  stack: String,
  url: String,
  method: String,
  body: Object,
  user: Object,
  statusCode: Number,
  timestamp: {
    type: Date,
    default: Date.now,
    expires: 864000  // TTL in seconds = 10 days (10 * 24 * 60 * 60)
  },
});


errorLogSchema.plugin(paginate);

// ✅ TTL index will automatically delete logs after 10 days
module.exports = mongoose.model('ErrorLog', errorLogSchema);
