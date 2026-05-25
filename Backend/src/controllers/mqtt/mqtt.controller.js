const MqttService = require('../../services/mqtt/mqtt.service');
const httpStatus = require('http-status');
const driverLocationSchema = require('../../models/driverLocation.model')
const Message = require('../../models/boilerplate/message.model');
const { Users, Demo, User } = require('../../models');
const { tokenService } = require('../../services');
const mqttClient = require('../../config/mqttClient');

const Response = require('../../config/response');
const { isPointInPolygon, sendPushNotification, findDemoOrNot } = require('../../utils/commonFunction');

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


    async getUserById(req, res) {

        let userId = '';

        const authHeader = req.headers.authorization;


        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            if (res) res.status(httpStatus.UNAUTHORIZED).send({ message: 'Authorization header is missing or invalid' });
            return;
        }
        // Remove the 'Bearer ' prefix and get the token
        const token = authHeader.substring(7);

        const user = await tokenService.verifyTokenAndGetUser(token);

        userId = user.id

        return userId;
    }

    async webPublish(req, res) {
        const { topic, message } = req.body;
        try {
            const userId = await this.getUserById(req,res);
            const demoKey = await findDemoOrNot(userId);

            let query = {};
            if(demoKey !== null)
            {
                const driverInUser = await User.find({adminDemoKey: demoKey}).select('_id');

                // If demo exists but no drivers under it → return empty
                if (driverInUser.length === 0) {
                    const response = Response(true, [], "No drivers under this demo");
                    res.status(httpStatus.OK).send(response);
                }

                const driverUserIds = driverInUser.map(user => user._id);

                // Only fetch drivers under this demo
                query.userId = { $in: driverUserIds };
            }

            const allDrivers = await driverLocationSchema.find(query).populate([
                {
                    path: 'userId',
                    select: 'firstName',
                },
                {
                    path: 'vehicleId',
                    select: 'vehicleName image',
                }
            ]);

            const driversWithinPolygon = allDrivers.filter(driver => {
                const point = [driver.longitude, driver.latitude];
                return isPointInPolygon(point, message);
            });

            const response = Response(true, driversWithinPolygon, "Success");
            res.status(httpStatus.OK).send(response);
                
            // try {
            //     const allDrivers = await driverLocationSchema.find().populate([
            //         {
            //             path: 'userId',
            //             select: 'firstName',
            //         },
            //         {
            //             path: 'vehicleId',
            //             select: 'vehicleName image',
            //         }
            //     ]);

            //     const driversWithinPolygon = allDrivers.filter(driver => {
            //         const point = [driver.longitude, driver.latitude];
            //         return isPointInPolygon(point, message);
            //     });

            //     const response = Response(true, driversWithinPolygon, "Success");

            //     res.status(httpStatus.OK).send(response);

            // } catch (error) {
            //     // Step 6: Error handling
            //     console.error("Error processing driver location:", error);
            // }
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


    async sendMessage(req, res) {

        const userId = await this.getUserById(req, res);


        const { receiverId, senderType, receiverType, message } = req.body;

        try {

            const msg = await Message.create({
                senderId: userId, receiverId, senderType, receiverType, message
            });

            // Publish to MQTT topic (e.g., chat/receiverId)

            mqttService.publishMessage(
                mqttConfig.CHAT_RECEIVE + "" + receiverId,
                JSON.stringify({
                    _id: msg._id,
                    userId,
                    receiverId,
                    senderType,
                    receiverType,
                    message,
                    createdAt: msg.createdAt,
                })
            );

            sendPushNotification(receiverId, {
                title: "New Message",
                body: message
            });

            res.json({ success: true, msg });
        } catch (err) {
            res.status(400).json({ success: false, error: err.message });
        }
    }


    async historyMessage(req, res) {

        const { userId, driverId } = req.query;

        try {

            const messages = await Message.find({
                $or: [
                    { senderId: userId, receiverId: driverId },
                    { senderId: driverId, receiverId: userId },
                ],
            }).sort({ createdAt: 1 });

            res.json({ success: true, messages });

        } catch (err) {

            res.status(400).json({ success: false, error: err.message });

        }
    }




    async usersForDriver(req, res) {
        const driverId = await this.getUserById(req, res);

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
        const driverId = await this.getUserById(req);

        const { userId } = req.params;

        try {
            const userIds = await Message.distinct('senderId', {
                senderType: 'Users',
                receiverType: 'Driver',
                receiverId: driverId,
                senderId: userId
            });
            const users = await Users.find({ _id: { $in: userIds } });
            res.json({ success: true, users });

        } catch (err) {
            res.status(400).json({ success: false, error: err.message });

        }
    }


}

const mqttControllerInstance = new MqttController();

// Bind methods to preserve 'this' context for Express route handlers
const boundMethods = {};
for (const key of Object.getOwnPropertyNames(Object.getPrototypeOf(mqttControllerInstance))) {
    if (key !== 'constructor' && typeof mqttControllerInstance[key] === 'function') {
        boundMethods[key] = mqttControllerInstance[key].bind(mqttControllerInstance);
    }
}

module.exports = Object.assign(mqttControllerInstance, boundMethods);
