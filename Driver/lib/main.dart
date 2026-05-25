import 'dart:convert';
import 'dart:io';
import 'dart:ui';
import 'dart:async';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_crashlytics/firebase_crashlytics.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_foreground_task/flutter_foreground_task.dart';
import 'package:go_router/go_router.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:taxiappzpro/di/di_config.dart';
import 'package:taxiappzpro/models/enums.dart';
import 'package:taxiappzpro/network/response_models/driver_details_model.dart';
import 'package:taxiappzpro/ui/network_error_screen/network_error_vm.dart';
import 'package:taxiappzpro/ui/taxioverlaywindow/taxi_overlay_window.dart';
import 'package:taxiappzpro/utils/app_constants.dart';
import 'package:taxiappzpro/utils/custom_colors.dart';
import 'package:taxiappzpro/utils/custom_router_config.dart';
import 'package:taxiappzpro/utils/mqtt_helper.dart';
import 'package:taxiappzpro/utils/notification_helper.dart';
import 'package:taxiappzpro/utils/overlay_helper.dart';
import 'package:taxiappzpro/utils/preference_helper.dart';
import 'package:taxiappzpro/utils/theme_data.dart';
import 'firebase_options.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp]);

  await configureDependencies();
  FlutterForegroundTask.initCommunicationPort();

  if (Platform.isIOS) {
    await Firebase.initializeApp(
      options: DefaultFirebaseOptions.currentPlatform,
    );
  }else {
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
  if (Platform.isIOS) {
    await Permission.locationWhenInUse.request();
  }
  runApp(const MyApp());
  initNoInternetListener();
}

final GlobalKey<NavigatorState> navigatorKey = GlobalKey<NavigatorState>();
final routeObserver = RouteObserver();

class MyApp extends StatefulWidget {
  const MyApp({super.key});

  @override
  State<MyApp> createState() => _MyAppState();

  static _MyAppState? of(BuildContext context) =>
      context.findAncestorStateOfType<_MyAppState>();
}

class _MyAppState extends State<MyApp> {
  Locale? _locale;
  final mqtt = getIt<MqttHelper>();
  String currentScreenLabel = "";
  final OverlayHelper overlayHelper = OverlayHelper();
  StreamSubscription? _driverDetailsSubscription;
  StreamSubscription? _driverRequestSubscription;
  bool hasHandledDriverState = false;

  void setLocale(Locale value) {
    setState(() {
      _locale = value;
    });
  }

  void setCurrentLocation(String label) {
    currentScreenLabel = label;
    print("CurrentLocationLabel $label");
  }

  Future<void> connectToMqtt() async {
    final preference = getIt<SharedPreferences>();
    final driverId = preference.getString(PreferenceHelper.driverId) ?? "";
    mqtt.initializeMqtt(driverId);
    await mqtt.connect();
  }

  void disconnectMqtt() {
    mqtt.disconnect();
  }

  Future<void> subscribeTODriverDetails() async {
    await mqtt.subScribeToDriverEvents();
    await _driverDetailsSubscription?.cancel();
    _driverDetailsSubscription = mqtt.messageController.stream.listen((data) {
      if (data[AppConstants.topic] ==
          "${AppConstants.driverDetailsTopic}${mqtt.clientId}") {
        print("AppConstants.driverDetailsTopic ${AppConstants.driverDetailsTopic}");
        final jsonString = jsonDecode(data[AppConstants.response]);
        print("refre;f${jsonString}");
        final driverDetails = DriverDetailsModel.fromJson(jsonString);
        if (navigatorKey.currentState != null) {
          if (driverDetails.blockReason == DriverBlockedReason.DENIED.name &&
              currentScreenLabel != CustomRouterConfig.driverBlockedScreen) {
            final preference = getIt<SharedPreferences>();
            final map = {
              "blockReason": DriverBlockedReason.DENIED.name,
            };
            GoRouter.of(navigatorKey.currentState!.context).goNamed(
                CustomRouterConfig.driverBlockedScreen,
                extra: map);
          }else if (driverDetails.blockReason == DriverBlockedReason.AdminBlocked.name &&
              currentScreenLabel != CustomRouterConfig.driverBlockedScreen) {
            final preference = getIt<SharedPreferences>();
            final map = {
              "blockReason": DriverBlockedReason.AdminBlocked.name,
            };
            GoRouter.of(navigatorKey.currentState!.context).goNamed(
                CustomRouterConfig.driverBlockedScreen,
                extra: map);
          } else if (driverDetails.isDisableReason == DriverBlockedReason.ZONE_DISABLED.name
              /*&& currentScreenLabel != CustomRouterConfig.driverBlockedScreen*/) {
            print('isjcisdjidsjid');
            final map = {
              "blockReason": DriverBlockedReason.ZONE_DISABLED.name,
            };
            GoRouter.of(navigatorKey.currentState!.context).goNamed(
                CustomRouterConfig.driverBlockedScreen,
                extra: map);
          }else if (driverDetails.isDisableReason == DriverBlockedReason.VEHICLE_DISABLED.name
              /*&& currentScreenLabel != CustomRouterConfig.driverBlockedScreen*/) {
            print('isjcisdjidsjid');
            final map = {
              "blockReason": DriverBlockedReason.VEHICLE_DISABLED.name,
            };
            GoRouter.of(navigatorKey.currentState!.context).goNamed(
                CustomRouterConfig.driverBlockedScreen,
                extra: map);
          }else if (driverDetails.isDisableReason == DriverBlockedReason.APPROVED.name) {
            GoRouter.of(navigatorKey.currentState!.context)
                .goNamed(CustomRouterConfig.mapScreen);
          }else if (driverDetails.blockReason == DriverBlockedReason.APPROVED.name) {
            GoRouter.of(navigatorKey.currentState!.context)
                .goNamed(CustomRouterConfig.mapScreen);
          } else {}
        }
      }
    });
  }

  Future<void> subscribeToDriverRequest(String driverId) async {
    await mqtt.subscribe("${AppConstants.driverRequest}$driverId");
    final lastData = <String>{};
    await _driverRequestSubscription?.cancel();
    _driverRequestSubscription = mqtt.messageController.stream.listen((onData) {
      if (onData[AppConstants.topic] ==
          "${AppConstants.driverRequest}$driverId") {
        print("TripRequest Message received to Main file");
        if (!lastData.contains(onData[AppConstants.response])) {
          lastData.add(onData[AppConstants.response]);
          if (currentScreenLabel == CustomRouterConfig.mapScreen &&
              currentScreenLabel == CustomRouterConfig.tripScreen) {
            print("TripRequest map screen and trip if");
          } else {
            print("TripRequest map screen");
            if (currentScreenLabel != CustomRouterConfig.mapScreen &&
                currentScreenLabel != CustomRouterConfig.tripScreen) {
              GoRouter.of(navigatorKey.currentState!.context)
                  .goNamed(CustomRouterConfig.mapScreen, extra: GlobalKey());
            }
          }
        }
      }
    });
  }

  void initOverlayOtherAppWindows() {
    overlayHelper.initializeForOverlays();
  }

  void disposeOverlayOtherAppWindows() {
    overlayHelper.dispose();
  }

  void sendMessageToOverlayOtherAppWindows(String msg) {
    overlayHelper.sendMessageToOverlaysWindows(msg);
  }

  @override
  void dispose() {
    _driverDetailsSubscription?.cancel();
    _driverRequestSubscription?.cancel();
    super.dispose();
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

    if (Platform.isAndroid) {
      SystemChrome.setSystemUIOverlayStyle(systemUiOverlayStyle);
    }

    final preference = getIt<SharedPreferences>();
    final languageCode = preference.getString(PreferenceHelper.languageCode) ?? "";

    print('languageCode: $languageCode');
    TextDirection textDirection = languageCode == 'ar' ? TextDirection.rtl : TextDirection.ltr;

    return Platform.isIOS
        ? AnnotatedRegion<SystemUiOverlayStyle>(
            value: systemUiOverlayStyle,
            child: Container(
              color: CustomColors.primaryColor,
              child: SafeArea(
                top: false,
                child: Directionality(
                  textDirection: textDirection,
                  child: MaterialApp.router(
                    builder: (context, child) {
                      return MediaQuery(
                        data: MediaQuery.of(context).copyWith(textScaler: const TextScaler.linear(1.0)),
                        child: child ?? Container(),
                      );
                    },
                    routerConfig: getIt<CustomRouterConfig>().routerConfig,
                    theme: themeData,
                    debugShowCheckedModeBanner: false,
                    locale: _locale,
                  ),
                ),
              ),
            ),
          )
        : AnnotatedRegion<SystemUiOverlayStyle>(
            value: systemUiOverlayStyle,
            child: Container(
                color: CustomColors.primaryColor,
                child: MaterialApp.router(
                  builder: (context, child) {
                    return Directionality(
                      textDirection: textDirection,
                      child: MediaQuery(
                        data: MediaQuery.of(context).copyWith(textScaler: const TextScaler.linear(1.0)),
                        child: child ?? Container(),
                      ),
                    );
                  },
                  routerConfig: getIt<CustomRouterConfig>().routerConfig,
                  theme: themeData,
                  debugShowCheckedModeBanner: false,
                  locale: _locale,
                )));
  }
}

@pragma("vm:entry-point")
void showOverlayTaxiAppz() {
  runApp(
    MaterialApp(
      debugShowCheckedModeBanner: false,
      home: TaxiOverlayWindow(),
    ),
  );
}
