const httpStatus = require('http-status');
const ApiError = require('../../utils/ApiError');
const { Language } = require('../../models');
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
const createTranslation = async (TranslationBody) => {
    const filePath = `src/json/${TranslationBody.code}.json`;

    try {
      // Initialize JSON content
      let jsonContent = {};
  
      // Check if file exists
      try {
        const fileContent = await fs.readFile(filePath, 'utf8');
        jsonContent = JSON.parse(fileContent);
      } catch (err) {
        if (err.code === 'ENOENT') {
           jsonContent = {};
        } else {
          throw err;
        }
      }
      // Update the value
      const keys = TranslationBody.key.split('.');
      let current = jsonContent.navigation;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = TranslationBody.value;
  
      // Write the updated JSON back to the file
      await fs.writeFile(filePath, JSON.stringify(jsonContent, null, 2));


      const form = new FormData();

      form.append('file', fsData.createReadStream(filePath));

  
      // Perform the file upload request
      const response = await axios.post('https://backend.alfatogo.com/v1/json/admin/create', form, {
        headers: {
          ...form.getHeaders(), // Required to set the Content-Type
        },
      });
  
      return jsonContent; // Return the updated JSON content
    } catch (error) {
      console.error('Error updating translation:', error);
      throw error;
    }

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
    return Language.find({ status: true });
};


/**
 * Get roles
 * @returns {Promise<Language>}
 */
const getActiveLanguagecode = async () => {
    const language = await Language.find({ status: true })
    const codes = language.map(lang => lang.code);

    return codes;
};


/**
 * Get active language codes and IDs
 * @returns {Promise<Array<{ id: string, code: string }>>}
 */
const getActiveLanguageCodeAndId = async (req) => {
    const languages = await Language.find({ status: true,clientId: req.headers.clientid }, { _id: 1, code: 1,name: 1 });
    const codesWithIds = languages.map(lang => ({
        id: lang._id,
        code: lang.code,
        name: lang.name
    }));
    return codesWithIds;
};


/**
 * Get language data by code
 * @param {string} code - The language code
 * @returns {Promise<Object>} - The parsed JSON data
 */
const getLanguageByCode = async (code) => {
    const filePath = `src/json/${code}.json`;
    try {

        if (!fsSync.existsSync(filePath)) {
            // Create the file with default content if it doesn't exist
            const defaultContent = JSON.stringify({ navigation: {} }, null, 2);
            await fs.writeFile(filePath, defaultContent, 'utf8');
        }

        const jsonData = await fs.readFile(filePath, 'utf8');
        return JSON.parse(jsonData);
    } catch (error) {
        console.error(`Error reading or parsing JSON file for ${code}:`, error);
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
    const codes = getLanguageData.map(lang => lang.code);

    const languageDataArray = await Promise.all(
        codes.map((code) => getLanguageByCode(code))
    );

    // Get the navigation keys from the first language data (assuming it has all keys)
    const allKeys = new Set();
    languageDataArray.forEach(data => {
        Object.keys(data.navigation).forEach(key => allKeys.add(key));
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
    const filePath = `src/json/mob_${code}.json`;
    try {

        if (!fsSync.existsSync(filePath)) {
            // Create the file with default content if it doesn't exist
            const defaultContent = JSON.stringify({ navigation: {} }, null, 2);
            await fs.writeFile(filePath, defaultContent, 'utf8');
        }
        const jsonData = await fs.readFile(filePath, 'utf8');
        return JSON.parse(jsonData);
    } catch (error) {
        console.error(`Error reading or parsing JSON file for ${code}:`, error);
        throw error;
    }
};


const removeFieldFromAllFiles = async (key) => {
    try {
        const files = await fs.readdir('src/json');

                // Filter to get only JSON files
        const jsonFiles = files.filter(file => file.endsWith('.json'));

        for (const file of jsonFiles) {
            const filePath = `src/json/${file}`;
            const jsonData = await fs.readFile(filePath, 'utf8');
            const data = JSON.parse(jsonData);

            // Remove the specified key
            if (data.navigation) {
                delete data.navigation[key];
            }

            // Write the modified data back to the file
            await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');

            // const form = new FormData();
            // form.append('file', fsData.createReadStream(filePath));
        
            // // Perform the file upload request
            // const response = await axios.post('http://192.168.1.115:3001/v1/json/admin/create', form, {
            //   headers: {
            //     ...form.getHeaders(), // Required to set the Content-Type
            //   },
            // });
        
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

    const codes = getLanguageData.map(lang => lang.code);

    const languageDataArray = await Promise.all(
        codes.map((code) => getMobileLanguageByCode(code))
    );

    const allKeys = new Set();
    languageDataArray.forEach(data => {
        Object.keys(data.navigation).forEach(key => allKeys.add(key));
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
const deleteTranslation = async (key) => {
    await removeFieldFromAllFiles(key);

    return { status: "success",   msg:"data Deleted Successfully" };
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
    getActiveLanguageCodeAndId
};
