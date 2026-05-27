const httpStatus = require('http-status').default || require('http-status').status || require('http-status');
const ApiError = require('../../../utils/ApiError');
const { Language, ProjectVersion } = require('../../../models');
const fs = require('fs').promises;
const fsSync = require('fs');
const { Settings, Client,PhoneInfo } = require('../../../models');
const ObjectId = require('mongoose').Types.ObjectId
const { getClientId, validateClientId } = require('../../../config/clientValidator'); // Import the functions
const mongoose = require('mongoose');
const { trackDeviceInstall,getInstallCounts } = require('../../../services/api/auth/phoneInfo.service');



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
        settingsObject[setting.name] = setting.value;
      });


      return {
        name: group._id,
        settings: settingsObject
      };
    });

    const [general, keys, modules] = ['general', 'keys', 'modules'].map(
          (name) => formattedResults.find((e) => e.name === name)
      );

    const lang = await Language.findById(general?.settings?.defaultLanguage);

    if (lang) {
      [general, keys, modules].forEach((item) => {
        if (item?.settings) {
          item.settings.defaultLanguage = lang.code;
        }
      });
    }

    return formattedResults;
  } catch (error) {
    console.error('Error in aggregation:', error);
    throw error;
  }
};


// const getLanguages = async (req) => {

//   clientID = await getClientId(req);

//   await validateClientId(clientID)

//   code = req.body.Code;

//   const versioncode = await ProjectVersion.find({ versionCode: code,status: true, clientId: clientID });

//   if (versioncode.length > 0) {
//     const settingApi = await getSettingsApi(clientID);
//     const languages = await Language.find({ status: true, clientId: clientID }).lean();
//     const data = {
//       languages: languages,
//       settings: settingApi
//     };

//     return data;
//   } else {
//     throw new ApiError(426, "Please Update Application");
//   }
// }

const getLanguages = async (req) => {

  // ✅ Track install (upsert only)
  await trackDeviceInstall(req);

  const clientID = await getClientId(req);
  await validateClientId(clientID);

  const version = req.body?.Code;
  if (!version) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Version code is required');
  }

  const versionDoc = await ProjectVersion.findOne({
    clientId: clientID,
    status: true,
    $or: [
      { versionCode: version },
      { versionNumber: version }
    ]
  });

  if (!versionDoc) {
    throw new ApiError(426, 'Please Update Application');
  }

  const settingApi = await getSettingsApi(clientID);
  const languages = await Language.find({
    status: true,
    clientId: clientID
  }).lean();

  // ✅ GET INSTALL COUNTS (ANDROID / IOS)
  const installCounts = await getInstallCounts(clientID);

  // ✅ RETURN IN SAME API
  return {
    languages,
    settings: settingApi,
    installs: installCounts   //  added here
  };
};


const getLauguageByCode = async (req) => {

  let clientID = await getClientId(req);

  const clientExists = await Client.findOne({ _id: clientID });


  if (!clientExists) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid clientId');
  }

  code = req.params.languageCode;

  const filePath = `json/mob_${code}.json`;
  try {
    if (!fsSync.existsSync(filePath)) {
      // Create the file with default content if it doesn't exist
      const defaultContent = JSON.stringify({ navigation: {} }, null, 2);
      await fs.writeFile(filePath, defaultContent, 'utf8');
    }
    const jsonData = await fs.readFile(filePath, 'utf8');
    const parsedData = JSON.parse(jsonData);

    // Extract the navigation data
    const navigationData = parsedData.navigation || {};
    // const settingApi = await getSettingsApi(clientID);



    return navigationData;
  } catch (error) {
    console.error(`Error reading or parsing JSON file for ${code}:`, error);
    throw error;
  }
}


module.exports = {
  getLanguages,
  getLauguageByCode
};
