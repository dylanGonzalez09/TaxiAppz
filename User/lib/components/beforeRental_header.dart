import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import '../main.dart';
import '../ui/map/map_vm.dart';
import '../utils/custom_images.dart';

class BeforeRentalHeader extends StatelessWidget {
  final Function()? onBackPressed;
  final GlobalKey<ScaffoldState> scaffoldKey;
  final MapVm vm;

  const BeforeRentalHeader({super.key, this.onBackPressed, required this.scaffoldKey, required this.vm});

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 56,
      width: double.infinity,
      decoration: BoxDecoration(
          borderRadius: const BorderRadius.only(
              bottomLeft: Radius.circular(12),
              bottomRight: Radius.circular(12)),
          color: Colors.white,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.1),
              blurRadius: 4,
              spreadRadius: 0,
              offset: const Offset(0, 2),
            ),
          ]
      ),
      child: SizedBox(
      height: 60,
      child: Stack(
        children: [
          Positioned(
            left: 0,
            top: 0,
            bottom: 0,
            child: Padding(
              padding: const EdgeInsets.only(left: 15),
              child: InkWell(
                  onTap: onBackPressed ??
                          () {
                        if (navigatorKey.currentState != null) {
                          vm.onConfirmPickupLocation();
                        }
                      },
                  child: const Icon(
                    Icons.arrow_back_ios_rounded,
                    size: 24,
                  )),
            ),
          ),
          Padding(
            padding: const EdgeInsets.only(right: 7),
            child: Center(
              child: SvgPicture.asset(
                CustomImages.logo,
                width: 85,
                height: 30,
              ),
            ),
          ),
        ],
      ),
              ),
    );
  }
}
