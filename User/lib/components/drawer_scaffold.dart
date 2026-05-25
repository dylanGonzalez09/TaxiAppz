import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../components/app_drawer.dart';

import '../utils/base_vm.dart';
import '../utils/utils.dart';

class DrawerScaffold extends StatelessWidget {
  final Widget body;
  final GlobalKey<ScaffoldState> scaffoldKey;
  final Widget? bottomSheet;
  final bool onBackPressedEnable;
  final BaseVm? vm;

  const DrawerScaffold(
      {super.key,
      required this.body,
      required this.scaffoldKey,
      this.bottomSheet,
      this.onBackPressedEnable = true,
      this.vm});

  @override
  Widget build(BuildContext context) {
    bool isExit = false;
    return PopScope(
      onPopInvokedWithResult: (didPop, result) {
        if (!didPop) {
          if (isExit == true) {
            SystemNavigator.pop();
          } else {
            Utils.showToast(vm?.translation.txt_press_again_to_exit ??
                "press again to exit");
            isExit = true;
          }
          Future.delayed(const Duration(seconds: 5), () {
            isExit = false;
          });
          debugPrint('PopScope Pop was blocked or not allowed.');
        }
      },
      canPop: onBackPressedEnable,
      child: SafeArea(
        child: Scaffold(
          key: scaffoldKey,
          drawer: AppDrawer(
            scaffoldKey: scaffoldKey,
          ),
          bottomSheet: bottomSheet,
          body: body,
        ),
      ),
    );
  }
}
