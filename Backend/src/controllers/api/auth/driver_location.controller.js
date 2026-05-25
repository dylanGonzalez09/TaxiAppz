const driverService = require('../../../services/api/auth/driver_location.service');

const queryGeoLocation = async (req, res) => {
    try {
        const { lat, lng, vehicle_type, radius } = req.params;
        const data = await driverService.queryGeoLocation(parseFloat(lat), parseFloat(lng), vehicle_type, parseInt(radius));
        res.send({ success: true, message: 'success', data });
    } catch (err) {
        res.status(500).send("Error: " + err);
    }
};

const queryGetDriversNotUpdated = async (req, res) => {
    try {
        const { lat, lng, radius } = req.params;
        const data = await driverService.queryGetDriversNotUpdated(parseFloat(lat), parseFloat(lng), parseInt(radius));
        res.send({ success: true, message: 'success', data });
    } catch (err) {
        res.status(500).send("Error: " + err);
    }
};

const queryGetDriversLogout = async (req, res) => {
    try {
        const { lat, lng, radius } = req.params;
        const data = await driverService.queryGetDriversLogout(parseFloat(lat), parseFloat(lng), parseInt(radius));
        res.send({ success: true, message: 'success', data });
    } catch (err) {
        res.status(500).send("Error: " + err);
    }
};

const queryGetDrivers = async (req, res) => {
    try {
        const data = await driverService.queryGetDrivers();
        res.send({ success: true, message: 'success', data });
    } catch (err) {
        res.status(500).send("Error: " + err);
    }
};

module.exports = {
    queryGeoLocation,
    queryGetDriversNotUpdated,
    queryGetDriversLogout,
    queryGetDrivers
};
