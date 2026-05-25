import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:taxiappzpro/components/app_drawer.dart';
import 'package:taxiappzpro/utils/utils.dart';

import '../base/base_vm.dart';

class DrawerScaffold extends StatelessWidget {
  final Widget body;
  final Widget? bottomSheet;
  final GlobalKey<ScaffoldState> scaffoldKey;
  final bool onBackPressedEnable;
  final BaseVm? vm;
  final bool resize;

  const DrawerScaffold(
      {super.key,
      required this.body,
        this.resize = true,
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
                "");
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
            resizeToAvoidBottomInset: resize,
        key: scaffoldKey,
        bottomSheet: bottomSheet,
        drawer: AppDrawer(
          scaffoldKey: scaffoldKey,
        ),
        body: body,
      )),
    );
  }
}
