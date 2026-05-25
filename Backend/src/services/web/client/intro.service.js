const httpStatus = require('http-status');
const ApiError = require('../../../utils/ApiError');
const { Intro } = require('../../../models');

/**
 * Create a intro
 * @param {Object} introBody
 * @returns {Promise<Intro>}
 */
const createIntro = async (introBody) => {
  return Intro.create(introBody);
};

/**
 * Query for vehicles
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryIntros = async (filter, options) => {
  const Intros = await Intro.paginate(filter, options);
  return Intros;
};

/**
 * Get Intross
   @param {ObjectId} clientId - The clientId to filter users by
 * @returns {Promise<Intro>}
 */
const getIntross = async (clientId) => {
  return Intro.find({clientId:clientId});
};

/**
 * Get Intro by id
 * @param {ObjectId} id
 * @returns {Promise<Intro>}
 */
const getIntroById = async (id) => {
  return Intro.findById(id);
};

/**
 * Update Intro by id
 * @param {ObjectId} IntroId
 * @param {Object} updateBody
 * @returns {Promise<Intro>}
 */
const updateIntroById = async (IntroId, updateBody) => {
  const Intro = await getIntroById(IntroId);
  if (!Intro) {
    throw new ApiError(httpStatus.NOT_FOUND, 'intro not found');
  }
  Object.assign(Intro, updateBody);
  await Intro.save();
  return Intro;
};

/**
 * Delete vehicle by id
 * @param {ObjectId} IntroId
 * @returns {Object}
 */
const deleteIntroById = async (IntroId) => {
  const Intro = await getIntroById(IntroId);
  if (!Intro) {
    throw new ApiError(httpStatus.NOT_FOUND, 'intro not found');
  }
  await Intro.deleteOne();
  return { status: "success", msg: "Data Deleted Successfully" };
};

module.exports = {
  createIntro,
  getIntross,
  getIntroById,
  queryIntros,
  updateIntroById,
  deleteIntroById,
};
