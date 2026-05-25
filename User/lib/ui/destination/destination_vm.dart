import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import '../../models/enums.dart';
import '../../network/response_models/destination_model.dart';
import '../../network/response_models/favouriteModel.dart';
import '../../network/response_models/recent_model.dart';
import '../../utils/app_constants.dart';
import '../../utils/base_vm.dart';
import '../../utils/custom_images.dart';
import '../../utils/preference_helper.dart';

import '../../main.dart';
import '../../network/response_models/places_search_model.dart';
import '../../utils/app_url.dart';
import '../../utils/dimensions.dart';
import '../bottomsheets/ridertypesselection/rider_types_selection.dart';

class DestinationVm extends BaseVm {
  bool isDisposed = false;
  String pickupLocation = "";
  String dropLocation = "";
  final TextEditingController dropController = TextEditingController();
  final TextEditingController stopController = TextEditingController();
  RxBool isMultipleDrop = RxBool(false);
  List<PlacesSearchModel>? destinationDetailList;
  bool isDropLocation = true;
  bool isDropLocationSelected = false;
  bool isStopLocationSelected = false;
  List<FavouriteModel> favourites = [];
  List<RecentModel> recent = [];
  final List<PlacesSearchModel> placesList = [];
  CustomAddressModel? dropModel;
  CustomAddressModel? stopModel;
  late CustomAddressModel pickupModel;
  LatLng pickupLatLng = const LatLng(0, 0);
  bool showClear1 = false;
  bool showClear2 = false;
  bool isDataLoading = false;
  bool isButtonEnabled = false;
  bool isFetchingDropLocation = false;
  bool isFromArgs = false;
  bool showDropLabel = false;
  bool showStopLabel = false;
  bool showStops = false;
  LatLng latLng = const LatLng(0, 0);
  final FocusNode stopFocusNode = FocusNode();
  final FocusNode dropFocusNode = FocusNode();
  bool isStopFocused = false;
  bool isStopFieldVisible = false;
  String riderName = "Myself";
  String phoneNumber = "phoneNumber";
  bool isShimmerLoading = true;

  @override
  void notifyListeners() {
    if (!isDisposed) {
      super.notifyListeners();
    }
  }

  void onFavouriteSelected(FavouriteModel favourite) {
    if (stopFocusNode.hasFocus) {
      stopController.text = favourite.address ?? "";
      LatLng latLng = const LatLng(0.0, 0.0);
      if (favourite.latitude != null && favourite.longitude != null) {
        latLng = LatLng(favourite.latitude!, favourite.longitude!);
      }

      stopModel = CustomAddressModel(favourite.address ?? "", latLng);
      isStopLocationSelected = true;
    } else {
      dropController.text = favourite.address ?? "";
      LatLng latLng = const LatLng(0.0, 0.0);
      if (favourite.latitude != null && favourite.longitude != null) {
        latLng = LatLng(favourite.latitude!, favourite.longitude!);
      }
      dropModel = CustomAddressModel(favourite.address ?? "", latLng);
      isDropLocationSelected = true;
    }
    _validateFields();
    notifyListeners();
  }

  void onRecentSelected(RecentModel recent) {
    if (stopFocusNode.hasFocus) {
      stopController.text = recent.sId ?? "";
      isStopLocationSelected = true;
    } else {
      dropController.text = recent.dropAddress ?? "";
      LatLng latLng = const LatLng(0.0, 0.0);
      if (recent.dropLat != null && recent.dropLng != null) {
        latLng = LatLng(recent.dropLat!, recent.dropLng!);
      }
      dropModel = CustomAddressModel(recent.dropAddress ?? "", latLng);
      isDropLocationSelected = true;
    }
    _validateFields();
    notifyListeners();
  }

  @override
  void dispose() {
    stopFocusNode.dispose();
    dropFocusNode.dispose();
    stopController.dispose();
    dropController.dispose();
    super.dispose();
  }

  void setInitialData(Map<String, dynamic> map) {
    if (AppConstants.isBookingForOthersChanged) {
      riderName = AppConstants.bookingForOthersRiderName;
      phoneNumber = AppConstants.bookingForOthersRiderPhoneNumber;
    }
    AppConstants.isBookingForOthersChanged = false;
    AppConstants.bookingForOthersRiderPhoneNumber = "";
    AppConstants.bookingForOthersRiderName = "";
    pickupLocation = map["pickupAddress"];
    pickupLatLng = map["pickUpLatLng"];
    pickupModel = CustomAddressModel(pickupLocation, pickupLatLng);
    final lat = preference.getDouble(PreferenceHelper.currentLat) ?? 0;
    final lng = preference.getDouble(PreferenceHelper.currentLng) ?? 0;
    latLng = LatLng(lat, lng);
  }

  void toggleMultipleDrop() {
    isMultipleDrop.value = !isMultipleDrop.value;
    notifyListeners();
  }

  void swipeDestination() {
    var stopAddress = stopController.text;
    var dropAddress = dropController.text;
    stopController.text = dropAddress;
    dropController.text = stopAddress;

    var stopModelTemp = stopModel;
    stopModel = dropModel;
    dropModel = stopModelTemp;

    isStopLocationSelected = stopController.text.isNotEmpty;
    isDropLocationSelected = dropController.text.isNotEmpty;

    _validateFields();
    notifyListeners();
  }

  DestinationVm() {
    stopController.addListener(_validateFields);
    dropController.addListener(_validateFields);
  }

  void _validateFields() {
    if (dropController.text.isNotEmpty &&
        isDropLocationSelected &&
        (!isStopFieldVisible ||
            (isStopFieldVisible &&
                stopController.text.isNotEmpty &&
                isStopLocationSelected))) {
      isButtonEnabled = true;
    } else {
      isButtonEnabled = false;
    }
    notifyListeners();
  }

  void toggleStopFieldVisibility() {
    isStopFieldVisible = !isStopFieldVisible;
    _validateFields();
  }

  Future<void> getRecentFavourites() async {
    isShimmerLoading = true;
    notifyListeners();

    try {
      final recentResponse = await apiHelper.get(AppUrls.getRecentApi);
      final favouriteResponse = await apiHelper.get(AppUrls.getFavouriteList);

      recentResponse.fold((e) {}, (r) {
        final response = jsonDecode(jsonEncode(r.data));
        final recentModel = List<RecentModel>.from(
            response.map((model) => RecentModel.fromJson(model)));
        if (recentModel.isNotEmpty) {
          recent.clear();
          recent.addAll(recentModel);
        }
      });

      favouriteResponse.fold((e) {}, (r) {
        final data = parseData(r.data, FavouriteListModel.fromJson);
        if (data?.favouriteList != null) {
          favourites.clear();
          favourites.addAll(data!.favouriteList!);
        }
      });
    } catch (e) {
      debugPrint("Error fetching recent and favourite locations: $e");
    }

    isShimmerLoading = false;
    notifyListeners();
  }

  String getIcon(String? type) {
    debugPrint("typeCheck $type");
    String key = "";
    if (type == FavouriteType.HOME.name) {
      key = CustomImages.icFavoriteListHome;
    } else if (type == FavouriteType.WORK.name) {
      key = CustomImages.icFavoriteAddWork;
    } else {
      key = CustomImages.icFavoriteListOthers;
    }
    return key;
  }

  Future<void> getSearchAddress(String keyword) async {
    final url =
        "${AppUrls.sendUserLatLng}?keyword=$keyword&lat=${latLng.latitude}&lng=${latLng.longitude}";
    final response = await apiHelper.get(url);
    response.fold((e) => showErrorDialog(errorModel: e), (r) {
      final jsonString = jsonDecode(jsonEncode(r.data));
      final list = List<PlacesSearchModel>.from(
          jsonString.map((model) => PlacesSearchModel.fromJson(model)));
      placesList.clear();
      placesList.addAll(list);
      notifyListeners();
    });
  }

  void handleDropArgs(Map data) async {
    if (stopFocusNode.hasFocus) {
      stopController.text = data['address'];
      var latLng = data['latLng'] ?? (0.0, 0.0);
      stopModel = CustomAddressModel(data['address'] ?? "", latLng);
      isStopLocationSelected = true;
    } else {
      dropController.text = data['address'] ?? "";
      var latLng = data['latLng'] ?? (0.0, 0.0);
      dropModel = CustomAddressModel(data['address'] ?? "", latLng);
      isDropLocationSelected = true;
    }
    _validateFields();
    notifyListeners();
  }

  void onDropAddressListener() {
    if (dropController.text.isEmpty) {
      showDropLabel = false;
      isDropLocationSelected = false;
    } else {
      showDropLabel = true;
    }
    _validateFields();
    notifyListeners();
  }

  void onStopAddressListener() {
    if (stopController.text.isEmpty) {
      showStopLabel = false;
      isStopLocationSelected = false;
    } else {
      showStopLabel = true;
    }
    _validateFields();
    notifyListeners();
  }

  void onAddRemoveStops() {
    if (showStops) {
      showStops = !showStops;
    } else {
      showStops = !showStops;
      if (dropController.text.isNotEmpty) {
        isButtonEnabled = true;
      }
    }
    _validateFields();
    notifyListeners();
  }

  void onStopLocationChange(String address) {
    if (address.isNotEmpty) {
      getSearchAddress(address);
    }
  }

  void onDropLocationChanged(String address) {
    if (address.isNotEmpty) {
      getSearchAddress(address);
    }
  }

  void onPlacesSelected(PlacesSearchModel model) async {
    FocusScope.of(navigatorKey.currentState!.context).unfocus();
    final latLng = await getLatLngFromAddress(model.description ?? "");
    if (isStopFocused) {
      stopController.text = model.description ?? "";
      stopModel = CustomAddressModel(model.description ?? "", latLng);
      isStopLocationSelected = true;
    } else {
      dropController.text = model.description ?? "";
      dropModel = CustomAddressModel(model.description ?? "", latLng);
      isDropLocationSelected = true;
    }
    // if(!isButtonEnabled){
    //   checkZoneAddress(latLng,model);
    // }
    placesList.clear();
    isButtonEnabled = true;
    _validateFields();

    notifyListeners();
  }

  void addFavorite(RecentModel address) async {
    if (!favourites
        .any((favourite) => favourite.address == address.dropAddress)) {
      favourites.add(FavouriteModel(
        address: address.dropAddress,
        latitude: address.dropLat,
        longitude: address.dropLng,
        type: "OTHERS",
      ));
      notifyListeners();
      var map = {
        'address': address.dropAddress,
        'latitude': address.dropLat,
        'longitude': address.dropLng,
        'type': 'OTHERS',
      };
      await apiHelper.post(AppUrls.createFavouritePlaces, params: map);
    }
  }

  void onStopFocusChange() {
    if (stopFocusNode.hasFocus) {
      isStopFocused = true;
    }
  }

  void onDropFocusChange() {
    if (dropFocusNode.hasFocus) {
      isStopFocused = false;
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
    notifyListeners();
  }

  void updatePhoneNumber(String newPhoneNumber) {
    phoneNumber = newPhoneNumber;
    notifyListeners();
  }

/*  if needed uncommand to check the drop zone inside the zone

 void checkZoneAddress(LatLng latLng,model) async {
    var map = {
      'pick_lat': latLng.latitude,
      'pick_lng': latLng.longitude,
    };
    var response = await apiHelper.post(AppUrls.checkZOne, params: map);
    response.fold((e) => showErrorDialog(errorModel: e), (r) {
      debugPrint("msdnfjhsdgfjasdhfhadsf  ${r.data}");

      if (r.data == true) {
        isButtonEnabled = true;
      } else {
        showErrorDialog(message: "Selected place currently unavailable");
        if (showStops) {
          stopController.text = "";
          stopModel = null;
        } else {
          dropController.text = "";
          dropModel = null;
        }
        isButtonEnabled = false;
      }
      placesList.clear();
    });
    isLoading.value = false;
    notifyListeners();
  }*/
}
