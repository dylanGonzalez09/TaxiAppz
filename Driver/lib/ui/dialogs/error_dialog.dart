import 'dart:io';

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:package_info_plus/package_info_plus.dart';
import 'package:taxiappzpro/network/response_models/custom_error_model.dart';
import 'package:taxiappzpro/network/response_models/translation_model.dart';
import 'package:taxiappzpro/utils/app_constants.dart';
import 'package:taxiappzpro/utils/custom_colors.dart';
import 'package:taxiappzpro/utils/dimensions.dart';
import 'package:url_launcher/url_launcher.dart';

class ErrorDialog extends StatelessWidget {
  final String? message;
  final ErrorModel? model;
  final Function()? onClick;
  final String? buttonTxt;
  final TranslationModel? translation;
  final bool canDismiss;

  const ErrorDialog(
      {super.key,
      this.message,
      this.model,
      this.onClick,
      this.translation,
      this.buttonTxt,
      this.canDismiss = true});

  @override
  Widget build(BuildContext context) {
    String buttonText = "";
    String customMessage = "";
    if (model != null) {
      customMessage = model!.message;
    } else if (message != null && message?.isNotEmpty == true) {
      customMessage = message ?? "";
    } else {
      customMessage = translation!.txt_Something_went_wrong;
    }

    if (buttonTxt != null) {
      buttonText = buttonTxt!;
    } else if (translation != null) {
      buttonText = translation!.txt_Ok;
    } else {
      buttonText = "Ok";
    }
    return PopScope(
      canPop: canDismiss,
      child: Dialog(
        insetPadding: const EdgeInsets.symmetric(
            horizontal: Dimensions.padding_15, vertical: Dimensions.padding_20),
        child: Padding(
            padding: const EdgeInsets.symmetric(
                horizontal: Dimensions.padding_10,
                vertical: Dimensions.padding_15),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Text(
                //   AppConstants.driverAppName,
                //   style: Theme.of(context).textTheme.bodyLarge,
                //   maxLines: 12,
                //   textAlign: TextAlign.center,
                //   overflow: TextOverflow.ellipsis,
                // ),
                // const SizedBox(
                //   height: Dimensions.padding_15,
                // ),
                Text(
                  customMessage,
                  style: Theme.of(context).textTheme.bodyMedium,
                  maxLines: 10,
                  textAlign: TextAlign.center,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: Dimensions.padding_15),
                InkWell(
                  onTap: onClick ??
                      () {
                        if (model?.statusCode == 426) {
                          if (Platform.isAndroid || Platform.isIOS) {
                            final appId = Platform.isAndroid
                                ? 'com.vyd.driver'
                                : 'YOUR_IOS_APP_ID';
                            final url = Uri.parse(
                              Platform.isAndroid
                                  ? "market://details?id=$appId"
                                  : "https://apps.apple.com/app/id$appId",
                            );
                            launchUrl(
                              url,
                              mode: LaunchMode.externalApplication,
                            );
                          }
                        } else {
                          Navigator.of(context).pop();
                        }
                      },
                  child: Container(
                    decoration: BoxDecoration(
                        borderRadius:
                            BorderRadius.circular(Dimensions.padding_30),
                        color: CustomColors.primaryColor),
                    padding: const EdgeInsets.symmetric(
                        horizontal: Dimensions.padding_20,
                        vertical: Dimensions.padding_5),
                    child: Text(
                      buttonText,
                      style: Theme.of(context)
                          .textTheme
                          .bodySmall
                          ?.copyWith(fontSize: 18, color: Colors.white),
                    ),
                  ),
                )
              ],
            )),
      ),
    );
  }
}
