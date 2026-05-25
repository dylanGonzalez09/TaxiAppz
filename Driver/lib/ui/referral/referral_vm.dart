import 'dart:convert';

import '../../base/base_vm.dart';
import '../../network/response_models/referral_model.dart';
import '../../utils/app_constants.dart';
import '../../utils/app_urls.dart';

class ReferralVm extends BaseVm {
  ReferralModel? referralDetail;
  bool isClaimAmount = true;

  Future<void> getReferralCodeDetails() async {
    showLoader();
    final response = await apiHelper.get(AppUrls.getReferralCode);
    hideLoader();
    response.fold((e) {
      showErrorDialog(errorModel: e);
    }, (r) {
      referralDetail = parseData(r.data, ReferralModel.fromJson);
      if (referralDetail != null) {
        if (referralDetail?.currencySymbol == null ||
            referralDetail?.currencySymbol?.isEmpty == true) {
          referralDetail?.currencySymbol = AppConstants.appCurrencySymbol;
        }
        isClaimAmount = referralDetail?.referralAmount != null
            ? referralDetail!.referralAmount! > 0
            : false;
        notifyListeners();
      } else {
        showErrorDialog(message: AppConstants.someThingWentWrong);
      }
    });
  }

  Future<void> claimReferral() async {
    final response = await apiHelper.get(AppUrls.referralClaim);
    response.fold((e) => showErrorDialog(errorModel: e), (r) {
      getReferralCodeDetails();
    });
    isLoading.value = false;
    notifyListeners();
  }
}
