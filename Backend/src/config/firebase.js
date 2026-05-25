const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');  // Your Firebase service account key
var Firebase = require('firebase');
var GeoFire = require('geofire');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});



// const fire_db = Firebase.database();
// const driversRef = fire_db.ref().child('drivers');
// const geoFire = new GeoFire.GeoFire(driversRef);


module.exports ={
  admin
};
