import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:provider/provider.dart';

import '../../components/drawer_scaffold.dart';
import '../../components/header_view.dart';
import '../../utils/custom_colors.dart';
import '../../utils/custom_images.dart';
import '../../utils/dimensions.dart';
import 'notification_vm.dart';

class NotificationScreen extends StatefulWidget {
  const NotificationScreen({super.key});

  @override
  State<NotificationScreen> createState() => _NotificationScreenState();
}

class _NotificationScreenState extends State<NotificationScreen> {
  final GlobalKey<ScaffoldState> scaffoldKey = GlobalKey<ScaffoldState>();
  final vm = NotificationVm();
  final ScrollController scrollController = ScrollController();

  bool isLoading = false; // To track loading state of last item

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      vm.getNotificationList(1);
      scrollController.addListener(_loadMoreData);
    });
  }

  void _loadMoreData() {
    if (scrollController.position.pixels ==
        scrollController.position.maxScrollExtent) {
      if (vm.notificationModel!.page! < vm.notificationModel!.totalPages! &&
          vm.notificationModel?.totalResults != vm.notificationList?.length) {
        setState(() {
          isLoading = true;
          vm.currentPage++;
        });

        vm.getNotificationList(vm.currentPage).then((_) {
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
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return DrawerScaffold(
      scaffoldKey: scaffoldKey,
      body: ChangeNotifierProvider<NotificationVm>(
        create: (context) => vm,
        child: Consumer<NotificationVm>(
          builder: (_, vm, child) {
            return Padding(
              padding: const EdgeInsets.only(
                  left: Dimensions.padding_20, right: Dimensions.padding_20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  HeaderView(
                    title: vm.translation.txt_notification,
                  ),
                  const SizedBox(height: Dimensions.padding_20),
                  vm.notificationList != null && vm.notificationList!.isNotEmpty
                      ? Expanded(
                          child: ListView.builder(
                            controller: scrollController,
                            itemCount: vm.notificationList!.length +
                                (isLoading ? 1 : 0), // Add 1 if loading
                            itemBuilder: (BuildContext context, int index) {
                              if (index == vm.notificationList!.length) {
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
                              return InkWell(
                                onTap: () {
                                  vm.updateNotificationRead(
                                      vm.notificationList![index], false);
                                },
                                child: Column(
                                  children: [
                                    Padding(
                                      padding: const EdgeInsets.only(
                                        bottom: 15,
                                      ),
                                      child: Container(
                                        decoration: BoxDecoration(
                                          color: Colors.white,
                                          borderRadius:
                                              BorderRadius.circular(10),
                                          boxShadow: [
                                            BoxShadow(
                                              color: Colors.grey
                                                  .withValues(alpha: 0.2),
                                              spreadRadius: 0.5,
                                              blurRadius: 1,
                                              offset: const Offset(0, 2),
                                            ),
                                          ],
                                        ),
                                        child: Padding(
                                          padding: const EdgeInsets.only(
                                              top: 4, right: 5),
                                          child: Column(
                                            crossAxisAlignment:
                                                CrossAxisAlignment.start,
                                            children: [
                                              Row(
                                                mainAxisAlignment:
                                                    MainAxisAlignment.end,
                                                children: [
                                                  Padding(
                                                    padding:
                                                        const EdgeInsets.only(
                                                            right: 5, top: 2),
                                                    child: Column(
                                                      children: [
                                                        Text(
                                                          vm.convertCustomStringToDate(
                                                              "${vm.notificationList![index].createdBy}"),
                                                          style:
                                                              Theme.of(context)
                                                                  .textTheme
                                                                  .bodySmall
                                                                  ?.copyWith(
                                                                    color: CustomColors
                                                                        .clr_AAAAAA,
                                                                    fontSize:
                                                                        10,
                                                                  ),
                                                        ),
                                                      ],
                                                    ),
                                                  ),
                                                ],
                                              ),
                                              Padding(
                                                padding: const EdgeInsets.only(
                                                    left: 10, bottom: 15),
                                                child: Row(
                                                  children: [
                                                    CachedNetworkImage(
                                                      imageUrl: vm
                                                              .notificationList?[
                                                                  index]
                                                              .image ??
                                                          '',
                                                      imageBuilder: (context,
                                                              imageProvider) =>
                                                          Container(
                                                        width: 50,
                                                        height: 50,
                                                        decoration:
                                                            BoxDecoration(
                                                          image:
                                                              DecorationImage(
                                                            image:
                                                                imageProvider,
                                                            fit: BoxFit.cover,
                                                          ),
                                                        ),
                                                      ),
                                                      placeholder:
                                                          (context, url) =>
                                                              const SizedBox(
                                                        width: 50,
                                                        height: 50,
                                                        child:
                                                            CircularProgressIndicator(
                                                                strokeWidth: 2),
                                                      ),
                                                      errorWidget: (context,
                                                              url, error) =>
                                                          SvgPicture.asset(
                                                        CustomImages.taxiLogo,
                                                        // replace with your asset image path
                                                        width: 50,
                                                        height: 50,
                                                        fit: BoxFit.cover,
                                                      ),
                                                    ),
                                                    const SizedBox(width: 5),
                                                    Expanded(
                                                      child: Column(
                                                        crossAxisAlignment:
                                                            CrossAxisAlignment
                                                                .start,
                                                        children: [
                                                          Text(
                                                            "${vm.notificationList?[index].title}",
                                                            style: Theme.of(
                                                                    context)
                                                                .textTheme
                                                                .bodySmall
                                                                ?.copyWith(
                                                                  color: Colors
                                                                      .black,
                                                                  fontSize: 16,
                                                                  fontWeight:
                                                                      FontWeight
                                                                          .w400,
                                                                ),
                                                          ),
                                                          const SizedBox(
                                                              height: 4),
                                                          Text(
                                                            "${vm.notificationList?[index].subTitle ?? vm.notificationList?[index].message}",
                                                            style: Theme.of(
                                                                    context)
                                                                .textTheme
                                                                .bodySmall
                                                                ?.copyWith(
                                                                  color: CustomColors
                                                                      .clr_AAAAAA,
                                                                  fontSize: 16,
                                                                  overflow:
                                                                      TextOverflow
                                                                          .ellipsis,
                                                                  fontWeight:
                                                                      FontWeight
                                                                          .w700,
                                                                ),
                                                            maxLines: 2,
                                                          ),
                                                          Align(
                                                            alignment: Alignment
                                                                .bottomRight,
                                                            child: Container(
                                                              width: 7,
                                                              height: 7,
                                                              decoration:
                                                                  BoxDecoration(
                                                                color: vm
                                                                        .notificationList![
                                                                            index]
                                                                        .isSelected
                                                                    ? Colors
                                                                        .white
                                                                    : Colors
                                                                        .red,
                                                                borderRadius:
                                                                    BorderRadius
                                                                        .circular(
                                                                            50),
                                                              ),
                                                            ),
                                                          ),
                                                        ],
                                                      ),
                                                    ),
                                                  ],
                                                ),
                                              ),
                                            ],
                                          ),
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              );
                            },
                          ),
                        )
                      : Flexible(
                          child: Center(
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                SvgPicture.asset(
                                  CustomImages.notificationNotFound,
                                ),
                                Center(
                                  child: Text(vm.isLoading.value == false
                                      ? vm.translation.txt_no_notification
                                      : ''),
                                ),
                              ],
                            ),
                          ),
                        ),
                  const SizedBox(height: Dimensions.padding_10),
                  vm.notificationList != null && vm.notificationList!.isNotEmpty
                      ? Align(
                          alignment: Alignment.topRight,
                          child: InkWell(
                              onTap: () {
                                vm.updateNotificationRead(null, true);
                              },
                              child: Container(
                                  decoration: BoxDecoration(
                                    color: CustomColors.buttonTxtColor,
                                    borderRadius: BorderRadius.circular(30),
                                    boxShadow: const [
                                      BoxShadow(
                                        spreadRadius: 0.2,
                                        blurRadius: 2,
                                        color: CustomColors.primaryColor,
                                      ),
                                    ],
                                  ),
                                  child: Padding(
                                    padding: const EdgeInsets.symmetric(
                                        horizontal: 8, vertical: 5),
                                    child: Text(
                                      vm.translation.txt_clear_all,
                                      style: Theme.of(context)
                                          .textTheme
                                          .bodySmall
                                          ?.copyWith(
                                            color: CustomColors.shadeBlack,
                                            fontSize: 14,
                                          ),
                                    ),
                                  ))),
                        )
                      : const SizedBox(),
                  const SizedBox(height: Dimensions.padding_20),
                ],
              ),
            );
          },
        ),
      ),
    );
  }
}
