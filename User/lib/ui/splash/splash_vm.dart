import 'dart:convert';
import 'dart:io';
import 'package:app_settings/app_settings.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:go_router/go_router.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:device_info_plus/device_info_plus.dart';
import 'package:user/utils/custom_colors.dart';
import '../../main.dart';
import '../../modeldata/app_enum.dart';
import 'package:location/location.dart' as loc;
import '../../network/response_models/config_model.dart';
import '../../network/response_models/country_model.dart';
import '../../network/response_models/custom_error_model.dart';
import '../../network/response_models/intro_model.dart';
import '../../network/response_models/translation_model.dart';
import '../../utils/app_constants.dart';
import '../../utils/app_url.dart';
import '../../utils/base_vm.dart';
import '../../utils/custom_navigator_observer.dart';
import '../../utils/custom_router.dart';
import '../../utils/preference_helper.dart';
import '../dialogs/permission.dart';

class SplashVm extends BaseVm {
  final deviceIno = DeviceInfoPlugin();

  ErrorModel? model;
  TranslationModel? translationModel;
  final location = loc.Location();
  bool isPermissionGranted = false,
      isServiceEnabled = false,
      isUpdateAvailable = false;
  DialogRoute? permissionDialogRoute;
  bool isCheckingPermission = false;
  bool isFromSettings = false;
  bool isDialogOpen = false;

  Future<void> getConfig() async {
    final versionCode = Platform.isAndroid
        ? AppConstants.androidVersionCode
        : Platform.isWindows
            ? AppConstants.windowsVersionCode
            : AppConstants.iosVersionCode;

    final languageCode = preference.getString(PreferenceHelper.languageCode);
    final body = {AppConstants.Code: versionCode};

    final List<Future> futures = [
      apiHelper.post(AppUrls.getConfig, params: body),
    ];

    if (languageCode?.isNotEmpty == true) {
      futures.add(apiHelper.get("${AppUrls.getTranslation}$languageCode"));
    }

    final response = await Future.wait(futures);
    print('responseeeeeeeee ${response}');
    // Handle Config Response
    response[0].fold((e) {
      model = e;
      isUpdateAvailable = model?.statusCode == 426;

      if (isUpdateAvailable) {
        final selectedLanguageCode =
            preference.getString(PreferenceHelper.languageCode) ?? "en";
        _initNavigation(selectedLanguageCode);
      } else {
        showErrorDialog(errorModel: e);
      }
    }, (r) {
      final config = parseData(r.data, ConfigModel.fromJson);
      if (config != null) {
        preference.setString(
            PreferenceHelper.config, jsonEncode(config.toJson()));
        if ((preference.getString(PreferenceHelper.languageCode)?.isEmpty ??
            true)) {
          config.settings?.forEach((data) {
            if (data.name == SettingsEnum.general.name) {
              final code = data.settings?.defaultLanguage ?? "en";
              _initNavigation(code);
              return;
            }
          });
        }
      } else {
        showErrorDialog(message: AppConstants.someThingWentWrong);
      }
    });

    // Handle Translation Response (if available)
    if (languageCode?.isNotEmpty == true && response.length > 1) {
      response[1].fold((e) {
        showErrorDialog(errorModel: e);
      }, (r) async {
        translationModel = parseData(r.data, TranslationModel.fromJson);
        if (translationModel != null) {
          preference.setString(PreferenceHelper.translation,
              jsonEncode(translationModel?.toJson()));
          await _handlePostTranslation();
        } else {
          showErrorDialog(message: AppConstants.someThingWentWrong);
        }
      });
    }
  }

  Future<void> _handlePostTranslation() async {
    final isTokenAvailable =
        (preference.getString(PreferenceHelper.authToken) ?? "").isNotEmpty;

    if (!isUpdateAvailable) {
      if (isTokenAvailable) {
        final userId = preference.getString(PreferenceHelper.userId) ?? '';
        mqtt.initializeMqtt(userId);
        await mqtt.connect();
        checkForPermissionAndMoveNext();
      } else {
        popAndMove(CustomRouter.loginScreen);
      }
    } else if (model?.statusCode == 426) {
      updateApp(model, translationModel);
    }
  }

  Future<void> _getTranslation(String code, bool moveToLogin) async {
    final response = await apiHelper.get("${AppUrls.getTranslation}$code");
    response.fold((e) {
      showErrorDialog(errorModel: e);
    }, (r) async {
      translationModel = parseData(r.data, TranslationModel.fromJson);
      if (translationModel != null) {
        preference.setString(PreferenceHelper.translation,
            jsonEncode(translationModel?.toJson()));
        if (!isUpdateAvailable) {
          if (moveToLogin) {
            checkForPermissionAndMoveNext();
          } else {
            popAndMove(CustomRouter.loginScreen);
          }
        } else if (model?.statusCode == 426) {
          updateApp(model, translationModel);
        }
      } else {
        showErrorDialog(message: AppConstants.someThingWentWrong);
      }
    });
  }

  Future<void> _initNavigation(String code) async {
    final isTokenAvailable =
        (preference.getString(PreferenceHelper.authToken) ?? "").isNotEmpty;

    if (isTokenAvailable) {
      await _getTranslation(code, true);
      return;
    }

    final selectedLanguageCode =
        preference.getString(PreferenceHelper.languageCode) ?? "";

    if (selectedLanguageCode.isNotEmpty) {
      await _getTranslation(code, false);
      return;
    }

    final allResponse = await Future.wait([
      apiHelper.get("${AppUrls.getTranslation}$code"),
      apiHelper.get(AppUrls.getIntroList),
      apiHelper.get(AppUrls.getCountryList)
    ]);

    await _handleInitResponses(allResponse);
  }

  Future<void> _handleInitResponses(List<dynamic> responses) async {
    // Translation
    responses[0].fold((e) => showErrorDialog(errorModel: e), (r) {
      translationModel = parseData(r.data, TranslationModel.fromJson);
      if (translationModel != null) {
        preference.setString(PreferenceHelper.translation,
            jsonEncode(translationModel?.toJson()));
      } else {
        showErrorDialog(message: AppConstants.someThingWentWrong);
      }
    });

    // Intro List
    responses[1].fold((e) => showErrorDialog(errorModel: e), (r) async {
      try {
        final jsonString = jsonDecode(json.encode(r.data));
        final introList = List<IntroModel>.from(
            jsonString.map((x) => IntroModel.fromJson(x)));
        final imagePreloads = introList.map((e) {
          return precacheImage(
            CachedNetworkImageProvider(
                "${AppConstants.imageBaseUrl}${e.image}"),
            navigatorKey.currentState!.context,
          );
        }).toList();
        await Future.wait(imagePreloads);

        preference.setString(PreferenceHelper.introContent,
            jsonEncode(introList.map((e) => e.toJson()).toList()));
      } catch (_) {
        showErrorDialog(message: AppConstants.someThingWentWrong);
      }
    });

    // Country List
    responses[2].fold((e) => showErrorDialog(errorModel: e), (r) {
      final jsonString = jsonDecode(json.encode(r.data));
      final countryList = List<CountryModel>.from(
          jsonString.map((x) => CountryModel.fromJson(x)));
      preference.setString(
          PreferenceHelper.countryList, jsonEncode(countryList));
    });

    if (!isUpdateAvailable) {
      popAndMove(CustomRouter.languageScreen);
    } else if (model?.statusCode == 426) {
      updateApp(model, translationModel);
    }
  }

  void updateApp(ErrorModel? model, TranslationModel? translation) {
    checkAndOpenSecondScreen(navigatorKey.currentState!.context, translation);
  }

  Future<void> checkAndOpenSecondScreen(
      BuildContext context, TranslationModel? model) async {
    if (CustomNavigatorObserver.currentRoute != CustomRouter.updateScreen) {
      popAndMove(CustomRouter.updateScreen, args: model);
    }
  }

  bool isPaused = false;
  bool _isDialogOpen = false;

  void onLifeCycleChanged(AppLifecycleState state) {
    debugPrint(
      "Lifecycle State : ${state.name}",
    );
    if (state == AppLifecycleState.paused) {
      isPaused = true;
    }
    if (state == AppLifecycleState.resumed && isPaused) {
      isPaused = false;
      checkForPermissionAndMoveNext();
    }
  }

  Future<void> checkForPermissionAndMoveNext() async {
    final context = navigatorKey.currentState?.overlay?.context;
    if (context == null) return;
    final notificationPermission = await Permission.notification.status;
    debugPrint(
      "Notification Status: $notificationPermission",
    );
    if (notificationPermission.isGranted) {
      if (_isDialogOpen && Navigator.canPop(context)) {
        Navigator.pop(context);
      }
      _isDialogOpen = false;
      popAndMove(CustomRouter.mapScreen);
      return;
    }
    print('iefjneogw$_isDialogOpen');
    if (_isDialogOpen) return;
    _isDialogOpen = true;
    print('efwfwgge$_isDialogOpen');
    WidgetsBinding.instance.addPostFrameCallback((_) {
      showErrorDialog(
        message: translation.txtNotificationPermissionDeniedAlert,
        canDismiss: false,
        onClick: () async {
          _isDialogOpen = false;
          await AppSettings.openAppSettings(
            type: AppSettingsType.settings,
          );
        },
      );
    });
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

  // Future<void> checkForPermissionAndMoveNext() async {
  //   final context = navigatorKey.currentState!.context;
  //   final notificationPermission = await Permission.notification.status;
  //   print('Notification Status: $notificationPermission');
  //   if (notificationPermission.isGranted) {
  //     /// CLOSE DIALOG
  //     if (_isDialogOpen && Navigator.canPop(context)) {
  //       Navigator.pop(context);
  //     }
  //     _isDialogOpen = false;
  //
  //     notifyListeners();
  //
  //     popAndMove(CustomRouter.mapScreen);
  //
  //     return;
  //   }
  //
  //   /// PREVENT MULTIPLE DIALOGS
  //   if (_isDialogOpen) return;
  //
  //   _isDialogOpen = true;
  //
  //   /// SHOW DIALOG
  //   Future.delayed(
  //     const Duration(milliseconds: 200),
  //         () {
  //       showDialog(
  //         context: context,
  //         barrierDismissible: false,
  //         builder: (_) {
  //           return AlertDialog(
  //             title: const Text("Permission Required"),
  //             content: Text(
  //               translation
  //                   .txtNotificationPermissionDeniedAlert,
  //             ),
  //             actions: [
  //               TextButton(
  //                 onPressed: () async {
  //
  //                   await AppSettings.openAppSettings(
  //                     type: AppSettingsType.settings,
  //                   );
  //                 },
  //                 child: const Text("Open Settings"),
  //               ),
  //             ],
  //           );
  //         },
  //       ).then((_) {
  //         _isDialogOpen = false;
  //       });
  //     },
  //   );
  //   if (Platform.isAndroid) {
  //     final isGranted = await Permission.location.isGranted;
  //     if (isGranted) {
  //       isPermissionGranted = true;
  //       final isLocationServiceEnabled =
  //           await Geolocator.isLocationServiceEnabled();
  //       if (isLocationServiceEnabled) {
  //         isServiceEnabled = true;
  //         await getCurrentLocation();
  //       } else {
  //         final isGranted = await location.requestService();
  //         if (isGranted) {
  //           await getCurrentLocation();
  //         } else {
  //           showErrorDialog(
  //               message: translation.txt_Enable_gps_description,
  //               canDismiss: false,
  //               onClick: () {
  //                 GoRouter.of(navigatorKey.currentState!.context).pop();
  //                 checkForPermissionAndMoveNext();
  //               });
  //         }
  //       }
  //     } else {
  //       if (permissionDialogRoute == null) {
  //         permissionDialogRoute = DialogRoute(
  //           context: context,
  //           builder: (_) => PermissionDialog(
  //             onTap: () async {
  //               await requestPermission();
  //             },
  //             translationModel: translation,
  //           ),
  //           barrierDismissible: false,
  //         );
  //         Navigator.of(context).push(permissionDialogRoute!).then((value) {
  //           permissionDialogRoute = null;
  //         });
  //       }
  //     }
  //   } else if (Platform.isIOS) {
  //     LocationPermission status = await Geolocator.checkPermission();
  //     debugPrint("Current permission status: $status");
  //     if (status == LocationPermission.whileInUse ||
  //         status == LocationPermission.always) {
  //       isPermissionGranted = true;
  //       final isLocationServiceEnabled =
  //           await Geolocator.isLocationServiceEnabled();
  //       if (isLocationServiceEnabled) {
  //         isServiceEnabled = true;
  //         await getCurrentLocation();
  //       } else {
  //         final isServiceGranted = await Geolocator.isLocationServiceEnabled();
  //         if (isServiceGranted) {
  //           await getCurrentLocation();
  //         } else {
  //           showErrorDialog(
  //             message: translation.txt_Enable_gps_description,
  //             canDismiss: false,
  //             onClick: () {
  //               GoRouter.of(navigatorKey.currentState!.context).pop();
  //               checkForPermissionAndMoveNext();
  //             },
  //           );
  //         }
  //       }
  //     } else {
  //       if (permissionDialogRoute == null) {
  //         permissionDialogRoute = DialogRoute(
  //           context: context,
  //           builder: (_) => PermissionDialog(
  //             onTap: () async {
  //               await requestPermission();
  //             },
  //             translationModel: translation,
  //           ),
  //           barrierDismissible: false,
  //         );
  //         Navigator.of(context).push(permissionDialogRoute!).then((value) {
  //           permissionDialogRoute = null;
  //         });
  //       }
  //     }
  //   }
  // }

  Future<void> requestPermission() async {
    final context = navigatorKey.currentState!.context;
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
    final context = navigatorKey.currentState!.context;
    if (isPermissionGranted && isServiceEnabled) {
      debugPrint("getCurrentLocation splash 0 ${DateTime.now()}");
      final lastLocation = await Geolocator.getLastKnownPosition();
      debugPrint(
          "getCurrentLocation splash 1  ${LatLng(lastLocation?.latitude ?? 0.0, lastLocation?.longitude ?? 0.0)} ${DateTime.now()}");

      if (lastLocation == null) {
        const locationSetting =
            LocationSettings(accuracy: LocationAccuracy.high);
        final currentLocation = await Geolocator.getCurrentPosition(
            locationSettings: locationSetting);
        saveCurrentLocation(
            LatLng(currentLocation.latitude, currentLocation.longitude));
        debugPrint(
            "getCurrentLocation splash 2  ${LatLng(currentLocation.latitude, currentLocation.longitude)} ${DateTime.now()}");
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
