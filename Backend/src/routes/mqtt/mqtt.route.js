const express = require('express');

const router = express.Router();
const mqttController = require('../../controllers/mqtt/mqtt.controller');

// Route to publish message
router.post('/publish', mqttController.publish);
router.post('/web/publish', mqttController.webPublish);

// Route to retrieve stored messages
router.get('/messages', mqttController.getMessages);

// chat message related routes

router.post('/sendMessage', mqttController.sendMessage);

router.get('/history', mqttController.historyMessage);

router.get('/users-for-driver', mqttController.usersForDriver);

router.get('/users-messages-driver/:userId', mqttController.usersForDriverMessages);

module.exports = router;
