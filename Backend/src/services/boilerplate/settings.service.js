const httpStatus = require('http-status');
const ApiError = require('../../utils/ApiError');
const { Settings } = require('../../models');
const ObjectId = require('mongoose').Types.ObjectId

/**
 * Bulk insert settings
 * @param {Array<Object>} settingsBody - Array of setting objects
 * @returns {Promise<Settings[]>}
 */
const bulkInsertSettings = async (settingsBody) => {
  return Settings.insertMany(settingsBody);
};


/**
 * Bulk update settings
 * @param {Array<Object>} settingsUpdate - Array of objects with id and update fields
 * @returns {Promise<Settings[]>}
 */
const bulkUpdateSettings = async (settingsBody) => {
  const updatePromises = settingsBody.map(setting => {
    return Settings.findOneAndUpdate(
      { name: setting.name }, // Find setting by name
      { value: setting.value, status: setting.status, type: setting.type },
      { new: true } // Return the updated document
    );
  });
  return Promise.all(updatePromises); // Wait for all updates to complete
};


/**
 * Create a setting
 * @param {Object} settingBody
 * @returns {Promise<Settings>}
 */
const createSetting = async (settingBody) => {
  return Settings.create(settingBody);
};

/**
 * Query for settings
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const querySettings = async (filter, options) => {
  const settings = await Settings.paginate(filter, options);
  return settings;
};


/**
 * Get settings
 * @param {ObjectId} clientId - The clientId to filter users by
 * @returns {Promise<Settings>}
 */
const getSettings = async (clientId) => {
  try {
    const results = await Settings.aggregate([
      // { $match: { clientId: new ObjectId(clientId) } },
      {
        $group: {
          _id: "$type",
          settings: { $push: "$$ROOT" }
        }
      }
    ]);

    return results;
  } catch (error) {
    console.error('Error in aggregation:', error);
    throw error;
  }
};


/**
 * Get settings
 * @param {ObjectId} clientId - The clientId to filter users by
 * @returns {Promise<Settings>}
 */
const getSettingsApi = async (clientId) => {
  try {
    const results = await Settings.aggregate([
      { $match: { clientId: new ObjectId(clientId) } },
      {
        $group: {
          _id: "$type",
          settings: { $push: "$$ROOT" }
        }
      }
    ]);

       const formattedResults = results.map(group => {
        const settingsObject = {};
        group.settings.forEach(setting => {
          settingsObject[setting.name] = setting.value; // or setting.status based on your requirements
        });
        return {
          _id: group._id,
          settings: settingsObject
        };
      });

    return formattedResults;
  } catch (error) {
    console.error('Error in aggregation:', error);
    throw error;
  }
};


/**
 * Get role by id
 * @param {ObjectId} settingId
 * @returns {Promise<Settings>}
 */
const getSettingById = async (settingId) => {
  return Settings.findById(settingId);
};


/**
 * Update role by id
 * @param {ObjectId} settingId
 * @param {Object} updateBody
 * @returns {Promise<Settings>}
 */
const updateSettingsById = async (settingId, updateBody) => {
  const settings = await getSettingById(settingId);
  if (!settings) {
    throw new ApiError(httpStatus.NOT_FOUND, 'role not found');
  }

  Object.assign(settings, updateBody);
  await settings.save();
  return settings;
};

/**
 * Delete role by id
 * @param {ObjectId} settingId
 * @returns {Object}
 */
const deleteSettingsById = async (settingId) => {
  const settings = await getSettingById(settingId);
  if (!settings) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Role not found');
  }
  await settings.deleteOne();
  return { status: "success", msg: "data Deleted Successfully" };
};
const getDefaultLanguage = async(req) => {
  if(!req.headers.clientid)
  {
    throw new ApiError(httpStatus.NOT_FOUND, 'CLIENTID NOT FOUND');
  }
 
  const defaultLanguage = await Settings.findOne({name:'defaultLanguage'});
 
  return defaultLanguage ? defaultLanguage.value : '66a222ebe0cb6c1793582f13';
 
};



module.exports = {
  createSetting,
  querySettings,
  getSettings,
  getSettingById,
  updateSettingsById,
  deleteSettingsById,
  bulkInsertSettings,
  bulkUpdateSettings,
  getSettingsApi,
  getDefaultLanguage
};
