import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import '../../../models/enums.dart';
import '../../../utils/dimensions.dart';
import '../map_vm.dart';


import '../../../utils/custom_colors.dart';
import '../../../utils/custom_images.dart';

class ServiceCategory extends StatelessWidget {
  final MapVm vm;

  const ServiceCategory({
    super.key,
    required this.vm,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: [
            InkWell(
              onTap: vm.onLocalSelected,
              child: Column(
                children: [
                  Center(
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: Dimensions.padding_20,
                          vertical: Dimensions.padding_18),
                      decoration: BoxDecoration(
                          color:
                              vm.selectedCategory == ServiceCategoryType.Ride
                                  ? CustomColors.selectedColor
                                  : Colors.transparent,
                          border: Border.all(color: vm.selectedCategory == ServiceCategoryType.Ride
                              ? CustomColors.primaryColor
                              : Colors.transparent,
                              strokeAlign: 2),
                          borderRadius:
                              const BorderRadius.all(Radius.circular(10))),
                      child: Padding(
                        padding: const EdgeInsets.all(0),
                        child: Center(
                            child: SvgPicture.asset(CustomImages.localIcon)),
                      ),
                    ),
                  ),
                  const SizedBox(
                    height: Dimensions.padding_10,
                  ),
                  Text(vm.translation.txt_local)
                ],
              ),
            ),
            InkWell(
              onTap: vm.onRentalSelected,
              child: Column(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: Dimensions.padding_20,
                        vertical: Dimensions.padding_18),
                    decoration: BoxDecoration(
                        color: vm.selectedCategory == ServiceCategoryType.Rental
                            ? CustomColors.selectedColor
                            : Colors.transparent,
                        border: Border.all(color: vm.selectedCategory == ServiceCategoryType.Rental
                            ? CustomColors.primaryColor
                            : Colors.transparent,
                            strokeAlign: 2),
                        borderRadius:
                            const BorderRadius.all(Radius.circular(10))),
                    child: Padding(
                      padding: const EdgeInsets.all(0),
                      child: Center(
                          child: SvgPicture.asset(CustomImages.rentalIcon)),
                    ),
                  ),
                  const SizedBox(
                    height: 5,
                  ),
                  Text(vm.translation.txt_rental)
                ],
              ),
            )
          ],
        ),
        const SizedBox(
          height: 20,
        ),
        vm.selectedCategory == ServiceCategoryType.Rental
            ? Padding(
                padding: const EdgeInsets.symmetric(
                    horizontal: Dimensions.padding_30),
                child: InkWell(
                  onTap: () {
                    if (!vm.isPickupChange) {
                      if(vm.rentalPackages.isNotEmpty) {
                        vm.rentalConfirm();
                      }
                    } else {
                      vm. showErrorDialog(message: "Selected place currently unavailable");
                    }
                  },
                  child: Container(
                    height: 54,
                    width: double.infinity,
                    decoration: BoxDecoration(
                      color: CustomColors.primaryColor,
                      borderRadius: BorderRadius.circular(Dimensions.padding_40),
                    ),
                    child: Row(
                      children: [
                        const Spacer(),
                        Padding(
                          padding:
                              const EdgeInsets.only(left: Dimensions.padding_40),
                          child: Text(
                              vm.selectedPackage?.hour != null
                                  ? "${vm.translation.txt_Confirm} ${"${vm.selectedPackage?.hour} hr"} ${vm.selectedPackage?.km} km"
                              : vm.translation.txt_no_data_found,
                              overflow: TextOverflow.ellipsis,
                              style:
                                  Theme.of(context).textTheme.bodyLarge?.copyWith(
                                        fontSize: 16,
                                        overflow: TextOverflow.ellipsis,
                                    color: Colors.white
                                      )),
                        ),
                        const Spacer(),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: Dimensions.padding_14,
                            vertical: Dimensions.padding_10,
                          ),
                          margin: const EdgeInsets.symmetric(
                            horizontal: Dimensions.padding_2,
                            vertical: Dimensions.padding_4,
                          ),
                          decoration: const BoxDecoration(
                            color: CustomColors.buttonTxtColor,
                            shape: BoxShape.circle,
                          ),
                          child:  const Icon(
                            Icons.arrow_forward_rounded,
                            color: CustomColors.primaryColor,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              )
            : const SizedBox()
      ],
    );
  }
}
