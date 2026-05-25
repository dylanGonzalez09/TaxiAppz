const httpStatus = require('http-status');
const ApiError = require('../../utils/ApiError');
const { Language } = require('../../models');
const fs = require('fs').promises;

/**
 * Create a lauguage
 * @param {Object} lauguageBody
 * @returns {Promise<Language>}
 */
const createLanguage = async (lauguageBody) => {
  return Language.create(lauguageBody);
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



/**
 * @param {Object} clientId - The match criteria for the aggregation
 * Get roles
 * @returns {Promise<Language>}
 */
const getLanguage = async (clientId) => {
  return Language.find({ clientId : clientId });
};

/**
 * @param {Object} clientId - The match criteria for the aggregation
 * @returns {Promise<Language>}
 */
const getLanguageByActive = async (clientId) => {
  return Language.find({
      status: true , clientId : clientId});
};

/**
 * @returns {Promise<Language>}
 */
const getIntroLanguage = async () => {
  return Language.find({
      status: true });
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
  const filePath = `src/json/${code}.json`;
   try {
    const jsonData = await fs.readFile(filePath, { encoding: 'utf8' });
    // Return the parsed JSON data
    return JSON.parse(jsonData);
  } catch (error) {
    console.error('Error reading or parsing JSON file:', error);
    throw error; // Rethrow the error to handle it further up the call stack
  }
}

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

  Object.assign(language, updateBody);
  await language.save();
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
  return { status: "success",   msg:"data Deleted Successfully" };
};

module.exports = {
  createLanguage,
  getLanguage,
  queryLanguage,
  getLauguageById,
  updateLanguageById,
  deletelanguageById,
  getLauguageByCode,
  getLanguageByActive,
  getIntroLanguage
};
