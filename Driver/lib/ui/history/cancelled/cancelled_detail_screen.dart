import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import '../../../components/drawer_scaffold.dart';
import '../../../components/header_view.dart';
import '../../../utils/app_constants.dart';
import '../../../utils/custom_colors.dart';
import '../../../utils/custom_images.dart';
import '../../../utils/dimensions.dart';
import 'cancelled_detail_vm.dart';

class CancelledDetailScreen extends StatefulWidget {
  final Map<String, dynamic> map;

  const CancelledDetailScreen({
    super.key,
    required this.map,
  });

  @override
  State<CancelledDetailScreen> createState() => _CancelledDetailScreen();
}

class _CancelledDetailScreen extends State<CancelledDetailScreen> {
  final GlobalKey<ScaffoldState> scaffoldKey = GlobalKey<ScaffoldState>();
  final vm = CancelledDetailVm();

  @override
  void initState() {
    if (widget.map.isNotEmpty) {
      vm.setInitialData(widget.map);
    }
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: DrawerScaffold(
        body: Padding(
          padding: const EdgeInsets.only(
            left: Dimensions.padding_20,
            right: Dimensions.padding_20,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              HeaderView(title: vm.translation.txt_cancelled),
              Container(
                decoration: BoxDecoration(
                  border: Border.all(
                    color: CustomColors.clr_AAAAAA,
                    width: 1,
                  ),
                  borderRadius: BorderRadius.circular(10.0),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(10),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            '${vm.translation.txtBookingId} : ${vm.tripModel?.requestNumber}',
                            style:
                            Theme.of(context).textTheme.bodySmall?.copyWith(
                              color: Colors.black,
                              fontSize: 14,
                            ),
                          ),
                        ],
                      ),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            vm.tripModel?.driverDetails?.carNumber ?? "",
                            style:
                            Theme.of(context).textTheme.bodySmall?.copyWith(
                              color: Colors.black,
                              fontSize: 14,
                            ),
                          ),
                          CachedNetworkImage(
                            imageUrl:
                            "${AppConstants.imageBaseUrl}${vm.tripModel?.vehicleDetails?.highlightImage ?? vm.tripModel?.vehicleDetails?.image}",
                            fit: BoxFit.cover,
                            width: 30,
                            height: 30,
                            errorWidget: (c, e, t) => SvgPicture.asset(
                              CustomImages.vehicleTypePlaceHolder,
                              width: 30,
                              height: 30,
                            ),
                            progressIndicatorBuilder:
                                (context, child, loadingProgress) {
                              return const Center(
                                child: SizedBox(
                                  width: 30,
                                  height: 30,
                                  child: CircularProgressIndicator(
                                    color: CustomColors.primaryColor,
                                    strokeWidth: 2,
                                  ),
                                ),
                              );
                            },
                          ),
                        ],
                      ),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            "${vm.formatMonthDateYear(vm.tripModel?.cancelledAt ?? '', 2)} ${vm.formatTime(vm.tripModel?.cancelledAt ?? '')}",
                            /*vm.tripModel?.tripStartTime?.isNotEmpty == true
                                ? "${vm.formatMonthDateYear(vm.tripModel!.tripStartTime!, 2)} ${vm.formatTime(vm.tripModel!.tripStartTime!)}"
                                : vm.tripModel?.tripStartTime ?? "",*/
                            style:
                            Theme.of(context).textTheme.bodySmall?.copyWith(
                              color: Colors.black,
                              fontSize: 10,
                            ),
                          ),
                          Text(
                            vm.tripModel?.vehicleDetails?.vehicleName ?? "",
                            style:
                            Theme.of(context).textTheme.bodySmall?.copyWith(
                              color: Colors.black,
                              fontSize: 12,
                            ),
                          ),
                        ],
                      ),
                      const Divider(
                        height: 20,
                        color: CustomColors.clr_AAAAAA,
                        thickness: 0.5,
                      ),
                      Column(
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              SizedBox(
                                width: 15,
                                height: 15,
                                child: Image.asset(
                                  CustomImages.pickUpIndicator,
                                ),
                              ),
                              const SizedBox(width: Dimensions.padding_10),
                              Expanded(
                                child: Text(
                                  vm.tripModel?.pickAddress ?? "",
                                  style: Theme.of(context)
                                      .textTheme
                                      .bodySmall
                                      ?.copyWith(
                                    color: Colors.black,
                                    fontSize: 12,
                                  ),
                                ),
                              ),
                            ],
                          ),
                          Visibility(
                            visible: vm.tripModel?.stopAddress?.isNotEmpty == true,
                            child: const Divider(
                              height: 20,
                              color: CustomColors.clr_AAAAAA,
                              thickness: 0.5,
                            ),
                          ),
                          Visibility(
                            visible: vm.tripModel?.stopAddress?.isNotEmpty == true,
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                SvgPicture.asset(
                                  CustomImages.stopIndicator,
                                  height: 15,
                                  width: 15,
                                ),
                                const SizedBox(width: Dimensions.padding_10),
                                Expanded(
                                  child: Text(
                                    vm.tripModel?.stopAddress ?? "",
                                    style: Theme.of(context)
                                        .textTheme
                                        .bodySmall
                                        ?.copyWith(
                                      color: Colors.black,
                                      fontSize: 12,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          if (vm.tripModel?.dropAddress?.isNotEmpty == true)...[
                            const Divider(
                              height: 20,
                              color: CustomColors.clr_AAAAAA,
                              thickness: 0.5,
                            ),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                SizedBox(
                                  width: 15,
                                  height: 15,
                                  child: Image.asset(
                                    CustomImages.dropIndicator,
                                  ),
                                ),
                                const SizedBox(width: Dimensions.padding_10),
                                Expanded(
                                  child: Text(
                                    vm.tripModel?.dropAddress ?? "",
                                    style: Theme.of(context)
                                        .textTheme
                                        .bodySmall
                                        ?.copyWith(
                                      color: Colors.black,
                                      fontSize: 12,
                                    ),
                                  ),
                                ),
                              ],
                            )
                          ]
                        ],
                      ),
                      const Divider(
                        height: 20,
                        color: CustomColors.clr_AAAAAA,
                        thickness: 0.5,
                      ),
                      Text(
                        '${vm.translation.txtReason}: ${vm.tripModel?.customReason ?? vm.tripModel?.cancellationReason ?? vm.translation.txt_trip_cancelled}',
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: Colors.black,
                          fontSize: 14,
                        ),
                      ),
                      /*Text(
                        vm.tripModel?.customReason ?? vm.tripModel?.cancellationReason ??
                            vm.translation.txt_trip_cancelled,
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: CustomColors.clr_AAAAAA,
                          fontSize: 14,
                        ),
                      ),*/
                      Text(
                        "${vm.translation.txtCancelledBy}: ${vm.tripModel?.cancelMethod ?? ""}",
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: CustomColors.clr_AAAAAA,
                          fontSize: 14,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
        scaffoldKey: scaffoldKey,
      ),
    );
  }
}
