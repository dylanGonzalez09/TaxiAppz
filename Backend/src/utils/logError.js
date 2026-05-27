const { ErrorLog } = require('../models');

const logErrorToDB = async (err, url, meta = {}) => {
  await ErrorLog.create({
    message: err.message,
    stack: err.stack,
    url,
    method: meta.method || null,
    body: meta.body || null,
    user: meta.user || null,
    statusCode: err.statusCode || 500,
    timestamp: new Date(),
  });
};

module.exports = logErrorToDB;

const deleteOldErrors = async () => {
  try {
    const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
    const result = await ErrorLog.deleteMany({ timestamp: { $lt: tenDaysAgo } });
  } catch (err) {
    console.error('Error during log cleanup:', err);
  }
};

setInterval(deleteOldErrors, 24 * 60 * 60 * 1000); // every 24 hours
