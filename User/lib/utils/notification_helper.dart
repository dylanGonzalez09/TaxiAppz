import 'dart:convert';

import 'package:dio/dio.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';

import '../modeldata/app_enum.dart';

final FlutterLocalNotificationsPlugin flutterLocalNotificationsPlugin =
    FlutterLocalNotificationsPlugin();















class NotificationHelper {
  static Future<void> init() async {
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
        icon: '@mipmap/ic_launcher',
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
}

@pragma('vm:entry-point')
Future<void> backgroundHandler(RemoteMessage message) async {
  debugPrint('Handling a background message ${message.messageId}');
}
