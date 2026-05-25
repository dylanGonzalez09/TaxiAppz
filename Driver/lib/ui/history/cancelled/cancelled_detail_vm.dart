import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:taxiappzpro/network/response_models/trips_model.dart';
import 'package:taxiappzpro/utils/custom_router_config.dart';
import '../../../base/base_vm.dart';
import '../../../network/response_models/destination_model.dart';
import '../../../utils/app_constants.dart';


class CancelledDetailVm extends BaseVm {
  TripModel? tripModel;
  CustomAddressModel? dropModel;
  CustomAddressModel? stopModel;
  CustomAddressModel? pickupModel;
  LatLng pickupLatLng = const LatLng(0.0, 0.0);
  LatLng dropLatLng = const LatLng(0.0, 0.0);
  LatLng stopLatLng = const LatLng(0.0, 0.0);

  void setInitialData(Map<String, dynamic> map) {
    if (map.containsKey(AppConstants.trip)) {
      tripModel = TripModel.fromJson(map[AppConstants.trip]);

      if (tripModel?.pickLat != null
          && tripModel?.pickLng != null
          && tripModel?.pickAddress?.isNotEmpty == true) {
        pickupLatLng = LatLng(tripModel?.pickLat ?? 0.0, tripModel?.pickLng ?? 0.0);
        pickupModel = CustomAddressModel(tripModel?.pickAddress ?? "", pickupLatLng);
      }
      if (tripModel?.dropLat != null
          && tripModel?.dropLng != null
          && tripModel?.dropAddress?.isNotEmpty == true) {
        dropLatLng = LatLng(tripModel?.dropLat ?? 0.0, tripModel?.dropLng ?? 0.0);
        dropModel = CustomAddressModel(tripModel?.dropAddress ?? "", dropLatLng);
      }
      if (tripModel?.stopLat != null
          && tripModel?.stopLng != null
          && tripModel?.stopAddress?.isNotEmpty == true) {
        stopLatLng = LatLng(tripModel?.stopLat ?? 0.0, tripModel?.stopLng ?? 0.0);
        stopModel = CustomAddressModel(tripModel?.stopAddress ?? "", pickupLatLng);
      }
      notifyListeners();
    }
  }

}