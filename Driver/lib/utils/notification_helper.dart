import 'dart:convert';
import 'dart:io';

import 'package:dio/dio.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter_foreground_task/flutter_foreground_task.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:taxiappzpro/models/enums.dart';

final FlutterLocalNotificationsPlugin flutterLocalNotificationsPlugin =
    FlutterLocalNotificationsPlugin();
final FirebaseMessaging _firebaseMessaging = FirebaseMessaging.instance;

class NotificationHelper {
  static Future<void> init() async {
    await _firebaseMessaging.setForegroundNotificationPresentationOptions(
      alert: true, // Show alert when in foreground
      badge: true,
      sound: true,
    );
    if (Platform.isIOS) {
      _firebaseMessaging.requestPermission(
        alert: true,
        announcement: false,
        badge: true,
        carPlay: false,
        criticalAlert: false,
        provisional: false,
        sound: true,
      );
    }
    //channel for general notification
    const AndroidNotificationChannel generalNotificationChannel =
        AndroidNotificationChannel(
      'general', // id
      'General notification', // title
      description: 'This channel is used for general notification.',
      playSound: true,
      importance: Importance.high,
    );

    await flutterLocalNotificationsPlugin
        .resolvePlatformSpecificImplementation<
            AndroidFlutterLocalNotificationsPlugin>()
        ?.createNotificationChannel(generalNotificationChannel);

    var androidInitialize =
        const AndroidInitializationSettings('@mipmap/ic_launcher_foreground');
    var iOSInitialize = const DarwinInitializationSettings();
    var initializationsSettings =
        InitializationSettings(android: androidInitialize, iOS: iOSInitialize);
    flutterLocalNotificationsPlugin.initialize(initializationsSettings);
    FirebaseMessaging.onMessage.listen((RemoteMessage message) {
      final title = message.notification?.title ?? "";
      final body = message.notification?.body ?? "";
      debugPrint("backgroundHandler foreground ${message.toMap()}");
      debugPrint("From Notification title${message.notification?.title}");
      debugPrint("From Notification body${message.notification?.title}");
      if (message.data.isNotEmpty) {
        final type = message.data['type'];
        if (type == NotificationTypeEnum.general.name) {
          if (message.data["image"] != null) {
            showNotificationWithImage(title, body, message.data['image']);
          } else {
            showBigTextNotification(title, body);
          }
        }
      }
    });
    await NotificationHelper.newTripRequestNotificationSetUp();
  }

  static Future<void> showNotificationWithImage(
      String title, String body, String image) async {
    try {
      final response = await Dio().get(
        image,
        options: Options(responseType: ResponseType.bytes),
      );
      final base64Image = base64Encode(response.data);
      final largeIcon = base64Encode(response.data);
      BigPictureStyleInformation bigPictureStyleInformation =
          BigPictureStyleInformation(
        ByteArrayAndroidBitmap.fromBase64String(base64Image),
        largeIcon: ByteArrayAndroidBitmap.fromBase64String(largeIcon),
        contentTitle: title,
        summaryText: body,
        htmlFormatContentTitle: true,
        htmlFormatSummaryText: true,
        hideExpandedLargeIcon: true,
      );

      AndroidNotificationDetails androidPlatformChannelSpecifics =
          AndroidNotificationDetails(
        'general',
        importance: Importance.high,
        'General notification  ',
        styleInformation: bigPictureStyleInformation,
        priority: Priority.high,
        playSound: true,
        icon: '@mipmap/ic_launcher', fullScreenIntent: true,
          );

      NotificationDetails platformChannelSpecifics =
          NotificationDetails(android: androidPlatformChannelSpecifics);

      await flutterLocalNotificationsPlugin.show(
          0, title, body, platformChannelSpecifics);
    } catch (e) {
      showBigTextNotification(title, body);
    }
  }

  static Future<void> showBigTextNotification(String title, String body) async {
    BigTextStyleInformation bigTextStyleInformation = BigTextStyleInformation(
      body,
      htmlFormatBigText: true,
      contentTitle: title,
      htmlFormatContentTitle: true,
    );
    AndroidNotificationDetails androidPlatformChannelSpecifics =
        AndroidNotificationDetails(
      'general',
      importance: Importance.defaultImportance,
      'General notification  ',
      styleInformation: bigTextStyleInformation,
      priority: Priority.defaultPriority,
      playSound: true,
      icon: '@mipmap/ic_launcher',
    );
    NotificationDetails platformChannelSpecifics =
        NotificationDetails(android: androidPlatformChannelSpecifics);

    await flutterLocalNotificationsPlugin.show(
        0, title, body, platformChannelSpecifics);
  }

  static Future<void> newTripRequestNotificationSetUp() async {
    const AndroidNotificationChannel channel = AndroidNotificationChannel(
      'new_trip_request_channel',
      'New Trip Request',
      importance: Importance.high,
      sound: RawResourceAndroidNotificationSound('alert'),
      // Use filename without extension
    );

    await flutterLocalNotificationsPlugin
        .resolvePlatformSpecificImplementation<
            AndroidFlutterLocalNotificationsPlugin>()
        ?.createNotificationChannel(channel);
  }
}

@pragma('vm:entry-point')
Future<void> backgroundHandler(RemoteMessage message) async {
  debugPrint("backgroundHandler  ${message.toMap()}");
  try {
    final title = message.notification?.title ?? "";
    final body = message.notification?.body ?? "";
    if (title == "NewTripRequested" || title == "New Trip Requested") {
      final android = message.notification?.android;
      if (android != null) {
        const notificationDetails = NotificationDetails(
          android: AndroidNotificationDetails(
            'new_trip_request_channel',
            'New Trip Request',
            channelDescription:
                'New Trip Request Channel to Accept/Reject new Trip Request',
            importance: Importance.max,
            priority: Priority.max,
            sound: RawResourceAndroidNotificationSound('alert'),
            fullScreenIntent: true,
          ),
        );
        flutterLocalNotificationsPlugin.show(
          message.notification.hashCode,
          title,
          body,
          notificationDetails,
        );
      }
      FlutterForegroundTask.launchApp();
    } else if (title.toUpperCase() == "Location Changes".toUpperCase()) {
      FlutterForegroundTask.launchApp();
    }
  } catch (e) {
    debugPrint("backgroundHandler catch $e");
  }
}
