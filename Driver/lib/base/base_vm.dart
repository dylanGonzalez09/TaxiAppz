import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'dart:math';
import 'dart:ui';
import 'package:taxiappzpro/utils/mqtt_helper.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:geolocator/geolocator.dart';
import 'package:get/get.dart';
import 'package:go_router/go_router.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:intl/intl.dart';
import 'package:package_info_plus/package_info_plus.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:taxiappzpro/main.dart';
import 'package:taxiappzpro/network/response_models/custom_error_model.dart';
import 'package:taxiappzpro/ui/dialogs/error_dialog.dart';
import 'package:taxiappzpro/utils/custom_colors.dart';
import 'package:taxiappzpro/utils/dimensions.dart';
import '../di/di_config.dart';
import '../models/enums.dart';
import '../network/api_helper.dart';
import '../network/response_models/address_to_lat_lng_model.dart';
import '../network/response_models/config_model.dart';
import '../network/response_models/route_polyline_model.dart';
import '../network/response_models/translation_model.dart';
import '../ui/dialogs/sucess_dialog.dart';
import '../utils/app_constants.dart';
import '../utils/app_urls.dart';
import '../utils/preference_helper.dart';

class BaseVm extends ChangeNotifier {
  DialogRoute? _route;
  DialogRoute? _errorDialogRoute;
  final preference = getIt<SharedPreferences>();
  final apiHelper = getIt<ApiHelper>();
  TranslationModel translation = TranslationModel();
  RxBool isLoading = false.obs;
  bool _isLoading = false;
  final mqtt = getIt<MqttHelper>();
  final packageInfo = getIt<PackageInfo>();

  double vehicleSpeedKmph = 0;
  Position? _previousPosition;
  DateTime? _previousTime;
  DialogRoute? _successDialogRoute;

  BaseVm() {
    final translation = preference.getString(PreferenceHelper.translation);
    if (translation != null && translation.isNotEmpty == true) {
      this.translation = TranslationModel.fromJson(jsonDecode(translation));
    }
  }

  void pop({dynamic args}) {
    if (navigatorKey.currentState != null) {
      GoRouter.of(navigatorKey.currentState!.context).pop(args);
    }
  }

  void moveToNamed(String name, {dynamic args}) {
    if (navigatorKey.currentState != null) {
      GoRouter.of(navigatorKey.currentState!.context)
          .pushNamed(name, extra: args);
    }
  }

  void popAndMove(String name, {dynamic args}) {
    if (navigatorKey.currentState != null) {
      GoRouter.of(navigatorKey.currentState!.context)
          .goNamed(name, extra: args);
    }
  }

  Future<dynamic> moveAndWait(String name, {dynamic args}) async {
    final result = await GoRouter.of(navigatorKey.currentState!.context)
        .pushNamed(name, extra: args);

    return result;
  }

  bool isSubscriptionFlowEnabled() {
    try {
      final rawConfig = preference.getString(PreferenceHelper.config);
      if (rawConfig != null && rawConfig.isNotEmpty == true) {
        final config = ConfigModel.fromJson(jsonDecode(rawConfig));
        if (config.settings?.isNotEmpty == true) {
          final String? module = config.settings
              ?.firstWhere((w) => w.name == SettingsEnum.modules.name)
              .settings
              ?.subScription;
          return module?.isNotEmpty == true && module == "yes";
        }
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  T? parseData<T>(dynamic json, T Function(Map<String, dynamic>) fromJson) {
    try {
      if (json is Map<String, dynamic>) {
        return fromJson(json);
      } else {
        debugPrint('Invalid JSON format');
        return null;
      }
    } catch (e, stackTrace) {
      debugPrint('Parsing error: $e');
      debugPrint('StackTrace: $stackTrace');
      return null;
    }
  }

  Future<String?> getFcmToken() async {
    try {
      final token = await FirebaseMessaging.instance.getToken();
      debugPrint("firebaseeeee token  =  $token");
      return token;
    } catch(e) {
      print('dndfjnvjdfhjvdfnv  $e');
    }
  }

  void showErrorDialog(
      {ErrorModel? errorModel,
      String? message,
      Function()? onClick,
      String? buttonTxt,
      bool canDismiss = true}) {
    if (navigatorKey.currentState != null && _errorDialogRoute == null) {
      BuildContext context = navigatorKey.currentState!.context;
      _errorDialogRoute = DialogRoute(
        context: context,
        builder: (_) => ErrorDialog(
          message: message,
          model: errorModel,
          onClick: onClick,
          translation: translation,
          buttonTxt: buttonTxt,
          canDismiss: canDismiss,
        ),
        barrierDismissible: canDismiss,
      );
      Navigator.of(context).push(_errorDialogRoute!).then((value) {
        _errorDialogRoute = null;
      });
    }
  }

  void showLoader() {
    if (!_isLoading) {
      if (navigatorKey.currentState?.context != null &&
          navigatorKey.currentState?.mounted == true) {
        BuildContext context = navigatorKey.currentState!.context;
        _route = DialogRoute(
            context: context,
            builder: (_) => _transLoader(context),
            barrierDismissible: false);
        Navigator.of(context).push(_route!).then((value) {
          _isLoading = false;
          _route = null;
        });
        _isLoading = true;
      }
    }
  }

  void hideLoader() {
    if (_route != null) {
      if (navigatorKey.currentState?.context != null &&
          navigatorKey.currentState?.context.mounted == true) {
        BuildContext context = navigatorKey.currentState!.context;
        _isLoading = false;
        Navigator.of(context).removeRoute(_route!);
        _route = null;
      }
    }
  }

  Widget _transLoader(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.transparent,
      body: Dialog(
        backgroundColor: Colors.transparent,
        surfaceTintColor: Colors.transparent,
        child: PopScope(
          canPop: false,
          child: Stack(
            children: [
              BackdropFilter(
                filter: ImageFilter.blur(sigmaX: 6.0, sigmaY: 6.0),
                child: Container(
                  color: Colors.transparent,
                ),
              ),
              Center(
                child: Container(
                  color: Colors.transparent,
                  alignment: FractionalOffset.center,
                  height: 80.0,
                  padding: const EdgeInsets.all(20.0),
                  child: const CircularProgressIndicator(),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void startVehicleSpeedListener() {
    Geolocator.getPositionStream(
      locationSettings: const LocationSettings(
        accuracy: LocationAccuracy.bestForNavigation,
        distanceFilter: 3,
      ),
    ).listen((position) {
      if (_previousPosition != null && _previousTime != null) {
        final distance = Geolocator.distanceBetween(
          _previousPosition!.latitude,
          _previousPosition!.longitude,
          position.latitude,
          position.longitude,
        );

        final timeDiff =
            position.timestamp.difference(_previousTime!).inSeconds;

        if (timeDiff > 0) {
          final speedMS = distance / timeDiff;
          vehicleSpeedKmph = speedMS * 3.6;
        }
      }

      _previousPosition = position;
      _previousTime = position.timestamp;
    });
  }

  String calculateTravelDistance({
    required double currentLat,
    required double currentLng,
    required double pickupLat,
    required double pickupLng,
    String unit = 'km',
  }) {
    const double earthRadiusKm = 6371.0;
    const double earthRadiusMiles = 3958.8;

    double toRadians(double degree) => degree * pi / 180;

    final dLat = toRadians(pickupLat - currentLat);
    final dLng = toRadians(pickupLng - currentLng);

    final a = sin(dLat / 2) * sin(dLat / 2) +
        cos(toRadians(currentLat)) *
            cos(toRadians(pickupLat)) *
            sin(dLng / 2) *
            sin(dLng / 2);

    final c = 2 * atan2(sqrt(a), sqrt(1 - a));

    final radius = unit.toLowerCase() == 'miles' ? earthRadiusMiles : earthRadiusKm;
    final totalDistance = radius * c;
    return totalDistance.toStringAsFixed(2);
  }


  String calculateTravelTimeInMinutes({
    required double currentLat,
    required double currentLng,
    required double pickupLat,
    required double pickupLng,
  }) {
    const double earthRadiusKm = 6371.0;

    double dLat = (pickupLat - currentLat) * pi / 180.0;
    double dLng = (pickupLng - currentLng) * pi / 180.0;

    double a = sin(dLat / 2) * sin(dLat / 2) +
        cos(currentLat * pi / 180.0) *
            cos(pickupLat * pi / 180.0) *
            sin(dLng / 2) *
            sin(dLng / 2);

    double c = 2 * atan2(sqrt(a), sqrt(1 - a));
    double distanceKm = earthRadiusKm * c;

    double speed = vehicleSpeedKmph < 40 ? 40 : vehicleSpeedKmph;
    double timeMinutes = (distanceKm / speed) * 60;

    int roundedTime = timeMinutes < 1 ? 1 : timeMinutes.round();

    if (roundedTime >= 60) {
      return "${(roundedTime / 60).toStringAsFixed(1)} ${translation.txt_hour}";
    } else {
      return "$roundedTime ${translation.txt_minute}";
    }
  }


  bool isValidVehNumber(String vehNum) {
    final RegExp vehNumRegex =
        RegExp(r'^[A-Z0-9]{1,3}[-\s]?[A-Z0-9]{1,4}[-\s]?[A-Z0-9]{1,4}$');
    return vehNumRegex.hasMatch(vehNum);
  }

  bool isValidEmail(String email) {
    final emailRegExp = RegExp(
        r'^[a-zA-Z0-9]+(?:[._]?[a-zA-Z0-9]+)*@[a-zA-Z]+\.[a-zA-Z]{2,}$'
    );
    return emailRegExp.hasMatch(email);
  }

  String getDevicePlatform() {
    final deviceType = Platform.isAndroid
        ? "Android"
        : Platform.isIOS
            ? "Ios"
            : Platform.isWindows
                ? "Windows"
                : Platform.isMacOS
                    ? "Macos"
                    : "Web";
    return deviceType;
  }

  String convertDateFormat(String date, String? format) {
    final inputDate = DateFormat('dd/MM/yyyy').parse(date);
    return DateFormat(format ?? "yyy-MM-dd").format(inputDate);
  }

  String formatMonthDateYear(String? isoDate, int mode) {
    if (isoDate == null || isoDate.isEmpty) {
      return "Invalid date";
    }

    try {
      DateTime dateTime = DateTime.parse(isoDate).toLocal();
      if (mode == 0) {
        return DateFormat("MMM, yyyy").format(dateTime);
      } else {
        return DateFormat("MMM dd, yyyy").format(dateTime);
      }
    } catch (e) {
      return "Invalid date";
    }
  }

  String formatTime(String? isoDate) {
    if (isoDate == null || isoDate.isEmpty) {
      return "Invalid date";
    }

    try {
      DateTime? dateTime = DateTime.tryParse(isoDate);

      if (dateTime == null) {
        return "Invalid date";
      }

      return DateFormat("hh:mm a").format(dateTime.toLocal());
    } catch (e) {
      return DateFormat("hh:mm a").format(DateTime.now());
    }
  }

  int getMonthFromDate(String? date) {
    try {
      DateTime dateTime = DateTime.parse(date ?? "");
      int month = dateTime.month;
      return month;
    } catch (e) {
      return 0;
    }
  }

  String convertCustomStringToDate(String input) {
    try {
      String timestampPart = input.substring(0, 8);
      int secondsSinceEpoch = int.parse(timestampPart, radix: 16);
      DateTime dateTime =
          DateTime.fromMillisecondsSinceEpoch(secondsSinceEpoch * 1000);
      return DateFormat("dd/MM/yyyy       hh:mm:ss a").format(dateTime);
    } catch (e) {
      DateTime dateTime = DateTime.now();
      return DateFormat("dd/MM/yyyy       hh:mm:ss a").format(dateTime);
    }
  }

  void showSnackBar(String message) {
    if (navigatorKey.currentState != null) {
      final context = navigatorKey.currentState!.context;
      final snackBar = SnackBar(
        backgroundColor: CustomColors.primaryColor,
        margin: const EdgeInsets.all(Dimensions.padding_20),
        behavior: SnackBarBehavior.floating,
        closeIconColor: CustomColors.buttonTxtColor,
        duration: const Duration(seconds: 1),
        showCloseIcon: true,
        content: Text(message,
            style: Theme.of(context)
                .textTheme
                .bodySmall
                ?.copyWith(color: CustomColors.buttonTxtColor)),
      );
      ScaffoldMessenger.of(context).showSnackBar(snackBar);
    }
  }

  String formatHourNotZeroDuration(int seconds) {
    int milliseconds = seconds * 1000;
    Duration duration = Duration(milliseconds: milliseconds);

    int hours = duration.inHours;
    int minutes = duration.inMinutes.remainder(60);
    int secs = duration.inSeconds.remainder(60);

    if (hours > 0) {
      return '${hours.toString().padLeft(2, '0')}:'
          '${minutes.toString().padLeft(2, '0')}:'
          '${secs.toString().padLeft(2, '0')}';
    } else {
      return '${minutes.toString().padLeft(2, '0')}:'
          '${secs.toString().padLeft(2, '0')}';
    }
  }

  Future<bool> isLocationPermissionGranted() async {
    if (Platform.isAndroid) {
      return await Permission.location.isGranted;
    } else if (Platform.isIOS) {
      LocationPermission iOSPermission = await Geolocator.requestPermission();
      if (iOSPermission == LocationPermission.whileInUse ||
          iOSPermission == LocationPermission.always) {
        debugPrint("iOS location permission granted.");
        return true;
      }else {
        return false;
      }
    } else {
      print('dfssdfsdc');
      return false;
    }
  }

  /*Future<bool> isLocationPermissionGranted() async {
    return await Permission.location.isGranted;
  }*/

  void saveCurrentLocation(Position position) {
    preference.setDouble(PreferenceHelper.currentLatDouble, position.latitude);
    preference.setDouble(PreferenceHelper.currentLngDouble, position.longitude);
    preference.setDouble(PreferenceHelper.bearingDouble, position.heading);
  }

  Position getSavedLocation() {
    double lat = preference.getDouble(PreferenceHelper.currentLatDouble) ?? 0;
    double lng = preference.getDouble(PreferenceHelper.currentLngDouble) ?? 0;
    double heading = preference.getDouble(PreferenceHelper.bearingDouble) ?? 0;
    return Position(
        longitude: lng,
        latitude: lat,
        timestamp: DateTime.now(),
        accuracy: 0,
        altitude: 0,
        altitudeAccuracy: 0,
        heading: heading,
        headingAccuracy: 0,
        speed: 0,
        speedAccuracy: 0);
  }

  Color getRandomColor(List<Color> color, Random random) =>
      color[random.nextInt(color.length)];

  MaterialColor createMaterialColor(Color color) {
    List<double> strengths = <double>[.05];
    Map<int, Color> swatch = {};

    final int r = color.red, g = color.green, b = color.blue;

    for (int i = 1; i < 10; i++) {
      strengths.add(0.1 * i);
    }

    for (var strength in strengths) {
      final double ds = 0.5 - strength;
      swatch[(strength * 1000).round()] = Color.fromRGBO(
        r + ((ds < 0 ? r : (255 - r)) * ds).round(),
        g + ((ds < 0 ? g : (255 - g)) * ds).round(),
        b + ((ds < 0 ? b : (255 - b)) * ds).round(),
        1,
      );
    }

    return MaterialColor(color.value, swatch);
  }

  LatLngBounds computeBounds(List<LatLng> list) {
    assert(list.isNotEmpty);

    var firstLatLng = list.first;
    double south = firstLatLng.latitude,
        north = firstLatLng.latitude,
        west = firstLatLng.longitude,
        east = firstLatLng.longitude;

    for (var latLng in list.skip(1)) {
      south = min(south, latLng.latitude);
      north = max(north, latLng.latitude);
      west = min(west, latLng.longitude);
      east = max(east, latLng.longitude);
    }

    if ((east - west).abs() > 180) {
      double temp = east;
      east = west;
      west = temp;
    }

    debugPrint(
        "Computed Bounds -> South: $south, West: $west, North: $north, East: $east");

    return LatLngBounds(
      southwest: LatLng(south, west),
      northeast: LatLng(north, east),
    );
  }

  Future<String> getAddressFromLatLng(LatLng latLng) async {
    String address = "";
    if (latLng == const LatLng(0.0, 0.0)) {
      return address;
    }
    final response = await apiHelper.post(AppUrls.convertLatLngToAddess,
        params: {
          AppConstants.lat: latLng.latitude,
          AppConstants.lng: latLng.longitude
        });
    response.fold((e) => showErrorDialog(errorModel: e), (r) {
      if (r.data != null && r.data is String) {
        address = r.data;
      } else {
        showErrorDialog(message: translation.txtTryAgain);
      }
    });
    return address;
  }

  Future<LatLng> getLatLngFromAddress(String placeId) async {
    LatLng latLng = const LatLng(0, 0);
    final response = await apiHelper.post(AppUrls.converAddressLatLng,
        params: {AppConstants.address: placeId});
    response.fold((e) => showErrorDialog(errorModel: e), (r) {
      if (r.data != null) {
        final data = parseData(r.data, AddressToLatLngModel.fromJson);
        if (data != null && data.lat != 0.0 && data.lng != 0.0) {
          latLng = LatLng(data.lat, data.lng);
        }
      }
    });
    return latLng;
  }

  Future<List<LatLng>> getPolylineFromRoutes(Map<String, dynamic> map) async {
    List<LatLng> latlng = [];

    final response = await apiHelper.post(AppUrls.allConvertPolygoLine, params: map);

    return response.fold(
          (e) {
        showErrorDialog(errorModel: e);
        return latlng;
      },
          (r) {
        final res = parseData(r.data, RoutePolylineModel.fromJson);
        final routes = res?.routes;

        if (routes == null || routes.isEmpty) return latlng;
          final decodedPath = routes.first.decodedPath;
         for (final point in decodedPath ?? []) {
            latlng.add(LatLng(point[0],point[1]));
         }
        return latlng;
      },
    );
  }


  String getDriverId() {
    return preference.getString(PreferenceHelper.driverId) ?? "";
  }

  String getDriverUserId() {
    return preference.getString(PreferenceHelper.driverUserId) ?? "";
  }

  void saveReqId(String reqId) {
    preference.setString(PreferenceHelper.reqIdString, reqId);
  }

  void clearReqId() {
    preference.setString(PreferenceHelper.reqIdString, "");
  }

  String colorToHex(Color color) {
    return color.value.toRadixString(16).padLeft(8, '0').substring(2).toUpperCase();
  }

  String getCurrencySymbol() {
    return preference.getString(PreferenceHelper.currencySymbol) ?? "";
  }

  Color fromHex(String hex) {
    hex = hex.replaceAll('#', '');
    if (hex.length == 6) {
      hex = 'FF$hex';
    }
    return Color(int.parse(hex, radix: 16));
  }

  void showSuccessDialog(
      {String? message,
        Function()? onClick,
        String? buttonTxt,
        bool canDismiss = true}) {
    if (navigatorKey.currentState != null && _successDialogRoute == null) {
      BuildContext context = navigatorKey.currentState!.context;
      _successDialogRoute = DialogRoute(
        context: context,
        builder: (_) => SuccessDialog(
          customMessage: message,
          onClick: onClick,
          translation: translation,
          buttonTxt: buttonTxt,
          canDismiss: canDismiss,
        ),
        barrierDismissible: canDismiss,
      );
      Navigator.of(context).push(_successDialogRoute!).then((value) {
        _successDialogRoute = null;
      });
    }
  }

  DateTime? safeParseDate(String? date) {
    if (date == null || date.isEmpty) return null;
    try {
      return DateTime.parse(date);
    } catch (e) {
      return null;
    }
  }

}
