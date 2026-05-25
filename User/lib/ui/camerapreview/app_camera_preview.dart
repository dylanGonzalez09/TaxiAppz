import 'dart:io';

import 'package:camera/camera.dart';
import 'package:flutter/material.dart';

import '../../components/drawer_scaffold.dart';
import '../../utils/dimensions.dart';
import 'app_camera_preview_vm.dart';

class AppCameraPreview extends StatefulWidget {
  const AppCameraPreview({super.key});

  @override
  State<AppCameraPreview> createState() => _AppCameraPreviewState();
}

class _AppCameraPreviewState extends State<AppCameraPreview> {
  final GlobalKey<ScaffoldState> scaffoldKey = GlobalKey<ScaffoldState>();
  @override
  void initState() {
    super.initState();

    try {
      if (Platform.isAndroid || Platform.isIOS) {
        vm.kIsWeb = false;
      } else {
        vm.kIsWeb = true;
      }
    } catch (e) {
      vm.kIsWeb = true;
    }
    initializingCamera();
  }

  final vm = AppCameraPreviewVm();

  @override
  Widget build(BuildContext context) {
    return DrawerScaffold(
      scaffoldKey: scaffoldKey,
      body: Stack(
        children: [
          Positioned.fill(
            child: (vm.controller != null && vm.controller!.value.isInitialized)
                ? (vm.isImageCaptured && vm.image != null)
                    ? vm.kIsWeb
                        ? Image.network(
                            vm.image!.path,
                            fit: BoxFit.fill,
                          )
                        : Image.file(
                            File(vm.image!.path),
                            fit: BoxFit.fill,
                          )
                    : CameraPreview(vm.controller!)
                : Center(
                    child: Text(
                      vm.errorMsg,
                      style: Theme.of(context).textTheme.titleMedium,
                    ),
                  ),
          ),
          Positioned(
            left: 0,
            right: 0,
            bottom: Dimensions.padding_30,
            child: (vm.isImageCaptured)
                ? Row(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: [
                      IconButton(
                        onPressed: () {
                          setState(() {
                            reTakeImage();
                          });
                        },
                        icon: const Icon(
                          Icons.change_circle_outlined,
                          color: Colors.white,
                          size: Dimensions.padding_50,
                        ),
                      ),
                      IconButton(
                        onPressed: () {
                          setState(() {
                            moveNext();
                          });
                        },
                        icon: const Icon(
                          Icons.check_circle_outline,
                          color: Colors.white,
                          size: Dimensions.padding_50,
                        ),
                      ),
                    ],
                  )
                : Row(
                    mainAxisSize: MainAxisSize.max,
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: [
                      const SizedBox(
                        width: Dimensions.padding_30,
                        height: Dimensions.padding_30,
                      ),
                      IconButton(
                        onPressed: () {
                          captureImage();
                        },
                        icon: const Icon(
                          Icons.circle,
                          color: Colors.white,
                          size: Dimensions.padding_80,
                        ),
                      ),
                      vm.kIsWeb
                          ? const SizedBox(
                              width: Dimensions.padding_30,
                              height: Dimensions.padding_30,
                            )
                          : IconButton(
                              onPressed: () {
                                setState(() {
                                  vm.isCameraBackSide = !vm.isCameraBackSide;
                                  setCameraType();
                                });
                              },
                              icon: const Icon(
                                Icons.rotate_left_outlined,
                                color: Colors.white,
                                size: Dimensions.padding_30,
                              ),
                            ),
                    ],
                  ),
          ),
        ],
      ),
    );
  }

  Future<void> initializingCamera() async {
    vm.camera = await availableCameras();
    setCameraType();
  }

  void setCameraType() {
    try {
      if (vm.camera?.isNotEmpty == true) {
        vm.controller?.dispose();
        CameraDescription cameraDescription = (vm.kIsWeb)
            ? vm.camera!.first
            : vm.camera!.firstWhere((c) =>
                c.lensDirection ==
                (vm.isCameraBackSide
                    ? CameraLensDirection.back
                    : CameraLensDirection.front));

        vm.controller = CameraController(
            cameraDescription, ResolutionPreset.high,
            enableAudio: false);
        vm.controller?.initialize().then((_) {
          if (!mounted) {
            return;
          }
          setState(() {});
        }).catchError((Object e) {
          if (e is CameraException) {
            vm.showErrorDialog(
                message: vm.translation.txt_Opening_camera_failed);
          }
        });
      } else {
        vm.showErrorDialog(message: vm.translation.txt_Opening_camera_failed);
      }
    } catch (e) {
      vm.showErrorDialog(message: vm.translation.txt_Opening_camera_failed);
    }
  }

  void captureImage() async {
    try {
      vm.image = await vm.controller?.takePicture();
      vm.isImageCaptured = true;
    } catch (e) {
      vm.showErrorDialog(message: e.toString());
    }
    setState(() {});
  }

  void reTakeImage() {
    vm.image = null;
    vm.isImageCaptured = false;
    setState(() {});
  }

  void moveNext() {
    if (vm.isImageCaptured && vm.image != null) {
      vm.pop(args: File(vm.image!.path));
    } else {
      vm.showErrorDialog(message: vm.translation.txt_Something_went_wrong);
    }
  }
}
