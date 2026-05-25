import 'package:flutter/material.dart';
import '../network/response_models/translation_model.dart';
import '../utils/custom_colors.dart';
import '../utils/dimensions.dart';
import 'animated_tooltip.dart';

class BarComponent extends StatelessWidget {
  final double height;
  final String currencySymbol;
  final bool isSelected;
  final bool isActive;
  final int tripCount;
  final double income;
  final bool completed;
  final TranslationModel translation;

  const BarComponent(
      {super.key,
        required this.height,
        this.isSelected = false,
        this.isActive = true,
        required this.tripCount,
        required this.currencySymbol,
        required this.income,
        required this.completed,
        required this.translation});

  @override
  Widget build(BuildContext context) {
    Color barColor;
    double barHeight = height;

    if (!completed) {
      barColor = CustomColors.clr_AAAAAA;
      barHeight = 15;
    } else if (isSelected) {
      barColor = CustomColors.primaryColor;
    } else {
      barColor = CustomColors.clr_303030;
    }

    return AnimatedTooltip(
      content: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            children: [
              Text(
                translation.txt_trip_count,
                style: Theme.of(context)
                    .textTheme
                    .bodyLarge
                    ?.copyWith(fontSize: 10),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              Text(
                "$tripCount",
                style: Theme.of(context)
                    .textTheme
                    .bodySmall
                    ?.copyWith(fontSize: 14),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
          const SizedBox(
            width: Dimensions.padding_20,
          ),
          Column(
            children: [
              Text(
                translation.txt_income,
                style: Theme.of(context)
                    .textTheme
                    .bodyLarge
                    ?.copyWith(fontSize: 10),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              Text(
                "$currencySymbol $income",
                style: Theme.of(context)
                    .textTheme
                    .bodySmall
                    ?.copyWith(fontSize: 14),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ],
      ),
      child: Container(
        height: barHeight,
        padding: const EdgeInsets.symmetric(
            horizontal: Dimensions.padding_5, vertical: Dimensions.padding_3),
        decoration: BoxDecoration(
            color: barColor,
            borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(Dimensions.padding_6),
                topRight: Radius.circular(Dimensions.padding_6))),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.start,
          children: [
            Container(
              width: 30,
              height: 3,
              decoration: BoxDecoration(
                  color: !isActive
                      ? Colors.transparent
                      : isSelected
                      ? CustomColors.buttonTxtColor
                      : CustomColors.primaryColor,
                  borderRadius: BorderRadius.circular(Dimensions.padding_5)),
            ),
          ],
        ),
      ),
    );
  }
}
