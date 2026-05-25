import 'package:animated_text_kit/animated_text_kit.dart';
import 'package:flutter/material.dart';
import 'package:flutter_foreground_task/flutter_foreground_task.dart';
import 'package:flutter_svg/svg.dart';
import 'package:taxiappzpro/components/sos_view.dart';
import 'package:taxiappzpro/main.dart';
import 'package:taxiappzpro/ui/map/map_vm.dart';
import 'package:taxiappzpro/utils/custom_router_config.dart';
import 'package:taxiappzpro/utils/dimensions.dart';
import 'package:taxiappzpro/utils/theme_data.dart';
import 'package:taxiappzpro/utils/utils.dart';
import '../../../utils/custom_colors.dart';
import '../../../utils/custom_images.dart';

class MapBottomView extends StatelessWidget {
  final MapVm vm;

  const MapBottomView({super.key, required this.vm});

  @override
  Widget build(BuildContext context) {
    return Positioned(
        bottom: 0,
        left: 0,
        right: 0,
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            children: [
              vm.isAlert == true
                  ? AnimatedOpacity(
                      opacity: vm.isOnline ? 1.0 : 0.0,
                      duration: const Duration(milliseconds: 300),
                      child: Visibility(
                        visible: vm.isOnline,
                        maintainAnimation: true,
                        maintainSize: false,
                        maintainState: true,
                        child: Container(
                          padding: const EdgeInsets.all(5),
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(10),
                            color: Colors.white,
                            boxShadow: const [
                              BoxShadow(
                                  spreadRadius: 0.2,
                                  blurRadius: 2,
                                  color: CustomColors.clr_AAAAAA)
                            ],
                          ),
                          child: Container(
                            padding: const EdgeInsets.only(
                                top: 15, bottom: 15, left: 15, right: 30),
                            decoration: BoxDecoration(
                              border: Border.all(
                                  color: CustomColors.primaryColor, width: 1),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.start,
                              children: [
                                IntrinsicHeight(
                                  child: Row(
                                    mainAxisAlignment: MainAxisAlignment.end,
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      SvgPicture.asset(CustomImages.alertIcon),
                                      const SizedBox(width: 6),
                                      Expanded(
                                        child: Text(
                                            vm.translation
                                                .txt_Scheduled_Trip_Starts_with,
                                            style: themeData
                                                .textTheme.labelSmall
                                                ?.copyWith(
                                                    fontSize: 14,
                                                    fontWeight:
                                                        FontWeight.w600)),
                                      ),
                                    ],
                                  ),
                                ),
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.end,
                                  children: [
                                    Text(vm.translation.txt_Tap_to_Start_trip,
                                        style: themeData.textTheme.labelSmall
                                            ?.copyWith(
                                                fontSize: 12,
                                                fontWeight: FontWeight.w600)),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    )
                  : const SizedBox(),
              const SizedBox(height: 20),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  InkWell(
                      onTap: () => vm.moveToNamed(CustomRouterConfig.sosScreen),
                      child: SosView(
                        translation: vm.translation,
                      )),
                  InkWell(
                    onTap: () {
                      vm.getCurrentLocation();
                    },
                    child: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: const BoxDecoration(
                        boxShadow: [
                          BoxShadow(
                              spreadRadius: 0.2,
                              blurRadius: 2,
                              color: CustomColors.clr_AAAAAA)
                        ],
                        shape: BoxShape.circle,
                        color: CustomColors.buttonTxtColor,
                      ),
                      child: vm.isCurrentLocationPressed
                          ? const SizedBox(
                              width: Dimensions.padding_20,
                              height: Dimensions.padding_20,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                color: CustomColors.primaryColor,
                              ),
                            )
                          : const Icon(
                              Icons.my_location,
                              color: CustomColors.primaryColor,
                            ),
                    ),
                  )
                ],
              ),
              Visibility(
                visible: vm.isOnline &&
                    vm.requestInProModel?.isDriverSubScriptionValid == true,
                child: Container(
                  margin: const EdgeInsets.only(top: Dimensions.padding_15),
                  padding: const EdgeInsets.all(Dimensions.padding_15),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(Dimensions.padding_10),
                    color: Colors.white,
                    boxShadow: const [
                      BoxShadow(
                          spreadRadius: 0.2,
                          blurRadius: 2,
                          color: CustomColors.clr_AAAAAA)
                    ],
                  ),
                  child: Column(
                    spacing: Dimensions.padding_5,
                    children: [
                      Row(
                        children: [
                          Text(
                            "${vm.translation.txtSubscriptionPlan} : ",
                            style: Theme.of(context)
                                .textTheme
                                .bodySmall
                                ?.copyWith(fontSize: Dimensions.padding_14),
                          ),
                          Expanded(
                            child: Text(
                                vm.requestInProModel?.subscriptionName ?? "",
                                style: Theme.of(context)
                                    .textTheme
                                    .titleLarge
                                    ?.copyWith(
                                    fontSize: Dimensions.padding_16)),
                          ),
                        ],
                      ),
                      Row(
                        children: [
                          Text(
                              "${vm.translation.txtSubscriptionRemainingDays} : ",
                              style: Theme.of(context)
                                  .textTheme
                                  .bodySmall
                                  ?.copyWith(fontSize: Dimensions.padding_14)),
                          Expanded(
                              child: Text(
                                  "${vm.requestInProModel?.remainingDays} ${vm.translation.txtDays}",
                                  style: Theme.of(context)
                                      .textTheme
                                      .titleLarge
                                      ?.copyWith(
                                      fontSize: Dimensions.padding_16)))
                        ],
                      ),
                    ],
                  ),
                ),
              ),
              if (vm.isOnline) const SizedBox(height: 15),
              AnimatedOpacity(
                opacity: vm.isOnline ? 1.0 : 0.0,
                duration: const Duration(milliseconds: 300),
                child: Visibility(
                  visible: vm.isOnline,
                  maintainAnimation: true,
                  maintainSize: false,
                  maintainState: true,
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 20, vertical: 15),
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(10),
                      color: Colors.white,
                      boxShadow: const [
                        BoxShadow(
                            spreadRadius: 0.2,
                            blurRadius: 2,
                            color: CustomColors.clr_AAAAAA)
                      ],
                    ),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.start,
                      children: [
                        IntrinsicHeight(
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.start,
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Expanded(
                                  child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    vm.translation.txtTodaysStatus,
                                    style: Theme.of(context)
                                        .textTheme
                                        .titleLarge
                                        ?.copyWith(fontSize: 16),
                                  ),
                                  const SizedBox(
                                    height: 10,
                                  ),
                                  Row(
                                    children: [
                                      Text(
                                        "${vm.translation.txtCompleted} :",
                                        style: Theme.of(context)
                                            .textTheme
                                            .bodySmall
                                            ?.copyWith(fontSize: 14),
                                      ),
                                      const Spacer(),
                                      Text(
                                          "${vm.todayStatus?.todayCompleted ?? "..."}",
                                          style: Theme.of(context)
                                              .textTheme
                                              .titleLarge
                                              ?.copyWith(fontSize: 18)),
                                    ],
                                  ),
                                  const SizedBox(
                                    height: 5,
                                  ),
                                  Row(
                                    children: [
                                      Text(
                                        "${vm.translation.txt_cancelled} :",
                                        style: Theme.of(context)
                                            .textTheme
                                            .bodySmall
                                            ?.copyWith(fontSize: 14),
                                      ),
                                      const Spacer(),
                                      Text(
                                          "${vm.todayStatus?.todayCancelled ?? "..."}",
                                          style: Theme.of(context)
                                              .textTheme
                                              .titleLarge
                                              ?.copyWith(fontSize: 18)),
                                    ],
                                  ),
                                ],
                              )),
                              const SizedBox(
                                width: 20,
                              ),
                              Container(
                                width: 1,
                                color: Colors.black,
                              ),
                              const SizedBox(
                                width: 20,
                              ),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      vm.translation.txtEarnings,
                                      style: Theme.of(context)
                                          .textTheme
                                          .titleLarge
                                          ?.copyWith(fontSize: 14),
                                    ),
                                    // AnimatedTextKit(
                                    //   totalRepeatCount: 1000000,
                                    //   animatedTexts: [
                                    //     ScaleAnimatedText(
                                    //       vm.translation.txtEarnings,
                                    //       duration: const Duration(milliseconds: 2000),
                                    //         textStyle: Theme.of(context)
                                    //             .textTheme
                                    //             .titleLarge
                                    //             ?.copyWith(fontSize: 14),
                                    //     ),
                                    //   ],
                                    // ),
                                    const SizedBox(
                                      height: 10,
                                    ),
                                    // AnimatedTextKit(
                                    //   totalRepeatCount: 1000000,
                                    //   animatedTexts: [
                                    //     ScaleAnimatedText(
                                    //       "${vm.currencySymbol} ${vm.todayStatus?.totalAmount?.isNotEmpty == true ? Utils.formatDecimalPointValue(vm.todayStatus!.totalAmount!, 1) : "..."}",
                                    //       duration: const Duration(milliseconds: 2000),
                                    //       textStyle: Theme.of(context)
                                    //           .textTheme
                                    //           .titleLarge
                                    //           ?.copyWith(fontSize: 35),
                                    //     ),
                                    //   ],
                                    // ),
                                    Text(
                                      "${vm.currencySymbol} ${vm.todayStatus?.totalAmount?.isNotEmpty == true ? Utils.formatDecimalPointValue(vm.todayStatus!.totalAmount!, 1) : "..."}",
                                      style: Theme.of(context)
                                          .textTheme
                                          .titleLarge
                                          ?.copyWith(fontSize: 35),
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ],
                                ),
                              )
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              )
            ],
          ),
        ));
  }
}
