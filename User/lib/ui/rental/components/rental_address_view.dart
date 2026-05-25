import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';

import '../../../utils/custom_colors.dart';
import '../../../utils/custom_images.dart';
import '../../../utils/custom_router.dart';
import '../../../utils/dimensions.dart';
import '../rental_vm.dart';

class RentalAddressView extends StatelessWidget {
  final RentalVm vm;

  const RentalAddressView({super.key, required this.vm});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () async {
        final data =
        await vm.moveAndWait(CustomRouter.mapView);
        if (data is Map) {
          vm.handleDropArgs(data);
        }
      },
      child: Container(
          margin: const EdgeInsets.only(
              left: Dimensions.padding_10,
              right: Dimensions.padding_10,
              top: Dimensions.padding_10,
              bottom: Dimensions.padding_15),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(10),
            color: Colors.white,
            boxShadow: [
              BoxShadow(
                color: Colors.grey.shade300,
                blurRadius: 2.5,
                offset: const Offset(0, 0),
                spreadRadius: 2,
              ),
            ],
          ),
          padding: const EdgeInsets.only(left: 10, top: 10, bottom: 0),
          child: Column(
            children: [
              Padding(
                padding: const EdgeInsets.only(right: Dimensions.padding_10),
                child: Row(
                  children: [
                    SvgPicture.asset(
                      CustomImages.locationDot,
                      width: Dimensions.padding_12,
                      height: Dimensions.padding_12,
                      colorFilter:
                          const ColorFilter.mode(Colors.green, BlendMode.srcIn),
                    ),
                    const SizedBox(width: Dimensions.padding_8),
                    Expanded(
                      child: Stack(
                        children: [
                          Padding(
                            padding: const EdgeInsets.only(right: 15),
                            child: Text(
                                vm.pickupLocation.isEmpty
                                    ? vm.translation.txt_Pickup_location
                                    : vm.pickupLocation,
                                maxLines: 2,
                                style: Theme
                                    .of(context)
                                    .textTheme
                                    .bodySmall
                                    ?.copyWith(
                                  fontSize: 15,
                                  overflow:
                                  TextOverflow.ellipsis,
                                )),
                          ),
                          Positioned(
                            bottom: 2,
                            right: 0,
                            child: InkWell(
                              onTap: () {},
                              child: SvgPicture.asset(
                                CustomImages.pencilIcon,
                                width: 12,
                                height: 12,
                                colorFilter: const ColorFilter.mode(
                                  CustomColors.shadeBlack,
                                  BlendMode.srcIn,
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              // Container(
              //   height: 0.7,
              //   margin: EdgeInsets.only(
              //       right: Dimensions.padding_10,
              //       top: Dimensions.padding_12,
              //       bottom: vm.showStopLabel
              //           ? Dimensions.padding_5
              //           : Dimensions.padding_10),
              //   width: double.infinity,
              //   color: CustomColors.clr_919191,
              // ),

              // //stops
              // if (vm.showStops)
              //   Visibility(
              //     visible: vm.showStopLabel,
              //     child: Align(
              //         alignment: Alignment.topLeft,
              //         child: Padding(
              //           padding:
              //               const EdgeInsets.only(left: Dimensions.padding_20),
              //           child: Text(vm.translation.txt_Stop_location,
              //               style: Theme.of(context)
              //                   .textTheme
              //                   .bodySmall
              //                   ?.copyWith(
              //                       fontSize: 11,
              //                       color: CustomColors.clr_AAAAAA)),
              //         )),
              //   ),
              // if (vm.showStopLabel && vm.showStops)
              //   const SizedBox(height: Dimensions.padding_2),
              // if (vm.showStops)
              //   Padding(
              //     padding: const EdgeInsets.only(right: Dimensions.padding_10),
              //     child: Row(
              //       children: [
              //         SvgPicture.asset(
              //           CustomImages.dropDot,
              //           width: Dimensions.padding_12,
              //           height: Dimensions.padding_12,
              //         ),
              //         const SizedBox(width: Dimensions.padding_8),
              //         Expanded(
              //             child: Text(vm.stopLocation,
              //                 maxLines: 1,
              //                 overflow: TextOverflow.ellipsis,
              //                 style:
              //                     Theme.of(context).textTheme.bodySmall?.copyWith(
              //                           fontSize: 15,
              //                           overflow: TextOverflow.ellipsis,
              //                         ))),
              //         const SizedBox(width: Dimensions.padding_10)
              //       ],
              //     ),
              //   ),
              // if (vm.showStops) const SizedBox(height: Dimensions.padding_5),
              // if (vm.showStops)
              //   SizedBox(
              //     height: 15,
              //     child: Stack(
              //       fit: StackFit.loose,
              //       children: [
              //         Align(
              //           alignment: Alignment.center,
              //           child: Divider(
              //             height: 0.6,
              //             color: CustomColors.clr_AAAAAA.withValues(alpha: 0.6),
              //           ),
              //         ),
              //         Positioned(
              //             right: 44,
              //             top: 0,
              //             bottom: 0,
              //             child: Container(
              //                 color: Colors.white,
              //                 height: 20,
              //                 width: 15,
              //                 child: SvgPicture.asset(CustomImages.swipeIcon))),
              //       ],
              //     ),
              //   ),
              //
              // //drop
              // Align(
              //     alignment: Alignment.topLeft,
              //     child: Padding(
              //       padding: const EdgeInsets.only(left: Dimensions.padding_20),
              //       child: Text(vm.translation.txt_Drop_location,
              //           style: Theme.of(context).textTheme.bodySmall?.copyWith(
              //               fontSize: 11, color: CustomColors.clr_AAAAAA)),
              //     )),
              //
              // const SizedBox(height: Dimensions.padding_2),
              // Padding(
              //   padding: const EdgeInsets.only(right: Dimensions.padding_10),
              //   child: Row(
              //     children: [
              //       SvgPicture.asset(
              //         CustomImages.dropDot,
              //         width: Dimensions.padding_12,
              //         height: Dimensions.padding_12,
              //       ),
              //       const SizedBox(width: Dimensions.padding_8),
              //       Expanded(
              //           child: Text(vm.dropLocation,
              //               maxLines: 1,
              //               overflow: TextOverflow.ellipsis,
              //               style: Theme.of(context).textTheme.bodySmall?.copyWith(
              //                     fontSize: 15,
              //                     overflow: TextOverflow.ellipsis,
              //                   ))),
              //       InkWell(
              //         onTap: vm.onAddRemoveStops,
              //         child: SizedBox(
              //             width: 28,
              //             child: Icon(
              //               vm.showStops ? Icons.remove_rounded : Icons.add_rounded,
              //               color: CustomColors.clr_303030,
              //             )),
              //       ),
              //       const SizedBox(width: Dimensions.padding_10)
              //     ],
              //   ),
              // ),
              const SizedBox(height: Dimensions.padding_10)
            ],
          )),
    );
  }
}
