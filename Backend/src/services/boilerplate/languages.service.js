const httpStatus = require('http-status').default || require('http-status').status || require('http-status');
const ApiError = require('../../utils/ApiError');
const { Language } = require('../../models');
const fs = require('fs').promises;
const { translateAllEnglishToNewLanguage } = require('./translation.service');

const shouldAutoTranslateLanguage = (languageDoc) => {
  if (!languageDoc) return false;
  if (!languageDoc.status) return false;

  const code = String(languageDoc.code || '').toLowerCase().trim();

  return !!code && code !== 'en';
};

const triggerLanguageBootstrapTranslation = (languageDoc) => {
  if (!shouldAutoTranslateLanguage(languageDoc)) return;

  const code = String(languageDoc.code || '').toLowerCase().trim();

  setImmediate(async () => {
    try {
      await translateAllEnglishToNewLanguage(code);
    } catch (error) {
      console.error(`Auto-translation bootstrap failed for language "${code}":`, error?.message || error);
    }
  });
};

/**
 * Create a lauguage
 * @param {Object} lauguageBody
 * @returns {Promise<Language>}
 */
const createLanguage = async (lauguageBody) => {
  const language = await Language.create(lauguageBody);

  triggerLanguageBootstrapTranslation(language);

  return language;
};

/**
 * Query for roles
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryLanguage = async (filter, options, clientId) => {
  if (clientId) {
    filter.clientId = clientId;
  }
  options.sortBy = options.sortBy || 'createdAt:desc';

  const language = await Language.paginate(filter, options);

  return language;
};
const queryLanguageActive = async (filter, options, clientId) => {
  if (clientId) {
    filter.clientId = clientId;
    filter.status = true;
  }
  options.sortBy = options.sortBy || 'createdAt:desc';

  const language = await Language.paginate(filter, options);

  return language;
};

/**
 * @param {Object} clientId - The match criteria for the aggregation
 * Get roles
 * @returns {Promise<Language>}
 */
const getLanguage = async (clientId) => {
  return Language.find({ clientId });
};

/**
 * @param {Object} clientId - The match criteria for the aggregation
 * @returns {Promise<Language>}
 */
const getLanguageByActive = async (clientId) => {
  return Language.find({
    status: true,
    clientId,
  });
};

/**
 * @returns {Promise<Language>}
 */
const getIntroLanguage = async () => {
  return Language.find({
    status: true,
  });
};

/**
 * Get role by id
 * @param {ObjectId} languageId
 * @returns {Promise<Language>}
 */
const getLauguageById = async (languageId) => {
  return Language.findById(languageId);
};

/**
 * Get role by id
 * @param {ObjectId} code
 * @returns {Promise<Language>}
 */
const getLauguageByCode = async (code) => {
  const url = `http://13.62.26.82/frontend/src/data/dictionaries/${code}.json`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`Warning: Language file for '${code}' not found.`);
        return { navigation: {} }; // Fallback content
      }
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const jsonData = await response.json();
    return jsonData;
  } catch (error) {
    console.error('Error fetching or parsing JSON file:', error);
    throw error;
  }
};

/**
 * Update language by id
 * @param {ObjectId} languageId
 * @param {Object} updateBody
 * @returns {Promise<Language>}
 */
const updateLanguageById = async (languageId, updateBody) => {
  const language = await getLauguageById(languageId);
  if (!language) {
    throw new ApiError(httpStatus.NOT_FOUND, 'language not found');
  }

  const wasInactive = !language.status;
  Object.assign(language, updateBody);
  await language.save();

  const becameActive = wasInactive && language.status;

  if (becameActive) {
    triggerLanguageBootstrapTranslation(language);
  }

  return language;
};

/**
 * Delete language by id
 * @param {ObjectId} languageId
 * @returns {Object}
 */
const deletelanguageById = async (languageId) => {
  const language = await getLauguageById(languageId);
  if (!language) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Language not found');
  }
  await language.deleteOne();
  return { status: 'success', msg: 'data Deleted Successfully' };
};

module.exports = {
  createLanguage,
  getLanguage,
  queryLanguageActive,
  queryLanguage,
  getLauguageById,
  updateLanguageById,
  deletelanguageById,
  getLauguageByCode,
  getLanguageByActive,
  getIntroLanguage,
};
