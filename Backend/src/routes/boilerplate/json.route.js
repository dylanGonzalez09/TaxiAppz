const express = require('express');
const jsonController = require('../../controllers/boilerplate/json.controller');

const router = express.Router();

router.route('/create').post( jsonController.createJson);

module.exports = router;
