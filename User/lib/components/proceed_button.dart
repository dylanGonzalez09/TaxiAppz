import 'package:flutter/material.dart';
import '../utils/dimensions.dart';

import '../utils/custom_colors.dart';

class ProceedButton extends StatelessWidget {
  final String btnTxt;
  final Function()? onPressed;
  final bool isAvailable;
  final Size? minimumSize;
  final Size? maxSize;
  final bool? showArrowIcon;
  final bool? isOutlinedBorderButton;
  final bool isLoading;
  final bool? hasSetMargin;
  final int? maxCount;


  const ProceedButton(
      {super.key,
      required this.btnTxt,
      required this.onPressed,
      this.isAvailable = true,
      this.minimumSize,
      this.maxSize,
        this.maxCount,
      this.showArrowIcon = true,
      this.isOutlinedBorderButton = false,
      this.hasSetMargin = true,
      this.isLoading = false});

  @override
  Widget build(BuildContext context) {
    final mediaSize = MediaQuery.sizeOf(context);
    final double horizontalMargin =
        hasSetMargin! ? mediaSize.width * .04 : mediaSize.width * .01;
    return InkWell(
      onTap: onPressed,
      child: Container(
          width: double.infinity,
          margin: EdgeInsets.symmetric(horizontal: horizontalMargin),
          decoration: isOutlinedBorderButton!
              ? BoxDecoration(
                  border: Border.all(color: Colors.black),
                  borderRadius: BorderRadius.circular(Dimensions.padding_26))
              : BoxDecoration(
                  color: isAvailable
                      ? CustomColors.primaryColor
                      : CustomColors.clr_E2E2E2,
                  borderRadius: BorderRadius.circular(Dimensions.padding_26)),
          child: IntrinsicHeight(
            child: isLoading
                ? const SizedBox(
                    height: 50,
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        SizedBox(
                          height: 24,
                          width: 24,
                          child: CircularProgressIndicator(
                            color: CustomColors.buttonTxtColor,
                          ),
                        ),
                      ],
                    ),
                  )
                : Row(
                    children: [
                      Expanded(
                        child: Center(
                          child: Padding(
                            padding: const EdgeInsets.only(
                              left: Dimensions.padding_50,
                              top: Dimensions.padding_14,
                              bottom: Dimensions.padding_14,
                            ),
                            child: Text(
                              btnTxt,
                              style: Theme.of(context)
                                  .textTheme
                                  .titleLarge
                                  ?.copyWith(
                                    color: isAvailable
                                        ? CustomColors.buttonTxtColor
                                        : CustomColors.clr_AAAAAA,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                            ),
                          ),
                        ),
                      ),
                      if (showArrowIcon == true)
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: Dimensions.padding_14,
                              vertical: Dimensions.padding_10),
                          margin: const EdgeInsets.symmetric(
                              horizontal: Dimensions.padding_2,
                              vertical: Dimensions.padding_4),
                          decoration: BoxDecoration(
                              color: isAvailable
                                  ? CustomColors.buttonTxtColor
                                  : CustomColors.clr_ADADAD,
                              shape: BoxShape.circle),
                          child: Icon(
                            Icons.arrow_forward_rounded,
                            color: isAvailable
                                ? CustomColors.primaryColor
                                : Colors.white,
                          ),
                        ),
                    ],
                  ),
          )),
    );
  }
}
