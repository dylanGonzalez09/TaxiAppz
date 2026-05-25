import 'package:flutter/material.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:location/location.dart';
import 'package:taxiappzpro/base/base_vm.dart';

class AppStatusVm extends BaseVm {
  // Variables to hold the status values
  bool isNetworkConnected = false;
  bool isGpsEnabled = false;
  bool isBatteryOptimizationEnabled = true;

  // Function to check network status
  Future<void> checkNetworkStatus() async {
    var connectivityResult = await Connectivity().checkConnectivity();
    isNetworkConnected = connectivityResult != ConnectivityResult.none;
    notifyListeners();
  }

  // Function to check GPS status
  Future<void> checkGpsStatus() async {
    Location location = Location();
    bool serviceEnabled = await location.serviceEnabled();
    if (!serviceEnabled) {
      serviceEnabled = await location.requestService();
    }
    isGpsEnabled = serviceEnabled;
    notifyListeners();
  }

  // Function to check battery optimization status
  Future<void> checkBatteryOptimizationStatus() async {
    //bool isIgnoring = await BatteryOptimization.isIgnoringBatteryOptimizations();
    isBatteryOptimizationEnabled = false;
    //!isIgnoring;
    notifyListeners();
  }

  // Function to initialize and check all statuses
  Future<void> initializeStatuses() async {
    await checkNetworkStatus();
    await checkGpsStatus();
    await checkBatteryOptimizationStatus();
    notifyListeners();
  }
}