import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:provider/provider.dart';
import 'package:shimmer/shimmer.dart';
import 'package:taxiappzpro/utils/custom_router_config.dart';
import '../../../components/drawer_scaffold.dart';
import '../../../utils/app_constants.dart';
import '../../../utils/custom_colors.dart';
import '../../../utils/custom_images.dart';
import '../../../utils/dimensions.dart';
import '../../../utils/utils.dart';
import 'cancelled_screen_vm.dart';

class CancelledScreen extends StatefulWidget {
  const CancelledScreen({super.key});

  @override
  State<CancelledScreen> createState() => _CancelledScreenState();
}

class _CancelledScreenState extends State<CancelledScreen> {
  final GlobalKey<ScaffoldState> scaffoldKey = GlobalKey<ScaffoldState>();
  final vm = CancelledScreenVm();
  final ScrollController scrollController = ScrollController();
  bool isLoading = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      vm.showCancelledHistory(1, AppConstants.CANCELLED, "RIDE_NOW");
      scrollController.addListener(_loadMoreData);
      vm.singleChildScrollController.addListener(singleChildScrollListener);
    });
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
            .showCancelledHistory(
            vm.currentPage, AppConstants.CANCELLED, "RIDE_NOW")
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
    if (vm.singleChildScrollController.position.pixels ==
        vm.singleChildScrollController.position.maxScrollExtent) {
      if (vm.historyListModel!.page! < vm.historyListModel!.totalPages! &&
          vm.historyListModel?.totalResults != vm.tripData.length) {
        setState(() {
          isLoading = true;
          vm.currentPage++;
        });
        vm
            .showCancelledHistory(
            vm.currentPage, AppConstants.CANCELLED, "RIDE_NOW")
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

  String _resolveDisplayDate(trip, CancelledScreenVm vm) {
    if (trip.completedAt != null) {
      return "${vm.formatMonthDateYear(trip.completedAt ?? '', 1)} ${vm.formatTime(trip.completedAt ?? '')}";
    } else if (trip.cancelledAt != null) {
      return "${vm.formatMonthDateYear(trip.cancelledAt ?? '', 1)} ${vm.formatTime(trip.cancelledAt ?? '')}";
    } else if (trip.tripStartTime != null) {
      return "${vm.formatMonthDateYear(trip.tripStartTime ?? '', 1)} ${vm.formatTime(trip.tripStartTime ?? '')}";
    }
    return "Undefined";
  }

  @override
  Widget build(BuildContext context) {
    return DrawerScaffold(
      scaffoldKey: scaffoldKey,
      body: ChangeNotifierProvider<CancelledScreenVm>(
        create: (context) => vm,
        child: Consumer<CancelledScreenVm>(builder: (_, vm, child) {
          return Padding(
            padding: const EdgeInsets.only(
                left: Dimensions.padding_20, right: Dimensions.padding_20),
            child: vm.isShimmerLoading
                ? SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: Dimensions.padding_36),
                  ListView.builder(
                    shrinkWrap: true,
                    controller: scrollController,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: 8,
                    // Number of shimmer items to display
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
                ],
              ),
            )
                : vm.tripData.isNotEmpty == true
                ? ListView.builder(
              shrinkWrap: true,
              padding: const EdgeInsets.all(0.0),
              controller: scrollController,
              // padding: const EdgeInsets.only(top: 1),

              itemCount: (vm.history.length) + (isLoading ? 1 : 0),
              itemBuilder: (BuildContext context, int index) {
                if (index == vm.history.length) {
                  return const Padding(
                    padding: EdgeInsets.symmetric(vertical: 50.0),
                    child: Center(
                      child: SizedBox(
                          width: 30,
                          height: 30,
                          child: CircularProgressIndicator()),
                    ),
                  );
                }
                return ListTile(
                  contentPadding: EdgeInsets.zero,
                  title: Padding(
                    padding: const EdgeInsets.only(bottom: 10),
                    child: Text(
                      vm.formatMonthDateYear(vm.history[index].date.toString(), 0),
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
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
                      borderRadius: BorderRadius.circular(10.0),
                    ),
                    child: Column(
                      children: [
                        ...List.generate(
                          vm.history[index].trip.length,
                              (filteredIndex) {
                            final trip = vm.history[index].trip[filteredIndex];

                            final bool isDispute = trip.isCancelled == true && trip.tripStartTime?.isNotEmpty == true && Utils.isTripWithinTwentyFourHours(trip.tripStartTime ?? "");

                            final String imageUrl = "${AppConstants.imageBaseUrl}${trip.vehicleDetails?.highlightImage ?? trip.vehicleDetails?.image ?? ''}";

                            final String displayDate = _resolveDisplayDate(trip, vm);

                            return InkWell(
                              onTap: () {
                                vm.moveToNamed(
                                  CustomRouterConfig.cancelledDetailScreen,
                                  args: {
                                    AppConstants.trip: trip.toJson(),
                                    AppConstants.translation: vm.translation.toJson(),
                                  },
                                );
                              },
                              child: Padding(
                                padding: const EdgeInsets.all(10),
                                child: Column(
                                  children: [
                                    Row(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        CachedNetworkImage(
                                          imageUrl: imageUrl,
                                          width: 40,
                                          height: 40,
                                          fit: BoxFit.cover,
                                          // shimmer placeholder
                                          placeholder: (context, url) => Shimmer.fromColors(
                                            baseColor: Colors.grey.shade300,
                                            highlightColor: Colors.grey.shade100,
                                            child: Container(
                                              width: 40,
                                              height: 40,
                                              decoration: BoxDecoration(
                                                color: Colors.white,
                                                borderRadius: BorderRadius.circular(6),
                                              ),
                                            ),
                                          ),
                                          // fallback asset on error
                                          errorWidget: (context, url, error) => Image.asset(
                                            CustomImages.notificationImage,
                                            width: 40,
                                            height: 40,
                                            fit: BoxFit.cover,
                                          ),
                                        ),
                                        const SizedBox(width: Dimensions.padding_10),
                                        Expanded(
                                          child: Column(
                                            crossAxisAlignment: CrossAxisAlignment.start,
                                            children: [
                                              Text(
                                                displayDate,
                                                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                                  color: Colors.black,
                                                  fontSize: 14,
                                                ),
                                                maxLines: 1,
                                                overflow: TextOverflow.ellipsis,
                                              ),
                                              Text(
                                                '${trip.vehicleDetails?.vehicleName ?? ""}, ${trip.requestNumber ?? ""}',
                                                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                                  color: Colors.black,
                                                  fontSize: 12,
                                                ),
                                                maxLines: 1,
                                                overflow: TextOverflow.ellipsis,
                                              ),
                                              const SizedBox(height: Dimensions.padding_5),
                                              if (trip.isCancelled == true)
                                                GestureDetector(
                                                  onTap: () {
                                                    if (isDispute) {
                                                      vm.moveToNamed(CustomRouterConfig.complaintScreen,
                                                          args: {AppConstants.type: AppConstants.dispute, AppConstants.requestId: vm.tripData[index].sId, 'trip': vm.tripData[index]});
                                                    }
                                                  },
                                                  child: Container(
                                                    padding: const EdgeInsets.symmetric(vertical: 5, horizontal: 10),
                                                    decoration: BoxDecoration(
                                                      color: isDispute ? CustomColors.clr_FFDCDC : CustomColors.clr_FF8F8F,
                                                      borderRadius: BorderRadius.circular(6),
                                                    ),
                                                    child: Text(
                                                      isDispute ? vm.translation.txtAnyDispute : vm.translation.txt_cancelled,
                                                      textAlign: TextAlign.center,
                                                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                                        color: isDispute ? CustomColors.clr_B70000 : Colors.white,
                                                        fontSize: 12,
                                                      ),
                                                    ),
                                                  ),
                                                ),
                                            ],
                                          ),
                                        ),
                                        const Icon(
                                          Icons.arrow_forward_ios_rounded,
                                          color: CustomColors.clr_AAAAAA,
                                          size: 20,
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 5),
                                    if (filteredIndex != vm.history[index].trip.length - 1)
                                      const Divider(
                                        height: 5,
                                        color: CustomColors.clr_AAAAAA,
                                      ),
                                  ],
                                ),
                              ),
                            );
                          },
                        ),
                      ],
                    ),
                  ),
                );
              },
            )
                : Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                SvgPicture.asset(
                  CustomImages.notificationNotFound,
                ),
                Center(
                  child: Text(vm.isLoading.value == false
                      ? vm.translation.txt_no_data_found
                      : ''),
                ),
              ],
            ),
          );
        }),
      ),
    );
  }
}
