import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';

import '../../../components/emtyp_border_text_field.dart';
import '../destination_vm.dart';


import '../../../utils/custom_colors.dart';
import '../../../utils/custom_images.dart';
import '../../../utils/dimensions.dart';

class AddressView extends StatelessWidget {
  final DestinationVm vm;
  const AddressView({super.key, required this.vm});

  @override
  Widget build(BuildContext context) {
    return Container(
        margin: const EdgeInsets.only(
            left: Dimensions.padding_15,
            right: Dimensions.padding_15,
            top: Dimensions.padding_15,
            bottom: Dimensions.padding_15),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(10),
          color: Colors.white,
          boxShadow: const [
            BoxShadow(
                color: CustomColors.clr_ADADAD,
                offset: Offset(0, 0),
                blurRadius: 3,
                spreadRadius: -0.5
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
                    CustomImages.pickUpDot,
                    width: Dimensions.padding_12,
                    height: Dimensions.padding_12,
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
              height: 0.5,
              margin: EdgeInsets.only(
                  right: Dimensions.padding_10,
                  top: Dimensions.padding_12,
                  bottom: vm.showStopLabel
                      ? Dimensions.padding_5
                      : Dimensions.padding_10),
              width: double.infinity,
              color: CustomColors.clr_ADADAD,
            ),

            //stops
            if (vm.showStops)
              Visibility(
                visible: vm.showStopLabel,
                child: Align(
                    alignment: Alignment.topLeft,
                    child: Padding(
                      padding:
                      const EdgeInsets.only(left: Dimensions.padding_20),
                      child: Text(vm.translation.txt_Stop_location,
                          style: Theme.of(context)
                              .textTheme
                              .bodySmall
                              ?.copyWith(
                              fontSize: 11,
                              color: CustomColors.clr_AAAAAA)),
                    )),
              ),
            if (vm.showStopLabel && vm.showStops)
              const SizedBox(height: Dimensions.padding_2),
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
                        child: EmptyBorderTextField(
                          controller: vm.stopController,
                          hint: vm.translation.txt_Enter_stop_location,
                          focusNode: vm.stopFocusNode,
                          label: vm.translation.txt_Drop_location,
                          onChanged: vm.onStopLocationChange,
                          showLabel: false,
                          textStyle: Theme.of(context)
                              .textTheme
                              .bodySmall
                              ?.copyWith(fontSize: 15),
                        )),
                    if (vm.showStopLabel)
                      InkWell(
                        onTap: () {
                          vm.stopController.text = "";
                        },
                        child: const SizedBox(
                          width: 32,
                          child: Icon(
                            Icons.clear_rounded,
                            size: 14,
                            color: CustomColors.clr_303030,
                          ),
                        ),
                      ),
                    const SizedBox(width: Dimensions.padding_10)
                  ],
                ),
              ),
            if (vm.showStops) const SizedBox(height: Dimensions.padding_5),
            if (vm.showStops)
              SizedBox(
                height: 15,
                child: Stack(
                  fit: StackFit.loose,
                  children: [
                    Padding(
                      padding: const EdgeInsets.only(top: 8.0,right: 10),
                      child: Container(
                        height: 0.5,
                        color: CustomColors.clr_919191,
                      ),
                    ),
                    Positioned(
                        right: 44,
                        top: 0,
                        bottom: 0,
                        child: InkWell(
                          onTap: (){
                            vm.swipeDestination();
                          },
                          child: Container(
                              color: Colors.white,
                              height: 20,
                              width: 15,
                              child: SvgPicture.asset(CustomImages.swipeIcon)),
                        )),
                  ],
                ),
              ),

            //drop
            Visibility(
              visible: vm.showDropLabel,
              child: Align(
                  alignment: Alignment.topLeft,
                  child: Padding(
                    padding: const EdgeInsets.only(left: Dimensions.padding_20),
                    child: Text(vm.translation.txt_Drop_location,
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            fontSize: 11, color: CustomColors.clr_AAAAAA)),
                  )),
            ),
            if (vm.showDropLabel)
              const SizedBox(height: Dimensions.padding_2),
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
                      child: EmptyBorderTextField(
                        controller: vm.dropController,
                        hint: vm.translation.txt_Enter_drop_location,
                        label: vm.translation.txt_Drop_location,
                        focusNode: vm.dropFocusNode,
                        showLabel: false,
                        onChanged: vm.onDropLocationChanged,
                        textStyle: Theme.of(context)
                            .textTheme
                            .bodySmall
                            ?.copyWith(fontSize: 15),
                      )),
                  if (vm.showDropLabel)
                    InkWell(
                      onTap: () {
                        vm.dropController.text = "";
                      },
                      child: const SizedBox(
                        width: 32,
                        child: Icon(
                          Icons.clear_rounded,
                          size: 14,
                          color: CustomColors.clr_303030,
                        ),
                      ),
                    ),
                  InkWell(
                    onTap: (){
                      vm.onAddRemoveStops();
                      vm.toggleStopFieldVisibility();
                    },
                    child: SizedBox(
                        width: 28,
                        child: Icon(
                          vm.showStops ? Icons.remove_rounded : Icons.add_rounded,
                          color: CustomColors.clr_303030,
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
