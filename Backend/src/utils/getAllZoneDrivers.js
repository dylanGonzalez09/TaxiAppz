const {Zone} = require('../models');
const mongoose = require('mongoose');

const getZone = async (lat, long) => {

    
    const point = {
      type: 'Point',
      coordinates: { lat, long }
    };
  
    let zone = await getZoneData(point, 'PRIMARY');

  
    if (zone.length == 0) {
      zone = await getZoneData(point, 'SECONDARY');
    }
  
    return zone[0];
  };

const getZoneData = async (point, zoneLevel) => {
    const aggregation = [
      {
        $match: {
          mapZone: { $geoIntersects: { $geometry: point } },
          zoneLevel: zoneLevel
        }
      }
    ];
  
    return Zone.aggregate(aggregation).exec();
  }

  module.exports = getZone;