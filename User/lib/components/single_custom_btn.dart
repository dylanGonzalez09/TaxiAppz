import 'package:flutter/material.dart';
import '../utils/dimensions.dart';

import '../utils/custom_colors.dart';

class SingleCustomBtn extends StatelessWidget {
  final String btnTxt;
  final Function()? onPressed;
  final bool isAvailable;
  final Size? minimumSize;
  final Size? maxSize;
  final bool? showArrowIcon;
  final bool? isOutlinedBorderButton;

  const SingleCustomBtn({
    super.key,
    required this.btnTxt,
    required this.onPressed,
    this.isAvailable = true,
    this.minimumSize,
    this.maxSize,
    this.showArrowIcon = true,
    this.isOutlinedBorderButton = false,
  });

  @override
  Widget build(BuildContext context) {
    final mediaSize = MediaQuery.sizeOf(context);
    return InkWell(
      onTap: onPressed,
      child: Container(
          width: double.infinity,
          margin: EdgeInsets.symmetric(horizontal: mediaSize.width * .02),
          decoration: isOutlinedBorderButton!
              ? BoxDecoration(
              border: Border.all(color: Colors.black),
              borderRadius: BorderRadius.circular(Dimensions.padding_26))
              : BoxDecoration(
              border: Border.all(color: CustomColors.primaryColor),
              color: CustomColors.primaryColor,
              borderRadius: BorderRadius.circular(Dimensions.padding_26)),
          child: IntrinsicHeight(
            child: Stack(
              fit: StackFit.expand,
              children: [
                Center(
                    child: Padding(
                        padding: EdgeInsets.symmetric(
                            vertical: isOutlinedBorderButton == true
                                ? Dimensions.padding_15
                                : Dimensions.padding_12),
                        child: Text(btnTxt,
                            style: Theme.of(context).textTheme.titleLarge))),
                if (showArrowIcon == true)
                  Positioned(
                      right: 0,
                      top: 0,
                      bottom: 0,
                      child: Container(
                        margin: const EdgeInsets.symmetric(
                            horizontal: Dimensions.padding_2,
                            vertical: Dimensions.padding_4),
                        width: 50,
                        decoration: const BoxDecoration(
                            color: CustomColors.clr_000000,
                            shape: BoxShape.circle),
                        child: const Icon(
                          Icons.arrow_forward_rounded,
                          color: Colors.white,
                        ),
                      ))
              ],
            ),
          )),
    );
  }
}
