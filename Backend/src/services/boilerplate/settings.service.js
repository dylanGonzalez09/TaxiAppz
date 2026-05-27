const httpStatus = require('../../config/httpStatus');
const ApiError = require('../../utils/ApiError');
const { Settings ,Language} = require('../../models');
const { ObjectId } = require('mongoose').Types;
const { invalidateSettingsCache } = require('../../utils/cache');
const {
  runTermsTranslationSync,
  syncTermsForSingleLanguage,
  getTermsSyncStatus,
} = require('./termsTranslationSync.service');



const normalizeClientId = (clientId) => {
  if (!clientId) return null;
  const id = String(clientId);
  return ObjectId.isValid(id) ? new ObjectId(id) : null;
};



/**
 * Bulk insert settings
 * @param {Array<Object>} settingsBody - Array of setting objects
 * @returns {Promise<Settings[]>}
 */
const bulkInsertSettings = async (settingsBody) => {
  return Settings.insertMany(settingsBody);
};


/**
 * Resolve English language document (primary/base language for terms sync).
 */
const resolveEnglishLanguage = async (clientId) => {
  const clientIdObj = normalizeClientId(clientId);
  let english = clientIdObj
    ? await Language.findOne({ status: true, clientId: clientIdObj, code: /^en$/i }).select('_id code').lean()
    : null;
  if (!english) {
    english = await Language.findOne({ status: true, code: /^en$/i }).select('_id code').lean();
  }
  if (!english) {
    english = await Language.findOne({ status: true, name: /^english$/i }).select('_id code').lean();
  }
  return english;
};

const isEnglishTermsUpdate = async (settingsBody, clientId) => {
  const sourceData = getSourceTermsFromSettingsBody(settingsBody);
  if (!sourceData?.sourceLangId) return false;
  const englishLang = await resolveEnglishLanguage(clientId);
  if (!englishLang) return false;
  return String(sourceData.sourceLangId) === String(englishLang._id);
};


/** Translate English terms to all active languages before returning (blocks until done). */
const translateTermsToAllLanguages = async (settingsBody, typeValue, clientId) => {
  if (typeValue !== 'terms' || !clientId || !settingsBody?.length) return false;
  const sourceData = getSourceTermsFromSettingsBody(settingsBody);
  if (!sourceData) return false;

  await runTermsTranslationSync(clientId, sourceData);
  const status = getTermsSyncStatus(clientId);
  if (status.status === 'failed') {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, status.error || 'Terms translation failed');
  }

  return true;
};


/**
 * Extract source language id from terms settings keys (e.g. termsCondition_66a222... => 66a222...)
 */
const getSourceTermsFromSettingsBody = (settingsBody) => {
  const termsEntry = settingsBody.find((s) => s.name && s.name.startsWith('termsCondition_'));
  const privacyEntry = settingsBody.find((s) => s.name && s.name.startsWith('privacyPolicy_'));
  const ackEntry = settingsBody.find((s) => s.name && s.name.startsWith('acknowledgement_'));
  if (!termsEntry) return null;
  const sourceLangId = termsEntry.name.replace('termsCondition_', '');
  return {
    sourceLangId,
    terms: termsEntry.value || '',
    privacy: (privacyEntry && privacyEntry.value) || '',
    acknowledgement: (ackEntry && ackEntry.value) || '',
  };
};

/**
 * Bulk update settings
 * @param {Array<Object>} settingsUpdate - Array of objects with id and update fields
 * @returns {Promise<Settings[]>}
 */
const bulkUpdateSettings = async (settingsBody) => {
  const updatePromises = settingsBody.map((setting) => {
    const query = { name: setting.name };

    if (setting.clientId) {
      query.clientId = setting.clientId;
    }

    return Settings.findOneAndUpdate(
      query,
      { value: setting.value, status: setting.status, type: setting.type },
      {
        returnDocument: 'after',
        upsert: true,
        setDefaultsOnInsert: true,
      },
    );
  });
  const result = await Promise.all(updatePromises);
  settingsBody.forEach((s) => invalidateSettingsCache(s.name));
  return result;
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
      { $match: { clientId: new ObjectId(clientId) } },
      {
        $group: {
          _id: '$type',
          settings: { $push: '$$ROOT' },
        },
      },
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
          _id: '$type',
          settings: { $push: '$$ROOT' },
        },
      },
    ]);

    const formattedResults = results.map((group) => {
      const settingsObject = {};
      group.settings.forEach((setting) => {
        settingsObject[setting.name] = setting.value; // or setting.status based on your requirements
      });
      return {
        _id: group._id,
        settings: settingsObject,
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
  invalidateSettingsCache(settings.name);
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
  return { status: 'success', msg: 'data Deleted Successfully' };
};
const getDefaultLanguage = async (req) => {
  if (!req.headers.clientid) {
    throw new ApiError(httpStatus.NOT_FOUND, 'CLIENTID NOT FOUND');
  }

  const defaultLanguage = await Settings.findOne({ name: 'defaultLanguage' });

  return defaultLanguage ? defaultLanguage.value : '66a222ebe0cb6c1793582f13';
};

const getModuleSetings = async ()=>{
    const modulesSettings = await Settings.find({type : "modules"}).select("name value").lean();

    const data = modulesSettings.reduce((acc, item) => {
     acc[item.name] = item.value;
     return acc;
     }, {});

    return data;
}

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
  getDefaultLanguage,
  getModuleSetings,
  isEnglishTermsUpdate,
  translateTermsToAllLanguages
};
