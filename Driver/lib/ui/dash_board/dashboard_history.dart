import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:taxiappzpro/components/month_selector_tooltip.dart';
import 'package:taxiappzpro/network/response_models/translation_model.dart';
import 'package:taxiappzpro/ui/dash_board/dashboard_vm.dart';
import 'package:taxiappzpro/utils/custom_colors.dart';
import 'package:taxiappzpro/utils/custom_images.dart';
import 'package:taxiappzpro/utils/dimensions.dart';
import 'package:taxiappzpro/utils/utils.dart';

class DashboardHistory extends StatefulWidget {
  final DashboardVm vm;
  final TranslationModel translation;

  const DashboardHistory(
      {super.key, required this.vm, required this.translation});

  @override
  State<DashboardHistory> createState() => _DashboardHistoryState();
}

class _DashboardHistoryState extends State<DashboardHistory> {
  @override
  void dispose() {
    widget.vm.yearIndex = 0;
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final summaries = widget.vm.dashboardHistoryModel?.summaries;
    final tripHistory = widget.vm.dashboardHistoryModel?.tripHistory;

    return Column(
      children: [
        Padding(
          padding:
              const EdgeInsets.symmetric(horizontal: Dimensions.padding_10),
          child: IntrinsicHeight(
            child: Row(
              mainAxisAlignment: MainAxisAlignment.start,
              children: [
                Expanded(
                    child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(widget.translation.txt_current_month,
                        style: Theme.of(context).textTheme.bodyMedium),
                    const SizedBox(height: Dimensions.padding_16),
                    Row(
                      children: [
                        Expanded(
                            child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              widget.translation.txt_trip_count,
                              style: Theme.of(context)
                                  .textTheme
                                  .bodySmall
                                  ?.copyWith(fontSize: 13),
                              overflow: TextOverflow.ellipsis,
                            ),
                            const SizedBox(height: Dimensions.padding_5),
                            Text(
                                summaries?.currentMonth?.tripCount
                                        ?.toString() ??
                                    "0.00",
                                style: Theme.of(context).textTheme.bodySmall,
                                overflow: TextOverflow.ellipsis)
                          ],
                        )),
                        const SizedBox(width: Dimensions.padding_5),
                        Expanded(
                            child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              widget.translation.txt_income,
                              style: Theme.of(context)
                                  .textTheme
                                  .bodySmall
                                  ?.copyWith(fontSize: 13),
                              overflow: TextOverflow.ellipsis,
                            ),
                            const SizedBox(height: Dimensions.padding_5),
                            Text(
                                summaries?.currentMonth?.income != null
                                    ? '${widget.vm.getCurrencySymbol()} ${Utils.formatDecimalPointValue(summaries!.currentMonth!.income!.toString(), 2)}'
                                    : "0.00",
                                style: Theme.of(context)
                                    .textTheme
                                    .bodySmall
                                    ?.copyWith(fontSize: 18),
                                overflow: TextOverflow.ellipsis)
                          ],
                        ))
                      ],
                    )
                  ],
                )),
                Container(
                  margin: const EdgeInsets.symmetric(
                      horizontal: Dimensions.padding_10),
                  width: 1,
                  color: CustomColors.clr_AAAAAA,
                ),
                Expanded(
                    child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(widget.translation.txt_Previous_Month,
                        style: Theme.of(context).textTheme.bodyMedium),
                    const SizedBox(height: Dimensions.padding_16),
                    Row(
                      children: [
                        Expanded(
                            child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              widget.translation.txt_trip_count,
                              style: Theme.of(context)
                                  .textTheme
                                  .bodySmall
                                  ?.copyWith(fontSize: 13),
                              overflow: TextOverflow.ellipsis,
                            ),
                            const SizedBox(height: Dimensions.padding_5),
                            Text(
                                summaries?.previousMonth?.tripCount?.toString() ??"0.00",
                                style: Theme.of(context).textTheme.bodySmall,
                                overflow: TextOverflow.ellipsis)
                          ],
                        )),
                        const SizedBox(width: Dimensions.padding_5),
                        Expanded(
                            child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              widget.translation.txt_income,
                              style: Theme.of(context)
                                  .textTheme
                                  .bodySmall
                                  ?.copyWith(fontSize: 13),
                              overflow: TextOverflow.ellipsis,
                            ),
                            const SizedBox(height: Dimensions.padding_5),
                            Text(
                                summaries?.currentMonth?.income != null
                                    ? '${widget.vm.getCurrencySymbol()} ${Utils.formatDecimalPointValue(summaries!.previousMonth!.income!.toString(), 2)}'
                                    : "0.00",
                                style: Theme.of(context)
                                    .textTheme
                                    .bodySmall
                                    ?.copyWith(fontSize: 18),
                                overflow: TextOverflow.ellipsis)
                          ],
                        ))
                      ],
                    )
                  ],
                ))
              ],
            ),
          ),
        ),
        const SizedBox(height: Dimensions.padding_20),
        AnimatedMonthSelectedToolTip(
          monthList: widget.vm.monthList,
          yearList: widget.vm.yearList,
          onItemSelected: (year, month) {
            setState(() {
              widget.vm.filteredDate = "$year $month";
            });
          },
          child: Container(
            width: double.infinity,
            padding: const EdgeInsets.all(10),
            margin:
                const EdgeInsets.symmetric(horizontal: Dimensions.padding_10),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(Dimensions.padding_10),
              boxShadow: const <BoxShadow>[
                BoxShadow(
                  color: Colors.grey,
                  blurRadius: 2,
                  spreadRadius: 0.5,
                ),
              ],
            ),
            child: Row(
              children: [
                Expanded(
                    child: Text(
                  widget.vm.filteredDate,
                  style: Theme.of(context).textTheme.bodySmall,
                  overflow: TextOverflow.ellipsis,
                )),
                const SizedBox(width: Dimensions.padding_5),
                const Icon(
                  Icons.calendar_month_rounded,
                  color: CustomColors.clr_303030,
                  size: 24,
                )
              ],
            ),
          ),
        ),
        const SizedBox(height: Dimensions.padding_20),
        Expanded(
            child: ListView.separated(
          itemBuilder: (context, index) {
            final trip = tripHistory?[index];
            return Column(
              children: [
                Padding(
                  padding: const EdgeInsets.symmetric(
                      horizontal: Dimensions.padding_10),
                  child: Row(
                    children: [
                      SvgPicture.asset(CustomImages.tempAutoImage),
                      const SizedBox(width: Dimensions.padding_10),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(trip?.date ?? "0.00",
                              style: Theme.of(context)
                                  .textTheme
                                  .bodySmall
                                  ?.copyWith(fontSize: 16)),
                          const SizedBox(height: Dimensions.padding_5),
                          Row(
                            children: [
                              Text(
                                  "${widget.translation.txt_Trips} ${trip?.tripCount ?? "0.00"}",
                                  style: Theme.of(context)
                                      .textTheme
                                      .bodySmall
                                      ?.copyWith(fontSize: 16)),
                              const SizedBox(width: Dimensions.padding_20),
                              Text(
                                  "${widget.translation.txt_Earnings} ${widget.vm.getCurrencySymbol()} ${trip?.earnings?.toString() ?? "0.00"}",
                                  style: Theme.of(context)
                                      .textTheme
                                      .bodySmall
                                      ?.copyWith(fontSize: 16)),
                            ],
                          )
                        ],
                      )
                    ],
                  ),
                ),
                if (index == (tripHistory?.length ?? 0) - 1)
                  const SizedBox(height: Dimensions.padding_20)
              ],
            );
          },
          itemCount: tripHistory?.length ?? 0,
          separatorBuilder: (BuildContext context, int index) {
            return Container(
              width: double.infinity,
              height: 1,
              color: CustomColors.clr_AAAAAA,
              margin:
                  const EdgeInsets.symmetric(vertical: Dimensions.padding_10),
            );
          },
        ))
      ],
    );
  }
}
