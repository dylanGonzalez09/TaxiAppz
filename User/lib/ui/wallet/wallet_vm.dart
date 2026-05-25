import 'package:flutter/material.dart';
import '../../network/response_models/rental_package_model.dart' as Utils;
import '../../network/response_models/wallet_detail_model.dart';
import '../../main.dart';
import '../../utils/app_constants.dart';
import '../../utils/app_url.dart';
import '../../utils/base_vm.dart';
import '../bottomsheets/payment_method_bs/payment_method_bs.dart';
import '../bottomsheets/wallet_recharge_bs/wallet_recharge_bs.dart';

class WalletVm extends BaseVm {
  WalletDetailModel? walletDetail;

  Future<void> getWalletDetails() async {
    showLoader();
    final response = await apiHelper.get(AppUrls.walletDetails);
    hideLoader();
    response.fold((e) {
      showErrorDialog(errorModel: e);
    }, (r) {
      walletDetail = parseData(r.data, WalletDetailModel.fromJson);
      debugPrint("walletDetails${walletDetail?.balance}");
      if (walletDetail != null) {
        AppConstants.userWalletBalance =
            Utils.convertToDouble(walletDetail?.balance);
        notifyListeners();
      } else {
        showErrorDialog(message: AppConstants.someThingWentWrong);
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
      if (response != null && response is String) {
        final res = await apiHelper.post(AppUrls.walletCreate,
            params: {AppConstants.amount: response});
        res.fold((e) => showErrorDialog(errorModel: e), (r) {
          final data = parseData(r.data, WalletDetailModel.fromJson);
          if (data?.balance?.isNotEmpty == true) {
            walletDetail?.balance = data?.balance;
            AppConstants.userWalletBalance =
                Utils.convertToDouble(walletDetail?.balance);
          }
          showSuccessDialog(message: r.message,buttonTxt: translation.txt_Ok);
          notifyListeners();
        });
      }
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
            return const PaymentMethodBs();
          });
    }
  }
}
