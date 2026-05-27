const httpStatus = require('../../utils/httpStatus');
const ApiError = require('../../utils/ApiError');
const { Language } = require('../../models');
const { translateTextWithAPI, batchTranslate } = require('../../utils/GoogleTranslator.js');
const fs = require('fs').promises;
const fsData = require('fs');
const fsSync = require('fs');
const FormData = require('form-data');
const axios = require('axios');

/**
 * Create or update a setting in a JSON file
 * @param {Object} TranslationBody - The body containing the translation details
 * @returns {Promise<Object>} - The updated JSON content
 */
const writeTranslationToFile = async (translationEntry) => {
  const filePath = `json/${translationEntry.code}.json`;
  try {
    // Read existing JSON or initialize a new one
    let jsonContent = {};

    // Check if file exists
    try {
      const fileContent = await fs.readFile(filePath, 'utf8');
      jsonContent = JSON.parse(fileContent);
    } catch (err) {
      if (err.code !== 'ENOENT') throw err;
    }

    // Make sure navigation exists
    if (!jsonContent.navigation || typeof jsonContent.navigation !== 'object') {
      jsonContent.navigation = {};
    }

    // Work inside navigation only
    const keys = translationEntry.key.split('.');
    let current = jsonContent.navigation; // always inside navigation

    // Traverse or create nested keys under navigation
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]] || typeof current[keys[i]] !== 'object') {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }

    // Set final value
    current[keys[keys.length - 1]] = translationEntry.value;

    // Save back to file
    await fs.writeFile(filePath, JSON.stringify(jsonContent, null, 2), 'utf8');

    // Prepare form for upload
    const form = new FormData();
    form.append('file', fsData.createReadStream(filePath));

    // Optionally upload JSON
    // const response = await axios.post('http://localhost:4001/v1/json/create', form, {
    //   headers: form.getHeaders(),
    // });

    return { code: translationEntry.code, key: translationEntry.key };
  } catch (error) {
    throw error;
  }
};

const createTranslation = async (TranslationBody) => {
  const bulkEntries = Array.isArray(TranslationBody?.translations) ? TranslationBody.translations : null;

  if (bulkEntries && bulkEntries.length > 0) {
    const sanitizedEntries = bulkEntries.filter(
      (entry) =>
        entry &&
        typeof entry.code === 'string' &&
        entry.code.trim() &&
        typeof entry.key === 'string' &&
        entry.key.trim()
    );

    const results = [];

    // Keep this sequential to avoid file-write races for same code.
    for (const entry of sanitizedEntries) {
      const result = await writeTranslationToFile({
        code: entry.code.trim(),
        key: entry.key.trim(),
        value: entry.value ?? '',
      });

      results.push(result);
    }

    return { updated: results.length, entries: results };
  }

  return writeTranslationToFile(TranslationBody);
};
/**
 * Get roles
 * @returns {Promise<Language>}
 */
const getLanguage = async () => {
  return Language.find();
};

/**
 * Get roles
 * @returns {Promise<Language>}
 */
const getActiveLanguage = async () => {
  return Language.find({ status: true }).sort({createdAt:1});
};

/**
 * Get roles
 * @returns {Promise<Language>}
 */
const getActiveLanguagecode = async () => {
  const language = await Language.find({ status: true });
  const codes = language.map((lang) => lang.code);
  return codes;
};

/**
 * Get active language codes and IDs
 * @returns {Promise<Array<{ id: string, code: string }>>}
 */
const getActiveLanguageCodeAndId = async (req) => {
  const languages = await Language.find({ status: true, clientId: req.headers.clientid }, { _id: 1, code: 1, name: 1 }).sort({createdAt:1});
  const codesWithIds = languages.map((lang) => ({
    id: lang._id,
    code: lang.code,
    name: lang.name,
  }));
  return codesWithIds;
};

/**
 * Get language data by code
 * @param {string} code - The language code
 * @returns {Promise<Object>} - The parsed JSON data
 */
const getLanguageByCode = async (code) => {
  const filePath = `json/${code}.json`;
  try {
    if (!fsSync.existsSync(filePath)) {
      const defaultContent = JSON.stringify({ navigation: {} }, null, 2);
      await fs.writeFile(filePath, defaultContent, 'utf8');
    }

    let jsonData = await fs.readFile(filePath, 'utf8');

    if (!jsonData || jsonData.trim() === '') {
      jsonData = JSON.stringify({ navigation: {} });
      await fs.writeFile(filePath, jsonData, 'utf8');
    }

    let data;

    try {
      data = JSON.parse(jsonData);
    } catch (parseError) {
      console.error(`Invalid JSON in ${filePath}, resetting file...`);

      data = { navigation: {} };
      await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
    }

    return data;

  } catch (error) {
    console.error(`Error reading/parsing JSON for ${code}:`, error);
    throw error;
  }
};

/**
 * Convert navigation data to the desired structure
 * @returns {Promise<Array>} - The combined navigation data
 */
const convertNavigationData = async () => {
  // Fetch navigation data from all language files
  const getLanguageData = await getActiveLanguage();
  const codes = getLanguageData.map((lang) => lang.code);

  const languageDataArray = await Promise.all(codes.map((code) => getLanguageByCode(code)));

  // Get the navigation keys from the first language data (assuming it has all keys)
  const allKeys = new Set();
  languageDataArray.forEach((data) => {
    Object.keys(data.navigation).forEach((key) => allKeys.add(key));
  });

  // Convert Set to array
  const navigationKeys = Array.from(allKeys);

  // Combine the data into the desired structure
  const combinedData = navigationKeys.map((key) => {
    const entry = { key };
    codes.forEach((code, index) => {
      entry[code] = languageDataArray[index].navigation[key] || '';
    });
    return entry;
  });
  return combinedData;
};

/**
 * Get language data by code
 * @param {string} code - The language code
 * @returns {Promise<Object>} - The parsed JSON data
 */
const getMobileLanguageByCode = async (code) => {
  const filePath = `json/mob_${code}.json`;

  try {
    if (!fsSync.existsSync(filePath)) {
      const defaultContent = JSON.stringify({ navigation: {} }, null, 2);
      await fs.writeFile(filePath, defaultContent, 'utf8');
    }

    let jsonData = await fs.readFile(filePath, 'utf8');

    if (!jsonData || jsonData.trim() === '') {
      jsonData = JSON.stringify({ navigation: {} });
      await fs.writeFile(filePath, jsonData, 'utf8');
    }

    let data;

    try {
      data = JSON.parse(jsonData);
    } catch (err) {
      console.error(`Invalid JSON in ${filePath}, resetting...`);

      data = { navigation: {} };
      await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
    }

    return data;

  } catch (error) {
    console.error(`Error reading/parsing JSON for ${code}:`, error);
    throw error;
  }
};

const removeFieldFromAllFiles = async (key, scope = 'all') => {
  try {
    const files = await fs.readdir('json');
    const normalizedScope = String(scope || 'all').toLowerCase();
    const jsonFiles = files.filter((file) => {
      if (!file.endsWith('.json')) return false;
      if (normalizedScope === 'web') return !file.startsWith('mob_');
      if (normalizedScope === 'mobile') return file.startsWith('mob_');

      return true;
    });

    for (const file of jsonFiles) {
      const filePath = `json/${file}`;

      try {
        let jsonData = await fs.readFile(filePath, 'utf8');

        if (!jsonData || jsonData.trim() === '') {
          continue;
        }

        let data;

        try {
          data = JSON.parse(jsonData);
        } catch {
          continue;
        }

        if (!data.navigation) {
          continue;
        }

        if (!(key in data.navigation)) {
          continue;
        }

        delete data.navigation[key];

        await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
      } catch (err) {
        console.log(`Error in file: ${file}`, err.message);
      }
    }
  } catch (error) {
    console.error('Error processing files:', error);
    throw error;
  }
};

/**
 * Convert navigation data to the desired structure
 * @returns {Promise<Array>} - The combined navigation data
 */
const convertMobileNavigationData = async () => {
  const getLanguageData = await getActiveLanguage();

  const codes = getLanguageData.map((lang) => lang.code);

  const languageDataArray = await Promise.all(codes.map((code) => getMobileLanguageByCode(code)));

  const allKeys = new Set();
  languageDataArray.forEach((data) => {
    Object.keys(data.navigation).forEach((key) => allKeys.add(key));
  });

  // Convert Set to array
  const navigationKeys = Array.from(allKeys);

  // Combine the data into the desired structure
  const combinedData = navigationKeys.map((key) => {
    const entry = { key };
    codes.forEach((code, index) => {
      entry[code] = languageDataArray[index].navigation[key] || '';
    });
    return entry;
  });

  return combinedData;
};

/**
 * Delete role by id
 * @param {string} key
 * @returns {Object}
 */
const deleteTranslation = async (key, scope = 'all') => {
  await removeFieldFromAllFiles(key, scope);

    return { status: "success",   msg:"Data Deleted Successfully" };
  };

/** App language code to Google Translate code */
const APP_TO_GOOGLE = { en: 'en', hi: 'hi', ta: 'ta', te: 'te', ka: 'kn', ma: 'ml' };

/**
 * Translate text to target language (each language gets its own translation).
 * @param {string} text - Text to translate
 * @param {string} targetLanguage - Target language code (en, hi, ta, te, ka, ma)
 * @param {string} sourceLanguage - Source language code (default 'en')
 * @returns {Promise<{ translatedText: string }>}
 */
const translateText = async (text, targetLanguage = 'en', sourceLanguage = 'en') => {
  if (!text || typeof text !== 'string' || !text.trim()) {
    return { translatedText: text || '' };
  }
  const target = (APP_TO_GOOGLE[targetLanguage] || targetLanguage).toLowerCase();
  const source = (APP_TO_GOOGLE[sourceLanguage] || sourceLanguage).toLowerCase();
  if (target === source) {
    return { translatedText: text.trim() };
  }
  try {
    const translated = await translateTextWithAPI(text.trim(), target);
    return { translatedText: translated || text.trim() };
  } catch (err) {
    console.error('Translation service error:', err.message);
    return { translatedText: text.trim() };
  }
};

/** Source language code for auto-translate when adding new language */
const SOURCE_LANGUAGE_CODE = 'en';

/**
 * Flatten navigation object to array of { keyPath, value } (only string values).
 * @param {Object} obj - navigation object (can be nested)
 * @param {string} prefix - key path prefix
 * @returns {Array<{ keyPath: string, value: string }>}
 */
const flattenNavigation = (obj, prefix = '') => {
  if (!obj || typeof obj !== 'object') return [];
  const entries = [];
  for (const [key, value] of Object.entries(obj)) {
    const keyPath = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'string') {
      entries.push({ keyPath, value });
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      entries.push(...flattenNavigation(value, keyPath));
    }
  }
  return entries;
};

/**
 * Set a nested key in an object by dot path (e.g. 'a.b.c' => obj.a.b.c = value).
 * @param {Object} obj - object to mutate
 * @param {string} keyPath - dot-separated path
 * @param {string} value - value to set
 */
const setByPath = (obj, keyPath, value) => {
  const keys = keyPath.split('.');
  let current = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];
    if (!current[k] || typeof current[k] !== 'object') current[k] = {};
    current = current[k];
  }
  current[keys[keys.length - 1]] = value;
};

/**
 * Automatically translate all English keys to a new language and create JSON files.
 * Called when a new language is added in language master (and active).
 * @param {string} targetCode - New language code (e.g. 'hi', 'ta', 'fr')
 * @returns {Promise<{ web: boolean, mobile: boolean }>}
 */
const translateAllEnglishToNewLanguage = async (targetCode) => {
  if (!targetCode || typeof targetCode !== 'string' || targetCode.toLowerCase() === SOURCE_LANGUAGE_CODE) {
    return { web: false, mobile: false };
  }
  const target = targetCode.toLowerCase().trim();
  try {
    const enData = await getLanguageByCode(SOURCE_LANGUAGE_CODE);
    const mobEnData = await getMobileLanguageByCode(SOURCE_LANGUAGE_CODE);
    const navEn = enData.navigation || {};
    const mobNavEn = mobEnData.navigation || {};

    const entriesWeb = flattenNavigation(navEn);
    const entriesMob = flattenNavigation(mobNavEn);

    const translateEntries = async (entries) => {
      if (entries.length === 0) return [];
      const texts = entries.map((e) => e.value);
      const translated = await batchTranslate(texts, target);
      return entries.map((e, i) => ({ keyPath: e.keyPath, value: translated[i] != null ? translated[i] : e.value }));
    };

    const translatedWeb = await translateEntries(entriesWeb);
    const translatedMob = await translateEntries(entriesMob);

    const buildNav = (translatedEntries) => {
      const nav = {};
      translatedEntries.forEach(({ keyPath, value }) => setByPath(nav, keyPath, value));
      return nav;
    };

    const webPath = `json/${target}.json`;
    const mobilePath = `json/mob_${target}.json`;
    await fs.writeFile(webPath, JSON.stringify({ navigation: buildNav(translatedWeb) }, null, 2), 'utf8');
    await fs.writeFile(mobilePath, JSON.stringify({ navigation: buildNav(translatedMob) }, null, 2), 'utf8');

    return { web: true, mobile: true };
  } catch (err) {
    console.error('translateAllEnglishToNewLanguage error:', err.message);
    throw err;
  }
};

module.exports = {
  createTranslation,
  getLanguage,
  getActiveLanguage,
  getLanguageByCode,
  convertNavigationData,
  convertMobileNavigationData,
  getActiveLanguagecode,
  removeFieldFromAllFiles,
  deleteTranslation,
  getActiveLanguageCodeAndId,
  translateText,
  translateAllEnglishToNewLanguage,
};
