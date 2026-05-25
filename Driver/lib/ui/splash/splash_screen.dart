import 'package:taxiappzpro/ui/splash/splash_vm.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:package_info_plus/package_info_plus.dart';
import '../../di/di_config.dart';
import '../../utils/custom_images.dart';
import '../../utils/dimensions.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  final vm = getIt<SplashVm>();
  final packageInfo = getIt<PackageInfo>();

  @override
  void initState() {
    super.initState();
    Future.delayed(Duration.zero, () {
      vm.getConfig();
      vm.getFcmToken();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
          child: Stack(
            children: [
              Positioned(
                  top: 0,
                  bottom: 0,
                  left: 0,
                  right: 0,
                  child: Padding(
                      padding: const EdgeInsets.symmetric(
                          horizontal: Dimensions.padding_60),
                      child: SvgPicture.asset(CustomImages.logoSvg))),
              Positioned(
                  bottom: 0,
                  left: 0,
                  right: 0,
                  child: Column(
                    children: [
                      const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(),
                      ),
                      const SizedBox(height: Dimensions.padding_15),
                      Text(
                        vm.packageInfo.version,
                        style: Theme.of(context).textTheme.bodyLarge,
                      ),
                      const SizedBox(height: Dimensions.padding_10)
                    ],
                  ))
            ],
          )),
    );
  }
}
