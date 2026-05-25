import 'dart:async';
import 'dart:convert';
import 'dart:developer' as dev;
import 'dart:math';
import 'package:flutter/cupertino.dart';
import 'package:flutter/foundation.dart';
import 'package:mqtt_client/mqtt_client.dart';
import 'package:mqtt_client/mqtt_server_client.dart';
import 'app_constants.dart';

class MqttHelper {
  static const bool _enableVerboseMqttLogs = false;
  final String broker = 'mqtt.taxiappz.com';
  final int port = 1883;
  late MqttServerClient client;
  String clientId = "";
  bool isConnected = false;
  StreamController<Map<String, dynamic>> messageController =
  StreamController<Map<String, dynamic>>.broadcast();
  Completer<void>? _connectionCompleter;
  final List<String> subscribedTopics = [];
  StreamSubscription<List<MqttReceivedMessage<MqttMessage>>>? _updatesSubscription;
  final Map<String, DateTime> _processedMessages = {};
  final Duration _dedupeWindow = Duration(milliseconds: 1000);
  Timer? _cleanupTimer;

  void initializeMqtt(String clientId) {
    final random = Random().nextInt(10000);
    client = MqttServerClient(broker, "${clientId}_${random.toString()}");
    this.clientId = clientId;
    client.port = port;
    client.autoReconnect = true;
    client.resubscribeOnAutoReconnect = true;
    client.logging(on: _enableVerboseMqttLogs);
    client.onDisconnected = onDisconnected;
    client.onSubscribed = onSubscribed;
    client.onConnected = onConnected;
    client.setProtocolV311();
    _connectionCompleter = Completer<void>();
    _startCleanupTimer();
  }

  void _startCleanupTimer() {
    _cleanupTimer?.cancel();
    _cleanupTimer = Timer.periodic(const Duration(seconds: 10), (timer) {
      final now = DateTime.now();
      _processedMessages.removeWhere((key, time) =>
      now.difference(time) > _dedupeWindow);
    });
  }

  Future<void> connect() async {
    try {
      await client.connect();
      isConnected = true;
      debugPrint('Connected to the MQTT broker');
      _connectionCompleter?.complete();
    } catch (e) {
      isConnected = false;
      debugPrint('Connection failed: $e');
      client.disconnect();
      _connectionCompleter?.completeError(e);
    }
  }

  Future<void> waitForConnection() => _connectionCompleter!.future;

  Future<void> subscribe(String topic) async {
    if (checkMqttConnectivity()) {
      if (!subscribedTopics.contains(topic)) {
        await waitForConnection();
        // CHANGE THIS TO atMostOnce to prevent duplicates
        client.subscribe(topic, MqttQos.atMostOnce);
        debugPrint('Subscription:Subscribed to Topic: $topic');
        subscribedTopics.add(topic);
      } else {
        debugPrint("Subscription: Already subscribed to Topic:$topic ");
      }
    }
  }

  void publish(String topic, String message) async {
    if (checkMqttConnectivity()) {
      await waitForConnection();
      final builder = MqttClientPayloadBuilder();
      builder.addString(message);
      client.publishMessage(topic, MqttQos.atMostOnce, builder.payload!);
      debugPrint("published to $topic : $message");
    }
  }

  void unSubscribe(String topic) async {
    if (checkMqttConnectivity() && topic.isNotEmpty) {
      await waitForConnection();
      client.unsubscribe(topic);
      subscribedTopics.removeWhere((item) => item == topic);
      debugPrint("Unsubscribed from topic $topic");
    }
  }

  void onMessage() {
    _updatesSubscription?.cancel();
    _updatesSubscription = client.updates!.listen((List<MqttReceivedMessage<MqttMessage>> c) {
      final MqttPublishMessage message = c[0].payload as MqttPublishMessage;
      final String payload = MqttPublishPayload.bytesToStringAsString(message.payload.message);


      final messageKey = "${c[0].topic}_${payload.hashCode}";
      final now = DateTime.now();

      // Check for duplicate
      if (_processedMessages.containsKey(messageKey)) {
        final lastSeen = _processedMessages[messageKey]!;
        if (now.difference(lastSeen) < _dedupeWindow) {
          if (kDebugMode) {
            debugPrint("🔁 Duplicate MQTT message ignored for topic: ${c[0].topic}");
          }
          return; // Skip duplicate
        }
      }

      _processedMessages[messageKey] = now;

      try {
        final decoded = jsonDecode(payload);
        if (_enableVerboseMqttLogs && kDebugMode) {
          dev.log(jsonEncode(decoded), name: "Mqtt Parameters ${c[0].topic}");
        }
      } catch (e) {
        if (_enableVerboseMqttLogs && kDebugMode) {
          debugPrint("MqttPrintFailed $e");
        }
      }

      final map = {
        AppConstants.topic: c[0].topic,
        AppConstants.response: payload
      };

      // Add to stream
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
    onMessage();
  }

  void disconnect() {
    _cleanupTimer?.cancel();
    if (isConnected) {
      try {
        _updatesSubscription?.cancel();
        _updatesSubscription = null;
        client.disconnect();
        debugPrint("Mqtt disconnect");
        messageController.close();
        isConnected = false;
        _connectionCompleter = Completer<void>();
        messageController = StreamController<Map<String, dynamic>>.broadcast();
        _processedMessages.clear();
      } catch (e) {
        debugPrint("Mqtt disconnect $e");
      }
    }
  }

  bool checkMqttConnectivity() =>
      MqttConnectionState.connected == client.connectionStatus?.state;

  Future<void> reconnect(String tag) async {
    if (client.connectionStatus?.state != MqttConnectionState.connected) {
      debugPrint('MqttReconnect: reconnect $tag -> ${client.connectionStatus?.state}');
      try {
        client.disconnect();
        await Future.delayed(const Duration(seconds: 1));
        await client.connect();
        if (subscribedTopics.isNotEmpty && tag != "unSubscribe") {
          for (var topic in subscribedTopics) {
            client.subscribe(topic, MqttQos.atMostOnce);
          }
        }
      } catch (e) {
        debugPrint('MqttReconnect failed: $e');
      }
    }
  }
}