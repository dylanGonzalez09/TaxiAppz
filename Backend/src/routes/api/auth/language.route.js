const express = require('express');
const auth = require('../../../middlewares/auth');
const validate = require('../../../middlewares/validate');
const languageValidation = require('../../../validations/api/auth/language.validations');
const languageController = require('../../../controllers/api/auth/language.controller');

const router = express.Router();

router.post('/getLanguage', validate(languageValidation.getLanguage), languageController.getlanguage);

router.get(
  '/getLanguages/:languageCode',
  validate(languageValidation.getLanguagebyCode),
  languageController.getlanguageByCode,
);

module.exports = router;
