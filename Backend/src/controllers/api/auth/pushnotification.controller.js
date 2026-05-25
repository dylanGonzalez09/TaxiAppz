const httpStatus = require('http-status');
const pick = require('../../../utils/pick');
const ApiError = require('../../../utils/ApiError');
const catchAsync = require('../../../utils/catchAsync');
const { pushNotificationService } = require('../../../services');
const { User, Notification, Driver } = require('../../../models')
const Response = require('../../../config/response');

const getClientId = async (req) => {
  clientId = '';
  if (!req.headers.clientid) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ClientID not found');
  } else {
    clientId = req.headers.clientid;
  }
  return clientId;
}

const pushNotification = catchAsync(async (req, res) => {

  const { title, subTitle, message, imageName, zoneIds, userIds, driverIds } = req.body;

  // Check if title, message, and imageName are provided
  if (!title || !message) {
    return res.status(400).json({ error: 'Title, message, and image are required.' });
  }

  // Prepare message data
  const messageData = { title, message, imageName, subTitle };
  let clientId = await getClientId(req);
  let companyId = req.headers.companyId || null;

  // Prepare user and driver ids
  let userIdsToSend = [];
  let driverIdsToSend = [];

  if (userIds) {
    userIdsToSend = (await User.find({})).map(user => user._id.toString());
  }

  if (driverIds) {
    driverIdsToSend = (await User.find({})).map(user => user._id.toString());
  }

  if (zoneIds && zoneIds.length > 0) {
    const drivers = await Driver.find({
      $or: [
        { serviceLocation: { $in: zoneIds } },
        { secondaryZone: { $in: zoneIds } }
      ]
    }).select('userId');

    driverIdsToSend = drivers.map(driver => driver.userId.toString());
  }

  if (!userIdsToSend.length && !driverIdsToSend.length) {
    return res.status(400).json({ error: 'No users or drivers to send notifications to.' });
  }

  try {
    if (userIdsToSend.length) {
      await pushNotificationService.sendNotification(req, userIdsToSend, messageData);
    }
    if (driverIdsToSend.length) {
      await pushNotificationService.sendNotification(req, driverIdsToSend, messageData);
    }

    const notification = {
      title,
      subTitle,
      message,
      clientId,
      companyId,
      image: imageName,

      status: 1,  // Mark as sent (success)
      notificationType: 'GENERAL',
      sourceType: 'Web',
      userIds: userIdsToSend,
      driverIds: driverIdsToSend,
      createdBy: req.user ? req.user.id : null,
    };

    await Notification.create(notification);

    res.status(200).json({ success: true, message: 'Notifications sent successfully.' });

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: 'Error sending notifications' });
  }
});







const getNotificationList = catchAsync(async (req, res) => {

  const notificationList = await pushNotificationService.getNotificationList(req, res);
  if (!notificationList) {
    throw new ApiError(httpStatus.NOT_FOUND, 'notificationList not found');
  }
  const response = Response(true, notificationList, "Success");
  res.status(httpStatus.OK).send(response);
});


const getPaginationNotificationList = catchAsync(async (req, res) => {

  const notificationList = await pushNotificationService.getPaginationNotificationList(req, res);
  if (!notificationList) {
    throw new ApiError(httpStatus.NOT_FOUND, 'notificationList not found');
  }
  const response = Response(true, notificationList, "Success");
  res.status(httpStatus.OK).send(response);
});

const getUserList = catchAsync(async (req, res) => {

  const user = await pushNotificationService.getUserList(req);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'user not found');
  }
  const response = Response(true, user, 'Success');
  res.status(httpStatus.OK).send(response);
});

const getDriverList = catchAsync(async (req, res) => {

  const drivers = await pushNotificationService.getDriverList(req);
  if (!drivers) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Drivers not found');
  }
  const response = Response(true, drivers, "Drivers retrieved successfully");
  res.status(httpStatus.OK).send(response);
});
const deleteNotification = catchAsync(async (req, res) => {
  const notification = await pushNotificationService.deleteNotificationById(req.params.notificationId);
  const response = Response(true, notification, "Success");
  res.status(httpStatus.OK).send(response);
});
const getDropDownList = catchAsync(async (req, res) => {
  let data = await pushNotificationService.getDropDowns(req.params.clientId);

  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, 'data not found');
  }
  const response = Response(true, data, "Success");
  res.status(httpStatus.OK).send(response);
});



const sendNotificationToUser = async (req, res) => {
  try {
    const userId = req.body.userId; // Assuming user ID is passed in URL
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }

    // Get the device token of the user
    const userToken = user.deviceInfoHash;  // Assuming the user's device token is stored in the `deviceToken` field

    if (!userToken) {
      return res.status(400).send({ message: 'User does not have a device token' });
    }

    // Send push notification to the user
    const notificationMessage = 'You have a new message!';
    await pushNotificationService.sendPushNotification(userToken, 'New Notification', notificationMessage);

    return res.status(200).send({ message: 'Notification sent successfully' });

  } catch (error) {
    console.error('Error in sendNotificationToUser:', error);
    return res.status(500).send({ message: 'Internal Server Error' });
  }
};


const updatePushNotification = catchAsync(async (req, res) => {

  const body = {
    isRead: true
  }

  let pushNotification;

  if (req.params.notificationId != "all") {
    pushNotification = await pushNotificationService.updateNotificationById(req.params.notificationId, body);
  } else {
    pushNotification = await pushNotificationService.updateAllNotificationByuserId(req);
  }

  const response = Response(true, pushNotification, "Success");
  res.status(httpStatus.OK).send(response);
});


module.exports = {
  pushNotification,
  getNotificationList,
  getUserList,
  getDriverList,
  deleteNotification,
  getDropDownList,
  sendNotificationToUser,
  getPaginationNotificationList,
  updatePushNotification
};
