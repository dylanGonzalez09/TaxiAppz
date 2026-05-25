const Message = require('../../models/mqttMessage.model');
const mqtt = require('mqtt');
const Users = require('../../models/boilerplate/users.model');
const DriverLocation = require('../../models/driverLocation.model');

const client = mqtt.connect(process.env.MQTT_BROKER_URL, {
    clean: true,
    protocolVersion: 5,
  
  });

const { mqttConfig } = require('../../config/string')

class MqttService {

    // Publish message to MQTT with connection check and timeout
    publishMessage(topic, message) {
        return new Promise((resolve, reject) => {
            // Check if client is connected
            if (!client || !client.connected) {
                console.warn('MQTT client not connected, skipping publish');
                // Resolve instead of reject to prevent blocking the API
                resolve('MQTT client not connected, message skipped');
                return;
            }

            const payload = typeof message === 'object' ? JSON.stringify(message) : message;
            
            // Set timeout to prevent hanging (5 seconds)
            const timeout = setTimeout(() => {
                console.error('MQTT publish timeout for topic:', topic);
                reject(new Error('MQTT publish timeout'));
            }, 5000);

            try {
                client.publish(
                    topic,
                    payload,
                    { qos: 2 },
                    (error) => {
                        clearTimeout(timeout);
                        if (error) {
                            console.error('Failed to publish message:', error);
                            reject(error);
                        } else {
                            resolve('Message published successfully');
                        }
                    }
                );
            } catch (error) {
                clearTimeout(timeout);
                console.error('MQTT publish error:', error);
                reject(error);
            }
        }).catch((error) => {
            // Catch and log errors but don't block the API
            console.error('MQTT publish failed for topic:', topic, error);
            // Return success to prevent blocking the API response
            return 'MQTT publish failed but continuing';
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

        let driverLocData = await DriverLocation.find({ _id: locId }).populate({
            path: 'vehicleId',
            model: 'Vehicle',
            select: 'vehicleName'
        });

        if (driverLocData != null && Array.isArray(driverLocData)) {
            let locationObj = driverLocData[0].toObject();
            
            if (locationObj.vehicleId && typeof locationObj.vehicleId === 'object') {
                locationObj.vehicleName = locationObj.vehicleId.vehicleName;
                locationObj.vehicleId = locationObj.vehicleId._id;
            }

            driverLocData = locationObj;
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
