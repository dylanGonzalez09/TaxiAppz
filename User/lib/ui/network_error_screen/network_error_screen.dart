import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import '../../utils/dimensions.dart';
import '../../utils/custom_colors.dart';
import '../../utils/custom_images.dart';
import '../about/aboutUs_screen.dart';

class NoInternetScreen extends StatelessWidget {
  const NoInternetScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      child: Scaffold(
        body: SafeArea(
          child: Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: SvgPicture.asset(
                    CustomImages.noInternetImage,
                  ),
                ),
                const SizedBox(height: 60),
                Text(
                  vm.translation.txt_no_internet,
                  style: const TextStyle(
                    color: CustomColors.primaryColor,
                    fontWeight: FontWeight.w800,
                    fontSize: 18,
                  ),
                ),
                const SizedBox(height: 20),
                Padding(
                  padding: const EdgeInsets.symmetric(
                      horizontal: Dimensions.padding_20),
                  child: Text(
                    overflow: TextOverflow.clip,
                    vm.translation.txt_no_internet_desc,
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      color: Colors.black,
                      fontWeight: FontWeight.w400,
                      fontSize: 14,
                    ),
                  ),
                ),
                const SizedBox(height: 50),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
