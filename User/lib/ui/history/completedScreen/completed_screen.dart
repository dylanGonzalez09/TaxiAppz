import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:shimmer/shimmer.dart';
import 'package:user/utils/utils.dart';
import '../../../components/drawer_scaffold.dart';
import '../../../utils/app_constants.dart';
import '../../../utils/custom_colors.dart';
import '../../../utils/custom_images.dart';
import '../../../utils/custom_router.dart';
import '../../../utils/dimensions.dart';
import 'completed_screen_vm.dart';

class CompletedScreen extends StatefulWidget {
  const CompletedScreen({super.key});

  @override
  State<CompletedScreen> createState() => _CompletedScreenState();
}

class _CompletedScreenState extends State<CompletedScreen> {
  final GlobalKey<ScaffoldState> scaffoldKey = GlobalKey<ScaffoldState>();
  final vm = CompletedScreenVm();
  final ScrollController scrollController = ScrollController();
  bool isLoading = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      vm.showCompletedHistory(1, AppConstants.COMPELETED, "RIDE_NOW");
      scrollController.addListener(_loadMoreData);
      vm.singleChildScrollController.addListener(singleChildScrollListener);
    });
  }

  void _loadMoreData() {
    if (scrollController.position.pixels >=
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

  void singleChildScrollListener() {
    if (vm.singleChildScrollController.position.pixels >=
        vm.singleChildScrollController.position.maxScrollExtent) {
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
  void dispose() {
    scrollController.dispose();
    vm.singleChildScrollController.dispose();
    vm.isDisposed = true;
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return DrawerScaffold(
      scaffoldKey: scaffoldKey,
      body: ChangeNotifierProvider<CompletedScreenVm>(
        create: (context) => vm,
        child: Consumer<CompletedScreenVm>(
          builder: (_, vm, child) {
            return Padding(
              padding: const EdgeInsets.only(
                  left: Dimensions.padding_20, right: Dimensions.padding_20),
              child: SingleChildScrollView(
                controller: vm.singleChildScrollController,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SizedBox(height: Dimensions.padding_10),
                    vm.isShimmerLoading
                        ? ListView.builder(
                            shrinkWrap: true,
                            controller: scrollController,
                            physics: const NeverScrollableScrollPhysics(),
                            itemCount: 8,
                            itemBuilder: (context, index) {
                              return Shimmer.fromColors(
                                baseColor: Colors.grey,
                                highlightColor: Colors.white,
                                child: Container(
                                  decoration: BoxDecoration(
                                    borderRadius: const BorderRadius.all(
                                        Radius.circular(10)),
                                    color: Colors.grey.withValues(alpha: 0.2),
                                  ),
                                  margin: const EdgeInsets.symmetric(
                                      vertical: Dimensions.padding_5),
                                  height: 65,
                                ),
                              );
                            },
                          )
                        : vm.tripData.isNotEmpty == true
                            ? Column(
                                children: [
                                  ListView.builder(
                                    shrinkWrap: true,
                                    controller: scrollController,
                                    itemCount: (vm.history.length) +
                                        (isLoading ? 1 : 0),
                                    itemBuilder:
                                        (BuildContext context, int index) {
                                      if (index == vm.history.length) {
                                        return const Padding(
                                          padding: EdgeInsets.symmetric(
                                              vertical: 50.0),
                                          child: Center(
                                            child: SizedBox(
                                                width: 30,
                                                height: 30,
                                                child:
                                                    CircularProgressIndicator()),
                                          ),
                                        );
                                      }

                                      return ListTile(
                                        contentPadding: EdgeInsets.zero,
                                        title: Padding(
                                          padding:
                                              const EdgeInsets.only(bottom: 10),
                                          child: Text(
                                            vm.formatMonthDateYear(
                                                vm.history[index].date
                                                    .toString(),
                                                0),
                                            style: Theme.of(context)
                                                .textTheme
                                                .bodySmall
                                                ?.copyWith(
                                                  color: Colors.black,
                                                  fontSize: 14,
                                                ),
                                          ),
                                        ),
                                        subtitle: Container(
                                          decoration: BoxDecoration(
                                            border: Border.all(
                                              color: CustomColors.clr_AAAAAA,
                                              width: 1,
                                            ),
                                            borderRadius:
                                                BorderRadius.circular(10.0),
                                          ),
                                          child: Column(
                                            children: [
                                              ...List.generate(
                                                  vm.history[index].trip.length,
                                                  (filteredIndex) {
                                                final bool isDispute = vm
                                                            .history[index]
                                                            .trip[filteredIndex]
                                                            .isCompleted ==
                                                        true &&
                                                    vm
                                                            .history[index]
                                                            .trip[filteredIndex]
                                                            .completedAt
                                                            ?.isNotEmpty ==
                                                        true &&
                                                    Utils.isTripWithinTwentyFourHours(vm
                                                            .history[index]
                                                            .trip[filteredIndex]
                                                            .completedAt ??
                                                        "");
                                                return InkWell(
                                                  onTap: () {
                                                    vm.tripData[index]
                                                        .isHistory = true;
                                                    GoRouter.of(context).pushNamed(
                                                        CustomRouter
                                                            .invoiceScreen,
                                                        extra: vm.history[index]
                                                                .trip[
                                                            filteredIndex]);
                                                  },
                                                  child: Padding(
                                                    padding:
                                                        const EdgeInsets.all(
                                                            10),
                                                    child: Column(
                                                      children: [
                                                        Row(
                                                          children: [
                                                            Padding(
                                                              padding:
                                                                  const EdgeInsets
                                                                      .only(
                                                                      bottom:
                                                                          40),
                                                              child:
                                                                  Image.network(
                                                                'https://cdn-icons-png.flaticon.com/512/9983/9983204.png',
                                                                fit: BoxFit
                                                                    .cover,
                                                                width: 30,
                                                                height: 30,
                                                                loadingBuilder: (BuildContext
                                                                        context,
                                                                    Widget
                                                                        child,
                                                                    ImageChunkEvent?
                                                                        loadingProgress) {
                                                                  if (loadingProgress ==
                                                                      null) {
                                                                    return child;
                                                                  } else {
                                                                    return Center(
                                                                      child:
                                                                          CircularProgressIndicator(
                                                                        value: loadingProgress.expectedTotalBytes !=
                                                                                null
                                                                            ? loadingProgress.cumulativeBytesLoaded /
                                                                                loadingProgress.expectedTotalBytes!
                                                                            : null,
                                                                      ),
                                                                    );
                                                                  }
                                                                },
                                                              ),
                                                            ),
                                                            const SizedBox(
                                                                width: Dimensions
                                                                    .padding_10),
                                                            Expanded(
                                                              child: Column(
                                                                crossAxisAlignment:
                                                                    CrossAxisAlignment
                                                                        .start,
                                                                children: [
                                                                  Text(
                                                                    vm.history[index].trip[filteredIndex].completedAt !=
                                                                            null
                                                                        ? "${vm.formatMonthDateYear(vm.history[index].trip[filteredIndex].completedAt ?? '', 1)} ${vm.formatTime(vm.history[index].trip[filteredIndex].completedAt ?? '')}"
                                                                        : vm.history[index].trip[filteredIndex].completedAt !=
                                                                                null
                                                                            ? "${vm.formatMonthDateYear(vm.history[index].trip[filteredIndex].cancelledAt ?? '', 1)} ${vm.formatTime(vm.history[index].trip[filteredIndex].cancelledAt ?? '')}"
                                                                            : vm.history[index].trip[filteredIndex].tripStartTime?.isNotEmpty == true
                                                                                ? "${vm.formatMonthDateYear(vm.history[index].trip[filteredIndex].tripStartTime ?? '', 1)} ${vm.formatTime(vm.history[index].trip[filteredIndex].tripStartTime ?? '')}"
                                                                                : "Undefined",
                                                                    style: Theme.of(
                                                                            context)
                                                                        .textTheme
                                                                        .bodySmall
                                                                        ?.copyWith(
                                                                          color:
                                                                              Colors.black,
                                                                          fontSize:
                                                                              14,
                                                                        ),
                                                                  ),
                                                                  Text(
                                                                    '${vm.history[index].trip[filteredIndex].vehicleDetails?.vehicleName ?? ""}, ${vm.history[index].trip[filteredIndex].requestNumber}',
                                                                    style: Theme.of(
                                                                            context)
                                                                        .textTheme
                                                                        .bodySmall
                                                                        ?.copyWith(
                                                                          color:
                                                                              Colors.black,
                                                                          fontSize:
                                                                              12,
                                                                        ),
                                                                  ),
                                                                  const SizedBox(
                                                                      height: Dimensions
                                                                          .padding_5),
                                                                  vm.tripData[index]
                                                                              .isCompleted ==
                                                                          true
                                                                      ? GestureDetector(
                                                                          onTap:
                                                                              () {
                                                                            if (isDispute) {
                                                                              vm.moveToNamed(CustomRouter.complaintScreen, args: {
                                                                                AppConstants.type: AppConstants.dispute,
                                                                                AppConstants.requestId: vm.tripData[index].sId,
                                                                                AppConstants.zoneId: vm.tripData[index].userDetails?.zoneId,
                                                                              });
                                                                            }
                                                                          },
                                                                          child:
                                                                              Container(
                                                                            padding:
                                                                                const EdgeInsets.symmetric(vertical: 5),
                                                                            decoration:
                                                                                BoxDecoration(
                                                                              color: isDispute ? CustomColors.clr_FFDCDC : CustomColors.clr_C4CFFF,
                                                                              borderRadius: BorderRadius.circular(6),
                                                                            ),
                                                                            child:
                                                                                Padding(
                                                                              padding: const EdgeInsets.only(left: 10, right: 10),
                                                                              child: Text(
                                                                                isDispute ? vm.translation.txtAnyDispute : vm.translation.txt_completed_small,
                                                                                textAlign: TextAlign.center,
                                                                                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                                                                      color: isDispute ? CustomColors.clr_B70000 : CustomColors.clr_35CF08,
                                                                                      fontSize: 12,
                                                                                    ),
                                                                              ),
                                                                            ),
                                                                          ),
                                                                        )
                                                                      : const SizedBox(),
                                                                ],
                                                              ),
                                                            ),
                                                            const Icon(
                                                              Icons
                                                                  .arrow_forward_ios_rounded,
                                                              color: CustomColors
                                                                  .clr_AAAAAA,
                                                              size: 20,
                                                            ),
                                                          ],
                                                        ),
                                                        filteredIndex ==
                                                                vm
                                                                        .history[
                                                                            index]
                                                                        .trip
                                                                        .length -
                                                                    1
                                                            ? const SizedBox()
                                                            : const Divider(
                                                                height: 5,
                                                                color: CustomColors
                                                                    .clr_AAAAAA,
                                                              ),
                                                      ],
                                                    ),
                                                  ),
                                                );
                                              }),
                                            ],
                                          ),
                                        ),
                                      );
                                    },
                                  ),
                                ],
                              )
                            : Padding(
                                padding: const EdgeInsets.only(top: 200),
                                child: SizedBox(
                                  height:
                                      MediaQuery.of(context).size.height / 2,
                                  child: Center(
                                      child: Column(
                                    children: [
                                      SvgPicture.asset(
                                        CustomImages.notificationNotFound,
                                      ),
                                      Text(vm.isLoading.value == false
                                          ? vm.translation.txt_no_data_found
                                          : ''),
                                    ],
                                  )),
                                ),
                              ),
                  ],
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}
