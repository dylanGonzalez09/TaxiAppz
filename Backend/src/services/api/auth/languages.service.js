const httpStatus = require('http-status');
const ApiError = require('../../../utils/ApiError');
const { Language, ProjectVersion } = require('../../../models');
const fs = require('fs').promises;
const fsSync = require('fs');
const { Settings, Client } = require('../../../models');
const ObjectId = require('mongoose').Types.ObjectId
const { getClientId, validateClientId } = require('../../../config/clientValidator'); // Import the functions




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
        name: group._id,
        settings: settingsObject
      };
    });


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
//     // throw new ApiError(426, "Please Update Application");

//     throw new ApiError(httpStatus.UPGRADE_REQUIRED, "Please Update Application");
    
//   }
// }
const getLanguages = async (req) => {
  const clientID = await getClientId(req);
  await validateClientId(clientID);

  const code = req.body.Code;
  const versioncode = await ProjectVersion.find({ versionCode: code, status: true, clientId: clientID });

  if (versioncode.length > 0) {
    const settingApi = await getSettingsApi(clientID);
    const languages = await Language.find({ status: true, clientId: clientID });

    // Extract defaultLanguage ID from settings
    let defaultLanguageId = settingApi.find(s => s.name === "general")?.settings?.defaultLanguage;

    // Find the language code by matching the defaultLanguage ID
    let defaultLanguageCode = languages.find(lang => lang._id.toString() === defaultLanguageId)?.code;

    // Now, replace the defaultLanguage ID with the found code
    if (defaultLanguageCode) {
      settingApi.forEach(setting => {
        if (setting.name === "general") {
          setting.settings.defaultLanguage = defaultLanguageCode;
        }
      });
    }

    return {
        languages,
        settings: settingApi,
    };
  } else {
    throw new ApiError(httpStatus.UPGRADE_REQUIRED, "Please Update Application");
  }
};

const getLauguageByCode = async (req) => {

  let clientID = await getClientId(req);

  const clientExists = await Client.findOne({ _id: clientID });


  if (!clientExists) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid clientId');
  }

  code = req.params.languageCode;

  const filePath = `src/json/mob_${code}.json`;
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
