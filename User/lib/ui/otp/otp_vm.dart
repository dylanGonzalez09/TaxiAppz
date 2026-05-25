import 'dart:async';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:get/get_rx/src/rx_types/rx_types.dart';
import 'package:go_router/go_router.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:location/location.dart' as loc;
import 'package:permission_handler/permission_handler.dart';
import '../../utils/base_vm.dart';

import '../../main.dart';
import '../../network/response_models/country_model.dart';
import '../../network/response_models/verify_model.dart';
import '../../utils/app_constants.dart';
import '../../utils/app_url.dart';
import '../../utils/custom_router.dart';
import '../../utils/preference_helper.dart';
import '../dialogs/permission.dart';

class OtpVm extends BaseVm {
  Timer? _timer;
  RxInt seconds = 60.obs;
  RxString otpTimer = "".obs;
  bool requestResend = false;
  RxString otpTimeDesc = "Get another code in ".obs;
  String otp = "";
  String otpError = "";
  CountryModel? country;
  String phoneNumber = "";
  bool isAvailable = false;
  final location = loc.Location();
  bool isPermissionGranted = false, isServiceEnabled = false;
  DialogRoute? permissionDialogRoute;
  void startTimer() {
    _timer ??= Timer.periodic(const Duration(seconds: 1), (timer) {
      seconds.value -= 1;
      otpTimeDesc.value = "Get another code in ";
      otpTimer.value = _formatTimer(seconds.value);
      requestResend = false;
      if (seconds.value == 0) {
        requestResend = true;
        seconds.value = 60;
        otpTimer.value = "Resend?";
        otpTimeDesc.value = "";
        _timer?.cancel();
        _timer = null;
      }
    });
  }

  String _formatTimer(int timerValue) {
    int minutes = timerValue ~/ 60;
    int seconds = timerValue % 60;
    return '${minutes.toString().padLeft(2, '0')}:${seconds.toString().padLeft(2, '0')}';
  }

  void setData(Map<String, dynamic> data) {
    if (data[AppConstants.country] is CountryModel) {
      country = data[AppConstants.country];
    }

    if (data[AppConstants.phoneNumber] is String) {
      phoneNumber = data[AppConstants.phoneNumber];
    }
  }

  void resendOtp() async {
    if (requestResend) {
      isLoading.value = true;
      final map = {
        AppConstants.countryCode: country?.id ?? "",
        AppConstants.phoneNumber: phoneNumber,
        AppConstants.authenticationType: AppConstants.OTP
      };
      final response = await apiHelper.post(AppUrls.login, params: map);
      isLoading.value = false;
      response.fold((e) {
        showErrorDialog(errorModel: e);
      }, (r) {
        startTimer();
        showErrorDialog(message: translation.txt_SMS_resent_success);
      });
    }
  }

  // void verifyOTP() async {
  //   if (!isLoading.value) {
  //     isLoading.value = true;
  //
  //     final map = {
  //       AppConstants.phoneNumber: phoneNumber,
  //       AppConstants.countryCode: country?.id,
  //       AppConstants.otp: otp,
  //       AppConstants.deviceType: getDevicePlatform(),
  //       AppConstants.deviceInfoHash: await getFcmToken()
  //     };
  //
  //     final response = await apiHelper.post(AppUrls.otpVerify, params: map);
  //     response.fold((e) {
  //       showErrorDialog(errorModel: e);
  //     }, (r) async{
  //       final data = parseData(r.data, VerifyModel.fromJson);
  //       if (data != null) {
  //         if (data.usertype == AppConstants.NewUser) {
  //           final map = {
  //             AppConstants.country: country,
  //             AppConstants.phoneNumber: phoneNumber
  //           };
  //           popAndMove(CustomRouter.registerScreen, args: map);
  //         } else {
  //         await  mqtt.connect(data.user?.id ?? "");
  //           preference.setString(
  //               PreferenceHelper.authToken, data.tokens?.access?.token ?? "");
  //           preference.setString(
  //               PreferenceHelper.refreshToken, data.tokens?.refresh?.token ?? "");
  //           preference.setString(PreferenceHelper.userId, data.user?.id ?? "");
  //           popAndMove(CustomRouter.mapScreen);
  //         }
  //       } else {
  //         showErrorDialog();
  //       }
  //     });
  //     isLoading.value = false;
  //   }
  // }

  void verifyOTP() async {
    if (!isLoading.value) {
      isLoading.value = true;

      try {
        final map = {
          AppConstants.phoneNumber: phoneNumber,
          AppConstants.countryCode: country?.id,
          AppConstants.otp: otp,
          AppConstants.deviceType: getDevicePlatform(),
          AppConstants.deviceInfoHash: await getFcmToken()
        };

        final response = await apiHelper.post(AppUrls.otpVerify, params: map);
        response.fold((e) {
          showErrorDialog(errorModel: e);
          isLoading.value = false;
        }, (r) async {
          final data = parseData(r.data, VerifyModel.fromJson);
          if (data != null) {
            if (data.usertype == AppConstants.NewUser) {
              final map = {
                AppConstants.country: country,
                AppConstants.phoneNumber: phoneNumber
              };
              popAndMove(CustomRouter.registerScreen, args: map);
              isLoading.value = false; // Stop loading after navigation
            } else {
              mqtt.initializeMqtt(data.user?.id ?? "");
              await mqtt.connect();
              preference.setString(
                  PreferenceHelper.authToken, data.tokens?.access?.token ?? "");
              preference.setString(PreferenceHelper.refreshToken,
                  data.tokens?.refresh?.token ?? "");
              preference.setString(
                  PreferenceHelper.userId, data.user?.id ?? "");
              checkForPermissionAndMoveNext();
              isLoading.value = false;
            }
          } else {
            showErrorDialog();
            isLoading.value = false;
          }
        });
      } catch (e) {
        showErrorDialog(message: AppConstants.someThingWentWrong);
        isLoading.value = false;
      }
    }
  }

  void onOtpChange(String value) {
    if (value.length < 4) {
      otpError = translation.txt_Enter_OTP;
      isAvailable = false;
    } else {
      otpError = "";
      isAvailable = true;
    }
    notifyListeners();
    otp = value;
  }

  Future<void> checkForPermissionAndMoveNext() async {
    final context = navigatorKey.currentState!.context;
    if (Platform.isAndroid) {
      final isGranted = await Permission.location.isGranted;
      if (isGranted) {
        isPermissionGranted = true;
        final isLocationServiceEnabled =
            await Geolocator.isLocationServiceEnabled();
        if (isLocationServiceEnabled) {
          isServiceEnabled = true;
          await getCurrentLocation();
        } else {
          final isGranted = await location.requestService();
          if (isGranted) {
            await getCurrentLocation();
          } else {
            showErrorDialog(
                message: translation.txt_Enable_gps_description,
                canDismiss: false,
                onClick: () {
                  GoRouter.of(navigatorKey.currentState!.context).pop();
                  checkForPermissionAndMoveNext();
                });
          }
        }
      } else {
        if (permissionDialogRoute == null) {
          permissionDialogRoute = DialogRoute(
            context: context,
            builder: (_) => PermissionDialog(
              onTap: () async {
                await requestPermission();
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
          await getCurrentLocation();
        } else {
          final isServiceGranted = await Geolocator.isLocationServiceEnabled();
          if (isServiceGranted) {
            await getCurrentLocation();
          } else {
            showErrorDialog(
              message: translation.txt_Enable_gps_description,
              canDismiss: false,
              onClick: () {
                GoRouter.of(navigatorKey.currentState!.context).pop();
                checkForPermissionAndMoveNext();
              },
            );
          }
        }
      } else {
        if (permissionDialogRoute == null) {
          permissionDialogRoute = DialogRoute(
            context: context,
            builder: (_) => PermissionDialog(
              onTap: () async {
                await requestPermission();
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
    checkForPermissionAndMoveNext();
  }

  Future<void> getCurrentLocation() async {
    if (isPermissionGranted && isServiceEnabled) {
      debugPrint("getCurrentLocation getCurrentLocation 0 ${DateTime.now()}");
      final lastLocation = await Geolocator.getLastKnownPosition();
      debugPrint(
          "getCurrentLocation getCurrentLocation 1  ${LatLng(lastLocation?.latitude ?? 0.0, lastLocation?.longitude ?? 0.0)} ${DateTime.now()}");

      if (lastLocation == null) {
        const locationSetting =
            LocationSettings(accuracy: LocationAccuracy.high);
        final currentLocation = await Geolocator.getCurrentPosition(
            locationSettings: locationSetting);
        saveCurrentLocation(
            LatLng(currentLocation.latitude, currentLocation.longitude));
        debugPrint(
            "getCurrentLocation getCurrentLocation 2  ${LatLng(currentLocation.latitude, currentLocation.longitude)} ${DateTime.now()}");
      } else {
        saveCurrentLocation(
            LatLng(lastLocation.latitude, lastLocation.longitude));
      }
      popAndMove(CustomRouter.mapScreen);
    } else {
      checkForPermissionAndMoveNext();
    }
  }
}
