const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); // Your Firebase service account key

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Realtime DB + GeoFire (uncomment and use firebase/compat/app + firebase/compat/database if needed):
// const Firebase = require('firebase/compat/app');
// const { getDatabase } = require('firebase/compat/database');
// const GeoFire = require('geofire');

module.exports = {
  admin,
};
