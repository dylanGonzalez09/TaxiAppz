import 'package:taxiappzpro/utils/preference_helper.dart';
import 'package:flutter/material.dart';
import '../../base/base_vm.dart';
import '../../bottom_sheets/payment_method_bs/payment_method_bs.dart';
import '../../bottom_sheets/wallet_recharge_bs/wallet_recharge_bs.dart';
import '../../main.dart';
import '../../network/response_models/wallet_model.dart';
import '../../utils/app_constants.dart';
import '../../utils/app_urls.dart';

class WalletVm extends BaseVm {
  WalletDetailModel? walletDetail;
  bool isCompanyDriver = false;

  Future<void> getWalletDetails() async {
    showLoader();
    String url = AppUrls.getWalletDetail;
    final response = await apiHelper.get(url);
    hideLoader();
    response.fold((e) {
      showErrorDialog(errorModel: e);
    }, (r) {
      walletDetail = parseData(r.data, WalletDetailModel.fromJson);
      debugPrint("walletDetails${walletDetail?.balance}");
      if (walletDetail != null) {
        notifyListeners();
      } else {
        //showErrorDialog(message: AppConstants.someThingWentWrong);
      }
    });
    notifyListeners();
  }

  void showRecharge() async {
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
            child: WalletRechargeBs(currency: walletDetail?.currency ?? ""),
          );
        },
      );
      showLoader();
      if (response != null && response is String) {
        final res = await apiHelper.post(AppUrls.walletCreate,
            params: {AppConstants.amount: response});
        res.fold((e) => showErrorDialog(errorModel: e), (r) {
          final data = parseData(r.data, WalletDetailModel.fromJson);
          showSuccessDialog(buttonTxt: translation.txt_Ok,message: r.message);
          if (data?.balance?.isNotEmpty == true) {
            walletDetail?.balance = "${data?.balance}";
          }
          notifyListeners();
        });
      }
      hideLoader();
    }
  }

  void showPaymentMethod() async {
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
            return PaymentMethodBs(
              translation: translation,
            );
          });
    }
  }
}
