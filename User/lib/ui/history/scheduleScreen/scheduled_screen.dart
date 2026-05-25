import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:shimmer/shimmer.dart';
import 'package:user/ui/history/scheduleScreen/schedule_screen_vm.dart';
import '../../../components/drawer_scaffold.dart';
import '../../../utils/custom_colors.dart';
import '../../../utils/custom_images.dart';
import '../../../utils/custom_router.dart';
import '../../../utils/dimensions.dart';

class ScheduledScreen extends StatefulWidget {
  const ScheduledScreen({super.key});

  @override
  State<ScheduledScreen> createState() => _ScheduledScreenState();
}

class _ScheduledScreenState extends State<ScheduledScreen> {
  final GlobalKey<ScaffoldState> scaffoldKey = GlobalKey<ScaffoldState>();
  final vm = ScheduleScreenVm();
  final ScrollController scrollController = ScrollController();
  bool isLoading = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      vm.showScheduledHistory(1, "", "RIDE_LATER");
      scrollController.addListener(_loadMoreData);
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

        vm.showScheduledHistory(vm.currentPage, "", "RIDE_LATER").then((_) {
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
    vm.isDisposed = true;
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return DrawerScaffold(
      scaffoldKey: scaffoldKey,
      body: ChangeNotifierProvider<ScheduleScreenVm>(
        create: (context) => vm,
        child: Consumer<ScheduleScreenVm>(
          builder: (_, vm, child) {
            return Padding(
              padding: const EdgeInsets.only(
                  left: Dimensions.padding_20, right: Dimensions.padding_20),
              child: SingleChildScrollView(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SizedBox(height: Dimensions.padding_36),
                    vm.isShimmerLoading
                        ? ListView.builder(
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
                        : vm.tripData.isNotEmpty == true
                            ? Column(
                                children: [
                                  ListView.builder(
                                    shrinkWrap: true,
                                    padding: const EdgeInsets.all(0.0),
                                    controller: scrollController,
                                    // padding: const EdgeInsets.only(top: 1),

                                    itemCount: (vm.history.length) +
                                        (isLoading ? 1 : 0),
                                    itemBuilder: (BuildContext context, int index) {
                                      final timeFormat = vm.formatMonthDateYear(vm.history[index].trip[index].tripStartTime.toString(), 0);

                                      print("lfjrjefefe$timeFormat");
                                      if (index == vm.history.length) {
                                        return const Padding(
                                          padding: EdgeInsets.symmetric(vertical: 50.0),
                                          child: Center(
                                            child: SizedBox(width: 30, height: 30, child: CircularProgressIndicator()),
                                          ),
                                        );
                                      }
                                      return ListTile(
                                        contentPadding: EdgeInsets.zero,
                                        title: Padding(
                                          padding: const EdgeInsets.only(bottom: 20),
                                          child: Text(
                                            //"",
                                            vm.formatMonthDateYear(vm.history[index].trip[index].tripStartTime.toString(), 0),

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
                                              ...List.generate(vm.history[index].trip.length, (filteredIndex) {
                                                return InkWell(
                                                  onTap: () {
                                                    vm.tripData[index].isHistory = true;

                                                    // GoRouter.of(context).pushNamed(
                                                    //     CustomRouter
                                                    //         .scheduledDetailScreen,
                                                    //     extra: vm.history[index]
                                                    //             .trip[
                                                    //         filteredIndex]);
                                                    vm.moveToNamed(CustomRouter.scheduledDetailScreen, args: vm.history[index].trip[filteredIndex]);
                                                  },
                                                  child: Padding(
                                                    padding: const EdgeInsets.all(5.0),
                                                    child: Column(
                                                      children: [
                                                        Row(
                                                          crossAxisAlignment: CrossAxisAlignment.start,
                                                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                                          children: [
                                                            Image.network(
                                                              'https://cdn-icons-png.flaticon.com/512/9983/9983204.png',
                                                              fit: BoxFit.cover,
                                                              width: 30,
                                                              height: 30,
                                                              loadingBuilder: (BuildContext context, Widget child, ImageChunkEvent? loadingProgress) {
                                                                if (loadingProgress == null) {
                                                                  return child;
                                                                } else {
                                                                  return Center(
                                                                    child: CircularProgressIndicator(
                                                                      value: loadingProgress.expectedTotalBytes != null
                                                                          ? loadingProgress.cumulativeBytesLoaded / loadingProgress.expectedTotalBytes!
                                                                          : null,
                                                                    ),
                                                                  );
                                                                }
                                                              },
                                                            ),
                                                            const SizedBox(width: Dimensions.padding_10),
                                                            Expanded(
                                                              child: Column(
                                                                crossAxisAlignment: CrossAxisAlignment.start,
                                                                children: [
                                                                  Text(
                                                                    vm.history[index].trip[filteredIndex].completedAt != null
                                                                        ? "${vm.formatMonthDateYear(vm.history[index].trip[filteredIndex].completedAt ?? '', 1)} ${vm.formatTime(vm.history[index].trip[filteredIndex].completedAt ?? '')}"
                                                                        : vm.history[index].trip[filteredIndex].completedAt != null
                                                                            ? "${vm.formatMonthDateYear(vm.history[index].trip[filteredIndex].cancelledAt ?? '', 1)} ${vm.formatTime(vm.history[index].trip[filteredIndex].cancelledAt ?? '')}"
                                                                            : "${vm.formatMonthDateYear(vm.history[index].trip[filteredIndex].tripStartTime ?? '', 1)} ${vm.formatTime(vm.history[index].trip[filteredIndex].tripStartTime ?? '')}",
                                                                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                                                          color: Colors.black,
                                                                          fontSize: 14,
                                                                        ),
                                                                  ),
                                                                  Text(
                                                                    '${vm.history[index].trip[filteredIndex].vehicleDetails?.vehicleName}, ${vm.history[index].trip[filteredIndex].requestNumber}',
                                                                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                                                          color: Colors.black,
                                                                          fontSize: 12,
                                                                        ),
                                                                  ),
                                                                  const SizedBox(height: Dimensions.padding_5),
                                                                  vm.history[index].trip[filteredIndex].isLater == true
                                                                      ? Container(
                                                                          padding: const EdgeInsets.symmetric(vertical: 5),
                                                                          decoration: BoxDecoration(
                                                                            color: CustomColors.clr_C4CFFF,
                                                                            borderRadius: BorderRadius.circular(6),
                                                                          ),
                                                                          child: Padding(
                                                                            padding: const EdgeInsets.only(left: 10, right: 10),
                                                                            child: Text(
                                                                              'Not Assigned',
                                                                              textAlign: TextAlign.center,
                                                                              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                                                                    color: CustomColors.clr_FF0000,
                                                                                    fontSize: 12,
                                                                                  ),
                                                                            ),
                                                                          ),
                                                                        )
                                                                      : const SizedBox(),
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
                                                        filteredIndex == vm.history[index].trip.length - 1
                                                            ? const SizedBox()
                                                            : const Divider(
                                                                height: 5,
                                                                color: CustomColors.clr_AAAAAA,
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
                                  // Center(
                                  //     child: Text(vm.isLoading.value == false
                                  //         ? 'No data found'
                                  //         : '')),
                                ],
                              )
                            : Padding(
                                padding: const EdgeInsets.only(top: 180),
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
