import 'package:flutter/material.dart';
import 'package:taxiappzpro/base/base_vm.dart';

import '../../../bottom_sheets/add_card_bs/add_card_bs.dart';
import '../../../bottom_sheets/confirmation_bs/confirmation_bs.dart';
import '../../../main.dart';

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
              title: "Delete Card",
              subTitle: 'Are you sure want to delete this card?',
              primaryBtnTitle: 'Yes',
              secondaryBtnTitle: 'No',);
          });
    }
  }
}
