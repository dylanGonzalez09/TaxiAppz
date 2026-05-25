import 'dart:async';
import 'dart:convert';
import 'dart:math';

import 'package:flutter/material.dart';
import 'package:flutter_polyline_points/flutter_polyline_points.dart';
import 'package:go_router/go_router.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:user/ui/tripscreen/tripcancelbottomsheet/trip_cancel_bottom_sheet.dart';
import 'package:user/utils/custom_colors.dart';
import 'package:user/utils/preference_helper.dart';

import '../../main.dart';
import '../../models/enums.dart';
import '../../network/response_models/cancelReason_model.dart';
import '../../network/response_models/mqtt_driver_model.dart';
import '../../network/response_models/reqin_progress_model.dart';
import '../../network/response_models/trip_model.dart';
import '../../network/response_models/types_model.dart';
import '../../utils/app_constants.dart';
import '../../utils/app_url.dart';
import '../../utils/base_vm.dart';
import '../../utils/custom_images.dart';
import '../../utils/custom_router.dart';
import '../../utils/dimensions.dart';
import '../bottomsheets/cancel_bs/cancel_bs.dart';
import '../bottomsheets/rental_meter/rental_meter.dart';
import '../dialogs/description_dialog.dart';

class TripScreenVm extends BaseVm {
  TRIPSTATUS tripStatus = TRIPSTATUS.TRIP_ACCEPTED;

  bool isDisposed = false;
  bool isTripContentHidden = false;
  int destinationDuration = 0;
  Trip? trip;
  List<ZoneTypePrice> vehicleModelDetails = [];
  GoogleMapController? mapController;
  int arriveDuration = 3;
  final markers = <Marker>{};

  bool showTripRequest = false;

  int arriveWaitingTime = 0;
  int startWaitingTime = 0;
  int waitingTime = 0;

  bool isWaitingTimeSubscribed = false;
  bool isPolyLineDrawn = false;

  List<LatLng> polylineCoordinates = [];
  Map<PolylineId, Polyline> polylines = {};
  PolylinePoints polylinePoints = PolylinePoints();
  List<CancelReasonModel>? cancelReasonList = [];

  CameraPosition initialLocation = const CameraPosition(
      bearing: 192.8334901395799,
      target: LatLng(37.43296265331129, -122.08832357078792),
      tilt: 59.440717697143555,
      zoom: 19.151926040649414);

  bool _isPolylineLoading = false;
  LatLng? driverCurrentLatLng;
  DateTime? _lastDriverFocusAt;
  LatLng? _lastDriverFocusTarget;
  Timer? _waitingUiTimer;
  int _lastServerWaitingTime = 0;
  DateTime? _lastWaitingGrowthAt;
  static const Duration _waitingTickerGrace = Duration(seconds: 18);

  StreamSubscription? tripDriverSubscription;
  StreamSubscription? driverChangesSubscription;
  StreamSubscription? tripSubscription;
  StreamSubscription? waitingTimeSubscription;

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

  StreamSubscription? msgRecieve;

  void listenForChatMessages() async {
    if (trip?.userId == null) {
      debugPrint("Cannot subscribe: userId is null or empty");
      return;
    }
    final chatTopic = "${AppConstants.recieveMsg}${trip?.userId}";
    try {
      await mqtt.subscribe(chatTopic);
      debugPrint("Subscribed to chat topic: $chatTopic");
      await msgRecieve?.cancel();
      msgRecieve = mqtt.messageController.stream.listen((onData) {
        final topic = onData[AppConstants.topic];
        if (topic == chatTopic) {
          final rawResponse = onData[AppConstants.response];
          incrementMessageCount();
          if (rawResponse is String && rawResponse.isNotEmpty) {
            try {
              final jsonData = jsonDecode(rawResponse);
              final senderType = jsonData['senderType'] ?? '';
              final senderId = jsonData['senderId'] ?? '';
              final receiverId = jsonData['receiverId'] ?? '';
              final messageText = jsonData['message'] ?? '';
              final timestamp =
                  jsonData['timestamp'] ?? jsonData['createdAt'] ?? '';
              final messageId = jsonData['messageId'] ??
                  jsonData['id'] ??
                  jsonData['_id'] ??
                  '';

              String uniqueId = messageId.isNotEmpty
                  ? messageId
                  : "${senderId}_${messageText}_${timestamp}";
            } catch (e) {
              debugPrint("❌ Failed to parse chat message: $e");
              debugPrint("❌ Raw data that failed: $rawResponse");
            }
          }
        }
      });
    } catch (e) {}
  }

  @override
  void notifyListeners() {
    if (!isDisposed) {
      super.notifyListeners();
    }
  }

  void clearPolyline() {
    polylines = {};
    polylineCoordinates.clear();
    isPolyLineDrawn = false;
    notifyListeners();
  }

  void changeVisibilityStatus() {
    isTripContentHidden = !isTripContentHidden;
    notifyListeners();
  }

  void setInitialTripData() {
    if (trip?.isDriverStarted == true) {
      if (trip?.isDriverArrived == true && trip?.isTripStart == false) {
        tripStatus = TRIPSTATUS.TRIP_ARRIVED;
        getWaitingTime();
        isPolyLineDrawn = false;
        getPolyLines();
      } else if (trip?.isDriverArrived == true && trip?.isTripStart == true) {
        tripStatus = TRIPSTATUS.TRIP_START;
        getWaitingTime();
        isPolyLineDrawn = false;
        getPolyLines();
      } else if (trip?.isCompleted == true) {
        trip?.isHistory = false;
        tripSubscription?.cancel();
        tripSubscription = null;
        popAndMove(CustomRouter.invoiceScreen, args: trip);
      } else {
        tripStatus = TRIPSTATUS.TRIP_ACCEPTED;
      }
    }
  }

  void onMapCreated(GoogleMapController controller) async {
    mapController = controller;
    setMarkers();
  }

  void setInitialData(Trip? trip) {
    this.trip = trip;
    _lastEventKey = null;
    _lastMeterImage = null;
    isMeterSheetOpen = false;
    isBottomSheetOpen = false;

    initialLocation = CameraPosition(
      bearing: 0,
      target: LatLng(trip?.pickLat ?? 0, trip?.pickLng ?? 0),
      tilt: 0,
      zoom: 18,
    );
    tripSubscription?.cancel();
    tripSubscription = null;
    setInitialTripData();
    listenForTrips();
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
                  bottom: MediaQuery.of(context).viewInsets.bottom),
              child: TripCancelBottomSheet(vm: this),
            );
          });
      if (reason is CancelReasonModel) {
        onTripCancel(reason);
      }
    }
  }

  String _normalize(String? value) =>
      value?.trim().toLowerCase().replaceAll(RegExp(r'\s+'), ' ') ?? '';

  Future<void> getCancelReasonList() async {
    final map = {"zoneId": preference.getString(PreferenceHelper.zoneId)};
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
          return true;
        }).toList();

        notifyListeners();
      }
    });
  }

  void onTripCancel(CancelReasonModel model) async {
    showLoader();
    final map = <String, dynamic>{
      AppConstants.requestId: trip?.sId,
      AppConstants.latitude: getSavedCurrentLocation().latitude,
      AppConstants.longitude: getSavedCurrentLocation().longitude,
      AppConstants.reasonId: model.id,
      AppConstants.role: "User",
      AppConstants.reason: model.reason ?? "",
    };
    final response = await apiHelper.post(AppUrls.tripCancel, params: map);
    hideLoader();
    response.fold(
      (e) => showErrorDialog(errorModel: e),
      (r) {
        tripSubscription?.cancel();
        tripSubscription = null;
        popAndMove(CustomRouter.mapScreen);
        notifyListeners();
      },
    );
  }

  void getTripDriver() async {
    await mqtt.subscribe("${AppConstants.getTripDriver}${getUserId()}");
    final data = {
      AppConstants.driverId: trip!.driverId ?? "",
      AppConstants.userId: getUserId()
    };
    mqtt.publish(AppConstants.postTripDriver, jsonEncode(data));
    final driverMessageSet = <String>{};

    await tripDriverSubscription?.cancel();
    tripDriverSubscription =
        mqtt.messageController.stream.listen((message) async {
      if (message[AppConstants.topic] ==
          "${AppConstants.getTripDriver}${getUserId()}") {
        if (!driverMessageSet.contains(message[AppConstants.response])) {
          driverMessageSet.add(message[AppConstants.response] ?? "");
          mqtt.unSubscribe("${AppConstants.getTripDriver}${getUserId()}");
          final json = jsonDecode(message[AppConstants.response] ?? "");
          final mqttDriverModel = MqttDriverModel.fromJson(json);

          markers.removeWhere(
              (test) => test.markerId.value == MakerIds.driverMarker.name);

          final pickupLatLng = LatLng(trip?.pickLat ?? 0, trip?.pickLng ?? 0);
          const configuration =
              ImageConfiguration(size: Size(17, 32), devicePixelRatio: 2);
          final driverLatLng = LatLng(
              mqttDriverModel.latitude ?? 0, mqttDriverModel.longitude ?? 0);
          driverCurrentLatLng = driverLatLng;

          print("Driver location received: $driverCurrentLatLng");

          final m1 = Marker(
              markerId: MarkerId(MakerIds.driverMarker.name),
              position: driverLatLng,
              icon: await BitmapDescriptor.asset(
                  configuration, CustomImages.driverMarker),
              rotation: 0);
          markers.add(m1);

          final eta = await calculateEta(driverLatLng, pickupLatLng);
          debugPrint("calculateArrivedEta eta $eta");

          if (eta > 3) {
            arriveDuration = eta;
          }

          notifyListeners();
          mapController?.animateCamera(CameraUpdate.newLatLngBounds(
              computeBounds([driverLatLng, pickupLatLng]), 100));
          _focusDriverMarker(driverLatLng, force: true);

          if (tripStatus == TRIPSTATUS.TRIP_ACCEPTED) {
            isPolyLineDrawn = false;
            getPolyLines();
          }

          listenForDriverChanges();
        }
      }
    });
  }

  void listenForDriverChanges() {
    mqtt.subscribe(AppConstants.listenDrivers);

    driverChangesSubscription?.cancel();
    driverChangesSubscription =
        mqtt.messageController.stream.listen((onData) async {
      if (onData[AppConstants.topic] != AppConstants.listenDrivers) return;

      dynamic raw = onData[AppConstants.response];
      if (raw is! Map) {
        try {
          raw = jsonDecode(raw ?? "");
        } catch (_) {
          return;
        }
      }

      final driver = MqttDriverModel.fromJson(raw);

      if (trip?.driverId != driver.driverId) return;

      final driverLatLng = LatLng(
        driver.latitude ?? 0,
        driver.longitude ?? 0,
      );

      driverCurrentLatLng = driverLatLng;

      markers
          .removeWhere((m) => m.markerId.value == MakerIds.driverMarker.name);

      const configuration =
          ImageConfiguration(size: Size(17, 32), devicePixelRatio: 2);

      markers.add(
        Marker(
          markerId: MarkerId(MakerIds.driverMarker.name),
          position: driverLatLng,
          icon: await BitmapDescriptor.asset(
              configuration, CustomImages.driverMarker),
          rotation: driver.bearing ?? 0,
          anchor: const Offset(0.5, 0.5),
        ),
      );
      _focusDriverMarker(driverLatLng);

      if (tripStatus == TRIPSTATUS.TRIP_START) {
        if (polylineCoordinates.isEmpty && !_isPolylineLoading) {
          isPolyLineDrawn = false;
          getPolyLines();
        }
        trimPolylineFromDriverPosition();
        await checkAndRefreshPolyline();
      }

      if (tripStatus == TRIPSTATUS.TRIP_START &&
          trip?.dropLat != null &&
          trip?.dropLng != null) {
        destinationDuration = await calculateEta(
          driverLatLng,
          LatLng(trip!.dropLat!, trip!.dropLng!),
          speed: 40,
        );
      }

      notifyListeners();
    });
  }

  void reqInProgress() async {
    showLoader();
    notifyListeners();
    final response = await apiHelper.get(AppUrls.reqInProgress);
    hideLoader();
    isBottomSheetOpen = false;
    notifyListeners();
    response.fold((e) => showErrorDialog(errorModel: e), (r) {
      final model = parseData(r.data, ReqInProgressModel.fromJson);
      if (model?.trip != null &&
          model?.trip?.isDriverStarted == true &&
          model?.trip?.isTripStart == true &&
          model?.trip?.isCompleted == true) {
        trip = model!.trip!;
        trip?.isHistory = false;
        tripStatus = TRIPSTATUS.TRIP_COMPLETED;
        tripSubscription?.cancel();
        tripSubscription = null;
        popAndMove(CustomRouter.invoiceScreen, args: trip);
      } else if (model?.trip != null && model?.trip?.isDriverStarted == true) {
        tripSubscription?.cancel();
        tripSubscription = null;
        popAndMove(CustomRouter.tripScreen, args: model!.trip!);
      } else {
        isBottomSheetOpen = false;
      }
    });
  }

  final Set<String> lastData = {};
  bool isBottomSheetOpen = false;
  String? _lastEventKey;
  String? _lastMeterImage;

  void listenForTrips() {
    tripSubscription?.cancel();
    tripSubscription = null;

    debugPrint("listenForTrips: setting up fresh subscription");

    tripSubscription = mqtt.messageController.stream
        .where((onData) =>
            onData[AppConstants.topic] ==
            "${AppConstants.userRequest}${getUserId()}")
        .listen((onData) {
      _processMqttMessage(onData);
    });
  }

  void _processMqttMessage(Map<String, dynamic> onData) {
    try {
      final response = onData[AppConstants.response];

      if (response == null || response.isEmpty) {
        reqInProgress();
        return;
      }

      debugPrint("listenForTripsssss $response");

      final Map<String, dynamic> json = jsonDecode(response);
      final title = json["title"];
      final tripId = json['trip']?['_id'] ?? "";
      final eventKey = "$title-$tripId";

      if (_lastEventKey == eventKey) {
        debugPrint("Duplicate event ignored: $eventKey");
        return;
      }
      _lastEventKey = eventKey;

      if (title == TRIPSTATUS.TRIP_ARRIVED.name) {
        trip = Trip.fromJson(json['trip']);
        tripStatus = TRIPSTATUS.TRIP_ARRIVED;
        notifyListeners();
        getWaitingTime();
      } else if (title == TRIPSTATUS.TRIP_START.name) {
        trip = Trip.fromJson(json['trip']);
        tripStatus = TRIPSTATUS.TRIP_START;
        notifyListeners();
        getWaitingTime();
        setMarkers();
        isPolyLineDrawn = false;
        getPolyLines();
      } else if (title == TRIPSTATUS.TRIP_COMPLETED.name) {
        trip = Trip.fromJson(json['trip']);
        trip?.isHistory = false;
        tripSubscription?.cancel();
        tripSubscription = null;
        tripStatus = TRIPSTATUS.TRIP_COMPLETED;
        popAndMove(CustomRouter.invoiceScreen, args: trip);
      } else if (title == TRIPSTATUS.TRIP_CANCELLED.name) {
        if (!isBottomSheetOpen) {
          showCancel();
          isBottomSheetOpen = true;
        } else {
          tripSubscription?.cancel();
          tripSubscription = null;
          popAndMove(CustomRouter.mapScreen);
        }
        notifyListeners();
      } else if (title == TRIPSTATUS.UPLOAD_IMAGE.name) {
        final image = json['image'];
        if (image != null && image == _lastMeterImage) {
          debugPrint("Duplicate meter ignored");
          return;
        }
        _lastMeterImage = image;
        if (image != null) {
          trip?.startKmImage = "$image";
        }
        debugPrint('Meter popup shown');
        if (!isMeterSheetOpen) {
          showMeterUpload(
            json['meter'],
            "${AppConstants.imageBaseUrl}$image",
            tripStatus == TRIPSTATUS.TRIP_START,
          );
        } else {
          print('sicsdsidjidsjsdijd');
        }
      } else if (title.toString().toUpperCase() == "LOCATION CHANGE") {
        debugPrint("listenForTrips $title");
        closeTripChangeDialog();
        if (json[AppConstants.message] != null) {
          showErrorDialog(message: json[AppConstants.message]);
        }
        if (json[AppConstants.trip] != null) {
          trip = Trip.fromJson(json['trip']);
          setMarkers();
          isPolyLineDrawn = false;
          polylineCoordinates.clear();
          getPolyLines();
          notifyListeners();
        } else {
          reqInProgress();
        }
      } else if (title.toString().toUpperCase() == "LOCATION CHANGE DENIED") {
        closeTripChangeDialog();
        if (json[AppConstants.message] != null) {
          showErrorDialog(message: json[AppConstants.message]);
        }
      }
    } catch (e) {
      debugPrint("listenForTrips ERROR: $e");
      reqInProgress();
    }
  }

  void setMarkers() async {
    markers.removeWhere((item) =>
        item.markerId.value == MakerIds.pickupLocation.name ||
        item.markerId.value == MakerIds.dropLocation.name ||
        item.markerId.value == MakerIds.stopLocation.name);

    const pickupImageConfig = ImageConfiguration(size: Size(60, 60));

    final pickUpLatLng = LatLng(trip?.pickLat ?? 0, trip?.pickLng ?? 0);
    final m1 = Marker(
        markerId: MarkerId(MakerIds.pickupLocation.name),
        position: pickUpLatLng,
        anchor: const Offset(0.5, 0.7),
        icon: await BitmapDescriptor.asset(
            pickupImageConfig, CustomImages.currentLocationMarker));

    markers.add(m1);

    if (trip?.isTripStart == true &&
        trip?.tripType?.toUpperCase() == AppConstants.local.toUpperCase()) {
      final dropLocation = LatLng(trip?.dropLat ?? 0, trip?.dropLng ?? 0);
      final m2 = Marker(
          markerId: MarkerId(MakerIds.dropLocation.name),
          position: dropLocation,
          anchor: const Offset(0.5, 0.7),
          icon: await BitmapDescriptor.asset(
              pickupImageConfig, CustomImages.dropMarker));

      markers.add(m2);

      mapController?.animateCamera(CameraUpdate.newLatLngBounds(
          computeBounds([pickUpLatLng, dropLocation]), 100));

      if (trip?.stopLat != null &&
          trip?.stopLat != 0.0 &&
          trip?.stopLng != null &&
          trip?.stopLng != 0.0) {
        final stopLocation = LatLng(trip?.stopLat ?? 0, trip?.stopLng ?? 0);
        final m3 = Marker(
            markerId: MarkerId(MakerIds.stopLocation.name),
            position: stopLocation,
            anchor: const Offset(0.5, 0.7),
            icon: await BitmapDescriptor.asset(
                pickupImageConfig, CustomImages.stopMarker));

        markers.add(m3);

        mapController?.animateCamera(CameraUpdate.newLatLngBounds(
            computeBounds([pickUpLatLng, stopLocation]), 100));
      }
    }

    notifyListeners();
  }

  void showCancel() async {
    if (navigatorKey.currentState != null && !isBottomSheetOpen) {
      await showModalBottomSheet(
        context: navigatorKey.currentState!.context,
        isScrollControlled: true,
        useSafeArea: true,
        backgroundColor: Colors.white,
        builder: (BuildContext context) {
          return const SingleChildScrollView(
            child: CancelBs(),
          );
        },
      );
      tripSubscription?.cancel();
      tripSubscription = null;
      popAndMove(CustomRouter.mapScreen);
    }
  }

  void getWaitingTime() {
    if (!isWaitingTimeSubscribed) {
      isWaitingTimeSubscribed = true;
      mqtt.subscribe("${AppConstants.getTRipWaitingTime}${trip?.sId}");
      final messageSet = <String>{};
      waitingTimeSubscription?.cancel();
      waitingTimeSubscription = mqtt.messageController.stream.listen((onData) {
        if (onData[AppConstants.topic] ==
            "${AppConstants.getTRipWaitingTime}${trip?.sId}") {
          final message = onData[AppConstants.response];

          debugPrint("waiting time checking : $message");

          if (!messageSet.contains(message)) {
            messageSet.clear();
            messageSet.add(message ?? "");
            try {
              Map<String, dynamic> json = jsonDecode(message ?? "");
              if (json.containsKey(AppConstants.beforeArrived) &&
                  json.containsKey(AppConstants.afterArrived)) {
                arriveWaitingTime =
                    int.tryParse("${json[AppConstants.beforeArrived] ?? 0}") ??
                        0;
                startWaitingTime =
                    int.tryParse("${json[AppConstants.afterArrived] ?? 0}") ??
                        0;

                final serverWaiting =
                    arriveWaitingTime.toInt() + startWaitingTime.toInt();
                if (serverWaiting > _lastServerWaitingTime) {
                  _lastWaitingGrowthAt = DateTime.now();
                }
                _lastServerWaitingTime = serverWaiting;
                waitingTime = serverWaiting;
                _startWaitingUiTicker();
                debugPrint("waiting time checking1111111111 : $waitingTime");
                notifyListeners();
              }
            } catch (e) {
              debugPrint("waiting time checking1111111111 ERROR : $e");
            }
          }
        }
      });
    }
  }

  bool _canRunWaitingTicker() {
    return tripStatus == TRIPSTATUS.TRIP_ARRIVED ||
        tripStatus == TRIPSTATUS.TRIP_START;
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
      } else if (tripStatus == TRIPSTATUS.TRIP_START) {
        startWaitingTime += 1;
      }
      notifyListeners();
    });
  }

  void getPolyLines() async {
    if (_isPolylineLoading) return;
    _isPolylineLoading = true;

    try {
      final newCoordinates = <LatLng>[];
      final polyDataMap = <String, dynamic>{};

      if (tripStatus == TRIPSTATUS.TRIP_START) {
        if (trip?.pickLat != null &&
            trip?.pickLng != null &&
            trip?.dropLat != null &&
            trip?.dropLng != null &&
            trip?.pickLat != 0.0 &&
            trip?.pickLng != 0.0 &&
            trip?.dropLat != 0.0 &&
            trip?.dropLng != 0.0) {
          polyDataMap["pickLat"] = trip?.pickLat;
          polyDataMap["pickLng"] = trip?.pickLng;
          polyDataMap["dropLat"] = trip?.dropLat;
          polyDataMap["dropLng"] = trip?.dropLng;

          if (trip?.stopLat != null &&
              trip?.stopLat != 0.0 &&
              trip?.stopLng != null &&
              trip?.stopLng != 0.0) {
            polyDataMap["stopLat"] = trip?.stopLat;
            polyDataMap["stopLng"] = trip?.stopLng;
          }

          print("Drawing TRIP_START polyline from pickup to drop");
        }
      } else if (tripStatus == TRIPSTATUS.TRIP_ARRIVED) {
        if (trip?.pickLat != null &&
            trip?.pickLng != null &&
            trip?.dropLat != null &&
            trip?.dropLng != null &&
            trip?.pickLat != 0.0 &&
            trip?.pickLng != 0.0 &&
            trip?.dropLat != 0.0 &&
            trip?.dropLng != 0.0) {
          polyDataMap["pickLat"] = trip?.pickLat;
          polyDataMap["pickLng"] = trip?.pickLng;
          polyDataMap["dropLat"] = trip?.dropLat;
          polyDataMap["dropLng"] = trip?.dropLng;

          if (trip?.stopLat != null &&
              trip?.stopLat != 0.0 &&
              trip?.stopLng != null &&
              trip?.stopLng != 0.0) {
            polyDataMap["stopLat"] = trip?.stopLat;
            polyDataMap["stopLng"] = trip?.stopLng;
          }

          print("Drawing TRIP_ARRIVED polyline from pickup to drop");
        }
      } else if (tripStatus == TRIPSTATUS.TRIP_ACCEPTED) {
        if (driverCurrentLatLng != null &&
            trip?.pickLat != null &&
            trip?.pickLng != null &&
            trip?.pickLat != 0.0 &&
            trip?.pickLng != 0.0) {
          polyDataMap["pickLat"] = driverCurrentLatLng!.latitude;
          polyDataMap["pickLng"] = driverCurrentLatLng!.longitude;
          polyDataMap["dropLat"] = trip?.pickLat;
          polyDataMap["dropLng"] = trip?.pickLng;

          print("Drawing TRIP_ACCEPTED polyline from driver to pickup");
        }
      }

      if (polyDataMap.isNotEmpty) {
        newCoordinates.addAll(await getPolylineFromRoutes(polyDataMap));

        if (newCoordinates.isNotEmpty) {
          polylineCoordinates.clear();
          polylineCoordinates.addAll(newCoordinates);
          _addPolyLine();
          isPolyLineDrawn = true;
          notifyListeners();
          print(
              "Polyline drawn successfully with ${newCoordinates.length} points");
        } else {
          print("No coordinates received from route API");
        }
      } else {
        print("Insufficient data to draw polyline");
      }
    } catch (e) {
      print("Error in getPolyLines: $e");
    } finally {
      _isPolylineLoading = false;
    }
  }

  Future<void> checkAndRefreshPolyline() async {
    if (tripStatus != TRIPSTATUS.TRIP_START ||
        driverCurrentLatLng == null ||
        polylineCoordinates.isEmpty ||
        _isPolylineLoading) return;

    double minDistance = double.infinity;

    for (final p in polylineCoordinates) {
      final d = _calculateDistance(
        driverCurrentLatLng!.latitude,
        driverCurrentLatLng!.longitude,
        p.latitude,
        p.longitude,
      );

      if (d < minDistance) minDistance = d;
    }

    if (minDistance > 40) {
      debugPrint("Driver deviated → refreshing polyline");
      await _refreshPolylineFromCurrentLocation();
    }
  }

  void trimPolylineFromDriverPosition() {
    if (driverCurrentLatLng == null || polylineCoordinates.isEmpty) return;

    int closestIndex = 0;
    double minDistance = double.infinity;

    for (int i = 0; i < polylineCoordinates.length; i++) {
      final p = polylineCoordinates[i];
      final d = _calculateDistance(
        driverCurrentLatLng!.latitude,
        driverCurrentLatLng!.longitude,
        p.latitude,
        p.longitude,
      );

      if (d < minDistance) {
        minDistance = d;
        closestIndex = i;
      }
    }

    if (closestIndex > 1) {
      polylineCoordinates = polylineCoordinates.sublist(closestIndex);
      _addPolyLine();
      notifyListeners();
    }
  }

  Future<void> _refreshPolylineFromCurrentLocation() async {
    if (driverCurrentLatLng == null ||
        trip?.dropLat == null ||
        trip?.dropLng == null) return;

    _isPolylineLoading = true;

    try {
      final polyDataMap = {
        "pickLat": driverCurrentLatLng!.latitude,
        "pickLng": driverCurrentLatLng!.longitude,
        "dropLat": trip!.dropLat,
        "dropLng": trip!.dropLng,
      };

      if (trip?.stopLat != null &&
          trip?.stopLat != 0.0 &&
          trip?.stopLng != null &&
          trip?.stopLng != 0.0) {
        polyDataMap["stopLat"] = trip!.stopLat;
        polyDataMap["stopLng"] = trip!.stopLng;
      }

      final newCoordinates = await getPolylineFromRoutes(polyDataMap);
      if (newCoordinates.isEmpty) return;

      clearPolyline();
      await Future.delayed(const Duration(milliseconds: 30));
      polylineCoordinates.addAll(newCoordinates);
      _addPolyLine();

      notifyListeners();
    } finally {
      _isPolylineLoading = false;
    }
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

  static const PolylineId _routePolylineId = PolylineId('route');

  Future<void> _focusDriverMarker(LatLng driverLatLng,
      {bool force = false}) async {
    if (mapController == null || tripStatus == TRIPSTATUS.TRIP_COMPLETED)
      return;

    final now = DateTime.now();
    if (!force && _lastDriverFocusAt != null) {
      final elapsedMs = now.difference(_lastDriverFocusAt!).inMilliseconds;
      if (elapsedMs < 900) return;
    }

    if (!force && _lastDriverFocusTarget != null) {
      final movedMeters = _calculateDistance(
        _lastDriverFocusTarget!.latitude,
        _lastDriverFocusTarget!.longitude,
        driverLatLng.latitude,
        driverLatLng.longitude,
      );
      if (movedMeters < 6) return;
    }

    _lastDriverFocusAt = now;
    _lastDriverFocusTarget = driverLatLng;

    final zoom = tripStatus == TRIPSTATUS.TRIP_START ? 17.5 : 16.8;
    await mapController!.animateCamera(
      CameraUpdate.newCameraPosition(
        CameraPosition(
          target: driverLatLng,
          zoom: zoom,
          tilt: 0,
          bearing: 0,
        ),
      ),
    );
  }

  void _addPolyLine() {
    polylines.clear();

    polylines[_routePolylineId] = Polyline(
      polylineId: _routePolylineId,
      color: CustomColors.primaryColor,
      points: List<LatLng>.from(polylineCoordinates),
      width: 5,
      startCap: Cap.roundCap,
      endCap: Cap.roundCap,
      jointType: JointType.round,
    );
  }

  Future<void> makePhoneCall(String phoneNumber) async {
    final Uri launchUri = Uri(
      scheme: 'tel',
      path: phoneNumber,
    );
    await launchUrl(launchUri);
  }

  Future<void> openGoogleMap(double lat, double lng, BaseVm vm) async {
    final uri = Uri(
        scheme: AppConstants.googleMapNavigation,
        queryParameters: {'q': '$lat,$lng'});
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    } else {
      vm.showErrorDialog(message: vm.translation.txt_Something_went_wrong);
    }
  }

  void trimPolylineBehindCar() {
    if (driverCurrentLatLng == null || polylineCoordinates.isEmpty) return;

    int nearestIndex = 0;
    double nearestDistance = double.infinity;

    for (int i = 0; i < polylineCoordinates.length; i++) {
      final p = polylineCoordinates[i];

      final d = _calculateDistance(
        driverCurrentLatLng!.latitude,
        driverCurrentLatLng!.longitude,
        p.latitude,
        p.longitude,
      );

      if (d < nearestDistance) {
        nearestDistance = d;
        nearestIndex = i;
      }
    }

    if (nearestIndex > 0) {
      polylineCoordinates = polylineCoordinates.sublist(nearestIndex);
      _addPolyLine();
      notifyListeners();
    }
  }

  bool isMeterSheetOpen = false;

  void showMeterUpload(String meter, String img, bool isTripStarted) async {
    if (isMeterSheetOpen) return;

    isMeterSheetOpen = true;

    if (navigatorKey.currentState != null) {
      await showModalBottomSheet(
        context: navigatorKey.currentState!.context,
        backgroundColor: Colors.white,
        isDismissible: true,
        useSafeArea: true,
        isScrollControlled: true,
        enableDrag: true,
        shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.only(
            topLeft: Radius.circular(Dimensions.padding_20),
            topRight: Radius.circular(Dimensions.padding_20),
          ),
        ),
        builder: (context) {
          return RentalMeterBottomSheet(
            meterValue: meter,
            meterImage: img,
            translationModel: translation,
            tripstatus: tripStatus,
            trip: trip,
            isTripStarted: isTripStarted,
          );
        },
      );
    }

    isMeterSheetOpen = false;
  }

  bool? isAddressChangeLoader = false;

  void changeTripAddressChange(
      TRIPADDRESSCHANGETYPE tripAddressChangeType) async {
    isAddressChangeLoader = true;
    notifyListeners();
    final mapViewMapData = <String, dynamic>{};
    mapViewMapData[AppConstants.isPickChange] =
        TRIPADDRESSCHANGETYPE.PICKUP_ADDRESS == tripAddressChangeType
            ? "isPick"
            : "isDrop";
    mapViewMapData[AppConstants.latitude] =
        TRIPADDRESSCHANGETYPE.PICKUP_ADDRESS == tripAddressChangeType
            ? trip?.pickLat
            : TRIPADDRESSCHANGETYPE.STOP_ADDRESS == tripAddressChangeType
                ? trip?.stopLat
                : trip?.dropLat;
    mapViewMapData[AppConstants.longitude] =
        TRIPADDRESSCHANGETYPE.PICKUP_ADDRESS == tripAddressChangeType
            ? trip?.pickLng
            : TRIPADDRESSCHANGETYPE.STOP_ADDRESS == tripAddressChangeType
                ? trip?.stopLng
                : trip?.dropLng;
    mapViewMapData[AppConstants.address] =
        TRIPADDRESSCHANGETYPE.PICKUP_ADDRESS == tripAddressChangeType
            ? trip?.pickAddress
            : TRIPADDRESSCHANGETYPE.STOP_ADDRESS == tripAddressChangeType
                ? trip?.stopAddress
                : trip?.dropAddress;
    mapViewMapData[AppConstants.tripAddressChangeType] =
        tripAddressChangeType.name;
    mapViewMapData[AppConstants.title] =
        TRIPADDRESSCHANGETYPE.PICKUP_ADDRESS == tripAddressChangeType
            ? translation.txt_pickup_change
            : TRIPADDRESSCHANGETYPE.STOP_ADDRESS == tripAddressChangeType
                ? translation.txt_stop_change
                : translation.txt_drop_change;
    final data = await moveAndWait(CustomRouter.mapView, args: mapViewMapData);
    if (data != null && data is Map<String, dynamic>) {
      final String address = data[AppConstants.address];
      final LatLng? latLng = data[AppConstants.latLng];
      debugPrint(
          " pickupChangeBugs ${latLng != null}  ${trip?.sId?.isNotEmpty == true}   ${trip?.driver?.sId?.isNotEmpty == true}");
      if (latLng != null &&
          trip?.sId?.isNotEmpty == true &&
          trip?.driverId?.isNotEmpty == true) {
        final map = <String, dynamic>{};
        if (tripAddressChangeType == TRIPADDRESSCHANGETYPE.PICKUP_ADDRESS) {
          map[AppConstants.pick_lat] = latLng.latitude;
        } else if (tripAddressChangeType ==
            TRIPADDRESSCHANGETYPE.STOP_ADDRESS) {
          map[AppConstants.stop_lat] = latLng.latitude;
        } else {
          map[AppConstants.drop_lat] = latLng.latitude;
        }
        map[tripAddressChangeType == TRIPADDRESSCHANGETYPE.PICKUP_ADDRESS
            ? AppConstants.pick_lng
            : tripAddressChangeType == TRIPADDRESSCHANGETYPE.STOP_ADDRESS
                ? AppConstants.stop_lng
                : AppConstants.drop_long] = latLng.longitude;
        map[AppConstants.requestId] = trip?.sId ?? "";
        map[AppConstants.driverId] = trip?.driverId;
        map[AppConstants.address] = address;

        mqtt.publish(
            tripAddressChangeType == TRIPADDRESSCHANGETYPE.PICKUP_ADDRESS
                ? AppConstants.changePickUpTripAddress
                : tripAddressChangeType == TRIPADDRESSCHANGETYPE.STOP_ADDRESS
                    ? AppConstants.changeStopTripAddress
                    : AppConstants.changeDropTripAddress,
            jsonEncode(map));
        showTripChangeDialog();
      } else {
        showErrorDialog(message: translation.txtTryAgain);
      }
    }
    isAddressChangeLoader = false;
    notifyListeners();
  }

  BuildContext? tripAddressChangeDialogVisible;

  void showTripChangeDialog() {
    showDialog(
        barrierDismissible: false,
        context: navigatorKey.currentState!.context,
        builder: (ctx) {
          tripAddressChangeDialogVisible = ctx;
          return PopScope(
            canPop: false,
            child: DescriptionDialog(
                title: AppConstants.appName,
                title1: translation.txtUserTripAddressChangeDescription),
          );
        });
  }

  void closeTripChangeDialog() {
    GoRouter.of(navigatorKey.currentContext!).pop();
  }

  void disposeTripSubscriptions() {
    mqtt.unSubscribe(AppConstants.listenDrivers);
    if (trip?.sId?.isNotEmpty == true) {
      mqtt.unSubscribe("${AppConstants.getTRipWaitingTime}${trip?.sId}");
    }
    mqtt.unSubscribe("${AppConstants.getTripDriver}${getUserId()}");
    tripDriverSubscription?.cancel();
    driverChangesSubscription?.cancel();
    tripSubscription?.cancel();
    waitingTimeSubscription?.cancel();
    tripDriverSubscription = null;
    driverChangesSubscription = null;
    tripSubscription = null;
    waitingTimeSubscription = null;
    isWaitingTimeSubscribed = false;
    _waitingUiTimer?.cancel();
    _waitingUiTimer = null;
  }

  @override
  void dispose() {
    disposeTripSubscriptions();
    isDisposed = true;
    super.dispose();
  }
}

enum TRIPSTATUS {
  TRIP_ACCEPTED,
  TRIP_ARRIVED,
  TRIP_START,
  TRIP_COMPLETED,
  TRIP_CANCELLED,
  NO_DRIVERS,
  UPLOAD_IMAGE
}

enum TRIPADDRESSCHANGETYPE { PICKUP_ADDRESS, DROP_ADDRESS, STOP_ADDRESS }
