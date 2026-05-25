import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import '../ui/tripscreen/trip_screen_vm.dart';
import '../utils/custom_colors.dart';
import '../utils/custom_images.dart';
import '../utils/dimensions.dart';

class PickupView extends StatelessWidget {
  final String address;
  final String stopAddress;
  final bool isTripStarted;
  final TripScreenVm vm;

  PickupView(
      {super.key,
      required this.address,
      required this.stopAddress,
      required this.isTripStarted,
      required this.vm});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: EdgeInsets.zero,
      decoration: BoxDecoration(
        color: const Color(0xFFFFFFFF),
        borderRadius: BorderRadius.circular(10),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withValues(alpha: 0.5),
            spreadRadius: 1,
            blurRadius: 5,
            offset: const Offset(0, 0), // changes position of shadow
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (isTripStarted && stopAddress.isNotEmpty) ...[
              Row(
                children: [
                  SvgPicture.asset(
                    CustomImages.stopDot,
                    height: 12,
                    width: 12,
                  ),
                  const SizedBox(width: 6),
                  Expanded(
                    child: Text(
                      stopAddress,
                      style: Theme.of(context)
                          .textTheme
                          .bodySmall
                          ?.copyWith(color: Colors.black, fontSize: 14),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  const SizedBox(width: 6),
                  InkWell(
                    onTap: () async => vm.changeTripAddressChange(
                        TRIPADDRESSCHANGETYPE.STOP_ADDRESS),
                    child: const Icon(
                      Icons.mode_edit_outline_outlined,
                      color: Colors.black,
                      size: Dimensions.padding_14,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: Dimensions.padding_10),
              const Divider(
                height: 0.6,
                color: CustomColors.clr_ADADAD,
              ),
              const SizedBox(height: Dimensions.padding_8),
            ],
            Row(
              children: [
                SvgPicture.asset(
                  isTripStarted ? CustomImages.dropDot : CustomImages.pickUpDot,
                  height: 12,
                  width: 12,
                ),
                const SizedBox(width: 6),
                Expanded(
                  child: Text(
                    address,
                    style: Theme.of(context)
                        .textTheme
                        .bodySmall
                        ?.copyWith(color: Colors.black, fontSize: 14),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                const SizedBox(width: 6),
                Visibility(
                  visible: vm.tripStatus == TRIPSTATUS.TRIP_START ||
                      vm.tripStatus == TRIPSTATUS.TRIP_ACCEPTED,
                  child: vm.isAddressChangeLoader != true
                      ? InkWell(
                          onTap: () async => vm.changeTripAddressChange(
                              isTripStarted
                                  ? TRIPADDRESSCHANGETYPE.DROP_ADDRESS
                                  : TRIPADDRESSCHANGETYPE.PICKUP_ADDRESS),
                          child: const Icon(
                            Icons.mode_edit_outline_outlined,
                            color: Colors.black,
                            size: Dimensions.padding_14,
                          ),
                        )
                      : const SizedBox(
                          width: Dimensions.padding_14,
                          height: Dimensions.padding_14,
                          child: CircularProgressIndicator(
                            color: CustomColors.primaryColor,
                            strokeWidth: 2,
                          ),
                        ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
