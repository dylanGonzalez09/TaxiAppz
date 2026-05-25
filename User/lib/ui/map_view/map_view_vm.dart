import 'dart:convert';

import 'package:flutter/material.dart';

import 'package:google_maps_flutter/google_maps_flutter.dart';

import '../../network/response_models/favouriteModel.dart';
import '../../utils/base_vm.dart';

import '../../network/response_models/places_search_model.dart';
import '../../utils/app_constants.dart';
import '../../utils/app_url.dart';
import '../../utils/custom_images.dart';

class MapViewVm extends BaseVm {
  final marker = <Marker>{};
  GoogleMapController? mapController;
  LatLng updatedLatLng = const LatLng(0, 0);
  String address = "", title = "";
  bool isProgramUpdate = false;
  final searchTextController = TextEditingController();
  List<PlacesSearchModel>? placesList = [];
  final List<FavouriteModel> favourites = [];
  final FocusNode focusNode = FocusNode();
  bool isDataLoading = false;
  bool isButtonEnabled = false;
  int markerType = 0;
  bool isSearchPlaceSelected = false;
  bool isOutOfZone = false;
  bool isPickUpChange = false;
  bool isDisposed = false;

  @override
  void notifyListeners() {
    if (!isDisposed) {
      super.notifyListeners();
    }
  }

  void onMapCreated(GoogleMapController controller) async {
    mapController = controller;
    final position = CameraPosition(target: updatedLatLng, zoom: 18);
    mapController?.animateCamera(CameraUpdate.newCameraPosition(position));
    const imageConfiguration = ImageConfiguration(size: Size(60, 60));
    marker.add(Marker(
        markerId: const MarkerId(AppConstants.currentLocationMarker),
        position: updatedLatLng,
        anchor: const Offset(0.5, 0.5),
        icon: await BitmapDescriptor.asset(
            imageConfiguration,
            markerType == 2
                ? CustomImages.dropMarker
                : markerType == 1
                    ? CustomImages.stopMarker
                    : CustomImages.currentLocationMarker),
        rotation: 0));
    notifyListeners();
  }

  void onCameraMove(CameraPosition position) {
    updatedLatLng = position.target;
  }

  void onCameraIdle() async {
    if (!isProgramUpdate && !isDisposed) {
      isButtonEnabled = true;
      searchTextController.text = await getAddressFromLatLng(updatedLatLng);
    }
    isProgramUpdate = false;
    notifyListeners();
  }

  Future<void> getSearchAddress() async {
    if (searchTextController.text.isNotEmpty) {
      final url =
          "${AppUrls.sendUserLatLng}?keyword=${searchTextController.text}&lat=${updatedLatLng.latitude}&lng=${updatedLatLng.longitude}";
      final response = await apiHelper.get(url);
      response.fold((e) => showErrorDialog(errorModel: e), (r) {
        final jsonString = jsonDecode(jsonEncode(r.data));
        final list = List<PlacesSearchModel>.from(
            jsonString.map((model) => PlacesSearchModel.fromJson(model)));
        placesList?.clear();
        placesList?.addAll(list);
        notifyListeners();
      });
    }
  }

  void onTextChange(String text) {
    getSearchAddress();
    if (text.isEmpty) {
      isButtonEnabled = false;
      notifyListeners();
    }
  }

  Future<void> getFavouriteList() async {
    final response = await apiHelper.get(AppUrls.getFavouriteList);
    response.fold((e) => showErrorDialog(errorModel: e), (r) {
      final list = parseData(r.data, FavouriteListModel.fromJson);
      favourites.clear();
      if (list?.favouriteList != null) {
        favourites.addAll(list!.favouriteList!);
        notifyListeners();
      }
    });
  }

  void onPlacesSelected(PlacesSearchModel model) async {
    focusNode.unfocus();
    isDataLoading = true;
    notifyListeners();
    searchTextController.text = model.description ?? "";
    final data = await getLatLngFromAddress(model.description ?? '');
    final position = CameraPosition(target: data, zoom: 18);
    isDataLoading = false;
    isButtonEnabled = true;
    isSearchPlaceSelected = true;
    notifyListeners();
    isProgramUpdate = true;
    placesList?.clear();
    if (isPickUpChange) {
      checkZoneAddress(data, false);
    } else {
      mapController?.animateCamera(CameraUpdate.newCameraPosition(position));
    }
  }

  void onFocusChange() {
    if (!focusNode.hasFocus) {
      placesList?.clear();
      notifyListeners();
    }
  }

  void checkZoneAddress(LatLng latLng, bool isBtn) async {
    var map = {
      'pick_lat': latLng.latitude,
      'pick_lng': latLng.longitude,
    };
    var response = await apiHelper.post(AppUrls.checkZOne, params: map);
    response.fold((e) => showErrorDialog(errorModel: e), (r) {
      debugPrint("msdnfjhsdgfjasdhfhadsf  ${r.data}");

      if (r.data == true) {
        isOutOfZone = false;
        final position = CameraPosition(target: latLng, zoom: 18);
        mapController?.animateCamera(CameraUpdate.newCameraPosition(position));
        if (isBtn) {
          pop(args: {
            "address": searchTextController.text,
            "latLng": updatedLatLng
          });
        }
      } else {
        showErrorDialog(message: "Selected place currently unavailable");
        clear(true);
      }
    });
    isLoading.value = false;
    notifyListeners();
  }

  void clear(bool isChecked) {
    isProgramUpdate = true;
    placesList?.clear();
    isOutOfZone = isChecked;
    isSearchPlaceSelected = false;
    searchTextController.text = "";
    updatedLatLng = getSavedCurrentLocation();
    final position = CameraPosition(target: updatedLatLng, zoom: 18);
    mapController?.animateCamera(CameraUpdate.newCameraPosition(position));
  }
}
