// services/mqttClient.ts
import type { MqttClient } from 'mqtt';
import mqtt from 'mqtt';

// Declare client variable
let client: MqttClient | null = null;

// Connect to the MQTT broker
export const connectMqtt = () => {
    if (client && client.connected) {
        return client;
    }

    const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:';
   
    const brokerUrl = isSecure
        ? 'wss://mqtt.taxiappz.com:8083/mqtt'
        : 'ws://mqtt.taxiappz.com:8084/mqtt';





    client = mqtt.connect(brokerUrl);

    client.on('connect', () => {
        console.log('✅ Connected to MQTT broker');
    });

    client.on('error', (err) => {
        console.error('❌ MQTT connection error:', err);
    });

    client.on('close', () => {
        client = null; // Reset the client on disconnection
    });

    return client;
};

// Function to subscribe to a topic
export const subscribeToTopic = (
    topic: string,
    callback: (message: string) => void
): void => {
    if (!client) {
        console.error('MQTT client is not connected');
        
        return;
    }

    client.subscribe(topic, (err) => {
        if (err) {
            console.error(`Failed to subscribe to topic: ${topic}`, err);
        } 
    });

    client.on('message', (receivedTopic, message) => {
        if (receivedTopic === topic) {
            callback(message.toString());
        }
    });
};

// Function to publish a message to a topic
export const publishMessage = (topic: string, message: string): void => {
    if (!client) {
        console.error('MQTT client is not connected');

        return;
    }

    client.publish(topic, message, (err) => {
        if (err) {
            console.error(`Failed to publish message to topic ${topic}`, err);
        } 
    });
};
