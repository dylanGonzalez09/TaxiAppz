import 'package:flutter/material.dart';
import '../../../base/base_vm.dart';
import '../../../bottom_sheets/confirmation_bs/confirmation_bs.dart';
import '../../../main.dart';

class ScheduledDetailVm extends BaseVm{

  bool isAssigned = false;

  void showConfirmation() async {
    if (navigatorKey.currentState != null) {
      final response = await showModalBottomSheet(
          context: navigatorKey.currentState!.context,
          backgroundColor: Colors.white,
          isDismissible: true,
          isScrollControlled: true,
          enableDrag: false,
          shape: const RoundedRectangleBorder(
              borderRadius: BorderRadius.only(
                  topLeft: Radius.circular(20), topRight: Radius.circular(20))),
          builder: (_) {
            return ConfirmationBs(title: "Cancel Ride",
              subTitle: 'Are you want to Cancel this ride?',
              primaryBtnTitle: 'Yes',
              secondaryBtnTitle: 'No',);
          });
    }
  }

  void changeButtonView(){
    isAssigned = true;
    notifyListeners();
  }
}