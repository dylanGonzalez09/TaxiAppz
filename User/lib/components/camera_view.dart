import 'dart:io';

import 'package:app_settings/app_settings.dart';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:permission_handler/permission_handler.dart';
import '../main.dart';
import '../network/response_models/translation_model.dart';
import '../ui/dialogs/error_dialog.dart';
import '../utils/custom_colors.dart';

class CameraView extends StatelessWidget {
  final TranslationModel translationModel;
  final Function(File) onItemSelected;

  const CameraView({
    super.key,
    required this.translationModel,
    required this.onItemSelected,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () {
        showPickerBottomSheet(context);
      },
      child: Container(
        height: 200,
        width: 200,
        color: CustomColors.primaryColor,
        child: const Center(
          child: Icon(Icons.camera_alt_rounded),
        ),
      ),
    );
  }

  // -------------------------------------------------------------
  // OPTIONS BOTTOM SHEET
  // -------------------------------------------------------------
  void showPickerBottomSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      builder: (_) {
        return SafeArea(
          child: Wrap(
            children: [
              ListTile(
                leading: const Icon(Icons.photo),
                title: const Text("Choose from Gallery"),
                onTap: () {
                  Navigator.pop(context);
                  pickFromGallery();
                },
              ),
              ListTile(
                leading: const Icon(Icons.camera_alt_rounded),
                title: const Text("Open Camera"),
                onTap: () {
                  Navigator.pop(context);
                  checkCameraPermission(context);
                },
              ),
            ],
          ),
        );
      },
    );
  }

  // -------------------------------------------------------------
  // GALLERY (NO PERMISSION REQUIRED)
  // -------------------------------------------------------------
  void pickFromGallery() async {
    final picker = ImagePicker();

    final XFile? image = await picker.pickImage(
      source: ImageSource.gallery,
      requestFullMetadata: false,
    );

    if (image != null) {
      onItemSelected(File(image.path));
    }
  }

  // -------------------------------------------------------------
  // CAMERA PERMISSION CHECK
  // -------------------------------------------------------------
  void checkCameraPermission(BuildContext context) async {
    final status = await Permission.camera.status;

    if (status.isGranted) {
      openCamera(context);
    } else if (status.isPermanentlyDenied) {
      showMessageDialog(
        translationModel.txt_camera_permission_permanently_denied,
            () {
          AppSettings.openAppSettings(type: AppSettingsType.settings);
        },
      );
    } else {
      final result = await Permission.camera.request();
      if (result.isGranted) {
        openCamera(context);
      } else if (result.isPermanentlyDenied) {
        showMessageDialog(
          translationModel.txt_camera_permission_permanently_denied,
              () {
            AppSettings.openAppSettings(type: AppSettingsType.settings);
          },
        );
      }
    }
  }

  // -------------------------------------------------------------
  // OPEN CAMERA
  // -------------------------------------------------------------
  void openCamera(BuildContext context) async {
    final picker = ImagePicker();
    final XFile? pickedFile = await picker.pickImage(source: ImageSource.camera);

    if (pickedFile != null) {
      onItemSelected(File(pickedFile.path));
    }
  }

  // -------------------------------------------------------------
  // MESSAGE DIALOG
  // -------------------------------------------------------------
  void showMessageDialog(String message, Function() onClick) {
    if (navigatorKey.currentState != null) {
      showDialog(
        context: navigatorKey.currentState!.context,
        barrierDismissible: true,
        builder: (_) {
          return ErrorDialog(
            message: message,
            onClick: onClick,
            translation: translationModel,
            buttonTxt: translationModel.txt_Allow,
            canDismiss: true,
          );
        },
      );
    }
  }
}
