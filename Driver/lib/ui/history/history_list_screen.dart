import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:taxiappzpro/ui/history/scheduleScreen/scheduled_screen.dart';
import '../../components/drawer_scaffold.dart';
import '../../components/header_view.dart';
import '../../di/di_config.dart';
import '../../utils/app_constants.dart';
import '../../utils/custom_colors.dart';
import '../../utils/dimensions.dart';
import 'cancelledScreen/cancelled_screen.dart';
import 'completed/invoice_screen.dart';
import 'completedScreen/completed_screen.dart';
import 'history_list_vm.dart';

class HistoryListScreen extends StatefulWidget {
  const HistoryListScreen({
    super.key,
  });

  @override
  State<HistoryListScreen> createState() => _HistoryListScreenState();
}

class _HistoryListScreenState extends State<HistoryListScreen> {
  final vm = HistoryListVm();

  final GlobalKey<ScaffoldState> scaffoldKey = GlobalKey<ScaffoldState>();
  ScrollController scrollController = ScrollController();

  List<Widget> pagelist = <Widget>[
    const ScheduledScreen(),
    const CompletedScreen(),
    const CancelledScreen()
  ];

  List<String> historyList = [
    "Aug 06, 2024 05:51 AM",
    "Aug 10, 2024 10:11 PM",
    "Aug 23, 2024 12:15 PM",
    "Aug 06, 2024 05:51 AM",
    "Sep 10, 2024 10:11 PM",
    "Sep 23, 2024 12:15 PM",
    "Sep 06, 2024 05:51 AM",
  ];

  bool isLoading = false;

  @override
  void initState() {
    // WidgetsBinding.instance.addPostFrameCallback((callback) {
    //   vm.showCompletedHistory(1, "", "RIDE_LATER");
    //   scrollController.addListener(_loadMoreData);
    // });
    super.initState();
  }

  @override
  void dispose() {
    // scrollController.dispose();
    super.dispose();
  }

  void _loadMoreData() {
    if (scrollController.position.pixels ==
        scrollController.position.maxScrollExtent) {
      if (vm.historyListModel!.page! < vm.historyListModel!.totalPages! &&
          vm.historyListModel?.totalResults != vm.tripData.length) {
        setState(() {
          isLoading = true;
          vm.currentPage++;
        });

        vm
            .showCompletedHistory(
            vm.currentPage, AppConstants.COMPELETED, "RIDE_NOW")
            .then((_) {
          setState(() {
            isLoading = false;
          });
        }).catchError((e) {
          setState(() {
            isLoading = false;
          });
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return WillPopScope(
      onWillPop: () async {
        // Handle back button press
        Navigator.of(context).pop();
        return false;
      },
      child: ChangeNotifierProvider<HistoryListVm>(
        create: (context) => vm,
        child: Consumer<HistoryListVm>(
          builder: (context, vm, child) {
            return SafeArea(
              child: DrawerScaffold(
                body: SingleChildScrollView(
                  child: Column(
                    children: [
                      Padding(
                        padding: const EdgeInsets.only(
                          left: Dimensions.padding_20,
                          right: Dimensions.padding_20,
                        ),
                        child: HeaderView(
                          title: vm.translation.txtMyRides,
                        ),
                      ),
                      const SizedBox(height: Dimensions.padding_10),
                      Padding(
                        padding: const EdgeInsets.only(
                          left: Dimensions.padding_20,
                          right: Dimensions.padding_20,
                        ),
                        child: Row(
                          children: [
                            Expanded(
                              child: InkWell(
                                onTap: () {
                                  vm.changePage(0);
                                },
                                child: Container(
                                  padding: const EdgeInsets.symmetric(vertical: 5),
                                  decoration: BoxDecoration(
                                    border: Border.all(color: vm.currentPage == 0
                                        ? CustomColors.primaryColor
                                        : Colors.transparent, width: 2),
                                    borderRadius: BorderRadius.circular(20),
                                  ),
                                  child: Text(
                                    vm.translation.txtScheduled,
                                    textAlign: TextAlign.center,
                                    style: Theme.of(context)
                                        .textTheme
                                        .bodySmall
                                        ?.copyWith(
                                      color: Colors.black,
                                      fontSize: 15,
                                    ),
                                  ),
                                ),
                              ),
                            ),
                            Expanded(
                              child: InkWell(
                                onTap: () {
                                  // GoRouter.of(context).pushNamed(CustomRouter.invoiceScreen);
                                  vm.changePage(1);
                                },
                                child: Container(
                                  padding: const EdgeInsets.symmetric(vertical: 5),
                                  decoration: BoxDecoration(
                                    border: Border.all(color: vm.currentPage == 1
                                        ? CustomColors.primaryColor
                                        : Colors.transparent, width: 2),
                                    borderRadius: BorderRadius.circular(20),
                                  ),
                                  child: Text(
                                    vm.translation.txtCompleted,
                                    textAlign: TextAlign.center,
                                    style: Theme.of(context)
                                        .textTheme
                                        .bodySmall
                                        ?.copyWith(
                                      color: Colors.black,
                                      fontSize: 15,
                                    ),
                                  ),
                                ),
                              ),
                            ),
                            Expanded(
                              child: InkWell(
                                onTap: () {
                                  // vm.currentPage= 2;
                                  vm.changePage(2);
                                },
                                child: Container(
                                  padding: const EdgeInsets.symmetric(vertical: 5),
                                  decoration: BoxDecoration(
                                    border: Border.all(color: vm.currentPage == 2
                                        ? CustomColors.primaryColor
                                        : Colors.transparent, width: 2),
                                    borderRadius: BorderRadius.circular(20),
                                  ),
                                  child: Text(
                                    vm.translation.txt_cancelled,
                                    textAlign: TextAlign.center,
                                    style: Theme.of(context)
                                        .textTheme
                                        .bodySmall
                                        ?.copyWith(
                                      color: Colors.black,
                                      fontSize: 15,
                                    ),
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(
                        height: 1,
                      ),
                      SizedBox(
                        height: MediaQuery.of(context).size.height - 200, // Adjust the height as needed
                        child: PageView(
                          scrollDirection: Axis.horizontal,
                          controller: vm.pageController,
                          onPageChanged: (num) {
                            setState(() {
                              vm.changePage(num);
                            });
                          },
                          children: pagelist,
                        ),
                      ),
                    ],
                  ),
                ), scaffoldKey: scaffoldKey,
              ),

            );
          },
        ),
      ),
    );
  }
}