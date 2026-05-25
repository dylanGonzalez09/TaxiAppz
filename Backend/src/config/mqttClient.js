const mqtt = require('mqtt');
const client = mqtt.connect(process.env.MQTT_BROKER_URL, {
    clean: true,
    protocolVersion: 5,
    properties: {
      maximumPacketSize: 1048576,
    },
  });
  
const driverLocationSchema = require('../models/driverLocation.model');
const mongoose = require('mongoose');

const MqttService = require('../services/mqtt/mqtt.service');

const { isPointInPolygon, sendPushNotification } = require('../utils/commonFunction');

const { Settings, TripDetails, Request, Driver } = require('../models')
const ObjectId = require('mongoose').Types.ObjectId;

const { mqttConfig } = require('./string')



const topics = [
    mqttConfig.DRIVER_LOCATION_UPDATE,
    mqttConfig.DRIVER_DETAIL,
    mqttConfig.USER_LISTEN_DRIVER,
    mqttConfig.USER_POST_ALL_DRIVERS,
    mqttConfig.USER_POST_VEHICLE_DRIVER,
    mqttConfig.WEB_POST_ALL_ZONE_DRIVERS,
    mqttConfig.WEB_GET_ALL_ZONE_DRIVERS,
    mqttConfig.USER_POST_TRIP_DRIVER,
    mqttConfig.POST_TRIP_DETAILS,
    mqttConfig.POST_TRIP_WAITING_TIME,
    mqttConfig.USER_REQUEST_PICKUP,
    mqttConfig.USER_REQUEST_DROP,
    mqttConfig.USER_REQUEST_STOP
];

client.on('connect', () => {

    client.subscribe(topics, { qos: 2 }, (err) => {
        if (err) {
            console.error('Failed to subscribe to topics:', err);
        } else {
            console.log(`Subscribed to topics: ${topics.join(', ')}`);
        }
    });
});

client.on('message', async (topic, message, packet) => {
    try {
        // Ignore retained messages
        if (packet.retain) {
            return;
        }

        // Log the received message
        switch (topic) {
            case mqttConfig.DRIVER_LOCATION_UPDATE: // mobile
                driverLocation(message);
                break;
            case mqttConfig.USER_POST_ALL_DRIVERS: // mobile
                getAllDriverLocation(message.toString());
                break;
            case mqttConfig.USER_POST_VEHICLE_DRIVER: // mobile
                getVehicleLocation(message.toString());
                break;
            case mqttConfig.USER_REQUEST_PICKUP: // mobile
                getpickupEditRequest(message.toString());
                break;
            case mqttConfig.USER_REQUEST_DROP: // mobile
                getEndEditRequest(message.toString());
                break;
            case mqttConfig.USER_REQUEST_STOP: // mobile
                getStopEditRequest(message.toString());
                break;
            case mqttConfig.WEB_POST_ALL_ZONE_DRIVERS: // 
                getAllZoneDriverLocation(message.toString());
                break;
            case mqttConfig.USER_POST_TRIP_DRIVER: // web
                postTripDrivers(message.toString());
                break;
            case mqttConfig.POST_TRIP_DETAILS: // web
                postTripDetails(message.toString());
                break;  // Added missing break statement
            case mqttConfig.POST_TRIP_WAITING_TIME: // web
                postTripWaiting(message.toString());
                break;
            case mqttConfig.USER_LISTEN_DRIVER: // mobile
                break;
            case mqttConfig.DRIVER_DETAIL: // mobile
                break;
            case mqttConfig.WEB_GET_ALL_ZONE_DRIVERS: // web
                // No action needed for these cases
                break;
            default:
                console.warn(`Unhandled topic: ${topic}`);
        }


    } catch (error) {
        console.error(`Error handling message from topic ${topic}:`, error);
    }
});

const driverLocation = async (data) => {
    try {
        let jsonData;
        if (typeof data === "object") {

            const dataStr = data.toString("utf-8");

            const jsonStr = dataStr
                .replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":')
                .replace(/([{,]\s*"[^"]+":\s*)([a-zA-Z0-9_]+)(?=[,}])/g, '$1"$2"')
                .replace(/([{,]\s*)([a-zA-Z0-9_]+)(?=\s*[:,}])/g, '$1"$2"')
                .replace(/'/g, '"')
                .replace(/,(\s*[}\]])/g, '$1')
                .replace(/:\s*(?=[,}])/g, ': null');

            jsonData = JSON.parse(jsonStr);

        } else if (typeof data === "string") {

            const jsonStr = data
                .replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":')
                .replace(/([{,]\s*"[^"]+":\s*)([a-zA-Z0-9_]+)(?=[,}])/g, '$1"$2"')
                .replace(/([{,]\s*)([a-zA-Z0-9_]+)(?=\s*[:,}])/g, '$1"$2"')
                .replace(/'/g, '"')
                .replace(/,(\s*[}\]])/g, '$1')
                .replace(/:\s*(?=[,}])/g, ': null');

            jsonData = JSON.parse(jsonStr);
        } else {
            throw new Error("Unsupported data format");
        }


        const { driverId } = jsonData;


        const transformedData = {
            driverId: jsonData.driverId,
            userId: jsonData.userId,
            location: {
                type: 'Point',
                coordinates: [jsonData.longitude, jsonData.latitude],
            },
            bearing: jsonData.bearing || 0.0,
            latitude: jsonData.latitude,
            longitude: jsonData.longitude,
            serviceType: jsonData.serviceType,
            vehicleId: jsonData.vehicleId ? new ObjectId(jsonData.vehicleId) : null,
            lastUpdated: jsonData.lastUpdated,
            isOnline: jsonData.isOnline,
            isAvailable: jsonData.isAvailable,
            speed: jsonData.speed,
            zoneId:jsonData.primaryZone,
            secondaryZone: parseSecondaryZone(jsonData.secondaryZone)
        };
        
        // Only include vehicleId in update if it exists
        const updateObj = { ...transformedData };
        if (!jsonData.vehicleId) {
            delete updateObj.vehicleId;
        }

        
        const result = await driverLocationSchema.findOneAndUpdate(
            { driverId },
            { $set: updateObj },
            { upsert: true, new: true }
        );

    } catch (error) {
        console.error("Error processing driver location2:", error);
    }

};




// Helper function to parse secondaryZone
function parseSecondaryZone(zoneData) {
    // If already an array, return as is (with ObjectId conversion)
    if (Array.isArray(zoneData)) {
        return zoneData.map(id => new ObjectId(id));
    }

    // If string, try to parse it
    if (typeof zoneData === 'string') {
        try {
            // Remove any extra quotes and parse JSON
            const cleaned = zoneData.replace(/^['"]|['"]$/g, '');
            const parsed = JSON.parse(cleaned);
            if (Array.isArray(parsed)) {
                return parsed.map(id => new ObjectId(id));
            }
            return [new ObjectId(parsed)];
        } catch (e) {
            // If parsing fails, return empty array
            return [];
        }
    }
    // For other cases (null, undefined, etc.), return empty array
    return [];
}


const getAllDriverLocation = async (message) => {

    const settingsPlaces = await Settings.findOne({ name: 'driverShowingKm' });
    const RADIUS_IN_KM = settingsPlaces.value;
    const METERS_PER_KM = 1000;
    let maxDistanceInMeters = RADIUS_IN_KM * METERS_PER_KM;
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

    try {
        const fixedMessage = message
            .replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":')
            .replace(/([{,]\s*"[^"]+":\s*)([a-zA-Z0-9_]+)(?=[,}])/g, '$1"$2"')
            .replace(/([{,]\s*)([a-zA-Z0-9_]+)(?=\s*[:,}])/g, '$1"$2"')
            .replace(/'/g, '"')
            .replace(/,(\s*[}\]])/g, '$1')
            .replace(/:\s*(?=[,}])/g, ': null');

        const parsedMessage = JSON.parse(fixedMessage);

        const { latitude, longitude, userId } = parsedMessage;


        let nearbyDrivers = await driverLocationSchema.find({
            location: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [longitude, latitude],
                    },
                    $maxDistance: maxDistanceInMeters,
                },
            },
            lastUpdated: { $gte: thirtyMinutesAgo },
            isAvailable: true
        }).populate({
            path: 'vehicleId',
            model: 'Vehicle',
            select: 'vehicleName'
        });
        // const topic = `user/getAllDrivers/` + userId;

        if (nearbyDrivers != null && Array.isArray(nearbyDrivers)) {
            nearbyDrivers = nearbyDrivers.map(driversData => {
                const obj = driversData.toObject();

                if (obj.vehicleId && typeof obj.vehicleId === 'object') {
                    obj.vehicleName = obj.vehicleId.vehicleName;
                    obj.vehicleId = obj.vehicleId._id;
                }

                return obj;
            });
        }
        const topic = mqttConfig.USER_GET_ALL_DRIVERS + "" + userId;

        await MqttService.publishMessage(topic, JSON.stringify(nearbyDrivers));
    } catch (error) {
        console.error("Error processing driver location:", error);
    }
};


const getAllZoneDriverLocation = async (message) => {



    try {
        const fixedMessage = message
            .replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":')
            .replace(/([{,]\s*"[^"]+":\s*)([a-zA-Z0-9_]+)(?=[,}])/g, '$1"$2"')
            .replace(/([{,]\s*)([a-zA-Z0-9_]+)(?=\s*[:,}])/g, '$1"$2"')
            .replace(/'/g, '"')
            .replace(/,(\s*[}\]])/g, '$1')
            .replace(/:\s*(?=[,}])/g, ': null');

        const parsedMessage = JSON.parse(fixedMessage);

        const allDrivers = await driverLocationSchema.find().populate([
            {
                path: 'userId',
                select: 'firstName',
            },
            {
                path: 'vehicleId',
                select: 'vehicleName image',
            }
        ]);

        const driversWithinPolygon = allDrivers.filter(driver => {
            const point = [driver.longitude, driver.latitude];
            return isPointInPolygon(point, parsedMessage);
        });

        const topic = mqttConfig.WEB_GET_ALL_ZONE_DRIVERS;
        // const topic = `web/getAllZoneDrivers`;
        await MqttService.publishMessage(topic, JSON.stringify(driversWithinPolygon));

    } catch (error) {
        // Step 6: Error handling
        console.error("Error processing driver location:", error);
    }
};



const getVehicleLocation = async (message) => {
    const settingsPlaces = await Settings.findOne({ name: 'driverShowingKm' });
    const RADIUS_IN_KM = settingsPlaces.value;
    const METERS_PER_KM = 10000;
    let maxDistanceInMeters = RADIUS_IN_KM * METERS_PER_KM;
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

    try {
        const fixedMessage = message
            .replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":')
            .replace(/([{,]\s*"[^"]+":\s*)([a-zA-Z0-9_]+)(?=[,}])/g, '$1"$2"')
            .replace(/([{,]\s*)([a-zA-Z0-9_]+)(?=\s*[:,}])/g, '$1"$2"')
            .replace(/'/g, '"')
            .replace(/,(\s*[}\]])/g, '$1')
            .replace(/:\s*(?=[,}])/g, ': null');

        const parsedMessage = JSON.parse(fixedMessage);

        const { latitude, longitude, serviceType, vehicleId, userId } = parsedMessage;

        const nearbyDrivers = await driverLocationSchema.find({
            location: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [longitude, latitude],
                    },
                    $maxDistance: thirtyMinutesAgo,
                },
            },
            vehicleId: new ObjectId(vehicleId),
            lastUpdated: { $gte: thirtySecondsAgo },
            isAvailable: true
        });


        // const topic = `user/getVehicle/driver/${userId}`;


        const topic = mqttConfig.USER_GET_VEHICLE_DRIVERS + "" + userId;


        await MqttService.publishMessage(topic, JSON.stringify(nearbyDrivers));
    } catch (error) {
        console.error("Error processing driver location:", error);
    }
};



const getpickupEditRequest = async (messageData) => {

    try {
        const parsedMessage = typeof messageData === 'string'
            ? JSON.parse(messageData)
            : messageData;


        const { pick_lat, pick_lng, requestId, driverId, address } = parsedMessage;


        const transformedData = {
            locationChanged: true,
            locationChangeAddress: JSON.stringify(parsedMessage),
        };

        const result = await Request.findOneAndUpdate(
            { _id: requestId },
            { $set: transformedData },
            { upsert: true, new: true });


        // const topic = `driver/request/${driverId}`;


        const topic = mqttConfig.DRIVER_REQUEST + "" + driverId;


        const message = {
            title: "LOCATION CHANGE",
            message: JSON.stringify(parsedMessage),
        }

        await MqttService.publishMessage(topic, JSON.stringify(message));

        let driverData = await Driver.findById(driverId);

        await sendPushNotification(driverData.userId, {
            title: "Location Changes",
            message: "User Changes The Location Approve or Reject",
        });
    } catch (error) {
        console.error("Error processing driver location:", error);
    }
};



const getEndEditRequest = async (messageData) => {

    try {
        const parsedMessage = typeof messageData === 'string'
            ? JSON.parse(messageData)
            : messageData;

        const { stop_lat, stop_lng, stop_address, requestId, driverId, drop_lat, drop_lng, drop_address } = parsedMessage;

        const transformedData = {
            locationChanged: true,
            locationChangeAddress: JSON.stringify(parsedMessage),
        };

        const result = await Request.findOneAndUpdate(
            { _id: requestId },
            { $set: transformedData },
            { upsert: true, new: true });


        // const topic = `driver/request/${driverId}`;


        const topic = mqttConfig.DRIVER_REQUEST + "" + driverId;


        const message = {
            title: "LOCATION CHANGE",
            message: JSON.stringify(parsedMessage),
        }

        await MqttService.publishMessage(topic, message);

        let driverData = await Driver.findById(driverId);

        await sendPushNotification(driverData.userId, {
            title: "Location Changes",
            message: "User Changes The Location Approve or Reject",
        });
    } catch (error) {
        console.error("Error processing driver location:", error);
    }
};


const getStopEditRequest = async (messageData) => {

    try {
        const parsedMessage = typeof messageData === 'string'
            ? JSON.parse(messageData)
            : messageData;

        const { stop_lat, stop_lng, stop_address, requestId, driverId, drop_lat, drop_lng, drop_address } = parsedMessage;

        const transformedData = {
            locationChanged: true,
            locationChangeAddress: JSON.stringify(parsedMessage),
        };

        const result = await Request.findOneAndUpdate(
            { _id: requestId },
            { $set: transformedData },
            { upsert: true, new: true });


        // const topic = `driver/request/${driverId}`;

        const topic = mqttConfig.DRIVER_REQUEST + "" + driverId;


        const mqttMessage = {
            title: "LOCATION CHANGE",
            message: JSON.stringify(parsedMessage),
        }

        await MqttService.publishMessage(topic, mqttMessage);

        let driverData = await Driver.findById(driverId);

        await sendPushNotification(driverData.userId, {
            title: "Location Changes",
            message: "User Changes The Location Approve or Reject",
        });
    } catch (error) {
        console.error("Error processing driver location:", error);
    }
};


const postTripDrivers = async (message) => {

    try {
        const fixedMessage = message
            .replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":')
            .replace(/([{,]\s*"[^"]+":\s*)([a-zA-Z0-9_]+)(?=[,}])/g, '$1"$2"')
            .replace(/([{,]\s*)([a-zA-Z0-9_]+)(?=\s*[:,}])/g, '$1"$2"')
            .replace(/'/g, '"')
            .replace(/,(\s*[}\]])/g, '$1')
            .replace(/:\s*(?=[,}])/g, ': null');

        const parsedMessage = JSON.parse(fixedMessage);

        const { driverId, userId } = parsedMessage;


        const drivers = await driverLocationSchema.find({ driverId: new ObjectId(driverId) });

        // const topic = `user/getTripDriver/` + userId;

        const topic = mqttConfig.USER_GET_TRIP_DRIVER + "" + userId;

        await MqttService.publishMessage(topic, JSON.stringify(drivers[0]));

    } catch (error) {
        // Step 6: Error handling
        console.error("Error processing driver location:", error);
    }
};



const postTripDetails = async (message) => {
    try {
        // Parse message to JSON
        const fixedMessage = message
            .replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":')
            .replace(/([{,]\s*"[^"]+":\s*)([a-zA-Z0-9_]+)(?=[,}])/g, '$1"$2"')
            .replace(/([{,]\s*)([a-zA-Z0-9_]+)(?=\s*[:,}])/g, '$1"$2"')
            .replace(/'/g, '"')
            .replace(/,(\s*[}\]])/g, '$1')
            .replace(/:\s*(?=[,}])/g, ': null');

        const parsedMessage = JSON.parse(fixedMessage);

        const { driverId, userId, requestId, beforeArrived, afterArrived, location } = parsedMessage;

        const tripDetails = await TripDetails.findOne({ userId, driverId, requestId });

        if (location) {
            if (tripDetails) {
                tripDetails.location.push({
                    lat: location ? location.lat : 0,
                    lon: location ? location.lon : 0,
                    timestamp: new Date()
                });
                await tripDetails.save();
            } else {
                await TripDetails.create({
                    userId,
                    driverId,
                    requestId,
                    beforeArrived,
                    afterArrived,
                    location: [{ lat: location ? location.lat : 0, lon: location ? location.lon : 0 }]
                });
            }
        }


        // const topic = `get/tripDetails/${requestId}`;


        const topic = mqttConfig.GET_TRIP_DETAILS + "" + requestId;


        await MqttService.publishMessage(topic, JSON.stringify(tripDetails));

    } catch (error) {
        console.error("Error processing trip details:", error);
    }
};


const postTripWaiting = async (message) => {
    try {
        const fixedMessage = message
            .replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":')
            .replace(/([{,]\s*"[^"]+":\s*)([a-zA-Z0-9_]+)(?=[,}])/g, '$1"$2"')
            .replace(/([{,]\s*)([a-zA-Z0-9_]+)(?=\s*[:,}])/g, '$1"$2"')
            .replace(/'/g, '"')
            .replace(/,(\s*[}\]])/g, '$1')
            .replace(/:\s*(?=[,}])/g, ': null');

        const parsedMessage = JSON.parse(fixedMessage);

        const { requestId, beforeArrived, afterArrived } = parsedMessage;

        const tripDetails = {
            requestId: requestId,
            beforeArrived: beforeArrived,
            afterArrived: afterArrived
        }

        // const topic = `get/trip/waitingTime/${requestId}`;


        const topic = mqttConfig.GET_TRIP_WAITING_TIME + "" + requestId;


        await MqttService.publishMessage(topic, JSON.stringify(tripDetails));

    } catch (error) {
        console.error("Error processing trip details:", error);
    }
};


module.exports = client;
