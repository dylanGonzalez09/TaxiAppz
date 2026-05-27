const mqtt = require('mqtt');
const Message = require('../../models/mqttMessage.model');
const Users = require('../../models/boilerplate/users.model');
const DriverLocation = require('../../models/driverLocation.model');
require('dotenv').config({ quiet: true });

const client = mqtt.connect(process.env.MQTT_BROKER_URL);
const { mqttConfig } = require('../../config/string');

class MqttService {
  // Publish message to MQTT
  publishMessage(topic, message) {

    return new Promise((resolve, reject) => {
      const payload = typeof message === 'object' ? JSON.stringify(message) : message; // Ensure the message is a string
      client.publish(topic, payload, { qos: 2 }, (error) => {
        if (error) {
          console.error('Failed to publish message:', error);
          reject('Failed to publish message');
        } else {
          resolve('Message published successfully');
          // console.log({topic, message});
        }
      });
    });
  }

  // Save received messages to MongoDB
  async saveMessage(topic, message) {
    const newMessage = new Message({
      topic,
      message,
      timestamp: new Date(),
    });

    try {
      await newMessage.save();
    } catch (error) {
      console.error('Error saving message to MongoDB:', error);
    }
  }

  // Retrieve messages from MongoDB
  async getMessages() {
    try {
      const messages = await Message.find();
      return messages;
    } catch (error) {
      throw new Error('Error fetching messages');
    }
  }

  // Listen for changes in the Users collection
  async listenToUserChanges() {
    const DriverLocationCollection = DriverLocation.collection; // Access the raw MongoDB collection

    try {
      const changeStream = await DriverLocationCollection.watch(); // Create ChangeStream

      changeStream.on('change', async (change) => {
        switch (change.operationType) {
          case 'insert':
            await this.handleInsertOrUpdate(change); // Handle insert
            break;
          case 'update':
            await this.handleInsertOrUpdate(change); // Handle update
            break;
          default:
            console.log('Other operation:', change.operationType);
        }
      });
    } catch (error) {
      console.error('Error creating ChangeStream:', error);
    }
  }

  async handleInsertOrUpdate(change) {
    const updatedFields = change.operationType === 'update' ? change.updateDescription.updatedFields : change.fullDocument;

    const locId = change.documentKey._id;

    // const topic = `user/listenDriver`;

    const topic = mqttConfig.USER_LISTEN_DRIVER;

    let driverLocData = await DriverLocation.find({ _id: locId });

    if (driverLocData != null && Array.isArray(driverLocData)) {
      driverLocData = driverLocData[0];
    }

    const message = JSON.stringify(driverLocData);

    try {
      await this.publishMessage(topic, message);
    } catch (error) {
      console.error('Error publishing MQTT message:', error);
    }
  }
}

module.exports = new MqttService();
