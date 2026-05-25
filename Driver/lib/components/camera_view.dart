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
  const CameraView({super.key, required this.translationModel, required this.onItemSelected});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () {
        checkPermission(context);
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

  void checkPermission(BuildContext context) async {
    final isGranted = await Permission.camera.isGranted;
    if (isGranted) {
      openCamera(context);
    } else {
      if (await Permission.camera.isPermanentlyDenied) {
        showMessageDialog(translationModel.txt_camera_permission_permanently_denied, () {
          AppSettings.openAppSettings(type: AppSettingsType.settings);
        });
      } else {
        await Permission.camera.request();
        checkPermission(context);
      }
    }
  }

  void openCamera(BuildContext context) async {
    final picker = ImagePicker();
    final pickedFile = await picker.pickImage(source: ImageSource.camera);
    if (pickedFile != null) {
      onItemSelected(File(pickedFile.path));
    }
  }

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