import 'package:flutter/material.dart';
import 'package:taxiappzpro/utils/custom_colors.dart';
import '../utils/app_constants.dart';

class ProceedButton extends StatelessWidget {
  final String btnTxt;
  final Function()? onPressed;
  final bool isAvailable;
  final Size? minimumSize;
  final Size? maxSize;
  final bool isLoading;
  final bool? showArrowIcon;
  final bool? isOutlinedBorderButton;
  final int? maxCount;

  const ProceedButton({
    super.key,
    required this.btnTxt,
    required this.onPressed,
    this.isAvailable = true,
    this.minimumSize,
    this.maxSize,
    this.maxCount,
    this.isLoading = false,
    this.showArrowIcon = true,
    this.isOutlinedBorderButton = false,
  });

  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
        style: ElevatedButton.styleFrom(
            shadowColor: Colors.transparent,
            elevation: 0,
            minimumSize: minimumSize ??
                Size(MediaQuery.sizeOf(context).width * 0.75, 50),
            maximumSize:
                maxSize ?? Size(MediaQuery.sizeOf(context).width * 0.75, 50),
            padding: EdgeInsets.zero,
            surfaceTintColor: isAvailable
                ? CustomColors.primaryColor
                : CustomColors.clr_E2E2E2,
            backgroundColor: isAvailable
                ? CustomColors.primaryColor
                : CustomColors.clr_E2E2E2),
        onPressed: onPressed,
        child: Padding(
          padding: const EdgeInsets.only(top: 5, bottom: 5, right: 5),
          child: isLoading
              ? const SizedBox(
                  height: 24,
                  width: 24,
                  child: CircularProgressIndicator(
                    color: CustomColors.buttonTxtColor,
                  ),
                )
              : Stack(
                  fit: StackFit.expand,
                  children: [
                    Positioned.fill(
                      child: LayoutBuilder(
                        builder: (context, constraints) {
                          final double availableWidth = constraints.maxWidth -
                              50; // Adjust for the icon width
                          return FittedBox(
                            fit: BoxFit.scaleDown,
                            child: Container(
                              constraints:
                                  BoxConstraints(maxWidth: availableWidth),
                              child: Text(
                                btnTxt,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: TextStyle(
                                  color: isAvailable
                                      ? CustomColors.buttonTxtColor
                                      : CustomColors.clr_AAAAAA,
                                  fontFamily: AppConstants.latoFont,
                                  fontWeight: FontWeight.w700,
                                  fontSize: 20,
                                ),
                              ),
                            ),
                          );
                        },
                      ),
                    ),
                    if (showArrowIcon == true)
                      Positioned(
                          right: 0,
                          top: 0,
                          bottom: 0,
                          child: Container(
                            padding: EdgeInsets.zero,
                            height: (maxSize?.height ?? 50) - 10,
                            width: (maxSize?.height ?? 50) - 10,
                            decoration: BoxDecoration(
                              color: isAvailable
                                  ? Colors.white
                                  : CustomColors.clr_ADADAD,
                              shape: BoxShape.circle,
                            ),
                            child: Icon(
                              Icons.arrow_forward,
                              color: isAvailable
                                  ? CustomColors.primaryColor
                                  : Colors.white,
                            ),
                          ))
                  ],
                ),
        ));
  }
}
