import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:user/ui/splash/splash_vm.dart';

import '../../utils/app_constants.dart';
import '../../utils/custom_colors.dart';
import '../../utils/custom_images.dart';
import '../../utils/dimensions.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  final vm = SplashVm();
  late  AppLifecycleListener _listener;

  @override
  void initState() {
    super.initState();
    _listener = AppLifecycleListener(onStateChange: vm.onLifeCycleChanged);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      AppConstants.appName = vm.packageInfo.appName;
      vm.getConfig();
      vm.getFcmToken();
    });
  }


  @override
  void dispose() {
    _listener.dispose();
    super.dispose();
  }


  @override
  Widget build(BuildContext context) {
    return Scaffold(
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
                      child: SvgPicture.asset(
                        CustomImages.logoSplash,
                        height: MediaQuery.sizeOf(context).height * 0.12,
                        width: MediaQuery.sizeOf(context).width * 0.04,
                      ))),
              Positioned(
                  bottom: 0,
                  left: 0,
                  right: 0,
                  child: Column(
                    children: [
                      const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(
                            color: CustomColors.primaryColor),
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
          )
        //     Center(
        //   child: SvgPicture.asset(
        //     CustomImages.logo,
        //     height: MediaQuery.sizeOf(context).height * 0.12,
        //     width: MediaQuery.sizeOf(context).width * 0.04,
        //   ),
        // )
      ),
    );
  }
}


