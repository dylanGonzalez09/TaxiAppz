import 'package:flutter/cupertino.dart';

import '../../base/base_vm.dart';

class WalletRechargeVm extends BaseVm {
  final TextEditingController rechargeAmountController =
      TextEditingController();
  int selectedIndex = -1;
  final List<String> amount = ['100', '200', '500', '1000'];

  void selectAmount(int index) {
    selectedIndex = index;
    rechargeAmountController.text = amount[index];
    notifyListeners();
  }

  void setCustomAmount(String customAmount) {
    selectedIndex = -1;
    rechargeAmountController.text = customAmount;
    notifyListeners();
  }

  String getSelectedAmount() {
    if (selectedIndex != -1) {
      return amount[selectedIndex];
    } else {
      return rechargeAmountController.text;
    }
  }
}
