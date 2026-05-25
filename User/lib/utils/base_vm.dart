import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'dart:math';
import 'dart:ui';

import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get_rx/src/rx_types/rx_types.dart';
import 'package:go_router/go_router.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:intl/intl.dart';
import 'package:location/location.dart';
import 'package:package_info_plus/package_info_plus.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter_polyline_points/flutter_polyline_points.dart';
import 'package:user/network/response_models/duration_model.dart';
import '../network/response_models/address_to_lat_lng_model.dart' hide Location;
import '../network/response_models/route_polyline_model.dart';
import '../ui/dialogs/success_dialog.dart';
import '../utils/app_constants.dart';
import '../utils/app_url.dart';
import '../utils/mqtt_helper.dart';
import '../utils/preference_helper.dart';

import '../di/di_config.dart';
import '../main.dart';
import '../models/create_local_request_model.dart';
import '../models/create_rental_request_model.dart';
import '../network/api_helper.dart';
import '../network/response_models/custom_error_model.dart';
import '../network/response_models/destination_model.dart';
import '../network/response_models/translation_model.dart';
import '../ui/dialogs/error_dialog.dart';
import 'custom_colors.dart';

class BaseVm extends ChangeNotifier {
  final preference = getIt<SharedPreferences>();
  final apiHelper = getIt<ApiHelper>();
  TranslationModel translation = TranslationModel();
  RxBool isLoading = false.obs;
  final mqtt = getIt<MqttHelper>();
  final packageInfo = getIt<PackageInfo>();
  LatLng? lastVehicleLocation;
  DateTime? lastLocationTime;
  double currentVehicleSpeed = 0.0;
  List<double> speedHistory = [];
  final Location _locationService = Location();
  LocationData? _locationData;
  StreamSubscription<LocationData>? _locationSub;
  DurationModel? durationData;
  // String? _lastTravelTimeKey;
  // String _lastTravelTimeResult = "";
  // DateTime? _lastTravelTimeAt;
  // String? _inFlightTravelTimeKey;
  // Future<String>? _inFlightTravelTimeFuture;
  // static const Duration _travelTimeCacheWindow = Duration(seconds: 6);
  // static const Duration _travelTimeRouteCacheWindow = Duration(seconds: 3);
  // static final Map<String, _TravelTimeCacheEntry> _travelTimeCacheByKey = {};
  // static final Map<String, Future<String>> _travelTimeInFlightByKey = {};

  BaseVm() {
    final translation = preference.getString(PreferenceHelper.translation);
    if (translation != null && translation.isNotEmpty == true) {
      this.translation = TranslationModel.fromJson(jsonDecode(translation));
    }
  }

  bool _isLoading = false;
  DialogRoute? _route;
  DialogRoute? _errorDialogRoute;
  DialogRoute? _successDialogRoute;

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

  bool isValidEmail(String email) {
    final RegExp emailRegex =
        RegExp(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$');
    return emailRegex.hasMatch(email);
  }

  bool isValidName(String name) {
    final nameRegExp = RegExp(r'^[a-zA-Z\s]+$');
    return nameRegExp.hasMatch(name);
  }

  void popAndMove(String name, {dynamic args}) {
    if (navigatorKey.currentState != null) {
      GoRouter.of(navigatorKey.currentState!.context)
          .pushReplacementNamed(name, extra: args);
    }
  }

  Future<dynamic> moveAndWait(String name, {dynamic args}) async {
    final result = await GoRouter.of(navigatorKey.currentState!.context)
        .pushNamed(name, extra: args);

    return result;
  }

  void changeLocale(String code) {
    if (navigatorKey.currentState != null) {
      final locale = Locale(code);
      MyApp.of(navigatorKey.currentState!.context)?.setLocale(locale);
    }
  }

  double widthConverter(double figmaPixel, BuildContext context) {
    double screenWidth = MediaQuery.of(context).size.width;
    double actualWidth = 360.0;
    double scale = screenWidth / actualWidth;
    return figmaPixel * scale;
  }

  double heightConverter(double figmaPixel, BuildContext context) {
    double screenHeight = MediaQuery.of(context).size.height;
    double actualHeight = 800.0;
    double scale = screenHeight / actualHeight;
    return figmaPixel * scale;
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

  Future<String?> getFcmToken() async {
    final token = await FirebaseMessaging.instance.getToken();
    debugPrint("firebaseeeee token  =  $token");
    return token;
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

  double getMatchParentWidth(BuildContext context) =>
      MediaQuery.of(context).size.width;

  double getMatchParentHeight(BuildContext context) =>
      MediaQuery.of(context).size.height;

  Future<BitmapDescriptor> createBitmapDescriptorFromAsset(
      String assetPath) async {
    const ImageConfiguration imageConfiguration = ImageConfiguration();
    BitmapDescriptor bitmapDescriptor = await BitmapDescriptor.asset(
        imageConfiguration, assetPath,
        height: 90, width: 90);
    return bitmapDescriptor;
  }

  Future<BitmapDescriptor> createBitmapDescriptorFromAssets(
      String assetPath) async {
    try {
      await rootBundle.load(assetPath);
      return await BitmapDescriptor.asset(
        const ImageConfiguration(size: Size(90, 90)),
        // Configuration for the image size
        assetPath,
      );
    } catch (e) {
      debugPrint('Error loading asset: $assetPath. Details: $e');
      throw Exception('Unable to load marker asset: $assetPath');
    }
  }

  String formatMonthDateYear(String? isoDate, int mode) {
    if (isoDate == null || isoDate.isEmpty) {
      print("kfpefeff${isoDate}");
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
      print("eferfefeffe${isoDate}");
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
      // fallback if something unexpected happens
      return DateFormat("hh:mm a").format(DateTime.now());
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

  String convertToMilliSecond(String input) {
    DateFormat inputFormat = DateFormat("dd/MM/yyyy hh:mm a");
    DateTime dateTime = inputFormat.parse(input);
    return "${dateTime.millisecondsSinceEpoch}";
  }

  String formatHourNotZeroDuration(int seconds) {
    Duration duration = Duration(seconds: seconds);

    int hours = duration.inHours;
    int minutes = duration.inMinutes.remainder(60);
    int secs = duration.inSeconds.remainder(60);

    if (hours > 0) {
      return '${hours.toString().padLeft(2, '0')}:' // HH:mm:ss
          '${minutes.toString().padLeft(2, '0')}:'
          '${secs.toString().padLeft(2, '0')}';
    } else {
      return '${minutes.toString().padLeft(2, '0')}:' // mm:ss
          '${secs.toString().padLeft(2, '0')}';
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

  // Widget _transLoader(BuildContext context) {
  //   return Dialog(
  //     backgroundColor: Colors.transparent,
  //     surfaceTintColor: Colors.transparent,
  //     child: PopScope(
  //         canPop: false,
  //         child: Container(
  //           color: Colors.transparent,
  //           alignment: FractionalOffset.center,
  //           height: 80.0,
  //           padding: const EdgeInsets.all(20.0),
  //           child: CircularProgressIndicator(
  //             color: CustomColors.primaryColor,
  //           ),
  //         )),
  //   );
  // }

  // Widget _transLoader(BuildContext context) {
  //   return const Dialog(
  //     backgroundColor: Colors.transparent,
  //     elevation: 0,
  //     insetPadding: EdgeInsets.zero,
  //     child: PopScope(
  //       canPop: false,
  //       child: Center(
  //         child: CircularProgressIndicator(
  //           color: CustomColors.primaryColor,
  //         ),
  //       ),
  //     ),
  //   );
  // }

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
                  child: const CircularProgressIndicator(
                    color: CustomColors.primaryColor,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  String getUserId() {
    return preference.getString(PreferenceHelper.userId) ?? "";
  }

  void saveCurrentLocation(LatLng latLng) {
    preference.setDouble(PreferenceHelper.currentLat, latLng.latitude);
    preference.setDouble(PreferenceHelper.currentLng, latLng.longitude);
  }

  LatLng getSavedCurrentLocation() {
    final lat = preference.getDouble(PreferenceHelper.currentLat) ?? 0;
    final lng = preference.getDouble(PreferenceHelper.currentLng) ?? 0;
    return LatLng(lat, lng);
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

  Future<LatLng> getLatLngFromAddress(String description) async {
    LatLng latLng = const LatLng(0, 0);
    final response = await apiHelper.post(AppUrls.converAddressLatLng,
        params: {AppConstants.address: description});
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
        return latlng; // Return empty list on error
      },
          (r) {
        final res = parseData(r.data, RoutePolylineModel.fromJson);
        final routes = res?.routes;

        if (routes == null || routes.isEmpty) return latlng;

        // for (final decodePoint in routes) {
        final selectedRoute = routes.firstWhere(
          (route) => (route.decodedPath?.isNotEmpty ?? false) || (route.polyline?.isNotEmpty ?? false),
          orElse: () => routes.first,
        );
        final decodedPath = selectedRoute.decodedPath;
        if (decodedPath != null && decodedPath.isNotEmpty) {
          for (final point in decodedPath) {
            if (point.length >= 2) {
              latlng.add(LatLng(point[0], point[1]));
            }
          }
        } else if (selectedRoute.polyline?.isNotEmpty == true) {
          // Fallback when backend returns only encoded polyline.
          final encodedPoints =
              PolylinePoints().decodePolyline(selectedRoute.polyline!);
          for (final point in encodedPoints) {
            latlng.add(LatLng(point.latitude, point.longitude));
          }
        }
        // }
        print("ftgtgtrgr$latlng");
        return latlng;
      },
    );
  }

  LatLngBounds computeBounds(List<LatLng> list) {
    assert(list.isNotEmpty);

    var firstLatLng = list.first;
    double south = firstLatLng.latitude,
        north = firstLatLng.latitude,
        west = firstLatLng.longitude,
        east = firstLatLng.longitude;

    // Normalize longitudes and compute bounds
    for (var latLng in list.skip(1)) {
      double lat = latLng.latitude;
      double lng = normalizeLongitude(latLng.longitude);

      south = min(south, lat);
      north = max(north, lat);
      west = min(west, lng);
      east = max(east, lng);
    }

    // Handle single point case
    if (list.length == 1) {
      const double buffer = 0.01; // Adjust buffer size as needed
      south = firstLatLng.latitude - buffer;
      north = firstLatLng.latitude + buffer;
      west = firstLatLng.longitude - buffer;
      east = firstLatLng.longitude + buffer;
    }

    // Handle antimeridian crossing
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

  double normalizeLongitude(double longitude) {
    while (longitude < -180) {
      longitude += 360;
    }
    while (longitude > 180) {
      longitude -= 360;
    }
    return longitude;
  }

  double calculateDistance(LatLng origin, LatLng drop) {
    const double earthRadius = 6371; // Earth's radius in kilometers

    double dLat = _degreesToRadians(drop.latitude - origin.latitude);
    double dLon = _degreesToRadians(drop.longitude - origin.longitude);

    double a = sin(dLat / 2) * sin(dLat / 2) +
        cos(_degreesToRadians(origin.latitude)) *
            cos(_degreesToRadians(drop.latitude)) *
            sin(dLon / 2) *
            sin(dLon / 2);
    double c = 2 * atan2(sqrt(a), sqrt(1 - a));

    return earthRadius * c; // Distance in kilometers
  }

  double _degreesToRadians(double degrees) {
    return degrees * pi / 180;
  }

  String capitalizeLetter(String text) {
    if (text.isEmpty) return text;
    return text[0].toUpperCase() + text.substring(1).toLowerCase();
  }

  Future<void> startLocation() async {
    try {
      bool serviceEnabled = await _locationService.serviceEnabled();
      if (!serviceEnabled) {
        serviceEnabled = await _locationService.requestService();
        if (!serviceEnabled) return;
      }

      PermissionStatus permission = await _locationService.hasPermission();
      if (permission == PermissionStatus.denied) {
        permission = await _locationService.requestPermission();
        if (permission != PermissionStatus.granted) return;
      }

      await _locationService.changeSettings(
        accuracy: LocationAccuracy.high,
        interval: 1000,
        distanceFilter: 0,
      );

      _locationSub = _locationService.onLocationChanged.listen((LocationData loc) {

          _locationData = loc;

        print("Speed m/s: ${loc.speed}");
      });

    } catch (e) {
      print("Location error: $e");
    }
  }

  // int bookCalculateEta(LatLng origin, LatLng drop, {double speed = 40}) {
  //   // Use the provided speed if it's greater than or equal to 5, otherwise use 5
  //   final effectiveSpeed = speed < 5 ? 5 : speed;
  //
  //   // Calculate the distance between the origin and drop locations
  //   final distance = calculateDistance(origin, drop);
  //
  //   // Calculate the ETA in hours
  //   final eta = distance / effectiveSpeed;
  //
  //   // Convert the ETA to minutes
  //   final time = eta * 60;
  //
  //   // Return the ETA rounded to the nearest minute, ensuring at least 1 minute
  //   return eta.isFinite
  //       ? time.round() == 0
  //       ? 1
  //       : time.round()
  //       : 0;
  // }

//   Future<int> calculateEta(LatLng origin, LatLng drop, {double speed = 40}) async {
//     final distance = calculateDistance(origin, drop);
//     final eta = distance / speed;
//     final time = eta * 60;
//
//     print("Ferfege$_locationData");
//
// final speedMove = await calculateArrivalTime(origin, drop,_locationData?.speed);
// final movingSpeed = int.tryParse(speedMove);
// print("fkpgtrg$movingSpeed");
//     return movingSpeed ?? 0;
//   }

  int calculateEta(LatLng origin, LatLng drop, {double speed = 40}) {
    final distance = calculateDistance(origin, drop);
    final eta = distance / speed;
    final time = eta * 60;
    return eta.isFinite
        ? time.round() == 0
        ? 1
        : time.round()
        : 0;
  }


  double haversineDistance(double lat1, double lon1, double lat2, double lon2) {
    double toRadians(double degree) => degree * pi / 180;
    const double R = 6371.0;
    double dLat = toRadians(lat2 - lat1);
    double dLon = toRadians(lon2 - lon1);
    double a = pow(sin(dLat / 2), 2) +
        cos(toRadians(lat1)) * cos(toRadians(lat2)) * pow(sin(dLon / 2), 2);
    double c = 2 * atan2(sqrt(a), sqrt(1 - a));

    return R * c; // Distance in km
  }

  Map<String, dynamic> getCreateLocalRequestParams({
    required CustomAddressModel pickUp,
    required CustomAddressModel drop,
    required String bookingFor,
    required String paymentOpt,
    required String rideType,
    required String tripType,
    required String typeId,
    bool? isLater,
    String? tripTime,
    String? promoCode,
    String? riderName,
    String? riderPhoneNumber,
    List<CustomAddressModel>? stops, // Make stops nullable
  }) {
    final createLocal = CreateLocalRequestModel(
      pickLat: pickUp.latLng.latitude,
      pickLng: pickUp.latLng.longitude,
      dropLat: drop.latLng.latitude,
      dropLng: drop.latLng.longitude,
      pickAddress: pickUp.address,
      dropAddress: drop.address,
      bookingFor: bookingFor,
      paymentOpt: paymentOpt,
      rideType: rideType,
      tripType: tripType,
      vehicleType: typeId,
      isLater: isLater,
      tripTime: tripTime,
      promoCode: promoCode,
      riderName: riderName,
      riderPhoneNumber: riderPhoneNumber,
      stops: stops != null && stops.isNotEmpty
          ? stops
              .map((stop) => {
                    "latitude": stop.latLng.latitude,
                    "longitude": stop.latLng.longitude,
                    "address": stop.address
                  })
              .toList()
          : null,
    );
    return createLocal.toJson();
  }

  Map<String, dynamic> getCreateRentalRequestParams(
      {required CustomAddressModel pickUp,
      required String bookingFor,
      required String paymentOpt,
      required String rideType,
      required String tripType,
      required String typeId,
      required String vehicleType,
      required String packageId,
      String? promoCode,
      bool? isLater,
      String? riderName,
      String? riderPhoneNumber,
      String? tripTime}) {
    final createLocal = CreateRentalRequestModel(
      pickLat: pickUp.latLng.latitude,
      pickLng: pickUp.latLng.longitude,
      pickAddress: pickUp.address,
      bookingFor: bookingFor,
      paymentOpt: paymentOpt,
      rideType: rideType,
      tripType: tripType,
      vehicleType: typeId,
      isLater: isLater,
      tripTime: tripTime,
      vehicle_type: vehicleType,
      packageId: packageId,
      promoCode: promoCode,
      riderName: riderName,
      riderPhoneNumber: riderPhoneNumber,
    );
    return createLocal.toJson();
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

  Future<void> refreshToken() async {
   showLoader();
    final response = await apiHelper.post(AppUrls.refreshToken,
        params: {
          'refreshToken': preference.getString(PreferenceHelper.authToken
          )});
    response.fold((e) => showErrorDialog(errorModel: e), (r) {
      if (r.data != null && r.data is String) {
        print("kfprtkogt${r.data}");
      } else {
        showErrorDialog(message: translation.txtTryAgain);
      }
    });

  }
  double calculateSpeed(LocationData? location) {
    if (location == null || location.speed == null) {
      return 0.0;
    }

    final double speedKmh = location.speed! * 3.6;

    if (speedKmh.isNaN || speedKmh.isInfinite || speedKmh < 0) {
      return 0.0;
    }
print("fjrejftgr$speedKmh");
    return speedKmh;
  }


  // Future<String> calculateArrivalTime(LatLng origin, LatLng drop, double? gpsSpeed,) async {
  //   double speedKph = (gpsSpeed ?? 0) * 3.6;
  //
  //   if (speedKph < 5 || speedKph.isNaN || speedKph.isInfinite) {
  //     speedKph = 40;
  //   }
  //
  //   final map = {
  //     AppConstants.dropLng: drop.longitude.toString(),
  //     AppConstants.dropLat: drop.latitude.toString(),
  //     AppConstants.pickLat: origin.latitude.toString(),
  //     AppConstants.pickLng: origin.longitude.toString(),
  //     AppConstants.speedKph: speedKph.toStringAsFixed(0),
  //   };
  //   final requestKey = _buildTravelTimeRequestKey(
  //     origin: origin,
  //     drop: drop,
  //     speedKph: speedKph,
  //   );
  //   final routeKey = _buildTravelTimeRouteKey(origin: origin, drop: drop);
  //   final now = DateTime.now();
  //
  //   // Reuse recent result for same params to avoid request spam.
  //   if (_lastTravelTimeKey == requestKey &&
  //       _lastTravelTimeAt != null &&
  //       now.difference(_lastTravelTimeAt!) < _travelTimeCacheWindow) {
  //     return _lastTravelTimeResult;
  //   }
  //
  //   // App-wide short cache by route (ignores minor speed fluctuations).
  //   final routeCached = _travelTimeCacheByKey[routeKey];
  //   if (routeCached != null &&
  //       now.difference(routeCached.at) < _travelTimeRouteCacheWindow) {
  //     _lastTravelTimeKey = requestKey;
  //     _lastTravelTimeResult = routeCached.value;
  //     _lastTravelTimeAt = now;
  //     return routeCached.value;
  //   }
  //
  //   // App-wide cache by exact key across all VMs.
  //   final exactCached = _travelTimeCacheByKey[requestKey];
  //   if (exactCached != null &&
  //       now.difference(exactCached.at) < _travelTimeCacheWindow) {
  //     _lastTravelTimeKey = requestKey;
  //     _lastTravelTimeResult = exactCached.value;
  //     _lastTravelTimeAt = now;
  //     return exactCached.value;
  //   }
  //
  //   // Reuse the in-flight request if same params are already being fetched.
  //   if (_inFlightTravelTimeKey == requestKey && _inFlightTravelTimeFuture != null) {
  //     return await _inFlightTravelTimeFuture!;
  //   }
  //   final globalInFlight = _travelTimeInFlightByKey[requestKey];
  //   if (globalInFlight != null) {
  //     return await globalInFlight;
  //   }
  //
  //   _inFlightTravelTimeKey = requestKey;
  //   _inFlightTravelTimeFuture = _fetchTravelTime(map);
  //   _travelTimeInFlightByKey[requestKey] = _inFlightTravelTimeFuture!;
  //   try {
  //     final result = await _inFlightTravelTimeFuture!;
  //     _lastTravelTimeKey = requestKey;
  //     _lastTravelTimeResult = result;
  //     _lastTravelTimeAt = DateTime.now();
  //     final entry = _TravelTimeCacheEntry(value: result, at: DateTime.now());
  //     _travelTimeCacheByKey[requestKey] = entry;
  //     _travelTimeCacheByKey[routeKey] = entry;
  //     return result;
  //   } finally {
  //     if (_inFlightTravelTimeKey == requestKey) {
  //       _inFlightTravelTimeKey = null;
  //       _inFlightTravelTimeFuture = null;
  //     }
  //     _travelTimeInFlightByKey.remove(requestKey);
  //   }
  // }

  // String _buildTravelTimeRequestKey({
  //   required LatLng origin,
  //   required LatLng drop,
  //   required double speedKph,
  // }) {
  //   final oLat = origin.latitude.toStringAsFixed(5);
  //   final oLng = origin.longitude.toStringAsFixed(5);
  //   final dLat = drop.latitude.toStringAsFixed(5);
  //   final dLng = drop.longitude.toStringAsFixed(5);
  //   final speed = ((speedKph / 5).round() * 5).toString();
  //   return "$oLat|$oLng|$dLat|$dLng|$speed";
  // }
  //
  // String _buildTravelTimeRouteKey({
  //   required LatLng origin,
  //   required LatLng drop,
  // }) {
  //   final oLat = origin.latitude.toStringAsFixed(5);
  //   final oLng = origin.longitude.toStringAsFixed(5);
  //   final dLat = drop.latitude.toStringAsFixed(5);
  //   final dLng = drop.longitude.toStringAsFixed(5);
  //   return "$oLat|$oLng|$dLat|$dLng";
  // }

  // Future<String> _fetchTravelTime(Map<String, dynamic> map) async {
  //   final response = await apiHelper.post(AppUrls.travelTime, params: map);
  //   return response.fold((e) {
  //     showErrorDialog(errorModel: e);
  //     return "";
  //   }, (r) {
  //     final data = r.data;
  //     durationData = parseData(data, DurationModel.fromJson);
  //     final duration =
  //         data["duration"]?.toString().replaceAll(RegExp(r'[^0-9]'), '') ?? "0";
  //     return duration;
  //   });
  // }

  DateTime? safeParseDate(String? date) {
    if (date == null || date.isEmpty) return null;
    try {
      return DateTime.parse(date);
    } catch (e) {
      return null;
    }
  }


}

class _TravelTimeCacheEntry {
  final String value;
  final DateTime at;
  const _TravelTimeCacheEntry({required this.value, required this.at});
}
