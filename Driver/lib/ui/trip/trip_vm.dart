import 'dart:async';
import 'dart:convert';
import 'dart:math';
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_foreground_task/flutter_foreground_task.dart';
import 'package:flutter_polyline_points/flutter_polyline_points.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:taxiappzpro/base/base_vm.dart';
import 'package:taxiappzpro/main.dart';
import 'package:taxiappzpro/network/response_models/req_in_pro_model.dart';
import 'package:taxiappzpro/network/response_models/trips_model.dart';
import 'package:taxiappzpro/ui/dialogs/otp_dialog.dart';
import 'package:taxiappzpro/ui/dialogs/pickup_location_changed_alert.dart';
import 'package:taxiappzpro/ui/dialogs/trip_address_change.dart';
import 'package:taxiappzpro/ui/trip/tripcancelbottomsheet/trip_cancel_bottom_sheet.dart';
import 'package:taxiappzpro/utils/app_urls.dart';
import 'package:taxiappzpro/utils/utils.dart';
import '../../models/enums.dart';
import '../../network/response_models/cancelReason_model.dart';
import '../../network/response_models/route_polyline_model.dart';
import '../../utils/app_constants.dart';
import '../../utils/custom_colors.dart';
import '../../utils/custom_images.dart';
import '../../utils/custom_router_config.dart';
import '../../utils/dimensions.dart';
import '../../utils/preference_helper.dart';
import '../dialogs/meter_upload_dialog.dart';

class TripVm extends BaseVm {
  static const double _visualSpeedMps = 6.0;
  static const int _frameMs = 16;
  TRIPSTATUS tripStatus = TRIPSTATUS.TRIP_ACCEPTED;
  String? meterValue, meterImageUrl, startKm;
  String tripButtonTxt = "Arrived";
  bool isDisposed = false;
  static const ImageConfiguration driverMarkerConfig =
      ImageConfiguration(size: Size(90, 90));
  bool isTripContentHidden = false;
  TripModel? trip;
  RequestInProModel? requestInProModel;
  double bearing = 0;
  GoogleMapController? mapController;
  final markers = <Marker>{};
  PolylinePoints polylinePoints = PolylinePoints();
  bool isBottomSheetCollapsed = false;
  StreamSubscription? _tripChangesSubscription;
  dynamic routeDistance; // in km
  dynamic routeDuration;
  DateTime? _lastRerouteTime;
  static const double _rerouteDistanceThreshold = 50.0;
  static const int _rerouteCooldownSeconds = 10;
  bool isAutoRecenterEnabled = true;
  DateTime? _lastCameraMoveTime;
  static const int _cameraCooldownSeconds = 2;
  LatLng? _lastAnimatedLocation;
  double _lastAnimatedBearing = 0;
  Timer? _markerAnimationTimer;
  static const int _animationSteps = 40;
  bool isBottomSheetOpen = false;

  int messageCount = 0;

  void incrementMessageCount() {
    messageCount++;
    notifyListeners();
  }

  void setMessageCount(int count) {
    messageCount = count;
    notifyListeners();
  }

  void clearMessageCount() {
    messageCount = 0;
    notifyListeners();
  }

  StreamSubscription? msgReceive;

  // void listenForChatMessages() async {
  //   if (trip?.userId == null) {
  //     debugPrint("Cannot subscribe: userId is null or empty");
  //     return;
  //   }
  //   final chatTopic = "${AppConstants.recieveMsg}${trip?.userId}";
  //   try {
  //     await mqtt.subscribe(chatTopic);
  //     debugPrint("Subscribed to chat topic: $chatTopic");
  //     await msgRecieve?.cancel();
  //     msgRecieve = mqtt.messageController.stream.listen((onData) {
  //       final topic = onData[AppConstants.topic];
  //
  //       if (topic == chatTopic) {
  //         final rawResponse = onData[AppConstants.response];
  //         incrementMessageCount();
  //         if (rawResponse is String && rawResponse.isNotEmpty) {
  //           try {
  //             final jsonData = jsonDecode(rawResponse);
  //             final senderType = jsonData['senderType'] ?? '';
  //             final senderId = jsonData['senderId'] ?? '';
  //             final receiverId = jsonData['receiverId'] ?? '';
  //             final messageText = jsonData['message'] ?? '';
  //             final timestamp =
  //                 jsonData['timestamp'] ?? jsonData['createdAt'] ?? '';
  //             final messageId = jsonData['messageId'] ??
  //                 jsonData['id'] ??
  //                 jsonData['_id'] ??
  //                 '';
  //
  //             String uniqueId = messageId.isNotEmpty
  //                 ? messageId
  //                 : "${senderId}_${messageText}_${timestamp}";
  //           } catch (e) {
  //             debugPrint("❌ Failed to parse chat message: $e");
  //             debugPrint("❌ Raw data that failed: $rawResponse");
  //           }
  //         }
  //       }
  //     });
  //   } catch (e) {}
  // }

  void listenForChatMessages() async {
    print(" Setting up MQTT listener for driver...");

    if (trip?.userId == null) {
      debugPrint(" Cannot subscribe: driverId is null or empty");
      return;
    }
    // FIXED: Driver should listen to their own topic for incoming messages
    final chatTopic = "${AppConstants.recieveMsg}${trip?.userId}";
    debugPrint("Driver subscribing to topic: $chatTopic");
    try {
      await mqtt.subscribe(chatTopic);
      debugPrint(" Successfully subscribed to chat topic: $chatTopic");
      incrementMessageCount();
      await msgReceive?.cancel();
      msgReceive = mqtt.messageController.stream.listen(
        (onData) {
          print("Driver received MQTT data: $onData");
          final topic = onData[AppConstants.topic];
          print(" Message received on topic: $topic");
          if (topic == chatTopic) {
            print(" Topic matches driver's chat topic!");
            final rawResponse = onData[AppConstants.response];
            print("Raw response: $rawResponse");
          } else {
            debugPrint("ℹ Message for different topic ignored: $topic");
          }
        },
        onError: (error) {
          debugPrint(" MQTT stream error: $error");
        },
        onDone: () {
          debugPrint("ℹ MQTT stream closed");
        },
      );
    } catch (e) {
      print(" Error setting up MQTT listener: $e");
    }
  }

  LatLng _lerpLatLng(LatLng a, LatLng b, double t) {
    return LatLng(
      a.latitude + (b.latitude - a.latitude) * t,
      a.longitude + (b.longitude - a.longitude) * t,
    );
  }

  double _lerpDouble(double a, double b, double t) {
    double diff = ((b - a + 540) % 360) - 180;
    return (a + diff * t + 360) % 360;
  }

  Future<void> _animateDriverMarker(
    LatLng from,
    LatLng to,
    double fromBearing,
    double toBearing,
  ) async {
    _markerAnimationTimer?.cancel();

    final double distance = _calculateDistance(
      from.latitude,
      from.longitude,
      to.latitude,
      to.longitude,
    );

    final double clampedDistance = distance.clamp(0.0, 25.0).toDouble();
    final double durationSeconds = clampedDistance / _visualSpeedMps;
    final int durationMs =
        (durationSeconds * 1000).clamp(400.0, 3000.0).toInt();

    final int steps = max(1, durationMs ~/ _frameMs);
    final imageConfig = driverMarkerConfig;

    int step = 0;

    _markerAnimationTimer =
        Timer.periodic(Duration(milliseconds: _frameMs), (timer) async {
      step++;
      final t = (step / steps).clamp(0.0, 1.0);

      final LatLng interpolated = _lerpLatLng(from, to, t);

      final LatLng snapped = _projectPointOnPolyline(interpolated);

      final double animatedBearing = _lerpDouble(fromBearing, toBearing, t);

      markers
          .removeWhere((m) => m.markerId.value == MakerIds.driverMarker.name);

      markers.add(
        Marker(
          markerId: MarkerId(MakerIds.driverMarker.name),
          position: snapped,
          rotation: animatedBearing,
          flat: true,
          anchor: const Offset(0.5, 0.5),
          icon: await BitmapDescriptor.asset(
            imageConfig,
            Utils.getVehicleImageName(
              requestInProModel?.driver?.vehicleName ??
                  trip?.vehicleDetails?.vehicleName,
            ),
          ),
        ),
      );

      notifyListeners();

      if (t >= 1.0) {
        timer.cancel();

        _lastAnimatedLocation = snapped;

        final double roadBearing = _getPolylineForwardBearing(snapped);
        _lastAnimatedBearing = roadBearing;

        markers
            .removeWhere((m) => m.markerId.value == MakerIds.driverMarker.name);

        markers.add(
          Marker(
            markerId: MarkerId(MakerIds.driverMarker.name),
            position: snapped,
            rotation: roadBearing,
            flat: true,
            anchor: const Offset(0.5, 0.5),
            icon: await BitmapDescriptor.asset(
              imageConfig,
              Utils.getVehicleImageName(
                requestInProModel?.driver?.vehicleName ??
                    trip?.vehicleDetails?.vehicleName,
              ),
            ),
          ),
        );

        notifyListeners();
      }
    });
  }

  String pickupLocation = "";
  String dropLocation = "";
  String currentAddress = "";
  bool isSubmitted = false;
  LatLng currentLocation = const LatLng(0, 0);
  final CameraPosition initialLocation = const CameraPosition(
    target: LatLng(0, 0),
    zoom: 18,
    tilt: 0,
    bearing: 0,
  );

  List<LatLng> polylineCoordinates = [];
  Map<PolylineId, Polyline> polylines = {};
  List<CancelReasonModel>? cancelReasonList = [];
  int arriveWaitingTime = 0;
  int startWaitingTime = 0;
  int waitingTime = 0;
  double distanceTravelled = 0;
  bool _isPolylineLoading = false;
  Timer? _polylineRefreshTimer;
  final Duration _polylineRefreshInterval = Duration(seconds: 20);
  Timer? _waitingUiTimer;
  int _lastServerWaitingTime = 0;
  DateTime? _lastWaitingGrowthAt;
  static const Duration _waitingTickerGrace = Duration(seconds: 18);

  @override
  void notifyListeners() {
    if (!isDisposed) {
      super.notifyListeners();
    }
  }

  void toggleBottomSheet() {
    isBottomSheetCollapsed = !isBottomSheetCollapsed;
    notifyListeners();
  }

  Future<void> force2DView() async {
    if (mapController == null) return;

    await mapController!.animateCamera(
      CameraUpdate.newCameraPosition(
        CameraPosition(
          target: currentLocation,
          zoom: 18,
          tilt: 0,
          bearing: 0,
        ),
      ),
    );
  }

  int getNearestPolylineIndex() {
    if (polylineCoordinates.isEmpty) return -1;

    double minDistance = double.infinity;
    int index = -1;

    for (int i = 0; i < polylineCoordinates.length; i++) {
      final d = _calculateDistance(
        currentLocation.latitude,
        currentLocation.longitude,
        polylineCoordinates[i].latitude,
        polylineCoordinates[i].longitude,
      );

      if (d < minDistance) {
        minDistance = d;
        index = i;
      }
    }

    return index;
  }

  LatLng _projectPointOnPolyline(LatLng point) {
    if (polylineCoordinates.length < 2) return point;

    double minDistance = double.infinity;
    LatLng closestPoint = polylineCoordinates.first;

    for (int i = 0; i < polylineCoordinates.length - 1; i++) {
      final p1 = polylineCoordinates[i];
      final p2 = polylineCoordinates[i + 1];

      final projected = _projectPointOnSegment(point, p1, p2);
      final dist = _calculateDistance(
        point.latitude,
        point.longitude,
        projected.latitude,
        projected.longitude,
      );

      if (dist < minDistance) {
        minDistance = dist;
        closestPoint = projected;
      }
    }
    return closestPoint;
  }

  LatLng _projectPointOnSegment(LatLng p, LatLng a, LatLng b) {
    final dx = b.longitude - a.longitude;
    final dy = b.latitude - a.latitude;

    if (dx == 0 && dy == 0) return a;

    final t =
        ((p.longitude - a.longitude) * dx + (p.latitude - a.latitude) * dy) /
            (dx * dx + dy * dy);

    final clampedT = t.clamp(0.0, 1.0);

    return LatLng(
      a.latitude + dy * clampedT,
      a.longitude + dx * clampedT,
    );
  }

  double _getPolylineForwardBearing(LatLng position) {
    if (polylineCoordinates.length < 2) return _lastAnimatedBearing;

    int index = getNearestPolylineIndex();
    if (index < 0 || index >= polylineCoordinates.length - 1) {
      return _lastAnimatedBearing;
    }

    final nextIndex = min(index + 3, polylineCoordinates.length - 1);

    return bearingBetween(
      polylineCoordinates[index],
      polylineCoordinates[nextIndex],
    );
  }

  double bearingBetween(LatLng from, LatLng to) {
    if (from.latitude == to.latitude && from.longitude == to.longitude) {
      return _lastAnimatedBearing;
    }

    final double lat1 = _toRadians(from.latitude);
    final double lat2 = _toRadians(to.latitude);
    final double dLon = _toRadians(to.longitude - from.longitude);

    final double y = sin(dLon) * cos(lat2);
    final double x = cos(lat1) * sin(lat2) - sin(lat1) * cos(lat2) * cos(dLon);

    final double bearing = (atan2(y, x) * 180 / pi + 360) % 360;

    final double diff = ((bearing - _lastAnimatedBearing + 540) % 360) - 180;

    return (_lastAnimatedBearing + diff + 360) % 360;
  }

  double _bearingFromPolyline(LatLng from, LatLng to) {
    return bearingBetween(from, to);
  }

  String getTurnInstruction() {
    if (tripStatus != TRIPSTATUS.TRIP_STARTED) return "Continue";
    if (polylineCoordinates.length < 6) return "Continue";

    final index = getNearestPolylineIndex();
    if (index < 0) return "Continue";

    final nextIndex = min(index + 5, polylineCoordinates.length - 1);

    final roadBearing = bearingBetween(
      polylineCoordinates[index],
      polylineCoordinates[nextIndex],
    );

    final diff = ((roadBearing - bearing + 540) % 360) - 180;

    if (diff.abs() < 15) return "Go straight";
    if (diff > 15 && diff < 60) return "Slight right";
    if (diff >= 60) return "Turn right";
    if (diff < -15 && diff > -60) return "Slight left";
    if (diff <= -60) return "Turn left";

    return "Continue";
  }

  double getDistanceToNextTurn() {
    if (polylineCoordinates.length < 6) return 0;

    final index = getNearestPolylineIndex();
    if (index < 0) return 0;

    final nextIndex = min(index + 5, polylineCoordinates.length - 1);

    return _calculateDistance(
      currentLocation.latitude,
      currentLocation.longitude,
      polylineCoordinates[nextIndex].latitude,
      polylineCoordinates[nextIndex].longitude,
    );
  }

  void tripStatusChange() {
    if (tripStatus == TRIPSTATUS.TRIP_ACCEPTED) {
      onTripArrived();
      meterImageUrl = null;
    } else if (tripStatus == TRIPSTATUS.TRIP_ARRIVED) {
      if (trip?.tripType?.toUpperCase() == AppConstants.local.toUpperCase()) {
        showTripOtpDialog();
      } else {
        if (meterImageUrl == null) {
          final meterDataMap = <String, dynamic>{};
          meterDataMap[AppConstants.tripStatus] = tripStatus;
          meterDataMap[AppConstants.userId] = trip?.user?.sId;
          meterDataMap[AppConstants.unit] = trip?.unit;
          if (tripStatus == TRIPSTATUS.TRIP_STARTED) {}
          moveAndWait(CustomRouterConfig.meterUploadScreen, args: meterDataMap)
              .then((onValue) {
            if (onValue != null) {
              meterValue = onValue['km'] ?? "0";
              startKm = meterValue;
              meterImageUrl = onValue['files'];
              tripButtonTxt = translation.txtStartTrip;
            } else {
              tripButtonTxt = translation.txtUploadStartMeter;
            }
          });
        } else {
          showTripOtpDialog();
        }
      }
    } else if (tripStatus == TRIPSTATUS.TRIP_STARTED) {
      meterImageUrl = null;
    } else {
      tripStatus = TRIPSTATUS.TRIP_COMPLETED;
    }

    notifyListeners();
  }

  void onCancelled() async {}

  void showTripOtpDialog() async {
    if (navigatorKey.currentState != null) {
      final otp = await showDialog(
          context: navigatorKey.currentState!.context,
          builder: (_) {
            return OtpDialog(
              translation: translation,
            );
          });
      if (otp is String) {
        if (trip?.tripType?.toUpperCase() == "RENTAL") {
          onTripStartFormData(otp);
        } else {
          onTripStart(otp);
        }
      }
    }
    getReqInProgress();
    notifyListeners();
  }

  void changeVisibilityStatus() {
    isTripContentHidden = !isTripContentHidden;
    notifyListeners();
  }

  void handleTempDialog() {
    if (tripStatus == TRIPSTATUS.TRIP_ACCEPTED) {
      showPickupChangeDialog();
    } else if (tripStatus == TRIPSTATUS.TRIP_ARRIVED ||
        tripStatus == TRIPSTATUS.TRIP_STARTED) {}
  }

  void showPickupChangeDialog() {
    if (navigatorKey.currentState != null) {
      showDialog(
          barrierDismissible: false,
          context: navigatorKey.currentState!.context,
          builder: (_) {
            return PickupLocationChangedAlert(translation: translation);
          });
    }
  }

  void getReqInProgress() async {
    final reModel = await apiHelper.get(AppUrls.reqInProgress);
    reModel.fold((e) {
      hideLoader();
      notifyListeners();
      showErrorDialog(errorModel: e);
    }, (r) {
      hideLoader();
      notifyListeners();
      print("jkjhkfjkf");
      final data = parseData(r.data, RequestInProModel.fromJson);
      if (data != null && data.trip != null) {
        trip = data.trip!;
        requestInProModel = data;
        getPolyLines();
        notifyListeners();
        setTripData(notify: true);
        if (trip?.locationChangeModel != null &&
            trip?.locationChangeModel?.toJson() != null) {
          showTripLocationChangedDialog(
              trip?.locationChangeModel?.toJson() ?? {});
        }
      }
    });
  }

  void restoreWaitingTimeFromPreferences() {
    final reqId = trip?.sId;
    if (reqId == null || reqId.isEmpty) return;
    final storedId = preference.getString(PreferenceHelper.tripWaitingReqId);
    if (storedId == reqId) {
      arriveWaitingTime =
          preference.getInt(PreferenceHelper.tripWaitingArriveSec) ?? 0;
      startWaitingTime =
          preference.getInt(PreferenceHelper.tripWaitingStartSec) ?? 0;
    } else {
      arriveWaitingTime = 0;
      startWaitingTime = 0;
    }
    waitingTime = arriveWaitingTime + startWaitingTime;
    _lastServerWaitingTime = waitingTime;
  }

  void _persistWaitingTimeToPreferences() {
    final reqId = trip?.sId;
    if (reqId == null || reqId.isEmpty) return;
    preference.setString(PreferenceHelper.tripWaitingReqId, reqId);
    preference.setInt(PreferenceHelper.tripWaitingArriveSec, arriveWaitingTime);
    preference.setInt(PreferenceHelper.tripWaitingStartSec, startWaitingTime);
  }

  void receiveLocationUpdates(Object data) async {
    if (isDisposed || data is! Map<String, dynamic>) return;

    bool shouldNotify = false;

    if (data.containsKey(AppConstants.arriveWaitingTime)) {
      arriveWaitingTime =
          int.tryParse("${data[AppConstants.arriveWaitingTime]}") ??
              arriveWaitingTime;
      shouldNotify = true;
    }
    if (data.containsKey(AppConstants.startWaitingTime)) {
      startWaitingTime =
          int.tryParse("${data[AppConstants.startWaitingTime]}") ??
              startWaitingTime;
      shouldNotify = true;
    }
    if (data.containsKey(AppConstants.arriveWaitingTime) ||
        data.containsKey(AppConstants.startWaitingTime)) {
      _persistWaitingTimeToPreferences();
    }
    final calculatedWaitingTime = arriveWaitingTime + startWaitingTime;
    if (calculatedWaitingTime > _lastServerWaitingTime) {
      _lastWaitingGrowthAt = DateTime.now();
    }
    _lastServerWaitingTime = calculatedWaitingTime;
    if (waitingTime != calculatedWaitingTime) {
      waitingTime = calculatedWaitingTime;
      _startWaitingUiTicker();
      shouldNotify = true;
    }

    if (data.containsKey(AppConstants.latitude) &&
        data.containsKey(AppConstants.longitude)) {
      final lat = double.tryParse(data[AppConstants.latitude].toString());
      final lng = double.tryParse(data[AppConstants.longitude].toString());

      if (lat != null && lng != null) {
        final rawLocation = LatLng(lat, lng);

        final snappedFrom =
            _projectPointOnPolyline(_lastAnimatedLocation ?? currentLocation);
        final snappedTo = _projectPointOnPolyline(rawLocation);

        final roadBearing = _bearingFromPolyline(snappedFrom, snappedTo);

        currentLocation = rawLocation;
        bearing = roadBearing;

        await _animateDriverMarker(
          snappedFrom,
          snappedTo,
          _lastAnimatedBearing,
          roadBearing,
        );

        if (isAutoRecenterEnabled && _shouldRecenterCamera()) {
          _lastCameraMoveTime = DateTime.now();
          _recenterCamera();
        }

        if (trip?.isDriverStarted == true && _shouldReroute()) {
          _lastRerouteTime = DateTime.now();
          getPolyLines();
        }

        shouldNotify = true;
      }
    }

    if (data.containsKey(AppConstants.distance)) {
      final newDistance =
          double.tryParse(data[AppConstants.distance].toString()) ??
              distanceTravelled;

      if (newDistance != distanceTravelled) {
        distanceTravelled = newDistance;
        shouldNotify = true;
      }
    }

    if (shouldNotify) notifyListeners();
  }

  bool _canRunWaitingTicker() {
    return tripStatus == TRIPSTATUS.TRIP_ARRIVED ||
        tripStatus == TRIPSTATUS.TRIP_STARTED;
  }

  bool _isWaitingActivelyGrowing() {
    if (_lastWaitingGrowthAt == null) return false;
    return DateTime.now().difference(_lastWaitingGrowthAt!) <=
        _waitingTickerGrace;
  }

  void _startWaitingUiTicker() {
    _waitingUiTimer?.cancel();
    if (!_canRunWaitingTicker() || !_isWaitingActivelyGrowing()) return;
    _waitingUiTimer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (!_canRunWaitingTicker() || !_isWaitingActivelyGrowing()) {
        _waitingUiTimer?.cancel();
        _waitingUiTimer = null;
        return;
      }
      waitingTime += 1;
      if (tripStatus == TRIPSTATUS.TRIP_ARRIVED) {
        arriveWaitingTime += 1;
      } else if (tripStatus == TRIPSTATUS.TRIP_STARTED) {
        startWaitingTime += 1;
      }
      _persistWaitingTimeToPreferences();
      notifyListeners();
    });
  }

  bool _shouldRecenterCamera() {
    if (_lastCameraMoveTime == null) return true;

    return DateTime.now().difference(_lastCameraMoveTime!).inSeconds >=
        _cameraCooldownSeconds;
  }

  void _recenterCamera() {
    if (mapController == null) return;

    mapController!.animateCamera(
      CameraUpdate.newCameraPosition(
        CameraPosition(
          target: currentLocation,
          zoom: 18,
          tilt: 0,
          bearing: 0,
        ),
      ),
    );
  }

  void collapseBottomSheetAndRecenter() {
    isBottomSheetCollapsed = true;
    isAutoRecenterEnabled = true;
    recenterNow();
    notifyListeners();
  }

  void recenterNow() {
    isAutoRecenterEnabled = true;
    _lastCameraMoveTime = DateTime.now();
    _recenterCamera();
    notifyListeners();
  }

  bool _shouldReroute() {
    if (polylineCoordinates.isEmpty) return true;

    if (_lastRerouteTime != null &&
        DateTime.now().difference(_lastRerouteTime!).inSeconds <
            _rerouteCooldownSeconds) {
      return false;
    }

    double minDistance = double.infinity;
    int closestPointIndex = -1;

    for (int i = 0; i < polylineCoordinates.length; i++) {
      final distance = _calculateDistance(
        currentLocation.latitude,
        currentLocation.longitude,
        polylineCoordinates[i].latitude,
        polylineCoordinates[i].longitude,
      );

      if (distance < minDistance) {
        minDistance = distance;
        closestPointIndex = i;
      }
    }

    if (minDistance > _rerouteDistanceThreshold) {
      debugPrint(
          "Rerouting: Driver is ${minDistance.toStringAsFixed(1)}m away from route");
      return true;
    }

    if (closestPointIndex >= 0 &&
        closestPointIndex < polylineCoordinates.length - 5) {
      final futurePointIndex =
          min(closestPointIndex + 5, polylineCoordinates.length - 1);
      final futurePoint = polylineCoordinates[futurePointIndex];

      final distanceToFuturePoint = _calculateDistance(
        currentLocation.latitude,
        currentLocation.longitude,
        futurePoint.latitude,
        futurePoint.longitude,
      );

      if (distanceToFuturePoint > minDistance * 3) {
        debugPrint("Rerouting: Driver appears to be moving away from route");
        return true;
      }
    }

    return false;
  }

  void onMapCreated(GoogleMapController controller) async {
    mapController = controller;
    await force2DView();
    setMarkers();
  }

  void getPolyLines() async {
    if (_isPolylineLoading) return;
    _isPolylineLoading = true;

    try {
      final polyDataMap = <String, dynamic>{};
      final newCoordinates = <LatLng>[];

      if (trip?.isDriverStarted != true ||
          trip?.pickLat == 0.0 ||
          trip?.pickLng == 0.0) {
        return;
      }

      if (trip?.isDriverArrived == false) {
        polyDataMap["pickLat"] = currentLocation.latitude;
        polyDataMap["pickLng"] = currentLocation.longitude;
        polyDataMap["dropLat"] = trip?.pickLat;
        polyDataMap["dropLng"] = trip?.pickLng;
      } else if (trip?.isTripStart == true &&
          trip?.dropLat != null &&
          trip?.dropLng != null) {
        polyDataMap["pickLat"] = currentLocation.latitude;
        polyDataMap["pickLng"] = currentLocation.longitude;
        polyDataMap["dropLat"] = trip?.dropLat;
        polyDataMap["dropLng"] = trip?.dropLng;

        if (trip?.stopLat != null && trip?.stopLng != null) {
          polyDataMap["stopLat"] = trip?.stopLat;
          polyDataMap["stopLng"] = trip?.stopLng;
        }
      } else {
        return;
      }

      final response = await apiHelper.post(
        AppUrls.allConvertPolygoLine,
        params: polyDataMap,
      );

      response.fold((e) {
        showErrorDialog(errorModel: e);
      }, (r) {
        final res = parseData(r.data, RoutePolylineModel.fromJson);

        if (res == null || res.routes == null || res.routes!.isEmpty) return;

        final route = res.routes!.first;

        routeDistance = route.distance;
        routeDuration = route.duration;

        newCoordinates.addAll(
          route.decodedPath!.map((p) => LatLng(p[0], p[1])).toList(),
        );

        if (!_areCoordinatesEqual(polylineCoordinates, newCoordinates)) {
          polylineCoordinates
            ..clear()
            ..addAll(newCoordinates);

          _addPolyLine();
          notifyListeners();
        }
      });
    } finally {
      _isPolylineLoading = false;
    }
  }

  bool _areCoordinatesEqual(List<LatLng> a, List<LatLng> b) {
    if (a.length != b.length) return false;

    for (int i = 0; i < a.length; i++) {
      if ((a[i].latitude - b[i].latitude).abs() > 0.00001 ||
          (a[i].longitude - b[i].longitude).abs() > 0.00001) {
        return false;
      }
    }
    return true;
  }

  void _addPolyLine() {
    final id = const PolylineId("route");

    polylines.clear();
    polylines[id] = Polyline(
      polylineId: id,
      color: CustomColors.primaryColor,
      width: 5,
      points: polylineCoordinates,
      startCap: Cap.roundCap,
      endCap: Cap.roundCap,
    );
  }

  String get routeDistanceText {
    if (routeDistance == null) return "--";
    return routeDistance!.toStringAsFixed(1);
  }

  String get routeDurationText {
    if (routeDuration == null) return "--";

    if (routeDuration! >= 60) {
      return "${(routeDuration! / 60).toStringAsFixed(1)} ${translation.txt_hour}";
    }
    return "${routeDuration!.toStringAsFixed(0)} ${translation.txt_minute}";
  }

  double _calculateDistance(
      double lat1, double lon1, double lat2, double lon2) {
    const earthRadius = 6371000.0;
    final dLat = _toRadians(lat2 - lat1);
    final dLon = _toRadians(lon2 - lon1);

    final a = sin(dLat / 2) * sin(dLat / 2) +
        cos(_toRadians(lat1)) *
            cos(_toRadians(lat2)) *
            sin(dLon / 2) *
            sin(dLon / 2);

    final c = 2 * atan2(sqrt(a), sqrt(1 - a));
    return earthRadius * c;
  }

  double _toRadians(double degrees) {
    return degrees * pi / 180;
  }

  bool areCoordinatesEqual(List<LatLng> a, List<LatLng> b) {
    if (a.length != b.length) return false;
    for (int i = 0; i < a.length; i++) {
      if (a[i].latitude != b[i].latitude || a[i].longitude != b[i].longitude) {
        return false;
      }
    }
    return true;
  }

  void addPolyLine() {
    PolylineId id = const PolylineId("poly");
    Polyline polyline = Polyline(
      polylineId: id,
      color: Colors.black,
      points: polylineCoordinates,
      width: 3,
    );
    polylines.clear();
    polylines[id] = polyline;
    notifyListeners();
  }

  void setMarkers() async {
    markers.clear();
    const imageConfiguration = ImageConfiguration(size: Size(60, 60));
    const pickupImageConfig = ImageConfiguration(size: Size(60, 60));
    final pickUpLatLng = LatLng(trip?.pickLat ?? 0, trip?.pickLng ?? 0);
    final m1 = Marker(
        markerId: MarkerId(MakerIds.driverMarker.name),
        position: currentLocation,
        icon: await BitmapDescriptor.asset(
            imageConfiguration,
            Utils.getVehicleImageName(requestInProModel?.driver?.vehicleName ??
                trip?.vehicleDetails?.vehicleName)),
        rotation: 0);
    final m2 = Marker(
        markerId: MarkerId(MakerIds.pickupLocation.name),
        position: pickUpLatLng,
        anchor: const Offset(0.5, 0.7),
        icon: await BitmapDescriptor.asset(
            pickupImageConfig, CustomImages.pickupLocationMarker));
    if (trip?.isTripStart == true &&
        trip?.tripType?.toUpperCase() == AppConstants.local.toUpperCase()) {
      final dropLatLng = LatLng(trip?.dropLat ?? 0, trip?.dropLng ?? 0);
      final m3 = Marker(
          markerId: MarkerId(MakerIds.dropLocation.name),
          position: dropLatLng,
          anchor: const Offset(0.5, 0.7),
          icon: await BitmapDescriptor.asset(
              pickupImageConfig, CustomImages.dropLocationMarker));
      markers.addAll([m1, m2, m3]);
      if (trip?.stopLat != null && trip?.stopLng != null) {
        final stopLatLng = LatLng(trip?.stopLat ?? 0, trip?.stopLng ?? 0);
        final m4 = Marker(
            markerId: MarkerId(MakerIds.stopLocation.name),
            position: stopLatLng,
            anchor: const Offset(0.5, 0.7),
            icon: await BitmapDescriptor.asset(
                pickupImageConfig, CustomImages.stopLocationMarker));
        markers.add(m4);
        mapController?.animateCamera(CameraUpdate.newLatLngBounds(
            computeBounds(
                [currentLocation, pickUpLatLng, dropLatLng, stopLatLng]),
            100));
      } else {
        mapController?.animateCamera(CameraUpdate.newLatLngBounds(
            computeBounds([currentLocation, pickUpLatLng, dropLatLng]), 100));
      }
    } else {
      markers.addAll([m1, m2]);
      mapController?.animateCamera(CameraUpdate.newLatLngBounds(
          computeBounds([currentLocation, pickUpLatLng]), 100));
    }

    notifyListeners();
  }

  void setInitialLocation() async {
    currentLocation =
        LatLng(getSavedLocation().latitude, getSavedLocation().longitude);
    currentAddress = await getAddressFromLatLng(currentLocation);
    CameraPosition(bearing: 0, target: currentLocation, tilt: 0, zoom: 18);
    setTripData();
    if (trip?.locationChangeModel != null &&
        trip?.locationChangeModel?.toJson() != null) {
      showTripLocationChangedDialog(trip?.locationChangeModel?.toJson() ?? {});
    }
  }

  void setTripData({bool notify = false}) {
    restoreWaitingTimeFromPreferences();
    if (trip != null) {
      FlutterForegroundTask.sendDataToTask(
          {"trip": jsonEncode(trip?.toJson())});
    }
    if (trip?.isDriverStarted == true) {
      if (trip?.isDriverArrived == true && trip?.isTripStart == false) {
        tripStatus = TRIPSTATUS.TRIP_ARRIVED;
        if (trip?.tripType?.toUpperCase() == "RENTAL" &&
            meterImageUrl == null) {
          tripButtonTxt = translation.txtUploadStartMeter;
        } else {
          tripButtonTxt = translation.txtStartTrip;
        }

        translation.txtStartTrip;
      } else if (trip?.isDriverArrived == true && trip?.isTripStart == true) {
        tripStatus = TRIPSTATUS.TRIP_STARTED;
      } else {
        tripStatus = TRIPSTATUS.TRIP_ACCEPTED;
        tripButtonTxt = translation.txt_Arrived;
        //translation.txt_Arrived;
      }
      if (notify) notifyListeners();
    }
  }

  void onTripArrived() async {
    showLoader();
    final map = {
      AppConstants.requestId: trip?.sId,
      AppConstants.latitude: getSavedLocation().latitude,
      AppConstants.longitude: getSavedLocation().longitude
    };
    final response = await apiHelper.post(AppUrls.tripArrived, params: map);

    hideLoader();
    response.fold((e) => showErrorDialog(errorModel: e), (r) {
      final data = parseData(r.data, TripModel.fromJson);

      if (data != null) {
        trip = data;
        if (trip != null) {
          FlutterForegroundTask.sendDataToTask(
              {"trip": jsonEncode(trip?.toJson())});
        }
        if (data.isDriverArrived == true) {
          final data = parseData(r.data, TripModel.fromJson);

          tripStatus = TRIPSTATUS.TRIP_ARRIVED;
          if (trip?.tripType?.toUpperCase() == "RENTAL" &&
              meterImageUrl == null) {
            tripButtonTxt = translation.txtUploadStartMeter;
          } else {
            tripButtonTxt = translation.txtStartTrip;
          }
          getReqInProgress();
          notifyListeners();
        }
      }
    });
  }

  String _normalize(String? value) =>
      value?.trim().toLowerCase().replaceAll(RegExp(r'\s+'), ' ') ?? '';

  Future<void> getCancelReasonList() async {
    final map = {"zoneId": preference.getString(PreferenceHelper.primaryZone)};
    final response =
        await apiHelper.post(AppUrls.cancellationReason, params: map);
    response.fold((e) {
      showErrorDialog(errorModel: e);
    }, (r) {
      if (r.data != null) {
        var jsonString = jsonDecode(json.encode(r.data));
        final allReasons = List<CancelReasonModel>.from(
            jsonString.map((model) => CancelReasonModel.fromJson(model)));

        cancelReasonList = allReasons.where((reason) {
          final status = _normalize(reason.tripStatus);
          if (tripStatus == TRIPSTATUS.TRIP_ACCEPTED) {
            return status.contains('before');
          } else if (tripStatus == TRIPSTATUS.TRIP_ARRIVED) {
            return status.contains('after');
          }
          return true; // fallback
        }).toList();
        notifyListeners();
      }
    });
  }

  void showTripCancelRequestList() async {
    if (navigatorKey.currentState != null) {
      await getCancelReasonList();
      final reason = await showModalBottomSheet(
          context: navigatorKey.currentState!.context,
          backgroundColor: Colors.white,
          isDismissible: true,
          isScrollControlled: true,
          enableDrag: true,
          shape: const RoundedRectangleBorder(
              borderRadius: BorderRadius.only(
                  topLeft: Radius.circular(Dimensions.padding_20),
                  topRight: Radius.circular(Dimensions.padding_20))),
          builder: (context) {
            return Padding(
              padding: EdgeInsets.only(
                bottom: MediaQuery.of(context).viewInsets.bottom,
              ),
              child: TripCancelBottomSheet(vm: this),
            );
          });
      isBottomSheetOpen = false;
      if (reason is CancelReasonModel) {
        onTripCancel(reason);
      }
    }
  }

  void onTripCancel(CancelReasonModel model) async {
    showLoader();
    final map = <String, dynamic>{
      AppConstants.requestId: trip?.sId,
      AppConstants.latitude: getSavedLocation().latitude,
      AppConstants.longitude: getSavedLocation().longitude,
      AppConstants.reasonId: model.id,
      AppConstants.role: "Driver",
      AppConstants.reason: model.reason ?? "",
    };
    final response = await apiHelper.post(AppUrls.tripCancel, params: map);
    hideLoader();
    response.fold((e) => showErrorDialog(errorModel: e), (r) {
      popAndMove(CustomRouterConfig.mapScreen);
      notifyListeners();
    });
  }

  Future<void> onTripStart(String otp) async {
    showLoader();
    final map = {
      AppConstants.requestId: trip?.sId ?? "",
      AppConstants.otp: otp,
      AppConstants.latitude: getSavedLocation().latitude,
      AppConstants.longitude: getSavedLocation().longitude
    };
    final response = await apiHelper.post(AppUrls.tripStart, params: map);
    hideLoader();
    response.fold((e) => showErrorDialog(errorModel: e), (r) {
      final tripData = parseData(r.data, TripModel.fromJson);
      if (tripData != null) {
        trip = tripData;
        if (trip != null) {
          FlutterForegroundTask.sendDataToTask(
              {"trip": jsonEncode(trip?.toJson())});
        }
        getPolyLines();
        setMarkers();
        tripStatus = TRIPSTATUS.TRIP_STARTED;
        isBottomSheetCollapsed = true;
        isAutoRecenterEnabled = true;
        recenterNow();
        notifyListeners();
      }
    });
  }

  Future<void> onTripStartFormData(String otp) async {
    showLoader();
    notifyListeners();

    try {
      final map = {
        AppConstants.requestId: trip?.sId ?? "",
        AppConstants.otp: otp,
        AppConstants.latitude: getSavedLocation().latitude,
        AppConstants.longitude: getSavedLocation().longitude,
        AppConstants.startKM: meterValue,
        AppConstants.startKmImage: meterImageUrl,
      };
      final response = await apiHelper.post(AppUrls.tripStart, params: map);
      hideLoader();
      notifyListeners();
      response.fold((e) => showErrorDialog(errorModel: e), (r) {
        final tripData = parseData(r.data, TripModel.fromJson);
        if (tripData != null) {
          // startPolylineRefreshTimer();
          getPolyLines();
          meterImageUrl = null;
          meterValue = "";
          startKm = tripData.startKm;
          trip = tripData;
          if (trip != null) {
            FlutterForegroundTask.sendDataToTask(
                {"trip": jsonEncode(trip?.toJson())});
          }
          getPolyLines();
          setMarkers();
          tripStatus = TRIPSTATUS.TRIP_STARTED;
          notifyListeners();
        }
      });
    } catch (e) {
      showErrorDialog();
    } finally {
      isLoading.value = false;
      hideLoader();
      notifyListeners();
    }
  }

  int _toMinutes(int seconds) => (seconds / 60).round();

  void onEndTrip() async {
    showLoader();
    currentAddress = await getAddressFromLatLng(currentLocation);

    final map = {
      AppConstants.requestId: trip?.sId ?? "",
      AppConstants.dropLat: getSavedLocation().latitude,
      AppConstants.dropLng: getSavedLocation().longitude,
      AppConstants.dropAddress: currentAddress,
      AppConstants.pickLat: trip?.pickLat,
      AppConstants.pickLng: trip?.pickLng,
      AppConstants.pickAddress: trip?.pickAddress,
      AppConstants.rideType: trip?.rideType,
      AppConstants.vehicleId: requestInProModel?.driver?.vehicleId,
      AppConstants.distance: distanceTravelled,
      AppConstants.beforeWaitingTime: _toMinutes(arriveWaitingTime),
      AppConstants.afterWaitingTime: _toMinutes(startWaitingTime),
      AppConstants.tripType: trip?.tripType,
    };
    debugPrint("onEndTrip   $map");
    final response = await apiHelper.post(AppUrls.tripEnd, params: map);
    hideLoader();
    response.fold((e) => showErrorDialog(errorModel: e), (r) {
      final endTripData = parseData(r.data, TripModel.fromJson);
      if (endTripData != null && endTripData.billingDetails != null) {
        endTripData.isHistory = false;
        popAndMove(CustomRouterConfig.invoiceScreen, args: endTripData);
      }
    });
  }

  void onEndTripFormData() async {
    showLoader();
    notifyListeners();
    try {
      currentAddress = await getAddressFromLatLng(currentLocation);
      final map = <String, dynamic>{
        AppConstants.requestId: trip?.sId ?? "",
        AppConstants.dropLat: getSavedLocation().latitude,
        AppConstants.dropLng: getSavedLocation().longitude,
        AppConstants.dropAddress: currentAddress,
        AppConstants.pickLat: trip?.pickLat,
        AppConstants.pickLng: trip?.pickLng,
        AppConstants.pickAddress: trip?.pickAddress,
        AppConstants.rideType: trip?.rideType,
        AppConstants.vehicleId: requestInProModel?.driver?.vehicleId,
        AppConstants.distance:
            trip?.unit?.toUpperCase() != AppConstants.km.toUpperCase()
                ? Utils.convertMilesToKilometers(distanceTravelled)
                : distanceTravelled,
        AppConstants.beforeWaitingTime: _toMinutes(arriveWaitingTime),
        AppConstants.afterWaitingTime: _toMinutes(startWaitingTime),
        AppConstants.tripType: trip?.tripType,
        AppConstants.endKM: meterValue,
        AppConstants.endKmImage: meterImageUrl
      };
      final response = await apiHelper.post(AppUrls.tripEnd, params: map);
      hideLoader();
      notifyListeners();
      response.fold((e) => showErrorDialog(errorModel: e), (r) {
        final endTripData = parseData(r.data, TripModel.fromJson);

        if (endTripData != null && endTripData.billingDetails != null) {
          meterImageUrl = null;
          meterValue = "";
          endTripData.isHistory = false;
          print("fpegrege${endTripData.billingDetails}");
          popAndMove(CustomRouterConfig.invoiceScreen, args: endTripData);
        }
      });
    } catch (e) {
      showErrorDialog();
    } finally {
      isLoading.value = false;
      hideLoader();
      notifyListeners();
    }
  }

  Future<String?> uploadMeter(FormData formData) async {
    final response =
        await apiHelper.post(AppUrls.uploadTripMeter, params: formData);
    String? imageUrl;
    response.fold((e) => showErrorDialog(errorModel: e), (r) {
      if (r.data['imagename'] is String) {
        imageUrl = "${r.data['imagename']}";
      }
    });
    return imageUrl;
  }

  bool isValidEndTripMeterValue(String endMeter, double? startMeter) {
    double? endKm = double.tryParse(endMeter);
    return endKm != null && startMeter != null ? endKm >= startMeter : false;
  }

  void listenForTripChanges() {
    _tripChangesSubscription?.cancel();
    _tripChangesSubscription = mqtt.messageController.stream.listen((onData) {
      debugPrint("DisposeTripVM ${trip?.requestNumber}");
      try {
        final response = onData[AppConstants.response];
        String jsonString;
        if (response is String) {
          jsonString = response;
        } else {
          jsonString = jsonEncode(response);
        }
        final Map<String, dynamic> jsonData = jsonDecode(jsonString);
        final title = jsonData[AppConstants.title];
        if (title.toString().toUpperCase() == "LOCATION CHANGE") {
          final message = jsonData[AppConstants.message];
          final messageData =
          message is String ? jsonDecode(message) : message;
          showTripLocationChangedDialog(messageData);
        } else if (title.toString().toUpperCase() == "TRIP_CANCELLED") {
          if (jsonData[AppConstants.message] != null) {
            showErrorDialog(
              canDismiss: false,
              message: jsonData[AppConstants.message].toString(),
              onClick: () {
                popAndMove(CustomRouterConfig.mapScreen);
                Navigator.of(navigatorKey.currentState!.context).pop();
              },
            );
          } else {
            getReqInProgress();
          }
        } else if (title.toString().toUpperCase() == "TRIP_COMPLETED") {
          trip = TripModel.fromJson(jsonData['trip']);
          popAndMove(CustomRouterConfig.invoiceScreen, args: trip);
        }
      } catch (e) {
        debugPrint("listenForTripChanges catch  $e");
        getReqInProgress();
      }
    });
  }

  // void listenForTripChanges() {
  //   _tripChangesSubscription?.cancel();
  //
  //   _tripChangesSubscription =
  //       mqtt.messageController.stream.listen((onData) {
  //         debugPrint("🔵 RAW MQTT DATA => $onData");
  //
  //         try {
  //           final rawResponse = onData[AppConstants.response];
  //
  //           debugPrint("RAW RESPONSE => $rawResponse");
  //
  //           List<int> bytes = latin1.encode(
  //             rawResponse is String ? rawResponse : jsonEncode(rawResponse),
  //           );
  //
  //           String fixedJsonString = utf8.decode(bytes);
  //
  //           debugPrint("FIXED JSON STRING => $fixedJsonString");
  //
  //           final Map<String, dynamic> jsonData =
  //           jsonDecode(fixedJsonString);
  //
  //           debugPrint(" FINAL JSON DATA => $jsonData");
  //
  //           final title = jsonData[AppConstants.title];
  //
  //           debugPrint("🟥 TITLE => $title");
  //
  //           /// LOCATION CHANGE
  //           if (title.toString().toUpperCase() == "LOCATION CHANGE") {
  //             final messageData = jsonData[AppConstants.message];
  //
  //             debugPrint("LOCATION CHANGE DATA => $messageData");
  //
  //             showTripLocationChangedDialog(
  //               messageData is String ? jsonDecode(messageData) : messageData,
  //             );
  //           }
  //           /// TRIP CANCELLED
  //           else if (title == TRIPSTATUS.TRIP_CANCELLED) {
  //             debugPrint(" TRIP CANCELLED RECEIVED");
  //             debugPrint(" FULL CANCEL DATA => $jsonData");
  //             debugPrint("isBottomSheetOpen => $isBottomSheetOpen");
  //             if (!isBottomSheetOpen) {
  //               debugPrint("OPENING BOTTOM SHEET");
  //               isBottomSheetOpen = true;
  //               showTripCancelRequestList();
  //             } else {
  //               debugPrint("ALREADY OPEN → NAVIGATING");
  //               popAndMove(CustomRouterConfig.mapScreen);
  //             }
  //
  //             notifyListeners();
  //           }
  //         } catch (e) {
  //           debugPrint("ERROR IN MQTT => $e");
  //           getReqInProgress();
  //         }
  //       });
  // }




  void showTripLocationChangedDialog(Map<String, dynamic> map) async {
    if (navigatorKey.currentState != null && trip != null) {
      final tripAddressChange = tripStatus == TRIPSTATUS.TRIP_STARTED
          ? map.containsKey(AppConstants.stop_lat)
              ? TRIPADDRESSCHANGETYPE.STOP_ADDRESS
              : TRIPADDRESSCHANGETYPE.DROP_ADDRESS
          : TRIPADDRESSCHANGETYPE.PICKUP_ADDRESS;
      final data = await showDialog(
          barrierDismissible: false,
          context: navigatorKey.currentState!.context,
          builder: (_) {
            return PopScope(
              canPop: false,
              child: TripAddressChange(
                map: map,
                translationModel: translation,
                tripaddresschangetype: tripAddressChange,
              ),
            );
          });
      debugPrint("showTripLocationChangedDialog  $map");
      if (data is String) {
        final locationMap = <String, dynamic>{};
        locationMap[AppConstants.isAccept] =
            data.toUpperCase() == AppConstants.yes.toUpperCase() ? true : false;
        locationMap[AppConstants.requestId] = trip?.sId;
        if (tripAddressChange == TRIPADDRESSCHANGETYPE.PICKUP_ADDRESS) {
          locationMap["pickLat"] = map[AppConstants.pick_lat];
          locationMap["pickLng"] = map[AppConstants.pick_lng];
          locationMap["pickAddress"] = map[AppConstants.address];
        } else if (tripAddressChange == TRIPADDRESSCHANGETYPE.DROP_ADDRESS) {
          locationMap["dropLat"] = map[AppConstants.drop_lat];
          locationMap["dropLng"] =
              map[AppConstants.drop_lng] ?? map[AppConstants.drop_long];
          locationMap["dropAddress"] = map[AppConstants.address];
        } else if (tripAddressChange == TRIPADDRESSCHANGETYPE.STOP_ADDRESS) {
          locationMap["stopLat"] = map[AppConstants.stop_lat];
          locationMap["stopLng"] = map[AppConstants.stop_lng];
          locationMap["stopAddress"] = map[AppConstants.address];
        }
        final response = await apiHelper.post(AppUrls.tripLocationChanged,
            params: locationMap);
        response.fold((e) => showErrorDialog(errorModel: e), (r) {
          final apiData = parseData(r.data, RequestInProModel.fromJson);
          if (apiData != null && apiData.trip != null) {
            trip = apiData.trip;
            if (trip != null) {
              FlutterForegroundTask.sendDataToTask(
                  {"trip": jsonEncode(trip?.toJson())});
            }
            polylineCoordinates.clear();
            getPolyLines();
            setMarkers();
          }
        });
      }
    }
    notifyListeners();
  }

  void openGoogleMap() {
    if (trip?.tripType?.toUpperCase() == AppConstants.local.toUpperCase()) {
      Utils.openGoogleMap(
        lat: trip!.dropLat ?? 0.0,
        lng: trip!.dropLng ?? 0.0,
        vm: this,
      );
    }
  }

  void startPolylineRefreshTimer() {
    print("fpk[frtg");
    _polylineRefreshTimer?.cancel();
    _polylineRefreshTimer = Timer.periodic(_polylineRefreshInterval, (_) {
      getPolyLines();
    });
  }

  void stopPolylineRefreshTimer() {
    _polylineRefreshTimer?.cancel();
    _polylineRefreshTimer = null;
  }

  @override
  void dispose() {
    _tripChangesSubscription?.cancel();
    _polylineRefreshTimer?.cancel();
    _markerAnimationTimer?.cancel();
    _waitingUiTimer?.cancel();
    isDisposed = true;
    super.dispose();
  }
}

enum TRIPSTATUS {
  TRIP_ACCEPTED,
  TRIP_ARRIVED,
  TRIP_STARTED,
  TRIP_COMPLETED,
  TRIP_CANCELLED,
}

enum TRIPADDRESSCHANGETYPE { PICKUP_ADDRESS, DROP_ADDRESS, STOP_ADDRESS }

enum VEHICLETYPES { SEDAN, SUV, MINI, LUXURY, BIKE, AUTO }
