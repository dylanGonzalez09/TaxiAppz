import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';


import '../../../utils/app_constants.dart';
import '../../../utils/custom_colors.dart';
import '../../../utils/custom_images.dart';
import '../../../utils/custom_router.dart';
import '../../../utils/dimensions.dart';
import '../map_vm.dart';

class MapLocalView extends StatelessWidget {
  final MapVm vm;

  const MapLocalView({super.key, required this.vm});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: Dimensions.padding_10),
      margin: const EdgeInsets.symmetric(
          horizontal: Dimensions.padding_15, vertical: Dimensions.padding_20),
      decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(Dimensions.padding_10),
          boxShadow: [
            BoxShadow(
                color: CustomColors.clr_414141.withValues(alpha: 0.2),
                spreadRadius: 1,
                blurRadius: 2),
          ]),
      child: Column(
        children: [
          InkWell(
            onTap: () async {
              final mapViewMapData = <String, dynamic>{};
              mapViewMapData[AppConstants.isPickChange] = "isPick";
              mapViewMapData[AppConstants.address] = vm.pickupLocation;
              mapViewMapData[AppConstants.latitude] =
                  vm.pickupLocationLatLng.latitude;
              mapViewMapData[AppConstants.longitude] =
                  vm.pickupLocationLatLng.longitude;
              final data = await vm.moveAndWait(CustomRouter.mapView,
                  args: mapViewMapData);
              if (data is Map) {
                debugPrint("dataEntered");
                vm.handlePickupArgs(data);
              }
            },
            child: Padding(
              padding: const EdgeInsets.only(top: Dimensions.padding_10),
              child: Row(
                children: [
                  SvgPicture.asset(CustomImages.pickUpDot),
                  const SizedBox(width: Dimensions.padding_5),
                  Expanded(
                      child: Text(
                    vm.pickupLocation.isEmpty
                        ? vm.translation.txt_Pickup_location
                        : vm.pickupLocation,
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        fontSize: 15,
                        color: vm.pickupLocation.isEmpty
                            ? CustomColors.clr_AAAAAA
                            : Colors.black),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ))
                ],
              ),
            ),
          ),
          const SizedBox(height: Dimensions.padding_12),
          Container(
            height: 0.5,
            width: double.infinity,
            color: CustomColors.clr_919191,
          ),
          InkWell(
            onTap: () async {
              final map = {
                "pickupAddress": vm.pickupLocation,
                "pickUpLatLng": vm.pickupLocationLatLng
              };
              final data =
                  vm.moveAndWait(CustomRouter.destinationScreen, args: map);
              if (data is Map) {
                debugPrint("destinationDataEntered");
                vm.handleDropArgs(data as Map);
              }
            },
            child: Padding(
              padding: const EdgeInsets.only(top: Dimensions.padding_12),
              child: Row(
                children: [
                  SvgPicture.asset(CustomImages.dropDot),
                  const SizedBox(width: Dimensions.padding_5),
                  Expanded(
                      child: Text(
                    vm.dropLocation.isEmpty
                        ? vm.translation.txt_Enter_drop_location
                        : vm.pickupLocation,
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        fontSize: 15,
                        color: vm.dropLocation.isEmpty
                            ? CustomColors.clr_AAAAAA
                            : Colors.black),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  )),
                  const SizedBox(width: Dimensions.padding_5),
                  const Icon(Icons.add_rounded)
                ],
              ),
            ),
          ),
          const SizedBox(height: Dimensions.padding_10)
        ],
      ),
    );
  }
}
