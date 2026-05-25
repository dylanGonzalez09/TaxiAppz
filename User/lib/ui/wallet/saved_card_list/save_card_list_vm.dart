import 'package:flutter/material.dart';
import '../../../main.dart';
import '../../../utils/base_vm.dart';
import '../../about/aboutUs_screen.dart';
import '../../bottomsheets/add_card_bs/add_card_bs.dart';
import '../../bottomsheets/confirmation_bs/confirmation_bs.dart';

class SavedCardListVm extends BaseVm {
  void showAddCard() async {
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
          builder: (context) {
            return Padding(
              padding: EdgeInsets.only(
                bottom: MediaQuery.of(context).viewInsets.bottom,
              ),
              child: AddCardBs(),
            );
          });
    }
  }

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
            return ConfirmationBs(
              title: vm.translation.txt_delete_card,
              subTitle: vm.translation.txt_delete_card_desc,
              primaryBtnTitle: vm.translation.txt_yes, secondaryBtnTitle: vm.translation.txt_no,
            );
          });
    }
  }
}
