import 'package:flutter/cupertino.dart';
import 'package:flutter/services.dart';
import 'package:geolocator/geolocator.dart';
import 'package:taxiappzpro/base/base_vm.dart';
import 'package:taxiappzpro/utils/preference_helper.dart';

class PermissionVm extends BaseVm {
  static const platform = MethodChannel('battery_optimization');
  bool isPermissionScreenPaused = false;

  void saveData(String destinationName) async {
    debugPrint("locationLoadingBugs    saveData   ${DateTime.now()}");
    final lastLocation = await Geolocator.getLastKnownPosition();
    debugPrint(
        "locationLoadingBugs saveData  2 ${DateTime.now()}  $lastLocation");
    if (lastLocation == null) {
      final getLocation = await Geolocator.getCurrentPosition(
          locationSettings: const LocationSettings(
              distanceFilter: 100, accuracy: LocationAccuracy.high));
      debugPrint("locationLoadingBugs    saveData  3  ${DateTime.now()}");
      preference.setDouble(
          PreferenceHelper.currentLatDouble, getLocation.latitude);
      preference.setDouble(
          PreferenceHelper.currentLngDouble, getLocation.longitude);
      popAndMove(destinationName);
    } else {
      preference.setDouble(
          PreferenceHelper.currentLatDouble, lastLocation.latitude);
      preference.setDouble(
          PreferenceHelper.currentLngDouble, lastLocation.longitude);
      popAndMove(destinationName);
    }
  }

  static Future<void> openBatteryOptimizationSettings() async {
    try {
      await platform.invokeMethod('openBatteryOptimizationSettings');
    } on PlatformException catch (e) {
      debugPrint("Failed to open settings: ${e.message}");
    }
  }
}
