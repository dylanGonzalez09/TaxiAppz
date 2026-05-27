const MqttService = require('../../services/mqtt/mqtt.service');
const httpStatus = require('http-status').default || require('http-status').status || require('http-status');
const driverLocationSchema = require('../../models/driverLocation.model');
const Response = require('../../config/response');
const { isPointInPolygon, getUserId } = require('../../utils/commonFunction');
const Message = require('../../models/boilerplate/message.model');
const { Users } = require('../../models');
const { tokenService } = require('../../services');
const { sendPushNotification } = require('../../utils/commonFunction');
const { mqttConfig } = require('../../config/string');

class MqttController {
  // Handle publishing a message
  async publish(req, res) {
    const { topic, message } = req.body;
    try {
      const response = await MqttService.publishMessage(topic, message);
      res.json({ success: true, message: response });
    } catch (error) {
      res.status(500).json({ success: false, message: error });
    }
  }

  async webPublish(req, res) {
    const { topic, message } = req.body;
    try {
      try {
        const allDrivers = await driverLocationSchema.find().populate([
          {
            path: 'userId',
            select: 'firstName',
          },
          {
            path: 'vehicleId',
            select: 'vehicleName image',
          },
        ]);

        const driversWithinPolygon = allDrivers.filter((driver) => {
          const point = [driver.longitude, driver.latitude];
          return isPointInPolygon(point, message);
        });

        const response = Response(true, driversWithinPolygon, 'Success');

        res.status(httpStatus.OK).send(response);
      } catch (error) {
        // Step 6: Error handling
        console.error('Error processing driver location:', error);
      }
    } catch (error) {
      res.status(500).json({ success: false, message: error });
    }
  }

  // Handle retrieving messages
  async getMessages(req, res) {
    try {
      const messages = await MqttService.getMessages();
      res.json({ success: true, messages });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching messages' });
    }
  }

  // chat message related controllers

  async sendMessage(req, res) {
    const userId = await getUserId(req);

    const { receiverId, senderType, requestId, receiverType, message } = req.body;

    try {
      const msg = await Message.create({
        senderId: userId,
        receiverId,
        senderType,
        receiverType,
        message,
        requestId,
      });

      // Publish to MQTT topic (e.g., chat/receiverId)

      const topic = `${mqttConfig.CHAT}${receiverId}`;

      MqttService.publishMessage(
        topic,
        JSON.stringify({
          _id: msg._id,
          userId,
          receiverId,
          senderType,
          receiverType,
          message,
          createdAt: msg.createdAt,
        }),
      );

      sendPushNotification(receiverId, {
        title: 'New Message',
        body: message,
      });

      res.json({ success: true, msg });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  async historyMessage(req, res) {
    const { userId, driverId, requestId } = req.query;

    try {
      const messages = await Message.find({
        $or: [
          { senderId: userId, receiverId: driverId, requestId },
          { senderId: driverId, receiverId: userId, requestId },
        ],
      }).sort({ createdAt: 1 });


      res.json({ success: true, messages });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  async usersForDriver(req, res) {
    const driverId = await getUserId(req);

    try {
      const userIds = await Message.distinct('senderId', {
        senderType: 'Users',
        receiverType: 'Driver',
        receiverId: driverId,
      });
      const users = await Users.find({ _id: { $in: userIds } });
      res.json({ success: true, users });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  async usersForDriverMessages(req, res) {
    const driverId = await getUserId(req);

    const { userId } = req.params;

    try {
      const userIds = await Message.distinct('senderId', {
        senderType: 'Users',
        receiverType: 'Driver',
        receiverId: driverId,
        senderId: userId,
      });
      const users = await Users.find({ _id: { $in: userIds } });
      res.json({ success: true, users });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  }
}

module.exports = new MqttController();
