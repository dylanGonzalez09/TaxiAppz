import 'package:flutter/material.dart';
import 'package:provider/provider.dart'; // Import Provider package
import 'package:taxiappzpro/components/bar_chart.dart';
import 'package:taxiappzpro/components/dashboard_description.dart';
import 'package:taxiappzpro/network/response_models/translation_model.dart';
import 'package:taxiappzpro/ui/dash_board/dashboard_vm.dart';
import 'package:taxiappzpro/utils/custom_images.dart';
import 'package:taxiappzpro/utils/dimensions.dart';

class EarningsScreen extends StatefulWidget {
  final DashboardVm vm;
  final TranslationModel translation;

  const EarningsScreen({super.key, required this.vm, required this.translation});

  @override
  State<EarningsScreen> createState() => _EarningsScreenState();
}

class _EarningsScreenState extends State<EarningsScreen> {

  @override
  void initState() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      widget.vm.getEarningsList();
      widget.vm.getHistoryList();
    }
    );

    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider.value(
      value: widget.vm,
      child: Consumer<DashboardVm>(
        builder: (context, vm, child) {
          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: Dimensions.padding_10),
                child: Text(widget.translation.txt_Total_Earnings_of_the_Week,
                    style: Theme.of(context).textTheme.bodySmall),
              ),
              const SizedBox(height: Dimensions.padding_20),
              Expanded(
                child: SingleChildScrollView(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      BarChart(earningsByDay: vm.earningsModel?.dashboard?.earningsByDay ?? [], translation: widget.translation, currency: vm.getCurrencySymbol(),),
                      const SizedBox(
                        height: Dimensions.padding_20,
                      ),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: Dimensions.padding_10),
                        child: Row(
                          children: [
                            Expanded(
                                child: DashboardDescription(
                                  header:  widget.translation.txt_Today_s,
                                  descOne:  widget.translation.txt_trip_count,
                                  descTwo: widget.translation.txt_income,
                                  valueOne: vm.earningsModel?.dashboard?.summaries?.today?.tripCount.toString() ?? "0",
                                  valueTwo: "${vm.getCurrencySymbol()} ${vm.earningsModel?.dashboard?.summaries?.today?.income.toString() ?? "0"}",
                                  picture: CustomImages.calender,
                                )),
                            const SizedBox(
                              width: Dimensions.padding_20,
                            ),
                            Expanded(
                                child: DashboardDescription(
                                  header: widget.translation.txt_Yesterday_s,
                                  descOne:  widget.translation.txt_trip_count,
                                  descTwo: widget.translation.txt_income,
                                  valueOne: vm.earningsModel?.dashboard?.summaries?.yesterday?.tripCount.toString() ?? "0",
                                  valueTwo: "${vm.getCurrencySymbol()} ${vm.earningsModel?.dashboard?.summaries?.yesterday?.income.toString() ?? "0"}",
                                  picture: CustomImages.calender,
                                )),
                          ],
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.symmetric(
                            horizontal: Dimensions.padding_10,
                            vertical: Dimensions.padding_20),
                        child: Row(
                          children: [
                            Expanded(
                                child: DashboardDescription(
                                  header:  widget.translation.txt_Current_Week,
                                  descOne:  widget.translation.txt_trip_count,
                                  descTwo: widget.translation.txt_income,
                                  valueOne: vm.earningsModel?.dashboard?.summaries?.currentWeek?.tripCount.toString() ?? "0",
                                  valueTwo: "${vm.getCurrencySymbol()} ${vm.earningsModel?.dashboard?.summaries?.currentWeek?.income.toString() ?? "0"}",
                                )),
                            const SizedBox(
                              width: Dimensions.padding_20,
                            ),
                            Expanded(
                                child: DashboardDescription(
                                  header: widget.translation.txt_current_month,
                                  descOne:  widget.translation.txt_trip_count,
                                  descTwo: widget.translation.txt_income,
                                  valueOne: vm.earningsModel?.dashboard?.summaries?.currentMonth?.tripCount.toString() ?? "0",
                                  valueTwo: "${vm.getCurrencySymbol()} ${vm.earningsModel?.dashboard?.summaries?.currentMonth?.income.toString() ?? "0"}",
                                )),
                          ],
                        ),
                      )
                    ],
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}