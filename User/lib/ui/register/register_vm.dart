import 'dart:io';

import 'package:dio/dio.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:go_router/go_router.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:intl/intl.dart';
import 'package:location/location.dart' as loc;
import 'package:permission_handler/permission_handler.dart';
import '../../network/response_models/country_model.dart';
import '../../network/response_models/verify_model.dart';
import '../../utils/app_constants.dart';
import '../../utils/app_url.dart';
import '../../utils/base_vm.dart';
import '../../utils/custom_router.dart';


import '../../main.dart';
import '../../utils/preference_helper.dart';
import '../dialogs/permission.dart';

class RegisterVm extends BaseVm {
  final TextEditingController nameController = TextEditingController();
  final TextEditingController emailController = TextEditingController();
  final TextEditingController referralController = TextEditingController();
  final location = loc.Location();
  bool isPermissionGranted = false, isServiceEnabled = false;
  DialogRoute? permissionDialogRoute;
  CountryModel? country;
  String phoneNumber = "", demoKey = "";

  String nameError = "";
  String emailError = "";
  String referralError = "";

  File? profileImage;

  void setArgs(Map<String, dynamic> args) {
    country = args[AppConstants.country];
    phoneNumber = args[AppConstants.phoneNumber];
    if (args.containsKey(AppConstants.demoKey)) {
      demoKey = args[AppConstants.demoKey];
    }
  }

  void checkAndSubmit() async {
    if (!isLoading.value) {
      if (nameController.text.isEmpty) {
        nameError = translation.txt_Name_required;
      } else if (nameController.text.length < 3) {
        nameError = translation.txt_Name_invalid;
      } else if (!isValidName(nameController.text)) {
        nameError = translation.txt_Name_invalid;
      }
      // else if (emailController.text.isEmpty) {
      //   nameError = "";
      //   emailError = translation.txt_Email_invalid;
      // }
      else if (!isValidEmail(emailController.text)) {
        nameError = "";
        emailError = translation.txt_Email_invalid;
      }
      else if (referralController.text.isNotEmpty &&
          referralController.text.length < 3) {
        nameError = "";
        emailError = "";
        referralError = translation.txt_Invalid_referral;
      } else {
        nameError = "";
        emailError = "";
        referralError = "";
        final now = DateTime.now();
        final formattedDate = DateFormat('dd-MM-yyyy').format(now);
        final formattedTime = DateFormat('hh:mm a').format(now);
        _submitData(currentDate: formattedDate, currentTime: formattedTime);
      }
      notifyListeners();
    }
  }


  bool isValidEmail(String email) {
    final emailRegExp = RegExp(
        r'^[a-zA-Z0-9]+(?:[._]?[a-zA-Z0-9]+)*@[a-zA-Z]+\.[a-zA-Z]{2,}$'
    );
    return emailRegExp.hasMatch(email);
  }


  Future<void> _submitData({required String currentDate, required String currentTime}) async {
    isLoading.value = true;
    try {
      final formData = FormData.fromMap({
        AppConstants.name: nameController.text,
        AppConstants.email: emailController.text,
        if (referralController.text.isNotEmpty)
          AppConstants.referralCode: referralController.text,
        AppConstants.phoneNumber: phoneNumber,
        AppConstants.countryCode: country?.id,
        AppConstants.regDate: currentDate,
        AppConstants.regTime: currentTime,
        if (demoKey.isNotEmpty) AppConstants.demoKey: demoKey,
        AppConstants.deviceInfoHash: await getFcmToken()
      });

      if (profileImage != null) {
        formData.files.add(MapEntry(
          AppConstants.profilePic,
          await MultipartFile.fromFile(profileImage!.path),
        ));
      }

      final response =
      await apiHelper.post(AppUrls.userCreate, params: formData);

      response.fold((e) {
        showErrorDialog(errorModel: e);
      }, (r) async {
        final token = parseData(r.data, VerifyModel.fromJson);
        if (token != null) {
          mqtt.initializeMqtt(token.tokens?.userId ?? "");
          await mqtt.connect();
          preference.setString(
              PreferenceHelper.userId, token.tokens?.userId ?? "");
          preference.setString(
              PreferenceHelper.authToken, token.tokens?.access?.token ?? "");
          preference.setString(PreferenceHelper.refreshToken,
              token.tokens?.refresh?.token ?? "");
          checkForPermissionAndMoveNext();
        } else {
          showErrorDialog(message: translation.txt_Something_went_wrong);
        }
      });
    } catch (e) {
      showErrorDialog(message: translation.txt_Something_went_wrong);
    } finally {
      isLoading.value = false;
    }
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
      print("Current permission status: $status");

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
        print("iOS Permission Status after request: $iOSPermission");
        if (iOSPermission == LocationPermission.denied) {
          print("iOS location permission denied.");
        } else if (iOSPermission == LocationPermission.deniedForever) {
          print("iOS location permission permanently denied.");
          openAppSettings();
        } else if (iOSPermission == LocationPermission.whileInUse ||
            iOSPermission == LocationPermission.always) {
          print("iOS location permission granted.");
        }
      }
    }

    LocationPermission recheckedStatus = await Geolocator.checkPermission();
    print("Rechecked permission status: $recheckedStatus");
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