import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../network/response_models/custom_error_model.dart';
import '../../network/response_models/translation_model.dart';
import '../../utils/custom_colors.dart';
import '../../utils/dimensions.dart';

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
      buttonText = translation!.txt_Ok;
    }
    return PopScope(
      canPop: canDismiss,
      child: Dialog(
        backgroundColor: Colors.white,
        child: Padding(
            padding: const EdgeInsets.symmetric(
                horizontal: Dimensions.padding_20,
                vertical: Dimensions.padding_20),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
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
                        // GoRouter.of(context).pop();
                        Navigator.of(context).pop();
                      },
                  child: Container(
                    decoration: BoxDecoration(
                        borderRadius:
                            BorderRadius.circular(Dimensions.padding_10),
                        color: CustomColors.primaryColor),
                    padding: const EdgeInsets.symmetric(
                        horizontal: Dimensions.padding_20,
                        vertical: Dimensions.padding_5),
                    child: Text(
                      buttonText,
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          fontSize: 18, color: CustomColors.buttonTxtColor),
                    ),
                  ),
                )
              ],
            )),
      ),
    );
  }
}
