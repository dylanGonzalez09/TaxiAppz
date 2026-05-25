import 'package:flutter/material.dart';
import 'package:taxiappzpro/components/dashboard_description.dart';
import 'package:taxiappzpro/ui/dash_board/dashboard_vm.dart';
import 'package:taxiappzpro/utils/custom_colors.dart';
import 'package:taxiappzpro/utils/custom_images.dart';
import 'package:taxiappzpro/utils/dimensions.dart';

class DashboardBalance extends StatefulWidget {
  final DashboardVm vm;

  const DashboardBalance({super.key, required this.vm});

  @override
  State<DashboardBalance> createState() => _DashboardBalanceState();
}

class _DashboardBalanceState extends State<DashboardBalance> {
  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Row(
          children: [
            Expanded(
                child: DashboardDescription(
              header: "Fines",
              descOne: "Recent fines",
              descTwo: "",
              valueOne: "${widget.vm.getCurrencySymbol()}" "0.00",
              valueTwo: "",
              picture: CustomImages.hammerIcon,
              descOneTextStyle: Theme.of(context)
                  .textTheme
                  .bodySmall
                  ?.copyWith(fontSize: 13, color: CustomColors.clr_AAAAAA),
            )),
            const SizedBox(width: Dimensions.padding_10),
            Expanded(
                child: DashboardDescription(
              header: "Fines",
              descOne: "Recent fines",
              descTwo: "",
              valueOne: "${widget.vm.getCurrencySymbol()}" "0.00",
              valueTwo: "",
              picture: CustomImages.dashboardWallet,
              descOneTextStyle: Theme.of(context)
                  .textTheme
                  .bodySmall
                  ?.copyWith(fontSize: 13, color: CustomColors.clr_AAAAAA),
            ))
          ],
        ),
      ],
    );
  }
}
