import 'dart:async';
import 'dart:convert';
import 'dart:developer' as dev;
import 'dart:math';

import 'package:flutter/cupertino.dart';
import 'package:mqtt_client/mqtt_client.dart';
import 'package:mqtt_client/mqtt_server_client.dart';
import 'package:taxiappzpro/utils/app_constants.dart';

class MqttHelper {
  static const bool _enableVerboseMqttLogs = false;
  final String broker = 'mqtt.taxiappz.com';
  final int port = 1883;
  late MqttServerClient _client;
  String clientId = "";
  bool isConnected = false;
  bool _messageListenerAttached = false; // ✅ FIX 1: prevent duplicate listeners

  StreamController<Map<String, dynamic>> messageController =
  StreamController<Map<String, dynamic>>.broadcast();
  Completer<void>? _connectionCompleter;
  final List<String> subscribedTopics = [];
  StreamSubscription<List<MqttReceivedMessage<MqttMessage>>>? _updatesSubscription;

  void initializeMqtt(String clientId) {
    final random = Random().nextInt(10000);
    _client = MqttServerClient(broker, "${clientId}_${random.toString()}");
    this.clientId = clientId;
    _client.port = port;
    _client.setProtocolV311();
    _client.autoReconnect = true;
    _client.resubscribeOnAutoReconnect = true;
    _client.logging(on: _enableVerboseMqttLogs);
    _client.onDisconnected = onDisconnected;
    _client.onSubscribed = onSubscribed;
    _client.onConnected = onConnected;
    _connectionCompleter = Completer<void>();
    _messageListenerAttached = false; // ✅ reset on re-init
  }

  Future<void> subScribeToDriverEvents() async {
    if (!subscribedTopics
        .contains("${AppConstants.driverDetailsTopic}$clientId")) {
      await waitForConnection();
      _client.subscribe(
          "${AppConstants.driverDetailsTopic}$clientId", MqttQos.exactlyOnce);
      debugPrint('Subscribed to topic: ${AppConstants.driverDetailsTopic}$clientId');
    } else {
      debugPrint("Subscription: Already subscribed to Topic:driver/detail/$clientId");
    }
  }

  Future<void> connect() async {
    try {
      await _client.connect();
      isConnected = true;
      debugPrint('Connected to the MQTT broker');
      _connectionCompleter?.complete();
    } catch (e) {
      isConnected = false;
      debugPrint('Connection failed: $e');
      _client.disconnect();
      _connectionCompleter?.completeError(e);
    }
  }

  Future<void> waitForConnection() => _connectionCompleter!.future;

  Future<void> subscribe(String topic) async {
    if (!subscribedTopics.contains(topic)) {
      await waitForConnection();
      _client.subscribe(topic, MqttQos.exactlyOnce);
      debugPrint('Subscription: Subscribed to Topic: $topic');
      subscribedTopics.add(topic);
    } else {
      debugPrint("Subscription: Already subscribed to Topic: $topic");
    }
  }

  // ✅ FIX 2: Wait for connection before publish + guard connected state
  void publish(String topic, String message) async {
    try {
      if (_client.connectionStatus?.state != MqttConnectionState.connected) {
        debugPrint('MQTT not connected, waiting before publish...');
        await waitForConnection().timeout(
          const Duration(seconds: 10),
          onTimeout: () {
            debugPrint('MQTT publish timeout — skipping: $topic');
          },
        );
      }

      if (_client.connectionStatus?.state != MqttConnectionState.connected) {
        debugPrint('MQTT still not connected — skipping publish: $topic');
        return;
      }

      final builder = MqttClientPayloadBuilder();
      builder.addString(message);
      _client.publishMessage(topic, MqttQos.atMostOnce, builder.payload!);
      debugPrint("published to $topic : $message");
    } catch (e) {
      debugPrint('MQTT publish error on $topic: $e');
    }
  }

  void unSubscribe(String topic) async {
    await waitForConnection();
    _client.unsubscribe(topic);
    subscribedTopics.removeWhere((item) => item == topic);
    debugPrint("Subscription: unsubscribed from topic $topic");
  }

  void onMessage() {
    _updatesSubscription?.cancel();
    _updatesSubscription =
        _client.updates!.listen((List<MqttReceivedMessage<MqttMessage>> c) {
      final MqttPublishMessage message = c[0].payload as MqttPublishMessage;
      final String payload =
      MqttPublishPayload.bytesToStringAsString(message.payload.message);
      try {
        final json = jsonDecode(payload);
        if (_enableVerboseMqttLogs) {
          dev.log(jsonEncode(json), name: "Mqtt Parameters ${c[0].topic}");
        }
      } catch (e) {
        if (_enableVerboseMqttLogs) {
          debugPrint("MqttPrintFailed $e");
        }
      }
      final map = {
        AppConstants.topic: c[0].topic,
        AppConstants.response: payload
      };
      messageController.add(map);
    });
  }

  void onDisconnected() {
    isConnected = false;
    debugPrint("Mqtt disconnected");
  }

  void onSubscribed(String topic) {
    debugPrint('Subscribed: $topic');
  }

  void onConnected() {
    isConnected = true;
    debugPrint("Mqtt status true");
    // ✅ FIX 1: Only attach the message listener ONCE — not on every reconnect
    if (!_messageListenerAttached) {
      _messageListenerAttached = true;
      onMessage();
    }
  }

  void disconnect() {
    if (isConnected) {
      try {
        _client.disconnect();
        debugPrint("Mqtt disconnect");
        _updatesSubscription?.cancel();
        _updatesSubscription = null;
        messageController.close();
        isConnected = false;
        _messageListenerAttached = false; // ✅ reset so next connect re-attaches
        _connectionCompleter = Completer<void>();
        messageController = StreamController<Map<String, dynamic>>.broadcast(); // ✅ FIX 4: correct type
      } catch (e) {
        debugPrint("Mqtt disconnect $e");
      }
    }
  }
}