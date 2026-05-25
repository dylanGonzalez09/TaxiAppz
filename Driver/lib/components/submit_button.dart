import 'package:flutter/material.dart';

import '../utils/custom_colors.dart';
import '../utils/dimensions.dart';

class SubmitButton extends StatelessWidget {
  final String buttonText;
  final Function() onclick;
  final bool isLoading;
  final bool isEnabled;

  const SubmitButton(
      {super.key,
      required this.buttonText,
      required this.onclick,
      this.isLoading = false,
      this.isEnabled = true});

  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
      onPressed: onclick,
      style: ElevatedButton.styleFrom(
          elevation: 0,
          minimumSize: const Size(double.infinity, 0),
          surfaceTintColor:
              isEnabled ? CustomColors.primaryColor : CustomColors.clr_E2E2E2,
          backgroundColor:
              isEnabled ? CustomColors.primaryColor : CustomColors.clr_E2E2E2,
          padding: const EdgeInsets.symmetric(
              horizontal: Dimensions.padding_20,
              vertical: Dimensions.padding_15)),
      child: isLoading
          ? const Center(
              child: SizedBox(
                  height: 24,
                  width: 24,
                  child: CircularProgressIndicator(
                    color: CustomColors.buttonTxtColor,
                  )))
          : Text(
              buttonText,
              style: Theme.of(context)
                  .textTheme
                  .titleLarge
                  ?.copyWith(color: Colors.white),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
    );
  }
}
