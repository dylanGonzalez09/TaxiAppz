import 'dart:async';
import 'dart:convert';
import 'dart:isolate';
import 'package:flutter/material.dart';
import 'package:flutter_polyline_points/flutter_polyline_points.dart';
import 'package:go_router/go_router.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:intl/intl.dart';
import 'package:user/utils/utils.dart';

import '../../main.dart';
import '../../models/custom_stop_model.dart';
import '../../models/enums.dart';
import '../../network/response_models/custom_name_model.dart';
import '../../network/response_models/destination_model.dart';
import '../../network/response_models/mqtt_driver_model.dart';
import '../../network/response_models/promo_model.dart';
import '../../network/response_models/reqin_progress_model.dart';
import '../../network/response_models/trip_model.dart';
import '../../network/response_models/types_model.dart';
import '../../utils/app_constants.dart';
import '../../utils/app_url.dart';
import '../../utils/base_vm.dart';
import '../../utils/custom_images.dart';
import '../../utils/custom_router.dart';
import '../../utils/dimensions.dart';
import '../bottomsheets/fare_details/fare_details_bs.dart';
import '../bottomsheets/payment_method_bs/payment_method_bs.dart';
import '../bottomsheets/ridertypesselection/rider_types_selection.dart';
import '../map/map_vm.dart';

import '../bottomsheets/date_picker_bs/date_picker_bs.dart';
import '../tripscreen/trip_screen_vm.dart';

class RideConfirmVm extends BaseVm {
  final titleViewKey = GlobalKey();
  final bottomSheetKey = GlobalKey();
  double mapTopPadding = 0;
  double mapBottomPadding = 0;
  bool showStopLabel = false;
  bool showStops = false, isNoDriverFoundAlertShown = false;
  String currencySymbol = "";
  bool isConstraintSet = false;
  String pickupLocation = "", riderName = "", riderPhoneNumber = "";
  String dropLocation = "";
  String stopLocation = "";
  bool isShimmerLoading = true;
  bool showTripWaiting = false;
  late CustomAddressModel pickupModel;
  late CustomAddressModel dropModel;
  CustomAddressModel? stopModel;
  List<ZoneTypePrice> vehicleModelDetails = [];
  final marker = <Marker>{};
  String selectedVehicleId = "";
  PolylinePoints polylinePoints = PolylinePoints();
  PolylineResult? polyLines;
  GoogleMapController? mapController;
  Map<PolylineId, Polyline> polylines = {};
  List<LatLng> polylineCoordinates = [];
  bool isDisposed = false;
  int selectedIndex = 0;
  List<MqttDriverModel> availableDriver = [];
  Trip? tripModel;
  final TextEditingController rideDateController = TextEditingController();
  bool isMapPaddingChanged = true;
  PromoModel? promoModel;
  TypesModel? typesModel;
  DateTime selectedDateTime = DateTime.now().add(const Duration(minutes: 30));
  List<CustomNameModel> paymentTypeList = [];
  CustomNameModel? paymentTypeModel;

  CameraPosition getInitialCameraPosition() {
    return CameraPosition(target: getSavedCurrentLocation(), zoom: 18);
  }

  double progressWidth = 0;
  bool increasing = true;
  Timer? timer;
  bool isRentalChoosing = false, isBookingForOthers = false;
  String totalAmount = "";

  @override
  void notifyListeners() {
    if (!isDisposed) {
      super.notifyListeners();
    }
  }

  void setInitialData(Map<String, dynamic> map) async {
    isBookingForOthers = map.containsKey(AppConstants.riderName) &&
        map.containsKey(AppConstants.phoneNumber);
    if (isBookingForOthers) {
      riderName = map[AppConstants.riderName];
      riderPhoneNumber = map[AppConstants.phoneNumber];
    } else {
      riderName = "Myself";
    }
    pickupModel = map["pickup"];
    dropModel = map["drop"];
    if (map.containsKey("stop")) {
      showStops = true;
      showStopLabel = true;
      stopModel = map['stop'];
      stopLocation = stopModel?.address ?? "";
    }
    pickupLocation = pickupModel.address;
    dropLocation = dropModel.address;
    const config = ImageConfiguration(size: Size(60, 60));
    final pickupMarker = Marker(
        markerId: MarkerId(MakerIds.pickupLocation.name),
        position: pickupModel.latLng,
        rotation: 0,
        anchor: const Offset(0.5, 0.8),
        icon: await BitmapDescriptor.asset(
            config, CustomImages.currentLocationMarker));
    final dropMarker = Marker(
        markerId: MarkerId(MakerIds.dropLocation.name),
        position: dropModel.latLng,
        anchor: const Offset(0.5, 0.8),
        rotation: 0,
        icon: await BitmapDescriptor.asset(config, CustomImages.dropMarker));
    marker.add(pickupMarker);
    marker.add(dropMarker);
    if (stopModel != null) {
      final stopMarker = Marker(
          markerId: MarkerId(MakerIds.stopLocation.name),
          position: stopModel!.latLng,
          rotation: 0,
          anchor: const Offset(0.5, 0.8),
          icon: await BitmapDescriptor.asset(config, CustomImages.stopMarker));
      marker.add(stopMarker);
    }
    getPolyLines();
  }

  void onAddRemoveStops() {
    showStops = !showStops;
    notifyListeners();
  }

  Future<void> getTypes() async {
    isShimmerLoading = true;
    DateTime now = DateTime.now();
    String formattedDate = DateFormat('yyyy-MM-dd').format(now);
    String time = DateFormat('HH:mm:ss').format(now);
    final stops = [];
    if (stopModel != null) {
      final stop = CustomStopModel(
          latitude: stopModel!.latLng.latitude,
          longitude: stopModel!.latLng.longitude,
          address: stopModel!.address);
      stops.add(stop.toJson());
    }

    final map = <String, dynamic>{
      AppConstants.ride_date: formattedDate,
      AppConstants.drop_lat: dropModel.latLng.latitude,
      AppConstants.drop_long: dropModel.latLng.longitude,
      AppConstants.drop_address: dropModel.address,
      AppConstants.pick_lat: pickupModel.latLng.latitude,
      AppConstants.pick_lng: pickupModel.latLng.longitude,
      AppConstants.pickup_address: pickupModel.address,
      AppConstants.ride_time: time,
      if (stops.isNotEmpty) AppConstants.stops: stops,
      AppConstants.ride_type: RideType.RIDE_NOW.name,
      if (promoModel?.id?.isNotEmpty == true)
        AppConstants.promoCode: promoModel?.id,
    };
    final response = await apiHelper.post(AppUrls.getEta, params: map);
    isShimmerLoading = false;
    response.fold((e) {
      if (promoModel != null) {
        promoModel = null;
        notifyListeners();
      }
      showErrorDialog(errorModel: e);
    }, (r) async {
      final model = parseData(r.data, TypesModel.fromJson);
      if (model != null) {
        typesModel = model;
        currencySymbol = model.currencySymbol ?? "";
        paymentTypeList.clear();
        if (typesModel?.paymentTypes?.isNotEmpty == true) {
          for (var i in typesModel!.paymentTypes!) {
            paymentTypeList.add(CustomNameModel(
                isSelected: false, id: i.toUpperCase(), name: i));
          }
          if (paymentTypeModel == null) {
            if (paymentTypeList.isNotEmpty == true) {
              paymentTypeList.first.isSelected = true;
              paymentTypeModel = paymentTypeList.first;
            } else {
              paymentTypeModel = CustomNameModel(
                  id: AppConstants.cash.toUpperCase(),
                  name: AppConstants.cash.toUpperCase(),
                  isSelected: true);
            }
          } else {
            paymentTypeList.forEach((i) {
              if (i.id?.toUpperCase() == paymentTypeModel?.id?.toUpperCase()) {
                i.isSelected = paymentTypeModel?.isSelected == true;
              } else {
                i.isSelected = false;
              }
            });
          }
        } else {
          paymentTypeModel = CustomNameModel(
              id: AppConstants.cash.toUpperCase(),
              name: AppConstants.cash.toUpperCase(),
              isSelected: true);
        }
        vehicleModelDetails.clear();
        if (model.zoneTypePrice != null) {
          if (model.zoneTypePrice!.isNotEmpty) {
            selectedVehicleId = model.zoneTypePrice!.first.typeId ?? "";
            model.zoneTypePrice!.first.isSelected = true;
            selectedIndex = 0;
          }
          vehicleModelDetails.addAll(model.zoneTypePrice!);
        }
        if (vehicleModelDetails.isNotEmpty) {
          for (var i in vehicleModelDetails) {
            i.unit = typesModel?.unit ?? "";
            i.currencySymbol = typesModel?.currencySymbol ?? "";
            i.pricePerDistanceUnit = calculatePricePerDistanceUnit(
                i.distance ?? 0, i.baseDistance ?? 0);
            i.pricePerDistanceCost = calculatePricePerDistanceCost(
                i.pricePerDistanceUnit ?? 0,
                i.basePricePerDistance ?? 0,
                i.basePrice ?? 0);
          }

          // FIXED: Calculate ETA for all vehicle types initially
          await calculateEtaForAllDrivers(null);
        }
        notifyListeners();
      } else {
        showErrorDialog(message: translation.txt_Something_went_wrong);
      }
    });
  }

  double calculatePricePerDistanceUnit(
      double totalDistance, double baseDistance) {
    return double.tryParse((totalDistance - baseDistance).toStringAsFixed(2)) ??
        0;
  }

  double calculatePricePerDistanceCost(double pricePerDistanceUnit,
      double pricePerDistanceValue, double basePrice) {
    return pricePerDistanceUnit * pricePerDistanceValue;
  }

  double calculateTotalAmountWithPricePerDistanceCost(
      double totalAmount, double pricePerDistanceCost) {
    return totalAmount + pricePerDistanceCost;
  }

  void onVehicleTypeSelected(int index) async {
    if (!isLoading.value) {
      for (var i in vehicleModelDetails) {
        i.isSelected = false;
      }
      selectedIndex = index;
      vehicleModelDetails[index].isSelected = true;
      selectedVehicleId = vehicleModelDetails[index].typeId ?? "";
      totalAmount = vehicleModelDetails[index].totalAmount?.round().toStringAsFixed(2) ?? "";

      marker.removeWhere((item) =>
      item.markerId.value != "dropLocation" &&
          item.markerId.value != "pickupLocation" &&
          item.markerId.value != "stopLocation");

      if (stopModel != null) {
        const config = ImageConfiguration(size: Size(60, 60));
        final stopMarker = Marker(
            markerId: MarkerId(MakerIds.stopLocation.name),
            position: stopModel!.latLng,
            rotation: 0,
            anchor: const Offset(0.5, 0.8),
            icon: await BitmapDescriptor.asset(config, CustomImages.stopMarker));
        debugPrint("Adding stop marker: ${stopModel!.latLng}");
        marker.add(stopMarker);
      } else {
        debugPrint("stopModel is null");
      }
      _handleTypeSelected();
      notifyListeners();
    }
  }

  void _handleTypeSelected() async {
    marker.removeWhere((test) =>
    test.markerId.value != MakerIds.pickupLocation.name &&
        test.markerId.value != MakerIds.dropLocation.name &&
        test.markerId.value != MakerIds.stopLocation.name);

    for (var i in availableDriver) {
      if (i.isOnline == true &&
          i.isAvailable == true &&
          i.vehicleId == selectedVehicleId) {
        marker.removeWhere((marker) => marker.markerId.value == i.sId);

        final latLng = LatLng(i.latitude ?? 0, i.longitude ?? 0);
        const configuration =
        ImageConfiguration(size: Size(17, 32), devicePixelRatio: 2);
        final newMarker = Marker(
            markerId: MarkerId(i.sId ?? ""),
            position: latLng,
            rotation: i.bearing ?? 0,
            icon: await BitmapDescriptor.asset(
                configuration, CustomImages.driverMarker,
                height: 32, width: 17));
        marker.add(newMarker);
      }
    }

    // Recalculate ETA for the selected vehicle type
    await calculateEtaForAllDrivers(selectedVehicleId);
    notifyListeners();
  }

  void getPolyLines() async {
    final polyDataMap = <String, dynamic>{};
    if (stopModel != null) {
      polyDataMap["stopLng"] = stopModel?.latLng.longitude;
      polyDataMap["stopLat"] = stopModel?.latLng.latitude;
    }
    polyDataMap["dropLng"] = dropModel.latLng.longitude;
    polyDataMap["dropLat"] = dropModel.latLng.latitude;
    polyDataMap["pickLat"] = pickupModel.latLng.latitude;
    polyDataMap["pickLng"] = pickupModel.latLng.longitude;
    polylineCoordinates.clear();
    polylineCoordinates.addAll(await getPolylineFromRoutes(polyDataMap));
    if (polylineCoordinates.isNotEmpty) {
      _addPolyLine();
    }
  }

  void onMapReady(GoogleMapController controller) async {
    mapController = controller;
    final latLngList = [pickupModel.latLng, dropModel.latLng];
    if (stopModel != null) {
      latLngList.add(stopModel!.latLng);
    }
    mapController?.animateCamera(
        CameraUpdate.newLatLngBounds(computeBounds(latLngList), 70));
  }

  _addPolyLine() {
    PolylineId id = const PolylineId("poly");
    Polyline polyline = Polyline(
      polylineId: id,
      color: Colors.black,
      points: polylineCoordinates,
      width: 3,
    );
    polylines[id] = polyline;
    notifyListeners();
  }

  void setConstraints(double maxHeight) {
    if (!isConstraintSet) {
      isConstraintSet = true;
      debugPrint("receivedConstraint $maxHeight");
      mapBottomPadding = maxHeight;
      notifyListeners();
    }
  }

  StreamSubscription? listenForDriverChangesStream;

  void listenForDriverChanges() async {
    await mqtt.subscribe(AppConstants.listenDrivers);
    await listenForDriverChangesStream?.cancel();
    listenForDriverChangesStream =
        mqtt.messageController.stream.listen((onData) async {
      if (onData[AppConstants.topic] == AppConstants.listenDrivers) {
        final jsonData = jsonDecode(onData[AppConstants.response] ?? "");
        final driver = MqttDriverModel.fromJson(jsonData);
        availableDriver.removeWhere((w) =>
            !Utils.isLastUpdatedTimesIsWithinFifteenSeconds(w.lastUpdated));
        marker.removeWhere((marker) => marker.markerId.value == driver.sId);
        if (driver.serviceType?.isNotEmpty == true &&
            driver.serviceType!.contains(AppConstants.local.toUpperCase()) &&
            Utils.isLastUpdatedTimesIsWithinFifteenSeconds(
                driver.lastUpdated)) {
          if (driver.isOnline == false || driver.isAvailable == false) {
            availableDriver.removeWhere((test) => test.sId == driver.sId);
            calculateEtaForAllDrivers(driver.vehicleId);
          } else {
            final index =
                availableDriver.indexWhere((test) => test.sId == driver.sId);
            if (index == -1) {
              availableDriver.add(driver);
            } else {
              availableDriver.removeAt(index);
              availableDriver.add(driver);
            }
            calculateEtaForAllDrivers(driver.vehicleId);
            if (driver.vehicleId == selectedVehicleId &&
                driver.isAvailable == true &&
                driver.isOnline == true) {
              const config = ImageConfiguration(size: Size(17, 32));
              final latLng =
                  LatLng(driver.latitude ?? 0, driver.longitude ?? 0);
              final newMarker = Marker(
                  markerId: MarkerId(driver.sId ?? ""),
                  position: latLng,
                  rotation: driver.bearing ?? 0,
                  icon: await BitmapDescriptor.asset(
                      config, CustomImages.driverMarker));
              marker.add(newMarker);
              final eta = await calculateEta(pickupModel.latLng,
                  LatLng(driver.latitude ?? 0, driver.longitude ?? 0));
              for (var i in vehicleModelDetails) {
                if (i.typeId == driver.vehicleId) {
                  if (i.estimatedTime! < 0) {
                    i.estimatedTime = eta;
                  } else {
                    if (i.estimatedTime! > eta) {
                      i.estimatedTime = eta;
                    }
                  }
                }
              }
            }
          }
        }
        notifyListeners();
      }
    });
  }

  void reqInProgress() async {
    showLoader();
    notifyListeners();
    final response = await apiHelper.get(AppUrls.reqInProgress);
    hideLoader();
    notifyListeners();
    response.fold((e) => showErrorDialog(errorModel: e), (r) {
      final model = parseData(r.data, ReqInProgressModel.fromJson);
      if (model?.trip != null && model?.trip?.isDriverStarted == true) {
        popAndMove(CustomRouter.tripScreen, args: model!.trip!);
      }
      debugPrint("tripStartResponse   ${model?.trip?.requestNumber}");
    });
  }

  StreamSubscription? getAllDriversStream;

  void getAllDrivers() async {
    final setString = <String>{};
    await mqtt.subscribe("${AppConstants.getAllDrivers}${getUserId()}");
    final map = <String, String>{
      AppConstants.userId: getUserId(),
      AppConstants.latitude: pickupModel.latLng.latitude.toString(),
      AppConstants.longitude: pickupModel.latLng.longitude.toString(),
      AppConstants.bearing: "0",
    };
    mqtt.publish(
      AppConstants.postAllDrivers,
      jsonEncode(map),
    );
    await getAllDriversStream?.cancel();
    getAllDriversStream = mqtt.messageController.stream.listen((data) async {
      if (data[AppConstants.topic] ==
          "${AppConstants.getAllDrivers}${getUserId()}") {
        if (!setString.contains(data[AppConstants.response])) {
          setString.add(data[AppConstants.response] ?? "");
          debugPrint("AlldrviersResponse ${data[AppConstants.response] ?? ""}");
          mqtt.unSubscribe("${AppConstants.getAllDrivers}${getUserId()}");
          ReceivePort mainReceivePort = ReceivePort();
          await Isolate.spawn(processAllDrivers, mainReceivePort.sendPort);
          final SendPort isolateSendPort =
          await mainReceivePort.first as SendPort;
          ReceivePort processedDataReceivePort = ReceivePort();
          isolateSendPort.send(processedDataReceivePort.sendPort);
          isolateSendPort.send(data[AppConstants.response]);
          processedDataReceivePort.listen((processedData) async {
            if (processedData is List<MqttDriverModel>) {
              for (var i in processedData) {
                if (i.isOnline == true &&
                    i.isAvailable == true &&
                    (i.serviceType?.isNotEmpty == true &&
                        i.serviceType!
                            .contains(AppConstants.local.toUpperCase())) &&
                    Utils.isLastUpdatedTimesIsWithinFifteenSeconds(
                        i.lastUpdated)) {
                  availableDriver.add(i);
                }
              }
              handleDrivers();
            }
          });
          listenForDriverChanges();
        }
      }
    });
  }

  Future<void> calculateEtaForAllDrivers(String? vehicleId) async {
    if (vehicleId == null) {
      // Calculate ETA for all vehicle types
      for (var i in vehicleModelDetails) {
        int? calculatedEta;
        for (var driver in availableDriver) {
          if (i.typeId == driver.vehicleId) {
            final newEta = await calculateEta(pickupModel.latLng,
                LatLng(driver.latitude ?? 0, driver.longitude ?? 0));
            if (calculatedEta == null) {
              calculatedEta = newEta;
            } else {
              if (newEta < calculatedEta) {
                calculatedEta = newEta;
              }
            }
          }
        }
        i.estimatedTime = calculatedEta ?? -1;
      }
    } else {
      // Calculate ETA for specific vehicle type
      int? calculatedEta;
      for (var driver in availableDriver) {
        if (vehicleId == driver.vehicleId) {
          final newEta = await calculateEta(pickupModel.latLng,
              LatLng(driver.latitude ?? 0, driver.longitude ?? 0));
          if (calculatedEta == null) {
            calculatedEta = newEta;
          } else {
            if (newEta < calculatedEta) {
              calculatedEta = newEta;
            }
          }
        }
      }

      final index =
      vehicleModelDetails.indexWhere((test) => test.typeId == vehicleId);
      if (index != -1) {
        vehicleModelDetails[index].estimatedTime = calculatedEta ?? -1;
      }
    }
    notifyListeners();
  }


  Future<void> createRideNowRequest(BuildContext context) async {
    isLoading.value = true;
    notifyListeners();
    final List<CustomAddressModel>? stops =
    stopModel != null ? [stopModel!] : null;

    final map = getCreateLocalRequestParams(
        pickUp: pickupModel,
        drop: dropModel,
        bookingFor: isBookingForOthers
            ? BookingFor.OTHERS.name
            : BookingFor.MYSELF.name,
        paymentOpt: paymentTypeModel?.id ?? AppConstants.cash.toUpperCase(),
        rideType: RideType.RIDE_NOW.name,
        tripType: TripType.LOCAL.name,
        typeId: selectedVehicleId,
        isLater: false,
        promoCode: promoModel?.id,
        stops: stops,
        riderName: isBookingForOthers ? riderName : null,
        riderPhoneNumber: isBookingForOthers ? riderPhoneNumber : null);
    /*map['estimatedAmount'] = totalAmount != "" ? totalAmount : vehicleModelDetails.first.totalAmount?.round().toStringAsFixed(2) ?? "";*/
    final request = await apiHelper.post(AppUrls.requestCreate, params: map);

    isLoading.value = false;
    notifyListeners();

    request.fold(
          (e) => showErrorDialog(errorModel: e,onClick: () {
        GoRouter.of(context).pop();
        print("frkoeofergeg${e.message}");
        if (e.message.toLowerCase() == "wallet balance is negative. please recharge.") {
          walletScreen();
        }
      }),
          (r) {
        if (r.data is Map<String, dynamic>) {
          tripModel = Trip.fromJson(r.data);
          showTripWaiting = true;
          progressWidth = 0;
          isNoDriverFoundAlertShown = false;
          isMapPaddingChanged = true;
          debugPrint("cancelTripRequestTesting  ${tripModel?.requestNumber}");
          notifyListeners();
        }
      },
    );
  }
  void walletScreen() {
    moveToNamed(CustomRouter.walletScreen);
  }
  Future<void> createRideLaterRequest(BuildContext context) async {
    isLoading.value = true;
    notifyListeners();
    final List<CustomAddressModel> stops =
    stopModel != null ? [stopModel!] : [];
    final map = getCreateLocalRequestParams(
        pickUp: pickupModel,
        drop: dropModel,
        bookingFor: isBookingForOthers
            ? BookingFor.OTHERS.name
            : BookingFor.MYSELF.name,
        paymentOpt: paymentTypeModel?.id ?? AppConstants.cash.toUpperCase(),
        rideType: RideType.RIDE_LATER.name,
        tripType: TripType.LOCAL.name,
        typeId: selectedVehicleId,
        isLater: true,
        tripTime: rideDateController.text.isNotEmpty == true
            ? convertToMilliSecond(rideDateController.text)
            : "",
        promoCode: promoModel?.id,
        stops: stops,
        riderName: isBookingForOthers ? riderName : null,
        riderPhoneNumber: isBookingForOthers ? riderPhoneNumber : null);
        /*map['estimatedAmount'] = totalAmount != "" ? totalAmount : vehicleModelDetails.first.totalAmount?.round().toStringAsFixed(2) ?? "";*/

    final request = await apiHelper.post(AppUrls.requestCreate, params: map);
    isLoading.value = false;
    notifyListeners();
    request.fold(
          (e) => showErrorDialog(errorModel: e,onClick: () {
        GoRouter.of(context).pop();
        if (e.message.toLowerCase() == "wallet balance is negative. please recharge.") {
          walletScreen();
        }
      }),
          (r) {
        if (r.data is Map<String, dynamic>) {
          // tripModel = Trip.fromJson(r.data);
          // showTripWaiting = true;
          // isMapPaddingChanged = true;
          showErrorDialog(
            buttonTxt: translation.txt_Ok,
            canDismiss: false,
            message: translation.txt_ride_later_success,
            onClick: () {
              popAndMove(CustomRouter.mapScreen);
            },
          );
          notifyListeners();
        }
      },
    );
  }

  void startProgressLoop() {
    timer ??= Timer.periodic(const Duration(milliseconds: 600), (timer) {
      if (increasing) {
        progressWidth += 3; // Increment progress
        if (progressWidth >=
            MediaQuery.of(navigatorKey.currentState!.context).size.width * 0.9) {
          increasing = false; // Change direction
        }
      } else {
        progressWidth =
            MediaQuery.of(navigatorKey.currentState!.context).size.width * 0.7;
        increasing = true;
      }
      notifyListeners();
    });
  }

  void subscribeToVehicleTypeReceiver() async {
    mqtt.subscribe("${AppConstants.getVehicle}${getUserId()}");
  }

  void unSubscribeToVehicleTypeReceiver() async {
    mqtt.subscribe("${AppConstants.getVehicle}${getUserId()}");
  }

  void showDatePicker() async {
    if (navigatorKey.currentState != null) {
      final response = await showModalBottomSheet(
          context: navigatorKey.currentState!.context,
          backgroundColor: Colors.white,
          isDismissible: true,
          isScrollControlled: true,
          enableDrag: false,
          shape: const RoundedRectangleBorder(
              borderRadius: BorderRadius.only(
                  topLeft: Radius.circular(20), topRight: Radius.circular(20))),
          builder: (context) {
            return Padding(
              padding: EdgeInsets.only(
                bottom: MediaQuery.of(context).viewInsets.bottom,
              ),
              child: DatePickerBs(
                  initialDateTime: selectedDateTime.isBefore(DateTime.now())
                      ? DateTime.now()
                      : selectedDateTime),
            );
          });
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
      rideDateController.text = 'Ride Now';
    } else {
      String formattedDateTime =
      DateFormat('dd/MM/yyyy hh:mm a').format(dateTime);
      rideDateController.text = formattedDateTime;
    }
    selectedDateTime = dateTime;
    notifyListeners();
  }

  void onTripCancel() async {
    showLoader();
    final map = {
      AppConstants.requestId: tripModel?.sId,
      AppConstants.latitude: getSavedCurrentLocation().latitude,
      AppConstants.longitude: getSavedCurrentLocation().longitude,
      AppConstants.role: "User"
    };
    final response = await apiHelper.post(AppUrls.tripCancel, params: map);

    hideLoader();
    response.fold((e) => showErrorDialog(errorModel: e), (r) {
      showTripWaiting = false;
      notifyListeners();
    });
  }

  void showFareDetails(int index) async {
    if (navigatorKey.currentState != null) {
      final response = await showModalBottomSheet(
        context: navigatorKey.currentState!.context,
        isScrollControlled: true,
        backgroundColor: Colors.white,
        builder: (BuildContext context) {
          return SingleChildScrollView(
            child: FareDetailsBs(vehicle: vehicleModelDetails[index]),
          );
        },
      );
    }
  }

  void handleDrivers() async {
    if (availableDriver.isNotEmpty && vehicleModelDetails.isNotEmpty) {
      // Calculate ETA for all vehicle types
      await calculateEtaForAllDrivers(null);

      // Add markers for selected vehicle type
      for (var i in availableDriver) {
        if (i.vehicleId == selectedVehicleId) {
          marker.removeWhere((marker) => marker.markerId.value == i.sId);
          const config = ImageConfiguration(size: Size(17, 32));
          final latLng = LatLng(i.latitude ?? 0, i.longitude ?? 0);
          final newMarker = Marker(
              markerId: MarkerId(i.sId ?? ""),
              position: latLng,
              rotation: i.bearing ?? 0,
              icon: await BitmapDescriptor.asset(
                  config, CustomImages.driverMarker));
          marker.add(newMarker);
        }
      }
      notifyListeners();
    }
  }

  StreamSubscription? listenForTripsStream;

  void listenForTrips() {
    // final lastData = <String>{};
    //final Set<String> lastData = {};
    listenForTripsStream?.cancel();
    listenForTripsStream = mqtt.messageController.stream.listen((onData) {
      if (onData[AppConstants.topic] ==
          "${AppConstants.userRequest}${getUserId()}") {
        // if (!lastData.contains(onData[AppConstants.response])) {
        //   lastData.add(onData[AppConstants.response] ?? '');
        try {
          final map = jsonDecode(onData[AppConstants.response] ?? '');
          debugPrint("ShowCancelMap ${map}");
          debugPrint("ShowCancelMap ${map["title"] == TRIPSTATUS.NO_DRIVERS}");
          if (map is Map<String, dynamic>) {
            if (map.containsKey("title")) {
              if (map["title"] == TRIPSTATUS.TRIP_ACCEPTED.name) {
                final data = map["trip"];
                final tripModel = Trip.fromJson(data);
                AppConstants.isBookingForOthersChanged = false;
                AppConstants.bookingForOthersRiderPhoneNumber = "";
                AppConstants.bookingForOthersRiderName = "";
                popAndMove(CustomRouter.tripScreen, args: tripModel);
              } else if (map["title"] == TRIPSTATUS.NO_DRIVERS.name) {
                showTripWaiting = false;
                if (!isNoDriverFoundAlertShown) {
                  isNoDriverFoundAlertShown = true;
                  showErrorDialog(
                      message:
                      "${map['message'] ?? translation.txtNoDriverFound}");
                  notifyListeners();
                }
              }
            }
          } else {
            reqInProgress();
          }
        } catch (e) {
          debugPrint("ShowCancelMap exception $e");
          reqInProgress();
        }
      }
      //  }
    });
  }

  void showRiderTypes(
      Function(String, String) onDataEntered,
      String initialName,
      String initialPhoneNumber,
      bool initialSelection) async {
    if (navigatorKey.currentState != null) {
      final response = await showModalBottomSheet(
          context: navigatorKey.currentState!.context,
          backgroundColor: Colors.white,
          isDismissible: true,
          isScrollControlled: true,
          enableDrag: false,
          shape: const RoundedRectangleBorder(
              borderRadius: BorderRadius.only(
                  topLeft: Radius.circular(Dimensions.padding_20),
                  topRight: Radius.circular(Dimensions.padding_20))),
          builder: (context) {
            return Padding(
              padding: EdgeInsets.only(
                bottom: MediaQuery.of(context).viewInsets.bottom,
              ),
              child: RiderTypesSelection(
                onDataEntered: onDataEntered,
                initialName: initialName,
                initialPhoneNumber: initialPhoneNumber,
                initialSelection: initialSelection,
              ),
            );
          });
    }
  }

  void updateRiderName(String newName) {
    riderName = newName;
    isBookingForOthers =
        riderName.toUpperCase() != AppConstants.myself.toUpperCase();
    AppConstants.isBookingForOthersChanged = true;
    AppConstants.bookingForOthersRiderName = riderName;
    notifyListeners();
  }

  void updatePhoneNumber(String newPhoneNumber) {
    riderPhoneNumber = newPhoneNumber;
    AppConstants.bookingForOthersRiderPhoneNumber = riderPhoneNumber;
    notifyListeners();
  }

  void showPaymentMethod() async {
    if (navigatorKey.currentState != null) {
      final response = await showModalBottomSheet(
          context: navigatorKey.currentState!.context,
          backgroundColor: Colors.white,
          isDismissible: true,
          isScrollControlled: true,
          enableDrag: false,
          shape: const RoundedRectangleBorder(
              borderRadius: BorderRadius.only(
                  topLeft: Radius.circular(20), topRight: Radius.circular(20))),
          builder: (_) {
            return PaymentMethodBs(
              paymentMethod: paymentTypeList,
            );
          });
      if (response is List<dynamic>) {
        paymentTypeList.clear();
        paymentTypeList.addAll(
            List.from(response.map((m) => CustomNameModel.fromJson(m))));
        paymentTypeModel = paymentTypeList.firstWhere((w) => w.isSelected);
        if (paymentTypeModel?.id?.toUpperCase() ==
            AppConstants.wallet.toUpperCase() &&
            !(AppConstants.userWalletBalance != null &&
                AppConstants.userWalletBalance! > 0 &&
                vehicleModelDetails[selectedIndex].totalAmount! <=
                    AppConstants.userWalletBalance!)) {

        }
        notifyListeners();
      }
    }
  }
}
