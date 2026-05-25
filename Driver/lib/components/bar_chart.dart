import 'package:flutter/material.dart';
import '../network/response_models/earnings_model.dart';
import '../network/response_models/translation_model.dart';
import '../utils/custom_colors.dart';
import '../utils/dimensions.dart';
import 'bar_component.dart';

class BarChart extends StatefulWidget {
  final List<EarningsByDay> earningsByDay;
  final TranslationModel translation;
  final String currency;

  const BarChart(
      {super.key, required this.earningsByDay,required this.currency, required this.translation});

  @override
  State<BarChart> createState() => _BarChartState();
}

class _BarChartState extends State<BarChart> {
  String getCurrentDay() {
    final now = DateTime.now();
    switch (now.weekday) {
      case DateTime.monday:
        return "mon";
      case DateTime.tuesday:
        return "tue";
      case DateTime.wednesday:
        return "wed";
      case DateTime.thursday:
        return "thur";
      case DateTime.friday:
        return "fri";
      case DateTime.saturday:
        return "sat";
      case DateTime.sunday:
        return "sun";
      default:
        return "";
    }
  }

  @override
  Widget build(BuildContext context) {
    final currentDay = getCurrentDay();
    final daysOfWeek = ["sun", "mon", "tue", "wed", "thur", "fri", "sat"];
    final currentDayIndex = daysOfWeek.indexOf(currentDay);

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          height: MediaQuery.sizeOf(context).height * 0.33,
          padding: const EdgeInsets.only(
              top: Dimensions.padding_10,
              left: Dimensions.padding_10,
              right: Dimensions.padding_10),
          width: double.infinity,
          decoration: BoxDecoration(
              color: CustomColors.clr_E7E7E7,
              borderRadius: BorderRadius.circular(Dimensions.padding_10)),
          child: LayoutBuilder(builder: (context, constraint) {
            return Row(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: widget.earningsByDay.map((earning) {
                final dayIndex = daysOfWeek.indexOf(earning.day ?? "");
                final isSelected = dayIndex == currentDayIndex;
                final isBeforeCurrentDay = dayIndex < currentDayIndex;
                final maxEarning = widget.earningsByDay
                    .map((e) => e.earnings ?? 0)
                    .fold<double>(0, (prev, element) => element > prev ? element : prev);
                return Expanded(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      Flexible(
                        child: BarComponent(
                          height: maxEarning == 0
                              ? 0
                              : constraint.maxHeight *
                              (earning.earnings ?? 0) /
                              maxEarning,
                          isSelected: isSelected,
                          isActive: isBeforeCurrentDay || isSelected,
                          tripCount: earning.trips ?? 0,
                          income: earning.earnings ?? 0,
                          currencySymbol: widget.currency,
                          completed: earning.completed ?? false,
                          translation: widget.translation,
                        ),
                      ),
                    ],
                  ),
                );
              }).toList(),
            );
          }),
        ),
        const SizedBox(height: Dimensions.padding_8),
        Padding(
          padding:
          const EdgeInsets.symmetric(horizontal: Dimensions.padding_10),
          child: Row(
            children: widget.earningsByDay.map((earning) {
              return Flexible(
                child: Center(
                  child: Text(
                    earning.day ?? "",
                    style: Theme.of(context)
                        .textTheme
                        .bodySmall
                        ?.copyWith(fontSize: 12),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              );
            }).toList(),
          ),
        )
      ],
    );
  }
}
