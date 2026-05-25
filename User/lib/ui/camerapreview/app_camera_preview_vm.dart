import 'package:camera/camera.dart';

import '../../utils/base_vm.dart';

class AppCameraPreviewVm extends BaseVm {
  List<CameraDescription>? camera;
  CameraController? controller;
  bool isCameraBackSide = true, isImageCaptured = false, kIsWeb = false;
  XFile? image;
  String errorMsg = "Camera is Loading.....";
}
