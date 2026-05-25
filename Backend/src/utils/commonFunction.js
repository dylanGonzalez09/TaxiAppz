const axios = require('axios');

const { Settings, Zone, PromoCode, Request, DriverLocation, User, Notification, Driver, Wallet, WalletTransaction, Client, ClientToken,Demo ,Counter} = require('../models');

const ApiError = require('./ApiError');
const ObjectId = require('mongoose').Types.ObjectId;
const admin = require('firebase-admin');
const { decode } = require('@googlemaps/polyline-codec');
const httpStatus = require('http-status');

const voodooSMS = require('../config/voodoosms');
const { smsMessage } = require('../config/string')
const TwilioSMS = require('../config/twiliosms');


const getClientId = async (req) => {

    clientId = '';

    if (!req.headers.clientid) {

        throw new ApiError(httpStatus.NOT_FOUND, 'ClientID not found');

    } else {

        clientId = req.headers.clientid;

    }

    return clientId;
}

async function autocompletePlaces(keyword, location) {
    // Get the API key from settings
    const settingsPlaces = await Settings.findOne({ name: 'geoCoderApiKey' });
    
    if (!settingsPlaces || !settingsPlaces.value) {
        throw new Error('Google Maps API key not found in settings');
    }
    
    const apiKey = settingsPlaces.value;

    const url = 'https://maps.googleapis.com/maps/api/place/autocomplete/json';

    try {
        const params = {
            input: keyword,
            key: apiKey,
        };
        
        // Add location bias if provided (optional)
        if (location) {
            params.location = location;
            params.radius = 40075000; // 50 km in meters
            // Don't use strictbounds - it's too restrictive
        }

        const response = await axios.get(url, { params });
        
        // Check for API errors
        if (response.data.status === 'REQUEST_DENIED') {
            console.error('Google Places API error:', response.data.error_message);
            throw new Error('Google Places API access denied: ' + (response.data.error_message || 'Check API key'));
        }
        
        if (response.data.status === 'ZERO_RESULTS') {
            return [];
        }

        const predictions = response.data.predictions || [];

        // Map predictions to our format
        const results = predictions.map((prediction) => {
            return {
                place_id: prediction.place_id,
                description: prediction.description,
                structured_formatting: prediction.structured_formatting,
            };
        });

        return results;
    } catch (error) {
        console.error('Error fetching autocomplete places:', error.message);
        throw new Error('Failed to fetch autocomplete places');
    }
}


async function directional(pickup_lat, pickup_long, drop_lat, drop_long, stops = null) {
    try {
        const settings_directional = await Settings.findOne({ name: 'geoCoderApiKey' });

        if (!settings_directional) {
            throw new Error('API key not found');
        }

        const origin = `${pickup_lat},${pickup_long}`;
        const destination = `${drop_lat},${drop_long}`;

        let waypointsParam = '';
        if (stops) {
            const waypoints = JSON.parse(stops);
            waypointsParam = waypoints.map(waypoint => `${waypoint.way_lat},${waypoint.way_lng}`).join('|');
        }

        let url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${settings_directional.value}`;

        if (waypointsParam) {
            url += `&waypoints=${waypointsParam}`;
        }

        // Make the HTTP request to the Google Directions API
        const response = await axios.get(url);
        const result = response.data;

        if (result.routes && result.routes.length > 0) {
            const route = result.routes[0].overview_polyline.points;
            return { route };
        } else {
            throw new Error('No routes found');
        }
    } catch (error) {
        console.error('Error in directional function:', error);
        throw error;
    }
}



async function geocodeApi(address) {
    try {
        const settings_geocode = await Settings.findOne({ name: 'geoCoderApiKey' });

        if (!settings_geocode) {
            throw new Error('API key not found');
        }

        const apiKey = settings_geocode.value;
        const url = `https://maps.googleapis.com/maps/api/geocode/json`;

        // Make the HTTP request to the Google Geocoding API
        const response = await axios.get(url, {
            params: {
                address: address,
                key: apiKey,
            }
        });

        const data = response.data;

        if (data.status === 'OK' && data.results[0]) {
            const result = data.results[0];
            const latitude = result.geometry.location.lat;
            const longitude = result.geometry.location.lng;

            return {
                latitude: latitude,
                longitude: longitude
            };
        } else {
            // Handle geocoding errors
            return { error: 'Geocoding failed' };
        }
    } catch (error) {
        console.error('Error in geocodeApi function:', error);
        throw error;
    }
}


async function reverseGeocode(latitude) {
    try {
        const settings_geocode = await Settings.findOne({ name: 'geoCoderApiKey' });

        if (!settings_geocode) {
            throw new Error('API key not found');
        }

        const apiKey = settings_geocode.value;
        const url = `https://maps.googleapis.com/maps/api/geocode/json`;

        const response = await axios.get(url, {
            params: {
                latlng: latitude,
                key: apiKey,
            }
        });

        const data = response.data;

        if (data.status === 'OK' && data.results[0]) {
            const result = data.results[0];
            const address = result.formatted_address;
            return address;
        } else {
            return { error: 'Reverse geocoding failed' };
        }
    } catch (error) {
        console.error('Error in reverseGeocode function:', error);
        throw error;
    }
}


async function getZoneDetails(clientId) {
    try {
        const zoneDetails = await Zone.aggregate([
            {
                $match: {
                    clientId: new ObjectId(clientId),
                    status: true
                }
            },
            {
                $lookup: {
                    from: 'countries',
                    localField: 'country',
                    foreignField: '_id',
                    as: 'countrydetails',
                },
            },
            {
                $unwind: '$countrydetails',
            },
            {
                $lookup: {
                    from: 'zoneprices',
                    localField: '_id',
                    foreignField: 'zoneId',
                    as: 'zonePriceDetails',
                },
            },
            {
                $lookup: {
                    from: 'zonesurgeprices',
                    localField: '_id',
                    foreignField: 'zoneId',
                    as: 'zoneSurgePriceDetails',
                },
            },
            {
                $lookup: {
                    from: 'vehicles',
                    localField: 'zonePriceDetails.vehicleId',
                    foreignField: '_id',
                    as: 'vehicleDetails',
                },
            },
            {
                $lookup: {
                    from: 'Categorys',
                    localField: 'vehicleDetails.categoryId',
                    foreignField: '_id',
                    as: 'CategoryDetails',
                },
            },
            {
                $project: {
                    _id: 1,
                    zoneName: 1,
                    unit: 1,
                    primaryZoneId: 1,
                    country: 1,
                    biddingZone:1,
                    adminCommissionType: 1,
                    adminCommission: 1,
                    mapZone: 1,
                    paymentTypes: 1,
                    nonServiceZone: 1,
                    zoneLevel: 1,
                    typesId: 1,
                    createdBy: 1,
                    clientId: 1,
                    status: 1,
                    'countrydetails.name': 1,
                    'countrydetails.currency_name': 1,
                    'countrydetails.currency_code': 1,
                    'countrydetails.currency_symbol': 1,
                    'countrydetails.capital': 1,
                    zonePriceDetails: {
                        $map: {
                            input: '$zonePriceDetails',
                            as: 'priceDetail',
                            in: {
                                _id: '$$priceDetail._id',
                                zoneId: '$$priceDetail.zoneId',
                                ridenowBasePrice: { $toDouble: '$$priceDetail.ridenowBasePrice' },
                                ridenowPricePerTime: '$$priceDetail.ridenowPricePerTime',
                                ridenowBaseDistance: '$$priceDetail.ridenowBaseDistance',
                                ridenowPricePerDistance: { $toDouble: '$$priceDetail.ridenowPricePerDistance' },
                                ridenowFreeWaitingTime: '$$priceDetail.ridenowFreeWaitingTime',
                                ridenowFreeWaitingTimeAfterStart: '$$priceDetail.ridenowFreeWaitingTimeAfterStart',
                                ridenowWaitingCharge: { $toDouble: '$$priceDetail.ridenowWaitingCharge' },
                                ridenowCancellationFeeAfterAccept: { $toDouble: '$$priceDetail.ridenowCancellationFeeAfterAccept' },
                                ridenowCancellationFeeAfterArrive: { $toDouble: '$$priceDetail.ridenowCancellationFeeAfterArrive' },
                                ridenowCancellationFeeAfterStart: { $toDouble: '$$priceDetail.ridenowCancellationFeeAfterStart' },
                                ridenowAdminCommissionType: '$$priceDetail.ridenowAdminCommissionType',
                                ridenowAdminCommission: '$$priceDetail.ridenowAdminCommission',
                                ridelaterBasePrice: { $toDouble: '$$priceDetail.ridelaterBasePrice' },
                                ridelaterPricePerTime: '$$priceDetail.ridelaterPricePerTime',
                                ridelaterBaseDistance: '$$priceDetail.ridelaterBaseDistance',
                                ridelaterPricePerDistance: { $toDouble: '$$priceDetail.ridelaterPricePerDistance' },
                                ridelaterFreeWaitingTime: '$$priceDetail.ridelaterFreeWaitingTime',
                                ridelaterFreeWaitingTimeStart: '$$priceDetail.ridelaterFreeWaitingTimeStart',
                                ridelaterWaitingCharge: { $toDouble: '$$priceDetail.ridelaterWaitingCharge' },
                                ridelaterCancellationFeeAfterAccept: { $toDouble: '$$priceDetail.ridelaterCancellationFeeAfterAccept' },
                                ridelaterCancellationFeeAfterArrive: { $toDouble: '$$priceDetail.ridelaterCancellationFeeAfterArrive' },
                                ridelaterCancellationFeeAfterStart: { $toDouble: '$$priceDetail.ridelaterCancellationFeeAfterStart' },
                                ridelaterAdminCommissionType: '$$priceDetail.ridelaterAdminCommissionType',
                                ridelaterAdminCommission: '$$priceDetail.ridelaterAdminCommission',
                                status: '$$priceDetail.status',
                                createdBy: '$$priceDetail.createdBy',
                                createdAt: '$$priceDetail.createdAt',
                                updatedAt: '$$priceDetail.updatedAt',
                                vehicleDetails: {
                                    $arrayElemAt: [
                                        {
                                            $filter: {
                                                input: '$vehicleDetails', // Array of all vehicles joined earlier
                                                as: 'vehicle',
                                                cond: { $eq: ['$$vehicle._id', '$$priceDetail.vehicleId'] }, // Match the vehicleId from price details
                                            },
                                        },
                                        0, // Pick the first element from the filtered results (which should be the matching vehicle)
                                    ],
                                }
                            }
                        }
                    },
                    zoneSurgePriceDetails: {
                        $map: {
                            input: '$zoneSurgePriceDetails',
                            as: 'surgePriceDetail',
                            in: {
                                _id: '$$surgePriceDetail._id',
                                zoneId: '$$surgePriceDetail.zoneId',
                                vehicleId: '$$surgePriceDetail.vehicleId',
                                surgePrice: { $toDouble: '$$surgePriceDetail.surgePrice' },
                                surgeDistancePrice: { $toDouble: '$$surgePriceDetail.surgeDistancePrice' },
                                startTime: '$$surgePriceDetail.startTime',
                                endTime: '$$surgePriceDetail.endTime',
                                availableDays: '$$surgePriceDetail.availableDays',
                                status: '$$surgePriceDetail.status',
                                createdBy: '$$surgePriceDetail.createdBy',
                                createdAt: '$$surgePriceDetail.createdAt',
                                updatedAt: '$$surgePriceDetail.updatedAt',
                            }
                        }
                    }
                }
            }
        ]);

        return zoneDetails
    } catch (error) {

    }
}

async function webGetZoneDetails() {
    try {
        const zoneDetails = await Zone.aggregate([
            {
                $match: {
                    status: true
                }
            },
            {
                $lookup: {
                    from: 'countries',
                    localField: 'country',
                    foreignField: '_id',
                    as: 'countrydetails',
                },
            },
            {
                $unwind: '$countrydetails',
            },
            {
                $lookup: {
                    from: 'zoneprices',
                    localField: '_id',
                    foreignField: 'zoneId',
                    as: 'zonePriceDetails',
                },
            },
            {
                $lookup: {
                    from: 'zonesurgeprices',
                    localField: '_id',
                    foreignField: 'zoneId',
                    as: 'zoneSurgePriceDetails',
                },
            },
            {
                $lookup: {
                    from: 'vehicles',
                    localField: 'zonePriceDetails.vehicleId',
                    foreignField: '_id',
                    as: 'vehicleDetails',
                },
            },
            {
                $lookup: {
                    from: 'Categorys',
                    localField: 'vehicleDetails.categoryId',
                    foreignField: '_id',
                    as: 'CategoryDetails',
                },
            },
            {
                $project: {
                    _id: 1,
                    zoneName: 1,
                    unit: 1,
                    primaryZoneId: 1,
                    country: 1,
                    biddingZone:1,
                    adminCommissionType: 1,
                    adminCommission: 1,
                    mapZone: 1,
                    paymentTypes: 1,
                    nonServiceZone: 1,
                    zoneLevel: 1,
                    typesId: 1,
                    createdBy: 1,
                    clientId: 1,
                    status: 1,
                    'countrydetails.name': 1,
                    'countrydetails.currency_name': 1,
                    'countrydetails.currency_code': 1,
                    'countrydetails.currency_symbol': 1,
                    'countrydetails.capital': 1,
                    zonePriceDetails: {
                        $map: {
                            input: '$zonePriceDetails',
                            as: 'priceDetail',
                            in: {
                                _id: '$$priceDetail._id',
                                zoneId: '$$priceDetail.zoneId',
                                ridenowBasePrice: { $toDouble: '$$priceDetail.ridenowBasePrice' },
                                ridenowPricePerTime: '$$priceDetail.ridenowPricePerTime',
                                ridenowBaseDistance: '$$priceDetail.ridenowBaseDistance',
                                ridenowPricePerDistance: { $toDouble: '$$priceDetail.ridenowPricePerDistance' },
                                ridenowFreeWaitingTime: '$$priceDetail.ridenowFreeWaitingTime',
                                ridenowFreeWaitingTimeAfterStart: '$$priceDetail.ridenowFreeWaitingTimeAfterStart',
                                ridenowWaitingCharge: { $toDouble: '$$priceDetail.ridenowWaitingCharge' },
                                ridenowCancellationFeeAfterAccept: { $toDouble: '$$priceDetail.ridenowCancellationFeeAfterAccept' },
                                ridenowCancellationFeeAfterArrive: { $toDouble: '$$priceDetail.ridenowCancellationFeeAfterArrive' },
                                ridenowCancellationFeeAfterStart: { $toDouble: '$$priceDetail.ridenowCancellationFeeAfterStart' },
                                ridenowAdminCommissionType: '$$priceDetail.ridenowAdminCommissionType',
                                ridenowAdminCommission: '$$priceDetail.ridenowAdminCommission',
                                ridelaterBasePrice: { $toDouble: '$$priceDetail.ridelaterBasePrice' },
                                ridelaterPricePerTime: '$$priceDetail.ridelaterPricePerTime',
                                ridelaterBaseDistance: '$$priceDetail.ridelaterBaseDistance',
                                ridelaterPricePerDistance: { $toDouble: '$$priceDetail.ridelaterPricePerDistance' },
                                ridelaterFreeWaitingTime: '$$priceDetail.ridelaterFreeWaitingTime',
                                ridelaterFreeWaitingTimeStart: '$$priceDetail.ridelaterFreeWaitingTimeStart',
                                ridelaterWaitingCharge: { $toDouble: '$$priceDetail.ridelaterWaitingCharge' },
                                ridelaterCancellationFeeAfterAccept: { $toDouble: '$$priceDetail.ridelaterCancellationFeeAfterAccept' },
                                ridelaterCancellationFeeAfterArrive: { $toDouble: '$$priceDetail.ridelaterCancellationFeeAfterArrive' },
                                ridelaterCancellationFeeAfterStart: { $toDouble: '$$priceDetail.ridelaterCancellationFeeAfterStart' },
                                ridelaterAdminCommissionType: '$$priceDetail.ridelaterAdminCommissionType',
                                ridelaterAdminCommission: '$$priceDetail.ridelaterAdminCommission',
                                status: '$$priceDetail.status',
                                createdBy: '$$priceDetail.createdBy',
                                createdAt: '$$priceDetail.createdAt',
                                updatedAt: '$$priceDetail.updatedAt',
                                vehicleDetails: {
                                    $arrayElemAt: [
                                        {
                                            $filter: {
                                                input: '$vehicleDetails', // Array of all vehicles joined earlier
                                                as: 'vehicle',
                                                cond: { $eq: ['$$vehicle._id', '$$priceDetail.vehicleId'] }, // Match the vehicleId from price details
                                            },
                                        },
                                        0, // Pick the first element from the filtered results (which should be the matching vehicle)
                                    ],
                                }
                            }
                        }
                    },
                    zoneSurgePriceDetails: {
                        $map: {
                            input: '$zoneSurgePriceDetails',
                            as: 'surgePriceDetail',
                            in: {
                                _id: '$$surgePriceDetail._id',
                                zoneId: '$$surgePriceDetail.zoneId',
                                vehicleId: '$$surgePriceDetail.vehicleId',
                                surgePrice: { $toDouble: '$$surgePriceDetail.surgePrice' },
                                surgeDistancePrice: { $toDouble: '$$surgePriceDetail.surgeDistancePrice' },
                                startTime: '$$surgePriceDetail.startTime',
                                endTime: '$$surgePriceDetail.endTime',
                                availableDays: '$$surgePriceDetail.availableDays',
                                status: '$$surgePriceDetail.status',
                                createdBy: '$$surgePriceDetail.createdBy',
                                createdAt: '$$surgePriceDetail.createdAt',
                                updatedAt: '$$surgePriceDetail.updatedAt',
                            }
                        }
                    }
                }
            }
        ]);

        return zoneDetails
    } catch (error) {

    }
}

// async function getPickupZone(req) {
//     try {
//         let clientId = await getClientId(req);
//         const { pick_lat, pick_lng } = req.body;
//         const zones = await getZoneDetails(clientId);

//         if (!zones || zones.length === 0) {
//             return null;
//         }

//         const point = [pick_lng, pick_lat]; // User's coordinates in [lng, lat] format

//         console.log("Point:", point);

//         // First, check all secondary zones
//         const secondaryZones = zones.filter(zone => zone.zoneLevel === 'SECONDARY');
//         for (const zone of secondaryZones) {
//             if (zone.mapZone && Array.isArray(zone.mapZone) && zone.mapZone.length > 0) {
//                 const polygon = zone.mapZone;
//                 const isInside = isPointInPolygon(point, polygon);
//                 if (isInside) {
//                     return zone; // Return the secondary zone if point is inside
//                 }
//             }
//         }

//         // If no secondary zone found, check primary zones
//         const primaryZones = zones.filter(zone => zone.zoneLevel === 'PRIMARY');
//         for (const zone of primaryZones) {
//             if (zone.mapZone && Array.isArray(zone.mapZone) && zone.mapZone.length > 0) {
//                 const polygon = zone.mapZone;
//                 const isInside = isPointInPolygon(point, polygon);
//                 if (isInside) {
//                     return zone; // Return the primary zone if point is inside
//                 }
//             }
//         }

//         return null; // Return null if the point is not inside any zone
//     } catch (error) {
//         console.error('Error in getPickupZone function:', error);
//         throw error;
//     }
// }

async function getPickupZone(req) {
    try {
        let clientId = await getClientId(req);
        const { pick_lat, pick_lng } = req.body;
        const zones = await getZoneDetails(clientId);

        if (!zones || zones.length === 0) {
            return null;
        }

        const point = [pick_lng, pick_lat]; // User's coordinates in [lng, lat] format

        const matchingZones = [];

        // Check all zones (both secondary and primary)
        for (const zone of zones) {
            if (zone.mapZone && Array.isArray(zone.mapZone) && zone.mapZone.length > 0) {
                const polygon = zone.mapZone;
                const isInside = isPointInPolygon(point, polygon);
                if (isInside) {
                    // Calculate the area/radius of the zone
                    const zoneArea = calculatePolygonArea(polygon);
                    matchingZones.push({
                        zone: zone,
                        area: zoneArea
                    });
                }
            }
        }

        if (matchingZones.length === 0) {
            return null; // No zone contains the point
        }

        // Sort by area (smallest first) and return the zone with smallest area
        matchingZones.sort((a, b) => a.area - b.area);

    
        return matchingZones[0].zone;

    } catch (error) {
        console.error('Error in getPickupZone function:', error);
        throw error;
    }
}

async function webGetPickupZone(req) {
    try {
        const { pick_lat, pick_lng } = req.body;
        const zones = await webGetZoneDetails();

        if (!zones || zones.length === 0) {
            return null;
        }

        const point = [pick_lng, pick_lat]; // User's coordinates in [lng, lat] format

        const matchingZones = [];

        // Check all zones (both secondary and primary)
        for (const zone of zones) {
            if (zone.mapZone && Array.isArray(zone.mapZone) && zone.mapZone.length > 0) {
                const polygon = zone.mapZone;
                const isInside = isPointInPolygon(point, polygon);
                if (isInside) {
                    // Calculate the area/radius of the zone
                    const zoneArea = calculatePolygonArea(polygon);
                    matchingZones.push({
                        zone: zone,
                        area: zoneArea
                    });
                }
            }
        }

        if (matchingZones.length === 0) {
            return null; // No zone contains the point
        }

        // Sort by area (smallest first) and return the zone with smallest area
        matchingZones.sort((a, b) => a.area - b.area);

    
        return matchingZones[0].zone;

    } catch (error) {
        console.error('Error in getPickupZone function:', error);
        throw error;
    }
}
// Helper function to calculate polygon area using Shoelace formula
function calculatePolygonArea(polygon) {
    if (!polygon || polygon.length < 3) {
        return 0;
    }

    let area = 0;
    const n = polygon.length;

    for (let i = 0; i < n; i++) {
        const j = (i + 1) % n;
        const xi = polygon[i].lng || polygon[i].lon;
        const yi = polygon[i].lat;
        const xj = polygon[j].lng || polygon[j].lon;
        const yj = polygon[j].lat;

        area += xi * yj;
        area -= xj * yi;
    }

    return Math.abs(area) / 2;
}

// Alternative approach: If you prefer to calculate approximate radius instead of area
function calculateApproximateRadius(polygon) {
    if (!polygon || polygon.length < 3) {
        return 0;
    }

    // Find the centroid
    let centroidLat = 0;
    let centroidLng = 0;

    for (const point of polygon) {
        centroidLat += point.lat;
        centroidLng += point.lng || point.lon;
    }

    centroidLat /= polygon.length;
    centroidLng /= polygon.length;

    // Find the maximum distance from centroid to any point
    let maxDistance = 0;

    for (const point of polygon) {
        const distance = calculateTheDistance(
            centroidLat,
            centroidLng,
            point.lat,
            point.lng || point.lon
        );
        maxDistance = Math.max(maxDistance, distance);
    }

    return maxDistance;
}

// Helper function to calculate distance between two points (Haversine formula)
function calculateTheDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a =
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// If you want to use radius instead of area, replace the area calculation part with:
/*
async function getPickupZoneByRadius(req) {
    try {
        let clientId = await getClientId(req);
        const { pick_lat, pick_lng } = req.body;
        const zones = await getZoneDetails(clientId);

        if (!zones || zones.length === 0) {
            return null;
        }

        const point = [pick_lng, pick_lat];
        console.log("Point:", point);

        const matchingZones = [];

        for (const zone of zones) {
            if (zone.mapZone && Array.isArray(zone.mapZone) && zone.mapZone.length > 0) {
                const polygon = zone.mapZone;
                const isInside = isPointInPolygon(point, polygon);
                if (isInside) {
                    const zoneRadius = calculateApproximateRadius(polygon);
                    matchingZones.push({
                        zone: zone,
                        radius: zoneRadius
                    });
                }
            }
        }

        if (matchingZones.length === 0) {
            return null;
        }

        // Sort by radius (smallest first)
        matchingZones.sort((a, b) => a.radius - b.radius);

        return matchingZones[0].zone;

    } catch (error) {
        console.error('Error in getPickupZoneByRadius function:', error);
        throw error;
    }
}
*/

async function endPickUpPickupZone(req) {
    try {

        let clientId = await getClientId(req);


        const { droplat, droplng } = req.body;

        const zones = await getZoneDetails(clientId);

        if (!zones || zones.length === 0) {
            return null;
        }

        const point = [droplng, droplat]; // User's coordinates in [lng, lat] format

        // First, check all secondary zones
        const secondaryZones = zones.filter(zone => zone.zoneLevel === 'SECONDARY');
        for (const zone of secondaryZones) {
            if (zone.mapZone && Array.isArray(zone.mapZone) && zone.mapZone.length > 0) {
                const polygon = zone.mapZone;
                const isInside = isPointInPolygon(point, polygon);
                if (isInside) {
                    return zone; // Return the secondary zone if point is inside
                }
            }
        }

        // If no secondary zone found, check primary zones
        const primaryZones = zones.filter(zone => zone.zoneLevel === 'PRIMARY');
        for (const zone of primaryZones) {
            if (zone.mapZone && Array.isArray(zone.mapZone) && zone.mapZone.length > 0) {
                const polygon = zone.mapZone;
                const isInside = isPointInPolygon(point, polygon);
                if (isInside) {
                    return zone; // Return the primary zone if point is inside
                }
            }
        }

        return null; // Return null if the point is not inside any zone
    } catch (error) {
        console.error('Error in getPrimaryZone function:', error);
        throw error;
    }
}


const endCalculateZonePrices = async (req, zone, distance, ride_type, promo_code, user, ride_time, ride_date, beforewaitingtime, afterwaitingtime, vehicleId) => {
    const zonePrice = [];

    if (zone && zone.zonePriceDetails) {
        // Find all matching vehicle price items once
        const matchingZonePriceItems = zone.zonePriceDetails.filter(item =>
            item?.status && item?.vehicleDetails?._id?.equals(vehicleId)
        );

        for (const zonePriceItem of matchingZonePriceItems) {

            const dropZone = await getDropZone(req);
            const outOfZoneFee = (!dropZone || dropZone.nonServiceZone === 'Yes') ? getOutOfZoneFee(distance) : 0;

            const totalValue = await endEtaCalculation(
                distance,
                ride_type === 'RIDE_NOW' ? zonePriceItem.ridenowBaseDistance : zonePriceItem.ridelaterBaseDistance,
                ride_type === 'RIDE_NOW' ? zonePriceItem.ridenowBasePrice : zonePriceItem.ridelaterBasePrice,
                ride_type === 'RIDE_NOW' ? zonePriceItem.ridenowPricePerDistance : zonePriceItem.ridelaterPricePerDistance,
                ride_type === 'RIDE_NOW' ? zonePriceItem.ridenowFreeWaitingTime : zonePriceItem.ridelaterFreeWaitingTime,
                ride_type === 'RIDE_NOW' ? zonePriceItem.ridenowWaitingCharge : zonePriceItem.ridelaterWaitingCharge,
                outOfZoneFee,
                beforewaitingtime,
                afterwaitingtime
            );

            let totalAmount = totalValue.sub_total;


            if (promo_code) {
                try {
                    totalAmount = await applyPromoCode(req, totalAmount, user, zonePriceItem);
                } catch (error) {
                    // Handle specific error types differently if needed

                    if (error instanceof ApiError) {
                        // Handle API errors (those with status codes)
                        throw error; // Or handle differently
                    } else {
                        // Handle other errors
                        console.error("Promo code application error:", error);
                        throw new ApiError(httpStatus.BAD_REQUEST, error.message);
                    }
                }
            }
            // if (promo_code) {
            //     totalAmount = await applyPromoCode(req, totalAmount, user, zonePriceItem);
            // }

            const zonePriceObj = {
                type_name: zonePriceItem.vehicleDetails.vehicleName || "",
                type_id: zonePriceItem.vehicleDetails._id || "",
                capacity: zonePriceItem.vehicleDetails.capacity || "",
                category: zonePriceItem.vehicleDetails.categoryId,
                type_image: "/uploads/vehicles/" + zonePriceItem.vehicleDetails.image,
                type_image_select: "/uploads/vehicles/" + zonePriceItem.vehicleDetails.highlightImage,
                base_price: totalValue.base_amount,
                base_distance: totalValue.base_distance,
                distancePrice: totalValue.distance_cost,
                total_amount: totalAmount,
                totalDistance: distance,
                free_waiting_time: zonePriceItem.free_waiting_time,
                waiting_charge: totalValue.waiting_charge,
                price_per_time: zonePriceItem.price_per_time,
                computed_price: zonePriceItem.computed_price,
                computed_distance: zonePriceItem.computed_distance,
                price_per_distance: totalValue.price_per_distance,
                booking_base_fare: zonePriceItem.booking_base_fare,
                booking_base_per_kilometer: zonePriceItem.booking_base_per_kilometer,
                booking_fees: totalValue.booking_fee,
                out_of_zone_price: totalValue.outofzonefee,
            };

            // Add surge price if applicable
            if (zone.zoneSurgePriceDetails && Array.isArray(zone.zoneSurgePriceDetails)) {
                zone.zoneSurgePriceDetails.forEach(surgePrice => {
                    const isWithinTime = surgePrice.startTime <= ride_time && surgePrice.endTime >= ride_time;
                    const isWithinDay = surgePrice.availableDays.includes(new Date(ride_date).getDay());
                    if (isWithinTime && isWithinDay) {
                        totalAmount = surgePrice.surgeDistancePrice * distance + surgePrice.surgePrice + zonePriceObj.booking_fees;
                        zonePriceObj.total_amount = totalAmount;
                    }
                });
            }


            zonePrice.push(zonePriceObj);
        }
    }

    // Sort zone prices by sorting order
    zonePrice.sort((a, b) => {
        const typeSlugA = a.type_slug || '';
        const typeSlugB = b.type_slug || '';
        return typeSlugA.localeCompare(typeSlugB);
    });

    return zonePrice;
};


const calculateZonePrices = async (req, zone, distance, ride_type, promo_code, user, ride_time, ride_date, drop_lat, drop_long) => {
    const zonePrice = [];

    if (zone && zone.zonePriceDetails) {
        for (let zonePriceItem of zone.zonePriceDetails) {
            if (!zonePriceItem.status) continue;

            const dropZone = await getDropZone(req);
            const outOfZoneFee = (!dropZone || dropZone.nonServiceZone === 'Yes') ? getOutOfZoneFee(distance) : 0;

            const totalValue = await etaCalculation(
                distance,
                ride_type === 'RIDE_NOW' ? zonePriceItem.ridenowBaseDistance : zonePriceItem.ridelaterBaseDistance,
                ride_type === 'RIDE_NOW' ? zonePriceItem.ridenowBasePrice : zonePriceItem.ridelaterBasePrice,
                ride_type === 'RIDE_NOW' ? zonePriceItem.ridenowPricePerDistance : zonePriceItem.ridelaterPricePerDistance,
                ride_type === 'RIDE_NOW' ? zonePriceItem.ridenowFreeWaitingTime : zonePriceItem.ridelaterFreeWaitingTime,
                ride_type === 'RIDE_NOW' ? zonePriceItem.ridenowWaitingCharge : zonePriceItem.ridelaterWaitingCharge,
                outOfZoneFee
            );

            let totalAmount = totalValue.sub_total;
            let promoAmount = 0;

            if (promo_code) {
                try {
                    promoAmount = await applyPromoCode(req, totalAmount, user, zonePriceItem);
                } catch (error) {

                    // Handle specific error types differently if needed
                    if (error instanceof ApiError) {
                        // Handle API errors (those with status codes)
                        throw new ApiError(httpStatus.BAD_REQUEST, error);
                    } else {
                        // Handle other errors
                        console.error("Promo code application error:", error);
                        throw new ApiError(httpStatus.BAD_REQUEST, error);
                    }
                }
            }

            let note = ["This is an estimated fare of your journey .The final price is dependent on traffic condition and route taken to the destination", "Amount Based on the Type of the vehicle", "Also Eta is increased when the waiting time is avaliable"]


            const zonePriceObj = {
                type_name: zonePriceItem.vehicleDetails.vehicleName || "",
                type_id: zonePriceItem.vehicleDetails._id || "",
                capacity: zonePriceItem.vehicleDetails.capacity || "",
                category: zonePriceItem.vehicleDetails.categoryId,
                type_image: "/uploads/vehicles/" + zonePriceItem.vehicleDetails.image,
                type_image_select: "/uploads/vehicles/" + zonePriceItem.vehicleDetails.highlightImage,
                base_price: totalValue.base_amount,
                base_distance: totalValue.base_distance,
                total_amount: totalAmount,
                promoAmount: promoAmount,
                distance,
                free_waiting_time: zonePriceItem.free_waiting_time,
                waiting_charge: totalValue.waiting_charge,
                price_per_time: zonePriceItem.price_per_time,
                computed_price: zonePriceItem.computed_price,
                computed_distance: zonePriceItem.computed_distance,
                price_per_distance: totalValue.price_per_distance,
                booking_base_fare: zonePriceItem.booking_base_fare,
                booking_base_per_kilometer: zonePriceItem.booking_base_per_kilometer,
                booking_fees: totalValue.booking_fee,
                distance_km: totalValue.balance_distance,
                distance_cost: totalValue.distance_cost,
                out_of_zone_price: totalValue.outofzonefee,
                note: note,
                // Add sorting order to the object for easy sorting
                sortingorder: zonePriceItem.vehicleDetails.sortingorder || 0
            };
            // Add surge price if applicable
            if (zone.zoneSurgePriceDetails && Array.isArray(zone.zoneSurgePriceDetails)) {
                zone.zoneSurgePriceDetails.forEach(surgePrice => {
                    const isWithinTime = surgePrice.startTime <= ride_time && surgePrice.endTime >= ride_time;
                    const isWithinDay = surgePrice.availableDays?.includes(new Date(ride_date).getDay());
                    if (isWithinTime && isWithinDay) {
                        totalAmount = surgePrice.surgeDistancePrice * distance + surgePrice.surgePrice + zonePriceObj.booking_fees;
                        zonePriceObj.total_amount = totalAmount;
                    }
                });
            }

            zonePrice.push(zonePriceObj);
        }
    }

    // Sort zone prices by sortingorder
    zonePrice.sort((a, b) => a.sortingorder - b.sortingorder);

    return zonePrice;
};


const webCalculateZonePrices = async (req, zone, distance, ride_type, promo_code, user, ride_time, ride_date, drop_lat, drop_long) => {
    const zonePrice = [];

    if (zone && zone.zonePriceDetails) {
        for (let zonePriceItem of zone.zonePriceDetails) {
            if (!zonePriceItem.status) continue;

            const dropZone = await webGetDropZone(req);
            const outOfZoneFee = (!dropZone || dropZone.nonServiceZone === 'Yes') ? getOutOfZoneFee(distance) : 0;

            const totalValue = await etaCalculation(
                distance,
                ride_type === 'RIDE_NOW' ? zonePriceItem.ridenowBaseDistance : zonePriceItem.ridelaterBaseDistance,
                ride_type === 'RIDE_NOW' ? zonePriceItem.ridenowBasePrice : zonePriceItem.ridelaterBasePrice,
                ride_type === 'RIDE_NOW' ? zonePriceItem.ridenowPricePerDistance : zonePriceItem.ridelaterPricePerDistance,
                ride_type === 'RIDE_NOW' ? zonePriceItem.ridenowFreeWaitingTime : zonePriceItem.ridelaterFreeWaitingTime,
                ride_type === 'RIDE_NOW' ? zonePriceItem.ridenowWaitingCharge : zonePriceItem.ridelaterWaitingCharge,
                outOfZoneFee
            );

            let totalAmount = totalValue.sub_total;
            let promoAmount = 0;

            if (promo_code) {
                try {
                    promoAmount = await applyPromoCode(req, totalAmount, user, zonePriceItem);
                } catch (error) {

                    // Handle specific error types differently if needed
                    if (error instanceof ApiError) {
                        // Handle API errors (those with status codes)
                        throw new ApiError(httpStatus.BAD_REQUEST, error);
                    } else {
                        // Handle other errors
                        console.error("Promo code application error:", error);
                        throw new ApiError(httpStatus.BAD_REQUEST, error);
                    }
                }
            }

            let note = ["This is an estimated fare of your journey .The final price is dependent on traffic condition and route taken to the destination", "Amount Based on the Type of the vehicle", "Also Eta is increased when the waiting time is avaliable"]


            const zonePriceObj = {
                type_name: zonePriceItem.vehicleDetails.vehicleName || "",
                type_id: zonePriceItem.vehicleDetails._id || "",
                capacity: zonePriceItem.vehicleDetails.capacity || "",
                category: zonePriceItem.vehicleDetails.categoryId,
                type_image: "/uploads/vehicles/" + zonePriceItem.vehicleDetails.image,
                type_image_select: "/uploads/vehicles/" + zonePriceItem.vehicleDetails.highlightImage,
                base_price: totalValue.base_amount,
                base_distance: totalValue.base_distance,
                total_amount: totalAmount,
                promoAmount: promoAmount,
                distance,
                free_waiting_time: zonePriceItem.free_waiting_time,
                waiting_charge: totalValue.waiting_charge,
                price_per_time: zonePriceItem.price_per_time,
                computed_price: zonePriceItem.computed_price,
                computed_distance: zonePriceItem.computed_distance,
                price_per_distance: totalValue.price_per_distance,
                booking_base_fare: zonePriceItem.booking_base_fare,
                booking_base_per_kilometer: zonePriceItem.booking_base_per_kilometer,
                booking_fees: totalValue.booking_fee,
                distance_km: totalValue.balance_distance,
                distance_cost: totalValue.distance_cost,
                out_of_zone_price: totalValue.outofzonefee,
                note: note,
                // Add sorting order to the object for easy sorting
                sortingorder: zonePriceItem.vehicleDetails.sortingorder || 0
            };
            // Add surge price if applicable
            if (zone.zoneSurgePriceDetails && Array.isArray(zone.zoneSurgePriceDetails)) {
                zone.zoneSurgePriceDetails.forEach(surgePrice => {
                    const isWithinTime = surgePrice.startTime <= ride_time && surgePrice.endTime >= ride_time;
                    const isWithinDay = surgePrice.availableDays.includes(new Date(ride_date).getDay());
                    if (isWithinTime && isWithinDay) {
                        totalAmount = surgePrice.surgeDistancePrice * distance + surgePrice.surgePrice + zonePriceObj.booking_fees;
                        zonePriceObj.total_amount = totalAmount;
                    }
                });
            }

            zonePrice.push(zonePriceObj);
        }
    }

    // Sort zone prices by sortingorder
    zonePrice.sort((a, b) => a.sortingorder - b.sortingorder);

    return zonePrice;
};

async function generateRequestNumber() {
    // Use atomic counter to avoid duplicate key errors (works for Mongoose; same pattern as request.model pre-save)
    const counter = await Counter.findOneAndUpdate(
        { _id: 'requestNumber' },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
    );
    const index = counter && typeof counter.seq === 'number' ? counter.seq : 1;
    return `TAXI_${String(index).padStart(6, '0')}`;
}
async function getDropZone(req) {
    try {

        let clientId = await getClientId(req);

        const { drop_lat, drop_long } = req.body;

        const zones = await getZoneDetails(clientId);

        if (!zones || zones.length === 0) {
            return null;
        }

        const point = [drop_long, drop_lat]; // User's coordinates in [lng, lat] format

        // First, check all secondary zones
        const secondaryZones = zones.filter(zone => zone.zoneLevel === 'SECONDARY');
        for (const zone of secondaryZones) {
            if (zone.mapZone && Array.isArray(zone.mapZone) && zone.mapZone.length > 0) {
                const polygon = zone.mapZone;
                const isInside = isPointInPolygon(point, polygon);
                if (isInside) {
                    return zone; // Return the secondary zone if point is inside
                }
            }
        }

        // If no secondary zone found, check primary zones
        const primaryZones = zones.filter(zone => zone.zoneLevel === 'PRIMARY');
        for (const zone of primaryZones) {
            if (zone.mapZone && Array.isArray(zone.mapZone) && zone.mapZone.length > 0) {
                const polygon = zone.mapZone;
                const isInside = isPointInPolygon(point, polygon);
                if (isInside) {
                    return zone; // Return the primary zone if point is inside
                }
            }
        }

        return null; // Return null if the point is not inside any zone
    } catch (error) {
        console.error('Error in getPrimaryZone function:', error);
        throw error;
    }
}

async function webGetDropZone(req) {
    try {

        const { drop_lat, drop_long } = req.body;

        const zones = await webGetZoneDetails();

        if (!zones || zones.length === 0) {
            return null;
        }

        const point = [drop_long, drop_lat]; // User's coordinates in [lng, lat] format

        // First, check all secondary zones
        const secondaryZones = zones.filter(zone => zone.zoneLevel === 'SECONDARY');
        for (const zone of secondaryZones) {
            if (zone.mapZone && Array.isArray(zone.mapZone) && zone.mapZone.length > 0) {
                const polygon = zone.mapZone;
                const isInside = isPointInPolygon(point, polygon);
                if (isInside) {
                    return zone; // Return the secondary zone if point is inside
                }
            }
        }

        // If no secondary zone found, check primary zones
        const primaryZones = zones.filter(zone => zone.zoneLevel === 'PRIMARY');
        for (const zone of primaryZones) {
            if (zone.mapZone && Array.isArray(zone.mapZone) && zone.mapZone.length > 0) {
                const polygon = zone.mapZone;
                const isInside = isPointInPolygon(point, polygon);
                if (isInside) {
                    return zone; // Return the primary zone if point is inside
                }
            }
        }

        return null; // Return null if the point is not inside any zone
    } catch (error) {
        console.error('Error in getPrimaryZone function:', error);
        throw error;
    }
}


async function getEndTripDropZone(req) {
    try {

        let clientId = await getClientId(req);

        const { droplat, droplng } = req.body;

        const zones = await getZoneDetails(clientId);

        if (!zones || zones.length === 0) {
            return null;
        }

        const point = [droplng, droplat]; // User's coordinates in [lng, lat] format

        // First, check all secondary zones
        const secondaryZones = zones.filter(zone => zone.zoneLevel === 'SECONDARY');
        for (const zone of secondaryZones) {
            if (zone.mapZone && Array.isArray(zone.mapZone) && zone.mapZone.length > 0) {
                const polygon = zone.mapZone;
                const isInside = isPointInPolygon(point, polygon);
                if (isInside) {
                    return zone; // Return the secondary zone if point is inside
                }
            }
        }

        // If no secondary zone found, check primary zones
        const primaryZones = zones.filter(zone => zone.zoneLevel === 'PRIMARY');
        for (const zone of primaryZones) {
            if (zone.mapZone && Array.isArray(zone.mapZone) && zone.mapZone.length > 0) {
                const polygon = zone.mapZone;
                const isInside = isPointInPolygon(point, polygon);
                if (isInside) {
                    return zone; // Return the primary zone if point is inside
                }
            }
        }

        return null; // Return null if the point is not inside any zone
    } catch (error) {
        console.error('Error in getPrimaryZone function:', error);
        throw error;
    }
}

const calculateDistance = async (pickup_lat, pickup_long, drop_lat, drop_long, stops) => {
    let distance = 0;

    // Ensure stops is parsed correctly
    let stopsParsed = [];
    if (Array.isArray(stops)) {
        stopsParsed = stops;
    } else if (typeof stops === 'string' && stops.trim()) {
        try {
            stopsParsed = JSON.parse(stops);
        } catch (error) {
            console.error("Invalid JSON for stops:", stops);
            throw new SyntaxError("Invalid JSON for stops");
        }
    }

    if (stopsParsed && stopsParsed.length > 0) {
        distance += await getDistance(pickup_lat, pickup_long, stopsParsed[0].latitude, stopsParsed[0].longitude);

        for (let i = 0; i < stopsParsed.length - 1; i++) {
            distance += await getDistance(stopsParsed[i].latitude, stopsParsed[i].longitude, stopsParsed[i + 1].latitude, stopsParsed[i + 1].longitude);
        }

        distance += await getDistance(stopsParsed[stopsParsed.length - 1].latitude, stopsParsed[stopsParsed.length - 1].longitude, drop_lat, drop_long);
    } else {
        distance = await getDistance(pickup_lat, pickup_long, drop_lat, drop_long);
    }

    return distance;
};



// Calculate distance using Google Distance Matrix API

const getDistance = async (pickup_lat, pickup_long, drop_lat, drop_long) => {
    const settings_geocode = await Settings.findOne({ name: 'geoCoderApiKey' });

    if (!settings_geocode) {
        throw new Error('API key not found');
    }

    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${pickup_lat},${pickup_long}&destinations=${drop_lat},${drop_long}&mode=driving&language=en&key=${settings_geocode.value}`;

    try {
        const response = await axios.get(url);
        const distance = response.data.rows[0].elements[0].distance.value / 1000; // Distance in kilometers

        return distance;
    } catch (error) {
        console.error('Error fetching distance from Google API', error);
        return 0;
    }
};



const getAddressFromLatLng = async (req) => {

    const { lat, lng } = req.body;

    const settings_geocode = await Settings.findOne({ name: 'geoCoderApiKey' });

    if (!settings_geocode) {
        throw new Error('API key not found');
    }

    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${settings_geocode.value}`;

    try {
        const response = await axios.get(url);

        if (response.data.status === 'OK' && response.data.results.length > 0) {
            // Return the formatted address from the first result
            return response.data.results[0].formatted_address;
        } else {
            throw new Error('No results found for these coordinates');
        }
    } catch (error) {
        console.error('Error fetching address from Google API', error);
        throw error; // Re-throw the error to handle it in the calling function
    }
};


const getLatLngFromAddress = async (req) => {
    const { address } = req.body;
    const settings_geocode = await Settings.findOne({ name: 'geoCoderApiKey' });

    if (!settings_geocode) {
        throw new Error('Google Maps API key not found');
    }

    // Encode the address to handle special characters
    const encodedAddress = encodeURIComponent(address);
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${settings_geocode.value}`;

    try {
        const response = await axios.get(url);

        if (response.data.status === 'OK' && response.data.results.length > 0) {
            const location = response.data.results[0].geometry.location;
            return {
                lat: location.lat,
                lng: location.lng
            };
        } else {
            throw new Error('No results found for this address');
        }
    } catch (error) {
        console.error('Error fetching coordinates from Google API:', error);
        throw error; // Re-throw to handle in the calling function
    }
};


const getRoutePolyline = async (req) => {

    const { pickLat, pickLng, dropLat, dropLng, stopLat = null, stopLng = null } = req.body;

    const settings = await Settings.findOne({ name: 'geoCoderApiKey' });
    if (!settings) throw new Error('Google Maps API key not found');

    // Construct waypoints (including stop if provided)
    const waypoints = [];
    if (stopLat && stopLng) {
        waypoints.push(`${stopLat},${stopLng}`);
    }

    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${pickLat},${pickLng}&destination=${dropLat},${dropLng}&waypoints=${waypoints.join('|')}&key=${settings.value}`;

    try {
        const response = await axios.get(url);
        if (response.data.status !== 'OK') {
            throw new Error('No route found');
        }

        // Extract and decode the polyline
        const polyline = response.data.routes[0].overview_polyline.points;
        const decodedPath = decode(polyline); // Decodes into [lat, lng] pairs

        return {
            polyline, // Encoded polyline (for Google Maps)
            decodedPath, // Array of [lat, lng] coordinates
            distance: response.data.routes[0].legs.reduce((sum, leg) => sum + leg.distance.value, 0) / 1000, // Total distance in km
            duration: response.data.routes[0].legs.reduce((sum, leg) => sum + leg.duration.value, 0) / 60, // Total duration in mins
        };
    } catch (error) {
        console.error('Error fetching route:', error);
        throw error;
    }
};

const fetchDriver = async (pick_lat, pick_lng, vehicle_type, ride_type, zone_id, drop_lat, drop_lng) => {
    const settingsPlaces = await Settings.findOne({ name: 'driverShowingKm' });
    const RADIUS_IN_KM = settingsPlaces.value;
    const METERS_PER_KM = 1000;
    let maxDistanceInMeters = RADIUS_IN_KM * METERS_PER_KM;
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000); // 60 seconds * 1000 milliseconds


    
    try {
        const nearbyDrivers = await DriverLocation.aggregate([
            {
                $geoNear: {
                    near: {
                        type: 'Point',
                        coordinates: [pick_lng, pick_lat]
                    },
                    distanceField: 'distance',
                    maxDistance: maxDistanceInMeters,
                    spherical: true
                }
            },
            {
                $match: {
                    // lastUpdated: { $gte: oneMinuteAgo },
                    isAvailable: true,
                    isOnline: true,
                    vehicleId: new ObjectId(vehicle_type),
                    serviceType: { $regex: new RegExp(`\\b${ride_type}\\b`, 'i') },
                    $or: [
                        { zoneId: new ObjectId(zone_id) },
                        { secondaryZone: { $in: [new ObjectId(zone_id)] } }
                    ]
                }
            }
        ])


        return nearbyDrivers;
    } catch (error) {
        console.error("Error processing driver location:", error);
    }
};



const fetchExcludeDriver = async (pick_lat, pick_lng, vehicle_type, ride_type, drop_lat, drop_lng, driverId, zone_id) => {
    const settingsPlaces = await Settings.findOne({ name: 'driverShowingKm' });
    const RADIUS_IN_KM = settingsPlaces.value;
    const METERS_PER_KM = 1000;
    let maxDistanceInMeters = RADIUS_IN_KM * METERS_PER_KM;
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000); // 60 seconds * 1000 milliseconds

    try {
        const nearbyDrivers = await DriverLocation.aggregate([
            {
                $geoNear: {
                    near: {
                        type: 'Point',
                        coordinates: [pick_lng, pick_lat]
                    },
                    distanceField: 'distance',
                    maxDistance: maxDistanceInMeters,
                    spherical: true
                }
            },
            {
                $match: {
                    // lastUpdated: { $gte: oneMinuteAgo },
                    isAvailable: true,
                    isOnline: true,
                    vehicleId: new ObjectId(vehicle_type),
                    driverId: { $ne: driverId },
                    serviceType: { $regex: new RegExp(`\\b${ride_type}\\b`, 'i') },
                    $or: [
                        { zoneId: new ObjectId(zone_id) },
                        { secondaryZone: { $in: [new ObjectId(zone_id)] } }
                    ]
                }
            }
        ])

        return nearbyDrivers;
    } catch (error) {
        console.error("Error processing driver location:", error);
    }
};

const etaCalculation = async (distance, base_distance, base_price, price_per_distance, free_waiting_time, waiting_charge, outofzonefee) => {

    const base_amount = base_price;
    let distance_amount = 0;
    let balance_distance = 0;


    if (distance > base_distance) {
        balance_distance = distance - base_distance;
        distance_amount = balance_distance * price_per_distance;
    }

    const sub_total = base_amount + distance_amount + outofzonefee;

    return {
        base_amount: base_amount,
        base_distance: base_distance,
        price_per_distance: price_per_distance,
        booking_base_fare: 0,
        booking_km_amount: 0,
        outofzonefee: outofzonefee,
        sub_total: sub_total,
        waiting_charge: waiting_charge,
        balance_distance: balance_distance,
        distance_cost: distance_amount,
    };
};


const walletTransaction = async (amount, userId, type, purpose, requestId) => {
    let wallet;
    if (type == 'Spent') {
        wallet = await Wallet.findOne({ userId: userId });


        if (wallet) {
            wallet.amountSpent = amount ? 0 - amount : 0;
            wallet.balance -= amount ? amount : 0;
            wallet.save();
        }
        else {
            const walletParams = {
                userId: userId,
                earnedAmount: 0,
                amountSpent: amount ? amount : 0,
                balance: amount ? amount : 0,
            };

            wallet = await Wallet.create(walletParams);
        }

        await WalletTransaction.create({
            walletId: wallet.id,
            amount: amount ? 0 - amount : 0,
            purpose: purpose,
            requestId: requestId,
            type: type,
            userId: userId
        });
    }
    else if (type == 'Earned') {
        wallet = await Wallet.findOne({ userId: userId });

        if (wallet) {
            wallet.earnedAmount += amount ? amount : 0;
            wallet.balance += amount ? amount : 0;
            wallet.save();
        }
        else {
            const walletParams = {
                userId: userId,
                earnedAmount: amount ? amount : 0,
                amountSpent: 0,
                balance: amount ? amount : 0,
            };

            wallet = await Wallet.create(walletParams);
        }

        await WalletTransaction.create({
            walletId: wallet.id,
            amount: amount ? amount : 0,
            purpose: purpose,
            requestId: requestId,
            type: type,
            userId: userId
        });
    }
};


// Apply promo code logic

const applyPromoCode = async (req, totalAmount, user) => {
    const { promo_code } = req.body;

    if (!promo_code) {
        return 0;
    }

    const isPromoId = /^[a-fA-F0-9]{24}$/.test(promo_code);
    const promo = isPromoId
        ? await PromoCode.findById(promo_code)
        : await PromoCode.findOne({ promoCode: promo_code });

    if (!promo) {
        throw new Error('Invalid promo code');
    }

    const [promo_count, promo_all_count] = await Promise.all([
        Request.countDocuments({ promoId: promo._id, userId: user._id, isCompleted: true }),
        Request.countDocuments({ promoId: promo._id, isCompleted: true })
    ]);


    if (promo_count > promo.promoReuseCount) {
        throw new ApiError(httpStatus.FORBIDDEN, `Sorry! You already ${promo_count} times used this promo code`);
    }
    if (promo_all_count > promo.promo_use_count) {
        throw new ApiError(httpStatus.FORBIDDEN, 'Sorry! promo code limit exceeded');
    }
    if (totalAmount < promo.targetAmount) {
        throw new ApiError(httpStatus.FORBIDDEN, `Sorry! promo only valid for amounts exceeding ${promo.targetAmount}`);
    }

    if (promo.promoType === 'percentage') {
        const discount = (totalAmount * promo.percentage) / 100;
        if (discount > totalAmount) {
            throw new ApiError(httpStatus.FORBIDDEN, `Sorry! promo only valid for amounts exceeding ${totalAmount}`);
        }
        totalAmount -= discount;
    } else if (promo.promoType === 'fixed') {
        if (promo.amount > totalAmount) {
            throw new ApiError(httpStatus.FORBIDDEN, `Sorry! promo only valid for amounts exceeding ${totalAmount}`);
        }
        totalAmount -= promo.amount;
    }



    if (totalAmount < 0) {
        totalAmount = 0;
    }


    return totalAmount;
};

const getOutOfZoneFee = (distance) => {
    const outOfZoneRatePerKm = 10;
    const baseDistanceLimit = 10;
    if (distance <= baseDistanceLimit) {
        return 0;
    }

    const extraDistance = distance - baseDistanceLimit;
    const outOfZoneFee = extraDistance * outOfZoneRatePerKm;

    return outOfZoneFee;
};


function isPointInPolygon(point, polygon) {
    const x = point[0]; // Longitude (lng)
    const y = point[1]; // Latitude (lat)
    let inside = false;

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const xi = polygon[i].lng, yi = polygon[i].lat;
        const xj = polygon[j].lng, yj = polygon[j].lat;

        const intersect = ((yi > y) !== (yj > y)) &&
            (x < (xj - xi) * (y - yi) / (yj - yi) + xi);

        if (intersect) inside = !inside;
    }

    return inside;
}

// Helper functions
const createDataResponse = (zone) => ({
    zone_name: zone.zoneName,
    biddingZone: zone.biddingZone,
    country_name: zone.countrydetails.name,
    currency_symbol: zone.countrydetails.currency_symbol,
    payment_types: zone.paymentTypes,
    unit: zone.unit,
    country_id: zone.country,
});



const uniqueRandomNumbers = async (qnty) => {
    // Generate a random number between 1000 and 9999
    const randomNumber = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;
    return randomNumber;

};


const sendNotification = async (req, userIds, messageData) => {
    try {
        // Fetch users by IDs
        const users = await User.find({ _id: { $in: userIds } });
        const tokens = users
            .map(user => user.deviceInfoHash)
            .filter(deviceInfoHash => !!deviceInfoHash); // Ensure truthy values

        if (!tokens.length) {
            return { successCount: 0, failureCount: 0, responses: [] };
        }

        const message = {
            notification: {
                title: messageData.title,
                body: messageData.message,
                image: messageData.imageName, // Optional image URL
            },
            data: {
                title: messageData.title,
                body: messageData.message,
                image: messageData.imageName,
                type: "general", // Custom data type
            },
        };

        // Send notifications
        const responses = await Promise.allSettled(
            tokens.map(async token => {
                return admin.messaging().send({ ...message, token });
            })
        );

        // Analyze responses
        const successResponses = responses.filter(r => r.status === 'fulfilled');
        const failureResponses = responses.filter(r => r.status === 'rejected');


        return {
            successCount: successResponses.length,
            failureCount: failureResponses.length,
            responses: {
                success: successResponses.map(r => r.value),
                failure: failureResponses.map(r => r.reason),
            },
        };
    } catch (error) {
        console.error('Error sending notifications:', error.message);
        throw error; // Propagate error to the caller
    }
};


const sendClientNotification = async (clientId, messageData) => {
    try {
        // Fetch client with valid tokens
        const client = await ClientToken.findOne({ clientId: clientId });

        if (!client) {
            return { successCount: 0, failureCount: 0, responses: [] };
        }

        // Filter out invalid/empty tokens
        const validTokens = client.deviceInfoHash.filter(token =>
            token && typeof token === 'string' && token.length > 0
        );

        if (validTokens.length === 0) {
            return { successCount: 0, failureCount: 0, responses: [] };
        }

        // Construct the message
        const basemessage = {
            notification: {
                title: messageData.title,
                body: messageData.message,
                ...(messageData.imageName && { image: messageData.imageName }),
            },
            data: {
                title: messageData.title,
                body: messageData.message,
                ...(messageData.imageName && { image: messageData.imageName }),
                type: messageData.type || "general",
                // Add any additional data fields here
            },
        };

        const sendPromises = validTokens.map(token => {
            const message = { ...basemessage, token };

            return admin.messaging().send(message)
                .then(response => ({ token, success: true, response }))
                .catch(error => {
                    // Handle specific errors
                    if (error.code === 'messaging/registration-token-not-registered' ||
                        error.code === 'messaging/invalid-registration-token') {
                    }
                    return { token, success: false, error };
                });
        });

        const results = await Promise.all(sendPromises);

        // Analyze results
        const successResponses = results.filter(r => r.success);
        const failureResponses = results.filter(r => !r.success);

        return {
            successCount: successResponses.length,
            failureCount: failureResponses.length,
            responses: {
                success: successResponses,
                failure: failureResponses,
            },
        };
    } catch (error) {
        console.error('Error sending notifications:', error);
        throw error;
    }
};


/**
 * Send Push Notification to a single device
 * @param {string} token - The device token
 * @param {string} title - The title of the notification
 * @param {string} message - The message of the notification
 */
const sendPushNotification = async (userId, messageData) => {
    try {

        const user = await User.findById(userId);

        if (!user) {
            throw new Error('User not found');
        }

        // Get the device token of the user
        let userToken = await user.deviceInfoHash;


        // Assuming the user's device token is stored in the `deviceToken` field

        const message = {
            token: userToken,
            notification: {
                title: messageData.title,
                body: messageData.message,
                image: messageData.imageName || undefined, // Optional image URL
            },
            data: {
                title: String(messageData.title),
                body: String(messageData.message),
                image: messageData.imageName ? String(messageData.imageName) : "",
                type: "general", // Ensure this is a string
            },
        };



        try {
            const response = await admin.messaging().send(message);

            const notification = new Notification({
                title: messageData.title,
                userId: userId,
                subTitle: messageData.subTitle || null,
                message: messageData.message,
                image: messageData.imageName || null,
                status: response ? 1 : 0, // 1 = success, 0 = failure
                notificationType: messageData.notificationType || 'GENERAL',
                clientId: messageData.clientId || null,
            });

            await notification.save();

            return response;
        } catch (error) {
            return null;
        }


    } catch (error) {
        if (error.code === 'messaging/registration-token-not-registered') {
            console.log(`Invalid token detected, removing from DB`);
            // await User.findByIdAndUpdate(userId, { $unset: { deviceInfoHash: "" } });
        }
        console.error('Error sending notification:', error);
        throw error;
    }
};


/**
 * Send Push Notification to a single device
 * @param {string} token - The device token
 * @param {string} title - The title of the notification
 * @param {string} message - The message of the notification
 */
const sendPushNotificationToken = async (Token, userId, messageData) => {
    try {

        const user = await User.findById(userId);

        if (!user) {
            throw new Error('User not found');
        }

        // Get the device token of the user
        // Assuming the user's device token is stored in the `deviceToken` field


        const message = {
            token: Token,
            notification: {
                title: messageData.title,
                body: messageData.message,
                image: messageData.imageName || undefined, // Optional image URL
            },
            data: {
                title: String(messageData.title),
                body: String(messageData.message),
                image: messageData.imageName ? String(messageData.imageName) : "",
                type: "general", // Ensure this is a string
            },
        };


        try {
            const response = await admin.messaging().send(message);


            const notification = new Notification({
                title: messageData.title,
                userId: userId,
                subTitle: messageData.subTitle || null,
                message: messageData.message,
                image: messageData.imageName || null,
                status: response ? 1 : 0, // 1 = success, 0 = failure
                notificationType: messageData.notificationType || 'GENERAL',
                clientId: messageData.clientId || null,
            });

            await notification.save();

            return response;
        } catch (error) {
            console.error('Error sending push notification:', error);
            return null;
        }


    } catch (error) {
        console.error('Error sending push notification:', error);

        if (error.code === 'messaging/registration-token-not-registered') {
            console.log(`Invalid token detected, removing from DB`);
            // await User.findByIdAndUpdate(userId, { $unset: { deviceInfoHash: "" } });
        }
        console.error('Error sending notification:', error);
        throw error;
    }
};


async function endGetDropZone(req) {
    try {

        let clientId = await getClientId(req);

        const { droplat, droplng } = req.body;

        const zones = await getZoneDetails(clientId);

        if (!zones || zones.length === 0) {
            return null;
        }

        const point = [droplng, droplat]; // User's coordinates in [lng, lat] format

        for (const zone of zones) {
            if (zone.mapZone && Array.isArray(zone.mapZone) && zone.mapZone.length > 0) {

                // Assuming the first polygon in the zone.mapZone array for now
                const polygon = zone.mapZone;

                // Check if the point is inside the polygon
                const isInside = isPointInPolygon(point, polygon);

                if (isInside) {
                    return zone; // Return the zone the user is inside
                }
            }
        }

        return null; // Return null if the point is not inside any zone
    } catch (error) {
        console.error('Error in getPrimaryZone function:', error);
        throw error;
    }
}


const endEtaCalculation = async (distance, base_distance, base_price, price_per_distance, waiting_free_time, waiting_charge, outofzonefee, beforewaitingtime, afterwaitingtime) => {

    const base_amount = base_price;
    let distance_amount = 0;
    let balance_distance = 0;

    let totalWaitingMin = 0;
    let WaitingTimePrice = 0;


    if (distance > base_distance) {
        balance_distance = distance - base_distance;
        distance_amount = balance_distance * price_per_distance;
    }

    let before = beforewaitingtime / 60;
    let after = afterwaitingtime / 60;

    if (waiting_free_time < before) {
        totalWaitingMin = totalWaitingMin + (before - waiting_free_time)
    }

    if (waiting_free_time < after) {
        totalWaitingMin = totalWaitingMin + (after - waiting_free_time)
    }


    if (totalWaitingMin != 0) {
        WaitingTimePrice = waiting_charge * totalWaitingMin
    }

    const sub_total = base_amount + distance_amount + outofzonefee + WaitingTimePrice;

    return {
        base_amount: base_amount,
        base_distance: base_distance,
        price_per_distance: price_per_distance,
        distance_cost: distance_amount,
        booking_base_fare: 0,
        booking_km_amount: 0,
        outofzonefee: outofzonefee,
        sub_total: sub_total,
        waiting_charge: WaitingTimePrice,
        balance_distance: balance_distance,
    };
};


async function commonSms(mobileNo, otp) {
    try {

        const topic = smsMessage.OTP_VERIFICATION_MESSAGE + "-" + otp;

        // Send SMS

        const settingsPlaces = await Settings.findOne({ name: 'smsType' });
        const smsGateways = settingsPlaces.value;


        let sendResult = '';

        if (smsGateways === 'VoodooSMS') {
            sendResult = await voodooSMS.sendSMS(
                mobileNo,
                topic
            );
        } else if (smsGateways === 'Twilio') {
            sendResult = await TwilioSMS.sendSMS(
                mobileNo,
                topic
            );

        }

    } catch (error) {
        console.error('Error:', error);
    }
}


async function smsGateWayStatus() {
    try {
        const settingsPlaces = await Settings.findOne({ name: 'smsGateways' });
        const smsGateways = settingsPlaces.value;

        return smsGateways;

    } catch (error) {
        console.error('Error:', error);
    }

}

async function findDemoOrNot(userId)
{
    //chk user role and if it is demo get drivers under him
    
    const demo = await Demo.findOne({userId:userId,demo: true});
    if(demo)
    {
        return demo.demoKey;
    }
    return null;
}

const fetchDispatchDriver = async (demoKey,pick_lat, pick_lng, vehicle_type, ride_type, zone_id, drop_lat, drop_lng) => {

    const settingsPlaces = await Settings.findOne({ name: 'driverShowingKm' });
    const RADIUS_IN_KM = settingsPlaces.value;
    const METERS_PER_KM = 1000;
    let maxDistanceInMeters = RADIUS_IN_KM * METERS_PER_KM;
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000); // 60 seconds * 1000 milliseconds

    try {

        let demoUserIds = [];

        // ✅ If demo exists → get drivers under that demo
        if (demoKey !== null) {
        const demoUsers = await User.find({ adminDemoKey: demoKey }).select('_id');

        if (demoUsers.length === 0) {
            // No drivers under this demo
            return [];
        }

        demoUserIds = demoUsers.map(user => user._id);
        }

        const matchStage = {
            isAvailable: true,
            isOnline: true,
            vehicleId: new ObjectId(vehicle_type),
            serviceType: { $regex: new RegExp(`\\b${ride_type}\\b`, 'i') },
            $or: [
                { zoneId: new ObjectId(zone_id) },
                { secondaryZone: { $in: [new ObjectId(zone_id)] } }
            ]
        };

        // ✅ Add demo restriction if needed
        if (demoKey !== null) {
            matchStage.userId = { $in: demoUserIds };
        }
        const nearbyDrivers = await DriverLocation.aggregate([
            {
                $geoNear: {
                    near: {
                        type: 'Point',
                        coordinates: [pick_lng, pick_lat]
                    },
                    distanceField: 'distance',
                    maxDistance: maxDistanceInMeters,
                    spherical: true
                }
            },
            {
                $match: matchStage
            }
        ])


        return nearbyDrivers;
    } catch (error) {
        console.error("Error processing driver location:", error);
    }
};

const fetchDispatchExcludeDriver = async (demoKey,pick_lat, pick_lng, vehicle_type, ride_type, drop_lat, drop_lng, driverId, zone_id) => {
    const settingsPlaces = await Settings.findOne({ name: 'driverShowingKm' });
    const RADIUS_IN_KM = settingsPlaces.value;
    const METERS_PER_KM = 1000;
    let maxDistanceInMeters = RADIUS_IN_KM * METERS_PER_KM;
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000); // 60 seconds * 1000 milliseconds

    try {
        let demoUserIds = [];

        // ✅ If demo exists → get drivers under that demo
        if (demoKey !== null) {
        const demoUsers = await User.find({ adminDemoKey: demoKey }).select('_id');

        if (demoUsers.length === 0) {
            // No drivers under this demo
            return [];
        }

        demoUserIds = demoUsers.map(user => user._id);
        }

        const matchStage = {
            isAvailable: true,
            isOnline: true,
            vehicleId: new ObjectId(vehicle_type),
            driverId: { $ne: driverId },
            serviceType: { $regex: new RegExp(`\\b${ride_type}\\b`, 'i') },
            $or: [
                { zoneId: new ObjectId(zone_id) },
                { secondaryZone: { $in: [new ObjectId(zone_id)] } }
            ]
        };

        // ✅ Add demo restriction if needed
        if (demoKey !== null) {
            matchStage.userId = { $in: demoUserIds };
        }
        const nearbyDrivers = await DriverLocation.aggregate([
            {
                $geoNear: {
                    near: {
                        type: 'Point',
                        coordinates: [pick_lng, pick_lat]
                    },
                    distanceField: 'distance',
                    maxDistance: maxDistanceInMeters,
                    spherical: true
                }
            },
            {
                $match: matchStage
            }
        ])

        return nearbyDrivers;
    } catch (error) {
        console.error("Error processing driver location:", error);
    }
};

module.exports = { autocompletePlaces,webCalculateZonePrices, directional, geocodeApi, reverseGeocode, getPickupZone,webGetPickupZone,webGetDropZone, getDropZone, calculateDistance, etaCalculation, applyPromoCode, getOutOfZoneFee, calculateZonePrices, createDataResponse, generateRequestNumber, uniqueRandomNumbers, sendNotification, isPointInPolygon, fetchDriver, endPickUpPickupZone, endCalculateZonePrices, endGetDropZone, sendPushNotification, walletTransaction, getEndTripDropZone, sendClientNotification, getLatLngFromAddress, getAddressFromLatLng, getRoutePolyline, fetchExcludeDriver, sendPushNotificationToken, commonSms, smsGateWayStatus,findDemoOrNot,fetchDispatchDriver,fetchDispatchExcludeDriver };
