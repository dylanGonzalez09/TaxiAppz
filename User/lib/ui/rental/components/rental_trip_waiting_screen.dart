import 'package:flutter/material.dart';




import '../../../components/address_view.dart';
import '../../../components/slider_button.dart';
import '../../../utils/custom_colors.dart';
import '../../../utils/dimensions.dart';
import '../rental_vm.dart';

class RentalTripWaitingScreen extends StatelessWidget {
  final RentalVm vm;

  const RentalTripWaitingScreen({super.key, required this.vm});

  @override
  Widget build(BuildContext context) {
    vm.startProgressLoop();
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(
          vertical: Dimensions.padding_20, horizontal: Dimensions.padding_15),
      decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.only(
              topLeft: Radius.circular(Dimensions.padding_20),
              topRight: Radius.circular(Dimensions.padding_20))),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          AddressView(
            pickupAddress: vm.pickupModel.address,
            dropAddress: "",
            isPickUpOnly: true, stopAddress: '',
          ),
          const SizedBox(
            height: Dimensions.padding_20,
          ),
          Text(vm.translation.txt_Searching_for_drivers,
              style: Theme.of(context).textTheme.bodySmall),
          const SizedBox(
            height: Dimensions.padding_20,
          ),
          Container(
            height: 6,
            width: double.infinity,
            decoration: BoxDecoration(
                color: CustomColors.clr_303030,
                borderRadius: BorderRadius.circular(Dimensions.padding_5)),
            child: Align(
              alignment: Alignment.topLeft,
              child: Container(
                  height: 6,
                  width: vm.progressWidth,
                  decoration: BoxDecoration(
                      color: CustomColors.primaryColor,
                      borderRadius:
                          BorderRadius.circular(Dimensions.padding_5))),
            ),
          ),
          const SizedBox(height: Dimensions.padding_20),
          Text(
            vm.translation.txt_Slide_to_cancel,
            style: Theme.of(context).textTheme.bodySmall,
          ),
          const SizedBox(height: Dimensions.padding_5),
          Text(
            vm.translation.txt_Your_ride_will_start_soon,
            style:
                Theme.of(context).textTheme.bodySmall?.copyWith(fontSize: 16),
          ),
          const SizedBox(height: Dimensions.padding_15),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 25),
            child: SliderButton(
                onCompleted: () {
                  vm.onTripCancel();
                },
                icon: const Icon(Icons.chevron_right_sharp,
                  color: Colors.white,
                  size: 35,),
                text: vm.translation.txt_Slide_to_cancel,height: 45,),
          )
        ],
      ),
    );
  }
}
