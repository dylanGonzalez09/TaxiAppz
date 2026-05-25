import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../network/response_models/translation_model.dart';
import '../../utils/custom_colors.dart';
import '../../utils/dimensions.dart';

class SuccessDialog extends StatelessWidget {
  final String? customMessage;
  final Function()? onClick;
  final String? buttonTxt;
  final TranslationModel? translation;
  final bool canDismiss;

  const SuccessDialog(
      {super.key,
        this.customMessage,
        this.onClick,
        this.translation,
        this.buttonTxt,  this.canDismiss = true});

  @override
  Widget build(BuildContext context) {
    String buttonText = "";

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
                  customMessage.toString(),
                  style: Theme.of(context).textTheme.bodyMedium,
                  maxLines: 10,
                  textAlign: TextAlign.center,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: Dimensions.padding_15),
                InkWell(
                  onTap: onClick ??
                          () {
                        GoRouter.of(context).pop();
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
                          fontSize: 18,
                          color: Colors.white,
                        )
                    ),
                  ),
                )
              ],
            )),
      ),
    );
  }
}
