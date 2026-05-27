const mongoose = require('mongoose');
const { Zone } = require('../models');

const getAllZoneIdsFromPrimary = async (primaryZoneId) => {
  const primaryId = new mongoose.Types.ObjectId(primaryZoneId);

  const secondaryZones = await Zone.find({
    primaryZoneId: primaryId,
  })
    .select('_id')
    .lean();

  const zoneIds = secondaryZones.map((zone) => zone._id);
  zoneIds.push(primaryId);

  return zoneIds;
};

module.exports = { getAllZoneIdsFromPrimary };
