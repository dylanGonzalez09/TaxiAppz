import 'package:flutter/material.dart';
import 'package:taxiappzpro/components/custom_tab_bar.dart';
import 'package:taxiappzpro/components/drawer_scaffold.dart';
import 'package:taxiappzpro/components/header_view.dart';
import 'package:taxiappzpro/di/di_config.dart';
import 'package:taxiappzpro/ui/dash_board/dashboard_balance.dart';
import 'package:taxiappzpro/ui/dash_board/dashboard_history.dart';
import 'package:taxiappzpro/ui/dash_board/dashboard_vm.dart';
import 'package:taxiappzpro/ui/dash_board/earnings_screen.dart';
import 'package:taxiappzpro/utils/dimensions.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  final GlobalKey<ScaffoldState> scaffoldKey = GlobalKey<ScaffoldState>();
  final vm = getIt<DashboardVm>();
  var pages = [];
  @override
  void initState() {
    pages = [
      EarningsScreen(vm: vm, translation: vm.translation,),
      DashboardHistory(vm: vm, translation: vm.translation),
      DashboardBalance(vm: vm)
    ];
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return DrawerScaffold(
        body: Padding(
          padding: const EdgeInsets.symmetric(horizontal: Dimensions.padding_10),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Padding(
                  padding:
                      EdgeInsets.symmetric(horizontal: Dimensions.padding_10),
                  child: HeaderView(title: "Dashboard")),
              const SizedBox(height: Dimensions.padding_20),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: Dimensions.padding_10),
                child: CustomTabBar(
                    titleOne: "Earnings",
                    titleTwo: "History",
                    titleThree: "Balance",
                    onTapped: (page) {setState(() {
                      vm.selectedPageIndex = page;
                    });}),
              ),
              const SizedBox(height: Dimensions.padding_20),
              Expanded(child: pages[vm.selectedPageIndex])
            ],
          ),
        ),
        scaffoldKey: scaffoldKey);
  }
}
