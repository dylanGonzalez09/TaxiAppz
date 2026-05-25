import 'package:flutter/material.dart';
import 'package:user/ui/waitingScreen/waiting_vm.dart';


import '../../components/custome_image.dart';
import '../../utils/custom_colors.dart';
import '../../utils/custom_images.dart';
import '../../utils/dimensions.dart';

class WaitingScreen extends StatefulWidget {
  const WaitingScreen({super.key});

  @override
  State<WaitingScreen> createState() => _WaitingScreenState();
}

class _WaitingScreenState extends State<WaitingScreen> {
  final vm = WaitingVm();

  @override
  Widget build(BuildContext context) {
    double fullHeight = MediaQuery.of(context).size.height * 0.4;
    // double halfScreen = fullHeight / 2;
    // double quarterScreen = fullHeight / 4;
    // double halfPlusQuarter = halfScreen + quarterScreen;
    // height: MediaQuery.sizeOf(context).height * 0.12,
    // width: MediaQuery.sizeOf(context).width * 0.04,

    return Scaffold(
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Padding(
            padding: EdgeInsets.only(left: 1, right: 1),
            child: CustomImage(
              imagePath: CustomImages.waitingImage,
              customHeight: 361,
              customWidth: 374,
              customTopPadding: 102,
            ),
          ),
          const Spacer(),
          Column(
            children: [
              Text(vm.translation.txt_due_demand,
                  style: const TextStyle(
                      fontSize: Dimensions.padding_20,
                      fontWeight: FontWeight.w600)),
              const SizedBox(
                height: Dimensions.padding_15,
              ),
              Text(vm.translation.txt_trip_assign_desc,
                  style: const TextStyle(
                      fontSize: Dimensions.padding_18,
                      fontWeight: FontWeight.w300)),
              Text(vm.translation.txt_call_support_desc,
                  style: const TextStyle(
                      fontSize: Dimensions.padding_18,
                      fontWeight: FontWeight.w300)),
              const SizedBox(
                height: Dimensions.padding_40,
              ),
              Padding(
                padding: const EdgeInsets.only(
                    left: Dimensions.padding_20,
                    right: Dimensions.padding_20,
                    bottom: Dimensions.padding_40),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Container(
                        height: Dimensions.padding_45,
                        decoration: BoxDecoration(
                            border: Border.all(
                                color: CustomColors.clr_000000, width: 1),
                            borderRadius: const BorderRadius.all(
                                Radius.circular(Dimensions.padding_20))),
                        child: Center(
                            child: Text(
                          vm.translation.txt_Cancel_Booking,
                          style: const TextStyle(
                              fontSize: Dimensions.padding_16,
                              fontWeight: FontWeight.w700),
                        )),
                      ),
                    ),
                    const SizedBox(
                      width: 20,
                    ),
                    Expanded(
                      child: Container(
                        height: Dimensions.padding_45,
                        decoration: const BoxDecoration(
                            color: CustomColors.primaryColor,
                            borderRadius: BorderRadius.all(Radius.circular(
                              Dimensions.padding_20,
                            ))),
                        child: Center(
                            child: Text(vm.translation.txt_Call_Us,
                                style: const TextStyle(
                                    fontSize: Dimensions.padding_16,
                                    fontWeight: FontWeight.w700))),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
