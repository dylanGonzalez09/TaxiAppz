import 'dart:async';
import 'dart:convert';
import 'dart:isolate';

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:intl/intl.dart';
import 'package:user/utils/utils.dart';

import '../../main.dart';
import '../../models/enums.dart';
import '../../network/response_models/custom_name_model.dart';
import '../../network/response_models/destination_model.dart';
import '../../network/response_models/mqtt_driver_model.dart';
import '../../network/response_models/promo_model.dart';
import '../../network/response_models/rental_package_model.dart';
import '../../network/response_models/reqin_progress_model.dart';
import '../../network/response_models/trip_model.dart';
import '../../ui/tripscreen/trip_screen_vm.dart';
import '../../utils/app_constants.dart';
import '../../utils/app_url.dart';
import '../../utils/base_vm.dart';
import '../../utils/custom_images.dart';
import '../../utils/custom_router.dart';
import '../../utils/dimensions.dart';
import '../bottomsheets/date_picker_bs/date_picker_bs.dart';
import '../bottomsheets/fare_details/rental/rental_fare_details_bs.dart';
import '../bottomsheets/payment_method_bs/payment_method_bs.dart';
import '../bottomsheets/ridertypesselection/rider_types_selection.dart';
import '../map/map_vm.dart';

class RentalVm extends BaseVm {
  final titleViewKey = GlobalKey();
  final bottomSheetKey = GlobalKey();
  double mapTopPadding = 0;
  double mapBottomPadding = 0;
  bool showStopLabel = false;
  bool showStops = false;
  String currencySymbol = "";
  List<Package> rentalPackages = [];
  Package? selectedPackage;
  bool isConstraintSet = false;
  String pickupLocation = "";
  String dropLocation = "";
  String stopLocation = "";
  bool isShimmerLoading = true;
  bool showTripWaiting = false, isBookingForOthers = false;
  late CustomAddressModel pickupModel;
  final marker = <Marker>{};
  String selectedVehicleId = "";
  VehiclePrices? selectedVehicle;
  GoogleMapController? mapController;
  bool isDisposed = false;
  int selectedIndex = 0;
  int hourPackage = 1;
  int distanceCount = 1;
  int minHours = 0;
  int maxHours = 0;
  int minKm = 0;
  int maxKm = 0;
  int selectedHours = 0;
  int selectedKm = 0;
  List<MqttDriverModel> availableDriver = [];
  Trip? tripModel;
  final TextEditingController rideDateController = TextEditingController();
  bool isMapPaddingChanged = true;
  RentalPackageModel? rentalModel;
  PromoModel? promoModel;
  String riderName = "Myself";
  String phoneNumber = "phoneNumber";
  DateTime selectedDateTime = DateTime.now().add(const Duration(minutes: 0));
  List<CustomNameModel> paymentTypeList = [];
  CustomNameModel? paymentTypeModel;
  String? totalAmount;

  CameraPosition getInitialCameraPosition() {
    return CameraPosition(target: getSavedCurrentLocation(), zoom: 10);
  }

  double progressWidth = 0;
  bool increasing = true;
  Timer? timer;
  bool isRentalChoosing = false;

  @override
  void notifyListeners() {
    if (!isDisposed) {
      super.notifyListeners();
    }
  }

  void setInitialData(Map<String, dynamic> map) async {
    var pickup = map['pickUp'];
    pickupModel = pickup;
    pickupLocation = pickupModel.address;
    const config = ImageConfiguration(size: Size(60, 60));
    final pickupMarker = Marker(
        markerId: MarkerId(MakerIds.pickupLocation.name),
        position: pickupModel.latLng,
        rotation: 0,
        anchor: const Offset(0.5, 0.8),
        icon: await BitmapDescriptor.asset(
            config, CustomImages.currentLocationMarker));
    marker.add(pickupMarker);
  }

  void handleDropArgs(Map data) async {
    pickupLocation = data['address'] ?? "";
    var latLng = data['latLng'] ?? (0.0, 0.0);
    pickupModel = CustomAddressModel(data['address'] ?? "", latLng);
    //selectedPackage= null;
    await getRentalList();
    marker.removeWhere((test) => test.markerId == MakerIds.pickupLocation.name);

    var latLngList = CameraPosition(
        target:
            LatLng(pickupModel.latLng.latitude, pickupModel.latLng.longitude),
        zoom: 12);
    mapController?.animateCamera(
      CameraUpdate.newCameraPosition(latLngList),
    );

    const config = ImageConfiguration(size: Size(60, 60));
    final pickupMarker = Marker(
        markerId: MarkerId(MakerIds.pickupLocation.name),
        position: pickupModel.latLng,
        rotation: 0,
        anchor: const Offset(0.5, 0.8),
        icon: await BitmapDescriptor.asset(
            config, CustomImages.currentLocationMarker));
    marker.add(pickupMarker);
    notifyListeners();
  }

  void onAddRemoveStops() {
    showStops = !showStops;
    notifyListeners();
  }

  void onVehicleTypeSelected(int index) {
    if (!isLoading.value) {
      if (selectedPackage != null &&
          selectedPackage?.vehiclePrices?.isNotEmpty == true) {
        for (var i in selectedPackage!.vehiclePrices!) {
          i.isSelected = false;
          i.estimatedTime = -1;
        }

        selectedIndex = index;
        selectedPackage!.vehiclePrices?[index].isSelected =
            !selectedPackage!.vehiclePrices![index].isSelected;
        selectedVehicleId =
            selectedPackage!.vehiclePrices![index].vehicleId ?? "";
        selectedVehicle = selectedPackage!.vehiclePrices![index];
        totalAmount = selectedPackage?.vehiclePrices?[index].price?.round().toStringAsFixed(2) ?? "";
        marker.removeWhere((item) =>
            item.markerId.value != "dropLocation" &&
            item.markerId.value != "pickupLocation");

        _handleTypeSelected();
        notifyListeners();
      }
    }
  }

  void onMapReady(GoogleMapController controller) async {
    mapController = controller;
    final latLngList = [pickupModel.latLng];
    mapController?.animateCamera(
        CameraUpdate.newLatLngBounds(computeBounds(latLngList), 70));
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

  void listenForDriverChanges() {
    mqtt.subscribe(AppConstants.listenDrivers);
    listenForDriverChangesStream?.cancel();
    listenForDriverChangesStream =
        mqtt.messageController.stream.listen((onData) async {
      if (onData[AppConstants.topic] == AppConstants.listenDrivers) {
        final jsonData = jsonDecode(onData[AppConstants.response] ?? "");
        final driver = MqttDriverModel.fromJson(jsonData);
        availableDriver.removeWhere((w) =>
            !Utils.isLastUpdatedTimesIsWithinFifteenSeconds(w.lastUpdated));
        marker.removeWhere((marker) => marker.markerId.value == driver.sId);
        if (driver.serviceType?.isNotEmpty == true &&
            driver.serviceType!.contains(AppConstants.rental.toUpperCase()) &&
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
              for (var i in selectedPackage!.vehiclePrices!) {
                if (i.vehicleId == driver.vehicleId) {
                  if (i.estimatedTime < 0) {
                    i.estimatedTime = eta;
                  } else {
                    if (i.estimatedTime > eta) {
                      i.estimatedTime = eta;
                    }
                  }
                }
              }
            }
          }
          notifyListeners();
        }
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
                            .contains(AppConstants.rental.toUpperCase())) &&
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

  void _handleTypeSelected() async {
    marker.removeWhere((test) =>
        test.markerId.value != MakerIds.pickupLocation.name &&
        test.markerId.value != MakerIds.dropLocation.name);
    for (var i in availableDriver) {
      if (i.isOnline == true &&
          i.isAvailable == true &&
          i.vehicleId == selectedVehicleId) {
        final latLng = LatLng(i.latitude ?? 0, i.longitude ?? 0);
        const configuration =
            ImageConfiguration(size: Size(17, 32), devicePixelRatio: 2);
        final marker = Marker(
            markerId: MarkerId(i.sId ?? ""),
            position: latLng,
            rotation: 0,
            icon: await BitmapDescriptor.asset(
                configuration, CustomImages.driverMarker,
                height: 32, width: 17));
        this.marker.add(marker);
        calculateEtaForAllDrivers(selectedVehicleId);
      } else {
        if (i.vehicleId != selectedVehicleId) {
          marker.removeWhere((test) =>
              test.markerId.value != MakerIds.pickupLocation.name &&
              test.markerId.value != MakerIds.dropLocation.name);
          debugPrint(
              "checkDriver offline ${i.vehicleId != selectedVehicleId} ");
          debugPrint("checkDriver offline ${i.driverId} ");
        }
      }
    }
    notifyListeners();
  }

  Future<void> calculateEtaForAllDrivers(String? vehicleId) async {
    debugPrint("CheckDriverEta ${vehicleId == null}");
    if (selectedPackage?.vehiclePrices != null) {
      if (vehicleId == null) {
        for (var i in selectedPackage!.vehiclePrices!) {
          int? calculatedEta;
          debugPrint("CheckDriverEta ${availableDriver.length}");
          for (var driver in availableDriver) {
            if (i.vehicleId == driver.vehicleId) {
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
        debugPrint("Called for eta $vehicleId");
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

        debugPrint(
            "Called for eta calculatedEta available driver${availableDriver.length}");
        debugPrint("Called for eta calculatedEta$calculatedEta");

        final index = selectedPackage!.vehiclePrices!
            .indexWhere((test) => test.vehicleId == vehicleId);
        if (index != -1) {
          selectedPackage!.vehiclePrices![index].estimatedTime =
              calculatedEta ?? -1;
        }
      }
    }
    notifyListeners();
  }

  Future<void> createRideNowRequest(BuildContext context) async {
    isLoading.value = true;
    notifyListeners();
    final map = getCreateRentalRequestParams(
        pickUp: pickupModel,
        bookingFor: isBookingForOthers
            ? BookingFor.OTHERS.name
            : BookingFor.MYSELF.name,
        paymentOpt: paymentTypeModel?.id ?? AppConstants.cash.toUpperCase(),
        rideType: RideType.RIDE_NOW.name,
        tripType: TripType.RENTAL.name,
        typeId: selectedVehicleId,
        vehicleType: selectedVehicle?.vehicleId ?? "",
        packageId: selectedPackage?.sId ?? "",
        isLater: false,
        promoCode: promoModel?.id,
        riderPhoneNumber: isBookingForOthers ? phoneNumber : null,
        riderName: isBookingForOthers ? riderName : null);
        /*map['estimatedAmount'] = totalAmount != "" ? totalAmount : selectedPackage?.vehiclePrices?.first.price?.round().toStringAsFixed(2) ?? "";*/

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
          tripModel = Trip.fromJson(r.data);
          showTripWaiting = true;
          progressWidth = 0;
          isMapPaddingChanged = true;
          notifyListeners();
        }
      },
    );
  }

  Future<void> createRideLaterRequest(BuildContext context) async {
    isLoading.value = true;
    notifyListeners();
    final map = getCreateRentalRequestParams(
        pickUp: pickupModel,
        bookingFor: isBookingForOthers
            ? BookingFor.OTHERS.name
            : BookingFor.MYSELF.name,
        paymentOpt: paymentTypeModel?.id ?? AppConstants.cash.toUpperCase(),
        rideType: RideType.RIDE_LATER.name,
        tripType: TripType.RENTAL.name,
        typeId: selectedVehicleId,
        isLater: true,
        vehicleType: selectedVehicle?.vehicleId ?? "",
        packageId: selectedPackage?.sId ?? "",
        tripTime: rideDateController.text.isNotEmpty == true
            ? convertToMilliSecond(rideDateController.text)
            : "",
        promoCode: promoModel?.id,
        riderPhoneNumber: isBookingForOthers ? phoneNumber : null,
        riderName: isBookingForOthers ? riderName : null);
        /*map['estimatedAmount'] = totalAmount != "" ? totalAmount : selectedPackage?.vehiclePrices?.first.price?.round().toStringAsFixed(2) ?? "";*/

    debugPrint(
        "smhfjhsdfljsdahfjsdajh converter ${convertToMilliSecond(rideDateController.text)}");
    debugPrint("smhfjhsdfljsdahfjsdajh text  ${rideDateController.text}");

    final request = await apiHelper.post(AppUrls.requestCreate, params: map);
    // ?search=&page=1&limit=10&rideType=RIDE_LATER&tripStatus="isCompleted

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

  void walletScreen() {
    moveToNamed(CustomRouter.walletScreen);
  }

  void startProgressLoop() {
    timer ??= Timer.periodic(const Duration(milliseconds: 600), (timer) {
      if (increasing) {
        progressWidth += 3;
        if (progressWidth >=
            MediaQuery.of(navigatorKey.currentState!.context).size.width *
                0.9) {
          increasing = false;
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
          return RentalFareDetailsBs(
              vehicle: selectedPackage!.vehiclePrices![index]);
        },
      );
    }
  }

  void handleDrivers() async {
    if (availableDriver.isNotEmpty &&
        selectedPackage?.vehiclePrices?.isNotEmpty == true) {
      int? eta;
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

          final calculatedEta = await calculateEta(
              pickupModel.latLng, LatLng(i.latitude ?? 0, i.longitude ?? 0));
          if (eta == null) {
            eta = calculatedEta;
          } else if (calculatedEta < eta) {
            eta = calculatedEta;
          }
        }
      }
      int index = selectedPackage!.vehiclePrices!
          .indexWhere((vehicle) => vehicle.vehicleId == selectedVehicleId);
      debugPrint("etaCheckData $eta");
      if (index != -1) {
        selectedPackage!.vehiclePrices![index].estimatedTime = eta ?? 0;
        notifyListeners();
      }
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
                popAndMove(CustomRouter.tripScreen, args: tripModel);
              } else if (map["title"] == TRIPSTATUS.NO_DRIVERS.name) {
                showErrorDialog(
                    message:
                        "${map['message'] ?? translation.txtNoDriverFound}");
                showTripWaiting = false;
                notifyListeners();
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
      // }
    });
  }

  Future<void> getRentalList() async {
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
        AppConstants.pick_lat: pickupModel.latLng.latitude.toString(),
        AppConstants.pick_lng: pickupModel.latLng.longitude.toString(),
        if (promoModel?.id?.isNotEmpty == true)
          AppConstants.promoCode: promoModel?.id,
      };

      final response = await apiHelper.post(AppUrls.rentalPackages, params: map);

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
    isRentalChoosing = true;
    notifyListeners();
  }

  void updateKmBySlider(double value) {
    int newKm = value.round();

    if (newKm != 0.0) {
      selectedPackage = rentalPackages.firstWhere(
        (data) => data.km! >= newKm,
        orElse: () => rentalPackages.last,
      );
      selectedPackage?.vehiclePrices?[0].isSelected = true;
    }
    notifyListeners();
  }

  void incrementHours() {
    // int nextHour = (selectedPackage?.hour ?? 0) + 1;
    //
    // if (nextHour <= maxHours) {
    //   selectedPackage = rentalPackages.firstWhere(
    //     (p) => p.hour == nextHour,
    //     orElse: () => selectedPackage ?? rentalPackages.first,
    //   );
    //   if (selectedPackage != null &&
    //       selectedPackage?.vehiclePrices?.isNotEmpty == true) {
    //     for (var i in selectedPackage!.vehiclePrices!) {
    //       i.isSelected = false;
    //     }
    //     selectedPackage?.vehiclePrices?[0].isSelected = true;
    //   }
    //
    //   notifyListeners();
    // }
    if (rentalPackages.isNotEmpty == true) {
      int selectedPackageIndex =
          rentalPackages.indexWhere((i) => i.hour == selectedPackage?.hour);
      if (selectedPackageIndex != -1) {
        selectedPackageIndex++;
        if (selectedPackageIndex < rentalPackages.length) {
          selectedPackage = rentalPackages[selectedPackageIndex];
          if (selectedPackage != null &&
              selectedPackage?.vehiclePrices?.isNotEmpty == true) {
            for (var i in selectedPackage!.vehiclePrices!) {
              i.isSelected = false;
              i.estimatedTime = -1;
            }
            selectedIndex = 0;
            selectedPackage?.vehiclePrices?[0].isSelected = true;
            selectedVehicle = selectedPackage?.vehiclePrices?[0];
            selectedVehicleId = selectedVehicle?.vehicleId ?? "";
            _handleTypeSelected();
          }
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
    //   if (selectedPackage != null &&
    //       selectedPackage?.vehiclePrices?.isNotEmpty == true) {
    //     for (var i in selectedPackage!.vehiclePrices!) {
    //       i.isSelected = false;
    //     }
    //     selectedPackage?.vehiclePrices?[0].isSelected = true;
    //   }
    //   notifyListeners();
    // }
    if (rentalPackages.isNotEmpty == true) {
      int selectedPackageIndex =
          rentalPackages.indexWhere((i) => i.hour == selectedPackage?.hour);
      if (selectedPackageIndex > 0) {
        selectedPackageIndex--;
        if (selectedPackageIndex < rentalPackages.length) {
          selectedPackage = rentalPackages[selectedPackageIndex];
          if (selectedPackage != null &&
              selectedPackage?.vehiclePrices?.isNotEmpty == true) {
            for (var i in selectedPackage!.vehiclePrices!) {
              i.isSelected = false;
              i.estimatedTime = -1;
            }
            selectedIndex = 0;
            selectedPackage?.vehiclePrices?[0].isSelected = true;
            selectedVehicle = selectedPackage?.vehiclePrices?[0];
            selectedVehicleId = selectedVehicle?.vehicleId ?? "";
            _handleTypeSelected();
          }
          notifyListeners();
        }
      }
    }
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
    notifyListeners();
  }

  void updatePhoneNumber(String newPhoneNumber) {
    phoneNumber = newPhoneNumber;
    notifyListeners();
  }

  void savePaymentTypeList(List<String>? data) {
    paymentTypeList.clear();
    if (data?.isNotEmpty == true) {
      for (var i in data!) {
        paymentTypeList.add(
            CustomNameModel(isSelected: false, id: i.toUpperCase(), name: i));
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
                selectedVehicle?.price?.toDouble() != null &&
                selectedVehicle!.price!.toDouble() <=
                    AppConstants.userWalletBalance!)) {
          Utils.showToast(
              translation.txtLowWalletBalanceCreateTripDesc,);
        }
        notifyListeners();
      }
    }
  }
}
