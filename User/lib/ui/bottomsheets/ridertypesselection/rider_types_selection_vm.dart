import 'package:flutter/cupertino.dart';

import '../../../utils/base_vm.dart';

class RiderTypesSelectionVm extends BaseVm {
  TextEditingController userName = TextEditingController(),
      phoneNumber = TextEditingController(),countryCode = TextEditingController();
  bool isUserNameFocus = false, isPhoneNumberFocus = false, isMyself = false;
  bool get shouldShowFields => !isMyself;

  String? tempUserName;
  String? tempPhoneNumber;

  void setInitialSelection(bool initialSelection) {
    isMyself = initialSelection;
    notifyListeners();
  }

  void toggleMyself() {
    if (isMyself) {
      // Switching from "Myself" to "Others"
      userName.text = tempUserName ?? '';
      phoneNumber.text = tempPhoneNumber ?? '';
    } else {
      // Switching from "Others" to "Myself"
      tempUserName = userName.text;
      tempPhoneNumber = phoneNumber.text;
      userName.clear();
      phoneNumber.clear();
    }
    isMyself = !isMyself;
    notifyListeners();
  }
}