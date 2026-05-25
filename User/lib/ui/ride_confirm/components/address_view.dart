import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:go_router/go_router.dart';
import '../ride_confirm_vm.dart';


import '../../../utils/custom_colors.dart';
import '../../../utils/custom_images.dart';
import '../../../utils/dimensions.dart';

class AddressView extends StatelessWidget {
  final RideConfirmVm vm;

  const AddressView({super.key, required this.vm});

  @override
  Widget build(BuildContext context) {
    return Container(
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
                    child: Text(vm.pickupLocation,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                              fontSize: 15,
                              overflow: TextOverflow.ellipsis,
                            )),
                  ),
                ],
              ),
            ),
            Container(
              height: 0.7,
              margin: const EdgeInsets.only(
                right: Dimensions.padding_10,
                top: Dimensions.padding_12,
              ),
              width: double.infinity,
              color: CustomColors.clr_919191,
            ),
            if (vm.showStopLabel && vm.showStops)
              const SizedBox(height: Dimensions.padding_11),
            if (vm.showStops)
              Padding(
                padding: const EdgeInsets.only(right: Dimensions.padding_10),
                child: Row(
                  children: [
                    SvgPicture.asset(
                      CustomImages.stopDot,
                      width: Dimensions.padding_12,
                      height: Dimensions.padding_12,
                    ),
                    const SizedBox(width: Dimensions.padding_8),
                    Expanded(
                        child: Text(vm.stopLocation,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style:
                                Theme.of(context).textTheme.bodySmall?.copyWith(
                                      fontSize: 15,
                                      overflow: TextOverflow.ellipsis,
                                    ))),
                    const SizedBox(width: Dimensions.padding_10)
                  ],
                ),
              ),
            if (vm.showStops) const SizedBox(height: Dimensions.padding_11),
            if (vm.showStops)
              Container(
                height: 0.7,
                margin: const EdgeInsets.only(
                  right: Dimensions.padding_10,
                ),
                width: double.infinity,
                color: CustomColors.clr_919191,
              ),
            const SizedBox(height: Dimensions.padding_11),
            Padding(
              padding: const EdgeInsets.only(right: Dimensions.padding_10),
              child: Row(
                children: [
                  SvgPicture.asset(
                    CustomImages.dropDot,
                    width: Dimensions.padding_12,
                    height: Dimensions.padding_12,
                  ),
                  const SizedBox(width: Dimensions.padding_8),
                  Expanded(
                      child: Text(vm.dropLocation,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style:
                              Theme.of(context).textTheme.bodySmall?.copyWith(
                                    fontSize: 15,
                                    overflow: TextOverflow.ellipsis,
                                  ))),
                  InkWell(
                    onTap: () {
                      GoRouter.of(context).pop();
                    },
                    child: const SizedBox(
                        width: 15,
                        height: 20,
                        child: Icon(
                          Icons.edit,
                          color: CustomColors.clr_303030,
                          size: 18,
                        )),
                  ),
                  const SizedBox(width: Dimensions.padding_10)
                ],
              ),
            ),
            const SizedBox(height: Dimensions.padding_10)
          ],
        ));
  }
}
