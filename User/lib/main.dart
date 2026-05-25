import 'dart:convert';
import 'dart:io';
import 'dart:ui';
import 'dart:async';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_crashlytics/firebase_crashlytics.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:user/utils/custom_colors.dart';
import '../ui/network_error_screen/network_error_vm.dart';
import '../utils/app_constants.dart';
import '../utils/custom_router.dart';
import '../utils/mqtt_helper.dart';
import '../utils/notification_helper.dart';
import '../utils/preference_helper.dart';
import '../utils/theme_data.dart';
import 'di/di_config.dart';
import 'firebase_options.dart';
import 'network/response_models/trip_model.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp]);
  await configureDependencies();

  if (Platform.isIOS) {
    await Firebase.initializeApp(
      options: DefaultFirebaseOptions.currentPlatform,
    );
  } else {
    await Firebase.initializeApp(
      options: DefaultFirebaseOptions.currentPlatform,
    );
  }
  await NotificationHelper.init();
  FirebaseMessaging.onBackgroundMessage(backgroundHandler);
  FlutterError.onError = FirebaseCrashlytics.instance.recordFlutterFatalError;
  PlatformDispatcher.instance.onError = (error, stack) {
    FirebaseCrashlytics.instance.recordError(error, stack, fatal: true);
    return true;
  };
  final FlutterLocalNotificationsPlugin flutterLocalNotificationsPlugin = FlutterLocalNotificationsPlugin();
  await initializeNotifications(flutterLocalNotificationsPlugin);
  runApp(const MyApp());
  initNoInternetListener();
}

Future<void> initializeNotifications(FlutterLocalNotificationsPlugin plugin) async {
  const DarwinInitializationSettings iosInit = DarwinInitializationSettings();
  const InitializationSettings initSettings = InitializationSettings(
    iOS: iosInit,
    android: AndroidInitializationSettings('@mipmap/ic_launcher'),
  );

  await plugin.initialize(initSettings);
}

final GlobalKey<NavigatorState> navigatorKey = GlobalKey<NavigatorState>();
final routeObserver = RouteObserver();

class MyApp extends StatefulWidget {
  const MyApp({super.key});

  @override
  State<MyApp> createState() => _MyAppState();

  static _MyAppState? of(BuildContext context) => context.findAncestorStateOfType<_MyAppState>();
}

class _MyAppState extends State<MyApp> {
  String currentScreenLabel = "";
  Locale? _locale = const Locale("en");
  final mqtt = getIt<MqttHelper>();
  StreamSubscription? _userRequestSubscription;

  void setLocale(Locale value) {
    setState(() {
      _locale = value;
    });
  }

  Future<void> subscribeToUserRequest(String userId) async {
    await mqtt.subscribe("${AppConstants.userRequest}$userId");
    final Set<String> lastData = {};
    await _userRequestSubscription?.cancel();
    _userRequestSubscription = mqtt.messageController.stream.listen((onData) {
      if (onData[AppConstants.topic] == "${AppConstants.userRequest}$userId") {
        if (!lastData.contains(onData[AppConstants.response] ?? "")) {
          lastData.add(onData[AppConstants.response] ?? "");
          if (currentScreenLabel != CustomRouter.tripScreen && currentScreenLabel != CustomRouter.rideConfirm) {
            try {
              final response = onData[AppConstants.response];
              if (response != null && response.isNotEmpty) {
                final map = jsonDecode(response);
                if (map is Map<String, dynamic>) {
                  final data = map["trip"];
                  if (data != null) {
                    final tripModel = Trip.fromJson(data);
                    if (tripModel.isCancelled == false && tripModel.isCompleted != true && currentScreenLabel != CustomRouter.tripScreen) {
                      moveToTripScreen(tripModel);
                    }
                  } else {
                    debugPrint("Trip data is null");
                  }
                } else {
                  debugPrint("Decoded JSON is not a Map<String, dynamic>");
                }
              } else {
                debugPrint("Response is null or empty");
              }
            } catch (e) {
              debugPrint("TripException $e");
            }
          }
        }
      }
    });
  }

  @override
  void dispose() {
    _userRequestSubscription?.cancel();
    super.dispose();
  }

  void moveToTripScreen(Trip trip) {
    while (GoRouter.of(navigatorKey.currentState!.context).canPop()) {
      GoRouter.of(navigatorKey.currentState!.context).pop();
    }
    if (trip.isCompleted == true) {
      GoRouter.of(navigatorKey.currentState!.context).pushNamed(CustomRouter.invoiceScreen, extra: trip);
    } else {
      GoRouter.of(navigatorKey.currentState!.context).pushNamed(CustomRouter.tripScreen, extra: trip);
    }
  }

  void setCurrentLocation(String label) {
    currentScreenLabel = label;
    debugPrint("CurrentLocationLabel $label");
  }

  @override
  Widget build(BuildContext context) {
    const systemUiOverlayStyle = SystemUiOverlayStyle(
      statusBarColor: Colors.white,
      statusBarIconBrightness: Brightness.dark,
      statusBarBrightness: Brightness.light,
      systemNavigationBarColor: Colors.white,
      systemNavigationBarIconBrightness: Brightness.dark,
    );

    final preference = getIt<SharedPreferences>();
    final languageCode =
        preference.getString(PreferenceHelper.languageCode) ?? "";
    TextDirection textDirection =
    languageCode == 'ar' ? TextDirection.rtl : TextDirection.ltr;

    final annotatedApp = AnnotatedRegion<SystemUiOverlayStyle>(
      value: systemUiOverlayStyle,
      child: Container(
        color: Colors.white,
        child: SafeArea(
          top: false,
          child: Directionality(
            textDirection: textDirection,
            child: MaterialApp.router(
              builder: (context, child) {
                return MediaQuery(
                  data: MediaQuery.of(context)
                      .copyWith(textScaler: const TextScaler.linear(1.0)),
                  child: child ?? Container(),
                );
              },
              routerConfig: getIt<CustomRouter>().router,
              theme: themeData,
              debugShowCheckedModeBanner: false,
              locale: _locale,
            ),
          ),
        ),
      ),
    );
    return annotatedApp;
  }

}
