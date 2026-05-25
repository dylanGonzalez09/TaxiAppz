import 'dart:io';
import 'package:app_settings/app_settings.dart';
import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:go_router/go_router.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:taxiappzpro/di/di_config.dart';
import 'package:taxiappzpro/ui/dialogs/location_permission_desc_dialog.dart';
import 'package:taxiappzpro/ui/permission_screen/permission_vm.dart';

class PermissionScreen extends StatefulWidget {
  final String destinationName;

  const PermissionScreen({super.key, required this.destinationName});

  @override
  State<PermissionScreen> createState() => _PermissionScreenState();
}

class _PermissionScreenState extends State<PermissionScreen> {
  final vm = getIt<PermissionVm>();
  late final AppLifecycleListener _listener;

  @override
  void initState() {
    _listener = AppLifecycleListener(onStateChange: _onLifeCycleChanged);
    Future.delayed(Duration.zero, () {
      checkLocationPermission();
    });
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return const SafeArea(
        child: Scaffold(
      body: Center(
        child: SizedBox(
          height: 32,
          width: 32,
          child: CircularProgressIndicator(),
        ),
      ),
    ));
  }

  @override
  void dispose() {
    _listener.dispose();
    super.dispose();
  }

  void checkLocationPermission() async {
    if (Platform.isAndroid) {
      final isGranted = await Permission.location.isGranted;
      if (isGranted) {
        debugPrint("notificationCheck  0     ${vm.isPermissionScreenPaused}");
        final notificationPermission = await Permission.notification.isGranted;
        print("notificationCheck  1 granted $notificationPermission");
        if (!notificationPermission) {
          requestForNotificationPermission();
        } else {
          getSystemAlertWindow();
        }
      } else {
        showDialog(
            context: context,
            builder: (_) {
              return LocationPermissionDescDialog(
                  translationModel: vm.translation,
                  onAllowClicked: () {
                    getLocationPermission();
                  });
            },
            barrierDismissible: false);
      }
    } else if (Platform.isIOS) {
      LocationPermission permission = await Geolocator.checkPermission();

      if (permission == LocationPermission.always ||
          permission == LocationPermission.whileInUse) {
        print('iOS Location Permission Granted: $permission');
        getSystemAlertWindow();
      } else if (permission == LocationPermission.denied) {
        LocationPermission newPermission = await Geolocator.requestPermission();
        print('Requested, new status: $newPermission');

        if (newPermission == LocationPermission.always ||
            newPermission == LocationPermission.whileInUse) {
          getSystemAlertWindow();
        } else {
          getLocationPermission();
        }
      } else if (permission == LocationPermission.deniedForever) {
        print('Location permission permanently denied');
        getLocationPermission();
      }
    }
  }

  void _onLifeCycleChanged(AppLifecycleState state) {
    debugPrint(
        "notificationCheck  _onLifeCycleChanged    ${state.name}   ${vm.isPermissionScreenPaused}");
    if (state == AppLifecycleState.resumed && vm.isPermissionScreenPaused) {
      checkLocationPermission();
    } else if (state == AppLifecycleState.inactive) {
      vm.isPermissionScreenPaused = true;
    } else if (state == AppLifecycleState.paused) {
      vm.isPermissionScreenPaused = true;
    }
  }

  void getSystemAlertWindow() async {
    if (Platform.isAndroid) {
      final status = await Permission.systemAlertWindow.isGranted;
      if (!status) {
        if (await Permission.systemAlertWindow.isPermanentlyDenied) {
          vm.showErrorDialog(
              message: vm.translation.txt_system_alert_denied_description,
              canDismiss: false,
              onClick: () {
                GoRouter.of(context).pop();
                AppSettings.openAppSettings(type: AppSettingsType.settings);
              });
        } else {
          vm.showErrorDialog(
              message: vm.translation.txt_system_window_permission_description,
              canDismiss: false,
              onClick: () {
                GoRouter.of(context).pop();
                Permission.systemAlertWindow.request().then((status) {
                  getSystemAlertWindow();
                });
              });
        }
      } else {
        vm.saveData(widget.destinationName);
      }
    } else if (Platform.isIOS) {
      print('sdfsfdfdfdf');
      vm.saveData(widget.destinationName);
    }
  }

  void getLocationPermission() async {
    if (Platform.isAndroid && await Permission.location.isPermanentlyDenied) {
      AppSettings.openAppSettings();
    } else {
      if (Platform.isAndroid) {
        await Permission.location.request();
        checkLocationPermission();
      } else if (Platform.isIOS) {
        LocationPermission iOSPermission = await Geolocator.requestPermission();
        debugPrint("iOS Permission Status after request: $iOSPermission");
        if (iOSPermission == LocationPermission.denied) {
          debugPrint("iOS location permission denied.");
          openAppSettings();
        } else if (iOSPermission == LocationPermission.deniedForever) {
          debugPrint("iOS location permission permanently denied.");
          openAppSettings();
        } else if (iOSPermission == LocationPermission.whileInUse ||
            iOSPermission == LocationPermission.always) {
          debugPrint("iOS location permission granted.");
          getSystemAlertWindow();
        }
      }

      /*{
        vm.isPermissionPause = true;
        await Permission.locationWhenInUse.request();
        final permissionStatus = await Permission.locationWhenInUse.status;
        debugPrint("dsgdfgf word $permissionStatus");
        if (permissionStatus.isGranted) {
          print('dsfsfsfdfdsvdf');
          final alwaysAllowStatus = await Permission.locationAlways.status;
          debugPrint("hellow word $alwaysAllowStatus");
          if (alwaysAllowStatus.isGranted) {
            getSystemAlertWindow();
          } else if (alwaysAllowStatus.isPermanentlyDenied) {
            debugPrint("AlwaysAllow status $alwaysAllowStatus");
            vm.showErrorDialog(
                message: vm.translation
                    .txt_Location_permission_is_permanently_denied_ios,
                canDismiss: false,
                onClick: () async {
                  Navigator.of(context).pop();
                  await Permission.locationWhenInUse.request();
                  vm.isPermissionPause = false;
                  openAppSettings();
                });
          } else {
            vm.isPermissionPause = true;
            await Permission.locationAlways.request();
          }
        } else if (permissionStatus.isPermanentlyDenied) {
          print('sdfsdfsdvfvf');
          vm.showErrorDialog(
              message: vm.translation
                  .txt_Location_permission_is_permanently_denied_ios,
              canDismiss: false,
              onClick: () async {
                GoRouter.of(context).pop();
                await Permission.locationWhenInUse.request();
                vm.isPermissionPause = false;
                openAppSettings();
              });
        } else {
          print('luwdwneamcs');
          getLocationPermission();
        }
      }*/
    }
  }

  void requestForNotificationPermission() async {
    print("notificationCheck  2");
    final requestNotificationPermission =
        await Permission.notification.request();
    if (requestNotificationPermission == PermissionStatus.granted) {
      checkLocationPermission();
    } else {
      vm.showErrorDialog(
          message: vm.translation.txtNotificationPermissionDeniedAlert,
          canDismiss: false,
          onClick: () {
            AppSettings.openAppSettings(type: AppSettingsType.settings);
          });
    }
  }
}
