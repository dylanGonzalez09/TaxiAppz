import 'dart:async';
import 'dart:convert';
import 'dart:math';
import 'package:flutter/cupertino.dart';
import 'package:flutter_foreground_task/flutter_foreground_task.dart';
import 'package:geolocator/geolocator.dart';
import 'package:get_it/get_it.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:shimmer/main.dart';
import 'package:taxiappzpro/di/di_config.dart';
import 'package:taxiappzpro/network/response_models/req_in_pro_model.dart';
import 'package:taxiappzpro/network/response_models/trips_model.dart';
import 'package:taxiappzpro/utils/app_constants.dart';
import 'package:taxiappzpro/utils/mqtt_helper.dart';
import 'package:taxiappzpro/utils/overlay_helper.dart';
import 'package:taxiappzpro/utils/preference_helper.dart';

@pragma('vm:entry-point')
void startCallback() {
  FlutterForegroundTask.setTaskHandler(ForeGroundServiceHandler());
}

class ForeGroundServiceHandler extends TaskHandler {
  late SharedPreferences preferences;
  late MqttHelper mqtt;
  OverlayHelper? overlayHelper;
  late Driver driver;
  int arriveWaitingTime = 0;
  int startWaitingTime = 0;
  Timer? arriveTimer;
  Timer? startTimer;
  final arguments = <String, dynamic>{};
  final tripArguments = <String, dynamic>{};
  TripModel? tripModel;
  LatLng? previousLatLng;
  double distance = 0;
  DateTime? _lastWaitingCheckAt;
  static const double _stationarySpeedThresholdMps = 0.8;
  static const double _stationaryDistanceThresholdMeters = 8.0;
  static const double _stationaryDerivedSpeedThresholdMps = 1.2;
  int _stationarySamples = 0;


  @override
  Future<void> onDestroy(DateTime timestamp, bool isTimeout) async {
    mqtt.disconnect();
  }

  @override
  void onRepeatEvent(DateTime timestamp) async {
    uploadData(timestamp);
  }

  @override
  Future<void> onStart(DateTime timestamp, TaskStarter starter) async {
    GetIt.instance.registerLazySingletonAsync<SharedPreferences>(
      () => SharedPreferences.getInstance(),
    );
    await GetIt.instance.isReady<SharedPreferences>();
    preferences = getIt<SharedPreferences>();
    final driverString =
        preferences.getString(PreferenceHelper.driverDetailsString) ?? "";
    driver = Driver.fromJson(jsonDecode(driverString));
    mqtt = MqttHelper();
    mqtt.initializeMqtt(
        "foreGroundService${preferences.getString(PreferenceHelper.driverId)}");
    await mqtt.connect();
    debugPrint("Mqtt status ${mqtt.isConnected}");
  }

  Future<Position> _determinePosition() async {
    debugPrint("locationCheck ");
    bool serviceEnabled;
    LocationPermission permission;
    serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      return Future.error('Location services are disabled.');
    }

    permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        return Future.error('Location permissions are denied');
      }
    }
    const settings =
        LocationSettings(distanceFilter: 100, accuracy: LocationAccuracy.high);

    return await Geolocator.getCurrentPosition(locationSettings: settings);
  }

  Future<void> uploadData(DateTime timeStamp) async {
    final position = await _determinePosition();
    final driverUserId = preferences.getString(PreferenceHelper.driverUserId);
    final currentLatLng = LatLng(position.latitude, position.longitude);
    final movedMeters = previousLatLng == null
        ? 0.0
        : calculateDistance(previousLatLng!, currentLatLng) * 1000;

    if (tripModel != null && previousLatLng != null) {
      distance += calculateDistance(previousLatLng!, currentLatLng);
    }

    arguments[AppConstants.driverId] = driver.id ?? "";
    arguments[AppConstants.latitude] = position.latitude.toString();
    arguments[AppConstants.longitude] = position.longitude.toString();
    arguments[AppConstants.bearing] = position.heading.toString();
    arguments[AppConstants.userId] = driverUserId ?? "";
    arguments[AppConstants.lastUpdated] = timeStamp.microsecondsSinceEpoch.toString();

    arguments[AppConstants.isOnline] = 1.toString();

    arguments[AppConstants.serviceType] = driver.serviceType?.join(",") ?? "";


    arguments[AppConstants.vehicleId] = driver.vehicleId ?? "";
    arguments[AppConstants.speed] = position.speed.toString();
    arguments[AppConstants.distance] = distance.toStringAsFixed(3);

    arguments[AppConstants.isAvailable] = (tripModel != null ? 0 : 1).toString();
    arguments[AppConstants.primaryZone] =
        preferences.getString(PreferenceHelper.primaryZone);

    if (preferences.getString(PreferenceHelper.secondaryZone)?.isNotEmpty == true) {
      arguments[AppConstants.secondaryZone] =
          preferences.getString(PreferenceHelper.secondaryZone) ?? "";
    }

    preferences.setDouble(PreferenceHelper.currentLatDouble, position.latitude);
    preferences.setDouble(PreferenceHelper.currentLngDouble, position.longitude);

    _updateWaitingTimeByMovement(position, timeStamp, movedMeters);
    previousLatLng = currentLatLng;

    arguments[AppConstants.arriveWaitingTime] = arriveWaitingTime.toString();
    arguments[AppConstants.startWaitingTime] = startWaitingTime.toString();

    mqtt.publish(AppConstants.driverLocationUpdate, jsonEncode(arguments));


    FlutterForegroundTask.sendDataToMain(arguments);
  }

  void _updateWaitingTimeByMovement(
      Position position, DateTime timeStamp, double movedMeters) {
    final trip = tripModel;
    if (trip == null || trip.tripType?.toUpperCase() != AppConstants.local.toUpperCase()) {
      _lastWaitingCheckAt = timeStamp;
      _stationarySamples = 0;
      return;
    }

    final int elapsedSeconds = _lastWaitingCheckAt == null
        ? 1
        : max(1, timeStamp.difference(_lastWaitingCheckAt!).inSeconds);
    _lastWaitingCheckAt = timeStamp;

    final double derivedSpeedMps =
        elapsedSeconds > 0 ? movedMeters / elapsedSeconds : 0.0;
    final bool isStationary = position.speed <= _stationarySpeedThresholdMps &&
        movedMeters <= _stationaryDistanceThresholdMeters &&
        derivedSpeedMps <= _stationaryDerivedSpeedThresholdMps;
    if (isStationary) {
      _stationarySamples += 1;
    } else {
      _stationarySamples = 0;
    }

    final bool canAccumulateWaiting = _stationarySamples >= 2;
    if (canAccumulateWaiting) {
      if (trip.isDriverArrived == true && trip.isTripStart != true) {
        arriveWaitingTime += elapsedSeconds;
      } else if (trip.isTripStart == true) {
        startWaitingTime += elapsedSeconds;
      }
    }

    _persistWaitingSnapshot(trip.sId);

    FlutterForegroundTask.sendDataToMain({
      AppConstants.arriveWaitingTime: arriveWaitingTime,
      AppConstants.startWaitingTime: startWaitingTime,
    });

    mqtt.publish(
      AppConstants.postWaitingTime,
      jsonEncode({
        AppConstants.requestId: trip.sId ?? "",
        AppConstants.afterArrived: startWaitingTime,
        AppConstants.beforeArrived: arriveWaitingTime,
      }),
    );
  }

  void _persistWaitingSnapshot(String? reqId) {
    if (reqId == null || reqId.isEmpty) return;
    preferences.setString(PreferenceHelper.tripWaitingReqId, reqId);
    preferences.setInt(PreferenceHelper.tripWaitingArriveSec, arriveWaitingTime);
    preferences.setInt(PreferenceHelper.tripWaitingStartSec, startWaitingTime);
  }

  void _loadWaitingForTrip(String? reqId) {
    if (reqId == null || reqId.isEmpty) return;
    final storedId = preferences.getString(PreferenceHelper.tripWaitingReqId);
    if (storedId == reqId) {
      arriveWaitingTime =
          preferences.getInt(PreferenceHelper.tripWaitingArriveSec) ?? 0;
      startWaitingTime =
          preferences.getInt(PreferenceHelper.tripWaitingStartSec) ?? 0;
    } else {
      arriveWaitingTime = 0;
      startWaitingTime = 0;
      _persistWaitingSnapshot(reqId);
    }
  }

  void _clearWaitingSnapshot() {
    preferences.remove(PreferenceHelper.tripWaitingReqId);
    preferences.remove(PreferenceHelper.tripWaitingArriveSec);
    preferences.remove(PreferenceHelper.tripWaitingStartSec);
  }


  @override
  void onReceiveData(Object data) {
    super.onReceiveData(data);
    debugPrint("ForeGroundServiceParams ${data}");
    debugPrint("ForeGroundServiceParams ${data is Map<String, dynamic>}");
    if (data is Map<String, dynamic>) {
      if (data.containsKey("trip")) {
        final Map<String, dynamic> jsonString = jsonDecode(data['trip']);
      print("fpkref${jsonString['_id']}");
        tripModel = TripModel.fromJson(jsonString);
        _loadWaitingForTrip(tripModel?.sId);
        FlutterForegroundTask.sendDataToMain({
          AppConstants.arriveWaitingTime: arriveWaitingTime,
          AppConstants.startWaitingTime: startWaitingTime,
        });
      }
      if (data.containsKey("clearTrip")) {
        tripModel = null;
        stopArriveWaitingTime();
        stopStartWaitingTime();
        arriveWaitingTime = 0;
        startWaitingTime = 0;
        _clearWaitingSnapshot();
        distance = 0;
        previousLatLng = null;
        tripArguments.clear();
      }

      if (data.containsKey(AppConstants.secondaryZone)) {
        final String sZone = data[AppConstants.secondaryZone];
        if (sZone.isNotEmpty == true) {
          preferences.setString(PreferenceHelper.secondaryZone, sZone);
        } else {
          if (preferences.containsKey(PreferenceHelper.secondaryZone)) {
            preferences.remove(PreferenceHelper.secondaryZone);
          }
        }
      }
    }
  }

  void startArriveWaitingTime() {
    if (tripModel?.tripType?.toUpperCase() == AppConstants.local.toUpperCase()) {
      arriveTimer ??= Timer.periodic(const Duration(seconds: 1), (timer) {
        arriveWaitingTime += 1;
        _persistWaitingSnapshot(tripModel?.sId);
        FlutterForegroundTask.sendDataToMain(
            {AppConstants.arriveWaitingTime: arriveWaitingTime});
        mqtt.publish(
            AppConstants.postWaitingTime,
            jsonEncode({
              AppConstants.requestId: tripModel?.sId ?? "",
              AppConstants.afterArrived: startWaitingTime,
              AppConstants.beforeArrived: arriveWaitingTime
            }));
      });
    }
  }

  void stopArriveWaitingTime() {
    arriveTimer?.cancel();
    arriveTimer = null;
  }

  void startStartWaitingTime() {
    startTimer ??= Timer.periodic(const Duration(seconds: 1), (timer) {
      startWaitingTime += 1;
      _persistWaitingSnapshot(tripModel?.sId);
      FlutterForegroundTask.sendDataToMain(
          {AppConstants.startWaitingTime: startWaitingTime});
      mqtt.publish(
          AppConstants.postWaitingTime,
          jsonEncode({
            AppConstants.requestId: tripModel?.sId ?? "",
            AppConstants.afterArrived: startWaitingTime,
            AppConstants.beforeArrived: arriveWaitingTime
          }));
    });
  }

  void stopStartWaitingTime() {
    arriveTimer?.cancel();
    arriveTimer = null;
    startTimer?.cancel();
    startTimer = null;
  }

  double calculateDistance(LatLng origin, LatLng drop) {
    const double earthRadius = 6371;

    double dLat = _degreesToRadians(drop.latitude - origin.latitude);
    double dLon = _degreesToRadians(drop.longitude - origin.longitude);

    double a = sin(dLat / 2) * sin(dLat / 2) +
        cos(_degreesToRadians(origin.latitude)) *
            cos(_degreesToRadians(drop.latitude)) *
            sin(dLon / 2) *
            sin(dLon / 2);
    double c = 2 * atan2(sqrt(a), sqrt(1 - a));

    return earthRadius * c;
  }

  double calculateDistanceMiles(LatLng origin, LatLng drop) {
    const double earthRadius = 3958.8;

    double dLat = _degreesToRadians(drop.latitude - origin.latitude);
    double dLon = _degreesToRadians(drop.longitude - origin.longitude);

    double a = sin(dLat / 2) * sin(dLat / 2) +
        cos(_degreesToRadians(origin.latitude)) *
            cos(_degreesToRadians(drop.latitude)) *
            sin(dLon / 2) *
            sin(dLon / 2);
    double c = 2 * atan2(sqrt(a), sqrt(1 - a));

    return earthRadius * c;
  }

  double _degreesToRadians(double degrees) {
    return degrees * pi / 180;
  }
}
