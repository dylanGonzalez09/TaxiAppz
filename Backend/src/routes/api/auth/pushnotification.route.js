const express = require('express');
const auth = require('../../../middlewares/auth'); // Your authentication middleware
const notificationController = require('../../../controllers/api/auth/pushnotification.controller'); // Controller for handling notifications
const { pushNotificationUpload } = require('../../../middlewares/upload');

const router = express.Router();

// Route to send notifications to one, multiple, or all users

router.post(
  '/send',
  auth('SendNotifications'),
  pushNotificationUpload.single('image'),
  notificationController.pushNotification,
);
router.route('/list').get(auth('SendNotifications'), notificationController.getNotificationList);
router.route('/user').get(auth('SendNotifications'), notificationController.getUserList);
router.route('/driver').get(auth('SendNotifications'), notificationController.getDriverList);
router
  .route('/deleteNotification/:notificationId')
  .delete(auth('SendNotifications'), notificationController.deleteNotification);
router.route('/getDropDown/list/:clientId/:zoneId').get(notificationController.getDropDownList);
router.route('/getDropDown/list/:clientId/by-zone').post(notificationController.getDropDownListByZone);
router.route('/user/sent').post(auth('SendNotifications'), notificationController.sendNotificationToUser);
router.route('/getpagination/list').get(auth('SendNotifications'), notificationController.getPaginationNotificationList);
router
  .route('/updateNotification/:notificationId')
  .patch(auth('SendNotifications'), notificationController.updatePushNotification);
router.post('/sendBulkemail', auth('SendNotifications'), notificationController.sendPushNotificationEmail);
router.get('/emailNotifications', auth('SendNotifications'), notificationController.getEmailNotifications);
module.exports = router;
