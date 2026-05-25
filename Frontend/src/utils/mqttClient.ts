// services/mqttClient.ts
import type { MqttClient } from 'mqtt'
import mqtt from 'mqtt'

// Declare client variable
let client: MqttClient | null = null

// Track listeners per topic to avoid duplicate handlers & memory leaks
const topicListeners = new Map<
  string,
  (receivedTopic: string, message: Buffer | Uint8Array | string) => void
>()

// Connect to the MQTT broker
export const connectMqtt = (brokerUrl: string = 'mqtt://mqtt.taxiappz.com:1883'): MqttClient => {
    if (client && client.connected) {
        return client;
    }

  client = mqtt.connect(brokerUrl)

  client.on('connect', () => {
    console.log('Connected to MQTT broker')
  })

  client.on('error', err => {
    console.error('MQTT connection error', err)
  })

  client.on('close', () => {
    client = null // Reset the client on disconnection
    topicListeners.clear()
  })

  return client
}

// Function to subscribe to a topic
export const subscribeToTopic = (topic: string, callback: (message: string) => void): void => {
  if (!client) {
    console.error('MQTT client is not connected')

    return
  }

  client.subscribe(topic, err => {
    if (err) {
      console.error(`Failed to subscribe to topic: ${topic}`, err)
    } else {
      console.log(`Subscribed to topic: ${topic}`)
    }
  })

  // Remove any existing listener for this topic to avoid stacking
  const existingListener = topicListeners.get(topic)

  if (existingListener && client) {
    client.off('message', existingListener)
  }

  const listener = (receivedTopic: string, message: Buffer | Uint8Array | string) => {
    if (receivedTopic === topic) {
      const payload = typeof message === 'string' ? message : message.toString()

      callback(payload)
    }
  }

  topicListeners.set(topic, listener)
  client.on('message', listener)
}

// Function to publish a message to a topic
export const publishMessage = (topic: string, message: string): void => {
  if (!client) {
    console.error('MQTT client is not connected')

    return
  }

  client.publish(topic, message, err => {
    if (err) {
      console.error(`Failed to publish message to topic ${topic}`, err)
    } else {
      console.log(`Message published to topic ${topic}: ${message}`)
    }
  })
}
