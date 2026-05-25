// const driversRef = require('../../../config/firebase').driversRef;
// const geoFire = require('../../../config/firebase').geoFire;

// const getGeoData = (geoQuery) => {
//     return new Promise((resolve, reject) => {
//         let fire_drivers = [];
//         geoQuery.on("key_entered", (key, location, distance) => {
//             driversRef.child(key).on('value', (snap) => {
//                 let driver = snap.val();
//                 let date = new Date();
//                 let timestamp = date.getTime();
//                 let conditional_timestamp = timestamp - (30 * 60 * 1000);

//                 if (conditional_timestamp < driver.updated_at) {
//                     if (driver.is_active == 1 && driver.is_available == 1) {
//                         driver.distance = distance;
//                         fire_drivers.push(driver);
//                     }
//                 }
//                 resolve(fire_drivers);
//             });
//         });
//     });
// };

// const queryGeoLocation = async (lat, lng, vehicle_type, radius) => {
//     const geoQuery = geoFire.query({ center: [lat, lng], radius });
//     return await getGeoData(geoQuery);
// };

// const queryGetDriversNotUpdated = async (lat, lng, radius) => {
//     const geoQuery = geoFire.query({ center: [lat, lng], radius });
//     return await getGeoData(geoQuery);
// };

// const queryGetDriversLogout = async (lat, lng, radius) => {
//     const geoQuery = geoFire.query({ center: [lat, lng], radius });
//     return await getGeoData(geoQuery);
// };

// const queryGetDrivers = async () => {
//     const geoQuery = geoFire.query({});
//     return await getGeoData(geoQuery);
// };

// module.exports = {
//     queryGeoLocation,
//     queryGetDriversNotUpdated,
//     queryGetDriversLogout,
//     queryGetDrivers
// };
