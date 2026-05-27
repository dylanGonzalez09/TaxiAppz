// clientToken.route.js
const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const clientTokenValidation = require('../../validations/boilerplate/clientToken.validation');
const clientTokenController = require('../../controllers/boilerplate/clientToken.controller');

const router = express.Router();

router
  .route('/create')
  .post(
    auth('manageClientTokens'),
    validate(clientTokenValidation.upsertClientToken),
    clientTokenController.upsertClientToken,
  );

module.exports = router;
