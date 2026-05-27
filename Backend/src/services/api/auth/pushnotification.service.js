const admin = require('firebase-admin');
const { User, Notification, Driver,Zone,Role } = require('../../../models');
const { tokenService } = require('../../../services');
const pick = require('../../../utils/pick');
const ObjectId = require('mongoose').Types.ObjectId
const { sendBulkEmail } = require('../../../services/email.service');
const {getUserId,getClientId,getDriverId} = require('../../../utils/commonFunction')


const getUser = async (req) => {

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(httpStatus.UNAUTHORIZED).send({ message: 'Authorization header is missing or invalid' });
    return;
  }
  // Remove the 'Bearer ' prefix and get the token
  const token = authHeader.substring(7);

  const user = await tokenService.verifyTokenAndGetUser(token);

  return user;
}



const sendNotification = async (req, userIds, messageData) => {
  const userData = await getUser(req);
  try {
    if (!userData.active) {
      throw new Error('User is blocked, please contact admin');
    }

    // Fetch users by IDs
    const users = await User.find({ _id: { $in: userIds } });

    const tokens = users
      .map(user => user.deviceInfoHash)
      .filter(deviceInfoHash => !!deviceInfoHash); // Ensure truthy values

    if (!tokens.length) {
      return { successCount: 0, failureCount: 0, responses: [] };
    }

    const message = {
      notification: {
        title: messageData.title,
        body: messageData.message,
        image: "https://tse1.mm.bing.net/th?id=OIP.tC5uItpH-BLvuKnHs5gC4AHaHa&pid=Api&P=0&h=180",
      },
      data: {
        title: messageData.title,
        body: messageData.message,
        image: "https://tse1.mm.bing.net/th?id=OIP.tC5uItpH-BLvuKnHs5gC4AHaHa&pid=Api&P=0&h=180",
        type: "general",
      },
    };

    // Send notifications
    const responses = await Promise.allSettled(
      tokens.map(async token => {
        return admin.messaging().send({ ...message, token });
      })
    );

    // Save notification history for each user
    // const notificationPromises = users.map(async (user) => {
    //   const response = responses.find(r =>
    //     r.status === 'fulfilled' && r.value === user.deviceInfoHash
    //   );
    //   const notification = new Notification({
    //     title: messageData.title,
    //     userId: user._id, // Store the individual user ID
    //     subTitle: messageData.subTitle || null,
    //     message: messageData.message,
    //     image: messageData.imageName || null,
    //     status: response ? 1 : 0, // 1 = success, 0 = failure
    //     notificationType: messageData.notificationType || 'GENERAL',
    //     sourceType:'Web',
    //     clientId: messageData.clientId || null,
    //   });
    //   return notification.save();
    // });

    // await Promise.all(notificationPromises);

    // Analyze responses
    const successResponses = responses.filter(r => r.status === 'fulfilled');
    const failureResponses = responses.filter(r => r.status === 'rejected');

    return {
      successCount: successResponses.length,
      failureCount: failureResponses.length,
      responses: {
        success: successResponses.map(r => r.value),
        failure: failureResponses.map(r => r.reason),
      },
    };
  } catch (error) {
    console.error('Error sending notifications:', error.message);
    throw error;
  }
};


const getNotificationList = async (req) => {
  let userId = await getUserId(req);

  const filter = pick(req.query, ['']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);

  filter.isRead = false;
  filter.userId = new ObjectId(userId);
  // filter.sourceType = 'Web';

  options.sortBy = options.sortBy || 'createdAt:desc';

  const notificationList = await Notification.paginate(filter, options);
  return notificationList;
};



const getPaginationNotificationList = async (req, res) => {
  try {

    const notificationList = await Notification.find({
      sourceType: "Web",
      notificationType: { $ne: "EMAIL" } // exclude email
    }).sort({ createdAt: -1 });

    return notificationList;

  } catch (error) {

    console.error('Error fetching notifications:', error);

    return res.status(400).json({ message: 'Catch error', error: error.message });
  }
};
const getUserList = async (req) => {
  clientId = await getClientId(req);
  const users = await User.find({ clientId: clientId, active: true }).select('_id firstName lastName');
  const result = users.map(user => ({
    id: user._id,
    name: user.firstName,
  }));

  return result;
};

const getDriverList = async (req) => {
  try {
    const clientId = await getClientId(req);

    const filter = {
      clientId: new ObjectId(clientId),
    };

    const results = await Driver.aggregate([
      {
        $match: filter,
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: {
          path: '$user',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: {
          'user.active': true,
        },
      },
      {
        $project: {
          _id: 0,
          id: '$user._id',
          name: '$user.firstName',

        },
      },
    ]);

    return results;
  } catch (error) {
    console.error('Error in aggregation:', error);
    throw error;
  }
};
const getNotificationById = async (id) => {
  return Notification.findById(id);
};

const deleteNotificationById = async (notificationId) => {
  const notification = await getNotificationById(notificationId);
  if (!notification) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Notification not found');
  }
  await Notification.deleteOne({ _id: notificationId });

  return { status: "success", msg: "Data deleted successfully" };
};

/**
 * Get roles
  * @param {ObjectId} clientId
 * @returns {Promise<Role>}
 */
// const getDropDowns = async (clientId) => {

//   const userData = await Users.find(
//     { active: true, clientId: clientId },
//     { _id: 1, firstname: 1 }
//   );
//   const driverData = await Driver.find({ status: true, clientId: clientId });
//   const data = {
//     users: userData,
//     driver: driverData,
//   }


//   return data;
// };
// const getDropDowns = async (clientId) => {
//   const zonedata = await Zone.find({ clientId: clientId });

//   const data = {
//     zone: zonedata.map(zone => ({
//       id: zone._id,
//       zoneName: zone.zoneName,
//     })),
//   };
//   return data;
// };

const getRoleIdsByRoleName = async (roleName) => {
  const roles = await Role.find({ role: roleName });
  return roles.map((role) => role.id);
};

const getDropDowns = async (clientId,zoneId) => {


  const [userRoleIds, driverRoleIds] = await Promise.all([
    getRoleIdsByRoleName("User"),
    getRoleIdsByRoleName("Driver"),
  ]);

  // Ensure we have arrays (handle cases where getRoleIdsByRoleName might return null/undefined)
  const userRoleIdsArray = userRoleIds ? [...userRoleIds] : [];
  const driverRoleIdsArray = driverRoleIds ? [...driverRoleIds] : [];

  const zoneData = await Zone.find({ clientId: clientId,status:true, _id: zoneId });
 // USERS (added email)
  const userData = await User.find({
    clientId: clientId,
    zoneId: zoneId,
    roleIds: { $in: userRoleIdsArray }
  }).select("firstName phoneNumber email");
 const driverData = await Driver.find({
    clientId: clientId,
    serviceLocation: zoneId,
  }).populate({
    path: 'userId',
    match: {
      roleIds: { $in: driverRoleIdsArray },
    },
  });


  const data = {
    zone: zoneData.map(zone => ({
      id: zone._id,
      zoneName: zone.zoneName,
    })),
  };

  let datas = {
    zonedata: data,
    Userdata: userData,
    Driverdata: driverData
  }

  return datas;
};

const getDropDownsByZone = async (clientId, zoneIds = []) => {
  const [userRoleIds, driverRoleIds] = await Promise.all([
    getRoleIdsByRoleName('User'),
    getRoleIdsByRoleName('Driver'),
  ]);

  const userRoleIdsArray = userRoleIds ? [...userRoleIds] : [];
  const driverRoleIdsArray = driverRoleIds ? [...driverRoleIds] : [];
  const normalizedZoneIds = (zoneIds || [])
    .filter(Boolean)
    .map((id) => new ObjectId(id));
  const hasZoneFilter = normalizedZoneIds.length > 0;

  const zoneQuery = { clientId: clientId, status: true };

  if (hasZoneFilter) {
    zoneQuery._id = { $in: normalizedZoneIds };
  }

  const userQuery = {
    clientId: clientId,
    active: true,
    roleIds: { $in: userRoleIdsArray },
  };

  if (hasZoneFilter) {
    userQuery.zoneId = { $in: normalizedZoneIds };
  }

  const driverQuery = {
    clientId: clientId,
  };

  if (hasZoneFilter) {
    driverQuery.$or = [
      { serviceLocation: { $in: normalizedZoneIds } },
      { secondaryZone: { $in: normalizedZoneIds } },
    ];
  }

  const [zoneData, userDataRaw, driverDataRaw] = await Promise.all([
    Zone.find(zoneQuery),
    User.find(userQuery).select('firstName phoneNumber email'),
    Driver.find(driverQuery).populate({
      path: 'userId',
      match: {
        roleIds: { $in: driverRoleIdsArray },
        active: true,
      },
    }),
  ]);

  const driverData = driverDataRaw.filter((driver) => !!driver.userId);

  return {
    zonedata: {
      zone: zoneData.map((zone) => ({
        id: zone._id,
        zoneName: zone.zoneName,
      })),
    },
    Userdata: userDataRaw,
    Driverdata: driverData,
  };
};

/**
 * Send Push Notification to a single device
 * @param {string} token - The device token
 * @param {string} title - The title of the notification
 * @param {string} message - The message of the notification
 */
const sendPushNotification = async (token, title, message) => {
  try {
    const messagePayload = {
      token: token,  // Device token
      notification: {
        title: title,  // Title of the notification
        body: message, // Body of the notification
      },
      android: {
        priority: 'high',
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            alert: {
              title: title,
              body: message,
            },
          },
        },
      },
    };

    const response = await admin.messaging().send(messagePayload);


    return response;
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
};





/**
 * Get wallet by id
 * @param {ObjectId} id
 * @returns {Promise<Sos>}
 */
const getPushNotificationById = async (id) => {
  return Notification.findById(id);
};




/**
* Update Sos by id
* @param {ObjectId} notificationId
* @param {Object} updateBody
* @returns {Promise<Sos>}
*/
const updateNotificationById = async (notificationId, updateBody) => {
  const notificationRating = await getPushNotificationById(notificationId);
  if (!notificationRating) {
      throw new ApiError(httpStatus.NOT_FOUND, 'sos not found');
  }

  Object.assign(notificationRating, updateBody);
  await notificationRating.save();
  return notificationRating;
};



const updateAllNotificationByuserId = async (req) => {
  // 1. Extract userId from request (assuming `getUser` fetches the user ID)
  const user = await getUser(req);
  if (!user) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'User ID not found');
  }

  // 3. Update all notifications to mark as read
  const updateBody = { isRead: true };
  await Notification.updateMany(
    { userId: user._id },
    updateBody
  );

  // 4. Return the updated notifications (optional)
  const updatedNotifications = await Notification.find({ userId: user._id });
  return updatedNotifications;
};
const sendPromotionEmail = async (req, data) => {
  try {

    const { userIds = [], driverIds = [], subject, message } = data;

    const clientId = await getClientId(req);

    // Get users emails
    const users = await User.find({
      _id: { $in: userIds },
      clientId: clientId
    }).select('email');

    // Get drivers emails
    const drivers = await Driver.find({
      _id: { $in: driverIds },
      clientId: clientId
    }).populate({
      path: 'userId',
      select: 'email'
    });

    const userEmails = users
      .map(user => user.email)
      .filter(Boolean);

    const driverEmails = drivers
      .map(driver => driver.userId?.email)
      .filter(Boolean);

    const recipients = [...userEmails, ...driverEmails];

    if (!recipients.length) {
      throw new Error("No email recipients found");
    }

    // Send emails
    await sendBulkEmail(recipients, subject, message);

    // Save email notification
    await Notification.create({
      title: subject,
      message: message,
      userIds: userIds,
      driverIds: driverIds,
      notificationType: 'EMAIL', // important
      sourceType: 'Web',
      clientId: clientId
    });

    return {
      success: true,
      totalEmails: recipients.length,
      recipients
    };

  } catch (error) {
    console.error('Error sending promotion email:', error);
    throw error;
  }
};
const getEmailNotificationList = async (req) => {

  const clientId = await getClientId(req);

  const options = pick(req.query, ['sortBy', 'limit', 'page']);

  const filter = {
    clientId: new ObjectId(clientId),
    notificationType: 'EMAIL',
    sourceType: 'Web'
  };

  options.sortBy = options.sortBy || 'createdAt:desc';

  const notifications = await Notification.paginate(filter, options);

  return notifications;
};
module.exports = {
  sendNotification,
  getNotificationList,
  getDriverList,
  getUserList,
  deleteNotificationById,
  getDropDowns,
  getDropDownsByZone,
  sendPushNotification,
  getPaginationNotificationList,
  updateNotificationById,
  updateAllNotificationByuserId,
  sendPromotionEmail,
  getEmailNotificationList
};
