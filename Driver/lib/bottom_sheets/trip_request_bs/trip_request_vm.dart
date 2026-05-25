import 'dart:async';
import 'dart:convert';

import 'package:audioplayers/audioplayers.dart';
import 'package:flutter_foreground_task/flutter_foreground_task.dart';
import 'package:taxiappzpro/base/base_vm.dart';
import 'package:taxiappzpro/network/response_models/req_in_pro_model.dart';
import 'package:taxiappzpro/network/response_models/trips_model.dart';
import 'package:taxiappzpro/utils/app_constants.dart';
import 'package:taxiappzpro/utils/app_urls.dart';
import 'package:taxiappzpro/utils/custom_router_config.dart';

import '../../utils/preference_helper.dart';
import '../../utils/utils.dart';

class TripRequestVm extends BaseVm {
  double _progressValue = 1;
  Timer? _timer;
  final AudioPlayer _audioPlayer = AudioPlayer();
  int displayTimer = 0;
  late TripModel tripModel;
  RequestInProModel? requestInProModel;


  double get progressValue => _progressValue;
  Function()? closeBottomSheet;

  void startTimer() async {
    await _audioPlayer.play(AssetSource('sounds/alert.mp3'), volume: 1.0);
    _audioPlayer.setReleaseMode(ReleaseMode.loop);
    int tempDuration = displayTimer;
    _timer ??= Timer.periodic(const Duration(seconds: 1), (timer) {
      if (displayTimer > 1) {
        displayTimer -= 1;
        tempDuration += 1;
        _progressValue = displayTimer / tempDuration;
        notifyListeners();
      } else {
        _timer?.cancel();
        _timer = null;
        _audioPlayer.stop();
        onTripRejected();
      }
    });
  }

  void onTripAccept() async {
    _timer?.cancel();
    _audioPlayer.stop();

    // Close the bottom sheet IMMEDIATELY before API call
    closeBs();

    // Small delay to ensure UI updates
    await Future.delayed(Duration(milliseconds: 100));

    showLoader();
    final map = {
      AppConstants.requestId: tripModel.sId,
      AppConstants.isAccept: true,
    };
    final response = await apiHelper.post(AppUrls.tripAccept, params: map);
    hideLoader();
    response.fold((e) => showErrorDialog(errorModel: e), (r) {
      final model = parseData(r.data, RequestInProModel.fromJson);
      if (model != null && model.trip != null) {
        // Navigate to trip screen without opening Google Maps
        moveToNamed(CustomRouterConfig.tripScreen, args: model);
      }
    });
  }

  void onTripRejected() async {
    _timer?.cancel();
    _audioPlayer.stop();
    showLoader();
    final map = {
      AppConstants.requestId: tripModel.sId,
      AppConstants.isAccept: false,
    };
    final response = await apiHelper.post(AppUrls.tripAccept, params: map);
    hideLoader();
    response.fold((e) => showErrorDialog(errorModel: e), (r) {
      clearReqId();
      updateToMqtt(false);
    });
    closeBs();
  }

  @override
  void dispose() {
    _timer?.cancel();
    _audioPlayer.stop();
    _audioPlayer.dispose();
    super.dispose();
  }

  void closeBs() {
    if (closeBottomSheet != null) {
      closeBottomSheet!();
    }
  }

  void updateToMqtt(bool isAvailable) {
    var time = DateTime.now();
    final lat = preference.getDouble(PreferenceHelper.currentLatDouble) ?? 0;
    final lng = preference.getDouble(PreferenceHelper.currentLngDouble) ?? 0;
    final header = preference.getDouble(PreferenceHelper.bearingDouble) ?? 0;
    final userId = preference.getString(PreferenceHelper.driverUserId) ?? "";

    String rawServiceType = tripModel.vehicleDetails?.serviceType ??
        preference.getString(PreferenceHelper.serviceType) ??
        "";
    List<String> serviceTypesList = rawServiceType.split(',');
    List<String> updatedServiceTypes = serviceTypesList.map((type) {
      return type.trim().toUpperCase() == "LOCAL" ? AppConstants.local.toUpperCase() : type.trim();
    }).toList();

    String finalServiceType = updatedServiceTypes.join(',');

    final map = <String, String>{
      AppConstants.driverId: getDriverId(),
      AppConstants.userId: userId,
      AppConstants.latitude: "$lat",
      AppConstants.longitude: "$lng",
      AppConstants.bearing: "$header",
      AppConstants.lastUpdated: time.microsecondsSinceEpoch.toString(),
      AppConstants.isOnline: "1",
      AppConstants.isAvailable: !isAvailable ? "1" : "0",
      AppConstants.primaryZone:
      preference.getString(PreferenceHelper.primaryZone) ?? "",
      AppConstants.serviceType: finalServiceType,
      AppConstants.vehicleId: tripModel.vehicleModelDetails?.vehicleId ??
          preference.getString(PreferenceHelper.vehicleId) ??
          "",
      AppConstants.vehicleType: tripModel.vehicleDetails?.vehicleName ??
          preference.getString(PreferenceHelper.vehicleType) ??
          "",
      if (preference.getString(PreferenceHelper.secondaryZone)?.isNotEmpty == true)
        AppConstants.secondaryZone:
        preference.getString(PreferenceHelper.secondaryZone) ?? "",
    };

    mqtt.publish(AppConstants.driverLocationUpdate, jsonEncode(map));

    if (isAvailable) {
      FlutterForegroundTask.sendDataToTask({"trip": jsonEncode(tripModel.toJson())});
    } else {
      FlutterForegroundTask.sendDataToTask({"clearTrip": true});
    }
  }


  String getDurationForPickup() {
    final currentLat = preference.getDouble(PreferenceHelper.currentLatDouble) ?? 0;
    final currentLng = preference.getDouble(PreferenceHelper.currentLngDouble) ?? 0;
    final pickupLat = tripModel.pickLat ?? 0.0;
    final pickupLng = tripModel.pickLng ?? 0.0;
    return calculateTravelTimeInMinutes(
        currentLat: currentLat,
        currentLng: currentLng,
        pickupLat: pickupLat ,
        pickupLng: pickupLng);
  }

  String getDistanceForPickup() {
    final currentLat = preference.getDouble(PreferenceHelper.currentLatDouble) ?? 0;
    final currentLng = preference.getDouble(PreferenceHelper.currentLngDouble) ?? 0;
    final pickupLat = tripModel.pickLat ?? 0.0;
    final pickupLng = tripModel.pickLng ?? 0.0;
    final unit = tripModel.unit ?? 'km';
    return '${calculateTravelDistance(currentLat: currentLat,
        currentLng: currentLng,
        pickupLat: pickupLat,
        pickupLng: pickupLng,
        unit: unit)} $unit';
  }

  // Get travel duration from pickup to drop location
  String getDurationForDrop() {
    final pickupLat = tripModel.pickLat ?? 0.0;
    final pickupLng = tripModel.pickLng ?? 0.0;
    final dropLat = tripModel.dropLat ?? 0.0;
    final dropLng = tripModel.dropLng ?? 0.0;

    return calculateTravelTimeInMinutes(
      currentLat: pickupLat,
      currentLng: pickupLng,
      pickupLat: dropLat,
      pickupLng: dropLng,
    );
  }

// Get travel distance from pickup to drop location
  String getDistanceForDrop() {
    final pickupLat = tripModel.pickLat ?? 0.0;
    final pickupLng = tripModel.pickLng ?? 0.0;
    final dropLat = tripModel.dropLat ?? 0.0;
    final dropLng = tripModel.dropLng ?? 0.0;
    final unit = tripModel.unit ?? 'km';

    return '${calculateTravelDistance(
      currentLat: pickupLat,
      currentLng: pickupLng,
      pickupLat: dropLat,
      pickupLng: dropLng,
      unit: unit,
    )} $unit';
  }

  // Add these methods to your TripRequestVm class

// Get travel duration from pickup to stop location
  String getDurationForStop() {
    final pickupLat = tripModel.pickLat ?? 0.0;
    final pickupLng = tripModel.pickLng ?? 0.0;
    final stopLat = tripModel.stopLat ?? 0.0;
    final stopLng = tripModel.stopLng ?? 0.0;

    return calculateTravelTimeInMinutes(
      currentLat: pickupLat,
      currentLng: pickupLng,
      pickupLat: stopLat,
      pickupLng: stopLng,
    );
  }

// Get travel distance from pickup to stop location
  String getDistanceForStop() {
    final pickupLat = tripModel.pickLat ?? 0.0;
    final pickupLng = tripModel.pickLng ?? 0.0;
    final stopLat = tripModel.stopLat ?? 0.0;
    final stopLng = tripModel.stopLng ?? 0.0;
    final unit = tripModel.unit ?? 'km';

    return '${calculateTravelDistance(
      currentLat: pickupLat,
      currentLng: pickupLng,
      pickupLat: stopLat,
      pickupLng: stopLng,
      unit: unit,
    )} $unit';
  }


}
