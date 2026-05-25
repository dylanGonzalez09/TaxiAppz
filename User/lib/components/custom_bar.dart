import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import '../ui/destination/destination_vm.dart';
import '../utils/custom_colors.dart';
import '../utils/custom_images.dart';

class CustomBar extends StatelessWidget {
  final Function()? menuTap;
  final Function()? endTap;
  final String title;
  final DestinationVm vm;

  const CustomBar(
      {super.key,
        required this.menuTap,
        this.endTap,
        required this.title,
        required this.vm});

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 56,
      width: double.infinity,
      decoration: const BoxDecoration(
        borderRadius: BorderRadius.only(
            bottomLeft: Radius.circular(15),
            bottomRight: Radius.circular(15)),
        color: Colors.white,
      ),
      child: Stack(
        fit: StackFit.loose,
        alignment: Alignment.center,
        children: [
          Positioned(
            left: 0,
            top: 0,
            bottom: 0,
            child: IconButton(
              icon: SvgPicture.asset(
                CustomImages.leftArrow,
                colorFilter: const ColorFilter.mode(
                    CustomColors.shadeBlack, BlendMode.srcIn),
              ),
              onPressed: menuTap,
            ),
          ),
          Text(
            title.toUpperCase(),
            style: const TextStyle(
              color: CustomColors.shadeBlack,
              fontSize: 20,
              fontWeight: FontWeight.bold,
            ),
          ),
          Positioned(
            right: 15,
            child: InkWell(
              onTap: () {
                vm.showRiderTypes((name, phoneNumber) {
                  vm.updateRiderName(name);
                  vm.updatePhoneNumber(phoneNumber);
                },
                    vm.riderName == "Myself" ? "" : vm.riderName, vm.phoneNumber == "phoneNumber" ? "" : vm.phoneNumber, vm.riderName == "Myself");
              },
              child: Container(
                width: 73,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(4),
                  color: CustomColors.shadeBlack,
                ),
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Expanded(
                      child: Text(
                        vm.riderName,
                        style: const TextStyle(color: Colors.white, fontSize: 12),
                      ),
                    ),
                    vm.riderName == "Myself" ?
                    const SizedBox(width: 5) : const SizedBox(width: 0,),
                    SvgPicture.asset(
                      CustomImages.dropDown,
                      width: 6,
                      height: 12,
                      colorFilter:
                      const ColorFilter.mode(Colors.white, BlendMode.srcIn),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}