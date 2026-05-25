const httpStatus = require('http-status');
const ApiError = require('../../utils/ApiError');
const { Country } = require('../../models');

/**
 * Create a country
 * @param {Object} countryBody
 * @returns {Promise<Country>}
 */
const createCountry = async (countryBody) => {
  return Country.create(countryBody);
};

/**
 * Query for country
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryCountrys = async (filter, options,clientId) => {
  if (clientId) {
    filter.clientId = clientId;
  }
  options.sortBy = options.sortBy || 'name:asc';

  const countrys = await Country.paginate(filter, options);
  return countrys;
};


/**
 * Get countrys
 *  @param {ObjectId} clientId
 * @returns {Promise<Country>}
 */
const getCountrys = async (clientId) => {
  return Country.find({clientId : clientId});
};


/**
 * Get countrys
 *  @param {ObjectId} clientId - The clientId to filter users by
 * @returns {Promise<Country>}
 */
const getCountrysByActive = async (clientId) => {
  return Country.find({ clientId : clientId , status: true });
};


/**
 * Get country by id
 * @param {ObjectId} countryId
 * @returns {Promise<Country>}
 */
const getCountryById = async (countryId) => {
  return Country.findById(countryId);
};


/**
 * Update country by id
 * @param {ObjectId} countryId
 * @param {Object} updateBody
 * @returns {Promise<Country>}
 */
const updateCountryById = async (countryId, updateBody) => {
  const country = await getCountryById(countryId);
  if (!country) {
    throw new ApiError(httpStatus.NOT_FOUND, 'country not found');
  }

  Object.assign(country, updateBody);
  await country.save();
  return country;
};

/**
 * Delete country by id
 * @param {ObjectId} countryId
 * @returns {Object}
 */
const deleteCountryById = async (countryId) => {
  const country = await getCountryById(countryId);
  if (!country) {
    throw new ApiError(httpStatus.NOT_FOUND, 'country not found');
  }
  await country.deleteOne();
  return { status: "success",   msg:"data Deleted Successfully" };
};

const getCountries = async () => {
  return Country.find({ status: true });
};

module.exports = {
  createCountry,
  queryCountrys,
  getCountrys,
  getCountryById,
  updateCountryById,
  deleteCountryById,
  getCountrysByActive,
  getCountries
};
