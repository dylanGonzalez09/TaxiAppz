import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'dart:isolate';

import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:go_router/go_router.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:intl/intl.dart';
import 'package:location/location.dart' as loc;
import 'package:mqtt_client/mqtt_client.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:user/components/user_block_screen.dart';
import 'package:user/utils/utils.dart';

import '../../main.dart';
import '../../models/enums.dart';
import '../../network/response_models/advertisement_model.dart';
import '../../network/response_models/destination_model.dart';
import '../../network/response_models/mqtt_driver_model.dart';
import '../../network/response_models/rental_package_model.dart';
import '../../network/response_models/reqin_progress_model.dart';
import '../../utils/app_constants.dart';
import '../../utils/app_url.dart';
import '../../utils/base_vm.dart';
import '../../utils/custom_images.dart';
import '../../utils/custom_router.dart';
import '../../utils/preference_helper.dart';
import '../bottomsheets/date_picker_bs/date_picker_bs.dart';
import '../dialogs/permission.dart';

class MapVm extends BaseVm {
  bool isMapLoaded = false;
  final location = loc.Location();
  DialogRoute? permissionDialogRoute;
  bool isPermissionGranted = false;
  bool isServiceEnabled = false;
  final Set<Marker> marker = {};
  GoogleMapController? mapController;
  bool isDisposed = false;
  ServiceCategoryType selectedCategory = ServiceCategoryType.Ride;
  LatLng pickupLocationLatLng = const LatLng(0, 0);
  LatLng dropLocationLatLng = const LatLng(0, 0);
  LatLng usersCurrentLocation = const LatLng(0, 0);
  bool isCurrentLocationMarkerChanged = false;
  final titleViewKey = GlobalKey();
  final bottomViewKey = GlobalKey();
  final mapViewKey = GlobalKey();
  double titleViewHeight = 0;
  double bottomViewHeight = 0;
  final currentLocationMarkerSize = 60;
  bool isMapPaddingAdjusted = true;
  String pickupLocation = "";
  String dropLocation = "";
  bool showFloatingMarker = false;
  bool isProgramaticCameraMovement = false;
  bool isFetchingPickupLocation = false;
  bool isPickupChange = false;
  bool isFetchingDropLocation = false;
  bool isFromArgs = false;
  double mapCenterHeight = 0;
  double mapCenterWidth = 0;
  int hourPackage = 1;
  int distanceCount = 1;
  int minHours = 0;
  int maxHours = 0;
  int minKm = 0;
  int maxKm = 0;
  int selectedHours = 0;
  int selectedKm = 0;
  bool isDataLoading = false;
  bool isRentalChoosing = false;
  bool isActiveTrip = false;
  bool isPaused = false;
  DateTime selectedDateTime = DateTime.now().add(const Duration(minutes: 30));

  final TextEditingController rentalRideDateController =
      TextEditingController();
  RentalPackageModel? rentalModel;
  List<Package> rentalPackages = [];
  Package? selectedPackage;
  AdvertisementModel? _advertisementData;
  bool _isAdShown = false;
  bool isAdLoaded = false; // New flag to track if ad was loaded
  StreamSubscription? _allDriversSubscription;
  StreamSubscription? _driverChangesSubscription;

  AdvertisementModel? get advertisementData => _advertisementData;

  bool get isShowAd => _isAdShown;

  @override
  void notifyListeners() {
    if (!isDisposed) {
      super.notifyListeners();
    }
  }

  void onMapLoaded(controller) {
    isMapLoaded = true;
    notifyListeners();
    mapController = controller;
  }

  void onLifeCycleChanged(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed && isPaused) {
      isPaused = false;
      checkForPermission();
    } else if (state == AppLifecycleState.paused) {
      isPaused = true;
    }
  }

  void checkForPermission() async {
    final context = navigatorKey.currentState!.context;
    if (Platform.isAndroid) {
      final isGranted = await Permission.location.isGranted;
      if (isGranted) {
        isPermissionGranted = true;
        final isLocationServiceEnabled =
            await Geolocator.isLocationServiceEnabled();
        if (isLocationServiceEnabled) {
          isServiceEnabled = true;
          getCurrentLocation();
        } else {
          final isGranted = await location.requestService();
          if (isGranted) {
            getCurrentLocation();
          } else {
            showErrorDialog(
              message: translation.txt_Enable_gps_description,
              canDismiss: false,
              onClick: () {
                GoRouter.of(navigatorKey.currentState!.context).pop();
                checkForPermission();
              },
            );
          }
        }
      } else {
        if (permissionDialogRoute == null) {
          permissionDialogRoute = DialogRoute(
            context: context,
            builder: (_) => PermissionDialog(
              onTap: () {
                requestPermission();
              },
              translationModel: translation,
            ),
            barrierDismissible: false,
          );
          Navigator.of(context).push(permissionDialogRoute!).then((value) {
            permissionDialogRoute = null;
          });
        }
      }
    } else if (Platform.isIOS) {
      LocationPermission status = await Geolocator.checkPermission();
      debugPrint("Current permission status: $status");

      if (status == LocationPermission.whileInUse ||
          status == LocationPermission.always) {
        isPermissionGranted = true;
        final isLocationServiceEnabled =
            await Geolocator.isLocationServiceEnabled();
        if (isLocationServiceEnabled) {
          isServiceEnabled = true;
          getCurrentLocation();
        } else {
          final isServiceGranted = await Geolocator.isLocationServiceEnabled();
          if (isServiceGranted) {
            getCurrentLocation();
          } else {
            showErrorDialog(
              message: translation.txt_Enable_gps_description,
              canDismiss: false,
              onClick: () {
                GoRouter.of(navigatorKey.currentState!.context).pop();
                checkForPermission();
              },
            );
          }
        }
      } else {
        if (permissionDialogRoute == null) {
          permissionDialogRoute = DialogRoute(
            context: context,
            builder: (_) => PermissionDialog(
              onTap: () {
                requestPermission();
              },
              translationModel: translation,
            ),
            barrierDismissible: false,
          );
          Navigator.of(context).push(permissionDialogRoute!).then((value) {
            permissionDialogRoute = null;
          });
        }
      }
    }
  }

  Future<void> requestPermission() async {
    if (await Permission.location.isPermanentlyDenied) {
      openAppSettings();
    } else {
      if (Platform.isAndroid) {
        await Permission.location.request();
      } else if (Platform.isIOS) {
        LocationPermission iOSPermission = await Geolocator.requestPermission();
        debugPrint("iOS Permission Status after request: $iOSPermission");
        if (iOSPermission == LocationPermission.denied) {
          debugPrint("iOS location permission denied.");
        } else if (iOSPermission == LocationPermission.deniedForever) {
          debugPrint("iOS location permission permanently denied.");
          openAppSettings();
        } else if (iOSPermission == LocationPermission.whileInUse ||
            iOSPermission == LocationPermission.always) {
          debugPrint("iOS location permission granted.");
        }
      }
    }

    LocationPermission recheckedStatus = await Geolocator.checkPermission();
    debugPrint("Rechecked permission status: $recheckedStatus");

    checkForPermission();
  }

  // Future<void> requestPermission() async {
  //   print("Permission.location: ${Permission.location}");
  //   if (await Permission.location.isPermanentlyDenied) {
  //     AppSettings.openAppSettings();
  //   } else {
  //     await Permission.location.request();
  //     checkForPermission();
  //   }
  // }

  void getCurrentLocation() async {
    isMapLoaded = false;
    showFloatingMarker = false;
    notifyListeners();
    reqInProgress();
    if (isPermissionGranted && isServiceEnabled) {
      const locationSetting = LocationSettings(accuracy: LocationAccuracy.high);
      final currentLocation = await Geolocator.getCurrentPosition(
        locationSettings: locationSetting,
      );
      const imageConfiguration = ImageConfiguration(size: Size(60, 60));
      final position = CameraPosition(
        target: LatLng(currentLocation.latitude, currentLocation.longitude),
        zoom: 16,
      );
      saveCurrentLocation(position.target);
      isProgramaticCameraMovement = true;
      pickupLocationLatLng = position.target;
      usersCurrentLocation = position.target;
      mapController?.animateCamera(CameraUpdate.newCameraPosition(position));
      marker.removeWhere(
        (item) => item.markerId.value == AppConstants.currentLocationMarker,
      );
      marker.add(
        Marker(
          markerId: const MarkerId(AppConstants.currentLocationMarker),
          position: position.target,
          anchor: const Offset(0.5, 0.5),
          icon: await BitmapDescriptor.asset(
            imageConfiguration,
            CustomImages.currentLocationMarker,
          ),
          rotation: 0,
        ),
      );
      isCurrentLocationMarkerChanged = false;
      final address = await getAddressFromLatLng(position.target);
      pickupLocation = address;
      isMapLoaded = true;
      checkZoneAddress(
        LatLng(currentLocation.latitude, currentLocation.longitude),
      );
      notifyListeners();
      if (!isDisposed) {
        getAllDrivers();
      }
    } else {
      checkForPermission();
    }
  }

  void onRentalSelected() async {
    isMapPaddingAdjusted = true;
    selectedCategory = ServiceCategoryType.Rental;
    notifyListeners();
    getRentalList();
  }

  void onLocalSelected() async {
    isMapPaddingAdjusted = true;
    selectedCategory = ServiceCategoryType.Ride;
    notifyListeners();
  }

  void adjustMapPadding() {
    isMapPaddingAdjusted = false;
    if (bottomViewKey.currentContext != null) {
      final RenderBox containerBox =
          bottomViewKey.currentContext!.findRenderObject() as RenderBox;
      bottomViewHeight = containerBox.size.height;
      notifyListeners();
    }
  }

  onMapIdle() async {
    isMapLoaded = false;
    isProgramaticCameraMovement = false;
    notifyListeners();
    if (isFromArgs) {
      isMapLoaded = true;
      notifyListeners();
    } else {
      final address = await getAddressFromLatLng(pickupLocationLatLng);
      pickupLocation = address;
      isMapLoaded = true;
      notifyListeners();
    }
  }

  ScreenCoordinate getScreenCoordinate() {
    final RenderBox? renderBox =
        mapViewKey.currentContext?.findRenderObject() as RenderBox?;
    if (renderBox == null || mapController == null) {
      return const ScreenCoordinate(x: 0, y: 0);
    }

    final size = renderBox.size;

    mapCenterHeight = size.height / 2.round();
    mapCenterWidth = size.width / 2.round();
    notifyListeners();
    // Calculate the center of the map widget
    return ScreenCoordinate(
      x: (size.width / 2).round(),
      y: (size.height / 2).round(),
    );
  }

  onCameraMove(CameraPosition position) async {
    if (!isProgramaticCameraMovement) {
      showFloatingMarker = true;
      isFetchingPickupLocation = true;
      isMapPaddingAdjusted = true;
      pickupLocationLatLng = position.target;
      notifyListeners();
      if (!isCurrentLocationMarkerChanged) {
        isCurrentLocationMarkerChanged = true;
        marker.clear();
        const imageConfiguration = ImageConfiguration(size: Size(32, 32));
        marker.add(
          Marker(
            markerId: const MarkerId(AppConstants.currentLocationMarker),
            position: usersCurrentLocation,
            anchor: const Offset(0.5, 0.5),
            icon: await BitmapDescriptor.asset(
              imageConfiguration,
              CustomImages.redCurrentLocationMarker,
            ),
            rotation: 0,
          ),
        );
      }
      notifyListeners();
    }
  }

  void onConfirmPickupLocation() async {
    isMapPaddingAdjusted = true;
    isFetchingPickupLocation = false;
    notifyListeners();
  }

  void handlePickupArgs(Map data) async {
    isFromArgs = true;
    isFetchingPickupLocation = false;
    pickupLocation = data['address'];
    pickupLocationLatLng = data["latLng"];
    debugPrint("dataEntered $pickupLocation");
    final position = CameraPosition(target: pickupLocationLatLng, zoom: 16);
    isProgramaticCameraMovement = true;
    mapController?.animateCamera(CameraUpdate.newCameraPosition(position));
    const imageConfiguration = ImageConfiguration(size: Size(60, 60));
    marker.clear();
    marker.add(
      Marker(
        markerId: const MarkerId(AppConstants.currentLocationMarker),
        position: position.target,
        anchor: const Offset(0.5, 0.5),
        icon: await BitmapDescriptor.asset(
          imageConfiguration,
          CustomImages.currentLocationMarker,
        ),
        rotation: 0,
      ),
    );
    isProgramaticCameraMovement = false;
    isCurrentLocationMarkerChanged = false;
    isPickupChange = false;
    isFromArgs = false;
    notifyListeners();
  }

  void handleDropArgs(Map data) async {
    isFromArgs = true;
    isFetchingDropLocation = false;
    dropLocation = data['address'];
    dropLocationLatLng = data["latLng"];
    debugPrint("handleDropArgs $dropLocation");
    notifyListeners();
  }

  void getAllDrivers() async {
    await mqtt.subscribe("${AppConstants.getAllDrivers}${getUserId()}");
    final map = <String, String>{
      AppConstants.userId: getUserId(),
      AppConstants.latitude: pickupLocationLatLng.latitude.toString(),
      AppConstants.longitude: pickupLocationLatLng.longitude.toString(),
      AppConstants.bearing: "0",
    };
    mqtt.publish(AppConstants.postAllDrivers, jsonEncode(map));
    final setMessage = <String>{};
    _allDriversSubscription?.cancel();
    _allDriversSubscription =
        mqtt.messageController.stream.listen((data) async {
      if (data[AppConstants.topic] ==
          "${AppConstants.getAllDrivers}${getUserId()}") {
        if (!setMessage.contains(data[AppConstants.response])) {
          setMessage.add(data[AppConstants.response] ?? "");
          mqtt.unSubscribe("${AppConstants.getAllDrivers}${getUserId()}");
          ReceivePort mainReceivePort = ReceivePort();
          await Isolate.spawn(processAllDrivers, mainReceivePort.sendPort);
          final SendPort isolateSendPort =
              await mainReceivePort.first as SendPort;
          ReceivePort processedDataReceivePort = ReceivePort();
          isolateSendPort.send(processedDataReceivePort.sendPort);
          isolateSendPort.send(data[AppConstants.response]);
          final processedData = await processedDataReceivePort.first;
          mainReceivePort.close();
          processedDataReceivePort.close();
          if (processedData is List<MqttDriverModel>) {
            for (var action in processedData) {
              if (action.isOnline == true && action.isAvailable == true) {
                final latLng = LatLng(
                  action.latitude ?? 0,
                  action.longitude ?? 0,
                );
                const configuration = ImageConfiguration(
                  size: Size(17, 32),
                  devicePixelRatio: 2,
                );
                final marker = Marker(
                  markerId: MarkerId(action.sId ?? ""),
                  position: latLng,
                  rotation: 0,
                  icon: await BitmapDescriptor.asset(
                    configuration,
                    CustomImages.driverMarker,
                    height: 32,
                    width: 17,
                  ),
                );
                this.marker.add(marker);
              }
            }
            notifyListeners();
          }
        }
      }
    });
    listenForChanges();
  }

  void listenForChanges() async {
    await mqtt.subscribe(AppConstants.listenDrivers);
    debugPrint("SampleDAtaCheck ${mqtt.subscribedTopics}");
    _driverChangesSubscription?.cancel();
    _driverChangesSubscription =
        mqtt.messageController.stream.listen((onData) async {
      if (onData[AppConstants.topic] == AppConstants.listenDrivers) {
        if (onData[AppConstants.response] is String &&
            onData[AppConstants.response]?.isNotEmpty == true) {
          final jsonData = jsonDecode(onData[AppConstants.response] ?? "");
          final driver = MqttDriverModel.fromJson(jsonData);
          if (driver.isOnline == false || driver.isAvailable == false) {
            marker.removeWhere((marker) => marker.markerId.value == driver.sId);
          } else {
            marker.removeWhere((test) => test.markerId.value == driver.sId);
            const config = ImageConfiguration(size: Size(17, 32));
            final latLng = LatLng(driver.latitude ?? 0, driver.longitude ?? 0);
            if (driver.sId?.isNotEmpty == true) {
              final newMarker = Marker(
                markerId: MarkerId(driver.sId!),
                position: latLng,
                rotation: driver.bearing ?? 0,
                icon: await BitmapDescriptor.asset(
                  config,
                  CustomImages.driverMarker,
                ),
              );
              marker.add(newMarker);
            }
          }
          notifyListeners();
        }
      }
    });
  }

  Future<void> reqInProgress() async {
    isDataLoading = true;
    notifyListeners();
    final response = await apiHelper.get(AppUrls.reqInProgress);
    isDataLoading = false;
    notifyListeners();
    response.fold((e) => showErrorDialog(errorModel: e), (r) async {
      final model = parseData(r.data, ReqInProgressModel.fromJson);
      preference.setString(PreferenceHelper.zoneId, model?.user?.zoneId ?? "");
      if (preference.getString(PreferenceHelper.demoKey)?.isNotEmpty == true &&
          model?.isDemoValid == false) {
        showErrorDialog(
          canDismiss: false,
          onClick: () {
            logoutUser();
            GoRouter.of(navigatorKey.currentState!.context).pop();
          },
          message: translation.txtDemoKeyIsExpired,
        );

      } else {
        AppConstants.userWalletBalance = model?.walletBalance;
        AppConstants.userFirstName = model?.user?.firstName ?? "";
        AppConstants.userProfileImage = model?.user?.profileImage != null &&
                model?.user?.profileImage?.isNotEmpty == true
            ? "${AppConstants.imageBaseUrl}${model?.user?.profileImage}"
            : "";
        isActiveTrip = model?.trip != null;
        print("fekorgegre${model?.trip?.toJson()}");
        if (model?.trip != null) {
          if (model?.trip?.isCompleted == true) {
            model?.trip?.isHistory = false;
            popAndMove(CustomRouter.invoiceScreen, args: model?.trip);
          } else {
            if (model?.trip?.isDriverStarted == true) {
              popAndMove(CustomRouter.tripScreen, args: model!.trip!);
            } else {
              debugPrint("Trip not completed ${model?.trip?.sId}");
            }
          }
        }
      }
        await preference.setBool(
          PreferenceHelper.isEnableRefferal,
          model?.enableReferral ?? true,
        );
      print('ggjgjgjh${model?.enableReferral}');
    });
  }

  void showRentalDatePicker() async {
    if (navigatorKey.currentState != null) {
      final response = await showModalBottomSheet(
        context: navigatorKey.currentState!.context,
        backgroundColor: Colors.white,
        isDismissible: true,
        isScrollControlled: true,
        enableDrag: false,
        shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.only(
            topLeft: Radius.circular(20),
            topRight: Radius.circular(20),
          ),
        ),
        builder: (context) {
          return Padding(
            padding: EdgeInsets.only(
              bottom: MediaQuery.of(context).viewInsets.bottom,
            ),
            child: DatePickerBs(
              initialDateTime: selectedDateTime.isBefore(DateTime.now())
                  ? DateTime.now()
                  : selectedDateTime,
            ),
          );
        },
      );
      if (response != null) {
        debugPrint('date & time data: $response');
        try {
          Map<String, dynamic> mapResponse = {};
          if (response is Map) {
            response.forEach((key, value) {
              mapResponse[key.toString()] = value;
            });
          }
          setRideType(mapResponse);
        } catch (e) {
          debugPrint('Error casting response: $e');
        }
      }
    }
  }

  void setRideType(Map<String, dynamic> response) async {
    RideType rideType = response['RideType'];
    DateTime dateTime = response[AppConstants.ride_date_time];

    if (rideType == RideType.RIDE_NOW) {
      rentalRideDateController.text = 'Now';
    } else {
      String formattedDate = DateFormat('dd/MM/yy').format(dateTime);
      String formattedTime = DateFormat('hh:mm a').format(dateTime);
      rentalRideDateController.text = '$formattedDate\n$formattedTime';
    }
    selectedDateTime = dateTime;
    notifyListeners();
  }

  void incrementHours() {
    if (rentalPackages.isNotEmpty == true) {
      int selectedPackageIndex =
          rentalPackages.indexWhere((i) => i.hour == selectedPackage?.hour);
      if (selectedPackageIndex != -1) {
        selectedPackageIndex++;
        if (selectedPackageIndex < rentalPackages.length) {
          selectedPackage = rentalPackages[selectedPackageIndex];
          notifyListeners();
        }
      }
    }
  }

  void decrementHours() {
    // int prevHour = (selectedPackage?.hour ?? 0) - 1;
    //
    // if (prevHour >= minHours) {
    //   selectedPackage = rentalPackages.firstWhere(
    //     (p) => p.hour == prevHour,
    //     orElse: () => selectedPackage ?? rentalPackages.first,
    //   );
    //
    //   // selectedHours = selectedPackage?.hour ?? 0;
    //   // selectedKm = selectedPackage?.km ?? 0;
    //
    //   notifyListeners();
    // }
    if (rentalPackages.isNotEmpty == true) {
      int selectedPackageIndex =
          rentalPackages.indexWhere((i) => i.hour == selectedPackage?.hour);
      if (selectedPackageIndex > 0) {
        selectedPackageIndex--;
        if (selectedPackageIndex < rentalPackages.length) {
          selectedPackage = rentalPackages[selectedPackageIndex];
          notifyListeners();
        }
      }
    }
  }

  void updateKmBySlider(double value) {
    int newKm = value.round();

    selectedPackage = rentalPackages.firstWhere(
      (data) => data.km! >= newKm,
      orElse: () => rentalPackages.last,
    );

    // selectedHours = package.hour!;
    // selectedKm = package.km!;
    notifyListeners();
  }

  void getRentalList() async {
    try {
      minKm = 0;
      maxKm = 0;
      minHours = 0;
      maxHours = 0;
      selectedPackage = null;
      selectedHours = 0;
      selectedKm = 0;
      rentalPackages = [];
      rentalModel = null;
      notifyListeners();

      var map = {
        AppConstants.pick_lat: pickupLocationLatLng.latitude.toString(),
        AppConstants.pick_lng: pickupLocationLatLng.longitude.toString(),
      };

      final response =
          await apiHelper.post(AppUrls.rentalPackages, params: map);

      response.fold((e) {
        showErrorDialog(errorModel: e);
        notifyListeners();
      }, (r) {
        final model = parseData(r.data, RentalPackageModel.fromJson);
        if (model != null) {
          rentalModel = model;
          minHours = model.minHr ?? 0;
          maxHours = model.maxHr ?? 0;
          minKm = model.minKm ?? 0;
          maxKm = model.maxKm ?? 0;
          rentalPackages = model.package ?? [];

          rentalPackages.sort((a, b) {
            int hourCompare = (a.hour ?? 0).compareTo(b.hour ?? 0);
            if (hourCompare != 0) return hourCompare;

            return (a.km ?? 0).compareTo(b.km ?? 0);
          });

          if (rentalPackages.isNotEmpty) {
            selectedPackage = rentalPackages.first;
            selectedHours = selectedPackage?.hour ?? 0;
            selectedKm = selectedPackage?.km ?? 0;

            minKm = rentalPackages.first.km ?? 0;
            maxKm = rentalPackages.last.km ?? 0;

            minHours = rentalPackages.first.hour ?? 0;
            maxHours = rentalPackages.last.hour ?? 0;
          }
          notifyListeners();
        } else {
          showErrorDialog(message: translation.txt_Something_went_wrong);
          notifyListeners();
        }
      });
    } catch (e) {
      showErrorDialog(message: e.toString());
      notifyListeners();
    }
  }

  void rentalConfirm() {
    final map = {
      "rentalModel": rentalModel,
      "selectedPackage": selectedPackage,
      "rentalPackage": rentalPackages,
      "pickUp": CustomAddressModel(pickupLocation, pickupLocationLatLng),
    };
    moveToNamed(CustomRouter.rentalRideConfirmScreen, args: map);
    notifyListeners();
  }

  void logoutUser() async {
    if (!isLoading.value) {
      isLoading.value = true;

      final map = {
        PreferenceHelper.refreshToken: preference.getString(
          PreferenceHelper.refreshToken,
        ),
      };

      final response = await apiHelper.post(AppUrls.logoutUser, params: map);
      response.fold(
        (e) {
          showErrorDialog(errorModel: e);
        },
        (r) {
          AppConstants.userWalletBalance = null;
          preference.setString(PreferenceHelper.demoKey, "");
          preference.remove(PreferenceHelper.demoKey);
          preference.setString(PreferenceHelper.authToken, "");
          preference.setString(PreferenceHelper.refreshToken, "");
          preference.remove(PreferenceHelper.authToken);
          preference.remove(PreferenceHelper.refreshToken);
          for (var i in mqtt.subscribedTopics) {
            if (i.isNotEmpty) {
              mqtt.unSubscribe(i);
            }
          }
          mqtt.disconnect();
          popAndMove(CustomRouter.loginScreen);
        },
      );
      isLoading.value = false;
    }
  }

  Future<void> advertisement(BuildContext context) async {
    if (!isAdLoaded) {
      showLoader();
      final response = await apiHelper.get(AppUrls.advertisement);
      hideLoader();

      response.fold((e) {
        preference.setBool(PreferenceHelper.isAd, false);
        showErrorDialog(errorModel: e);
      }, (r) {
        if (r.data is List && (r.data as List).isNotEmpty) {
          _advertisementData =
              AdvertisementModel.fromJson((r.data as List).first);
          _isAdShown = _advertisementData?.isAd == true;
          isAdLoaded = true;
          preference.setBool(PreferenceHelper.isAd, isAdLoaded);
          // Mark as loaded
          // moveAndWait(CustomRouter.userBlockScreen,args: advertisementData);
          showDialog(
            context: context,
            barrierDismissible: false,
            barrierColor: Colors.black.withAlpha(50),
            builder: (BuildContext context) {
              return UserBlockScreen(
                  args: advertisementData ?? AdvertisementModel());
            },
          );
        } else {
          _isAdShown = false;
          isAdLoaded = true;
        }
        notifyListeners();
      });
    }
  }

  void checkZoneAddress(LatLng latLng) async {
    var map = {'pick_lat': latLng.latitude, 'pick_lng': latLng.longitude};
    var response = await apiHelper.post(AppUrls.checkZOne, params: map);
    response.fold((e) => showErrorDialog(errorModel: e), (r) {
      if (r.data == true) {
        isPickupChange = false;
        isFetchingPickupLocation = false;
        isMapPaddingAdjusted = false;
        var isAdShown = preference.getBool(PreferenceHelper.isAd);
        if (!isActiveTrip) {
          if (isAdShown == null) {
            // advertisement(navigatorKey.currentContext!);
          }
        }
      } else {
        isPickupChange = true;
        isMapPaddingAdjusted = true;
        isFetchingPickupLocation = true;
        showErrorDialog(message: "Your pickup location is out of zone");
      }
    });
    isLoading.value = false;
    notifyListeners();
  }

  void disposeMapSubscriptions() {
    _allDriversSubscription?.cancel();
    _driverChangesSubscription?.cancel();
    _allDriversSubscription = null;
    _driverChangesSubscription = null;
  }

  @override
  void dispose() {
    disposeMapSubscriptions();
    isDisposed = true;
    super.dispose();
  }
}

void processAllDrivers(SendPort mainSendPort) async {
  final ReceivePort isolateReceivePort = ReceivePort();
  mainSendPort.send(isolateReceivePort.sendPort);
  SendPort? processedDataSendPort;
  isolateReceivePort.listen((message) {
    if (message is SendPort) {
      processedDataSendPort = message;
    } else if (message is String) {
      final decodedData = jsonDecode(message);
      final driversList = List<MqttDriverModel>.from(
        decodedData.map((model) => MqttDriverModel.fromJson(model)),
      );
      processedDataSendPort?.send(driversList);
    }
  });
}
