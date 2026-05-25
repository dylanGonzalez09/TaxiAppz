import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:user/ui/history/scheduleScreen/scheduled_screen.dart';
import '../../components/drawer_scaffold.dart';
import '../../components/header_view.dart';
import '../../utils/app_constants.dart';
import '../../utils/custom_colors.dart';
import '../../utils/dimensions.dart';
import 'cancelledScreen/cancelled_screen.dart';
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

  List<Widget> pageList = <Widget>[
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
    return ChangeNotifierProvider<HistoryListVm>(
      create: (context) => vm,
      child: Consumer<HistoryListVm>(
        builder: (context, vm, child) {
          return DrawerScaffold(
            body: Column(
              children: [
                Padding(
                  padding: const EdgeInsets.only(
                    left: Dimensions.padding_20,
                    right: Dimensions.padding_20,
                  ),
                  child: HeaderView(
                    title: vm.translation.txt_myRides,
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
                              color: vm.currentPage == 0
                                  ? CustomColors.selectedColor
                                  : Colors.transparent,
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Text(
                              vm.translation.txt_scheduled_small,
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
                              color: vm.currentPage == 1
                                  ? CustomColors.selectedColor
                                  : Colors.transparent,
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Text(
                              vm.translation.txt_completed_small,
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
                              color: vm.currentPage == 2
                                  ? CustomColors.selectedColor
                                  : Colors.transparent,
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Text(
                              vm.translation.txt_cancelled_small,
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
                Expanded(
                  child: PageView(
                    scrollDirection: Axis.horizontal,
                    controller: vm.pageController,
                    onPageChanged: (num) {
                      setState(() {
                        print("mdnfkdgnsdfg ${num}");
                        vm.changePage(num);
                      });
                    },
                    children: pageList,
                  ),
                ),
              ],
            ),
            scaffoldKey: scaffoldKey,

            // ChangeNotifierProvider<HistoryListVm>.value(
            //   value: vm,
            //   child: Consumer<HistoryListVm>(
            //     builder: (context, vm, child) {
            //       return Padding(
            //         padding: const EdgeInsets.only(
            //           left: Dimensions.padding_20,
            //           right: Dimensions.padding_20,
            //         ),
            //         child: Column(
            //           crossAxisAlignment: CrossAxisAlignment.start,
            //           children: [
            //             const HeaderView(
            //               title: "My Rides",
            //             ),
            //             SizedBox(
            //               height: 10,
            //             ),
            //             Container(
            //               child: Row(
            //                 children: [
            //                   Expanded(
            //                     child: InkWell(
            //                       onTap: () {
            //                         vm.currentScreen = 1;
            //
            //                         vm.showCompletedHistory(1, "", "RIDE_LATER");
            //                       },
            //                       child: Container(
            //                         padding: EdgeInsets.symmetric(vertical: 5),
            //                         decoration: BoxDecoration(
            //                           color: vm.currentScreen == 1
            //                               ? CustomColors.selectedColor
            //                               : Colors.transparent,
            //                           borderRadius: BorderRadius.circular(20),
            //                         ),
            //                         child: Text(
            //                           'Scheduled',
            //                           textAlign: TextAlign.center,
            //                           style: Theme
            //                               .of(context)
            //                               .textTheme
            //                               .bodySmall
            //                               ?.copyWith(
            //                             color: Colors.black,
            //                             fontSize: 15,
            //                           ),
            //                         ),
            //                       ),
            //                     ),
            //                   ),
            //                   Expanded(
            //                     child: InkWell(
            //                       onTap: () {
            //                         // GoRouter.of(context).pushNamed(CustomRouter.invoiceScreen);
            //                         vm.currentScreen = 2;
            //                         vm.tripData.clear();
            //                         vm.showCompletedHistory(
            //                             1, AppConstants.COMPELETED, "RIDE_NOW");
            //                       },
            //                       child: Container(
            //                         padding: EdgeInsets.symmetric(vertical: 5),
            //                         decoration: BoxDecoration(
            //                           color: vm.currentScreen == 2
            //                               ? CustomColors.selectedColor
            //                               : Colors.transparent,
            //                           borderRadius: BorderRadius.circular(20),
            //                         ),
            //                         child: Text(
            //                           'Completed',
            //                           textAlign: TextAlign.center,
            //                           style: Theme
            //                               .of(context)
            //                               .textTheme
            //                               .bodySmall
            //                               ?.copyWith(
            //                             color: Colors.black,
            //                             fontSize: 15,
            //                           ),
            //                         ),
            //                       ),
            //                     ),
            //                   ),
            //                   Expanded(
            //                     child: InkWell(
            //                       onTap: () {
            //                         // GoRouter.of(context)
            //                         //     .pushNamed(CustomRouter.cancelledDetailScreen);
            //                         vm.currentScreen = 3;
            //                         vm.tripData.clear();
            //                         vm.showCompletedHistory(
            //                             1, AppConstants.CANCELLED, "RIDE_NOW");
            //                       },
            //                       child: Container(
            //                         padding: EdgeInsets.symmetric(vertical: 5),
            //                         decoration: BoxDecoration(
            //                           color: vm.currentScreen == 3
            //                               ? CustomColors.selectedColor
            //                               : Colors.transparent,
            //                           borderRadius: BorderRadius.circular(20),
            //                         ),
            //                         child: Text(
            //                           'Cancelled',
            //                           textAlign: TextAlign.center,
            //                           style: Theme
            //                               .of(context)
            //                               .textTheme
            //                               .bodySmall
            //                               ?.copyWith(
            //                             color: Colors.black,
            //                             fontSize: 15,
            //                           ),
            //                         ),
            //                       ),
            //                     ),
            //                   ),
            //                 ],
            //               ),
            //             ),
            //             const SizedBox(height: Dimensions.padding_10),
            //             Text(
            //               'September 2024',
            //               style: Theme
            //                   .of(context)
            //                   .textTheme
            //                   .bodySmall
            //                   ?.copyWith(
            //                 color: Colors.black,
            //                 fontSize: 12,
            //               ),
            //             ),
            //             const SizedBox(height: Dimensions.padding_10),
            //             Expanded(
            //               child: Container(
            //                 decoration: BoxDecoration(
            //                   border: Border.all(
            //                     color: CustomColors.clr_AAAAAA,
            //                     width: 1,
            //                   ),
            //                   borderRadius: BorderRadius.circular(10.0),
            //                 ),
            //                 child: Padding(
            //                   padding: const EdgeInsets.all(10),
            //                   child: vm.tripData.isNotEmpty == true
            //                       ? ListView.builder(
            //                     shrinkWrap: true,
            //                     controller: scrollController,
            //                     // physics: NeverScrollableScrollPhysics(),
            //                     itemCount: (vm.tripData?.length)! +
            //                         (isLoading ? 1 : 0),
            //                     itemBuilder: (context, index) {
            //                       print("dfgjhdjghsdfjkghsdfkj  $int");
            //
            //                       return InkWell(
            //                         onTap: () {
            //                           // var map={
            //                           //   'tripData':vm.tripData[index]
            //                           // };
            //
            //                           vm.tripData[index].isHistory = true;
            //
            //                           GoRouter.of(context).pushNamed(
            //                               CustomRouter.invoiceScreen,
            //                               extra: vm.tripData[index]);
            //                         },
            //                         child: Column(
            //                           children: [
            //
            //                             Container(
            //                               height: 100,
            //                               child: Row(
            //                                 mainAxisAlignment: MainAxisAlignment
            //                                     .spaceBetween,
            //                                 children: [
            //                                   Image.network(
            //                                     'https://cdn-icons-png.flaticon.com/512/9983/9983204.png',
            //                                     fit: BoxFit.cover,
            //                                     width: 30,
            //                                     height: 30,
            //                                     loadingBuilder: (BuildContext
            //                                     context,
            //                                         Widget child,
            //                                         ImageChunkEvent?
            //                                         loadingProgress) {
            //                                       if (loadingProgress ==
            //                                           null) {
            //                                         return child;
            //                                       } else {
            //                                         return Center(
            //                                           child:
            //                                           CircularProgressIndicator(
            //                                             value: loadingProgress
            //                                                 .expectedTotalBytes !=
            //                                                 null
            //                                                 ? loadingProgress
            //                                                 .cumulativeBytesLoaded /
            //                                                 loadingProgress
            //                                                     .expectedTotalBytes!
            //                                                 : null,
            //                                           ),
            //                                         );
            //                                       }
            //                                     },
            //                                   ),
            //                                   const SizedBox(
            //                                       width: Dimensions
            //                                           .padding_10),
            //                                   Expanded(
            //                                     child: Column(
            //                                       crossAxisAlignment:
            //                                       CrossAxisAlignment
            //                                           .start,
            //                                       children: [
            //                                         Text(
            //                                           vm.tripData ?[index]
            //                                               .completedAt != null
            //                                               ? "${vm
            //                                               .formatMonthDateYear(vm
            //                                               .tripData[index]
            //                                               .completedAt ?? '')} ${vm
            //                                               .formatTime(vm
            //                                               .tripData[index]
            //                                               .completedAt ?? '')}"
            //                                               : vm.tripData[index]
            //                                               .completedAt !=
            //                                               null
            //                                               ? "${vm
            //                                               .formatMonthDateYear(vm
            //                                               .tripData[index]
            //                                               .cancelledAt ?? '')} ${vm
            //                                               .formatTime(vm
            //                                               .tripData[index]
            //                                               .cancelledAt ?? '')}"
            //                                               : "Undefined",
            //                                           style:
            //                                           Theme
            //                                               .of(context)
            //                                               .textTheme
            //                                               .bodySmall
            //                                               ?.copyWith(
            //                                             color: Colors
            //                                                 .black,
            //                                             fontSize:
            //                                             14,
            //                                           ),
            //                                         ),
            //                                         Text(
            //                                           '${vm.tripData[index]
            //                                               .vehicleDetails
            //                                               ?.vehicleName}, ${vm
            //                                               .tripData[index]
            //                                               .requestNumber}',
            //                                           style:
            //                                           Theme
            //                                               .of(context)
            //                                               .textTheme
            //                                               .bodySmall
            //                                               ?.copyWith(
            //                                             color: Colors
            //                                                 .black,
            //                                             fontSize:
            //                                             12,
            //                                           ),
            //                                         ),
            //                                         const SizedBox(
            //                                             height: Dimensions
            //                                                 .padding_5),
            //                                         vm.tripData?[index]
            //                                             .isLater ==
            //                                             true
            //                                             ? Container(
            //                                           padding: EdgeInsets
            //                                               .symmetric(
            //                                               vertical:
            //                                               5),
            //                                           decoration:
            //                                           BoxDecoration(
            //                                             color: CustomColors
            //                                                 .clr_C4CFFF,
            //                                             borderRadius:
            //                                             BorderRadius
            //                                                 .circular(
            //                                                 6),
            //                                           ),
            //                                           child: Padding(
            //                                             padding:
            //                                             const EdgeInsets
            //                                                 .only(
            //                                                 left:
            //                                                 10,
            //                                                 right:
            //                                                 10),
            //                                             child: Text(
            //                                               'Scheduled',
            //                                               textAlign:
            //                                               TextAlign
            //                                                   .center,
            //                                               style: Theme
            //                                                   .of(
            //                                                   context)
            //                                                   .textTheme
            //                                                   .bodySmall
            //                                                   ?.copyWith(
            //                                                 color:
            //                                                 CustomColors.clr_268800,
            //                                                 fontSize:
            //                                                 12,
            //                                               ),
            //                                             ),
            //                                           ),
            //                                         )
            //                                             : SizedBox(),
            //                                       ],
            //                                     ),
            //                                   ),
            //                                   const Icon(
            //                                     Icons
            //                                         .arrow_forward_ios_rounded,
            //                                     color:
            //                                     CustomColors.clr_AAAAAA,
            //                                     size: 20,
            //                                   ),
            //                                 ],
            //                               ),),
            //                             index == vm.tripData!.length - 1
            //                                 ? SizedBox()
            //                                 : const Divider(
            //                               color: CustomColors.clr_AAAAAA,),
            //                           ],
            //                         ),
            //                       );
            //                     },
            //                   )
            //                       : Padding(
            //                     padding: const EdgeInsets.only(top: 80),
            //                     child: SizedBox(
            //                       height: MediaQuery
            //                           .of(context)
            //                           .size
            //                           .height / 2,
            //                       child: Center(child: Text(
            //                           vm.isLoading.value == false
            //                               ? 'No data found'
            //                               : '')),
            //                     ),
            //                   ),
            //                 ),
            //               ),
            //             ),
            //           ],
            //         ),
            //       );
            //     },
            //   ),
            // ),
            //
          );
        },
      ),
    );
  }
}
