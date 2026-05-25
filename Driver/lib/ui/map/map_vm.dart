import 'dart:async';
import 'dart:convert';
import 'dart:ui' as ui;
import 'package:taxiappzpro/network/response_models/advertisement_model.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_foreground_task/flutter_foreground_task.dart';
import 'package:geolocator/geolocator.dart';
import 'package:go_router/go_router.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:taxiappzpro/base/base_vm.dart';
import 'package:taxiappzpro/main.dart';
import 'package:taxiappzpro/network/response_models/req_in_pro_model.dart';
import 'package:taxiappzpro/network/response_models/trips_model.dart';
import 'package:taxiappzpro/utils/app_constants.dart';
import 'package:taxiappzpro/utils/app_urls.dart';
import 'package:taxiappzpro/utils/custom_colors.dart';
import 'package:taxiappzpro/utils/custom_router_config.dart';
import 'package:taxiappzpro/utils/preference_helper.dart';
import 'package:taxiappzpro/utils/utils.dart';
import '../../bottom_sheets/tripCancelledBs/cancel_bs.dart';
import '../../components/driver_block_screen.dart';
import '../../models/enums.dart';
import '../../utils/foreground_service_handler.dart';
import '../dialogs/trip_address_change.dart';

class MapVm extends BaseVm {
  bool isOnline = false;
  bool isDisposed = false;
  bool isBlocked = false, isCurrentLocationPressed = false;
  GoogleMapController? mapController;
  LatLng currentLocation = const LatLng(0, 0);
  double bearing = 0.0;
  String driverId = "";
  String userId = "";
  Set<Marker> markers = <Marker>{};
  final currentLocationMarkerId = "Current Location";
  bool showTripRequest = false;
  bool triggerRequest = false;
  bool isAlert = false;
  bool isBottomSheetOpen = false;
  TodayStatus? todayStatus;
  StreamSubscription<Position>? positionStream;
  TripModel? tripModel;
  RequestInProModel? requestInProModel;
  String currencySymbol = "";
  int isPopNextRequestInProgressTrigger = 0;
  CameraPosition initialCameraPosition = const CameraPosition(
      bearing: 192.8334901395799,
      target: LatLng(37.43296265331129, -122.08832357078792),
      tilt: 59.440717697143555,
      zoom: 19.151926040649414);
  Timer? locationTimer;
  bool animationFinished = false;
  AdvertisementModel? advertisementData;
  bool isCompanyDriver = false;
  bool isCompanyVehicleUpdated = false;
  bool isActiveTrip = false;
  bool isCancelBottomSheetShowing = false;
  StreamSubscription? _tripChangesSubscription;
  bool _isDialogOpen = true;

  @override
  void notifyListeners() {
    if (!isDisposed) {
      super.notifyListeners();
    }
  }

  // void onLifeCycleChanged(AppLifecycleState state) {
  //   if (state == AppLifecycleState.resumed) {
  //     if(navigatorKey.currentState != null) {
  //       getRequestInProgress();
  //     }
  //   }
  // }
  bool isPaused = false;

  void onLifeCycleChanged(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed && isPaused) {
      isPaused = false;
      if (navigatorKey.currentState != null &&
          CustomRouterConfig.mapScreen ==
              MyApp.of(navigatorKey.currentState!.context)
                  ?.currentScreenLabel) {
        if (!_isDialogOpen) {
          getRequestInProgress(navigatorKey.currentState!.context);
        }
      }
    } else if (state == AppLifecycleState.paused) {
      isPaused = true;
    }
  }

  Future<void> getRequestInProgress(BuildContext context) async {
    if (!triggerRequest) {
      triggerRequest = true;
      showLoader();
      final response = await apiHelper.get(AppUrls.reqInProgress);
      hideLoader();
      response.fold((e) {
        triggerRequest = false;
        showErrorDialog(errorModel: e);
      }, (r) {
        triggerRequest = false;
        print("fre[kege${r.data}");
        requestInProModel = parseData(r.data, RequestInProModel.fromJson);
        print("rjopgrtgtrgr${requestInProModel?.toJson()}");

        if (requestInProModel != null) {
          if (preference.getString(PreferenceHelper.demoKey)?.isNotEmpty ==
                  true &&
              requestInProModel?.isDemoValid == false) {
            showErrorDialog(
                message: translation.txtDemoKeyIsExpired,
                canDismiss: false,
                onClick: () {
                  logoutDriver();
                  GoRouter.of(navigatorKey.currentState!.context).pop();
                });
          } else {
            preference.setString(
                PreferenceHelper.primaryZone, requestInProModel?.zoneId ?? "");
            preference.setString(
                PreferenceHelper.carColor, requestInProModel?.carColor ?? "");

            if (requestInProModel?.secondaryZone?.isNotEmpty == true) {
              preference.setString(PreferenceHelper.secondaryZone,
                  jsonEncode(requestInProModel?.secondaryZone));
              preference.setString(PreferenceHelper.vehicleId,
                  requestInProModel?.driver?.vehicleId ?? "");
              final serviceType = requestInProModel?.driver?.serviceType
                  ?.join(",")
                  .toUpperCase();
              preference.setString(
                PreferenceHelper.serviceType,
                serviceType == "LOCAL"
                    ? AppConstants.local.toUpperCase()
                    : (serviceType ?? ""),
              );
              preference.setString(PreferenceHelper.vehicleType,
                  requestInProModel?.driver?.vehicleName ?? "");
              FlutterForegroundTask.sendDataToTask({
                AppConstants.secondaryZone:
                    jsonEncode(requestInProModel?.secondaryZone)
              });
            }

            currencySymbol = requestInProModel?.currencySymbol ?? "";
            todayStatus = requestInProModel?.todayStatus;
            isBlocked = requestInProModel?.active == false;
            isOnline = requestInProModel?.onlineBy ?? false;
            driverId = requestInProModel?.sId ?? "";
            userId = requestInProModel?.user?.userId ?? "";
            isCompanyDriver =
                requestInProModel?.driver?.isCompanyDriver ?? false;
            isCompanyVehicleUpdated =
                requestInProModel?.isCompanyVehicleUpdated ?? false;
            notifyListeners();
            preference.setString(PreferenceHelper.currencySymbol,
                requestInProModel?.currencySymbol ?? "");
            preference.setString(
                PreferenceHelper.driverId, requestInProModel?.sId ?? "");
            preference.setString(PreferenceHelper.driverUserId,
                requestInProModel?.user?.userId ?? "");
            preference.setString(PreferenceHelper.driverDetailsString,
                jsonEncode(requestInProModel?.driver?.toJson()));
            preference.setBool(PreferenceHelper.isCompanyDriver,
                requestInProModel?.driver?.isCompanyDriver ?? false);
            AppConstants.driverFirstName =
                requestInProModel?.user?.firstName ?? "";
            AppConstants.driverPhoneNumber =
                "${requestInProModel?.user?.countryCode ?? requestInProModel?.countryCode} ${requestInProModel?.user?.phoneNumber ?? ""}";
            if (requestInProModel?.user?.profilePic?.isNotEmpty == true) {
              AppConstants.driverProfilePicture =
                  "${AppConstants.imageBaseUrl}${requestInProModel?.user?.profilePic}";
              AppConstants.appCurrencySymbol =
                  requestInProModel?.currencySymbol ?? "";
            }
            if (isBlocked) {
              uploadData(DateTime.now(), false, false);
              _stopService();
              startLocationUpdates();
              mqtt.unSubscribe("${AppConstants.driverRequest}${getDriverId()}");
              print('sdvifdjdifj');
              final map = {
                "blockReason": requestInProModel?.blockReason,
                "requestInProgress": requestInProModel
              };
              popAndMove(CustomRouterConfig.driverBlockedScreen, args: map);
              return;
            } else if (isSubscriptionFlowEnabled() &&
                requestInProModel?.isDriverSubScriptionValid == false) {
              uploadData(DateTime.now(), false, false);
              _stopService();
              startLocationUpdates();
              mqtt.unSubscribe("${AppConstants.driverRequest}${getDriverId()}");
              print('odsodsoopfsdfo');
              popAndMove(CustomRouterConfig.subscriptionScreen);
              return;
            } else if (requestInProModel?.isDisable == false) {
              uploadData(DateTime.now(), false, false);
              _stopService();
              startLocationUpdates();
              mqtt.unSubscribe("${AppConstants.driverRequest}${getDriverId()}");
              final map = {
                "blockReason": requestInProModel?.isDisableReason,
                "requestInProgress": requestInProModel
              };
              popAndMove(CustomRouterConfig.driverBlockedScreen, args: map);
              return;
            }
            print(
                '${requestInProModel?.isDriverSubScriptionValid} isSubscription allowed: ${isSubscriptionFlowEnabled()}');
            uploadData(DateTime.now(), isOnline, !isBlocked);

            if (isOnline) {
              _startService();
              stopLocationUpdates();
              MyApp.of(navigatorKey.currentState!.context)
                  ?.subscribeToDriverRequest(getDriverId());

              /*if (requestInProModel?.driver?.blockWallet == true) {
                showPaymentDialog(context);
                return;
              }*/

              if (requestInProModel?.trip != null) {
                saveReqId(requestInProModel?.trip?.sId ?? "");
                isActiveTrip = true;

                if (requestInProModel?.trip?.isDriverStarted == false) {
                  tripModel = requestInProModel?.trip!;
                  isBottomSheetOpen = false;
                  showTripRequest = true;
                  notifyListeners();
                } else if (requestInProModel?.trip?.isDriverStarted == true) {
                  if (requestInProModel?.trip?.isCompleted == true) {
                    requestInProModel?.trip?.isHistory = false;
                    popAndMove(CustomRouterConfig.invoiceScreen,
                        args: requestInProModel?.trip);
                  } else if (requestInProModel?.trip?.isCompleted == true &&
                      requestInProModel?.trip?.isPaid == true) {
                  } else {
                    popAndMove(CustomRouterConfig.tripScreen,
                        args: requestInProModel);
                  }
                }
              } else {
                hasShownBottomSheet = false;
                isBottomSheetOpened = false;
                isActiveTrip = false;
                print(
                    "sdkjfhsdfjsdhfhfjhh hasShownBottomSheet=$hasShownBottomSheet, isBottomSheetOpened=$isBottomSheetOpened");
                FlutterForegroundTask.sendDataToTask({"clearTrip": true});
              }
            } else {
              _stopService();
              startLocationUpdates();
              mqtt.unSubscribe("${AppConstants.driverRequest}${getDriverId()}");
            }
          }
        } else {
          showErrorDialog(message: AppConstants.someThingWentWrong);
        }
      });
    }
    await preference.setBool(
      PreferenceHelper.isEnableRefferal,
      requestInProModel?.enableReferral ?? true,
    );
  }

  void onAccept() {
    print("fr[fegege");
    popAndMove(CustomRouterConfig.tripScreen);
  }

  void onDecline() {}

  Future<void> changeOnlineStatus() async {
    if (!isLoading.value) {
      showSnackBar("${translation.txt_loading}.....");
      isLoading.value = true;

      final response = await apiHelper.put(AppUrls.changeOnlineStatus);

      response.fold((e) {
        showErrorDialog(errorModel: e);
      }, (r) async {
        try {
          isOnline = r.data['onlineBy'] == true;

          if (!isOnline) {
            _stopService();
            uploadData(DateTime.now(), false, false);
            startLocationUpdates();
            mqtt.unSubscribe("${AppConstants.driverRequest}${getDriverId()}");
          } else {
            uploadData(DateTime.now(), true, !isBlocked);
            MyApp.of(navigatorKey.currentState!.context)
                ?.subscribeToDriverRequest(getDriverId());
            stopLocationUpdates();
            _startService();
          }
          notifyListeners();
        } catch (e) {
          showErrorDialog(message: translation.txt_Something_went_wrong);
        }
      });

      isLoading.value = false;
    }
  }

  Future<ServiceRequestResult> _stopService() {
    MyApp.of(navigatorKey.currentContext!)?.disposeOverlayOtherAppWindows();
    return FlutterForegroundTask.stopService();
  }

  void initService() {
    FlutterForegroundTask.init(
      androidNotificationOptions: AndroidNotificationOptions(
        channelId: 'foreground_service',
        channelName: 'Foreground Service Notification',
        channelDescription:
            'This notification appears when the foreground service is running.',
        onlyAlertOnce: true,
      ),
      iosNotificationOptions: const IOSNotificationOptions(
        showNotification: false,
        playSound: false,
      ),
      foregroundTaskOptions: ForegroundTaskOptions(
        eventAction: ForegroundTaskEventAction.repeat(15000),
        autoRunOnBoot: true,
        autoRunOnMyPackageReplaced: true,
        allowWakeLock: true,
        allowWifiLock: true,
      ),
    );
  }

  Future<void> _startService() async {
    if (!await FlutterForegroundTask.isRunningService) {
      FlutterForegroundTask.startService(
        serviceId: 256,
        notificationTitle: 'Foreground Service is running',
        notificationText: 'Tap to return to the app',
        notificationIcon: null,
        notificationInitialRoute: '/splash',
        callback: startCallback,
      );
    }
    MyApp.of(navigatorKey.currentContext!)?.initOverlayOtherAppWindows();
  }

  void receiveLocationUpdates(Object data) async {
    if (data is Map<String, String> &&
        data.containsKey(AppConstants.latitude) &&
        data.containsKey(AppConstants.longitude)) {
      final lat = double.parse(data[AppConstants.latitude]!);
      final lng = double.parse(data[AppConstants.longitude]!);
      final bearing = double.parse(data[AppConstants.bearing]!);
      final receivedLocation = LatLng(lat, lng);
      if (receivedLocation != currentLocation || this.bearing != bearing) {
        currentLocation = receivedLocation;
        this.bearing = bearing;
        const imageConfiguration = ImageConfiguration(size: ui.Size(60, 60));
        final position = CameraPosition(target: LatLng(lat, lng), zoom: 16);

        mapController?.animateCamera(CameraUpdate.newCameraPosition(position));
        markers.clear();
        markers.add(Marker(
            markerId: MarkerId(currentLocationMarkerId),
            position: currentLocation,
            icon: await BitmapDescriptor.asset(
              imageConfiguration,
              Utils.getVehicleImageName(requestInProModel?.driver?.vehicleName),
            ),
            rotation: 0.7,
            anchor: const Offset(0.5, 0.5)));
        notifyListeners();
      }
    }
  }

  Future<Uint8List> getBytesFromAsset(String path, int width) async {
    ByteData data = await rootBundle.load(path);
    ui.Codec codec = await ui.instantiateImageCodec(data.buffer.asUint8List(),
        targetWidth: width);
    ui.FrameInfo fi = await codec.getNextFrame();
    return (await fi.image.toByteData(format: ui.ImageByteFormat.png))!
        .buffer
        .asUint8List();
  }

  Future<BitmapDescriptor> getBitmapDescriptorFromAssetBytes(
      String path, int width) async {
    final Uint8List imageData = await getBytesFromAsset(path, width);
    return BitmapDescriptor.bytes(imageData);
  }

  Future<void> uploadData(
      DateTime timeStamp, bool onLineStatus, bool isActive) async {
    double lat = preference.getDouble(PreferenceHelper.currentLatDouble) ?? 0;
    double lng = preference.getDouble(PreferenceHelper.currentLngDouble) ?? 0;
    double header = preference.getDouble(PreferenceHelper.bearingDouble) ?? 0;
    print('sdfosddo $isActive');

    final map = <String, String>{
      AppConstants.driverId: driverId,
      AppConstants.userId: userId,
      AppConstants.latitude: "$lat",
      AppConstants.longitude: "$lng",
      AppConstants.bearing: "$header",
      AppConstants.lastUpdated: timeStamp.microsecondsSinceEpoch.toString(),
      AppConstants.isOnline: onLineStatus ? "1" : "0",
      AppConstants.isAvailable: isActive ? "1" : "0",
      AppConstants.serviceType:
          requestInProModel?.driver?.serviceType?.join(",") ?? "",
      AppConstants.vehicleId: requestInProModel?.driver?.vehicleId ?? "",
      AppConstants.primaryZone:
          preference.getString(PreferenceHelper.primaryZone) ?? "",
      if (preference.getString(PreferenceHelper.secondaryZone)?.isNotEmpty ==
          true)
        AppConstants.secondaryZone:
            preference.getString(PreferenceHelper.secondaryZone) ?? "",
    };

    mqtt.publish(AppConstants.driverLocationUpdate, jsonEncode(map));
    // FlutterForegroundTask.sendDataToMain(map);
  }

  Future<void> getCurrentLocation() async {
    isCurrentLocationPressed = true;
    notifyListeners();
    debugPrint("locationLoadingBugs    onTap 3 ");
    debugPrint(
        "locationLoadingBugs    asds ${await isLocationPermissionGranted()}");
    if (await isLocationPermissionGranted()) {
      debugPrint("locationLoadingBugs    onTap 3  ${DateTime.now()}");
      final lastLocation = await Geolocator.getLastKnownPosition();
      debugPrint(
          "locationLoadingBugs    onTap 4  ${DateTime.now()}   $lastLocation");

      if (lastLocation != null) {
        currentLocation = LatLng(lastLocation.latitude, lastLocation.longitude);
        saveCurrentLocation(lastLocation);
      } else {
        final location = await Geolocator.getCurrentPosition(
            locationSettings: const LocationSettings(
                distanceFilter: 100, accuracy: LocationAccuracy.high));
        debugPrint("locationLoadingBugs    onTap 5 ${DateTime.now()}");
        currentLocation = LatLng(location.latitude, location.longitude);
        saveCurrentLocation(location);
      }
      moveCameraForCurrentLocation(currentLocation);
      isCurrentLocationPressed = false;
      notifyListeners();
    }
  }

  void onMapReady(GoogleMapController controller) {
    mapController = controller;
    getCurrentLocation();
  }

  Future<BitmapDescriptor> imageToMarkerIcon(ui.Image image) async {
    final ByteData? byteData =
        await image.toByteData(format: ui.ImageByteFormat.png);
    if (byteData == null) throw Exception("Failed to convert image to bytes");
    final Uint8List imageBytes = byteData.buffer.asUint8List();
    return BitmapDescriptor.bytes(imageBytes);
  }

  void moveCameraForCurrentLocation(LatLng location) async {
    final position = CameraPosition(
        target: LatLng(location.latitude, location.longitude), zoom: 16);
    mapController?.animateCamera(CameraUpdate.newCameraPosition(position));
    markers.clear();
    const imageConfiguration = ImageConfiguration(size: ui.Size(60, 60));
    markers.add(Marker(
        markerId: MarkerId(currentLocationMarkerId),
        position: currentLocation,
        icon: await BitmapDescriptor.asset(imageConfiguration,
            Utils.getVehicleImageName(requestInProModel?.driver?.vehicleName)),
        rotation: 0.7,
        anchor: const Offset(0.5, 0.5)));
    notifyListeners();
  }

  void setMapDetails() async {
    final lat = preference.getDouble(PreferenceHelper.currentLatDouble) ?? 0;
    final lng = preference.getDouble(PreferenceHelper.currentLngDouble) ?? 0;
    final latLng = LatLng(lat, lng);
    initialCameraPosition =
        CameraPosition(bearing: 0, target: latLng, zoom: 16);
    markers.clear();
    const imageConfiguration = ImageConfiguration(size: ui.Size(60, 60));
    markers.add(Marker(
        markerId: MarkerId(currentLocationMarkerId),
        position: currentLocation,
        icon: await BitmapDescriptor.asset(imageConfiguration,
            Utils.getVehicleImageName(requestInProModel?.driver?.vehicleName)),
        rotation: 0.7,
        anchor: const Offset(0.5, 0.5)));
  }

  void startLocationUpdates() {
    locationTimer = Timer.periodic(const Duration(seconds: 10), (timer) async {
      // Request location permission
      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied ||
          permission == LocationPermission.deniedForever) {
        permission = await Geolocator.requestPermission();
      }

      if (permission == LocationPermission.whileInUse ||
          permission == LocationPermission.always) {
        try {
          Position position = await Geolocator.getCurrentPosition(
              locationSettings:
                  const LocationSettings(accuracy: LocationAccuracy.high));
          saveCurrentLocation(position);
        } catch (e) {
          debugPrint("$e");
        }
      } else {}
    });
  }

  void stopLocationUpdates() {
    locationTimer?.cancel();
  }

  int count = 0;

  final lastData = <String>{};

  List<TripModel>? listCount = [];

  var counter = 0;

  final List<String> lastTripDataList =
      []; // Store trip data only as stringified JSON
  int cont = 0;

  void listenForTrips() {
    _tripChangesSubscription?.cancel();
    _tripChangesSubscription = mqtt.messageController.stream.listen((onData) {
      final topic = onData[AppConstants.topic];
      final expectedTopic = "${AppConstants.driverRequest}${getDriverId()}";
      final response = onData[AppConstants.response];

      if (topic == expectedTopic) {
        try {
          final map = jsonDecode(response);
          print(
              "=== MQTT DEBUG: Received message with title: ${map['title']} ===");

          if (map is Map<String, dynamic>) {
            final data = map["trip"] ?? map["tripDetails"];
            final title = map["title"];

            // SAFE: Store preferences with null checks
            if (data is Map<String, dynamic>) {
              final estimatedAmount = data['estimatedAmount']?.toString();
              final avgUserRating = data['avgUserRating']?.toString();

              if (estimatedAmount != null) {
                preference.setString(
                    PreferenceHelper.estimatedAmount, estimatedAmount);
              }
              if (avgUserRating != null) {
                preference.setString(PreferenceHelper.avgRating, avgUserRating);
              }

              print(
                  "Stored estimatedAmount: $estimatedAmount, avgUserRating: $avgUserRating");
            }

            String tripIdentifier;
            if (data is Map<String, dynamic>) {
              tripIdentifier =
                  (data['_id'] ?? data['requestId'] ?? title ?? response)
                      .toString();
            } else {
              tripIdentifier = response;
            }

            if (!lastTripDataList.contains(tripIdentifier)) {
              lastTripDataList.add(tripIdentifier);

              // Keep only recent items
              if (lastTripDataList.length > 50) {
                lastTripDataList.removeAt(0);
              }

              if (MyApp.of(navigatorKey.currentState!.context)
                      ?.currentScreenLabel !=
                  CustomRouterConfig.tripScreen) {
                if (title == TripStatus.TRIP_CANCELLED.name) {
                  print("=== TRIP CANCELLED: Processing cancellation ===");
                  FlutterForegroundTask.sendDataToTask({"clearTrip": true});
                  closeTripRequest();

                  if (!isCancelBottomSheetShowing) {
                    showCancel(lastTripDataList.length);
                  }
                } else {
                  print("=== NEW TRIP: Attempting to parse trip ===");
                  try {
                    final tripModel = TripModel.fromJson(data);
                    if (tripModel.isDriverStarted == false) {
                      showTripRequest = true;
                      this.tripModel = tripModel;
                      notifyListeners();
                      print(
                          "=== NEW TRIP: Successfully displayed trip request ===");
                    }
                  } catch (parseError) {
                    print(
                        "=== NEW TRIP: Error parsing trip model: $parseError ===");
                  }
                }
              }
            } else {
              print(
                  "=== DUPLICATE: Trip already processed: $tripIdentifier ===");
            }
          } else {
            getRequestInProgress(navigatorKey.currentState!.context);
          }
        } catch (e, stackTrace) {
          print("=== MQTT ERROR: Error processing MQTT message ===");
          print("Error: $e");
          print("Stack trace: $stackTrace");
          print("Raw response: $response");
          getRequestInProgress(navigatorKey.currentState!.context);
        }
      }
    });
  }

  bool hasShownBottomSheet = false;
  bool isBottomSheetOpened = false;

  void showCancel(int count) async {
    print("rfgdfuhgihdfgkjhfdkghdfghdf   $count");
    // Prevent multiple bottom sheets
    if (isCancelBottomSheetShowing) {
      print("Bottom sheet is already showing");
      return;
    }
    if (navigatorKey.currentState != null) {
      isCancelBottomSheetShowing = true;
      final response = await showModalBottomSheet(
        context: navigatorKey.currentState!.context,
        isScrollControlled: true,
        isDismissible: false,
        backgroundColor: Colors.white,
        builder: (BuildContext context) {
          return SingleChildScrollView(
            child: CancelBs(
              translation: translation,
            ),
          );
        },
      );

      isCancelBottomSheetShowing = false;

      if (response != null) {
        print("Response from bottom sheet: $response");
      }
    } else {
      print("Navigator key current state is null");
    }
  }

  void showPaymentDialog(context) {
    showDialog(
      context: navigatorKey.currentState!.context,
      barrierDismissible: false,
      builder: (_) {
        return AlertDialog(
          title: const Text("wallet Payment Required"),
          content: Text(
            'Your current wallet balance is ₹${requestInProModel?.driver?.minimumWalletBalance ?? "0"}. Please recharge to continue.',
          ),
          actions: [
            TextButton(
                onPressed: () {
                  _isDialogOpen = false;
                  GoRouter.of(context)
                      .pushNamed(CustomRouterConfig.walletScreen);
                },
                child: Container(
                  width: 100,
                  padding: const EdgeInsets.symmetric(vertical: 10),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(10),
                    color: CustomColors.primaryColor,
                  ),
                  alignment: Alignment.center,
                  child: const Text(
                    "Recharge Now",
                    style: TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                )),
          ],
        );
      },
    );
  }

  void closeTripRequest() {
    print("roepfrefef");
    showTripRequest = false;
    isBottomSheetOpen = false;
    tripModel = null;
    notifyListeners();
  }

  void logoutDriver() async {
    if (!isLoading.value) {
      isLoading.value = true;
      showLoader();
      final map = {
        PreferenceHelper.refreshToken:
            preference.getString(PreferenceHelper.refreshToken),
      };

      final response = await apiHelper.post(AppUrls.logoutDriver, params: map);
      response.fold((e) {
        showErrorDialog(errorModel: e);
      }, (r) async {
        preference.remove(PreferenceHelper.demoKey);
        preference.remove(PreferenceHelper.authToken);
        preference.remove(PreferenceHelper.refreshToken);
        preference.remove(PreferenceHelper.vehicleId);
        preference.remove(PreferenceHelper.serviceType);
        preference.remove(PreferenceHelper.vehicleType);
        if (await FlutterForegroundTask.isRunningService) {
          FlutterForegroundTask.stopService();
        }
        MyApp.of(navigatorKey.currentContext!)?.disposeOverlayOtherAppWindows();
        for (var i in mqtt.subscribedTopics) {
          if (i.isNotEmpty) {
            mqtt.unSubscribe(i);
          }
        }
        mqtt.disconnect();

        popAndMove(CustomRouterConfig.loginScreen);
      });
      isLoading.value = false;
      hideLoader();
    }
  }

  @override
  void dispose() {
    _tripChangesSubscription?.cancel();
    positionStream?.cancel();
    locationTimer?.cancel();
    isDisposed = true;
    super.dispose();
  }
}
