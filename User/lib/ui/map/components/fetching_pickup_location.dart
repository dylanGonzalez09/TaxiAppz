import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import '../../../components/proceed_button.dart';
import '../../../utils/custom_colors.dart';
import '../../../utils/custom_images.dart';
import '../../../utils/dimensions.dart';
import '../map_vm.dart';


import '../../../utils/app_constants.dart';
import '../../../utils/custom_router.dart';

class FetchingPickupLocation extends StatelessWidget {
  final MapVm vm;
  bool isChangePick;
  FetchingPickupLocation(
      {super.key, required this.vm, this.isChangePick = false});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(15.0),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.symmetric(
                vertical: Dimensions.padding_12,
                horizontal: Dimensions.padding_10),
            decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(Dimensions.padding_10),
                color: Colors.white,
                boxShadow: [
                  BoxShadow(
                      color: CustomColors.clr_414141.withValues(alpha: 0.2),
                      spreadRadius: 2,
                      blurRadius: 4)
                ]),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                SvgPicture.asset(
                  CustomImages.pickUpDot,
                  height: 12,
                  width: 12,
                ),
                const SizedBox(width: Dimensions.padding_5),
                Expanded(
                    child: Text(
                  vm.pickupLocation,
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      fontSize: 15, color: Colors.black, height: 1.5),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ))
              ],
            ),
          ),
          const SizedBox(height: Dimensions.padding_20),
          ProceedButton(
            btnTxt: isChangePick
                ? vm.translation.txt_Change_pickup_location
                : vm.translation.txt_Confirm_pickup_location,
            onPressed: () async {
              if (isChangePick) {
                final mapViewMapData = <String, dynamic>{};
                mapViewMapData[AppConstants.isPickChange] = "isPick";
                mapViewMapData[AppConstants.address] = vm.pickupLocation;
                mapViewMapData[AppConstants.latitude] =
                    vm.pickupLocationLatLng.latitude;
                mapViewMapData[AppConstants.longitude] =
                    vm.pickupLocationLatLng.longitude;

                debugPrint("jhdfjghdfghjdfhgkjdfhgjkfdhg $mapViewMapData");

                final data = await vm.moveAndWait(CustomRouter.mapView,
                    args: mapViewMapData);
                if (data is Map) {
                  debugPrint("dataEntered");
                  vm.handlePickupArgs(data);
                }
              } else {
                vm.onConfirmPickupLocation();
              }
            },
          ),
          const SizedBox(height: Dimensions.padding_5)
        ],
      ),
    );
  }
}
